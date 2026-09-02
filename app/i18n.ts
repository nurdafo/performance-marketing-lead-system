export const locales = ["ru", "kz", "en"] as const;

export type Locale = (typeof locales)[number];

type Option = { id: string; text: string };
type QuizQuestion = { id: string; title: string; subtitle?: string; options: Option[] };

export type Dictionary = {
  meta: { title: string; description: string; ogDescription: string; twitterDescription: string };
  aria: {
    mainNav: string;
    home: string;
    openMenu: string;
    closeMenu: string;
    closeQuiz: string;
    language: string;
    switchToRu: string;
    switchToKz: string;
    switchToEn: string;
  };
  nav: { audience: string; services: string; contacts: string };
  ctaNotice: { highlight: string; detail: string };
  hero: { eyebrow: string; title: string; paragraphs: string[]; cta: string; portraitAlt: string };
  system: {
    kicker: string;
    title: string;
    intro: string;
    cards: Array<{ id: string; number: string; title: string; text: string; alt: string }>;
  };
  problems: {
    kicker: string;
    title: string;
    items: Array<{ id: string; title: string; text: string }>;
    imageAlt: string;
    noteLead: string;
    noteFlow: string;
    noteText: string;
  };
  audience: {
    kicker: string;
    title: string;
    intro: string;
    suitableTitle: string;
    suitable: string[];
    unsuitableTitle: string;
    unsuitable: string[];
  };
  offer: {
    kicker: string;
    title: string;
    items: string[];
    priceLabel: string;
    priceValue: string;
    note: string;
    cta: string;
    imageAlt: string;
  };
  footer: {
    description: string;
    contact: string;
    copyright: string;
    privacy: string;
    social: { whatsapp: string; instagram: string; telegram: string };
  };
  quiz: {
    kicker: string;
    title: string;
    subtitle: string;
    questions: QuizQuestion[];
    lastStepTitle: string;
    lastStepText: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    consent: string;
    errors: { select: string; name: string; phone: string; consent: string; submit: string };
    back: string;
    next: string;
    submit: string;
    submitting: string;
    successPrefix: string;
    successBody: string;
    done: string;
  };
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    meta: {
      title: "Зарема Серикова — Performance-маркетолог",
      description: "Система получения заявок: реклама, лендинг, CRM и аналитика.",
      ogDescription: "Не просто реклама, а связанная система получения и обработки заявок.",
      twitterDescription: "Реклама + лендинг + CRM + аналитика",
    },
    aria: {
      mainNav: "Основная навигация",
      home: "На главную",
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
      closeQuiz: "Закрыть квиз",
      language: "Выбор языка",
      switchToRu: "Переключить на русский язык",
      switchToKz: "Переключить на казахский язык",
      switchToEn: "Переключить на английский язык",
    },
    nav: {
      audience: "С кем работаю",
      services: "Услуги",
      contacts: "Контакты",
    },
    ctaNotice: {
      highlight: "Спам рассылки не будет!",
      detail: "Я сама лично свяжусь с вами.",
    },
    hero: {
      eyebrow: "Зарема Серикова · Performance-маркетолог",
      title: "Не просто запускаю рекламу — выстраиваю систему получения заявок",
      paragraphs: [
        "Запускаю целевой трафик из Meta, TikTok или LinkedIn на маркетинговую воронку: реклама + лендинг/сайт + CRM + аналитика.",
        "Вы получаете структурированные заявки напрямую в CRM — с контактами, потребностью и ответами клиента, а не только пустые клики и вопросы «Цена?» в Direct.",
      ],
      cta: "Получить разбор проекта",
      portraitAlt: "Зарема Серикова",
    },
    system: {
      kicker: "Система, а не отдельная настройка",
      title: "Как заявки попадают из рекламы в CRM и аналитику",
      intro: "Я соединяю четыре элемента в одну систему, чтобы контролировать путь клиента от первого клика до обработки заявки.",
      cards: [
        { id: "traffic", number: "01", title: "Точечный трафик", text: "Выбираем одну ключевую площадку — Meta, TikTok или LinkedIn — где находится именно ваша платёжеспособная аудитория.", alt: "Кабинет рекламных кампаний" },
        { id: "landing", number: "02", title: "Закрытая посадочная страница", text: "Создаю лёгкий мини-сайт. Клиент не отвлекается на лишний контент и идёт строго по коммерческой воронке.", alt: "Пример посадочной страницы" },
        { id: "filter", number: "03", title: "Автоматическая фильтрация", text: "Система опрашивает человека на входе. Менеджер получает качественные лиды с понятным бюджетом и потребностью.", alt: "Заявки в CRM" },
        { id: "analytics", number: "04", title: "Оцифровка", text: "Все заявки мгновенно попадают в систему учёта. Аналитика показывает путь каждого тенге — от клика до кассы.", alt: "Отчёт веб-аналитики" },
      ],
    },
    problems: {
      kicker: "Где теряется результат",
      title: "Почему ваша текущая реклама не приносит кассу?",
      items: [
        { id: "slow", title: "Заявки теряются из-за долгих ответов", text: "Менеджеры и администраторы отвечают не сразу, поэтому горячий клиент успевает уйти к конкуренту." },
        { id: "quality", title: "Поступают некачественные обращения", text: "Люди спрашивают только цену, не понимают ценность предложения или не готовы покупать." },
        { id: "clicks", title: "Бюджет уходит на клики, а не на заявки", text: "В отчётах есть просмотры и переходы, но нет понятного пути клиента до обращения и продажи." },
        { id: "content", title: "Запуск зависит от контента", text: "Реклама останавливается, если материалы не готовы или предложение недостаточно понятно оформлено." },
      ],
      imageAlt: "Проблемы несистемной рекламы",
      noteLead: "Проблема часто не в самой рекламе, а в отсутствии единой системы:",
      noteFlow: "трафик → лендинг/сайт → CRM → аналитика.",
      noteText: "Поэтому я настраиваю весь путь клиента — от первого клика до заявки в CRM.",
    },
    audience: {
      kicker: "С кем я работаю",
      title: "Для бизнеса, готового системно обрабатывать обращения",
      intro: "Система подойдёт бизнесу, у которого уже есть сформированный продукт и готовность работать с входящими заявками.",
      suitableTitle: "Подходит, если:",
      suitable: ["есть действующий бизнес;", "понятный продукт и цены;", "есть рекламный бюджет;", "есть менеджер или администратор;", "команда вовремя предоставляет материалы и доступы."],
      unsuitableTitle: "Не подойдёт, если:",
      unsuitable: ["бизнес ещё не запущен;", "нет бюджета на рекламу;", "некому отвечать на заявки;", "ожидаются гарантированные продажи без участия отдела продаж."],
    },
    offer: {
      kicker: "Комплексный запуск",
      title: "В стоимость входит:",
      items: ["анализ бизнеса и аудитории", "разработка маркетинговой воронки", "настройка рекламы", "создание лендинга, сайта или квиза", "подключение CRM", "настройка Яндекс Метрики", "цели и UTM-метки", "автоматизация передачи заявок", "тестирование и запуск", "сопровождение и оптимизация в течение месяца"],
      priceLabel: "Комплексный запуск —",
      priceValue: "200 000 тг.",
      note: "Вы оплачиваете не только настройку таргета, а создание связанной системы привлечения и обработки заявок.",
      cta: "Обсудить запуск системы",
      imageAlt: "Партнёрство и запуск системы",
    },
    footer: {
      description: "Performance-маркетинг и система получения заявок для бизнеса.",
      contact: "Связаться со мной",
      copyright: "© 2026 Зарема Серикова. Все права защищены.",
      privacy: "Политика конфиденциальности",
      social: {
        whatsapp: "Написать в WhatsApp",
        instagram: "Открыть Instagram",
        telegram: "Написать в Telegram",
      },
    },
    quiz: {
      kicker: "Предварительный разбор",
      title: "Узнайте, какая система подойдёт вашему бизнесу",
      subtitle: "Оставьте заявку — я изучу ваш продукт и предложу структуру воронки для запуска.",
      questions: [
        { id: "industry", title: "Какая сфера деятельности у вашего бизнеса?", options: [
          { id: "high-ticket", text: "Услуги с высоким чеком (стоматология, бьюти-сфера, юристы, ремонт)" },
          { id: "b2b", text: "B2B, опт, производство или промышленность" },
          { id: "real-estate", text: "Недвижимость, строительство, дизайн интерьеров" },
          { id: "education", text: "Онлайн-образование, инфобизнес, школы языков" },
          { id: "retail", text: "Розничная торговля / Интернет-магазин" },
          { id: "other", text: "Другое" },
        ] },
        { id: "problem", title: "Какая главная проблема с привлечением клиентов сейчас?", options: [
          { id: "wasted-budget", text: "Таргетологи сливают бюджет, приходят «пустые» клики и подписки" },
          { id: "poor-leads", text: "Заявки есть, но они некачественные (говорят «дорого» или молчат)" },
          { id: "slow-team", text: "Менеджеры не успевают вовремя обрабатывать Direct / теряют лиды" },
          { id: "content-dependent", text: "Реклама сильно зависит от контента и работы мобилографа" },
          { id: "from-scratch", text: "Запускаемся с нуля, нужна готовая система «под ключ»" },
        ] },
        { id: "handler", title: "Кто в вашей компании занимается обработкой входящих заявок?", options: [
          { id: "sales-team", text: "Выделенный отдел продаж / менеджеры по продажам" },
          { id: "administrator", text: "Администратор (на ресепшене или в магазине)" },
          { id: "owner", text: "Я сам(а) обрабатываю все сообщения и звонки" },
          { id: "nobody", text: "Пока некому обрабатывать, ищу решение" },
        ] },
        { id: "budget", title: "Какой ежемесячный бюджет вы готовы выделять на продвижение?", subtitle: "Стоимость услуг специалиста + рекламный бюджет на платформу", options: [
          { id: "400-plus", text: "От 400 000 тенге и выше" },
          { id: "250-400", text: "От 250 000 до 400 000 тенге" },
          { id: "under-200", text: "До 200 000 тенге" },
          { id: "unknown", text: "Пока не знаю, хочу рассчитать необходимый бюджет" },
        ] },
      ],
      lastStepTitle: "Остался последний шаг",
      lastStepText: "Оставьте контакты, и я свяжусь с вами для разбора проекта.",
      nameLabel: "Как к Вам обращаться?",
      namePlaceholder: "Укажите имя",
      phoneLabel: "Номер телефона",
      phonePlaceholder: "777 000 00 00",
      consent: "Я согласен на обработку персональных данных",
      errors: { select: "Выберите ответ", name: "Укажите имя", phone: "Введите корректный номер телефона", consent: "Подтвердите согласие на обработку данных", submit: "Не удалось отправить заявку. Попробуйте ещё раз" },
      back: "Назад",
      next: "Продолжить",
      submit: "Отправить",
      submitting: "Отправляем...",
      successPrefix: "Спасибо",
      successBody: "Ваша заявка принята. Я свяжусь с вами в ближайшее время.",
      done: "Готово",
    },
  },
  kz: {
    meta: {
      title: "Зарема Серикова — Performance-маркетолог",
      description: "Өтінім тарту жүйесі: жарнама, лендинг, CRM және аналитика.",
      ogDescription: "Жай ғана жарнама емес, өтінім тарту мен өңдеудің біртұтас жүйесі.",
      twitterDescription: "Жарнама + лендинг + CRM + аналитика",
    },
    aria: {
      mainNav: "Негізгі навигация",
      home: "Басты бетке",
      openMenu: "Мәзірді ашу",
      closeMenu: "Мәзірді жабу",
      closeQuiz: "Квизді жабу",
      language: "Тілді таңдау",
      switchToRu: "Орыс тіліне ауысу",
      switchToKz: "Қазақ тіліне ауысу",
      switchToEn: "Ағылшын тіліне ауысу",
    },
    nav: {
      audience: "Кімдермен жұмыс істеймін",
      services: "Қызметтер",
      contacts: "Байланыс",
    },
    ctaNotice: {
      highlight: "Спам-хабарламалар жіберілмейді!",
      detail: "Сізбен өзім жеке хабарласамын.",
    },
    hero: {
      eyebrow: "Зарема Серикова · Performance-маркетолог",
      title: "Жай ғана жарнама іске қоспаймын — өтінім тартудың тұтас жүйесін құрамын",
      paragraphs: [
        "Meta, TikTok немесе LinkedIn желілерінен мақсатты трафикті маркетингтік воронкаға бағыттаймын: жарнама + лендинг/сайт + CRM + аналитика.",
        "Сіз CRM-ге байланыс деректері, қажеттілігі және клиент жауаптары көрсетілген құрылымды өтінімдер аласыз — жай ғана бос кликтер мен Direct-тегі «Бағасы қанша?» деген сұрақтар емес.",
      ],
      cta: "Жобаға талдау алу",
      portraitAlt: "Зарема Серикова",
    },
    system: {
      kicker: "Жеке баптау емес, тұтас жүйе",
      title: "Өтінімдер жарнамадан CRM мен аналитикаға қалай түседі",
      intro: "Клиенттің алғашқы кликтен өтінімді өңдеуге дейінгі жолын бақылау үшін төрт элементті бір жүйеге біріктіремін.",
      cards: [
        { id: "traffic", number: "01", title: "Нақты бағытталған трафик", text: "Төлем қабілеті бар аудиторияңыз орналасқан Meta, TikTok немесе LinkedIn платформаларының бірін таңдаймыз.", alt: "Жарнамалық науқандар кабинеті" },
        { id: "landing", number: "02", title: "Жабық қону беті", text: "Жеңіл мини-сайт жасаймын. Клиент артық контентке алаңдамай, коммерциялық воронкамен тікелей өтеді.", alt: "Қону бетінің үлгісі" },
        { id: "filter", number: "03", title: "Автоматты сүзгілеу", text: "Жүйе адамға бастапқы сұрақтар қояды. Менеджер бюджеті мен қажеттілігі түсінікті сапалы лидтерді алады.", alt: "CRM жүйесіндегі өтінімдер" },
        { id: "analytics", number: "04", title: "Цифрландыру", text: "Барлық өтінімдер бірден есеп жүйесіне түседі. Аналитика әр теңгенің кликтен кассаға дейінгі жолын көрсетеді.", alt: "Веб-аналитика есебі" },
      ],
    },
    problems: {
      kicker: "Нәтиже қай жерде жоғалады",
      title: "Неліктен қазіргі жарнамаңыз табыс әкелмейді?",
      items: [
        { id: "slow", title: "Өтінімдер кеш жауап берілгендіктен жоғалады", text: "Менеджерлер мен әкімшілер бірден жауап бермейді, сондықтан дайын клиент бәсекелеске кетіп қалады." },
        { id: "quality", title: "Сапасыз сұраныстар түседі", text: "Адамдар тек бағаны сұрайды, ұсыныстың құндылығын түсінбейді немесе сатып алуға дайын емес." },
        { id: "clicks", title: "Бюджет өтінімге емес, кликтерге жұмсалады", text: "Есептерде қаралымдар мен өтулер бар, бірақ клиенттің өтінім мен сатылымға дейінгі жолы түсініксіз." },
        { id: "content", title: "Іске қосу контентке тәуелді", text: "Материалдар дайын болмаса немесе ұсыныс түсінікті рәсімделмесе, жарнама тоқтап қалады." },
      ],
      imageAlt: "Жүйесіз жарнаманың мәселелері",
      noteLead: "Мәселе көбіне жарнаманың өзінде емес, біртұтас жүйенің болмауында:",
      noteFlow: "трафик → лендинг/сайт → CRM → аналитика.",
      noteText: "Сондықтан мен тек таргетті емес, клиенттің алғашқы кликтен CRM-дегі өтінімге дейінгі толық жолын баптаймын.",
    },
    audience: {
      kicker: "Кімдермен жұмыс істеймін",
      title: "Өтінімдерді жүйелі өңдеуге дайын бизнеске арналған",
      intro: "Жүйе қалыптасқан өнімі бар және кіріс өтінімдермен жүйелі жұмыс істеуге дайын бизнеске сәйкес келеді.",
      suitableTitle: "Сәйкес келеді, егер:",
      suitable: ["жұмыс істеп тұрған бизнесіңіз болса;", "өнім мен бағалар түсінікті болса;", "жарнама бюджеті болса;", "менеджер немесе әкімші болса;", "команда материалдар мен қолжетімділіктерді уақытында берсе."],
      unsuitableTitle: "Сәйкес келмейді, егер:",
      unsuitable: ["бизнес әлі іске қосылмаса;", "жарнамаға бюджет болмаса;", "өтінімдерге жауап беретін адам болмаса;", "сату бөлімінің қатысуынсыз кепілді сатылым күтілсе."],
    },
    offer: {
      kicker: "Кешенді іске қосу",
      title: "Құнына мыналар кіреді:",
      items: ["бизнес пен аудиторияны талдау", "маркетингтік воронканы әзірлеу", "жарнаманы баптау", "лендинг, сайт немесе квиз жасау", "CRM қосу", "Яндекс Метриканы баптау", "мақсаттар мен UTM-белгілер", "өтінімдерді беруді автоматтандыру", "тестілеу және іске қосу", "бір ай бойы сүйемелдеу және оңтайландыру"],
      priceLabel: "Кешенді іске қосу —",
      priceValue: "200 000 тг.",
      note: "Сіз тек таргетті баптауға емес, клиент тарту мен өтінімдерді өңдеудің байланысқан жүйесін құруға төлейсіз.",
      cta: "Жүйені іске қосуды талқылау",
      imageAlt: "Серіктестік және жүйені іске қосу",
    },
    footer: {
      description: "Performance-маркетинг және бизнеске өтінім тарту жүйесі.",
      contact: "Менімен байланысу",
      copyright: "© 2026 Зарема Серикова. Барлық құқықтар қорғалған.",
      privacy: "Құпиялық саясаты",
      social: {
        whatsapp: "WhatsApp арқылы жазу",
        instagram: "Instagram парақшасын ашу",
        telegram: "Telegram арқылы жазу",
      },
    },
    quiz: {
      kicker: "Алдын ала талдау",
      title: "Бизнесіңізге қай жүйе сәйкес келетінін біліңіз",
      subtitle: "Өтінім қалдырыңыз — өніміңізді зерттеп, іске қосуға арналған воронка құрылымын ұсынамын.",
      questions: [
        { id: "industry", title: "Бизнесіңіздің қызмет саласы қандай?", options: [
          { id: "high-ticket", text: "Жоғары чекті қызметтер (стоматология, бьюти саласы, заңгерлер, жөндеу)" },
          { id: "b2b", text: "B2B, көтерме сауда, өндіріс немесе өнеркәсіп" },
          { id: "real-estate", text: "Жылжымайтын мүлік, құрылыс, интерьер дизайны" },
          { id: "education", text: "Онлайн-білім, инфобизнес, тіл мектептері" },
          { id: "retail", text: "Бөлшек сауда / Интернет-дүкен" },
          { id: "other", text: "Басқа" },
        ] },
        { id: "problem", title: "Қазір клиент тартудағы басты мәселе қандай?", options: [
          { id: "wasted-budget", text: "Таргетологтар бюджетті тиімсіз жұмсайды, бос кликтер мен жазылулар келеді" },
          { id: "poor-leads", text: "Өтінімдер бар, бірақ сапасыз («қымбат» дейді немесе жауап бермейді)" },
          { id: "slow-team", text: "Менеджерлер Direct-тегі хабарламаларды уақытында өңдемейді / лидтерді жоғалтады" },
          { id: "content-dependent", text: "Жарнама контент пен мобилограф жұмысына қатты тәуелді" },
          { id: "from-scratch", text: "Нөлден бастаймыз, дайын жүйе қажет" },
        ] },
        { id: "handler", title: "Компанияңызда кіріс өтінімдерді кім өңдейді?", options: [
          { id: "sales-team", text: "Арнайы сату бөлімі / сату менеджерлері" },
          { id: "administrator", text: "Әкімші (ресепшнде немесе дүкенде)" },
          { id: "owner", text: "Барлық хабарламалар мен қоңырауларды өзім өңдеймін" },
          { id: "nobody", text: "Әзірге өңдейтін адам жоқ, шешім іздеп жүрмін" },
        ] },
        { id: "budget", title: "Ілгерілетуге ай сайын қандай бюджет бөлуге дайынсыз?", subtitle: "Маман қызметінің құны + платформадағы жарнама бюджеті", options: [
          { id: "400-plus", text: "400 000 теңгеден жоғары" },
          { id: "250-400", text: "250 000–400 000 теңге" },
          { id: "under-200", text: "200 000 теңгеге дейін" },
          { id: "unknown", text: "Әзірге білмеймін, қажетті бюджетті есептегім келеді" },
        ] },
      ],
      lastStepTitle: "Соңғы қадам қалды",
      lastStepText: "Байланыс деректеріңізді қалдырыңыз, жобаңызды талдау үшін сізбен хабарласамын.",
      nameLabel: "Сізге қалай жүгінуге болады?",
      namePlaceholder: "Атыңызды жазыңыз",
      phoneLabel: "Телефон нөмірі",
      phonePlaceholder: "777 000 00 00",
      consent: "Жеке деректерді өңдеуге келісемін",
      errors: { select: "Жауапты таңдаңыз", name: "Атыңызды жазыңыз", phone: "Дұрыс телефон нөмірін енгізіңіз", consent: "Деректерді өңдеуге келісімді растаңыз", submit: "Өтінімді жіберу мүмкін болмады. Қайталап көріңіз" },
      back: "Артқа",
      next: "Жалғастыру",
      submit: "Жіберу",
      submitting: "Жіберілуде...",
      successPrefix: "Рақмет",
      successBody: "Өтініміңіз қабылданды. Жақын арада сізбен хабарласамын.",
      done: "Дайын",
    },
  },
  en: {
    meta: {
      title: "Zarema Serikova — Performance Marketer",
      description: "Lead generation system: advertising, landing pages, CRM, and analytics.",
      ogDescription: "Not just ads, but an integrated lead generation and processing system.",
      twitterDescription: "Advertising + landing page + CRM + analytics",
    },
    aria: {
      mainNav: "Main navigation",
      home: "Go to homepage",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      closeQuiz: "Close questionnaire",
      language: "Choose language",
      switchToRu: "Switch to Russian",
      switchToKz: "Switch to Kazakh",
      switchToEn: "Switch to English",
    },
    nav: {
      audience: "Who I work with",
      services: "Services",
      contacts: "Contact",
    },
    ctaNotice: {
      highlight: "No spam messages!",
      detail: "I will contact you personally.",
    },
    hero: {
      eyebrow: "Zarema Serikova · Performance Marketer",
      title: "I don't just launch ads — I build a complete lead generation system",
      paragraphs: [
        "I direct targeted traffic from Meta, TikTok, or LinkedIn into a marketing funnel: ads + landing page or website + CRM + analytics.",
        "You receive structured leads directly in your CRM — with contact details, needs, and client responses — instead of empty clicks and ‘How much?’ messages in Direct.",
      ],
      cta: "Get a project review",
      portraitAlt: "Zarema Serikova",
    },
    system: {
      kicker: "An integrated system, not an isolated setup",
      title: "How leads move from advertising to your CRM and analytics",
      intro: "I connect four elements into one system so you can track the customer journey from the first click to lead processing.",
      cards: [
        { id: "traffic", number: "01", title: "Precisely targeted traffic", text: "We select one key platform — Meta, TikTok, or LinkedIn — where your paying audience is most active.", alt: "Advertising campaign dashboard" },
        { id: "landing", number: "02", title: "Focused landing page", text: "I create a lightweight mini-site. Visitors stay focused on your offer and move through a clear conversion funnel.", alt: "Landing page example" },
        { id: "filter", number: "03", title: "Automatic lead qualification", text: "The system asks qualifying questions at the start. Your manager receives quality leads with clear needs and budgets.", alt: "Leads in a CRM system" },
        { id: "analytics", number: "04", title: "End-to-end tracking", text: "Every lead enters your tracking system instantly. Analytics shows where every tenge goes, from click to revenue.", alt: "Web analytics report" },
      ],
    },
    problems: {
      kicker: "Where results get lost",
      title: "Why aren't your current ads generating revenue?",
      items: [
        { id: "slow", title: "Leads are lost because replies take too long", text: "Managers and administrators do not respond quickly enough, so ready-to-buy clients move to competitors." },
        { id: "quality", title: "Low-quality enquiries come in", text: "People only ask about the price, do not understand the value of the offer, or are not ready to buy." },
        { id: "clicks", title: "The budget pays for clicks, not leads", text: "Reports show views and visits, but there is no clear path from a click to an enquiry and a sale." },
        { id: "content", title: "Launches depend on content", text: "Campaigns stall when materials are not ready or the offer has not been presented clearly." },
      ],
      imageAlt: "Problems caused by disconnected advertising",
      noteLead: "The problem is often not the advertising itself, but the lack of an integrated system:",
      noteFlow: "traffic → landing page or website → CRM → analytics.",
      noteText: "That is why I set up the entire customer journey — from the first click to a lead in your CRM.",
    },
    audience: {
      kicker: "Who I work with",
      title: "For businesses ready to process enquiries systematically",
      intro: "The system is designed for established businesses with a clear product and the capacity to work consistently with incoming leads.",
      suitableTitle: "A good fit if:",
      suitable: ["your business is already operating;", "your product and pricing are clear;", "you have an advertising budget;", "you have a manager or administrator;", "your team provides materials and access on time."],
      unsuitableTitle: "Not a good fit if:",
      unsuitable: ["the business has not launched yet;", "there is no advertising budget;", "no one is available to respond to leads;", "guaranteed sales are expected without involvement from the sales team."],
    },
    offer: {
      kicker: "Complete launch",
      title: "What is included:",
      items: ["business and audience analysis", "marketing funnel development", "advertising setup", "landing page, website, or questionnaire creation", "CRM integration", "Yandex Metrica setup", "goals and UTM tags", "automated lead delivery", "testing and launch", "one month of support and optimisation"],
      priceLabel: "Complete launch —",
      priceValue: "200,000 KZT",
      note: "You are investing not only in ad targeting, but in an integrated system for attracting and processing leads.",
      cta: "Discuss the system launch",
      imageAlt: "Partnership and system launch",
    },
    footer: {
      description: "Performance marketing and a lead generation system for businesses.",
      contact: "Contact me",
      copyright: "© 2026 Zarema Serikova. All rights reserved.",
      privacy: "Privacy Policy",
      social: {
        whatsapp: "Message me on WhatsApp",
        instagram: "Open Instagram",
        telegram: "Message me on Telegram",
      },
    },
    quiz: {
      kicker: "Initial assessment",
      title: "Find out which system fits your business",
      subtitle: "Submit a request — I will review your product and recommend a funnel structure for your launch.",
      questions: [
        { id: "industry", title: "What industry is your business in?", options: [
          { id: "high-ticket", text: "High-ticket services (dentistry, beauty, legal services, renovation)" },
          { id: "b2b", text: "B2B, wholesale, manufacturing, or industry" },
          { id: "real-estate", text: "Real estate, construction, or interior design" },
          { id: "education", text: "Online education, knowledge products, or language schools" },
          { id: "retail", text: "Retail / Online store" },
          { id: "other", text: "Other" },
        ] },
        { id: "problem", title: "What is your biggest client acquisition challenge right now?", options: [
          { id: "wasted-budget", text: "Ad specialists waste the budget and deliver empty clicks or followers" },
          { id: "poor-leads", text: "Leads come in, but they are low quality, say it is too expensive, or stop responding" },
          { id: "slow-team", text: "Managers do not respond to Direct messages quickly enough or lose leads" },
          { id: "content-dependent", text: "Advertising depends too heavily on content and production" },
          { id: "from-scratch", text: "We are starting from scratch and need a complete ready-to-use system" },
        ] },
        { id: "handler", title: "Who handles incoming leads in your company?", options: [
          { id: "sales-team", text: "A dedicated sales department / Sales managers" },
          { id: "administrator", text: "An administrator at reception or in the store" },
          { id: "owner", text: "I handle all messages and calls myself" },
          { id: "nobody", text: "No one yet — I am looking for a solution" },
        ] },
        { id: "budget", title: "What monthly budget are you ready to allocate to promotion?", subtitle: "Specialist fee + advertising budget for the platform", options: [
          { id: "400-plus", text: "400,000 KZT or more" },
          { id: "250-400", text: "250,000–400,000 KZT" },
          { id: "under-200", text: "Up to 200,000 KZT" },
          { id: "unknown", text: "I am not sure yet and would like to calculate the required budget" },
        ] },
      ],
      lastStepTitle: "One last step",
      lastStepText: "Leave your contact details, and I will get in touch to discuss your project.",
      nameLabel: "What should I call you?",
      namePlaceholder: "Enter your name",
      phoneLabel: "Phone number",
      phonePlaceholder: "777 000 00 00",
      consent: "I consent to the processing of my personal data",
      errors: { select: "Select an answer", name: "Enter your name", phone: "Enter a valid phone number", consent: "Confirm your consent to personal data processing", submit: "Your request could not be sent. Please try again" },
      back: "Back",
      next: "Continue",
      submit: "Submit",
      submitting: "Submitting...",
      successPrefix: "Thank you",
      successBody: "Your request has been received. I will contact you shortly.",
      done: "Done",
    },
  },
};
