import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Heatmap from "../components/ui/Heatmap";
import Avatar from "../components/ui/Avatar";
import { Chip } from "../components/ui/Chip";
import Button from "../components/ui/Button";
import Field, { Input, Textarea } from "../components/ui/Field";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";
import "../styles/profile-edit.css";

const RANK_LABELS = {
  recruit: "Recruit", script_kiddie: "Script Kiddie", operative: "Operative",
  hunter: "Hunter", specialist: "Specialist", analyst: "Analyst",
  architect: "Architect", operator: "Operator", ghost: "Ghost",
};

const COVER_PRESETS = {
  default: {
    name: "Default",
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(255,36,66,0.22) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(110,255,214,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(192,132,252,0.06) 0%, transparent 40%),
      var(--bg-card-2)
    `,
  },
  matrix: {
    name: "Matrix",
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(25,195,125,0.2) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(110,255,214,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(0,200,83,0.06) 0%, transparent 40%),
      var(--bg-card-2)
    `,
  },
  cyber: {
    name: "Cyber",
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(0,150,255,0.22) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(100,200,255,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(0,100,200,0.06) 0%, transparent 40%),
      var(--bg-card-2)
    `,
  },
  phantom: {
    name: "Phantom",
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(160,80,255,0.2) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(200,150,255,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(120,50,200,0.06) 0%, transparent 40%),
      var(--bg-card-2)
    `,
  },
  blood: {
    name: "Blood",
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(200,0,30,0.25) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(255,80,80,0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 60% 80%, rgba(150,0,0,0.08) 0%, transparent 40%),
      var(--bg-card-2)
    `,
  },
};

const RANK_ICONS = {
  recruit: "◌", script_kiddie: "◎", operative: "◉", hunter: "⊕",
  specialist: "⊗", analyst: "⊘", architect: "⊙", operator: "⊛", ghost: "✦",
};

const EMPTY_PROFILE = {
  username: "", email: "", full_name: "", bio: "", country: "", city: "",
  avatar_hue: 0, xp: 0, rank: "recruit", streak_days: 0,
};
const EMPTY_STATS = {
  total_questions_solved: 0, total_attempts: 0, correct_answers: 0,
  wrong_answers: 0, accuracy_rate: 0, total_points_earned: 0,
  leaderboard_rank: 0, active_days: 0, best_day_points: 0, best_day_date: null,
};

function recentSum(days, n) {
  if (!days?.length) return 0;
  return days.slice(-n).reduce((s, d) => s + (Number(d.value) || 0), 0);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [stats, setStats]     = useState(EMPTY_STATS);
  const [days, setDays]       = useState([]);
  const [years, setYears]     = useState([]);
  const [year, setYear]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [edit, setEdit]       = useState(false);
  const [toast, setToast]     = useState(null);
  const [coverPreset, setCoverPreset] = useState(
    () => localStorage.getItem("xk-cover-preset") || "default"
  );

  const THIS_YEAR = new Date().getFullYear();

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [p, s, g, a] = await Promise.all([
        endpoints.myProfile(),
        endpoints.profileStats(),
        endpoints.activityGraph(),
        endpoints.recentStudyActivity(20),
      ]);
      setProfile({ ...EMPTY_PROFILE, ...(p?.data || {}) });
      setStats({ ...EMPTY_STATS, ...(s?.data || {}) });
      setDays((g?.data?.days || []).map(d => ({ ...d, value: d.points_earned || 0 })));
      const backendYears = g?.data?.years || [];
      setYears(backendYears.length > 0 ? backendYears : [THIS_YEAR]);
      setYear(g?.data?.selected_year || THIS_YEAR);
      setActivity(a?.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Profil yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async (y) => {
    try {
      const g = await endpoints.activityGraph(y);
      setDays((g?.data?.days || []).map(d => ({ ...d, value: d.points_earned || 0 })));
      const backendYears = g?.data?.years || [];
      if (backendYears.length > 0) setYears(backendYears);
      setYear(g?.data?.selected_year || y);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const last7   = useMemo(() => recentSum(days, 7), [days]);
  const last30  = useMemo(() => recentSum(days, 30), [days]);
  const overall = useMemo(() => days.reduce((s, d) => s + (Number(d.value) || 0), 0), [days]);
  const activeDaysCount = useMemo(() => days.filter(d => Number(d.value) > 0).length, [days]);

  const xp       = stats.total_points_earned || profile.xp || 0;
  const accuracy = stats.accuracy_rate || 0;
  const rankDisp = RANK_LABELS[profile.rank] || profile.rank || "Recruit";
  const rankIcon = RANK_ICONS[profile.rank] || "◌";

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="bento">
          <div className="span-12"><TileSkeleton height={300} /></div>
          {[3,3,3,3].map((_, i) => <div key={i} className="span-3"><TileSkeleton height={120} /></div>)}
          <div className="span-12"><TileSkeleton height={280} /></div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="⚠" title="Xəta" description={error}
            action={<Button variant="accent" onClick={() => load()}>Yenidən cəhd et</Button>} />
        </Tile>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          padding: "12px 20px",
          background: toast.type === "ok" ? "rgba(110,255,214,0.10)" : "rgba(255,122,138,0.10)",
          border: `1px solid ${toast.type === "ok" ? "rgba(110,255,214,0.3)" : "rgba(255,122,138,0.3)"}`,
          color: toast.type === "ok" ? "var(--ok)" : "var(--bad)",
          borderRadius: 14, fontSize: 13, fontWeight: 600,
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeInUp 0.2s ease",
        }}>
          <span>{toast.type === "ok" ? "✓" : "✗"}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Profile Hero ── */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-tile)",
        marginBottom: 20,
        overflow: "hidden",
        boxShadow: "var(--shadow-tile)",
        position: "relative",
      }}>
        {/* Cover banner */}
        <div style={{
          height: 160,
          background: COVER_PRESETS[coverPreset]?.gradient || COVER_PRESETS.default.gradient,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Dot pattern */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.035 }}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          {/* Accent line at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, var(--accent) 0%, rgba(255,36,66,0.2) 40%, transparent 100%)",
          }} />
        </div>

        <div style={{ padding: "0 32px 32px" }}>
          {/* Avatar + Action row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginTop: -52, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                borderRadius: 22,
                border: "4px solid var(--bg-card)",
                overflow: "hidden",
                display: "inline-block",
                boxShadow: "0 0 0 1px var(--line-2), 0 8px 24px rgba(0,0,0,0.4)",
              }}>
                <Avatar user={profile} size={104} rounded="xl" />
              </div>
              {/* Rank badge */}
              <div style={{
                position: "absolute", bottom: -4, right: -4,
                background: "var(--accent)", color: "var(--accent-ink)",
                borderRadius: 10, border: "3px solid var(--bg-card)",
                width: 28, height: 28, display: "grid", placeItems: "center",
                fontSize: 13, fontWeight: 700,
              }}>
                {rankIcon}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
              <Button variant="ghost" onClick={() => load()} size="sm" title="Yenilə">
                ↻
              </Button>
              <Button variant="accent" onClick={() => setEdit(true)} size="sm">
                Redaktə et
              </Button>
            </div>
          </div>

          {/* Name + meta */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                {profile.full_name || profile.username || "İsimsiz"}
              </h1>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-4)" }}>
                @{profile.username}
              </span>
            </div>

            {profile.bio && (
              <p style={{
                fontSize: 14, color: "var(--ink-3)", lineHeight: 1.7,
                marginTop: 10, marginBottom: 0, maxWidth: 580,
              }}>
                {profile.bio}
              </p>
            )}

            {/* Chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              <Chip tone="accent">{rankIcon} {rankDisp}</Chip>
              {stats.leaderboard_rank > 0 && (
                <Chip tone="amber">#{stats.leaderboard_rank} qlobal</Chip>
              )}
              {(profile.country || profile.city) && (
                <Chip>
                  <span style={{ marginRight: 4 }}>📍</span>
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </Chip>
              )}
              {profile.email && (
                <Chip>
                  <span style={{ marginRight: 4 }}>✉</span>
                  {profile.email}
                </Chip>
              )}
              {profile.streak_days > 0 && (
                <Chip tone="amber">🔥 {profile.streak_days} gün streak</Chip>
              )}
            </div>

            {/* Inline quick stats */}
            <div style={{
              display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap",
              paddingTop: 20, borderTop: "1px solid var(--line)",
            }}>
              {[
                { label: "Ümumi XP", value: xp.toLocaleString() },
                { label: "Həll edildi", value: stats.total_questions_solved || 0 },
                { label: "Dəqiqlik", value: `${Math.round(accuracy)}%` },
                { label: "Aktiv gün", value: activeDaysCount },
                { label: "Streak", value: `🔥 ${profile.streak_days || 0}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="bento" style={{ marginBottom: 20 }}>
        <Tile span={3} style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.06) 100%)" }}>
          <Stat label="Total XP" value={xp.toLocaleString()} size="lg" hint={`+${last30} son 30 gün`} />
        </Tile>
        <Tile span={3}>
          <Stat label="Həll edildi" value={stats.total_questions_solved || 0} size="lg"
            hint={`${stats.total_attempts || 0} cəhd`} />
        </Tile>
        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Stat label="Dəqiqlik" value={Math.round(accuracy)} unit="%" size="lg"
              hint={`${stats.correct_answers || 0} doğru`} />
            <ProgressRing value={accuracy} size={60} strokeWidth={6} tone="accent" />
          </div>
        </Tile>
        <Tile span={3}>
          <Stat label="Ən yaxşı gün" value={`${stats.best_day_points || 0}`} unit="XP" size="lg"
            hint={stats.best_day_date || "Hələ yoxdur"} />
        </Tile>
      </div>

      {/* ── Rank progress ── */}
      <Tile style={{ marginBottom: 20, background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.05) 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <ProgressRing
            value={profile.rank_progress || 0}
            size={100}
            strokeWidth={9}
            tone="accent"
            label={`${profile.rank_progress || 0}%`}
            sub="rank"
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              Rank irəliləyişi
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-1)", marginBottom: 2 }}>
              {rankDisp}
            </div>
            {profile.next_rank && (
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>
                → {RANK_LABELS[profile.next_rank] || profile.next_rank}
                {profile.xp_to_next > 0 && (
                  <span className="mono tnum" style={{ color: "var(--accent)", marginLeft: 8, fontWeight: 700 }}>
                    +{profile.xp_to_next.toLocaleString()} XP lazımdır
                  </span>
                )}
              </div>
            )}
            <Bar value={profile.rank_progress || 0} tone="accent" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, minWidth: 200 }}>
            {[
              { label: "Son 7 gün", value: `${last7.toLocaleString()} XP` },
              { label: "Son 30 gün", value: `${last30.toLocaleString()} XP` },
              { label: "Doğru", value: stats.correct_answers || 0, color: "var(--ok)" },
              { label: "Yanlış", value: stats.wrong_answers || 0, color: "var(--bad)" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: color || "var(--ink-1)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </Tile>

      {/* ── Activity heatmap ── */}
      <Tile style={{ marginBottom: 20 }}>
        <Heatmap
          days={days}
          year={year}
          years={years}
          onYearChange={(y) => { setYear(y); loadActivity(y); }}
        />
      </Tile>

      {/* ── Recent activity + performance ── */}
      <div className="bento">
        <Tile span={8}>
          <TileHead eyebrow="Recent" title="Son fəaliyyət" />
          {activity.length === 0 ? (
            <EmptyState icon="◍" title="Hələ fəaliyyət yoxdur" description="Sual cavablamaqla başla." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activity.slice(0, 12).map((it, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0",
                  borderBottom: i < Math.min(activity.length - 1, 11) ? "1px solid var(--line)" : "none",
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: it.is_correct ? "rgba(110,255,214,0.08)" : "rgba(255,122,138,0.08)",
                    border: `1px solid ${it.is_correct ? "rgba(110,255,214,0.25)" : "rgba(255,122,138,0.25)"}`,
                    color: it.is_correct ? "var(--ok)" : "var(--bad)",
                    display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700,
                  }}>{it.is_correct ? "✓" : "✗"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.question_title || it.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                      {it.course_name || ""}{it.course_name && " · "}{it.attempted_at?.slice(0, 10) || ""}
                    </div>
                  </div>
                  {it.points_earned > 0 && (
                    <span className="mono tnum" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>
                      +{it.points_earned}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Tile>

        <Tile span={4}>
          <TileHead eyebrow="Performance" title="Xülasə" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Son 7 gün", value: last7, max: Math.max(last30, 1), tone: "accent", caption: `${last7} XP` },
              { label: "Son 30 gün", value: last30, max: Math.max(overall, 1), tone: "accent", caption: `${last30} XP` },
              { label: "Ümumi", value: overall, max: Math.max(overall, 1), tone: "mint", caption: `${overall.toLocaleString()} XP` },
            ].map(({ label, value, max, tone, caption }) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                  {label}
                </div>
                <Bar value={value} max={max} tone={tone} rightCaption={caption} />
              </div>
            ))}

            <div style={{ paddingTop: 12, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Cəhd", value: stats.total_attempts || 0, color: "var(--ink-1)" },
                { label: "Streak", value: `🔥 ${profile.streak_days || 0}`, color: "var(--warn)" },
                { label: "Aktiv gün", value: activeDaysCount, color: "var(--c-5)" },
                { label: "Ən yaxşı", value: `${stats.best_day_points || 0} XP`, color: "var(--c-3)" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Tile>
      </div>

      {edit && (
        <EditProfilePanel
          profile={profile}
          coverPreset={coverPreset}
          onCoverChange={setCoverPreset}
          onClose={() => setEdit(false)}
          onSaved={async (msg) => {
            setEdit(false);
            await load();
            showToast(msg, "ok");
          }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </AppShell>
  );
}

/* ─────────────────────────────────────────────── */
/*  Edit Profile Panel — full-height slide-over   */
/* ─────────────────────────────────────────────── */

const HUE_PRESETS = [0, 30, 60, 120, 160, 200, 240, 280, 320];

/* ─────────────────────────────────────────────── */
/*  Edit Profile Panel — full-height slide-over   */
/* ─────────────────────────────────────────────── */

function EditProfilePanel({ profile, coverPreset: cp, onCoverChange, onClose, onSaved, onError }) {
  const [draft, setDraft] = useState({
    full_name:      profile.full_name || "",
    email:          profile.email || "",
    bio:            profile.bio || "",
    country:        profile.country || "",
    city:           profile.city || "",
    avatar_hue:     Number(profile.avatar_hue) || 0,
    avatar_file:    null,
    avatar_preview: profile.avatar_url || null,
    remove_avatar:  false,
  });
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [tab, setTab]           = useState("info");
  const [dragOver, setDragOver] = useState(false);
  const [tabKey, setTabKey]     = useState(0);
  const [coverPreset, setCoverPreset] = useState(cp || "default");
  const objUrl  = useRef(null);
  const fileRef = useRef(null);

  const submitRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submitRef.current?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    };
  }, [onClose]);

  const switchTab = useCallback((t) => {
    setTabKey(k => k + 1);
    setTab(t);
  }, []);

  const set = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    if (objUrl.current) { URL.revokeObjectURL(objUrl.current); objUrl.current = null; }
    const preview = f ? URL.createObjectURL(f) : null;
    objUrl.current = preview;
    setDraft(d => ({ ...d, avatar_file: f, avatar_preview: preview || d.avatar_preview, remove_avatar: false }));
  };

  const removeAvatar = () => {
    if (objUrl.current) { URL.revokeObjectURL(objUrl.current); objUrl.current = null; }
    setDraft(d => ({ ...d, avatar_file: null, avatar_preview: null, remove_avatar: true }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || null;
    if (f && f.type.startsWith("image/")) {
      if (objUrl.current) { URL.revokeObjectURL(objUrl.current); objUrl.current = null; }
      const preview = URL.createObjectURL(f);
      objUrl.current = preview;
      setDraft(d => ({ ...d, avatar_file: f, avatar_preview: preview, remove_avatar: false }));
    }
  };

  const selectCover = (key) => {
    setCoverPreset(key);
    localStorage.setItem("xk-cover-preset", key);
    onCoverChange?.(key);
  };

  const submit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSaving(true); setErr("");
    try {
      let payload;
      if (draft.avatar_file) {
        payload = new FormData();
        ["bio","full_name","email","country","city"].forEach(k => payload.append(k, draft[k] || ""));
        payload.append("avatar_hue", Number(draft.avatar_hue) || 0);
        payload.append("avatar", draft.avatar_file);
        payload.append("remove_avatar", "false");
      } else {
        payload = {
          bio: draft.bio, full_name: draft.full_name, email: draft.email,
          country: draft.country, city: draft.city,
          avatar_hue: Number(draft.avatar_hue) || 0,
          remove_avatar: Boolean(draft.remove_avatar),
        };
      }
      await endpoints.updateProfile(payload);
      onSaved("Profil uğurla yeniləndi");
    } catch (e) {
      const msg = e?.response?.data?.detail || "Saxlamaq mümkün olmadı";
      setErr(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  submitRef.current = submit;

  const previewUser = { ...profile, avatar_url: draft.avatar_preview, avatar_hue: draft.avatar_hue };

  const bioLen = (draft.bio || "").length;

  const TABS = [
    { key: "info",   label: "Məlumat",  icon: "◈" },
    { key: "avatar", label: "Avatar",    icon: "◎" },
    { key: "look",   label: "Görünüş",  icon: "✦" },
  ];

  const coverKeys = Object.keys(COVER_PRESETS);

  return (
    <div className="edit-panel-overlay edit-overlay-fade" onClick={onClose}
      role="dialog" aria-modal="true" aria-label="Profili redaktə et">
      <div className="edit-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="edit-header">
          <div>
            <h2>Profili redaktə et</h2>
            <div className="edit-username">@{profile.username}</div>
          </div>
          <button className="edit-close" type="button" onClick={onClose} aria-label="Bağla">✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="edit-tabs">
          {TABS.map(t => (
            <button key={t.key} type="button"
              className={`edit-tab-btn${tab === t.key ? " active" : ""}`}
              onClick={() => switchTab(t.key)}>
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {err && (
          <div className="edit-error">
            <span>⚠</span>
            {err}
          </div>
        )}

        {/* ── Body ── */}
        <div className="edit-body" key={tabKey}>
          <div className="edit-tab-content edit-tab-enter">

            {/* ════════════════ TAB: Məlumat ════════════════ */}
            {tab === "info" && (
              <>
                {/* Quick preview card */}
                <div className="edit-quick-preview">
                  <div className="edit-qp-avatar">
                    <Avatar user={previewUser} size={72} rounded="xl" />
                  </div>
                  <div className="edit-qp-info">
                    <div className="edit-qp-name">{draft.full_name || profile.username || "İsimsiz"}</div>
                    <div className="edit-qp-handle">@{profile.username}</div>
                  </div>
                  <Button variant="ghost" size="sm" type="button" onClick={() => switchTab("avatar")}>
                    Avatar
                  </Button>
                </div>

                {/* Full name + email */}
                <div className="edit-form-row">
                  <Field label="Tam ad">
                    <Input value={draft.full_name} onChange={set("full_name")}
                      placeholder="Ad Soyad" maxLength={150} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={draft.email}
                      onChange={set("email")} placeholder="email@example.com" />
                  </Field>
                </div>

                {/* Bio */}
                <Field label="Bio">
                  <Textarea value={draft.bio} onChange={set("bio")}
                    maxLength={240} rows={4} placeholder="Özün haqqında bir neçə söz..." />
                  <div className={`edit-bio-count${bioLen > 200 ? " near" : ""}${bioLen >= 240 ? " full" : ""}`}>
                    {bioLen} / 240
                  </div>
                </Field>

                {/* Country + city */}
                <div className="edit-form-row">
                  <Field label="Ölkə">
                    <Input value={draft.country} onChange={set("country")} placeholder="Azərbaycan" />
                  </Field>
                  <Field label="Şəhər">
                    <Input value={draft.city} onChange={set("city")} placeholder="Bakı" />
                  </Field>
                </div>

                {/* Username (readonly) */}
                <Field label="İstifadəçi adı" hint="Dəyişdirilə bilməz">
                  <Input value={profile.username} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
                </Field>
              </>
            )}

            {/* ════════════════ TAB: Avatar ════════════════ */}
            {tab === "avatar" && (
              <div className="edit-avatar-section">
                {/* Drop zone */}
                <div className={`edit-avatar-dropzone${dragOver ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}>
                  <Avatar user={previewUser} size={140} rounded="xl" />
                  <div className="drop-hint">
                    <span className="drop-icon">{dragOver ? "⊕" : "↻"}</span>
                    {dragOver ? "Buraxın" : "Şəkil yüklə"}
                  </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*"
                  onChange={onFile} style={{ display: "none" }} />

                {/* Action buttons */}
                <div className="edit-avatar-actions">
                  <Button variant="ghost" size="sm" type="button"
                    onClick={() => fileRef.current?.click()}>
                    Şəkil seç
                  </Button>
                  {draft.avatar_file && (
                    <Button variant="ghost" size="sm" type="button" onClick={removeAvatar}>
                      Avatarı sil
                    </Button>
                  )}
                  {draft.avatar_preview && !draft.avatar_file && (
                    <Button variant="ghost" size="sm" type="button" onClick={removeAvatar}>
                      Avatarı sil
                    </Button>
                  )}
                </div>

                {draft.avatar_file && (
                  <div className="edit-avatar-filename">
                    ✓ {draft.avatar_file.name}
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "center", marginTop: -8 }}>
                  PNG, JPG, WEBP · Maks 2MB
                </div>

                {/* Hue */}
                <div className="edit-hue-section">
                  <div className="edit-section-label">Avatar rəng tonu</div>

                  <div className="edit-hue-presets">
                    {HUE_PRESETS.map(h => (
                      <button key={h} type="button"
                        className={`edit-hue-swatch${Math.abs(draft.avatar_hue - h) < 15 ? " selected" : ""}`}
                        onClick={() => setDraft(d => ({ ...d, avatar_hue: h }))}
                        title={`${h}°`}
                        style={{ background: `hsl(${h}, 70%, 50%)` }} />
                    ))}
                  </div>

                  <div className="edit-hue-slider-row">
                    <input type="range" min="0" max="360"
                      value={draft.avatar_hue}
                      onChange={set("avatar_hue")}
                      className="edit-hue-slider" />
                    <span className="edit-hue-value">{draft.avatar_hue}°</span>
                    <span className="edit-hue-swatch-current"
                      style={{ background: `hsl(${draft.avatar_hue}, 70%, 50%)` }} />
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════ TAB: Görünüş ════════════════ */}
            {tab === "look" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Cover presets */}
                <div className="edit-cover-section">
                  <div className="edit-section-label" style={{ marginBottom: 12 }}>
                    Cover gradient
                  </div>
                  <div className="edit-cover-grid">
                    {coverKeys.map(key => {
                      const c = COVER_PRESETS[key];
                      return (
                        <button key={key} type="button"
                          className={`edit-cover-preset${coverPreset === key ? " active" : ""}`}
                          onClick={() => selectCover(key)}
                          style={{ background: c.gradient }}>
                          <span className="cover-name">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="edit-cover-preview"
                    style={{ background: COVER_PRESETS[coverPreset]?.gradient || COVER_PRESETS.default.gradient }} />
                </div>

                {/* Avatar hue quick preview */}
                <div className="edit-hue-section">
                  <div className="edit-section-label" style={{ marginBottom: 12 }}>
                    Profil rəng tonu
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16,
                    padding: "14px 18px", background: "var(--bg-card-2)",
                    borderRadius: 12, border: "1px solid var(--line)" }}>
                    <Avatar user={previewUser} size={48} rounded="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)" }}>
                        {draft.full_name || profile.username || "İsimsiz"}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-4)", marginTop: 1 }}>
                        {draft.avatar_hue}° hue
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" type="button"
                      onClick={() => switchTab("avatar")}>
                      Dəyiş
                    </Button>
                  </div>
                </div>

                {/* Hint */}
                <div style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)",
                  fontSize: 12, color: "var(--ink-4)", lineHeight: 1.6,
                }}>
                  Cover gradient and accent changes are saved locally
                  and will appear on your profile page.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="edit-footer">
          <div className="kbd-hint">
            <kbd>Esc</kbd> to close
            <span style={{ marginLeft: 8 }}><kbd>{navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+↵</kbd> to save</span>
          </div>
          <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Ləğv et
          </Button>
          <Button variant="accent" type="button" onClick={submit} disabled={saving}>
            {saving ? "Saxlanır..." : "Dəyişiklikləri saxla"}
          </Button>
        </div>
      </div>
    </div>
  );
}
