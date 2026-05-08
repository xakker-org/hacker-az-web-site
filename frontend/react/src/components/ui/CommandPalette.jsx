import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommand } from "../../contexts/CommandContext";
import { endpoints } from "../../services/endpoints";
import Kbd from "./Kbd";
import "./CommandPalette.css";

const ROUTES = [
  { id: "r-dashboard",   group: "Naviqasiya", title: "Dashboard",     hint: "Ana səhifə",        path: "/dashboard",   icon: "⌂" },
  { id: "r-missions",    group: "Naviqasiya", title: "Missions",      hint: "Praktiki tapşırıq", path: "/missions",    icon: "◎" },
  { id: "r-rooms",       group: "Naviqasiya", title: "Labs / Rooms",  hint: "Lab otaqları",      path: "/rooms",       icon: "▣" },
  { id: "r-self-study",  group: "Naviqasiya", title: "Self-Study",    hint: "Suallar",           path: "/self-study",  icon: "✎" },
  { id: "r-plans",       group: "Naviqasiya", title: "Learning Paths",hint: "Planlar",           path: "/plans",       icon: "↗" },
  { id: "r-courses",     group: "Naviqasiya", title: "Courses",       hint: "Kurslar",           path: "/courses",     icon: "▤" },
  { id: "r-leaderboard", group: "Naviqasiya", title: "Leaderboard",   hint: "Liderlik",          path: "/leaderboard", icon: "★" },
  { id: "r-profile",     group: "Naviqasiya", title: "Profile",       hint: "Profilim",          path: "/profile",     icon: "◉" },
];

function fuzzy(needle, hay) {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  const h = (hay || "").toLowerCase();
  if (!h) return -1;
  if (h.includes(n)) return 100 - h.indexOf(n);
  // simple subsequence
  let ni = 0;
  for (let i = 0; i < h.length && ni < n.length; i++) if (h[i] === n[ni]) ni++;
  return ni === n.length ? 1 : -1;
}

export default function CommandPalette() {
  const { open, setOpen } = useCommand();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // Lazy fetch dynamic items first time palette opens
  useEffect(() => {
    if (!open) return;
    setActive(0);
    setQ("");
    requestAnimationFrame(() => inputRef.current?.focus());

    if (items.length > ROUTES.length) return; // already fetched
    let mounted = true;
    Promise.allSettled([
      endpoints.missions().catch(() => ({ data: [] })),
      endpoints.courses().catch(() => ({ data: [] })),
      endpoints.rooms({}).catch(() => ({ data: [] })),
    ]).then((res) => {
      if (!mounted) return;
      const ms = (res[0]?.value?.data || []).map(m => ({
        id: `m-${m.id}`, group: "Missions", title: m.title, hint: m.short_description || m.description?.slice(0, 60), path: `/missions/${m.slug}`, icon: m.icon || "◎",
      }));
      const cs = (res[1]?.value?.data || []).map(c => ({
        id: `c-${c.id}`, group: "Courses", title: c.title, hint: c.description?.slice(0, 60), path: `/courses/${c.slug}`, icon: c.icon || "▤",
      }));
      const rs = (res[2]?.value?.data || []).map(r => ({
        id: `room-${r.id}`, group: "Labs", title: r.title, hint: r.summary?.slice(0, 60), path: `/rooms/${r.slug}`, icon: r.icon || "▣",
      }));
      setItems([...ROUTES, ...ms, ...cs, ...rs]);
    });
    return () => { mounted = false; };
  }, [open, items.length]);

  // Initialize with routes immediately
  useEffect(() => {
    if (items.length === 0) setItems(ROUTES);
  }, [items.length]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    return items
      .map(it => ({ it, score: Math.max(fuzzy(q, it.title), fuzzy(q, it.hint), fuzzy(q, it.group)) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(x => x.it);
  }, [q, items]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(it => {
      (groups[it.group] = groups[it.group] || []).push(it);
    });
    return Object.entries(groups);
  }, [filtered]);

  // Flat list with original indices for active highlight
  const flat = filtered;

  useEffect(() => {
    if (active >= flat.length) setActive(0);
  }, [flat.length, active]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[active];
      if (it) { setOpen(false); navigate(it.path); }
    }
  };

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="cmd" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <span className="cmd-input-ico" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Mission, kurs, route axtar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Axtar"
          />
          <span className="cmd-input-hint"><Kbd>Esc</Kbd></span>
        </div>
        <div className="cmd-list" role="listbox">
          {flat.length === 0 ? (
            <div className="cmd-empty">Heç nə tapılmadı</div>
          ) : (
            grouped.map(([group, list]) => (
              <div className="cmd-group" key={group}>
                <div className="cmd-group-label">{group}</div>
                {list.map((it) => {
                  const idx = flat.indexOf(it);
                  const isActive = idx === active;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={`cmd-item${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => { setOpen(false); navigate(it.path); }}
                      role="option"
                      aria-selected={isActive}
                    >
                      <span className="cmd-item-ico">{it.icon}</span>
                      <span className="cmd-item-main">
                        <span className="cmd-item-title">{it.title}</span>
                        {it.hint && <span className="cmd-item-hint">{it.hint}</span>}
                      </span>
                      {isActive && <Kbd>↵</Kbd>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="cmd-foot">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> hərəkət</span>
          <span><Kbd>↵</Kbd> aç</span>
          <span><Kbd>Esc</Kbd> bağla</span>
        </div>
      </div>
    </div>
  );
}
