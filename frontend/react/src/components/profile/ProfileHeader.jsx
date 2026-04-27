function formatJoinDate(value) {
  if (!value) return "Unknown join date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown join date";
  return `Joined ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function ProfileHeader({ profile, stats }) {
  const displayName = profile?.full_name || profile?.username || "Student";
  const username = profile?.username ? `@${profile.username}` : "@student";

  return (
    <section className="profile-panel profile-header-panel">
      <div className="profile-header-top">
        <div>
          <h1 className="profile-header-name">{displayName}</h1>
          <p className="profile-header-username">{username}</p>
          <p className="profile-header-bio">{profile?.bio || "No bio added yet."}</p>
        </div>
        <div className="profile-header-badges">
          <span className="profile-rank-badge">{profile?.rank || "Recruit"}</span>
          <span className="profile-header-pill">#{stats?.leaderboard_rank || "-"} Leaderboard</span>
        </div>
      </div>
      <div className="profile-header-meta-row">
        <span className="profile-header-meta-item">{formatJoinDate(profile?.date_joined)}</span>
        <span className="profile-header-meta-item">{profile?.email || "No email"}</span>
      </div>
    </section>
  );
}
