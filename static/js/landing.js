/* Smooth scroll with header offset */
const scrollToAnchor = (selector) => {
  if (!selector || selector === "#") return;
  const target = document.querySelector(selector);
  if (!target) return;

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const targetTop =
    window.scrollY + target.getBoundingClientRect().top - headerHeight - 16;

  window.scrollTo({ top: targetTop, behavior: "smooth" });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    event.preventDefault();
    scrollToAnchor(href);
  });
});

/* Reveal on scroll */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

/* FAQ accordion — one open at a time */
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item && other.open) other.open = false;
    });
  });
});

/* Header elevation on scroll */
const header = document.querySelector(".site-header");
if (header) {
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ============================================================
   i18n — AZ / EN dil dəstəyi
   ============================================================ */
const translations = {
  az: {
    'nav-platform':   'Platforma',
    'nav-product':    'Məhsul',
    'nav-process':    'Proses',
    'nav-feedback':   'Rəylər',
    'nav-login':      'Daxil ol',
    'nav-getstarted': 'Başla',
    'hero-eyebrow':   'Azərbaycan Kibertəhlükəsizlik Ekosistemi',
    'hero-h1':        'Nəzəriyyə yox,\n            <span class="accent">real defense</span>\n            bacarığı qazan.',
    'hero-lede':      'SOC, red team, cloud security və appsec üzrə praktik self-study axını. Hər modul real ssenari, mentor rəyi və challenge əsaslı irəliləmə məntiqi ilə qurulub.',
    'hero-cta1':      'Platformaya keç <span class="btn-arrow" aria-hidden="true">→</span>',
    'hero-cta2':      'Demonu gör',
    'trust-title':    'Azərbaycan texno ekosistemi ilə birlikdə qurulur',
    'stat1':          'Aktiv öyrənən',
    'stat2':          'Mission tamamlama',
    'stat3':          'Mentor reytinqi',
    'stat4':          'Canlı challenge',
    'feat-eyebrow':   'Platforma',
    'feat-h2':        'Hardan başla, necə inkişaf et.',
    'feat-sub':       'Öyrənmək üçün lazım olan hər şey bir yerdə — praktik laboratoriyalar, mentor rəyi, simulasiyalar və portfolio hazırlığı.',
    'feat1-h3':       'Real-world ssenarilər',
    'feat1-p':        'Hədəfli simulasiya və istifadəçi rollarına uyğun tapşırıqlarla real təhdid modelini öyrən.',
    'feat2-h3':       'Ekspert mentorluq',
    'feat2-p':        'Mentor rəyi və fərdi feedback ilə sürətli, istiqamətli irəliləmə metodikası.',
    'feat3-h3':       'Karyera yol xəritəsi',
    'feat3-p':        'Portfolio yönümlü tapşırıqlar və sertifikat roadmap fokuslu səviyyə-səviyyə irəliləmə.',
    'feat4-h3':       'Hands-on laboratoriyalar',
    'feat4-p':        'Brauzerdə işləyən izolyasiya edilmiş mühitdə kodla, skan et, araşdır.',
    'feat5-h3':       'Vaxt məhdudlu missiyalar',
    'feat5-p':        'Canlı challenge saatları — gerçək incident-response tempini hiss et.',
    'feat6-h3':       'İcma & CTF',
    'feat6-p':        'Azərbaycan komandaları ilə komanda-qarşı challenges və həftəlik meetuplar.',
    'show-eyebrow':   'Məhsul',
    'show-h2':        'Bir workspace-də bütün defense stack-i.',
    'show-sub':       'Mission briefing, canlı lab mühiti, mentor rəyi və report hazırlığı — hamısı bir ekranda. Context keçidi yoxdur, real iş axını var.',
    'show-li1':       'Kontekstual ipucları ilə istiqamətləndirilmiş missiyalar',
    'show-li2':       'İnteqrasiya edilmiş terminal & qeyd alma',
    'show-li3':       'Avtomatik qiymətləndirmə və mentor eskalasiyası',
    'show-li4':       'İxrac edilə bilən insidentlər haqqında hesabatlar',
    'show-cta':       'Platformu araşdır <span class="btn-arrow" aria-hidden="true">→</span>',
    'show-card-label':'Mentor rəyi',
    'show-card-quote':'"Reportun strukturu yaxşıdır. IOC bölməsini genişləndir və MITRE xəritəsini əlavə et."',
    'show-card-role': 'Baş SOC Analitiki',
    'ben-eyebrow':    'Niyə Xakker',
    'ben-h2':         'Niyə məktəb deyil, mission workspace.',
    'ben-sub':        'Klassik kursların yerinə, iş yerində istifadə edilən real metodika.',
    'ben1-h3':        'Nəticə yönümlü',
    'ben1-p':         'Hər modulun sonunda hazır portfolio çıxarışı — report, playbook, lab yazısı. CV-yə əlavə edilən aşkar nəticələr.',
    'ben2-h3':        'Yerli bazara uyğun',
    'ben2-p':         'Azərbaycan sənayesinə uyğun ssenarilər — bank, telekommunikasiya, dövlət sektoru təhdid modelləri ilə öyrənmə.',
    'ben3-h3':        'Tələbdə mentor',
    'ben3-p':         'Çıxılmaz vəziyyətdə 24 saat ərzində mentor rəyi. Self-study, amma tək deyil — daim feedback dövrəsi ilə.',
    'ben4-h3':        'Sertifikat & karyeraya uyğun',
    'ben4-p':         'CompTIA, OSCP, CEH, CCSP istiqamətləri ilə uyğunlaşdırılmış roadmap. Hiring partnerləri ilə referral yolu.',
    'proc-eyebrow':   'Necə işləyir',
    'proc-h2':        'Sıfırdan hero-ya, 4 addımda.',
    'proc1-h3':       'Təməl',
    'proc1-p':        'Core networking, Linux, web əsasları və security mindset.',
    'proc2-h3':       'İxtisaslaş',
    'proc2-p':        'Blue team, red team, appsec və ya cloudsec seçimləri.',
    'proc3-h3':       'Canlı missiyalar',
    'proc3-p':        'Vaxt məhdudlu praktika ssenarilər və response tapşırıqları.',
    'proc4-h3':       'Sertifikatlaş',
    'proc4-p':        'Roadmap hazırlığı və portfolio dəstəkli kompetensiya sübutu.',
    'test-eyebrow':   'Rəylər',
    'test-h2':        'Platformu quran öyrənənlərdən.',
    'test1-quote':    '"Red-team əsasları çox daha anlaşılan oldu. Praktik tapşırıqlar gerçək mühitdə işləyən şeylərdir — boş nəzəriyyə deyil."',
    'test1-role':     'SOC Analitiki · PASHA',
    'test2-quote':    '"Mentor rəyi ilə ilk insident reportumu professional səviyyəyə çatdırdım. CV-də fərq yaradan çıxarışlar aldım."',
    'test2-role':     'Blue Team · Kapital',
    'test3-quote':    '"CloudSec path mənim üçün birbaşa production defense məntiqi verdi. Azure və AWS tərəfində gerçək risk modellərini öyrəndim."',
    'test3-role':     'Cloud Mühəndisi · Azercell',
    'faq-eyebrow':    'FAQ',
    'faq-h2':         'Hələ suallarınız var?',
    'faq-sub':        'Platforma, onboarding və mentor axını haqqında ən çox sorulanlar. Cavabı tapmadıqsa bizimlə əlaqə saxlayın.',
    'faq-support':    'Dəstəklə əlaqə',
    'faq1-q':         'Platforma kim üçün uyğundur?',
    'faq1-a':         'Yeni başlayanlardan senior defender-ə qədər bütün səviyyələr üçün yollar var. Onboarding qısa diaqnostika ilə sizə ən uyğun başlanğıcı təklif edir.',
    'faq2-q':         'Sertifikat verilirmi?',
    'faq2-a':         'Bəli. Hər yolun sonunda tamamlama sertifikatı verilir və onlayn yoxlanıla bilən link ilə paylaşıla bilər. Həmçinin OSCP, CompTIA kimi sənaye sertifikatlarına hazırlıq roadmap-i var.',
    'faq3-q':         'Mentor rəyi necə işləyir?',
    'faq3-a':         'Mission təqdim edildikdən sonra 24 saat ərzində senior defender rəyi qaytarır. Video və mətn formatında — konkret, fəaliyyət yönümlü rəy.',
    'faq4-q':         'Laboratoriyalar local kompüterimdə işləyirmi?',
    'faq4-a':         'Xeyr. Bütün laboratoriyalar brauzerdə işləyən izolyasiya edilmiş cloud mühitindədir. Heç nə install etmək lazım deyil.',
    'faq5-q':         'Qiymət nə qədərdir?',
    'faq5-a':         'Starter yol pulsuzdur. Pro və team planlarının detalı pricing səhifəsindədir — istənilən vaxt dəyişdirmək olar.',
    'cta-h2':         'Sadəcə öyrənmə. Bacarıq qazan.',
    'cta-sub':        'Bu gün başlayın — ilk mission 10 dəqiqədə bitir. Kart məlumatı tələb etmir, hesabı istənilən vaxt silə bilərsiniz.',
    'cta-btn1':       'Qeydiyyatdan keç <span class="btn-arrow" aria-hidden="true">→</span>',
    'cta-btn2':       'Platformu gör',
    'footer-tagline': 'Azərbaycan üçün müasir kibertəhlükəsizlik self-study ekosistemi.',
    'footer-col1':    'Platforma',
    'footer-features':'Xüsusiyyətlər',
    'footer-product': 'Məhsul',
    'footer-process': 'Proses',
    'footer-col2':    'Öyrən',
    'footer-docs':    'Sənədlər',
    'footer-resources':'Resurslar',
    'footer-community':'İcma',
    'footer-changelog':'Yeniliklər',
    'footer-col3':    'Şirkət',
    'footer-about':   'Haqqımızda',
    'footer-careers': 'Karyera',
    'footer-legal':   'Hüquqi',
    'footer-contact': 'Əlaqə',
    'footer-newsletter-h':  'Xəbər bülleteni',
    'footer-newsletter-p':  'Yeni missiyalar və alətlər haqqında aylıq yenilik.',
    'footer-newsletter-btn':'Get',
    'footer-copy':    '© 2025 Xakker Studios. Bütün hüquqlar qorunur.',
    'footer-privacy': 'Məxfilik',
    'footer-terms':   'Şərtlər',
    'footer-cookies': 'Cookies',
  },
  en: {
    'nav-platform':   'Platform',
    'nav-product':    'Product',
    'nav-process':    'Process',
    'nav-feedback':   'Feedback',
    'nav-login':      'Login',
    'nav-getstarted': 'Get started',
    'hero-eyebrow':   'Azerbaijan Cyber Security Ecosystem',
    'hero-h1':        'Not theory,\n            <span class="accent">real defense</span>\n            skills.',
    'hero-lede':      'Practical self-study flow in SOC, red team, cloud security, and appsec. Each module is built with real scenarios, mentor feedback, and challenge-based progression.',
    'hero-cta1':      'Go to Platform <span class="btn-arrow" aria-hidden="true">→</span>',
    'hero-cta2':      'See Demo',
    'trust-title':    'Built together with the Azerbaijan tech ecosystem',
    'stat1':          'Active learners',
    'stat2':          'Mission completion',
    'stat3':          'Mentor rating',
    'stat4':          'Live challenges',
    'feat-eyebrow':   'Platform',
    'feat-h2':        'Where to start, how to grow.',
    'feat-sub':       'Everything you need to learn in one place — practical labs, mentor feedback, simulations, and portfolio prep.',
    'feat1-h3':       'Real-world scenarios',
    'feat1-p':        'Learn the real threat model with targeted simulations and role-appropriate assignments.',
    'feat2-h3':       'Expert mentorship',
    'feat2-p':        'Fast, directed progress with mentor review and individual feedback.',
    'feat3-h3':       'Career roadmap',
    'feat3-p':        'Portfolio-oriented tasks and level-by-level progression focused on certification roadmaps.',
    'feat4-h3':       'Hands-on labs',
    'feat4-p':        'Code, scan, investigate in an isolated environment running right in your browser.',
    'feat5-h3':       'Time-boxed missions',
    'feat5-p':        'Live challenge hours — feel the real incident-response tempo.',
    'feat6-h3':       'Community & CTF',
    'feat6-p':        'Team-vs-team challenges and weekly meetups with Azerbaijan teams.',
    'show-eyebrow':   'Product',
    'show-h2':        'The entire defense stack in one workspace.',
    'show-sub':       'Mission briefing, live lab environment, mentor review and report drafting — all on one screen. No context switching, real workflow.',
    'show-li1':       'Guided missions with contextual hints',
    'show-li2':       'Integrated terminal & note-taking',
    'show-li3':       'Automated scoring and mentor escalation',
    'show-li4':       'Exportable incident reports',
    'show-cta':       'Explore the platform <span class="btn-arrow" aria-hidden="true">→</span>',
    'show-card-label':'Mentor feedback',
    'show-card-quote':'"The report structure is good. Expand the IOC section and add the MITRE map."',
    'show-card-role': 'Senior SOC Analyst',
    'ben-eyebrow':    'Why Xakker',
    'ben-h2':         'Why not school, but a mission workspace.',
    'ben-sub':        'Real methodology used in the workplace, instead of classic courses.',
    'ben1-h3':        'Outcome-focused',
    'ben1-p':         'A ready portfolio deliverable at the end of each module — report, playbook, lab write-up. Clear results added to your CV.',
    'ben2-h3':        'Built for local market',
    'ben2-p':         'Scenarios tailored to Azerbaijan industry — banking, telecom, and public sector threat models.',
    'ben3-h3':        'Mentor-on-demand',
    'ben3-p':         'Mentor review within 24 hours when stuck. Self-study but not alone — always with a feedback loop.',
    'ben4-h3':        'Cert & career aligned',
    'ben4-p':         'Roadmap aligned with CompTIA, OSCP, CEH, CCSP directions. Referral path with hiring partners.',
    'proc-eyebrow':   'How it works',
    'proc-h2':        'From zero to hero, in 4 steps.',
    'proc1-h3':       'Foundation',
    'proc1-p':        'Core networking, Linux, web basics and security mindset.',
    'proc2-h3':       'Specialize',
    'proc2-p':        'Choose blue team, red team, appsec or cloud security.',
    'proc3-h3':       'Live missions',
    'proc3-p':        'Time-boxed practice scenarios and response tasks.',
    'proc4-h3':       'Certify',
    'proc4-p':        'Roadmap prep and portfolio-backed competency proof.',
    'test-eyebrow':   'Feedback',
    'test-h2':        'From learners who built the platform.',
    'test1-quote':    '"Red-team fundamentals became much clearer. The practical tasks are things that work in real environments — not empty theory."',
    'test1-role':     'SOC Analyst · PASHA',
    'test2-quote':    '"With mentor feedback I brought my first incident report to a professional level. I got deliverables that make a difference on my CV."',
    'test2-role':     'Blue Team · Kapital',
    'test3-quote':    '"The CloudSec path gave me direct production defense logic. I learned real risk models on the Azure and AWS side."',
    'test3-role':     'Cloud Engineer · Azercell',
    'faq-eyebrow':    'FAQ',
    'faq-h2':         'Still have questions?',
    'faq-sub':        'The most frequently asked questions about the platform, onboarding and mentor flow. Contact us if you can\'t find an answer.',
    'faq-support':    'Contact support',
    'faq1-q':         'Who is the platform suitable for?',
    'faq1-a':         'There are paths for all levels from beginners to senior defenders. Onboarding offers you the most suitable starting point with a short diagnostic.',
    'faq2-q':         'Is a certificate provided?',
    'faq2-a':         'Yes. A completion certificate is issued at the end of each path and can be shared with an online verifiable link. There is also a preparation roadmap for industry certs like OSCP, CompTIA.',
    'faq3-q':         'How does mentor feedback work?',
    'faq3-a':         'After submitting a mission, a senior defender returns a review within 24 hours. In video and text format — concrete, action-oriented feedback.',
    'faq4-q':         'Do the labs work on my local computer?',
    'faq4-a':         'No. All labs run on an isolated cloud environment in the browser. Nothing needs to be installed.',
    'faq5-q':         'How much does it cost?',
    'faq5-a':         'The starter path is free. Details of Pro and team plans are on the pricing page — can be changed at any time.',
    'cta-h2':         'Don\'t just learn. Gain skills.',
    'cta-sub':        'Start today — the first mission takes 10 minutes. No card required, you can delete your account at any time.',
    'cta-btn1':       'Register now <span class="btn-arrow" aria-hidden="true">→</span>',
    'cta-btn2':       'See the platform',
    'footer-tagline': 'Modern cyber security self-study ecosystem for Azerbaijan.',
    'footer-col1':    'Platform',
    'footer-features':'Features',
    'footer-product': 'Product',
    'footer-process': 'Process',
    'footer-col2':    'Learn',
    'footer-docs':    'Docs',
    'footer-resources':'Resources',
    'footer-community':'Community',
    'footer-changelog':'Changelog',
    'footer-col3':    'Company',
    'footer-about':   'About',
    'footer-careers': 'Careers',
    'footer-legal':   'Legal',
    'footer-contact': 'Contact',
    'footer-newsletter-h':  'Newsletter',
    'footer-newsletter-p':  'Monthly updates on new missions and tools.',
    'footer-newsletter-btn':'Go',
    'footer-copy':    '© 2025 Xakker Studios. All rights reserved.',
    'footer-privacy': 'Privacy',
    'footer-terms':   'Terms',
    'footer-cookies': 'Cookies',
  }
};

const HTML_KEYS = new Set([
  'hero-h1', 'hero-cta1', 'show-cta', 'cta-btn1'
]);

function applyLang(lang) {
  document.documentElement.lang = lang;
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!t[key]) return;
    if (HTML_KEYS.has(key)) {
      el.innerHTML = t[key];
    } else {
      el.textContent = t[key];
    }
  });
  const titleAttr = lang === 'az' ? 'data-i18n-title-az' : 'data-i18n-title-en';
  const titleEl = document.querySelector('[data-i18n-title-az]');
  if (titleEl) document.title = titleEl.getAttribute(titleAttr);

  const azLabel = document.querySelector('.lang-az-label');
  const enLabel = document.querySelector('.lang-en-label');
  if (azLabel) azLabel.classList.toggle('is-active', lang === 'az');
  if (enLabel) enLabel.classList.toggle('is-active', lang === 'en');

  localStorage.setItem('xakker-lang', lang);
}

const langToggleBtn = document.getElementById('lang-toggle');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.lang || 'az';
    applyLang(current === 'az' ? 'en' : 'az');
  });
}

const savedLang = localStorage.getItem('xakker-lang') || 'az';
applyLang(savedLang);

/* Mobile nav toggle */
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");
if (navToggle && mobileNav) {
  const openMenu = () => {
    header.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeMenu = () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  navToggle.addEventListener("click", () => {
    header.classList.contains("nav-open") ? closeMenu() : openMenu();
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}
