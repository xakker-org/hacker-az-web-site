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
import Field, { Input, Textarea, Select } from "../components/ui/Field";
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

  const load = async (y = null) => {
    setLoading(true);
    setError("");
    try {
      const [p, s, g, a] = await Promise.all([
        endpoints.myProfile(),
        endpoints.profileStats(),
        y ? endpoints.activityGraph(y) : endpoints.activityGraph(),
        endpoints.recentStudyActivity(20),
      ]);
      setProfile({ ...EMPTY_PROFILE, ...(p?.data || {}) });
      setStats({ ...EMPTY_STATS, ...(s?.data || {}) });
      setDays(g?.data?.days || []);
      setYears(g?.data?.years || []);
      setYear(g?.data?.selected_year || null);
      setActivity(a?.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Profil yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const last7 = useMemo(() => recentSum(days, 7), [days]);
  const last30 = useMemo(() => recentSum(days, 30), [days]);
  const overall = useMemo(() => days.reduce((s, d) => s + (Number(d.value) || 0), 0), [days]);

  const xp = stats.total_points_earned || profile.xp || 0;
  const accuracy = stats.accuracy_rate || 0;
  const rankDisp = RANK_LABELS[profile.rank] || profile.rank || "Recruit";

  if (loading) {
    return (
      <AppShell>
        <div className="page-head"><div><div className="page-eyebrow">Profile</div><h1 className="page-title">Yüklənir...</h1></div></div>
        <div className="bento">
          <div className="span-8"><TileSkeleton height={200} /></div>
          <div className="span-4"><TileSkeleton height={200} /></div>
          {[3,3,3,3].map((s, i) => <div key={i} className={`span-${s}`}><TileSkeleton height={120} /></div>)}
          <div className="span-12"><TileSkeleton height={240} /></div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Tile><EmptyState icon="⚠" title="Xəta" description={error} action={<Button variant="accent" onClick={() => load()}>Yenidən cəhd et</Button>} /></Tile>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Profile</div>
          <h1 className="page-title">{profile.full_name || profile.username}</h1>
          <div className="page-sub">@{profile.username} · {rankDisp}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" onClick={() => load(year)}>Yenilə</Button>
          <Button variant="accent" onClick={() => setEdit(true)}>Profili redaktə et</Button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: 12, marginBottom: 16, background: "rgba(110,255,214,0.06)", border: "1px solid rgba(110,255,214,0.28)", color: "var(--c-1)", borderRadius: 12 }}>
          {msg}
        </div>
      )}

      <div className="bento">
        <Tile span={8}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Avatar user={profile} size={84} rounded="lg" ring />
            <div style={{ flex: 1, minWidth: 220 }}>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{profile.full_name || profile.username}</h2>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.04em", marginBottom: 12 }}>
                @{profile.username} · {profile.email}
              </div>
              {profile.bio && (
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 12, maxWidth: 540 }}>
                  {profile.bio}
                </p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Chip tone="accent">{rankDisp}</Chip>
                {stats.leaderboard_rank > 0 && <Chip tone="amber">#{stats.leaderboard_rank} qlobal</Chip>}
                {(profile.country || profile.city) && <Chip>{[profile.country, profile.city].filter(Boolean).join(", ")}</Chip>}
                {profile.streak_days > 0 && <Chip tone="amber">🔥 {profile.streak_days}d</Chip>}
              </div>
            </div>
          </div>
        </Tile>

        <Tile span={4}>
          <TileHead eyebrow="Rank progress" title={rankDisp} sub={profile.next_rank ? `→ ${RANK_LABELS[profile.next_rank] || profile.next_rank}` : "MAX"} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
            <ProgressRing value={profile.rank_progress || 0} size={120} strokeWidth={10} tone="accent" label={`${profile.rank_progress || 0}%`} sub="rank" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", marginBottom: 4 }}>NEXT RANK</div>
              <div className="mono tnum" style={{ fontSize: 17, color: "var(--accent)", fontWeight: 700 }}>+{profile.xp_to_next || 0} XP</div>
              <Bar value={profile.rank_progress || 0} tone="accent" />
            </div>
          </div>
        </Tile>

        <Tile span={3}><Stat label="Total XP" value={xp.toLocaleString()} size="lg" /></Tile>
        <Tile span={3}><Stat label="Solved" value={stats.total_questions_solved || 0} size="lg" hint={`${stats.correct_answers || 0} doğru`} /></Tile>
        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Stat label="Accuracy" value={Math.round(accuracy)} unit="%" size="lg" />
            <ProgressRing value={accuracy} size={56} strokeWidth={6} tone="mint" />
          </div>
        </Tile>
        <Tile span={3}><Stat label="Active days" value={stats.active_days || 0} size="lg" hint={stats.best_day_date ? `Ən yaxşı: ${stats.best_day_date}` : ""} /></Tile>

        <Tile span={12}>
          <TileHead
            eyebrow="Activity"
            title="İlin xəritəsi"
            sub={`${days.filter(d => Number(d.value) > 0).length} aktiv gün · ${overall} XP`}
            action={
              years.length > 0 && (
                <Select value={year || ""} onChange={(e) => { const y = Number(e.target.value); setYear(y); load(y); }} style={{ width: "auto", minWidth: 100 }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
              )
            }
          />
          <Heatmap days={days} weeks={53} />
        </Tile>

        <Tile span={8}>
          <TileHead eyebrow="Recent" title="Son fəaliyyət" />
          {activity.length === 0 ? (
            <EmptyState icon="◍" title="Hələ fəaliyyət yoxdur" description="Sual cavablamaqla başla." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activity.slice(0, 10).map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 9 ? "1px solid var(--line)" : "none" }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: it.is_correct ? "rgba(110,255,214,0.10)" : "rgba(255,122,138,0.10)",
                    border: `1px solid ${it.is_correct ? "rgba(110,255,214,0.28)" : "rgba(255,122,138,0.28)"}`,
                    color: it.is_correct ? "var(--c-1)" : "var(--c-4)",
                    display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0,
                  }}>{it.is_correct ? "✓" : "✗"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.question_title || it.title}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{it.course_name || ""} · {it.attempted_at?.slice(0, 10) || ""}</div>
                  </div>
                  {it.points_earned > 0 && <span className="mono tnum" style={{ fontSize: 11, color: "var(--accent)" }}>+{it.points_earned}</span>}
                </div>
              ))}
            </div>
          )}
        </Tile>

        <Tile span={4}>
          <TileHead eyebrow="Performance" title="Xülasə" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Last 7 days</div>
              <Bar value={last7} max={Math.max(last30, 1)} tone="mint" rightCaption={`${last7} XP`} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Last 30 days</div>
              <Bar value={last30} max={Math.max(overall, 1)} tone="accent" rightCaption={`${last30} XP`} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Overall</div>
              <Bar value={overall} max={Math.max(overall, 1)} tone="amber" rightCaption={`${overall} XP`} />
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}>
              <Stat size="sm" label="Best day" value={`${stats.best_day_points || 0} XP`} hint={stats.best_day_date} />
            </div>
          </div>
        </Tile>
      </div>

      {edit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEdit(false)}
          onSaved={async (m) => { setMsg(m); setEdit(false); await load(year); setTimeout(() => setMsg(""), 4000); }}
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
          bio: draft.bio,
          full_name: draft.full_name,
          email: draft.email,
          country: draft.country,
          city: draft.city,
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
      <form className="cmd" onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ maxWidth: 540, padding: 24, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <Avatar
            user={{ ...profile, avatar_url: draft.avatar_preview, avatar_hue: draft.avatar_hue }}
            size={64}
            rounded="lg"
            ring
          />
          <div>
            <h2 style={{ marginBottom: 2 }}>Profili redaktə et</h2>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Məlumatlarını yenilə.</div>
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: "var(--c-4)", padding: 8, background: "rgba(255,122,138,0.08)", borderRadius: 8 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Tam ad"><Input value={draft.full_name} onChange={update("full_name")} maxLength={150} /></Field>
          <Field label="Email"><Input type="email" value={draft.email} onChange={update("email")} /></Field>
        </div>

        <Field label="Bio" hint={`${(draft.bio || "").length} / 240`}>
          <Textarea value={draft.bio} onChange={update("bio")} maxLength={240} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ölkə"><Input value={draft.country} onChange={update("country")} /></Field>
          <Field label="Şəhər"><Input value={draft.city} onChange={update("city")} /></Field>
        </div>

        <Field label="Avatar">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="file" accept="image/*" onChange={onFile} style={{ flex: 1, fontSize: 12, color: "var(--ink-2)" }} />
            {draft.avatar_preview && (
              <Button variant="ghost" size="sm" type="button" onClick={removeAvatar}>Sil</Button>
            )}
          </div>
        </Field>

        <Field label={`Avatar rəng tonu (${draft.avatar_hue}°)`} hint="Avatar arxasındakı rəng">
          <input
            type="range" min="0" max="360"
            value={draft.avatar_hue}
            onChange={update("avatar_hue")}
            style={{ width: "100%" }}
          />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="ghost" type="button" onClick={onClose}>Ləğv et</Button>
          <Button variant="accent" type="submit" disabled={saving}>{saving ? "Saxlanır..." : "Yadda saxla"}</Button>
        </div>
      </form>
    </div>
  );
}
