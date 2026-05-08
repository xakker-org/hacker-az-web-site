import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
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
  { value: "xp",     label: "XP",     icon: "★" },
  { value: "tasks",  label: "Tasks",  icon: "✓" },
  { value: "rooms",  label: "Rooms",  icon: "▣" },
  { value: "streak", label: "Streak", icon: "🔥" },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("xp");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    if (tab === "streak") return a.sort((x, y) => (y.streak_days || 0)  - (x.streak_days || 0));
    return a;
  }, [entries, tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(e => `${e.username} ${RANK_LABELS[e.rank] || ""} ${e.country || ""}`.toLowerCase().includes(q));
  }, [sorted, search]);

  const myEntry = useMemo(() => entries.find(e => e.username === me), [entries, me]);
  const myPos = useMemo(() => entries.findIndex(e => e.username === me) + 1, [entries, me]);
  const top3 = sorted.slice(0, 3);
  const showPodium = !search && sorted.length >= 3;

  const columns = [
    {
      key: "pos", header: "#", width: 64,
      render: (_, i) => {
        const pos = sorted.indexOf(filtered[i]) + 1;
        const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null;
        return medal
          ? <span style={{ fontSize: 16 }}>{medal}</span>
          : <span className="mono" style={{ color: "var(--ink-4)", fontWeight: 700 }}>#{pos}</span>;
      },
    },
    {
      key: "user", header: "İstifadəçi",
      render: (e) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={e} size={32} rounded="md" />
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 13 }}>
              {e.username}
              {e.username === me && <span style={{ marginLeft: 8 }}><Chip size="sm" tone="accent">siz</Chip></span>}
            </div>
            {e.country && <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{e.country}</div>}
          </div>
        </div>
      ),
    },
    { key: "xp", header: "XP", sortable: true,
      render: e => <span className="mono tnum" style={{ color: tab === "xp" ? "var(--accent)" : "var(--ink-1)", fontWeight: tab === "xp" ? 700 : 600 }}>{(e.xp || 0).toLocaleString()}</span>
    },
    { key: "rank", header: "Rank",
      render: e => <Chip size="sm">{RANK_LABELS[e.rank] || e.rank}</Chip>
    },
    { key: "streak", header: "🔥", sortable: true, align: "right",
      render: e => <span className="tnum" style={{ color: tab === "streak" ? "var(--accent)" : "var(--ink-2)", fontWeight: tab === "streak" ? 700 : 500 }}>{e.streak_days > 0 ? `${e.streak_days}d` : "—"}</span>
    },
    { key: "tasks", header: "✓", sortable: true, align: "right",
      render: e => <span className="tnum" style={{ color: tab === "tasks" ? "var(--accent)" : "var(--ink-2)", fontWeight: tab === "tasks" ? 700 : 500 }}>{e.tasks_completed || 0}</span>
    },
    { key: "rooms", header: "▣", sortable: true, align: "right",
      render: e => <span className="tnum" style={{ color: tab === "rooms" ? "var(--accent)" : "var(--ink-2)", fontWeight: tab === "rooms" ? 700 : 500 }}>{e.rooms_completed || 0}</span>
    },
  ];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Leaderboard</div>
          <h1 className="page-title">Liderlik cədvəli</h1>
          <div className="page-sub">XP qazanaraq zirvəyə çıx. Hər doğru cavab yeni pillə deməkdir.</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 16 }}>
        {/* Me */}
        <Tile span={8} variant={myEntry ? "accent" : "default"}>
          <TileHead eyebrow={myEntry ? "Sizin mövqe" : "Mövqe"} title={myEntry ? `#${myPos} · ${myEntry.username}` : "Reytinqdə yoxsan"} sub={myEntry && (RANK_LABELS[myEntry.rank] || myEntry.rank)} />
          {myEntry ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <Avatar user={myEntry} size={64} rounded="lg" ring />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, flex: 1, minWidth: 220 }}>
                <Stat size="sm" label="XP"     value={(myEntry.xp || 0).toLocaleString()} />
                <Stat size="sm" label="Tasks"  value={myEntry.tasks_completed || 0} />
                <Stat size="sm" label="Rooms"  value={myEntry.rooms_completed || 0} />
                <Stat size="sm" label="Streak" value={myEntry.streak_days || 0} unit="d" />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Sual cavablamağa başla, top 100-ə daxil ol.</p>
          )}
        </Tile>

        {/* Top 3 podium */}
        <Tile span={4}>
          <TileHead eyebrow="Top 3" title="Lider lider" />
          {showPodium && !loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {top3.map((u, i) => (
                <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 10, background: i === 0 ? "rgba(255,184,107,0.06)" : "var(--bg-card-2)", border: `1px solid ${i === 0 ? "rgba(255,184,107,0.25)" : "var(--line)"}` }}>
                  <span style={{ fontSize: 22, width: 26 }}>{["🥇","🥈","🥉"][i]}</span>
                  <Avatar user={u} size={36} rounded="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</div>
                    <div className="mono tnum" style={{ fontSize: 11, color: "var(--accent)" }}>{(u.xp || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--ink-4)" }}>{loading ? "Yüklənir..." : "Ən az 3 istifadəçi olmalıdır"}</div>
          )}
        </Tile>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Tabs value={tab} onChange={setTab} options={TABS} />
        <Input
          placeholder="İstifadəçi axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: "auto", maxWidth: 240 }}
        />
      </div>

      {loading ? (
        <TileSkeleton height={420} />
      ) : filtered.length === 0 ? (
        <Tile><EmptyState icon="★" title="Heç kim tapılmadı" description="Axtarışı dəyişdir." /></Tile>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(r) => r.username}
          highlightRow={(r) => r.username === me}
          sortKey={tab}
          onSort={(k) => setTab(k === "user" || k === "rank" || k === "pos" ? tab : k)}
        />
      )}
    </AppShell>
  );
}
