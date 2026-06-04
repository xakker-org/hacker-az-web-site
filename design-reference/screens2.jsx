// screens2.jsx — Courses + Self-Study screens
const { useState: useStateS2 } = React;

/* ---------------- Courses ---------------- */
function CourseThumb({ hue, cat }) {
  return (
    <div className="xk-course-thumb" style={{ "--ch": hue }}>
      <div className="xk-course-thumb-grid" />
      <span className="xk-course-cat">{cat}</span>
      <span className="xk-course-play"><Icon name="layers" size={18} /></span>
    </div>
  );
}

function CoursesScreen({ anim, nav }) {
  const { courses } = window.XK;
  const cats = ["Hamısı", "Web", "Network", "System", "Crypto", "Recon"];
  const [filter, setFilter] = useStateS2("Hamısı");
  const list = filter === "Hamısı" ? courses : courses.filter((c) => c.cat === filter);
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="Platforma" title="Kurslar" sub="Strukturlu video və mətn kursları ilə dərinləş." />
      <div className="xk-filters xk-reveal" style={{ animationDelay: "60ms" }}>
        {cats.map((t) => (
          <button key={t} className={`xk-filter ${filter === t ? "on" : ""}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>
      <div className="xk-course-grid">
        {list.map((c, i) => (
          <Card key={c.id} delay={100 + i * 70} className="xk-course" interactive onClick={() => nav.deep("course", { id: c.id })}>
            <CourseThumb hue={c.hue} cat={c.cat} />
            <div className="xk-course-body">
              <div className="xk-course-top">
                <Badge tone="muted">{c.level}</Badge>
                {c.progress > 0 && <span className="xk-course-cont"><Icon name="dot" size={12} /> Davam edir</span>}
              </div>
              <h3 className="xk-course-title">{c.title}</h3>
              <div className="xk-course-meta">
                <span><Icon name="layers" size={14} /> {c.lessons} dərs</span>
                <span><Icon name="clock" size={14} /> {c.hours} saat</span>
              </div>
              <div className="xk-course-foot">
                <div className="xk-course-author"><Avatar name={c.author} size={22} color="#26262c" /> {c.author}</div>
                {c.progress > 0
                  ? <span className="xk-course-pct">{c.progress}%</span>
                  : <span className="xk-course-new">Yeni</span>}
              </div>
              {c.progress > 0 && <ProgressBar value={c.progress} max={100} enabled={anim} />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Self-Study ---------------- */
function SelfStudyScreen({ anim, nav }) {
  const { cheatsheets, readingNow } = window.XK;
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="Platforma" title="Müstəqil öyrənmə" sub="Öz tempinlə oxu, cheatsheet-lərə bax, qeydlər götür." />

      <Card delay={70} className="xk-reading">
        <div className="xk-reading-ico"><Icon name="book" size={24} /></div>
        <div className="xk-reading-meta">
          <div className="xk-card-eyebrow">Davam etdiyin material</div>
          <h3 className="xk-reading-title">{readingNow.title}</h3>
          <div className="xk-reading-prog">
            <ProgressBar value={readingNow.progress} max={100} enabled={anim} />
            <span className="xk-mission-pct">{readingNow.progress}%</span>
          </div>
        </div>
        <button className="xk-btn primary">Oxumağa davam et <Icon name="arrow" size={16} /></button>
      </Card>

      <div className="xk-section-label xk-reveal" style={{ animationDelay: "120ms" }}>Cheatsheet-lər</div>
      <div className="xk-cheat-grid">
        {cheatsheets.map((cs, i) => (
          <Card key={cs.id} delay={160 + i * 60} className="xk-cheat" interactive onClick={() => nav.deep("cheatsheet", { id: cs.id })}>
            <div className="xk-cheat-ico"><Icon name={cs.icon} size={20} /></div>
            <div className="xk-cheat-meta">
              <h4 className="xk-cheat-title">{cs.title}</h4>
              <span className="xk-cheat-sub">{cs.cat} · {cs.items} qeyd</span>
            </div>
            <Icon name="arrow" size={16} className="xk-cheat-arrow" />
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CoursesScreen, SelfStudyScreen });
