import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAccessToken, clearTokens } from "../utils/tokens";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get("/auth/me/");
        setUser(data);
      } catch (error) {
        clearTokens();
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    clearTokens();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  const welcomeMessage = `Welcome back, ${user?.username || "Hacker"}`;

  const courses = [
    {
      id: 1,
      title: "Ethical Hacking 101",
      progress: 65,
      status: "In Progress",
      image: "⚔️",
    },
    {
      id: 2,
      title: "Web Application Security",
      progress: 30,
      status: "In Progress",
      image: "🌐",
    },
    {
      id: 3,
      title: "Linux Fundamentals",
      progress: 100,
      status: "Completed",
      image: "🐧",
    },
  ];

  const labs = [
    { name: "SQL Injection", difficulty: "intermediate", status: "available" },
    { name: "XSS Vulnerabilities", difficulty: "intermediate", status: "available" },
    { name: "CSRF Attacks", difficulty: "beginner", status: "available" },
    { name: "Buffer Overflow", difficulty: "advanced", status: "available" },
    { name: "Privilege Escalation", difficulty: "advanced", status: "available" },
    { name: "Network Reconnaissance", difficulty: "beginner", status: "available" },
  ];

  const learningPaths = [
    {
      name: "Red Team Mastery",
      description: "Offensive security and penetration testing",
      progress: 35,
      icon: "⚔️",
      color: "red",
    },
    {
      name: "Blue Team Defender",
      description: "Defensive security and incident response",
      progress: 50,
      icon: "🛡️",
      color: "blue",
    },
    {
      name: "Generalist Path",
      description: "Comprehensive cybersecurity knowledge",
      progress: 25,
      icon: "🎯",
      color: "blue",
    },
  ];

  const achievements = [
    { name: "First Steps", description: "Complete your first course", unlocked: true },
    { name: "Lab Master", description: "Solve 10 labs", unlocked: true },
    { name: "Security Pro", description: "Complete 5 courses", unlocked: false },
    { name: "Hacker Elite", description: "Achieve 100% on all courses", unlocked: false },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">⚔️</span>
            <span className="brand-name">Xakker</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="/" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">📚</span>
            <span className="nav-label">My Courses</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">🧪</span>
            <span className="nav-label">Labs</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Learning Paths</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">⚔️</span>
            <span className="nav-label">Red Team</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">🛡️</span>
            <span className="nav-label">Blue Team</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">📝</span>
            <span className="nav-label">Notes</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-label">Progress</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">🏆</span>
            <span className="nav-label">Certificates</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">💬</span>
            <span className="nav-label">Community</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Navbar */}
        <div className="dashboard-navbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="navbar-search">
            <input
              type="text"
              placeholder="Search courses, labs..."
              className="search-input"
            />
          </div>

          <div className="navbar-controls">
            <button className="icon-btn notification-btn">
              🔔
              <span className="badge">3</span>
            </button>
            <button className="icon-btn messages-btn">
              💬
              <span className="badge">1</span>
            </button>
            <div className="user-profile">
              <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <span className="username">{user?.username}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content container">
          {/* Hero Section */}
          <section className="hero-section card">
            <div className="hero-text">
              <h1>{welcomeMessage}.</h1>
              <p>Keep building your elite cybersecurity skills. You're on a roll!</p>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">7</div>
                <div className="stat-label">Courses Active</div>
              </div>
              <div className="stat">
                <div className="stat-value">42</div>
                <div className="stat-label">Labs Completed</div>
              </div>
              <div className="stat">
                <div className="stat-value">156</div>
                <div className="stat-label">Hours Learned</div>
              </div>
            </div>
          </section>

          {/* Progress Cards */}
          <section className="progress-section">
            <h2>Your Progress</h2>
            <div className="progress-grid">
              <div className="progress-card card">
                <div className="progress-label">Courses Completed</div>
                <div className="progress-value">3</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "30%" }}></div>
                </div>
              </div>
              <div className="progress-card card">
                <div className="progress-label">Labs Solved</div>
                <div className="progress-value">42</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "84%" }}></div>
                </div>
              </div>
              <div className="progress-card card">
                <div className="progress-label">Current Rank</div>
                <div className="progress-value">Gold</div>
                <div className="progress-rank">
                  <span>Bronze</span>
                  <span className="rank-current">Gold</span>
                  <span>Platinum</span>
                </div>
              </div>
              <div className="progress-card card">
                <div className="progress-label">Streak Days</div>
                <div className="progress-value">12</div>
                <p className="progress-meta">Keep it up! 🔥</p>
              </div>
            </div>
          </section>

          {/* Continue Learning */}
          <section className="continue-learning-section">
            <h2>Continue Learning</h2>
            <div className="course-cards">
              {courses.map((course) => (
                <div key={course.id} className="course-card card">
                  <div className="course-icon">{course.image}</div>
                  <h3>{course.title}</h3>
                  <div className="course-status">{course.status}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-label">{course.progress}% Complete</div>
                </div>
              ))}
            </div>
          </section>

          {/* Practice Labs */}
          <section className="practice-labs-section">
            <h2>Practice Labs</h2>
            <div className="labs-grid">
              {labs.map((lab, idx) => (
                <div key={idx} className="lab-card card">
                  <div className="lab-header">
                    <h4>{lab.name}</h4>
                    <span className={`difficulty ${lab.difficulty}`}>
                      {lab.difficulty}
                    </span>
                  </div>
                  <button className="btn btn-primary btn-sm">Start Lab →</button>
                </div>
              ))}
            </div>
          </section>

          {/* Learning Paths */}
          <section className="learning-paths-section">
            <h2>Your Learning Paths</h2>
            <div className="paths-grid">
              {learningPaths.map((path, idx) => (
                <div key={idx} className={`path-card card path-${path.color}`}>
                  <div className="path-icon">{path.icon}</div>
                  <h3>{path.name}</h3>
                  <p>{path.description}</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${path.progress}%` }}
                    ></div>
                  </div>
                  <div className="path-meta">{path.progress}% Complete</div>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Activity */}
          <section className="activity-section">
            <h2>Weekly Activity</h2>
            <div className="activity-card card">
              <div className="activity-chart">
                <div className="activity-bar" style={{ height: "60%" }}></div>
                <div className="activity-bar" style={{ height: "80%" }}></div>
                <div className="activity-bar" style={{ height: "40%" }}></div>
                <div className="activity-bar" style={{ height: "70%" }}></div>
                <div className="activity-bar" style={{ height: "85%" }}></div>
                <div className="activity-bar" style={{ height: "50%" }}></div>
                <div className="activity-bar" style={{ height: "75%" }}></div>
              </div>
              <div className="activity-days">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"}`}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? "🏆" : "🔒"}
                  </div>
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Sessions */}
          <section className="upcoming-sessions-section">
            <h2>Upcoming Sessions</h2>
            <div className="sessions-grid">
              <div className="session-card card">
                <div className="session-time">Today at 3:00 PM</div>
                <h4>Advanced Penetration Testing Masterclass</h4>
                <p className="session-instructor">with Ahmed Hassan</p>
                <button className="btn btn-primary btn-sm">Join Session →</button>
              </div>
              <div className="session-card card">
                <div className="session-time">Tomorrow at 10:00 AM</div>
                <h4>Blue Team Incident Response Workshop</h4>
                <p className="session-instructor">with Sarah Williams</p>
                <button className="btn btn-primary btn-sm">Remind Me →</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
