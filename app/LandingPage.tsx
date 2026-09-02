"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, locales, type Dictionary, type Locale } from "./i18n";
import { trackMetaLead } from "./MetaPixel";

type QuizAnswers = Record<string, string>;
type FormError = "select" | "name" | "phone" | "consent" | "submit" | null;

const SYSTEM_MEDIA: Record<string, { src: string; width: number; height: number }> = {
  traffic: { src: "/images/ads.png", width: 959, height: 540 },
  landing: { src: "/images/landing.png", width: 1907, height: 973 },
  filter: { src: "/images/crm.png", width: 1259, height: 613 },
  analytics: { src: "/images/analytics.png", width: 1260, height: 612 },
};

const DRAFT_KEY = "zarema-quiz-draft";
const LEAD_WORKER_URL = "https://quiz-lead-handler.jumanur62.workers.dev";

type Props = { locale: Locale };

type LanguageSwitchProps = {
  locale: Locale;
  aria: Dictionary["aria"];
  onSwitch: (locale: Locale) => void;
};

function LanguageSwitch({ locale, aria, onSwitch }: LanguageSwitchProps) {
  const labels: Record<Locale, string> = { ru: "RU", kz: "KZ", en: "EN" };
  const accessibleLabels: Record<Locale, string> = {
    ru: aria.switchToRu,
    kz: aria.switchToKz,
    en: aria.switchToEn,
  };

  return (
    <div className="languageSwitch" role="group" aria-label={aria.language}>
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          className={locale === code ? "active" : ""}
          aria-pressed={locale === code}
          aria-label={accessibleLabels[code]}
          onClick={() => onSwitch(code)}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}

function CtaNotice({ notice }: { notice: Dictionary["ctaNotice"] }) {
  return (
    <div className="ctaNotice">
      <strong>{notice.highlight}</strong>
      <span>{notice.detail}</span>
    </div>
  );
}

export default function LandingPage({ locale }: Props) {
  const router = useRouter();
  const t = dictionaries[locale];
  const [quizOpen, setQuizOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const leadIdRef = useRef("");
  const [draftReady, setDraftReady] = useState(false);

  const totalSteps = t.quiz.questions.length + 1;
  const progress = useMemo(() => ((step + 1) / totalSteps) * 100, [step, totalSteps]);
  const activeQuestion = t.quiz.questions[step];

  const draft = () => ({ quizOpen, step, answers, name, phone, consent, sent });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = sessionStorage.getItem(DRAFT_KEY);
        if (saved) {
          const value = JSON.parse(saved) as Partial<ReturnType<typeof draft>>;
          if (typeof value.quizOpen === "boolean") setQuizOpen(value.quizOpen);
          if (typeof value.step === "number") setStep(Math.min(Math.max(value.step, 0), totalSteps - 1));
          if (value.answers && typeof value.answers === "object") setAnswers(value.answers);
          if (typeof value.name === "string") setName(value.name);
          if (typeof value.phone === "string") setPhone(value.phone);
          if (typeof value.consent === "boolean") setConsent(value.consent);
          if (typeof value.sent === "boolean") setSent(value.sent);
        }
      } catch {
        sessionStorage.removeItem(DRAFT_KEY);
      }
      setDraftReady(true);
    });
    // The draft is restored once on mount; later updates are persisted below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftReady, quizOpen, step, answers, name, phone, consent, sent]);

  useEffect(() => {
    document.documentElement.lang = locale === "kz" ? "kk" : locale;
    document.title = t.meta.title;
  }, [locale, t.meta.title]);

  useEffect(() => {
    document.body.style.overflow = quizOpen || menuOpen ? "hidden" : "";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (quizOpen) setQuizOpen(false);
      else setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, quizOpen]);

  const persistDraft = () => sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft()));

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    persistDraft();
    setMenuOpen(false);
    const hash = window.location.hash;
    router.push(`/${nextLocale}${hash}`);
  };

  const openQuiz = () => {
    setMenuOpen(false);
    setQuizOpen(true);
    setError(null);
  };

  const chooseAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setError(null);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (error === "name" && value.trim()) setError(null);
  };

  const nextStep = () => {
    if (!activeQuestion || !answers[activeQuestion.id]) {
      setError("select");
      return;
    }
    setStep((current) => Math.min(current + 1, totalSteps - 1));
    setError(null);
  };

  const submitQuiz = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) return setError("name");
    if (digits.length < 10) return setError("phone");
    if (!consent) return setError("consent");

    const searchParams = new URLSearchParams(window.location.search);
    leadIdRef.current ||= crypto.randomUUID();
    const lead = {
      leadId: leadIdRef.current,
      name: name.trim(),
      phone: `+${digits}`,
      answers: t.quiz.questions.map((question) => {
        const answerId = answers[question.id];
        return {
          questionId: question.id,
          answerId,
          question: question.title,
          answer: question.options.find((option) => option.id === answerId)?.text ?? "",
        };
      }),
      locale,
      createdAt: new Date().toISOString(),
      utmSource: searchParams.get("utm_source") ?? "",
      utmMedium: searchParams.get("utm_medium") ?? "",
      utmCampaign: searchParams.get("utm_campaign") ?? "",
      utmContent: searchParams.get("utm_content") ?? "",
      utmTerm: searchParams.get("utm_term") ?? "",
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(LEAD_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        // A successful response may have an empty or non-JSON body.
      }

      const workerReportedError = responseBody !== null
        && typeof responseBody === "object"
        && (("success" in responseBody && responseBody.success === false)
          || ("ok" in responseBody && responseBody.ok === false)
          || ("error" in responseBody && Boolean(responseBody.error)));

      if (!response.ok || workerReportedError) {
        console.error("Lead Worker returned an error", {
          status: response.status,
          statusText: response.statusText,
          responseBody,
        });
        setError("submit");
        return;
      }

      localStorage.setItem("zarema-quiz-lead", JSON.stringify(lead));
      sessionStorage.removeItem(DRAFT_KEY);
      trackMetaLead("quiz");
      setError(null);
      setSent(true);
    } catch (requestError) {
      console.error("Failed to send lead to Lead Worker", requestError);
      setError("submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizOpen(false);
    sessionStorage.removeItem(DRAFT_KEY);
    leadIdRef.current = "";
    setTimeout(() => {
      setStep(0);
      setAnswers({});
      setName("");
      setPhone("");
      setConsent(false);
      setSent(false);
    }, 250);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main lang={locale === "kz" ? "kk" : locale}>
      <section className="hero" id="home">
        <div className="shell navShell">
          <nav className="nav" aria-label={t.aria.mainNav}>
            <a className="brand" href="#home" aria-label={t.aria.home} onClick={closeMenu}>
              <img src="/images/logo.png" alt="ADS.KZ" width="1254" height="1254" />
            </a>
            <div className="navLinks">
              <a href="#audience">{t.nav.audience}</a>
              <a href="#services">{t.nav.services}</a>
              <a href="#contacts">{t.nav.contacts}</a>
            </div>
            <div className="navActions">
              <div className="navLanguage"><LanguageSwitch locale={locale} aria={t.aria} onSwitch={switchLocale} /></div>
              <button
                className={`menuToggle${menuOpen ? " open" : ""}`}
                type="button"
                aria-label={menuOpen ? t.aria.closeMenu : t.aria.openMenu}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span /><span /><span />
              </button>
            </div>
            <div id="mobile-menu" className={`mobileMenu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
              <a href="#audience" onClick={closeMenu}>{t.nav.audience}</a>
              <a href="#services" onClick={closeMenu}>{t.nav.services}</a>
              <a href="#contacts" onClick={closeMenu}>{t.nav.contacts}</a>
            </div>
          </nav>
          {menuOpen && <div className="mobileMenuOverlay" role="presentation" onClick={closeMenu} />}
        </div>

        <div className="shell">
          <div className="heroGrid">
            <div className="heroPanel">
              <p className="eyebrow">{t.hero.eyebrow}</p>
              <h1>{t.hero.title}</h1>
              {t.hero.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="heroVisual">
              <img src="/images/zarema.png" alt={t.hero.portraitAlt} width="1122" height="1402" fetchPriority="high" />
            </div>
            <div className="heroAction">
              <button className="button buttonLight" type="button" onClick={openQuiz}>{t.hero.cta}</button>
              <CtaNotice notice={t.ctaNotice} />
            </div>
          </div>
        </div>
      </section>

      <section className="section system" id="system">
        <div className="shell">
          <div className="sectionIntro">
            <p className="sectionKicker">{t.system.kicker}</p>
            <h2>{t.system.title}</h2>
            <p>{t.system.intro}</p>
          </div>
          <div className="systemGrid">
            {t.system.cards.map((card) => {
              const media = SYSTEM_MEDIA[card.id];
              return (
                <article className="systemCard" key={card.id}>
                  <div className="systemCardTop"><span>{card.number}</span><h3>{card.title}</h3></div>
                  <p>{card.text}</p>
                  <img src={media.src} alt={card.alt} width={media.width} height={media.height} loading="lazy" decoding="async" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section problems">
        <div className="shell">
          <div className="sectionIntro narrow"><p className="sectionKicker">{t.problems.kicker}</p><h2>{t.problems.title}</h2></div>
          <div className="problemLayout">
            <div className="problemList">
              {t.problems.items.map((item) => <article key={item.id}><h3>{item.title}</h3><p>{item.text}</p></article>)}
            </div>
            <div className="problemImage">
              <img src="/images/pain.png" alt={t.problems.imageAlt} width="941" height="1672" loading="lazy" decoding="async" />
            </div>
          </div>
          <div className="systemNote"><strong>{t.problems.noteLead}</strong><span>{t.problems.noteFlow}</span><p>{t.problems.noteText}</p></div>
        </div>
      </section>

      <section className="section audience" id="audience">
        <div className="shell">
          <div className="sectionIntro narrow"><p className="sectionKicker">{t.audience.kicker}</p><h2>{t.audience.title}</h2><p>{t.audience.intro}</p></div>
          <div className="audienceGrid">
            <article className="audienceCard good"><span className="cardNumber">01</span><h3>{t.audience.suitableTitle}</h3><ul>{t.audience.suitable.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="audienceCard bad"><span className="cardNumber">02</span><h3>{t.audience.unsuitableTitle}</h3><ul>{t.audience.unsuitable.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
        </div>
      </section>

      <section className="section offer" id="services">
        <div className="shell offerGrid">
          <div className="offerCopy">
            <p className="sectionKicker light">{t.offer.kicker}</p><h2>{t.offer.title}</h2>
            <ul className="checkList">{t.offer.items.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className="price">{t.offer.priceLabel} <strong>{t.offer.priceValue}</strong></div>
            <p className="offerNote">{t.offer.note}</p>
            <button className="button buttonLight" type="button" onClick={openQuiz}>{t.offer.cta}</button>
            <CtaNotice notice={t.ctaNotice} />
          </div>
          <div className="offerVisual"><img src="/images/handshake.png" alt={t.offer.imageAlt} width="1448" height="1086" loading="lazy" decoding="async" /></div>
        </div>
      </section>

      <footer id="contacts">
        <div className="shell footerGrid">
          <div><img className="footerLogo" src="/images/logo.png" alt="ADS.KZ" width="1254" height="1254" loading="lazy" decoding="async" /><p>{t.footer.description}</p></div>
          <div className="footerContact">
            <span>{t.footer.contact}</span>
            <div className="footerContactRow">
              <a className="footerPhone" href="tel:+77718043549" onClick={() => trackMetaLead("phone")}>8 771 804 35 49</a>
              <nav className="socialLinks" aria-label={t.footer.contact}>
                <a className="socialLink socialWhatsapp" href="https://wa.me/77718043549" target="_blank" rel="noopener noreferrer" aria-label={t.footer.social.whatsapp} title={t.footer.social.whatsapp} onClick={() => trackMetaLead("whatsapp")}>
                  <span className="socialIcon"><img src="/images/social-whatsapp.avif" alt="" width="626" height="626" loading="lazy" decoding="async" /></span>
                </a>
                <a className="socialLink socialInstagram" href="https://www.instagram.com/target_ads.kz/" target="_blank" rel="noopener noreferrer" aria-label={t.footer.social.instagram} title={t.footer.social.instagram} onClick={() => trackMetaLead("instagram")}>
                  <span className="socialIcon"><img src="/images/social-instagram.avif" alt="" width="740" height="740" loading="lazy" decoding="async" /></span>
                </a>
                <a className="socialLink socialTelegram" href="https://t.me/Target_up88" target="_blank" rel="noopener noreferrer" aria-label={t.footer.social.telegram} title={t.footer.social.telegram} onClick={() => trackMetaLead("telegram")}>
                  <span className="socialIcon"><img src="/images/social-telegram.png" alt="" width="1000" height="632" loading="lazy" decoding="async" /></span>
                </a>
              </nav>
            </div>
          </div>
        </div>
        <div className="shell copyright"><span>{t.footer.copyright}</span><a id="privacy" href="#privacy">{t.footer.privacy}</a></div>
      </footer>

      {quizOpen && (
        <div className="modalBackdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setQuizOpen(false)}>
          <section className="quizModal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
            <button className="modalClose" type="button" aria-label={t.aria.closeQuiz} onClick={() => setQuizOpen(false)}>×</button>
            {!sent ? (
              <>
                <div className="quizHeader"><p>{t.quiz.kicker}</p><h2 id="quiz-title">{t.quiz.title}</h2><span>{t.quiz.subtitle}</span></div>
                <div className="progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
                <form onSubmit={submitQuiz}>
                  {activeQuestion ? (
                    <fieldset className="quizStep">
                      <legend>{activeQuestion.title}</legend>
                      {activeQuestion.subtitle && <p className="quizSubtitle">{activeQuestion.subtitle}</p>}
                      <div className="options">
                        {activeQuestion.options.map((option) => (
                          <label key={option.id} className={answers[activeQuestion.id] === option.id ? "selected" : ""}>
                            <input type="radio" name={activeQuestion.id} checked={answers[activeQuestion.id] === option.id} onChange={() => chooseAnswer(activeQuestion.id, option.id)} />
                            <span className="radioDot" /><span>{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <div className="contactStep">
                      <h3>{t.quiz.lastStepTitle}</h3><p>{t.quiz.lastStepText}</p>
                      <label><span>{t.quiz.nameLabel}</span><input value={name} onChange={(event) => handleNameChange(event.target.value)} placeholder={t.quiz.namePlaceholder} autoComplete="name" autoFocus /></label>
                      <label><span>{t.quiz.phoneLabel}</span><div className="phoneField"><b>+7</b><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^\d\s()-]/g, ""))} placeholder={t.quiz.phonePlaceholder} inputMode="tel" autoComplete="tel" /></div></label>
                      <div className="consent">
                        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                        <a href="/privacy-policy.pdf" target="_blank" rel="noreferrer">{t.quiz.consent}</a>
                      </div>
                    </div>
                  )}
                  {error && <p className="formError" role="alert">{t.quiz.errors[error]}</p>}
                  <div className="quizNav">
                    {step > 0 && <button className="backButton" type="button" onClick={() => { setStep((current) => current - 1); setError(null); }}>{t.quiz.back}</button>}
                    {activeQuestion ? <button className="nextButton" type="button" onClick={nextStep}>{t.quiz.next}</button> : <button className="nextButton" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? t.quiz.submitting : t.quiz.submit}</button>}
                  </div>
                </form>
              </>
            ) : (
              <div className="success"><span>✓</span><h2>{t.quiz.successPrefix}, {name}!</h2><p>{t.quiz.successBody}</p><button className="nextButton" type="button" onClick={resetQuiz}>{t.quiz.done}</button></div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
