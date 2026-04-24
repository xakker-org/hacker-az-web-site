import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const emptyProfile = {
  username: "",
  email: "",
  bio: "",
  country: "",
  avatar_hue: 0,
  xp: 0,
  rank: "Recruit",
  streak_days: 0,
  tasks_completed: 0,
  rooms_completed: 0,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [studyStats, setStudyStats] = useState({
    total_questions: 0,
    answered_questions: 0,
    correct_answers: 0,
    total_attempts: 0,
    total_points_earned: 0,
    accuracy_percent: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    endpoints.myProfile().then(({ data }) => setProfile((current) => ({ ...current, ...data })));
    endpoints.questionProgress().then(({ data }) => setStudyStats((current) => ({ ...current, ...data })));
  }, []);

  const updateField = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await endpoints.updateProfile({
        bio: profile.bio,
        country: profile.country,
        avatar_hue: Number(profile.avatar_hue) || 0,
      });
      setProfile((current) => ({ ...current, ...data }));
      setMessage("Profile saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Profile">
      <div className="profile-hero">
        <div className="profile-avatar">{profile.username?.[0]?.toUpperCase() || "H"}</div>
        <div className="profile-meta">
          <h1>{profile.username}</h1>
          <p>{profile.email}</p>
          <div className="profile-meta-row">
            <span className="chip chip-accent">{profile.rank}</span>
            <span className="chip">{profile.xp} XP</span>
            <span className="chip">{profile.streak_days} day streak</span>
          </div>
        </div>
        <div className="profile-side">
          <span className="chip chip-blue">{profile.tasks_completed} tasks</span>
          <span className="chip chip-mint">{profile.rooms_completed} rooms</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="panel"><div className="dash-stat-value">{profile.xp}</div><div className="dash-stat-label">XP</div></div>
        <div className="panel"><div className="dash-stat-value">{profile.streak_days}</div><div className="dash-stat-label">Streak</div></div>
        <div className="panel"><div className="dash-stat-value">{profile.tasks_completed}</div><div className="dash-stat-label">Tasks</div></div>
        <div className="panel"><div className="dash-stat-value">{profile.rooms_completed}</div><div className="dash-stat-label">Rooms</div></div>
      </div>

      <div className="panel">
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div>
            <h2>Self-Study Statistics</h2>
            <p>Question attempts and accuracy summary from self-study progress API.</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="panel"><div className="dash-stat-value">{studyStats.total_questions}</div><div className="dash-stat-label">Questions</div></div>
          <div className="panel"><div className="dash-stat-value">{studyStats.answered_questions}</div><div className="dash-stat-label">Answered</div></div>
          <div className="panel"><div className="dash-stat-value">{studyStats.total_attempts}</div><div className="dash-stat-label">Attempts</div></div>
          <div className="panel"><div className="dash-stat-value">{studyStats.accuracy_percent}%</div><div className="dash-stat-label">Accuracy</div></div>
        </div>
      </div>

      <div className="panel">
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div>
            <h2>Edit profile</h2>
            <p>Frontend yalnız backend-də artıq hazır olan profile sahələrini yeniləyir.</p>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={saveProfile} className="rooms-filters" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <textarea className="filter-input" rows="4" value={profile.bio} onChange={updateField("bio")} placeholder="Bio" />
          <input className="filter-input" value={profile.country} onChange={updateField("country")} placeholder="Country" />
          <input className="filter-input" type="number" min="0" max="360" value={profile.avatar_hue} onChange={updateField("avatar_hue")} placeholder="Avatar hue" />
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>Save profile</button>
        </form>
      </div>
    </AppShell>
  );
}