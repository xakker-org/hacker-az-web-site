import { useEffect, useState } from "react";

function formatJoinDate(value) {
  if (!value) return "Unknown join date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown join date";
  return `Joined ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function ProfileHeader({ profile, stats }) {
  const displayName = profile?.full_name || profile?.username || "Student";
  const username = profile?.username ? `@${profile.username}` : "@student";
  const avatarUrl = profile?.avatar_url || null;
  const avatarHue = Number(profile?.avatar_hue) || 0;
  const initial = (profile?.username || "H").slice(0, 1).toUpperCase();
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  return (
    <section className="profile-panel profile-header-panel">
      <div className="profile-header-banner">
        <div className="profile-header-banner-orb profile-header-banner-orb-a" aria-hidden="true" />
        <div className="profile-header-banner-orb profile-header-banner-orb-b" aria-hidden="true" />
        <div className="profile-header-top">
          <div>
            <div className="profile-header-kicker">Profile overview</div>
            <h1 className="profile-header-name">{displayName}</h1>
            <p className="profile-header-username">{username}</p>
            <p className="profile-header-bio">{profile?.bio || "No bio added yet. Add a short intro and make the profile feel alive."}</p>
          </div>

          <div className="profile-header-badges">
            {avatarUrl && !avatarFailed ? (
              <img
                className="profile-header-avatar"
                src={avatarUrl}
                alt={profile?.username || "avatar"}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div
                className="profile-header-avatar profile-header-avatar-fallback"
                style={{ background: `linear-gradient(135deg, hsl(${avatarHue} 75% 56%), hsl(${(avatarHue + 60) % 360} 82% 62%))` }}
                aria-hidden="true"
              >
                {initial}
              </div>
            )}
            <span className="profile-rank-badge">{profile?.rank || "Recruit"}</span>
            <span className="profile-header-pill">#{stats?.leaderboard_rank || "-"} Leaderboard</span>
            {profile?.country && <span className="profile-header-pill">{profile.country}</span>}
            {profile?.city && <span className="profile-header-pill">{profile.city}</span>}
          </div>
        </div>
      </div>

      <div className="profile-header-meta-grid">
        <span className="profile-header-meta-item">{formatJoinDate(profile?.date_joined)}</span>
        <span className="profile-header-meta-item">{profile?.email || "No email"}</span>
        <span className="profile-header-meta-item">{profile?.tasks_completed || 0} tasks completed</span>
        <span className="profile-header-meta-item">{profile?.rooms_completed || 0} rooms completed</span>
      </div>
    </section>
  );
}
