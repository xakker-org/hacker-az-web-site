import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import { setTokens } from "../utils/tokens";
import "../styles/auth.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const { mode = "login" } = useParams();
  const [activeTab, setActiveTab] = useState(mode || "login");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "beginner",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLogin = activeTab === "login";

  const title = useMemo(
    () => (isLogin ? "Welcome Back, Hacker" : "Start Your Security Journey"),
    [isLogin]
  );

  const subtitle = useMemo(
    () =>
      isLogin
        ? "Log in to your Xakker account to continue training"
        : "Join elite cybersecurity professionals learning on Xakker",
    [isLogin]
  );

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
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
        setSuccess("Login successful! Redirecting to dashboard...");
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

        setSuccess("Account created! Logging you in...");
        setTimeout(() => {
          setActiveTab("login");
          setForm({ username: form.username, password: form.password, email: "", confirmPassword: "", role: "beginner" });
        }, 1000);
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
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <div className="glow glow-3"></div>
      </div>

      <div className="auth-container">
        {/* Left Side - Brand Story */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo">
              <span className="logo-icon">⚔️</span>
              <span className="logo-text">Xakker</span>
            </div>

            <h1>Xakker Self-Study</h1>
            <p className="auth-subtitle">Train like a hacker. Learn like a pro.</p>

            <div className="auth-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Real-World Labs</h4>
                  <p>Hands-on cyber security training in isolated environments</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Expert Guidance</h4>
                  <p>Learn from industry professionals and security experts</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Certifications</h4>
                  <p>Earn recognized credentials in cybersecurity</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h4>Career Growth</h4>
                  <p>Build elite skills for high-paying security roles</p>
                </div>
              </div>
            </div>

            <div className="auth-stats">
              <div className="stat">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Students</div>
              </div>
              <div className="stat">
                <div className="stat-number">250+</div>
                <div className="stat-label">Labs</div>
              </div>
              <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>

            <p className="auth-security">
              🔒 Secure account • Industry-grade encryption • Your data is protected
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                  setSuccess("");
                  setForm({ ...form, password: "", email: "", confirmPassword: "" });
                }}
              >
                Login
              </button>
              <button
                className={`tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("register");
                  setError("");
                  setSuccess("");
                  setForm({ ...form, password: "", email: "" });
                }}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="auth-form">
              <h2>{title}</h2>
              <p className="form-subtitle">{subtitle}</p>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="your_username"
                  required
                />
              </div>

              {/* Email (Register Only) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              )}

              {/* Role Selection (Register Only) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="role">Select Your Path</label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                  >
                    <option value="beginner">🎯 Beginner - Start from Basics</option>
                    <option value="red_team">⚔️ Red Team - Offensive Security</option>
                    <option value="blue_team">🛡️ Blue Team - Defensive Security</option>
                  </select>
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm Password (Register Only) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {/* Forgot Password Link (Login Only) */}
              {isLogin && (
                <div className="forgot-password">
                  <Link to="/forgot-password">Forgot your password?</Link>
                </div>
              )}

              {/* Error Message */}
              {error && <div className="error-message">{error}</div>}

              {/* Success Message */}
              {success && <div className="success-message">{success}</div>}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </button>

              {/* Social Auth (Optional) */}
              <div className="social-divider">
                <span>or continue with</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="social-btn">
                  <span>Google</span>
                </button>
                <button type="button" className="social-btn">
                  <span>GitHub</span>
                </button>
              </div>

              {/* Terms & Conditions (Register Only) */}
              {!isLogin && (
                <p className="terms-text">
                  By creating an account, you agree to our{" "}
                  <a href="/terms">Terms of Service</a> and{" "}
                  <a href="/privacy">Privacy Policy</a>
                </p>
              )}

              {/* Switch Auth Mode */}
              <p className="auth-switch">
                {isLogin ? "Don't have an account? " : "Already registered? "}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setActiveTab(isLogin ? "register" : "login")}
                >
                  {isLogin ? "Register now" : "Sign in"}
                </button>
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <span>🔒 Secure and encrypted</span>
            <span>✓ Industry-standard security</span>
            <span>⚡ Instant access to labs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
