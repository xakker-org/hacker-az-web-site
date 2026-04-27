import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import ContributionGraph from "../components/profile/ContributionGraph";
import PerformanceSummary from "../components/profile/PerformanceSummary";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import RecentActivity from "../components/profile/RecentActivity";
import StatsCards from "../components/profile/StatsCards";
import { endpoints } from "../services/endpoints";
import "../styles/profile.css";

const EMPTY_PROFILE = {
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

const EMPTY_STATS = {
  total_questions_solved: 0,
  total_attempts: 0,
  correct_answers: 0,
  wrong_answers: 0,
  accuracy_rate: 0,
  total_points_earned: 0,
  leaderboard_rank: 0,
  active_days: 0,
  best_day_points: 0,
  best_day_date: null,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [graphDays, setGraphDays] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ bio: "", country: "", avatar_hue: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfileData = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileRes, statsRes, graphRes, recentRes] = await Promise.all([
        endpoints.myProfile(),
        endpoints.profileStats(),
        endpoints.activityGraph(),
        endpoints.recentStudyActivity(20),
      ]);

      const profileData = profileRes?.data || EMPTY_PROFILE;
      const statsData = statsRes?.data || EMPTY_STATS;

      setProfile({ ...EMPTY_PROFILE, ...profileData, ...statsData });
      setStats({ ...EMPTY_STATS, ...statsData });
      setGraphDays(Array.isArray(graphRes?.data?.days) ? graphRes.data.days : []);
      setRecentActivity(Array.isArray(recentRes?.data) ? recentRes.data : []);

      setDraft({
        bio: profileData.bio || "",
        country: profileData.country || "",
        avatar_hue: Number(profileData.avatar_hue) || 0,
      });
    } catch (loadError) {
      setError(loadError?.response?.data?.detail || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const updateDraft = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await endpoints.updateProfile({
        bio: draft.bio,
        country: draft.country,
        avatar_hue: Number(draft.avatar_hue) || 0,
      });
      setProfile((current) => ({ ...current, ...data }));
      setMessage("Profile updated successfully.");
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const hasAnyActivity = useMemo(
    () => graphDays.some((day) => Number(day.questions_solved) > 0 || Number(day.points_earned) > 0),
    [graphDays],
  );

  return (
    <AppShell title="Profile">
      <div className="profile-page">
        {loading && (
          <div className="profile-loading">
            <div className="profile-spinner" aria-hidden="true" />
            <div>Loading profile analytics...</div>
          </div>
        )}

        {!loading && error && (
          <div className="profile-error" role="alert">
            {error}
            <button type="button" className="profile-edit-btn" style={{ marginTop: 12 }} onClick={loadProfileData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="profile-layout">
            <ProfileSidebar profile={profile} stats={stats} onEdit={() => setEditOpen(true)} />

            <div className="profile-main">
              <ProfileHeader profile={profile} stats={stats} />

              {message && <div className="profile-alert-success">{message}</div>}

              <StatsCards stats={stats} />

              {hasAnyActivity ? <ContributionGraph days={graphDays} /> : <div className="profile-empty">No activity yet. Solve a question to start building your graph.</div>}

              <div className="profile-two-col">
                <RecentActivity activities={recentActivity} />
                <PerformanceSummary stats={stats} days={graphDays} activities={recentActivity} />
              </div>
            </div>
          </div>
        )}

        {editOpen && (
          <div className="profile-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit profile">
            <form className="profile-modal" onSubmit={saveProfile}>
              <h2 className="profile-modal-title">Edit Profile</h2>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Bio</span>
                <textarea
                  className="profile-modal-textarea"
                  value={draft.bio}
                  onChange={updateDraft("bio")}
                  placeholder="Tell about your learning focus"
                />
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Country</span>
                <input
                  className="profile-modal-input"
                  value={draft.country}
                  onChange={updateDraft("country")}
                  placeholder="Country"
                />
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Avatar Hue</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    className="profile-modal-input"
                    type="number"
                    min="0"
                    max="360"
                    value={draft.avatar_hue}
                    onChange={updateDraft("avatar_hue")}
                  />
                  <span
                    className="hue-preview"
                    style={{ background: `hsl(${Number(draft.avatar_hue) || 0} 75% 56%)` }}
                    aria-hidden="true"
                  />
                </div>
              </label>

              <div className="profile-modal-actions">
                <button type="button" className="profile-modal-cancel" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="profile-modal-save" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}