import { useEffect, useMemo, useRef, useState } from "react";
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

const RANK_LABELS = {
  recruit: "Recruit", script_kiddie: "Script Kiddie", operative: "Operative",
  hunter: "Hunter", specialist: "Specialist", analyst: "Analyst",
  architect: "Architect", operator: "Operator", ghost: "Ghost",
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
  const [msg, setMsg]         = useState("");

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
      setDays(g?.data?.days || []);
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
      setDays(g?.data?.days || []);
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

  if (loading) {
    return (
      <AppShell>
        <div className="bento">
          <div className="span-12"><TileSkeleton height={280} /></div>
          {[3,3,3,3].map((_, i) => <div key={i} className="span-3"><TileSkeleton height={110} /></div>)}
          <div className="span-12"><TileSkeleton height={260} /></div>
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
      {msg && (
        <div style={{
          padding: "10px 16px", marginBottom: 16,
          background: "rgba(110,255,214,0.08)", border: "1px solid rgba(110,255,214,0.25)",
          color: "var(--ok)", borderRadius: 12, fontSize: 13,
        }}>
          ✓ {msg}
        </div>
      )}

      {/* ── GitHub-style profile hero ── */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-tile)",
        marginBottom: 24,
        overflow: "hidden",
        boxShadow: "var(--shadow-tile)",
      }}>
        {/* Cover banner */}
        <div style={{
          height: 120,
          background: `linear-gradient(135deg,
            rgba(255,36,66,0.18) 0%,
            rgba(192,17,48,0.12) 30%,
            rgba(110,255,214,0.06) 70%,
            rgba(10,12,16,0) 100%),
            var(--bg-card-2)`,
          borderBottom: "1px solid var(--line)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative grid pattern */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Profile info row */}
        <div style={{ padding: "0 32px 28px", display: "flex", gap: 28, flexWrap: "wrap" }}>
          {/* Avatar — overlapping the banner */}
          <div style={{ marginTop: -48, flexShrink: 0 }}>
            <div style={{
              borderRadius: 20,
              border: "4px solid var(--bg-card)",
              overflow: "hidden",
              display: "inline-block",
              boxShadow: "0 0 0 1px var(--line-2)",
            }}>
              <Avatar user={profile} size={96} rounded="xl" />
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 240, paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {profile.full_name || profile.username}
                </h1>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-4)",
                  letterSpacing: "0.02em", marginTop: 2,
                }}>
                  @{profile.username}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Button variant="ghost" onClick={() => load()} size="sm">↻</Button>
                <Button variant="accent" onClick={() => setEdit(true)} size="sm">Profili redaktə et</Button>
              </div>
            </div>

            {profile.bio && (
              <p style={{
                fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65,
                marginTop: 12, marginBottom: 0, maxWidth: 560,
              }}>
                {profile.bio}
              </p>
            )}

            {/* Meta chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              <Chip tone="accent">{rankDisp}</Chip>
              {stats.leaderboard_rank > 0 && (
                <Chip tone="amber">#{stats.leaderboard_rank} qlobal</Chip>
              )}
              {(profile.country || profile.city) && (
                <Chip>
                  <span style={{ marginRight: 4 }}>📍</span>
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </Chip>
              )}
              {profile.streak_days > 0 && (
                <Chip tone="amber">🔥 {profile.streak_days}d streak</Chip>
              )}
              {stats.active_days > 0 && (
                <Chip>{stats.active_days} aktiv gün</Chip>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="bento" style={{ marginBottom: 24 }}>
        <Tile span={3} style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.05) 100%)" }}>
          <Stat label="Total XP" value={xp.toLocaleString()} size="lg" hint={`+${last30} son 30 gün`} />
        </Tile>
        <Tile span={3}>
          <Stat label="Həll edildi" value={stats.total_questions_solved || 0} size="lg"
            hint={`${stats.correct_answers || 0} doğru`} />
        </Tile>
        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Stat label="Dəqiqlik" value={Math.round(accuracy)} unit="%" size="lg" />
            <ProgressRing value={accuracy} size={56} strokeWidth={6} tone="accent" />
          </div>
        </Tile>
        <Tile span={3}>
          <Stat label="Ən yaxşı gün" value={`${stats.best_day_points || 0}`} unit="XP" size="lg"
            hint={stats.best_day_date || "Hələ yoxdur"} />
        </Tile>
      </div>

      {/* ── Rank progress ── */}
      <Tile style={{ marginBottom: 24, background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.05) 100%)" }}>
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
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 3 }}>Son 7 gün</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-1)" }}>{last7.toLocaleString()} XP</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 3 }}>Son 30 gün</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-1)" }}>{last30.toLocaleString()} XP</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 3 }}>Doğru</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ok)" }}>{stats.correct_answers || 0}</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginBottom: 3 }}>Yanlış</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--bad)" }}>{stats.wrong_answers || 0}</div>
            </div>
          </div>
        </div>
      </Tile>

      {/* ── Activity heatmap ── */}
      <Tile style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
              Activity
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-1)" }}>
              {activeDaysCount} gün{" "}
              <span style={{ color: "var(--ink-3)", fontWeight: 400, fontSize: 14 }}>
                {year ? `${year} fəaliyyəti` : "fəaliyyət"}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>
              {overall.toLocaleString()} XP · Son 7 gün: {last7} XP
            </div>
          </div>

          {years.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setYear(y); loadActivity(y); }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "var(--r-pill)",
                    border: `1px solid ${year === y ? "var(--accent-ring)" : "var(--line-2)"}`,
                    background: year === y ? "var(--accent-soft)" : "var(--bg-card-2)",
                    color: year === y ? "var(--accent)" : "var(--ink-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: year === y ? 700 : 500,
                    cursor: "pointer",
                    transition: "all var(--dur-1)",
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        <Heatmap days={days} year={year} />
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
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
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
        <EditProfileModal
          profile={profile}
          onClose={() => setEdit(false)}
          onSaved={async (m) => {
            setMsg(m); setEdit(false); await load();
            setTimeout(() => setMsg(""), 4000);
          }}
        />
      )}
    </AppShell>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const [draft, setDraft] = useState({
    full_name: profile.full_name || "",
    email: profile.email || "",
    bio: profile.bio || "",
    country: profile.country || "",
    city: profile.city || "",
    avatar_hue: Number(profile.avatar_hue) || 0,
    avatar_file: null,
    avatar_preview: profile.avatar_url || null,
    remove_avatar: false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const objUrl = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    };
  }, [onClose]);

  const update = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));
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
  };

  const submit = async (e) => {
    e.preventDefault();
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
      onSaved("Profil yeniləndi.");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Saxlamaq mümkün olmadı");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cmd-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Profili redaktə et" style={{ paddingTop: 64 }}>
      <form className="cmd" onClick={(e) => e.stopPropagation()} onSubmit={submit}
        style={{ maxWidth: 540, padding: 28, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <Avatar user={{ ...profile, avatar_url: draft.avatar_preview, avatar_hue: draft.avatar_hue }} size={64} rounded="lg" ring />
          <div>
            <h2 style={{ marginBottom: 2 }}>Profili redaktə et</h2>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Məlumatlarını yenilə.</div>
          </div>
        </div>

        {err && (
          <div style={{ fontSize: 12, color: "var(--bad)", padding: "8px 12px", background: "rgba(255,122,138,0.08)", borderRadius: 8 }}>
            {err}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Tam ad"><Input value={draft.full_name} onChange={update("full_name")} maxLength={150} /></Field>
          <Field label="Email"><Input type="email" value={draft.email} onChange={update("email")} /></Field>
        </div>

        <Field label="Bio" hint={`${(draft.bio || "").length} / 240`}>
          <Textarea value={draft.bio} onChange={update("bio")} maxLength={240} rows={3}
            placeholder="Özün haqqında..." />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ölkə"><Input value={draft.country} onChange={update("country")} /></Field>
          <Field label="Şəhər"><Input value={draft.city} onChange={update("city")} /></Field>
        </div>

        <Field label="Avatar">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="file" accept="image/*" onChange={onFile}
              style={{ flex: 1, fontSize: 12, color: "var(--ink-2)" }} />
            {draft.avatar_preview && (
              <Button variant="ghost" size="sm" type="button" onClick={removeAvatar}>Sil</Button>
            )}
          </div>
        </Field>

        <Field label={`Avatar rəng tonu (${draft.avatar_hue}°)`}>
          <input type="range" min="0" max="360" value={draft.avatar_hue} onChange={update("avatar_hue")}
            style={{ width: "100%" }} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Ləğv et</Button>
          <Button variant="accent" type="submit" disabled={saving}>
            {saving ? "Saxlanır..." : "Yadda saxla"}
          </Button>
        </div>
      </form>
    </div>
  );
}
