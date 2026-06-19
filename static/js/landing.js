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

  document.querySelectorAll('.lang-az-label, .lang-az-label-mob').forEach(el => {
    el.classList.toggle('is-active', lang === 'az');
  });
  document.querySelectorAll('.lang-en-label, .lang-en-label-mob').forEach(el => {
    el.classList.toggle('is-active', lang === 'en');
  });

  localStorage.setItem('xakker-lang', lang);
}

const langToggleBtn = document.getElementById('lang-toggle');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.lang || 'az';
    applyLang(current === 'az' ? 'en' : 'az');
  });
}

const langToggleMob = document.getElementById('lang-toggle-mob');
if (langToggleMob) {
  langToggleMob.addEventListener('click', () => {
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

/* ============================================================
   GSAP + ScrollTrigger + Three.js Globe
   ============================================================ */
(function () {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Panel-0 cs-card tilt → Panels 1-3 horizontal scroll ──── */
  (function () {
    var section = document.getElementById('hscroll-section');
    var sticky  = document.getElementById('hscroll-sticky');
    var track   = document.getElementById('hscroll-track');
    var csCard  = document.getElementById('cs-card');
    if (!section || !sticky || !track || !csCard) return;

    if (window.matchMedia('(max-width: 768px)').matches) {
      section.parentNode.removeChild(section);
      return;
    }

    window.addEventListener('resize', function () {
      if (window.innerWidth <= 768 && section.parentNode) {
        var st = ScrollTrigger.getById('hscroll-pin');
        if (st) st.kill();
        section.parentNode.removeChild(section);
      }
    }, { passive: true });

    gsap.set(csCard, { rotateX: 20, scale: 1.05, transformOrigin: '50% 0%' });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(csCard, { rotateX: 0, scale: 1 });
      return;
    }

    /* Proportional durations: tilt gets 60 vh, horizontal gets 3×vw of scroll */
    var tiltPx  = window.innerHeight * 0.6;
    var horizPx = track.scrollWidth - window.innerWidth;

    var tl = gsap.timeline({
      scrollTrigger: {
        id: 'hscroll-pin',
        trigger: section,
        start: 'top top',
        end: function () {
          return '+=' + ((window.innerHeight * 0.6 + track.scrollWidth - window.innerWidth) * 1.8);
        },
        pin: sticky,
        scrub: 1.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    /* Phase 1 — grows and flattens into final centered position */
    tl.to(csCard, { rotateX: 0, scale: 1, ease: 'none', duration: tiltPx });

    /* Phase 2 — page slides RIGHT through panels 1, 2, 3 */
    tl.to(track, {
      x: function () { return -(track.scrollWidth - window.innerWidth); },
      ease: 'none',
      duration: horizPx,
    });
  }());

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero entrance ────────────────────────────────────────── */
  if (!reduced) {
    const heroItems = document.querySelectorAll('.hero-item');
    const globeWrap = document.querySelector('.hero-globe-wrap');

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroItems.length) {
      heroTl.to(heroItems, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.13,
      });
    }

    if (globeWrap) {
      heroTl.to(globeWrap, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
      }, 0.1);
    }
  } else {
    document.querySelectorAll('.hero-item').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    const gw = document.querySelector('.hero-globe-wrap');
    if (gw) { gw.style.opacity = 1; gw.style.transform = 'none'; }
  }

  /* ── Feature cards stagger ────────────────────────────────── */
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length && !reduced) {
    gsap.fromTo(featureCards,
      { opacity: 0, y: 55, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.65, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.feature-grid',
          start: 'top 78%',
          once: true,
        },
      }
    );
  }

  /* ── Process steps stagger ────────────────────────────────── */
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length && !reduced) {
    gsap.fromTo(processSteps,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.7, stagger: 0.13, ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: '.process-grid',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }

  /* ── Benefit cards alternating ────────────────────────────── */
  const benefitCards = document.querySelectorAll('.benefit-card');
  if (benefitCards.length && !reduced) {
    benefitCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 82%',
            once: true,
          },
        }
      );
    });
  }

  /* ── Testimonial cards: left / bottom / right ─────────────── */
  const testCards = document.querySelectorAll('.testimonial-card');
  if (testCards.length === 3 && !reduced) {
    const origins = [
      { x: -70, y: 0 },
      { x: 0,   y: 60 },
      { x: 70,  y: 0 },
    ];
    testCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: origins[i].x, y: origins[i].y },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.8, ease: 'power2.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: '.testimonial-grid',
            start: 'top 78%',
            once: true,
          },
        }
      );
    });
  }

  /* ── FAQ items stagger ────────────────────────────────────── */
  const faqItems2 = document.querySelectorAll('.faq-item');
  if (faqItems2.length && !reduced) {
    gsap.fromTo(faqItems2,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.55, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }

  /* ── hscroll cards reveal then GSAP-driven horizontal ──────── */
  const htrack = document.getElementById('hscroll-track');
  const hCards = htrack ? htrack.querySelectorAll('.hscroll-card') : [];

  if (htrack && hCards.length && !reduced) {
    /* Reveal cards on scroll entry */
    gsap.to(hCards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.09,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: htrack.parentElement,
        start: 'top 75%',
        once: true,
      },
    });

    /* Horizontal scrub */
    const maxShift = () => htrack.scrollWidth - htrack.parentElement.offsetWidth - 80;

    ScrollTrigger.create({
      trigger: htrack.closest('.hscroll-section'),
      start: 'top 50%',
      end: () => '+=' + (maxShift() + 200),
      scrub: 1.4,
      pin: false,
      onUpdate: (self) => {
        const shift = self.progress * maxShift();
        gsap.set(htrack, { x: -shift });
      },
    });
  } else if (hCards.length) {
    hCards.forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; });
  }

  /* ── Stats counter ────────────────────────────────────────── */
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length && !reduced) {
    ScrollTrigger.create({
      trigger: '.trust-stats',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        statValues.forEach(el => {
          const text = el.textContent.trim();
          const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
          const suffix = text.replace(/[0-9.]/g, '').trim();
          if (!isNaN(num)) {
            gsap.fromTo({ val: 0 }, { val: num },
              {
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: function () {
                  const v = Math.round(this.targets()[0].val * 10) / 10;
                  el.textContent = (Number.isInteger(num) ? Math.round(v) : v) + suffix;
                },
              }
            );
          }
        });
      },
    });
  }

  /* ============================================================
     THREE.JS — Real World Dot-Matrix Globe (TopoJSON land mask)
     ============================================================ */
  var canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  function getSize() {
    var w = canvas.offsetWidth  || (canvas.parentElement ? canvas.parentElement.offsetWidth : 0) || 520;
    var h = canvas.offsetHeight || w;
    return { w: w || 520, h: h || 520 };
  }
  var sz = getSize();

  /* ── Scene / Camera ── */
  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, sz.w / sz.h, 0.1, 100);
  camera.position.set(0, 0, 2.75);

  /* ── Renderer ── */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(sz.w, sz.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* ── Shared helpers ── */
  function latlon2v3(lat, lon, radius) {
    var phi   = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
       radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function makePoints(positions, color, size, opacity) {
    var arr = new Float32Array(positions.length * 3);
    positions.forEach(function(v, i) { arr[i*3]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z; });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return new THREE.Points(geo,
      new THREE.PointsMaterial({ color:color, size:size, transparent:true, opacity:opacity, sizeAttenuation:true })
    );
  }

  /* ── Globe group (populated after land mask loads) ── */
  /* ── Globe group ── */
  var globeGroup = new THREE.Group();
  scene.add(globeGroup);

  /* ── City coords [lat, lon] ── */
  var CITIES = [
    [51.5,-0.1],[40.7,-74],[35.7,139.7],[48.9,2.3],[55.8,37.6],
    [39.9,116.4],[-33.9,151.2],[19.1,72.9],[1.3,103.8],[25.2,55.3],
    [37.6,-122.4],[43.7,-79.4],[52.5,13.4],[41.0,29.0],[34.0,-118.2],
    [-23.5,-46.6],[31.2,121.5],[40.4,-3.7],[50.4,30.5],[40.2,49.9],
    [-1.3,36.8],[30.0,31.2],[59.9,10.7],[47.4,19.1],[6.5,3.4]
  ];

  /* ──────────────────────────────────────────────────────────────
     STEP 1 — Decode TopoJSON delta-encoded arcs → lon/lat rings
     ────────────────────────────────────────────────────────────── */
  function decodeTopo(topo) {
    var sc = topo.transform.scale;
    var tr = topo.transform.translate;

    var decoded = topo.arcs.map(function(arc) {
      var x = 0, y = 0;
      return arc.map(function(d) {
        x += d[0]; y += d[1];
        return [x * sc[0] + tr[0], y * sc[1] + tr[1]]; /* [lon, lat] */
      });
    });

    function getArc(ref) {
      return ref < 0 ? decoded[~ref].slice().reverse() : decoded[ref].slice();
    }

    var rings = [];
    topo.objects.land.geometries.forEach(function(geom) {
      var polys = geom.type === 'Polygon'      ? [geom.arcs]
                : geom.type === 'MultiPolygon' ?  geom.arcs : [];
      polys.forEach(function(poly) {
        poly.forEach(function(arcRefs, ri) {
          var pts = [];
          arcRefs.forEach(function(ref) { pts = pts.concat(getArc(ref)); });
          if (pts.length < 3) return;
          rings.push({ pts: pts, hole: ri > 0 });
        });
      });
    });
    return rings;
  }

  /* ──────────────────────────────────────────────────────────────
     STEP 2 — Rasterise all rings onto an offscreen canvas.
     All rings go into ONE path → fill('evenodd') automatically
     handles inner rings (lakes, Caspian Sea, Hudson Bay, etc.)
     as holes. Antimeridian-safe: any edge with |Δlon|>170 closes
     the current subpath and starts a new one.
     ────────────────────────────────────────────────────────────── */
  function rasterizeLand(rings, W, H) {
    var oc  = document.createElement('canvas');
    oc.width = W; oc.height = H;
    var ctx = oc.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';

    ctx.beginPath();
    rings.forEach(function(ring) {
      var pts = ring.pts;
      if (pts.length < 3) return;
      var prevLon = null, newSub = true;
      for (var i = 0; i < pts.length; i++) {
        var lon = pts[i][0], lat = pts[i][1];
        /* Detect antimeridian crossing → close subpath, start fresh */
        if (prevLon !== null && Math.abs(lon - prevLon) > 170) {
          ctx.closePath();
          newSub = true;
        }
        var px = ((lon + 180) / 360) * W;
        var py = ((90 - lat)  / 180) * H;
        if (newSub) { ctx.moveTo(px, py); newSub = false; }
        else        { ctx.lineTo(px, py); }
        prevLon = lon;
      }
      ctx.closePath();
    });
    ctx.fill('evenodd');
    return ctx;
  }

  /* ──────────────────────────────────────────────────────────────
     STEP 3 — Sample canvas pixels → Three.js dot positions
     ────────────────────────────────────────────────────────────── */
  function buildDots(maskCtx, maskW, maskH) {
    var imgData = maskCtx.getImageData(0, 0, maskW, maskH).data;

    function isLand(lat, lon) {
      var x = Math.round(((lon + 180) / 360) * (maskW - 1));
      var y = Math.round(((90 - lat)  / 180) * (maskH - 1));
      x = Math.max(0, Math.min(maskW - 1, x));
      y = Math.max(0, Math.min(maskH - 1, y));
      return imgData[(y * maskW + x) * 4] > 128; /* red channel: white=land */
    }

    var landPos = [], oceanPos = [];
    var ROWS = 200;
    for (var row = 0; row < ROWS; row++) {
      var lat = 90 - (row + 0.5) * (180 / ROWS);
      var cols = Math.max(4, Math.round(ROWS * 2 * Math.cos(lat * Math.PI / 180)));
      for (var col = 0; col < cols; col++) {
        var lon = -180 + (col + 0.5) * (360 / cols);
        if (isLand(lat, lon)) {
          landPos.push(latlon2v3(lat, lon, 1.0));
        } else if (Math.random() < 0.016) {
          oceanPos.push(latlon2v3(lat, lon, 1.0));
        }
      }
    }
    return { land: landPos, ocean: oceanPos };
  }

  /* ──────────────────────────────────────────────────────────────
     STEP 4 — Assemble Three.js objects
     ────────────────────────────────────────────────────────────── */
  function buildScene(dots) {
    /* Land dots — vivid red */
    globeGroup.add(makePoints(dots.land,  0xff2442, 0.017, 0.94));
    /* Ocean dots — very dark, barely visible */
    globeGroup.add(makePoints(dots.ocean, 0x7a0d1e, 0.007, 0.22));

    /* Ghost wireframe sphere underneath dots */
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.999, 48, 24),
      new THREE.MeshBasicMaterial({ color: 0xff2442, wireframe: true, transparent: true, opacity: 0.025 })
    ));

    /* City nodes */
    var nodes = CITIES.map(function(ll) { return latlon2v3(ll[0], ll[1], 1.014); });
    var nGeo  = new THREE.SphereGeometry(0.013, 8, 8);
    var nodeMeshes = nodes.map(function(pos, i) {
      var mat  = new THREE.MeshBasicMaterial({ color: 0xff5577, transparent: true, opacity: 0.95 });
      var mesh = new THREE.Mesh(nGeo, mat);
      mesh.position.copy(pos);
      mesh._phase = i * 0.618;
      globeGroup.add(mesh);
      return mesh;
    });

    /* Connection lines between nearby cities */
    var lp = [];
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        if (nodes[a].distanceTo(nodes[b]) < 1.10) {
          lp.push(nodes[a].clone(), nodes[b].clone());
        }
      }
    }
    if (lp.length) {
      globeGroup.add(new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(lp),
        new THREE.LineBasicMaterial({ color: 0xff2442, transparent: true, opacity: 0.15 })
      ));
    }

    /* Ping / sonar rings */
    var pingIdx = [0, 3, 7, 12, 19];
    var pingData = pingIdx.map(function(idx, j) {
      var rg = new THREE.RingGeometry(0.013, 0.025, 32);
      var rm = new THREE.MeshBasicMaterial({ color: 0xff2442, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
      var ring = new THREE.Mesh(rg, rm);
      ring.position.copy(nodes[idx]);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), nodes[idx].clone().normalize());
      ring._phase = j * 0.85;
      globeGroup.add(ring);
      return ring;
    });

    return { nodeMeshes: nodeMeshes, pingData: pingData };
  }

  /* ── Atmosphere layers ── */
  [
    [1.08, 0xff1a33, 0.09],
    [1.16, 0xff0022, 0.035],
    [1.26, 0x220006, 0.018]
  ].forEach(function(l) {
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(l[0], 32, 32),
      new THREE.MeshBasicMaterial({ color: l[1], transparent: true, opacity: l[2], side: THREE.BackSide })
    ));
  });

  /* ── Star field ── */
  (function() {
    var arr = new Float32Array(900 * 3);
    for (var i = 0; i < 900; i++) {
      var r  = 4 + Math.random() * 2;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      arr[i*3]   = r * Math.sin(ph) * Math.cos(th);
      arr[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      arr[i*3+2] = r * Math.cos(ph);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    scene.add(new THREE.Points(g,
      new THREE.PointsMaterial({ size: 0.005, color: 0xffffff, transparent: true, opacity: 0.45 })
    ));
  }());

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.10));
  var pl = new THREE.PointLight(0xff2442, 1.8, 10);
  pl.position.set(2.5, 1.5, 2);
  scene.add(pl);

  /* ── Mouse / touch drag with inertia ── */
  var isDragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0;
  function pDown(e) {
    isDragging = true; velX = velY = 0;
    lastX = e.touches ? e.touches[0].clientX : e.clientX;
    lastY = e.touches ? e.touches[0].clientY : e.clientY;
  }
  function pMove(e) {
    if (!isDragging) return;
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    velX = (cx - lastX) * 0.005; velY = (cy - lastY) * 0.003;
    globeGroup.rotation.y += velX;
    globeGroup.rotation.x = Math.max(-0.9, Math.min(0.9, globeGroup.rotation.x + velY));
    lastX = cx; lastY = cy;
  }
  function pUp() { isDragging = false; }
  canvas.addEventListener('mousedown',  pDown);
  canvas.addEventListener('touchstart', pDown, { passive: true });
  window.addEventListener('mousemove',  pMove);
  window.addEventListener('touchmove',  pMove, { passive: true });
  window.addEventListener('mouseup',    pUp);
  window.addEventListener('touchend',   pUp);

  /* ── Animation loop ── */
  var startTime = Date.now();
  var animId;
  var refs = { nodeMeshes: [], pingData: [] };

  function animate() {
    animId = requestAnimationFrame(animate);
    var t = (Date.now() - startTime) / 1000;

    if (!isDragging) {
      globeGroup.rotation.y += 0.00095 + velX * 0.93;
      velX *= 0.93; velY *= 0.93;
    }

    refs.nodeMeshes.forEach(function(m) {
      m.material.opacity = 0.40 + 0.60 * (0.5 + 0.5 * Math.sin(t * 2.2 + m._phase));
    });
    refs.pingData.forEach(function(ring) {
      var c = ((t * 0.60 + ring._phase) % 3.0) / 3.0;
      ring.scale.setScalar(1 + c * 4.5);
      ring.material.opacity = (1 - c) * 0.85;
    });

    pl.intensity = 1.6 + 0.45 * Math.sin(t * 1.3);
    renderer.render(scene, camera);
  }

  animate();

  /* ── Load TopoJSON → canvas rasterize → dots ── */
  function processTopoJSON(topo) {
    var MW = 1440, MH = 720; /* high-res mask canvas */
    var rings  = decodeTopo(topo);
    var maskCtx = rasterizeLand(rings, MW, MH);
    var dots   = buildDots(maskCtx, MW, MH);
    var r      = buildScene(dots);
    refs.nodeMeshes = r.nodeMeshes;
    refs.pingData   = r.pingData;
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json')
    .then(function(r) {
      if (!r.ok) throw new Error('cdn');
      return r.json();
    })
    .then(processTopoJSON)
    .catch(function() {
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')
        .then(function(r) { return r.json(); })
        .then(processTopoJSON)
        .catch(function() { /* silent fail — globe shows without dots */ });
    });

  /* ── Resize ── */
  function onResize() {
    var ns = getSize();
    if (!ns.w || !ns.h) return;
    camera.aspect = ns.w / ns.h;
    camera.updateProjectionMatrix();
    renderer.setSize(ns.w, ns.h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ── Pause off-screen ── */
  var globeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { if (!animId) animate(); }
      else { cancelAnimationFrame(animId); animId = null; }
    });
  }, { threshold: 0 });
  globeObserver.observe(canvas);

})();

/* ============================================================
   GLOBE SECTION — cinematic reveal
   ============================================================ */
(function () {
  if (typeof gsap === 'undefined') return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var gsHeader  = document.querySelector('.gs-header');
  var gsGlobe   = document.querySelector('.gs-globe-wrap');
  var gsFooter  = document.querySelector('.gs-footer');
  var gsBadges  = document.querySelectorAll('.gs-badge');

  if (gsHeader) {
    gsap.fromTo(gsHeader,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.globe-section', start: 'top 78%', once: true } }
    );
  }
  if (gsGlobe) {
    gsap.fromTo(gsGlobe,
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.globe-section', start: 'top 75%', once: true } }
    );
  }
  if (gsBadges.length) {
    gsap.fromTo(gsBadges,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.globe-section', start: 'top 65%', once: true } }
    );
  }
  if (gsFooter) {
    gsap.fromTo(gsFooter,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.globe-section', start: 'top 55%', once: true } }
    );
  }
})();
