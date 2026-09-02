const ALLOWED_ORIGINS = new Set([
  "https://zarema-performance.jumanur62.chatgpt.site",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_RESPONSE_BYTES = 32 * 1024;
const GOOGLE_SHEETS_TIMEOUT_MS = 15_000;
const TELEGRAM_TIMEOUT_MS = 15_000;

type QuizAnswer = {
  questionId: string;
  answerId: string;
  question: string;
  answer: string;
};

type Lead = {
  leadId: string;
  name: string;
  phone: string;
  answers: QuizAnswer[];
  locale: string;
  createdAt: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};

class PayloadTooLargeError extends Error {}

class ExternalServiceError extends Error {
  constructor(
    readonly service: "google_sheets" | "telegram",
    readonly status: number,
    readonly externalCode: string,
    message: string,
  ) {
    super(message);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const isAllowedOrigin = origin !== null && ALLOWED_ORIGINS.has(origin);
    const corsHeaders = createCorsHeaders(isAllowedOrigin ? origin : null);

    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin) {
        return jsonResponse({ success: false, message: "Этот источник не разрешён" }, 403, corsHeaders);
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ success: false, message: "Разрешён только POST-запрос" }, 405, corsHeaders);
    }

    if (!isAllowedOrigin) {
      return jsonResponse({ success: false, message: "Запрос отправлен с неизвестного сайта" }, 403, corsHeaders);
    }

    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse({ success: false, message: "Ожидается JSON" }, 415, corsHeaders);
    }

    try {
      const lead = normalizeLead(await readJson(request, MAX_REQUEST_BYTES));
      if (!isValidLeadId(lead.leadId)) {
        return jsonResponse({ success: false, message: "Некорректный идентификатор заявки" }, 400, corsHeaders);
      }
      if (!lead.name) {
        return jsonResponse({ success: false, message: "Не указано имя" }, 400, corsHeaders);
      }
      if (!lead.phone) {
        return jsonResponse({ success: false, message: "Некорректный номер телефона" }, 400, corsHeaders);
      }

      const answersText = formatAnswers(lead.answers);
      const deliveries = await Promise.allSettled([
        appendLeadToGoogleSheets(env, lead, answersText),
        sendTelegramNotification(env, lead, answersText),
      ]);
      const failedDeliveries = deliveries.filter(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      if (failedDeliveries.length > 0) {
        for (const failure of failedDeliveries) {
          logDeliveryFailure(failure.reason, lead.leadId);
        }
        const timedOut = failedDeliveries.some((failure) => isTimeoutError(failure.reason));
        return jsonResponse(
          {
            success: false,
            message: timedOut
              ? "Сервис временно не отвечает. Попробуйте ещё раз"
              : "Не удалось сохранить заявку. Попробуйте ещё раз",
          },
          timedOut ? 504 : 502,
          corsHeaders,
        );
      }

      console.log(JSON.stringify({ event: "lead_delivered", leadId: lead.leadId }));
      return jsonResponse(
        { success: true, message: "Заявка записана в Google Sheets и отправлена в Telegram" },
        200,
        corsHeaders,
      );
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return jsonResponse({ success: false, message: "Слишком большой запрос" }, 413, corsHeaders);
      }

      const isTimeout = isTimeoutError(error);
      const service = error instanceof ExternalServiceError ? error.service : "worker";
      const status = error instanceof ExternalServiceError ? error.status : 0;
      const externalCode = error instanceof ExternalServiceError ? error.externalCode : "unknown";
      console.error(JSON.stringify({
        event: isTimeout ? "external_service_timeout" : "lead_delivery_failed",
        service,
        status,
        externalCode,
        error: error instanceof Error ? error.message : String(error),
      }));

      return jsonResponse(
        {
          success: false,
          message: isTimeout
            ? "Сервис временно не отвечает. Попробуйте ещё раз"
            : "Не удалось сохранить заявку. Попробуйте ещё раз",
        },
        isTimeout ? 504 : 502,
        corsHeaders,
      );
    }
  },
} satisfies ExportedHandler<Env>;

async function appendLeadToGoogleSheets(env: Env, lead: Lead, answersText: string): Promise<void> {
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      webhookSecret: env.GOOGLE_SHEETS_WEBHOOK_SECRET,
      source: "landing_quiz",
      leadId: lead.leadId,
      name: lead.name,
      phone: lead.phone,
      locale: lead.locale,
      createdAt: lead.createdAt,
      answers: lead.answers,
      answersText,
      utm: {
        source: lead.utmSource,
        medium: lead.utmMedium,
        campaign: lead.utmCampaign,
        content: lead.utmContent,
        term: lead.utmTerm,
      },
    }),
    redirect: "follow",
    signal: AbortSignal.timeout(GOOGLE_SHEETS_TIMEOUT_MS),
  });

  const body = await readResponseJson(response);
  if (!response.ok || !isRecord(body) || body.success !== true) {
    const externalCode = isRecord(body)
      ? cleanText(body.error ?? body.status ?? "rejected", 100)
      : "invalid_response";
    throw new ExternalServiceError(
      "google_sheets",
      response.status,
      externalCode,
      `Google Sheets webhook rejected the lead with HTTP ${response.status}`,
    );
  }

  console.log(JSON.stringify({ event: "google_sheets_appended", leadId: lead.leadId }));
}

async function sendTelegramNotification(env: Env, lead: Lead, answersText: string): Promise<void> {
  const utmLines = [
    ["utm_source", lead.utmSource],
    ["utm_medium", lead.utmMedium],
    ["utm_campaign", lead.utmCampaign],
    ["utm_content", lead.utmContent],
    ["utm_term", lead.utmTerm],
  ]
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);

  const message = truncateUnicode([
    "Новая заявка с сайта",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Язык: ${lead.locale || "не указан"}`,
    `Дата: ${lead.createdAt}`,
    "",
    "Ответы квиза:",
    answersText,
    ...(utmLines.length ? ["", "UTM-метки:", ...utmLines] : []),
  ].join("\n"), 4_000);

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
  });

  const body = await readResponseJson(response);
  if (!response.ok || !isRecord(body) || body.ok !== true) {
    const externalCode = isRecord(body)
      ? cleanText(body.description ?? body.error_code ?? "rejected", 200)
      : "invalid_response";
    throw new ExternalServiceError(
      "telegram",
      response.status,
      externalCode,
      `Telegram rejected the message with HTTP ${response.status}`,
    );
  }

  console.log(JSON.stringify({ event: "telegram_notification_sent", leadId: lead.leadId }));
}

function normalizeLead(value: unknown): Lead {
  const data = isRecord(value) ? value : {};
  const answers = Array.isArray(data.answers)
    ? data.answers.slice(0, 30).map(normalizeAnswer)
    : [];
  const createdAt = cleanText(data.createdAt, 100);

  return {
    leadId: cleanText(data.leadId, 100),
    name: cleanText(data.name, 150),
    phone: normalizePhone(data.phone),
    answers,
    locale: cleanText(data.locale, 20),
    createdAt: createdAt && !Number.isNaN(Date.parse(createdAt)) ? createdAt : new Date().toISOString(),
    utmSource: cleanText(data.utmSource, 300),
    utmMedium: cleanText(data.utmMedium, 300),
    utmCampaign: cleanText(data.utmCampaign, 300),
    utmContent: cleanText(data.utmContent, 300),
    utmTerm: cleanText(data.utmTerm, 300),
  };
}

function normalizeAnswer(value: unknown): QuizAnswer {
  const item = isRecord(value) ? value : {};
  return {
    questionId: cleanText(item.questionId, 150),
    answerId: cleanText(item.answerId, 150),
    question: cleanText(item.question, 500),
    answer: cleanText(item.answer, 1_000),
  };
}

function formatAnswers(answers: QuizAnswer[]): string {
  if (answers.length === 0) return "Ответы квиза не переданы";
  return answers
    .map((item, index) => `${index + 1}. ${item.question || `Вопрос ${index + 1}`}: ${item.answer || "Не указано"}`)
    .join("\n");
}

function normalizePhone(value: unknown): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length < 11 || digits.length > 15) return "";
  return `+${digits}`;
}

function isValidLeadId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function truncateUnicode(value: string, maxCharacters: number): string {
  const characters = Array.from(value);
  return characters.length <= maxCharacters
    ? value
    : `${characters.slice(0, maxCharacters - 1).join("")}…`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError"
    || error.name === "TimeoutError"
    || /abort|timed?\s*out|timeout/i.test(error.message);
}

function logDeliveryFailure(error: unknown, leadId: string): void {
  const isTimeout = isTimeoutError(error);
  console.error(JSON.stringify({
    event: isTimeout ? "external_service_timeout" : "lead_delivery_failed",
    leadId,
    service: error instanceof ExternalServiceError ? error.service : "worker",
    status: error instanceof ExternalServiceError ? error.status : 0,
    externalCode: error instanceof ExternalServiceError ? error.externalCode : "unknown",
    error: error instanceof Error ? error.message : String(error),
  }));
}

async function readJson(request: Request, limit: number): Promise<unknown> {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > limit) throw new PayloadTooLargeError();
  const text = await readLimitedText(request.body, limit);
  if (!text) throw new SyntaxError("Пустое тело запроса");
  return JSON.parse(text) as unknown;
}

async function readResponseJson(response: Response): Promise<unknown> {
  let text: string;
  try {
    text = await readLimitedText(response.body, MAX_RESPONSE_BYTES);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      throw new Error("External service response exceeded the size limit");
    }
    throw error;
  }
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function readLimitedText(
  stream: ReadableStream<Uint8Array> | null,
  limit: number,
): Promise<string> {
  if (!stream) return "";

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

function createCorsHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  });
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function jsonResponse(body: unknown, status: number, headers: Headers): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
