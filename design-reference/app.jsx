// app.jsx — root: routing, tweaks wiring, page transitions
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "glow",
  "accent": "#ff3b3b",
  "density": "rahat",
  "animate": true,
  "radius": 16
}/*EDITMODE-END*/;

const ACCENTS = ["#ff3b3b", "#ff5a2b", "#f43f7d", "#19c37d"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // route is an object { name, params }; keep a back-stack for drill-down pages
  const [route, setRoute] = useStateApp({ name: "dashboard", params: {} });
  const [stack, setStack] = useStateApp([]);
  const [collapsed, setCollapsed] = useStateApp(false);
  const [animKey, setAnimKey] = useStateApp(0);
  const [settled, setSettled] = useStateApp(false);
  const scrollRef = useRefApp(null);

  // which top-level nav section is highlighted for a given route
  const SECTION_OF = {
    dashboard: "dashboard", missions: "missions", mission: "missions", lesson: "missions",
    labs: "labs", lab: "labs", leaderboard: "leaderboard", profile: "profile",
    paths: "paths", path: "paths", "self-study": "self-study", cheatsheet: "self-study",
    courses: "courses", course: "courses",
  };

  const anim = t.animate;

  // apply theme to root
  useEffectApp(() => {
    const r = document.documentElement;
    r.dataset.direction = t.direction;
    r.dataset.density = t.density;
    r.dataset.animate = anim ? "on" : "off";
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--radius", t.radius + "px");
    // derive accent tints
    r.style.setProperty("--accent-rgb", hexToRgb(t.accent));
  }, [t.direction, t.density, t.accent, t.radius, anim]);

  // mark doc ready so entrance animations run (only once the iframe is live/visible)
  useEffectApp(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => document.documentElement.classList.add("xk-anim-ready"))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  // safety net: even if CSS entrance animations freeze (throttled/hidden iframe),
  // force the page to its visible resting state shortly after each navigation.
  useEffectApp(() => {
    setSettled(false);
    const id = setTimeout(() => setSettled(true), 1100);
    return () => clearTimeout(id);
  }, [animKey]);

  const bump = () => { setAnimKey((k) => k + 1); if (scrollRef.current) scrollRef.current.scrollTop = 0; };

  // navigate(name) for top-level nav resets the stack; navigate(name, params, {push:true}) drills in
  const navigate = (name, params = {}, opts = {}) => {
    if (opts.push) setStack((s) => [...s, route]);
    else setStack([]);
    setRoute({ name, params });
    bump();
  };
  const goDeep = (name, params = {}) => navigate(name, params, { push: true });
  const back = () => {
    setStack((s) => {
      if (!s.length) { setRoute({ name: "dashboard", params: {} }); return s; }
      const prev = s[s.length - 1];
      setRoute(prev);
      return s.slice(0, -1);
    });
    bump();
  };

  const p = route.params || {};
  const nav = { go: navigate, deep: goDeep, back };
  const screen = (() => {
    switch (route.name) {
      case "dashboard": return <Dashboard anim={anim} onNavigate={navigate} />;
      case "missions": return <MissionsScreen anim={anim} onNavigate={navigate} nav={nav} />;
      case "mission": return <MissionDetail anim={anim} id={p.id} nav={nav} />;
      case "lesson": return <LessonView anim={anim} missionId={p.missionId} index={p.index} nav={nav} />;
      case "labs": return <LabsScreen anim={anim} nav={nav} />;
      case "lab": return <LabDetail anim={anim} id={p.id} nav={nav} />;
      case "leaderboard": return <LeaderboardScreen />;
      case "profile": return <ProfileScreen anim={anim} nav={nav} />;
      case "paths": return <PathsScreen anim={anim} nav={nav} />;
      case "path": return <PathDetail anim={anim} id={p.id} nav={nav} />;
      case "self-study": return <SelfStudyScreen anim={anim} nav={nav} />;
      case "cheatsheet": return <CheatsheetDetail anim={anim} id={p.id} nav={nav} />;
      case "courses": return <CoursesScreen anim={anim} nav={nav} />;
      case "course": return <CourseDetail anim={anim} id={p.id} nav={nav} />;
      default: return <Dashboard anim={anim} onNavigate={navigate} />;
    }
  })();

  return (
    <div className={`xk-app ${collapsed ? "nav-collapsed" : ""}`}>
      <Sidebar current={SECTION_OF[route.name] || route.name} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="xk-main">
        <Topbar onNavigate={navigate} />
        <main className="xk-scroll" ref={scrollRef}>
          <div key={animKey} className={`xk-page ${anim ? "anim" : "no-anim"} ${settled ? "settled" : ""}`}>
            {screen}
          </div>
        </main>
      </div>

      <TweaksPanel>
        <TweakSection label="Vizual istiqamət" />
        <TweakRadio label="İstiqamət" value={t.direction}
          options={["saf", "glow", "bold"]}
          onChange={(v) => setTweak("direction", v)} />
        <TweakSection label="Görünüş" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Sıxlıq" value={t.density}
          options={["sıx", "rahat"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Künc radiusu" value={t.radius} min={4} max={24} step={2} unit="px"
          onChange={(v) => setTweak("radius", v)} />
        <TweakToggle label="Animasiyalar" value={t.animate}
          onChange={(v) => setTweak("animate", v)} />
      </TweaksPanel>
    </div>
  );
}

function hexToRgb(hex) {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
