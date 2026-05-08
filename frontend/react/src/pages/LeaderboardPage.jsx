import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    eyebrow: "Leaderboard", title: "Liderlik cədvəli",
    sub: "XP qazanaraq zirvəyə çıx. Hər doğru cavab yeni pillə deməkdir.",
    yourPos: "Sizin mövqe", pos: "Mövqe",
    notInRank: "Reytinqdə yoxsan",
    notInRankDesc: "Sual cavablamağa başla, top 100-ə daxil ol.",
    podium: "Podium",
    top3: "Top 3",
    atLeast3: "Ən az 3 istifadəçi olmalıdır",
    user: "İstifadəçi",
    searchPlaceholder: "İstifadəçi axtar...",
    notFound: "Heç kim tapılmadı",
    notFoundDesc: "Axtarışı dəyişdir.",
    you: "siz",
    loading: "Yüklənir...",
  },
  en: {
    eyebrow: "Leaderboard", title: "Rankings",
    sub: "Earn XP to climb to the top. Every correct answer is a new step.",
    yourPos: "Your position", pos: "Position",
    notInRank: "Not in ranking",
    notInRankDesc: "Start answering questions to enter the top 100.",
    podium: "Podium",
    top3: "Top 3",
    atLeast3: "Need at least 3 users",
    user: "User",
    searchPlaceholder: "Search user...",
    notFound: "No one found",
    notFoundDesc: "Try a different search.",
    you: "you",
    loading: "Loading...",
  },
};
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import ProgressRing from "../components/ui/ProgressRing";
import Tabs from "../components/ui/Tabs";
import Avatar from "../components/ui/Avatar";
import { Chip } from "../components/ui/Chip";
import DataTable from "../components/ui/DataTable";
import { Input } from "../components/ui/Field";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";

const RANK_LABELS = {
  recruit: "Recruit", script_kiddie: "Script Kiddie", operative: "Operative",
  hunter: "Hunter", specialist: "Specialist", analyst: "Analyst",
  architect: "Architect", operator: "Operator", ghost: "Ghost",
};

const TABS = [
  { value: "xp",     label: "XP"     },
  { value: "tasks",  label: "Tasks"  },
  { value: "rooms",  label: "Rooms"  },
  { value: "streak", label: "Streak" },
];

const PODIUM_META = [
  { bg: "linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.04) 100%)", border: "rgba(255,215,0,0.30)", color: "#FFD700", medal: "🥇", order: 1 },
  { bg: "linear-gradient(135deg, rgba(192,192,192,0.10) 0%, rgba(192,192,192,0.03) 100%)", border: "rgba(192,192,192,0.25)", color: "#C0C0C0", medal: "🥈", order: 0 },
  { bg: "linear-gradient(135deg, rgba(205,127,50,0.10) 0%, rgba(205,127,50,0.03) 100%)", border: "rgba(205,127,50,0.22)", color: "#CD7F32", medal: "🥉", order: 2 },
];

export default function LeaderboardPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [entries, setEntries] = useState([]);
  const [me, setMe]       = useState(null);
  const [tab, setTab]     = useState("xp");
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      endpoints.leaderboard(100),
      endpoints.me().catch(() => null),
    ]).then(([lb, m]) => {
      if (!mounted) return;
      setEntries(lb.data?.entries || []);
      setMe(m?.data?.username || null);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const sorted = useMemo(() => {
    const a = [...entries];
    if (tab === "tasks")  return a.sort((x, y) => (y.tasks_completed || 0) - (x.tasks_completed || 0));
    if (tab === "rooms")  return a.sort((x, y) => (y.rooms_completed || 0) - (x.rooms_completed || 0));
    if (tab === "streak") return a.sort((x, y) => (y.streak_days || 0) - (x.streak_days || 0));
    return a;
  }, [entries, tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(e => `${e.username} ${RANK_LABELS[e.rank] || ""} ${e.country || ""}`.toLowerCase().includes(q));
  }, [sorted, search]);

  const myEntry = useMemo(() => entries.find(e => e.username === me), [entries, me]);
  const myPos   = useMemo(() => sorted.findIndex(e => e.username === me) + 1, [sorted, me]);
  const top3    = sorted.slice(0, 3);
  const showPodium = !search && sorted.length >= 3;

  const columns = [
    {
      key: "pos", header: "#", width: 64,
      render: (_, i) => {
        const pos = sorted.indexOf(filtered[i]) + 1;
        if (pos === 1) return <span style={{ fontSize: 18 }}>🥇</span>;
        if (pos === 2) return <span style={{ fontSize: 18 }}>🥈</span>;
        if (pos === 3) return <span style={{ fontSize: 18 }}>🥉</span>;
        return <span className="mono" style={{ color: "var(--ink-4)", fontWeight: 700 }}>#{pos}</span>;
      },
    },
    {
      key: "user", header: t.user,
      render: (e) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={e} size={32} rounded="md" />
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 13 }}>
              {e.username}
              {e.username === me && (
                <span style={{ marginLeft: 8 }}><Chip size="sm" tone="accent">{t.you}</Chip></span>
              )}
            </div>
            {e.country && <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{e.country}</div>}
          </div>
        </div>
      ),
    },
    {
      key: "xp", header: "XP", sortable: true,
      render: e => (
        <span className="mono tnum" style={{
          color: tab === "xp" ? "var(--accent)" : "var(--ink-1)",
          fontWeight: tab === "xp" ? 700 : 600,
        }}>
          {(e.xp || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "rank", header: "Rank",
      render: e => <Chip size="sm">{RANK_LABELS[e.rank] || e.rank}</Chip>,
    },
    {
      key: "streak", header: "Streak", sortable: true, align: "right",
      render: e => (
        <span className="tnum" style={{
          color: tab === "streak" ? "var(--accent)" : "var(--ink-2)",
          fontWeight: tab === "streak" ? 700 : 500,
        }}>
          {e.streak_days > 0 ? `${e.streak_days}d` : "—"}
        </span>
      ),
    },
    {
      key: "tasks", header: "Tasks", sortable: true, align: "right",
      render: e => (
        <span className="tnum" style={{
          color: tab === "tasks" ? "var(--accent)" : "var(--ink-2)",
          fontWeight: tab === "tasks" ? 700 : 500,
        }}>
          {e.tasks_completed || 0}
        </span>
      ),
    },
    {
      key: "rooms", header: "Rooms", sortable: true, align: "right",
      render: e => (
        <span className="tnum" style={{
          color: tab === "rooms" ? "var(--accent)" : "var(--ink-2)",
          fontWeight: tab === "rooms" ? 700 : 500,
        }}>
          {e.rooms_completed || 0}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">{t.eyebrow}</div>
          <h1 className="page-title">{t.title}</h1>
          <div className="page-sub">{t.sub}</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 20 }}>
        {/* My position */}
        <Tile span={8} variant={myEntry ? "accent" : "default"}>
          <TileHead
            eyebrow={myEntry ? t.yourPos : t.pos}
            title={myEntry ? `#${myPos} · ${myEntry.username}` : t.notInRank}
            sub={myEntry && (RANK_LABELS[myEntry.rank] || myEntry.rank)}
          />
          {myEntry ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <Avatar user={myEntry} size={60} rounded="lg" ring />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, flex: 1, minWidth: 220 }}>
                <Stat size="sm" label="XP"     value={(myEntry.xp || 0).toLocaleString()} />
                <Stat size="sm" label="Tasks"  value={myEntry.tasks_completed || 0} />
                <Stat size="sm" label="Rooms"  value={myEntry.rooms_completed || 0} />
                <Stat size="sm" label="Streak" value={myEntry.streak_days || 0} unit="d" />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              {t.notInRankDesc}
            </p>
          )}
        </Tile>

        {/* Podium */}
        <Tile span={4}>
          <TileHead eyebrow={t.top3} title={t.podium} />
          {showPodium && !loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Render in visual order: 2nd, 1st, 3rd */}
              {[1, 0, 2].map(idx => {
                const u = top3[idx];
                const m = PODIUM_META[idx];
                if (!u) return null;
                return (
                  <div key={u.username} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 12,
                    background: m.bg,
                    border: `1px solid ${m.border}`,
                    order: m.order,
                  }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>
                      {m.medal}
                    </span>
                    <Avatar user={u} size={34} rounded="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: "var(--ink-1)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {u.username}
                      </div>
                      <div className="mono tnum" style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>
                        {(u.xp || 0).toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
              {loading ? t.loading : t.atLeast3}
            </div>
          )}
        </Tile>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Tabs value={tab} onChange={setTab} options={TABS} />
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: "auto", maxWidth: 240 }}
        />
      </div>

      {loading ? (
        <TileSkeleton height={420} />
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="★" title={t.notFound} description={t.notFoundDesc} />
        </Tile>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(r) => r.username}
          highlightRow={(r) => r.username === me}
          sortKey={tab}
          onSort={(k) => {
            if (k !== "user" && k !== "rank" && k !== "pos") setTab(k);
          }}
        />
      )}
    </AppShell>
  );
}
