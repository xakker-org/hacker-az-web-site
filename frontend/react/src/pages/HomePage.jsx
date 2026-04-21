import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../utils/tokens';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (getAccessToken()) navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="page-wrapper">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎯 ELITE CYBERSECURITY</div>
          <h1 className="hero-title">Master Cybersecurity Like a Real Hacker</h1>
          <p className="hero-subtitle">Red Team. Blue Team. Real Skills. Real Future.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/auth')}>Start Learning</button>
            <button className="btn btn-secondary btn-large">Explore Programs</button>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Hands-on labs • Roadmaps • Real-world skills</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '350px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
            <h3>Xakker Platform</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Professional cybersecurity training</p>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: '1400px', margin: '4rem auto', padding: '0 2rem', width: '100%' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '3rem', textAlign: 'center' }}>Featured Programs</h2>
        <div className="grid grid-cols-3">
          {['🔓 Ethical Hacking', '🌐 Web Pentesting', '📊 SOC Analyst'].map((p, i) => (
            <div key={i} className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{p.split(' ')[0]}</div>
              <h3>{p.split(' ').slice(1).join(' ')}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Learn industry techniques and tools</p>
              <button className="btn btn-secondary btn-small">Learn More</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
