import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoError = () => {
    setLogoSrc("/static/logo/xakkerLogoWhite2.png");
  };

  const courses = [
    {
      id: 1,
      icon: "⚔️",
      title: "Ethical Hacking",
      difficulty: "Intermediate",
      description: "Learn offensive security techniques from industry experts.",
    },
    {
      id: 2,
      icon: "🔍",
      title: "Web Pentesting",
      difficulty: "Intermediate",
      description: "Master web application security and vulnerability assessment.",
    },
    {
      id: 3,
      icon: "📊",
      title: "SOC Analyst",
      difficulty: "Beginner",
      description: "Become a Security Operations Center analyst.",
    },
    {
      id: 4,
      icon: "🌐",
      title: "Network Security",
      difficulty: "Advanced",
      description: "Secure networks at every layer of the stack.",
    },
    {
      id: 5,
      icon: "🦠",
      title: "Malware Analysis",
      difficulty: "Advanced",
      description: "Analyze and reverse engineer malicious software.",
    },
    {
      id: 6,
      icon: "🔎",
      title: "OSINT Mastery",
      difficulty: "Beginner",
      description: "Open-source intelligence gathering and reconnaissance.",
    },
  ];

  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "Security Analyst",
      company: "TechCorp",
      text: "Xakker transformed my cybersecurity career. The hands-on labs are incredible.",
    },
    {
      name: "Leyla Alizade",
      role: "Red Team Lead",
      company: "SecureNet",
      text: "The best cyber security training platform I've ever used. Highly professional.",
    },
    {
      name: "Ramin Ismaylov",
      role: "Penetration Tester",
      company: "CyberGuard",
      text: "Real-world scenarios that prepare you for actual security challenges.",
    },
  ];

  const stats = [
    { label: "10,000+", description: "Active Students" },
    { label: "250+", description: "Hands-On Labs" },
    { label: "95%", description: "Satisfaction Rate" },
    { label: "24/7", description: "Expert Support" },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero" id="hero" style={{ backgroundPositionY: `${scrollY * 0.5}px` }}>
        <div className="hero-content container">
          <div className="hero-brand">
            <div className="hero-brand-mark">
              <img
                src={logoSrc}
                alt="Xakker logo"
                className="brand-mark-image"
                onError={handleLogoError}
              />
            </div>
            <div className="hero-brand-copy">
              <span className="hero-brand-kicker">Xakker Self Study</span>
              <p>Black, navy and ice-blue cybersecurity training.</p>
            </div>
          </div>
          <div className="hero-text">
            <h1 className="slide-up">
              Master Cybersecurity <span className="text-gradient">With a Clean, Dark Edge</span>
            </h1>
            <p className="hero-subtitle">
              Black. Dark Navy. White. Light Blue.
            </p>
            <p className="hero-description">
              Hands-on labs, structured roadmaps, and real-world cyber skills wrapped in a sharp, high-contrast interface that keeps the focus on learning.
            </p>
            <div className="hero-actions">
              <Link to="/auth/register" className="btn btn-primary btn-lg">
                Start Learning
              </Link>
              <Link to="#courses" className="btn btn-outline btn-lg">
                Explore Programs
              </Link>
            </div>
            <p className="hero-meta">
              ✓ No credit card required • ✓ 7-day free trial • ✓ Certification included
            </p>
          </div>
          <div className="hero-visual">
            <div className="logo-showcase">
              <div className="logo-orb">
                <img
                  src={logoSrc}
                  alt="Xakker logo"
                  className="logo-orb-mark"
                  onError={handleLogoError}
                />
              </div>
              <div className="floating-card floating-card-top">
                <span className="floating-card-label">Live labs</span>
                <strong>250+ cyber scenarios</strong>
              </div>
              <div className="floating-card floating-card-bottom">
                <span className="floating-card-label">Learning paths</span>
                <strong>Red, Blue, and hybrid tracks</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
      </section>

      {/* Trusted By */}
      <section className="trusted-by">
        <div className="container text-center">
          <p className="section-label">Trusted by industry leaders</p>
          <div className="brands-grid">
            <div className="brand-logo">Accenture</div>
            <div className="brand-logo">Microsoft</div>
            <div className="brand-logo">Google</div>
            <div className="brand-logo">Amazon</div>
            <div className="brand-logo">Cisco</div>
            <div className="brand-logo">IBM</div>
          </div>
        </div>
      </section>

      {/* Why Xakker */}
      <section className="why-xakker py-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Xakker</h2>
            <p>The most comprehensive cybersecurity learning platform for professionals</p>
          </div>
          <div className="features-grid">
            <div className="feature-card card card-blue">
              <div className="feature-icon">🎯</div>
              <h3>Red Team Training</h3>
              <p>Master offensive security, penetration testing, and ethical hacking techniques used by top security firms.</p>
            </div>
            <div className="feature-card card card-blue">
              <div className="feature-icon">🛡️</div>
              <h3>Blue Team Defense</h3>
              <p>Learn defensive strategies, incident response, and security operations from industry professionals.</p>
            </div>
            <div className="feature-card card card-blue">
              <div className="feature-icon">💻</div>
              <h3>Self Study Labs</h3>
              <p>Hands-on practical labs in isolated environments. Learn by doing, not just by watching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="courses-section py-section">
        <div className="container">
          <div className="section-header">
            <h2>Premium Courses</h2>
            <p>Industry-standard training paths designed for career advancement</p>
          </div>
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card card card-blue">
                <div className="course-header">
                  <span className="course-icon">{course.icon}</span>
                  <span className={`difficulty-badge difficulty-${course.difficulty.toLowerCase()}`}>
                    {course.difficulty}
                  </span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <Link to="#" className="btn btn-primary btn-sm">
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Team vs Blue Team */}
      <section className="comparison-section py-section" id="about">
        <div className="container">
          <h2 className="text-center mb-2xl">Red vs Blue: Choose Your Path</h2>
          <div className="comparison-grid">
            <div className="comparison-card comparison-card-dark">
              <h3 className="text-accent">Red Team</h3>
              <p className="text-small">Offensive Security Expert</p>
              <ul className="comparison-list">
                <li>🎯 Penetration Testing</li>
                <li>🚀 Social Engineering</li>
                <li>💣 Exploit Development</li>
                <li>🔓 Vulnerability Research</li>
                <li>👁️ Reconnaissance</li>
              </ul>
              <Link to="/auth/register" className="btn btn-secondary">
                Join Red Team →
              </Link>
            </div>
            <div className="comparison-card comparison-card-accent card">
              <h3 className="text-blue">Blue Team</h3>
              <p className="text-small">Defensive Security Expert</p>
              <ul className="comparison-list">
                <li>🛡️ Incident Response</li>
                <li>🔍 Threat Detection</li>
                <li>📊 Security Operations</li>
                <li>🔐 System Hardening</li>
                <li>📋 Compliance & GRC</li>
              </ul>
              <Link to="/auth/register" className="btn btn-primary">
                Join Blue Team →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card card">
                <div className="stat-value">{stat.label}</div>
                <div className="stat-label">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section py-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Students Say</h2>
            <p>Join thousands of cybersecurity professionals who trust Xakker</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="testimonial-card card card-blue">
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section py-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your learning goals</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card card">
              <h3>Starter</h3>
              <div className="price">$29<span>/month</span></div>
              <p className="price-description">Perfect for beginners</p>
              <ul className="price-features">
                <li>✓ 50+ Courses</li>
                <li>✓ Basic Labs</li>
                <li>✓ Community Access</li>
                <li>✗ Certification</li>
              </ul>
              <button className="btn btn-outline btn-block">Get Started</button>
            </div>
            <div className="pricing-card card pricing-featured">
              <div className="pricing-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">$99<span>/month</span></div>
              <p className="price-description">For serious learners</p>
              <ul className="price-features">
                <li>✓ All Starter features</li>
                <li>✓ 250+ Labs</li>
                <li>✓ Expert Support</li>
                <li>✓ Certifications</li>
              </ul>
              <button className="btn btn-primary btn-block">Start Pro Trial</button>
            </div>
            <div className="pricing-card card">
              <h3>Elite</h3>
              <div className="price">$299<span>/month</span></div>
              <p className="price-description">For professional teams</p>
              <ul className="price-features">
                <li>✓ All Pro features</li>
                <li>✓ 1-on-1 Mentoring</li>
                <li>✓ Custom Paths</li>
                <li>✓ Private Labs</li>
              </ul>
              <button className="btn btn-secondary btn-block">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-section" id="faq">
        <div className="container container-sm">
          <div className="section-header text-center">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item card">
              <summary>How do I get started with Xakker?</summary>
              <p>Simply create a free account, choose your learning path (Red Team, Blue Team, or General), and start with the beginner courses. All new students get 7 days free.</p>
            </details>
            <details className="faq-item card">
              <summary>Are the labs real-world practical?</summary>
              <p>Yes! All labs are built with real cybersecurity scenarios. You'll work with actual tools, vulnerable applications, and realistic attack/defense scenarios.</p>
            </details>
            <details className="faq-item card">
              <summary>Will I receive a certification?</summary>
              <p>Pro and Elite plans include certificates upon course completion. These are industry-recognized and can be added to your LinkedIn profile.</p>
            </details>
            <details className="faq-item card">
              <summary>What if I need technical support?</summary>
              <p>All paid plans include email support. Pro and Elite members get priority support and access to office hours with our experts.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta py-section" id="contact">
        <div className="container text-center">
          <h2>Ready to Master Cybersecurity?</h2>
          <p>Join thousands of professionals building elite security skills with Xakker today</p>
          <Link to="/auth/register" className="btn btn-primary btn-lg">
            Start Your Free Trial Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 className="footer-brand">
                <img
                  src={logoSrc}
                  alt="Xakker logo"
                  className="footer-brand-mark"
                  onError={handleLogoError}
                />
                <span>Xakker.org</span>
              </h4>
              <p className="text-small">Elite cybersecurity education and training platform.</p>
            </div>
            <div className="footer-col">
              <p className="footer-title">Product</p>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#courses">Courses</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-title">Company</p>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#testimonials">Blog</a></li>
                <li><a href="#contact">Careers</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-title">Legal</p>
              <ul className="footer-links">
                <li><a href="#faq">Privacy</a></li>
                <li><a href="#faq">Terms</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Xakker. All rights reserved. • Elite Cybersecurity Education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
