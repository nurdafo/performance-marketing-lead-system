# Приём заявок из квиза

Cloudflare Worker принимает завершённый квиз, записывает строку в Google Sheets и отправляет уведомление в Telegram. Успешный ответ возвращается только после подтверждения от обоих сервисов.

## 1. Подготовьте Google Sheets

1. Создайте таблицу и скопируйте её ID из адреса между `/d/` и `/edit`.
2. Откройте **Расширения → Apps Script**.
3. Вставьте содержимое `google-apps-script/Code.gs`.
4. В **Настройки проекта → Свойства скрипта** добавьте:
   - `SPREADSHEET_ID` — ID таблицы;
   - `SHEET_NAME` — например `Заявки`;
   - `WEBHOOK_SECRET` — случайная длинная строка (минимум 32 символа).
5. Нажмите **Развернуть → Новое развертывание → Веб-приложение**. Выполнять от вашего имени, доступ — «Все».
6. Скопируйте URL, который заканчивается на `/exec`.

Скрипт сам создаст лист и заголовки при первой заявке. Повторная отправка с тем же `leadId` не создаёт вторую строку.

## 2. Подготовьте Telegram

1. Создайте бота через `@BotFather` и получите токен.
2. Добавьте бота в нужный чат и отправьте в чат любое сообщение.
3. Узнайте `chat_id` через метод `getUpdates` Telegram Bot API.

## 3. Добавьте секреты и разверните Worker

Создайте игнорируемый Git-файл `lead-worker/.env.production`:

```dotenv
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/ВАШ_ID/exec"
GOOGLE_SHEETS_WEBHOOK_SECRET="ТОТ_ЖЕ_СЕКРЕТ_ИЗ_APPS_SCRIPT"
TELEGRAM_BOT_TOKEN="ТОКЕН_БОТА"
TELEGRAM_CHAT_ID="ID_ЧАТА"
```

Проверка и развертывание:

```powershell
npx wrangler types lead-worker/worker-configuration.d.ts --config lead-worker/wrangler.jsonc
npx tsc --project lead-worker/tsconfig.json
npx wrangler deploy --config lead-worker/wrangler.jsonc --dry-run
npx wrangler deploy --config lead-worker/wrangler.jsonc --secrets-file lead-worker/.env.production
```

Фронтенд уже настроен на адрес `https://quiz-lead-handler.jumanur62.workers.dev`.

Секреты не нужно добавлять в исходный код или `wrangler.jsonc`. Cloudflare хранит их как зашифрованные bindings.
