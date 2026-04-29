import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { setTokens } from "../utils/tokens";
import "../styles/auth.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const { mode = "login" } = useParams();
  const normalizeMode = (value) => (value === "register" ? "register" : "login");
  const [activeTab, setActiveTab] = useState(normalizeMode(mode));
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLogin = activeTab === "login";

  useEffect(() => {
    document.body.classList.add("self-study-body");
    return () => document.body.classList.remove("self-study-body");
  }, []);

  useEffect(() => {
    const normalized = normalizeMode(mode);
    if (normalized !== activeTab) setActiveTab(normalized);
  }, [mode, activeTab]);

  const handleLogoError = () => setLogoSrc("/static/logo/logoXakker.png");

  const switchMode = (nextMode) => {
    const normalized = normalizeMode(nextMode);
    setActiveTab(normalized);
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    navigate(`/auth/${normalized}`, { replace: true });
  };

  const getRequestErrorMessage = (requestError, fallback) => {
    const payload = requestError?.response?.data;
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;
    if (payload.detail) return payload.detail;
    if (Array.isArray(payload.non_field_errors) && payload.non_field_errors[0])
      return payload.non_field_errors[0];
    const firstFieldError = Object.values(payload).find(
      (v) => Array.isArray(v) && v[0]
    );
    if (firstFieldError) return firstFieldError[0];
    return fallback;
  };

  const title = useMemo(
    () => (isLogin ? "Welcome Back, Hacker" : "Start Your Journey"),
    [isLogin]
  );

  const subtitle = useMemo(
    () =>
      isLogin
        ? "Sign in to continue your cybersecurity training"
        : "Join elite professionals training on Xakker",
    [isLogin]
  );

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        setTokens(data.access, data.refresh);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await api.post("/auth/register/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        const { data } = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        setTokens(data.access, data.refresh);
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 900);
      }
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          isLogin
            ? "Invalid username or password"
            : "Registration failed. Username may already exist."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
        <div className="auth-glow auth-glow-3" />
      </div>

      <div className="auth-container">
        {/* ── LEFT PANEL ─────────────────────── */}
        <div className="auth-left">
          <div className="auth-logo-block">
            <img
              src={logoSrc}
              alt="Xakker"
              className="auth-logo-img"
              onError={handleLogoError}
            />
          </div>

          {/* Radar visual */}
          <div className="auth-radar">
            <div className="radar-circle">
              <div className="radar-ring radar-ring-1" />
              <div className="radar-ring radar-ring-2" />
              <div className="radar-sweep" />
              <div className="radar-dot dot-1" />
              <div className="radar-dot dot-2" />
              <div className="radar-dot dot-3" />
              <div className="radar-dot dot-4" />
              <div className="radar-center" />
            </div>
            <p className="radar-label">// threat monitoring active</p>
          </div>

          <div className="auth-copy">
            <h2>Train like a hacker.</h2>
            <p>
              Elite cybersecurity training for the next generation of security
              professionals. Hands-on labs, real-world scenarios.
            </p>
          </div>

          <ul className="auth-feat-list">
            <li>
              <span className="feat-num">01</span>
              <div>
                <strong>Real-World Labs</strong>
                <p>Isolated environments with actual threat scenarios</p>
              </div>
            </li>
            <li>
              <span className="feat-num">02</span>
              <div>
                <strong>Expert Guidance</strong>
                <p>Industry professionals as your mentors</p>
              </div>
            </li>
            <li>
              <span className="feat-num">03</span>
              <div>
                <strong>Certifications</strong>
                <p>Industry-recognized cybersecurity credentials</p>
              </div>
            </li>
          </ul>

          <div className="auth-stats-row">
            <div className="auth-stat">
              <span>10K+</span>
              <label>Students</label>
            </div>
            <div className="auth-stat">
              <span>250+</span>
              <label>Labs</label>
            </div>
            <div className="auth-stat">
              <span>95%</span>
              <label>Rating</label>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────── */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Terminal bar */}
            <div className="auth-terminal-bar">
              <span className="t-dot t-red" />
              <span className="t-dot t-yellow" />
              <span className="t-dot t-green" />
              <span className="t-title">xakker_auth.exe</span>
            </div>

            {/* Tabs */}
            <div className={`auth-tabs auth-tabs-${activeTab}`}>
              <button
                className={`tab ${activeTab === "login" ? "active" : ""}`}
                type="button"
                onClick={() => switchMode("login")}
              >
                Login
              </button>
              <button
                className={`tab ${activeTab === "register" ? "active" : ""}`}
                type="button"
                onClick={() => switchMode("register")}
              >
                Register
              </button>
              <div className="tab-slider" />
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="auth-form">
              <div className="form-header">
                <h2>{title}</h2>
                <p className="form-subtitle">{subtitle}</p>
              </div>

              {/* Username */}
              <div className="field-wrap">
                <span className="field-icon">$_</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="username"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Email — register only */}
              {!isLogin && (
                <div className="field-wrap">
                  <span className="field-icon">@</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="email@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              )}

              {/* Account type — register only */}
              {!isLogin && (
                <div className="field-wrap field-disabled">
                  <span className="field-icon">#</span>
                  <input value="Client account" disabled readOnly />
                </div>
              )}

              {/* Password */}
              <div className="field-wrap">
                <span className="field-icon">••</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm password — register only */}
              {!isLogin && (
                <div className="field-wrap">
                  <span className="field-icon">••</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="confirm password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="forgot-hint">
                  Account recovery handled via support.
                </div>
              )}

              {error && (
                <div className="auth-message auth-error" role="alert">
                  <span className="msg-icon">✕</span> {error}
                </div>
              )}
              {success && (
                <div className="auth-message auth-success" role="status">
                  <span className="msg-icon">✓</span> {success}
                </div>
              )}

              <button
                type="submit"
                className={`auth-submit-btn${loading ? " is-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="submit-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <span className="submit-arrow">→</span>
                  </>
                )}
              </button>

              {!isLogin && (
                <p className="terms-text">
                  By registering you confirm this account will be used only for
                  self-study, progress tracking, and exam workflows.
                </p>
              )}

              <p className="auth-switch">
                {isLogin ? "No account? " : "Already registered? "}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => switchMode(isLogin ? "register" : "login")}
                >
                  {isLogin ? "Join now" : "Sign in"}
                </button>
              </p>
            </form>
          </div>

          <div className="auth-trust-row">
            <span>🔒 Encrypted</span>
            <span>⚡ Instant access</span>
            <span>✓ ISO-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
