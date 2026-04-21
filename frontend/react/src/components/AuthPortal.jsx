import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setTokens } from "../utils/tokens";

export default function AuthPortal({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    return isLogin ? "Welcome Back, Hacker" : "Create Your Account";
  }, [isLogin]);

  const subtitle = useMemo(() => {
    return isLogin
      ? "Continue your cybersecurity journey"
      : "Begin your professional development";
  }, [isLogin]);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        setTokens(data.access, data.refresh);
        navigate("/dashboard");
      } else {
        await api.post("/auth/register/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        navigate("/login");
      }
    } catch (requestError) {
      setError(
        isLogin
          ? "Invalid username or password"
          : "Registration failed. Username may already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', minHeight: '100vh', gap: 0 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--color-deep-navy), var(--color-black))',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 194, 255, 0.1), transparent)',
          borderRadius: '50%',
          right: '-100px',
          bottom: '-100px'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 45, 85, 0.1), transparent)',
          borderRadius: '50%',
          left: '-50px',
          top: '100px'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Xakker Self Study</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>Train like a hacker. Learn like a pro.</p>
          <ul style={{ listStyle: 'none', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
            {['🎯 Elite Training Programs', '🛡️ Real-World Scenarios', '🚀 Career Growth Path'].map((item, i) => (
              <li key={i} style={{ color: 'var(--color-text-secondary)' }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>{subtitle}</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Username</label>
              <input
                className="form-input"
                name="username"
                value={form.username}
                onChange={onChange}
                required
              />
            </div>

            {!isLogin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Email</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                minLength={8}
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            {error && <div style={{ color: 'var(--color-red)', fontSize: '0.9rem' }}>{error}</div>}
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"} style={{ color: 'var(--color-blue)', textDecoration: 'none', fontWeight: 600 }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
