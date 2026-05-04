import { useEffect, useState } from "react";

export default function ProfileSidebar({ profile, stats, onEdit }) {
  const initial = (profile?.username || "H").slice(0, 1).toUpperCase();
  const avatarHue = Number(profile?.avatar_hue) || 0;
  const avatarUrl = profile?.avatar_url || null;
  const progress = Math.max(0, Math.min(100, Number(profile?.rank_progress) || 0));
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  return (
    <aside className="profile-sidebar">
      <section className="profile-panel">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-shell">
            {avatarUrl && !avatarFailed ? (
              <img
                className="profile-avatar-image"
                src={avatarUrl}
                alt={profile?.username || "avatar"}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div
                className="profile-avatar-circle"
                style={{ background: `linear-gradient(135deg, hsl(${avatarHue} 75% 56%), hsl(${(avatarHue + 60) % 360} 82% 62%))` }}
              >
                {initial}
              </div>
            )}
          </div>

          <div className="profile-avatar-copy">
            <div className="profile-sidebar-name">{profile?.full_name || profile?.username || "Student"}</div>
            <div className="profile-sidebar-username">@{profile?.username || "student"}</div>
            <p className="profile-sidebar-bio">{profile?.bio || "Add your bio to tell others about your learning goals."}</p>
            <div className="profile-chip-row">
              <span className="profile-chip">{profile?.rank || "Recruit"}</span>
              <span className="profile-chip muted">#{stats?.leaderboard_rank || "-"}</span>
              {profile?.country && <span className="profile-chip muted">{profile.country}</span>}
              {profile?.city && <span className="profile-chip muted">{profile.city}</span>}
            </div>
          </div>
        </div>

        <div className="profile-sidebar-meta">
          <div className="profile-sidebar-meta-item">
            <span className="profile-sidebar-meta-ico">✉</span>
            <span>{profile?.email || "No email"}</span>
          </div>
          {(profile?.country || profile?.city) && (
            <div className="profile-sidebar-meta-item">
              <span className="profile-sidebar-meta-ico">◎</span>
              <span>
                {[profile?.city, profile?.country].filter(Boolean).join(", ") || "No location"}
              </span>
            </div>
          )}
          {!profile?.country && !profile?.city && (
            <div className="profile-sidebar-meta-item">
              <span className="profile-sidebar-meta-ico">◎</span>
              <span>No location</span>
            </div>
          )}
          <div className="profile-sidebar-meta-item">
            <span className="profile-sidebar-meta-ico">☰</span>
            <span>Rank #{stats?.leaderboard_rank || "-"}</span>
          </div>
        </div>

        <div className="profile-sidebar-stats">
          <div className="profile-mini-stat">
            <span>XP</span>
            <strong>{Number(profile?.xp || 0).toLocaleString()}</strong>
          </div>
          <div className="profile-mini-stat">
            <span>Streak</span>
            <strong>{profile?.streak_days || 0}d</strong>
          </div>
          <div className="profile-mini-stat">
            <span>Progress</span>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="profile-xp-bar-wrap">
          <div className="profile-xp-bar-labels">
            <span>{profile?.xp || 0} XP</span>
            <span>{profile?.next_rank ? `${profile.xp_to_next || 0} to ${profile.next_rank}` : "Max rank"}</span>
          </div>
          <div className="profile-xp-bar-track">
            <div className="profile-xp-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="profile-sidebar-actions">
          <button type="button" className="profile-edit-btn primary" onClick={onEdit}>Edit Profile</button>
        </div>
      </section>
    </aside>
  );
}
