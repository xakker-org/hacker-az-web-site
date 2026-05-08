import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContainerScroll } from "../components/ContainerScroll";
import { useScrollReveal } from "../utils/useScrollReveal";
import "../styles/landing.css";

const COURSES = [
  { icon: "⚔️", title: "Ethical Hacking", difficulty: "medium", desc: "Offensive security techniques used by top red teams." },
  { icon: "🌐", title: "Web Pentesting", difficulty: "medium", desc: "Master OWASP Top 10 and modern web vulnerability chains." },
  { icon: "📊", title: "SOC Analyst", difficulty: "easy",   desc: "Threat detection, SIEM workflows, incident triage." },
  { icon: "☁️", title: "Cloud Security", difficulty: "hard",  desc: "AWS/GCP/Azure misconfigurations, IAM exploitation." },
  { icon: "🦠", title: "Malware Analysis", difficulty: "hard",  desc: "Static and dynamic analysis, reverse engineering." },
  { icon: "🔎", title: "OSINT Mastery", difficulty: "easy",   desc: "Open-source intelligence gathering and recon." },
];

const FEATURES = [
  { icon: "🎯", title: "Red Team Training", desc: "Hands-on offensive labs covering exploitation, lateral movement, and C2 frameworks." },
  { icon: "🛡️", title: "Blue Team Defense", desc: "SIEM, EDR, and incident response workflows pulled from real SOC environments." },
  { icon: "💻", title: "Self-Study Labs", desc: "Isolated browser-based VMs — no local setup, spin up in 30 seconds." },
];

const TESTIMONIALS = [
  { name: "Anar Həsənov", role: "SOC Lead", co: "AzərEnergy", text: "Xakker-in praktik lab yanaşması məni kağız sertifikatdan real mütəxəssisə çevirdi. Başqa heç bir platforma bunun yanına belə gəlmir." },
  { name: "Leyla Əlizadə", role: "Red Team Lead", co: "SecureNet", text: "Azərbaycanlı insan kimi öz dilinizdə, öz ssenarilərinizlə, real mühitdə çalışmaq — bu fərq böyükdür." },
  { name: "Ramin İsmayılov", role: "Pentest Engineer", co: "CyberGuard", text: "Mission sistemi çox düşünülmüş qurulub. Nəzəriyyə yox, real defense. Komandama da tövsiyə etdim." },
];

const STATS = [
  { value: "10K+",  label: "Aktiv istifadəçi" },
  { value: "250+",  label: "Hands-on lab" },
  { value: "95%",   label: "Məmnuniyyət" },
  { value: "24/7",  label: "Lab erişimi" },
];

const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Insane" };

function DiffBadge({ d }) {
  return <span className={`xk-diff xk-diff-${d}`}>{DIFF_LABEL[d] || d}</span>;
}

export default function LandingPage() {
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");
  useScrollReveal();

  return (
    <div className="lp">
      {/* ── Floating pill navbar ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-logo" onClick={e => e.preventDefault()}>
          <img
            src={logoSrc}
            alt="Xakker"
            onError={() => setLogoSrc("/static/logo/logoXakker.png")}
          />
        </Link>

        <ul className="lp-nav-links">
          <li><a href="#features" className="lp-nav-link">Xüsusiyyətlər</a></li>
          <li><a href="#courses"  className="lp-nav-link">Kurslar</a></li>
          <li><a href="#paths"    className="lp-nav-link">Yollar</a></li>
          <li><a href="#pricing"  className="lp-nav-link">Qiymət</a></li>
        </ul>

        <div className="lp-nav-actions">
          <Link to="/auth/login"    className="lp-btn lp-btn-ghost">Daxil ol</Link>
          <Link to="/auth/register" className="lp-btn lp-btn-primary">Başla →</Link>
        </div>
      </nav>

      {/* ── ContainerScroll hero + 3D mockup ── */}
      <ContainerScroll
        titleComponent={
          <div className="cs-title">
            <span className="cs-kicker">Xakker Self Study Platform</span>
            <h1>
              Kibertəhlükəsizlik{" "}
              <span className="text-gradient">bacarığı qazan.</span>
            </h1>
            <p>
              SOC, red team, cloud security və appsec üzrə praktik self-study axını.
              Hər modul real ssenari, mentor rəyi və challenge əsaslı irəliləmə ilə qurulub.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/auth/register" className="lp-btn lp-btn-primary lp-btn-lg">
                Platformaya keç →
              </Link>
              <a href="#features" className="lp-btn lp-btn-outline lp-btn-lg">
                Necə işləyir?
              </a>
            </div>
          </div>
        }
      >
        {/* ── Dashboard mockup inside the 3D card ── */}
        <div className="mock-browser-bar">
          <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
          <span className="mock-url">xakker.org / dashboard</span>
        </div>
        <div className="mock-body">
          <div className="mock-sidebar">
            <div className="mock-logo">X</div>
            {["Dashboard","Missions","Labs","Reports","Mentor"].map((l, i) => (
              <div key={l} className={`mock-nav-item${i === 0 ? " active" : ""}`}>
                <span className="mock-nav-dot" />{l}
              </div>
            ))}
          </div>
          <div className="mock-main">
            <div className="mock-mission-label">Current Mission</div>
            <div className="mock-mission-title">
              <h3>Incident Response · Tier 2</h3>
              <span className="mock-live-badge">LIVE</span>
            </div>
            <div className="mock-cards">
              <div className="mock-card">
                <div className="mock-card-label">Threat Level</div>
                <div className="mock-gauge-wrap">
                  <div className="mock-gauge">
                    <span className="mock-gauge-val">76<span style={{ fontSize: 10 }}>%</span></span>
                  </div>
                </div>
              </div>
              <div className="mock-card">
                <div className="mock-card-label">Defender Feed</div>
                <div className="mock-feed">
                  {["12:04 Anomaly from 10.0.4.18","12:07 Sandbox detonation queued","12:11 Mentor review requested","12:15 Report draft v2 saved"].map(e => (
                    <div key={e} className="mock-feed-item">
                      <span className="mock-feed-time">{e.slice(0,5)}</span> {e.slice(6)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mock-card">
                <div className="mock-card-label">Next Lab</div>
                <div className="mock-next-title">Lateral movement</div>
                <div className="mock-progress-bar"><div className="mock-progress-fill" /></div>
                <div className="mock-step-label">Step 4 of 7</div>
              </div>
              <div className="mock-card">
                <div className="mock-card-label">Skills Unlocked</div>
                <div className="mock-skills">
                  {["SIEM","EDR","OSINT","IR Playbooks"].map(s => (
                    <span key={s} className="mock-skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* ── Trusted by ── */}
      <div className="lp-trusted xk-reveal">
        <p className="lp-trusted-label">Peşəkarlar tərəfindən istifadə edilir</p>
        <div className="lp-trusted-logos">
          {["Accenture","Microsoft","Google","Amazon","Cisco","IBM"].map(b => (
            <span key={b} className="lp-trusted-logo">{b}</span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="lp-stats-row">
          {STATS.map(s => (
            <div key={s.label} className="lp-stat">
              <div className="lp-stat-value">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div style={{ marginBottom: 40 }}>
          <div className="lp-section-label">Niyə Xakker?</div>
          <h2 className="lp-section-title">Real müdafiə üçün real hazırlıq</h2>
          <p className="lp-section-sub">
            Hər modul praktik ssenari, izlənilə bilən irəliləyiş və mentor rəyi ilə qurulub.
          </p>
        </div>

        <div className="lp-features-wrap">
          <div className="lp-features-left">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="lp-features-right">
            <div className="lp-feature-card featured">
              <div className="lp-feature-icon" style={{ background: "rgba(76,124,255,0.10)" }}>🔐</div>
              <div className="lp-feature-title">Azərbaycan üçün qurulub</div>
              <div className="lp-feature-desc">
                Azərbaycan dilli kontentsiz, real müəssisə ssenariləri, yerli standartlara uyğun
                modullar — platformamız sizin kontekstiniz üçün düşünülüb.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 48 }}>
          <div className="lp-section-label">Proses</div>
          <h2 className="lp-section-title">Üç addımda irəliləyiş</h2>
        </div>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-title">Yolu seç</div>
            <div className="lp-step-desc">Red Team, Blue Team yaxud hibrid bir izlə. Hər yolun öz mission sırası, lab mühiti və çatışdırma nöqtələri var.</div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-title">Missiyaları tamamla</div>
            <div className="lp-step-desc">Hər mission nəzəriyyədən başlayıb real lab sessiyası ilə bitir. İrəliləyiş avtomatik izlənilir, XP toplanır.</div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-title">Sertifikat al</div>
            <div className="lp-step-desc">Final imtahanı keçdikdən sonra sertifikatınız hazırlanır — LinkedIn-ə əlavə oluna bilən, doğrulanmış format.</div>
          </div>
        </div>
      </section>

      {/* ── Courses ── */}
      <section id="courses" className="lp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="lp-section-label">Kurslar</div>
          <h2 className="lp-section-title">Premium tədris proqramları</h2>
          <p className="lp-section-sub">Sənayenin standartlarına uyğun hazırlanmış, karyera yüksəlişinə yönəlmiş modullar.</p>
        </div>
        <div className="lp-courses-grid">
          {COURSES.map(c => (
            <div key={c.title} className="lp-course-card">
              <div className="lp-course-header">
                <span className="lp-course-icon">{c.icon}</span>
                <DiffBadge d={c.difficulty} />
              </div>
              <div className="lp-course-title">{c.title}</div>
              <div className="lp-course-desc">{c.desc}</div>
              <Link to="/auth/register" className="lp-course-link">
                Kəşf et <span className="lp-arrow">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Paths ── */}
      <section id="paths" className="lp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="lp-section-label">Yollar</div>
          <h2 className="lp-section-title">Red, yoxsa Blue?</h2>
          <p className="lp-section-sub">Hücum tərəfini, müdafiə tərəfini, yaxud hər ikisini seçin.</p>
        </div>
        <div className="lp-paths-grid">
          <div className="lp-path-card red-team">
            <span className="lp-path-tag">Red Team</span>
            <div className="lp-path-title">Hücum Mütəxəssisi</div>
            <ul className="lp-path-list">
              {["Penetration Testing","Social Engineering","Exploit Development","Vulnerability Research","Reconnaissance & OSINT"].map(i => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <Link to="/auth/register" className="lp-btn lp-btn-primary" style={{ width: "fit-content" }}>
              Red Team başla →
            </Link>
          </div>
          <div className="lp-path-card blue-team">
            <span className="lp-path-tag">Blue Team</span>
            <div className="lp-path-title">Müdafiə Mütəxəssisi</div>
            <ul className="lp-path-list">
              {["Incident Response","Threat Detection & SIEM","Security Operations","System Hardening","Compliance & GRC"].map(i => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <Link to="/auth/register" className="lp-btn lp-btn-outline" style={{ width: "fit-content", border: "1px solid rgba(76,124,255,0.4)", color: "var(--blue)" }}>
              Blue Team başla →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="lp-section-label">İstifadəçilər</div>
          <h2 className="lp-section-title">Peşəkarlar nə deyir?</h2>
        </div>
        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="lp-testimonial">
              <p className="lp-testimonial-text">"{t.text}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">{t.name[0]}</div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role} · {t.co}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="lp-section-label">Qiymət</div>
          <h2 className="lp-section-title">Şəffaf qiymətləndirmə</h2>
          <p className="lp-section-sub">Öyrənmə məqsədinizə uyğun planı seçin. İstənilən vaxt dəyişdirin.</p>
        </div>
        <div className="lp-pricing-grid">
          {[
            { name: "Starter", amount: "29", period: "/ay", desc: "Başlayanlar üçün", features: ["50+ Kurs","Əsas Lablar","İcma Girişi"], noFeatures: ["Sertifikat"] },
            { name: "Pro", amount: "99", period: "/ay", desc: "Ciddi öyrənənlər üçün", features: ["Bütün Starter funksiyaları","250+ Lab","Ekspert Dəstəyi","Sertifikatlar"], noFeatures: [], featured: true },
            { name: "Elite", amount: "299", period: "/ay", desc: "Peşəkar komandalar üçün", features: ["Bütün Pro funksiyaları","1-1 Mentorluq","Xüsusi Yollar","Şəxsi Lablar"], noFeatures: [] },
          ].map(p => (
            <div key={p.name} className={`lp-pricing-card${p.featured ? " featured" : ""}`} style={{ position: "relative" }}>
              {p.featured && <div className="lp-pricing-badge">Ən Populyar</div>}
              <div className="lp-pricing-name">{p.name}</div>
              <div className="lp-pricing-price">
                <span className="lp-pricing-amount">${p.amount}</span>
                <span className="lp-pricing-period">{p.period}</span>
              </div>
              <p className="lp-pricing-desc">{p.desc}</p>
              <ul className="lp-pricing-features">
                {p.features.map(f => <li key={f}>{f}</li>)}
                {p.noFeatures.map(f => <li key={f} className="no">{f}</li>)}
              </ul>
              <Link
                to="/auth/register"
                className={`lp-btn lp-btn-lg lp-pricing-cta${p.featured ? " lp-btn-primary" : " lp-btn-outline"}`}
              >
                {p.featured ? "Pro-ya başla" : "Başla"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section-sm">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="lp-section-label">FAQ</div>
          <h2 className="lp-section-title">Tez-tez soruşulan suallar</h2>
        </div>
        <div className="lp-faq">
          {[
            { q: "Xakker-ə necə başlayım?", a: "Pulsuz hesab yaradın, öyrənmə yolunuzu seçin (Red Team, Blue Team və ya Ümumi) və başlanğıc kurslarla başlayın. Bütün yeni istifadəçilər 7 günlük pulsuz sınaq alır." },
            { q: "Lablar real dünyaya uyğundurmu?", a: "Bəli. Bütün lablar real kibertəhlükəsizlik ssenariləri ilə qurulub. Real alətlər, həssas tətbiqlər və real hücum/müdafiə vəziyyətləri ilə işləyəcəksiniz." },
            { q: "Sertifikat alacağammı?", a: "Pro və Elite planlar kurs tamamlandıqdan sonra sertifikat verir. Bu sertifikatlar sənaye tərəfindən tanınır və LinkedIn prifilinizə əlavə edilə bilər." },
            { q: "Texniki dəstəyə ehtiyacım olsa nə etməliyəm?", a: "Bütün ödənişli planlar e-poçt dəstəyi daxildir. Pro və Elite üzvlər prioritet dəstək və ekspertlərimizlə ofis saatlarına çıxış əldə edir." },
          ].map(({ q, a }) => (
            <details key={q} className="lp-faq-item">
              <summary className="lp-faq-summary">
                {q}
                <span className="lp-faq-icon">+</span>
              </summary>
              <p className="lp-faq-body">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <div className="lp-cta">
        <div className="lp-cta-glow" />
        <h2>Kibertəhlükəsizliyi<br />mənimsəməyə hazırsınız?</h2>
        <p>Minlərlə peşəkarla birlikdə Xakker-də elit bacarıqlar qazanın.</p>
        <div className="lp-cta-actions">
          <Link to="/auth/register" className="lp-btn lp-btn-primary lp-btn-lg">
            Pulsuz başla →
          </Link>
          <Link to="/auth/login" className="lp-text-link">
            Artıq hesabım var <span className="lp-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <img
              src={logoSrc}
              alt="Xakker"
              onError={() => setLogoSrc("/static/logo/logoXakker.png")}
            />
            <p className="lp-footer-tagline">
              Azərbaycanın kibertəhlükəsizlik öyrənmə platforması.
            </p>
          </div>
          <div>
            <div className="lp-footer-col-title">Məhsul</div>
            <ul className="lp-footer-links">
              <li><a href="#features">Xüsusiyyətlər</a></li>
              <li><a href="#courses">Kurslar</a></li>
              <li><a href="#pricing">Qiymət</a></li>
            </ul>
          </div>
          <div>
            <div className="lp-footer-col-title">Şirkət</div>
            <ul className="lp-footer-links">
              <li><a href="#paths">Haqqımızda</a></li>
              <li><a href="#paths">Blog</a></li>
              <li><a href="#paths">Karyera</a></li>
            </ul>
          </div>
          <div>
            <div className="lp-footer-col-title">Hüquqi</div>
            <ul className="lp-footer-links">
              <li><a href="#faq">Gizlilik</a></li>
              <li><a href="#faq">Şərtlər</a></li>
              <li><a href="#faq">Əlaqə</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 Xakker. Bütün hüquqlar qorunur.</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--t3)" }}>
            Precision Dark v4
          </span>
        </div>
      </div>
    </div>
  );
}
