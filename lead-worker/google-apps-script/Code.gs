const HEADERS = [
  "Получено",
  "ID заявки",
  "Статус",
  "Имя",
  "Телефон",
  "Язык",
  "Дата заявки",
  "Ответы квиза",
  "UTM source",
  "UTM medium",
  "UTM campaign",
  "UTM content",
  "UTM term",
  "Источник",
];

const LEAD_STATUSES = [
  "Новая заявка",
  "Связались",
  "Квалифицирован",
  "Назначена встреча",
  "Договор",
  "Успешно",
  "Отказ",
];

function doGet() {
  return jsonResponse_({
    success: true,
    service: "quiz-lead-google-sheets",
    version: "2026-08-04-03",
  });
}

function testSpreadsheetSetup() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const sheetName = properties.getProperty("SHEET_NAME") || "Заявки";
  const webhookSecret = properties.getProperty("WEBHOOK_SECRET");

  if (!spreadsheetId) {
    throw new Error("Не задано свойство SPREADSHEET_ID");
  }
  if (!webhookSecret) {
    throw new Error("Не задано свойство WEBHOOK_SECRET");
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(
      'В таблице "' + spreadsheet.getName() + '" не найдена вкладка "' + sheetName + '"'
    );
  }

  ensureHeaders_(sheet);
  const testLeadId = Utilities.getUuid();
  if (hasLead_(sheet, testLeadId)) {
    throw new Error("Диагностический ID неожиданно уже существует");
  }
  sheet.appendRow([
    new Date(),
    testLeadId,
    "Новая заявка",
    "TEST MANUAL GOOGLE SHEETS",
    "+77000000000",
    "ru",
    new Date().toISOString(),
    "Ручная проверка записи из Apps Script",
    "apps_script_test",
    "manual",
    "diagnostic",
    "",
    "",
    "manual_setup_test",
  ]);
  SpreadsheetApp.flush();
  console.log(
    'Подключение и подготовка листа успешны: таблица "' + spreadsheet.getName()
      + '", вкладка "' + sheet.getName() + '", ID тестовой строки "' + testLeadId + '"'
  );
}

function doPost(event) {
  let authenticated = false;
  let stage = "read_properties";
  try {
    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    const sheetName = properties.getProperty("SHEET_NAME") || "Заявки";
    const expectedSecret = properties.getProperty("WEBHOOK_SECRET");

    if (!expectedSecret) {
      throw new Error("Не задано свойство WEBHOOK_SECRET");
    }

    stage = "parse_payload";
    const payload = JSON.parse(event.postData.contents || "{}");
    stage = "authenticate";
    if (!secureEquals_(String(payload.webhookSecret || ""), expectedSecret)) {
      return jsonResponse_({ success: false, error: "unauthorized" });
    }
    authenticated = true;

    stage = "validate_spreadsheet_config";
    if (!spreadsheetId) {
      throw new Error("Не задано свойство SPREADSHEET_ID");
    }

    stage = "validate_lead";
    const leadId = cleanText_(payload.leadId, 100);
    if (!leadId) {
      return jsonResponse_({ success: false, error: "missing_lead_id" });
    }

    stage = "acquire_lock";
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return jsonResponse_({ success: false, error: "busy" });
    }

    try {
      stage = "open_spreadsheet";
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
      stage = "prepare_sheet";
      ensureWritableSheet_(sheet);

      stage = "check_duplicate";
      if (hasLead_(sheet, leadId)) {
        return jsonResponse_({ success: true, duplicate: true });
      }

      const utm = payload.utm && typeof payload.utm === "object" ? payload.utm : {};
      stage = "append_row";
      sheet.appendRow([
        new Date(),
        safeCell_(leadId),
        "Новая заявка",
        safeCell_(cleanText_(payload.name, 150)),
        safeCell_(cleanText_(payload.phone, 30)),
        safeCell_(cleanText_(payload.locale, 20)),
        safeCell_(cleanText_(payload.createdAt, 100)),
        safeCell_(cleanText_(payload.answersText, 10000)),
        safeCell_(cleanText_(utm.source, 300)),
        safeCell_(cleanText_(utm.medium, 300)),
        safeCell_(cleanText_(utm.campaign, 300)),
        safeCell_(cleanText_(utm.content, 300)),
        safeCell_(cleanText_(utm.term, 300)),
        safeCell_(cleanText_(payload.source, 100)),
      ]);
      SpreadsheetApp.flush();
      return jsonResponse_({ success: true, duplicate: false });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    const response = { success: false, error: "request_failed" };
    response.stage = stage;
    if (authenticated) {
      response.detail = cleanText_(error && error.message ? error.message : error, 500);
    }
    return jsonResponse_(response);
  }
}

function ensureWritableSheet_(sheet) {
  const missingColumns = HEADERS.length - sheet.getMaxColumns();
  if (missingColumns > 0) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), missingColumns);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    migrateLegacyHeaders_(sheet);
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground("#184555")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  }
  if (sheet.getBandings().length === 0) {
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  }

  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1)
    .setNumberFormat("dd.MM.yyyy HH:mm");
  sheet.getRange(2, 3, sheet.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(LEAD_STATUSES, true)
      .setAllowInvalid(false)
      .build()
  );
  sheet.setColumnWidth(1, 145);
  sheet.setColumnWidth(2, 265);
  sheet.setColumnWidth(3, 165);
  sheet.setColumnWidth(4, 170);
  sheet.setColumnWidth(5, 145);
  sheet.setColumnWidth(6, 80);
  sheet.setColumnWidth(7, 190);
  sheet.setColumnWidth(8, 520);
  for (let column = 9; column <= HEADERS.length; column += 1) {
    sheet.setColumnWidth(column, 160);
  }
  sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1).setWrap(true);
}

function migrateLegacyHeaders_(sheet) {
  const firstTwoHeaders = sheet.getRange(1, 1, 1, 2).getDisplayValues()[0];
  const thirdHeader = sheet.getRange(1, 3).getDisplayValue();
  const isLegacySchema = firstTwoHeaders[0] === "received_at"
    && firstTwoHeaders[1] === "lead_id";
  const isCurrentSchema = firstTwoHeaders[0] === HEADERS[0]
    && firstTwoHeaders[1] === HEADERS[1];

  if (!isLegacySchema && !isCurrentSchema) {
    throw new Error("Неожиданная структура листа: проверьте строку заголовков");
  }

  if (isLegacySchema && thirdHeader !== HEADERS[2]) {
    sheet.insertColumnAfter(2);
    const existingLeadCount = sheet.getLastRow() - 1;
    if (existingLeadCount > 0) {
      sheet.getRange(2, 3, existingLeadCount, 1).setValues(
        Array.from({ length: existingLeadCount }, () => ["Новая заявка"])
      );
    }
  }
}

function hasLead_(sheet, leadId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  return sheet
    .getRange(2, 2, lastRow - 1, 1)
    .createTextFinder(leadId)
    .matchEntireCell(true)
    .findNext() !== null;
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function secureEquals_(provided, expected) {
  const providedHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, provided);
  const expectedHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, expected);
  let difference = 0;
  for (let index = 0; index < providedHash.length; index += 1) {
    difference |= providedHash[index] ^ expectedHash[index];
  }
  return difference === 0;
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
