import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearTokens, getAccessToken } from "../utils/tokens";
import "../styles/dashboard.css";

const emptyCabinet = {
  username: "Hacker",
  email: "",
  account_type: "client",
  is_staff: false,
  is_superuser: false,
  enrolled_courses: [],
  plans: [],
  exams: [],
  question_type_breakdown: {},
  question_level_breakdown: {},
  stats: {
    active_courses: 0,
    total_lessons: 0,
    active_plans: 0,
    available_exams: 0,
    course_threads: 0,
  },
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cabinet, setCabinet] = useState(emptyCabinet);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [brandLogoSrc, setBrandLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleBrandLogoError = () => {
    setBrandLogoSrc("/static/logo/xakkerLogoWhite2.png");
  };

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth/login");
      return;
    }

    let mounted = true;

    const fetchCabinet = async () => {
      try {
        const { data } = await api.get("/courses/cabinet/");
        if (mounted) {
          if (data?.is_staff || data?.is_superuser || data?.account_type === "admin") {
            clearTokens();
            window.location.href = "/admin/";
            return;
          }
          setCabinet(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError("Kabinet məlumatları yüklənmədi. Yenidən daxil ol.");
        }
        clearTokens();
        navigate("/auth/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCabinet();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearTokens();
    navigate("/auth/login");
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Kabinet yüklənir...</div>
      </div>
    );
  }

  const enrolledCourses = cabinet.enrolled_courses || [];
  const plans = cabinet.plans || [];
  const exams = cabinet.exams || [];
  const questionTypeBreakdown = cabinet.question_type_breakdown || {};
  const questionLevelBreakdown = cabinet.question_level_breakdown || {};
  const stats = cabinet.stats || emptyCabinet.stats;
  const welcomeMessage = `Salam, ${cabinet.username || "Hacker"}`;

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src={brandLogoSrc}
              alt="Xakker logo"
              className="brand-icon"
              onError={handleBrandLogoError}
            />
            <span className="brand-name">Kabinet</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item active">
            <span className="nav-icon">◌</span>
            <span className="nav-label">Overview</span>
          </a>
          <a href="#plans" className="nav-item">
            <span className="nav-icon">🧭</span>
            <span className="nav-label">Learning Plans</span>
          </a>
          <a href="#courses" className="nav-item">
            <span className="nav-icon">📚</span>
            <span className="nav-label">Courses</span>
          </a>
          <a href="#questions" className="nav-item">
            <span className="nav-icon">🧪</span>
            <span className="nav-label">Questions</span>
          </a>
          <a href="#exam-room" className="nav-item">
            <span className="nav-icon">⌨️</span>
            <span className="nav-label">Exam Room</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">↩</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-navbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>

          <div className="navbar-search">
            <input
              type="text"
              placeholder="Plan, course və imtahan axtar..."
              className="search-input"
            />
          </div>

          <div className="navbar-controls">
            <Link to="/" className="icon-btn notification-btn">
              ⤴
            </Link>
            <Link to="/auth/login" className="icon-btn messages-btn">
              ⟲
            </Link>
            <div className="user-profile">
              <div className="avatar">{cabinet.username?.[0]?.toUpperCase() || "K"}</div>
              <span className="username">{cabinet.username}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-content container">
          {error && <div className="dashboard-alert">{error}</div>}

          <section id="overview" className="hero-section card soft-card">
            <div className="hero-text">
              <span className="eyebrow">Self-study kabinet</span>
              <h1>{welcomeMessage}</h1>
              <p>
                Bütün kurslar, planlar və imtahanlar backenddən gəlir. Kabinet indi real
                learning flow kimi işləyir.
              </p>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">{stats.active_courses || 0}</div>
                <div className="stat-label">Active Courses</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.total_lessons || 0}</div>
                <div className="stat-label">Lessons</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.available_exams || 0}</div>
                <div className="stat-label">Exams</div>
              </div>
            </div>
          </section>

          <section className="progress-section">
            <h2>Progress</h2>
            <div className="progress-grid">
              <div className="progress-card card soft-card">
                <div className="progress-label">Active Plans</div>
                <div className="progress-value">{stats.active_plans || 0}</div>
                <div className="progress-meta">Backend plan sayı</div>
              </div>
              <div className="progress-card card soft-card">
                <div className="progress-label">Exam Queue</div>
                <div className="progress-value">{stats.available_exams || 0}</div>
                <div className="progress-meta">Backend exam sayı</div>
              </div>
              <div className="progress-card card soft-card">
                <div className="progress-label">Study Threads</div>
                <div className="progress-value">{stats.course_threads || 0}</div>
                <div className="progress-meta">Exam bağlı kurslar</div>
              </div>
              <div className="progress-card card soft-card">
                <div className="progress-label">Lessons</div>
                <div className="progress-value">{stats.total_lessons || 0}</div>
                <div className="progress-meta">Backend lesson sayı</div>
              </div>
            </div>
          </section>

          <section id="plans" className="learning-paths-section">
            <h2>Learning Plans</h2>
            <div className="paths-grid">
              {plans.map((plan) => (
                <article key={plan.id} className="path-card card soft-card">
                  <div className="path-topline">
                    <span className="pill pill-soft">{levelLabels[plan.level] || plan.level}</span>
                    {plan.is_featured && <span className="pill pill-accent">Featured</span>}
                  </div>
                  <div className="path-icon">🧭</div>
                  <h3>{plan.title}</h3>
                  <p>{plan.summary}</p>
                  <div className="course-stack">
                    {(plan.courses || []).map((entry) => (
                      <div key={entry.id} className="mini-course-row">
                        <span>{entry.course.title}</span>
                        <span>{entry.course.category || "General"}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="courses" className="continue-learning-section">
            <h2>Your Courses</h2>
            <div className="course-cards">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <article key={course.id} className="course-card card soft-card">
                    <div className="course-icon">📘</div>
                    <h3>{course.title}</h3>
                    <div className="course-status">{course.category || "General"}</div>
                    <p>{course.description}</p>
                  </article>
                ))
              ) : (
                <div className="empty-state card soft-card">
                  <h3>Hələ kurs yoxdur</h3>
                  <p>Cabinetdə kurs görünməsi üçün backenddə enrollment data lazımdır.</p>
                  <Link to="/" className="btn btn-secondary btn-sm">
                    Browse landing
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section id="questions" className="practice-labs-section">
            <h2>Question Statistics</h2>
            <div className="labs-grid assessment-grid">
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Type: Closed</h4>
                  <span className="difficulty beginner">Auto</span>
                </div>
                <p>{questionTypeBreakdown.closed || 0} sual</p>
              </div>
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Type: Open</h4>
                  <span className="difficulty intermediate">Review</span>
                </div>
                <p>{questionTypeBreakdown.open || 0} sual</p>
              </div>
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Type: Terminal</h4>
                  <span className="difficulty advanced">Code</span>
                </div>
                <p>{questionTypeBreakdown.terminal || 0} sual</p>
              </div>
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Level: Beginner</h4>
                  <span className="difficulty beginner">L1</span>
                </div>
                <p>{questionLevelBreakdown.beginner || 0} sual</p>
              </div>
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Level: Intermediate</h4>
                  <span className="difficulty intermediate">L2</span>
                </div>
                <p>{questionLevelBreakdown.intermediate || 0} sual</p>
              </div>
              <div className="lab-card card soft-card">
                <div className="lab-header">
                  <h4>Level: Advanced</h4>
                  <span className="difficulty advanced">L3</span>
                </div>
                <p>{questionLevelBreakdown.advanced || 0} sual</p>
              </div>
            </div>
          </section>

          <section id="exam-room" className="upcoming-sessions-section">
            <h2>Exam Room</h2>
            <div className="sessions-grid">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <article key={exam.id} className="session-card card soft-card">
                    <div className="session-time">{levelLabels[exam.level] || exam.level}</div>
                    <h4>{exam.title}</h4>
                    <p className="session-instructor">{exam.course?.title}</p>
                    <p>{exam.description}</p>
                    <div className="exam-meta">
                      <span>{exam.question_count} questions</span>
                      <span>{exam.time_limit_minutes} min</span>
                    </div>
                    <Link to={`/dashboard/exams/${exam.slug}`} className="btn btn-primary btn-sm">
                      Start Exam
                    </Link>
                  </article>
                ))
              ) : (
                <div className="empty-state card soft-card">
                  <h3>Aktiv imtahan yoxdur</h3>
                  <p>Enrolled course-lar üçün published exam əlavə olunanda burada görünəcək.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
