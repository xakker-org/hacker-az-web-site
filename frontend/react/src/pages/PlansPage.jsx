import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import Sparkline from "../components/ui/Sparkline";
import { Input } from "../components/ui/Field";
import { Chip, DiffBadge } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

export default function PlansPage() {
  const [plans, setPlans]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    endpoints.plans()
      .then(({ data }) => { if (mounted) setPlans(Array.isArray(data) ? data : []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(p => `${p.title} ${p.summary || ""} ${p.level || ""}`.toLowerCase().includes(q));
  }, [plans, search]);

  const totalRooms = plans.reduce((s, p) => s + (p.room_count || 0), 0);
  const totalHours = plans.reduce((s, p) => s + (p.estimated_hours || 0), 0);

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Learning Paths</div>
          <h1 className="page-title">Karyer marşrutu</h1>
          <div className="page-sub">Strukturlu plan ilə kiber-təhlükəsizlik mütəxəssisi ol.</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={4}><Stat label="Cəmi plan" value={plans.length} size="md" /></Tile>
        <Tile span={4}><Stat label="Otaq" value={totalRooms} size="md" /></Tile>
        <Tile span={4}><Stat label="Saat" value={totalHours} unit="h" size="md" /></Tile>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Input
          placeholder="Plan axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Chip size="sm" style={{ marginLeft: "auto" }}>{filtered.length} plan</Chip>
      </div>

      {loading ? (
        <div className="bento">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="span-6"><TileSkeleton height={240} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="↗" title="Plan tapılmadı" description="Backend-də heç bir plan yoxdur və ya axtarışa uyğun gəlmir." />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map(p => (
            <Tile key={p.id} span={6}>
              <TileHead
                eyebrow={p.level || "Plan"}
                title={p.title}
                sub={p.summary}
                action={<DiffBadge level={p.level} />}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(p.courses || []).slice(0, 6).map((item, idx) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px",
                    background: "var(--bg-card-2)", border: "1px solid var(--line)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}>
                    <span className="mono" style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "var(--accent-soft)", color: "var(--accent)",
                      border: "1px solid var(--accent-ring)",
                      display: "grid", placeItems: "center",
                      fontSize: 10, fontWeight: 700,
                      flexShrink: 0,
                    }}>{idx + 1}</span>
                    <span style={{ flex: 1, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.course?.title || "—"}</span>
                    <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{item.course?.category || ""}</span>
                  </div>
                ))}
                {(p.courses?.length || 0) > 6 && (
                  <div style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "center", padding: 4 }}>
                    +{p.courses.length - 6} digər kurs
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                <span>{p.room_count || 0} otaq · {p.estimated_hours || 0}h</span>
                <Sparkline data={[1,2,3,5,4,6,7,8]} tone="accent" height={20} variant="area" />
              </div>
            </Tile>
          ))}
        </div>
      )}
    </AppShell>
  );
}
