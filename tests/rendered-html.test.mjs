import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" }, redirect: "manual" }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("redirects the root route to Russian", async () => {
  const response = await render("/");
  assert.ok([301, 302, 307, 308].includes(response.status));
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/ru");
});

test("server-renders the Russian route and localized metadata", async () => {
  const response = await render("/ru");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Не просто запускаю рекламу/);
  assert.match(html, /Как заявки попадают из рекламы в CRM/);
  assert.equal((html.match(/Спам рассылки не будет!/g) ?? []).length, 2);
  assert.equal((html.match(/Я сама лично свяжусь с вами\./g) ?? []).length, 2);
  assert.doesNotMatch(html, /На разборе определим/);
  assert.doesNotMatch(html, /Частые вопросы|href="#faq"/);
  assert.match(html, /<link rel="canonical" href="http:\/\/localhost:3000\/ru"\/>/);
  assert.match(html, /hrefLang="kk"|hreflang="kk"/i);
  assert.match(html, /hrefLang="en"|hreflang="en"/i);
  assert.match(html, /<main lang="ru">/);
  assert.doesNotMatch(html, /href="#system">Обо мне/);
  assert.doesNotMatch(html, />Записаться<\/button>/);
  assert.match(html, /href="https:\/\/wa\.me\/77718043549"/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/target_ads\.kz\/"/);
  assert.match(html, /href="https:\/\/t\.me\/Target_up88"/);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.match(html, /aria-label="Написать в WhatsApp"/);
  assert.match(html, /aria-label="Открыть Instagram"/);
  assert.match(html, /aria-label="Написать в Telegram"/);
  assert.match(html, /href="tel:\+77718043549"/);
});

test("server-renders the Kazakh route and localized metadata", async () => {
  const response = await render("/kz");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Жай ғана жарнама іске қоспаймын/);
  assert.match(html, /Өтінімдер жарнамадан CRM мен аналитикаға қалай түседі/);
  assert.equal((html.match(/Спам-хабарламалар жіберілмейді!/g) ?? []).length, 2);
  assert.equal((html.match(/Сізбен өзім жеке хабарласамын\./g) ?? []).length, 2);
  assert.doesNotMatch(html, /Талдау барысында бизнесіңізге/);
  assert.doesNotMatch(html, /Жиі қойылатын сұрақтар|href="#faq"/);
  assert.match(html, /<main lang="kk">/);
  assert.doesNotMatch(html, /Почему ваша текущая реклама/);
  assert.doesNotMatch(html, /href="#system">Мен туралы/);
  assert.doesNotMatch(html, />Жазылу<\/button>/);
  assert.match(html, /href="https:\/\/wa\.me\/77718043549"/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/target_ads\.kz\/"/);
  assert.match(html, /href="https:\/\/t\.me\/Target_up88"/);
  assert.match(html, /aria-label="WhatsApp арқылы жазу"/);
  assert.match(html, /aria-label="Instagram парақшасын ашу"/);
  assert.match(html, /aria-label="Telegram арқылы жазу"/);
});

test("contact links send channel-specific Meta Lead events", async () => {
  const [landingPage, metaPixel] = await Promise.all([
    readFile(new URL("../app/LandingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MetaPixel.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of ["whatsapp", "telegram", "instagram"]) {
    assert.match(landingPage, new RegExp(`trackMetaLead\\(\\"${source}\\"\\)`));
  }

  assert.match(metaPixel, /fbq\?\.\("track", "Lead", \{/);
  assert.match(metaPixel, /content_name: source/);
});

test("server-renders the English route and localized metadata", async () => {
  const response = await render("/en");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /I don&#x27;t just launch ads|I don't just launch ads/);
  assert.match(html, /How leads move from advertising to your CRM and analytics/);
  assert.equal((html.match(/No spam messages!/g) ?? []).length, 2);
  assert.equal((html.match(/I will contact you personally\./g) ?? []).length, 2);
  assert.match(html, /<link rel="canonical" href="http:\/\/localhost:3000\/en"\/>/);
  assert.match(html, /hrefLang="ru"|hreflang="ru"/i);
  assert.match(html, /hrefLang="kk"|hreflang="kk"/i);
  assert.match(html, /<main lang="en">/);
  assert.match(html, /aria-label="Message me on WhatsApp"/);
  assert.match(html, /aria-label="Open Instagram"/);
  assert.match(html, /aria-label="Message me on Telegram"/);
});

test("returns not found for unsupported locales", async () => {
  const response = await render("/de");
  assert.equal(response.status, 404);
});

test("ships local media and language-safe quiz behavior", async () => {
  const names = ["zarema.png", "logo.png", "ads.png", "landing.png", "crm.png", "analytics.png", "pain.png", "handshake.png", "social-instagram.avif", "social-whatsapp.avif", "social-telegram.png"];
  await Promise.all(names.map((name) => access(new URL(`../public/images/${name}`, import.meta.url))));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../public/privacy-policy.pdf", import.meta.url));

  const [page, dictionary, styles] = await Promise.all([
    readFile(new URL("../app/LandingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /questionId/);
  assert.match(page, /answerId/);
  assert.match(page, /sessionStorage\.setItem\(DRAFT_KEY/);
  assert.match(page, /aria-controls="mobile-menu"/);
  assert.equal((page.match(/<LanguageSwitch locale=\{locale\}/g) ?? []).length, 1);
  assert.match(page, /className="navLanguage"><LanguageSwitch/);
  assert.match(page, /locales\.map\(\(code\)/);
  assert.match(page, /en: "EN"/);
  assert.doesNotMatch(page, /mobileLanguageSwitch|<LanguageSwitch[^>]* mobile/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /loading="lazy"/);
  assert.equal((page.match(/onClick=\{openQuiz\}/g) ?? []).length, 2);
  assert.match(page, /onClick=\{openQuiz\}>\{t\.hero\.cta\}/);
  assert.match(page, /onClick=\{openQuiz\}>\{t\.offer\.cta\}/);
  assert.equal((page.match(/<CtaNotice notice=\{t\.ctaNotice\} \/>/g) ?? []).length, 2);
  assert.doesNotMatch(page, /href="#faq"|t\.faq/);
  assert.doesNotMatch(dictionary, /faq:|Частые вопросы|Жиі қойылатын сұрақтар|На разборе определим/);
  assert.match(styles, /\.ctaNotice \{[^}]*color:white;/);
  assert.doesNotMatch(styles, /\.ctaNotice \{[^}]*(?:background|border|box-shadow|padding)/);
  assert.doesNotMatch(styles, /faqGrid|accordion/);
  assert.doesNotMatch(page, /navCta|mobileMenuCta/);
  assert.match(page, /https:\/\/wa\.me\/77718043549/);
  assert.match(page, /https:\/\/www\.instagram\.com\/target_ads\.kz\//);
  assert.match(page, /https:\/\/t\.me\/Target_up88/);
  assert.equal((page.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.doesNotMatch(dictionary, /\b(?:about|book):/);
  assert.match(dictionary, /whatsapp: "Написать в WhatsApp"/);
  assert.match(dictionary, /whatsapp: "Message me on WhatsApp"/);
  assert.match(page, /https:\/\/quiz-lead-handler\.jumanur62\.workers\.dev/);
  assert.match(page, /leadIdRef\.current \|\|= crypto\.randomUUID\(\)/);
  assert.match(page, /new URLSearchParams\(window\.location\.search\)/);
  for (const field of ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"]) {
    assert.match(page, new RegExp(`${field}:`));
  }
  assert.match(page, /await fetch\(LEAD_WORKER_URL/);
  assert.match(page, /if \(!response\.ok \|\| workerReportedError\)/);
  assert.match(page, /setError\("submit"\)/);
  assert.match(page, /disabled=\{isSubmitting\}/);
  assert.match(page, /isSubmitting \? t\.quiz\.submitting : t\.quiz\.submit/);
  assert.match(page, /if \(error === "name" && value\.trim\(\)\) setError\(null\)/);
  assert.match(page, /onChange=\{\(event\) => handleNameChange\(event\.target\.value\)\}/);
  assert.match(page, /href="\/privacy-policy\.pdf" target="_blank" rel="noreferrer"/);
  assert.ok(page.indexOf("if (!response.ok || workerReportedError)") < page.indexOf('localStorage.setItem("zarema-quiz-lead"'));
  assert.match(dictionary, /submit: "Не удалось отправить заявку\. Попробуйте ещё раз"/);
  assert.match(dictionary, /submitting: "Отправляем\.\.\."/);
  assert.match(dictionary, /submit: "Өтінімді жіберу мүмкін болмады\. Қайталап көріңіз"/);
  assert.match(dictionary, /submitting: "Жіберілуде\.\.\."/);
  assert.match(dictionary, /submit: "Your request could not be sent\. Please try again"/);
  assert.match(dictionary, /submitting: "Submitting\.\.\."/);
  assert.match(styles, /@media \(max-width:639px\)/);
  assert.match(styles, /\.socialLink \{[^}]*width:46px;[^}]*height:46px;/);
  assert.match(styles, /@media \(max-width:389px\)/);
  assert.match(styles, /@media \(max-width:1090px\)[\s\S]*?\.navActions \{ margin-left:auto; \}/);
  assert.doesNotMatch(styles, /\.desktopLanguage|\.mobileLanguageSwitch/);
  assert.match(styles, /@media \(max-width:359px\)/);
  assert.match(styles, /100dvh/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /overflow-x:hidden/);
  assert.match(dictionary, /Жауапты таңдаңыз/);
  assert.match(dictionary, /Выберите ответ/);
  assert.match(dictionary, /Select an answer/);
  assert.match(dictionary, /What monthly budget are you ready to allocate to promotion\?/);
  assert.match(dictionary, /I consent to the processing of my personal data/);
});
