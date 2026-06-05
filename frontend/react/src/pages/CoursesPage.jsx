import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import { getMockCourses } from "../data/mockData";

const T = {
  az: {
    eyebrow: "Platforma", title: "Kurslar",
    sub: "Strukturlu video və mətn kursları ilə dərinləş.",
    all: "Hamısı", web: "Web", network: "Network", system: "Sistem",
    crypto: "Kripto", recon: "Kəşfiyyat",
    lessons: "dərs", hours: "saat", cont: "Davam edir", new: "Yeni",
    notFound: "Kurs tapılmadı",
  },
  en: {
    eyebrow: "Platform", title: "Courses",
    sub: "Deepen your skills with structured video and text courses.",
    all: "All", web: "Web", network: "Network", system: "System",
    crypto: "Crypto", recon: "Recon",
    lessons: "lessons", hours: "hours", cont: "Active", new: "New",
    notFound: "No courses found",
  },
};

/* hue degrees for each category — drives xk-course-thumb gradient */
const CAT_HUE = {
  web: 215, network: 175, linux: 265, sistem: 265, system: 265,
  crypto: 140, kripto: 140, osint: 35, recon: 35, pentest: 0,
};
function catHue(c) {
  const key = (c.category || c.category_name || "").toLowerCase();
  for (const [k, v] of Object.entries(CAT_HUE)) {
    if (key.includes(k)) return v;
  }
  return 215;
}

const FILTERS = ["Hamısı", "Web", "Network", "Sistem", "Kripto", "Kəşfiyyat"];
const FILTER_KEYS = {
  "Web": "web", "Network": "network", "Sistem": "linux", "Kripto": "crypto", "Kəşfiyyat": "osint",
};

export default function CoursesPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("Hamısı");

  useEffect(() => {
    let ok = true;
    endpoints.courses()
      .then(({ data }) => {
        if (!ok) return;
        const items = Array.isArray(data) && data.length > 0 ? data : getMockCourses();
        setCourses(items);
      })
      .catch(() => { if (ok) setCourses(getMockCourses()); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "Hamısı") return courses;
    const key = FILTER_KEYS[filter] || filter.toLowerCase();
    return courses.filter(c => {
      const cat = (c.category || c.category_name || "").toLowerCase();
      return cat.includes(key);
    });
  }, [courses, filter]);

  return (
    <AppShell>
      <div className="xk-screen">
        <div className="xk-screen-head xk-reveal">
          <div>
            <div className="xk-greet-eyebrow">{t.eyebrow}</div>
            <h1 className="xk-screen-title">{t.title}</h1>
            <p className="xk-greet-sub">{t.sub}</p>
          </div>
        </div>

        <div className="xk-filters xk-reveal" style={{ animationDelay: "60ms" }}>
          {FILTERS.map(f => (
            <button key={f} type="button"
              className={`xk-filter${filter === f ? " on" : ""}`}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="xk-course-grid">
            {Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} height={260} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">▤</div>
            <h3>{t.notFound}</h3>
          </div>
        ) : (
          <div className="xk-course-grid">
            {filtered.map((c, i) => {
              const hue    = catHue(c);
              const pct    = c.progress_percent || 0;
              const done   = pct >= 100;
              const catName = c.category || c.category_name || "";
              const authorInitial = (c.author_name || c.instructor || "X").charAt(0).toUpperCase();

              return (
                <Link
                  key={c.id}
                  to={`/courses/${c.slug}`}
                  className="xk-card xk-int xk-course xk-reveal"
                  style={{ "--ch": hue, animationDelay: `${100 + i * 70}ms`, textDecoration: "none", color: "inherit" }}
                >
                  {/* Thumbnail */}
                  <div className="xk-course-thumb">
                    <div className="xk-course-thumb-grid" />
                    {catName && <span className="xk-course-cat">{catName}</span>}
                    <span className="xk-course-play">
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />
                      </svg>
                    </span>
                  </div>

                  {/* Body */}
                  <div className="xk-course-body">
                    <div className="xk-course-top">
                      <span className="xk-badge tone-muted">
                        {{ beginner:"Başlanğıc", intermediate:"Orta", advanced:"Çətin", easy:"Asan", medium:"Orta", hard:"Çətin" }[c.level] || c.level || "Orta"}
                      </span>
                      {pct > 0 && !done && (
                        <span className="xk-course-cont">
                          <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          Davam edir
                        </span>
                      )}
                    </div>

                    <h3 className="xk-course-title">{c.title}</h3>

                    <div className="xk-course-meta">
                      {c.lesson_count > 0 && (
                        <span>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                            <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />
                          </svg>
                          {c.lesson_count} {t.lessons}
                        </span>
                      )}
                      {c.estimated_hours > 0 && (
                        <span>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                          </svg>
                          {c.estimated_hours} {t.hours}
                        </span>
                      )}
                    </div>

                    <div className="xk-course-foot">
                      <div className="xk-course-author">
                        <div className="xk-avatar" style={{
                          width: 22, height: 22, fontSize: 10, borderRadius: 6,
                          background: `hsl(${hue} 60% 35%)`,
                        }}>{authorInitial}</div>
                        {c.author_name || c.instructor || "Xakker"}
                      </div>
                      {done
                        ? <span className="xk-badge tone-ok">✓</span>
                        : pct > 0
                        ? <span className="xk-course-pct">{pct}%</span>
                        : <span className="xk-course-new">Yeni</span>}
                    </div>

                    {pct > 0 && (
                      <div className="xk-track" style={{ height: 3 }}>
                        <div className="xk-fill" style={{ width: `${pct}%`, background: `hsl(${hue} 70% 55%)` }} />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
