// data.jsx — mock data for xakker.org dashboard
const XK = {
  user: {
    name: "maqaa",
    rank: "Script Kiddie",
    rankKey: "script kiddie",
    nextRank: "Operative",
    points: 170,
    xp: 57,
    streak: 1,
    accuracy: 100,
    correct: 3,
    total: 3,
    rankProgress: 6,         // %
    xpToNext: 330,
    globalRank: 1,
  },

  nav: {
    platform: [
      { id: "dashboard", label: "Panel", icon: "grid" },
      { id: "missions", label: "Missiyalar", icon: "target", badge: "Yeni" },
      { id: "labs", label: "Laboratoriyalar", icon: "beaker" },
      { id: "self-study", label: "Müstəqil", icon: "book" },
      { id: "paths", label: "Öyrənmə yolları", icon: "route" },
      { id: "courses", label: "Kurslar", icon: "layers" },
    ],
    community: [
      { id: "leaderboard", label: "Reytinq", icon: "chart" },
      { id: "profile", label: "Profil", icon: "user" },
    ],
  },

  stats: [
    { id: "xp", label: "Ümumi XP", value: 57, suffix: "", note: "Bu həftə aktivlik yoxdur", accent: true },
    { id: "streak", label: "Streak", value: 1, suffix: "gün", note: "Davam et!", flame: true },
    { id: "accuracy", label: "Dəqiqlik", value: 100, suffix: "%", note: "3 / 3 doğru", ring: true },
  ],

  // 18-week activity heatmap (xp per day). Mostly empty to match current state.
  activity: (() => {
    const days = [];
    const today = new Date(2026, 5, 3);
    // align so the grid ends on the correct weekday; go back 18 full weeks
    const total = 18 * 7;
    for (let i = total - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      let xp = 0;
      if (i === 0) xp = 57;
      days.push({ date: d, xp, dow: d.getDay() });
    }
    return days;
  })(),

  missions: [
    { id: "m1", title: "Web təhlükəsizliyinə giriş", track: "Web", level: "Asan", xp: 40, progress: 0, lessons: 8, color: "#ff3b3b" },
    { id: "m2", title: "SQL Injection əsasları", track: "Web", level: "Orta", xp: 80, progress: 0, lessons: 12, color: "#ff7a3b" },
    { id: "m3", title: "Şəbəkə kəşfiyyatı (Nmap)", track: "Network", level: "Orta", xp: 70, progress: 0, lessons: 10, color: "#3b9bff" },
    { id: "m4", title: "Linux güclənmə", track: "System", level: "Çətin", xp: 120, progress: 0, lessons: 16, color: "#b06bff" },
    { id: "m5", title: "Parol kraşı texnikaları", track: "Crypto", level: "Orta", xp: 90, progress: 0, lessons: 11, color: "#34d399" },
    { id: "m6", title: "OSINT kəşfiyyat", track: "Recon", level: "Asan", xp: 50, progress: 0, lessons: 7, color: "#fbbf24" },
  ],

  labs: [
    { id: "l1", title: "Damn Vulnerable Web App", env: "Docker", difficulty: "Asan", status: "Hazır" },
    { id: "l2", title: "Metasploitable 2", env: "VM", difficulty: "Orta", status: "Hazır" },
    { id: "l3", title: "Capture The Flag — Web", env: "Docker", difficulty: "Çətin", status: "Hazır" },
    { id: "l4", title: "Privilege Escalation Sandbox", env: "VM", difficulty: "Çətin", status: "Tezliklə" },
  ],

  recent: [
    { id: "r1", title: "SUALDIR BU", sub: "salam", xp: 10, ok: true },
    { id: "r2", title: "dasda", sub: "salam", xp: 10, ok: true },
    { id: "r3", title: "sual1", sub: "salam", xp: 17, ok: true },
    { id: "r4", title: "Brute force nədir?", sub: "Web · Asan", xp: 12, ok: true },
    { id: "r5", title: "Port skan", sub: "Network · Orta", xp: 8, ok: true },
  ],

  leaderboard: [
    { rank: 1, name: "maqaa", points: 170, you: true },
    { rank: 2, name: "user", points: 0 },
    { rank: 3, name: "userr", points: 0 },
    { rank: 4, name: "n0va", points: 0 },
    { rank: 5, name: "r00t", points: 0 },
  ],

  paths: [
    { id: "p1", title: "Web Pentester", missions: 12, done: 1, color: "#ff3b3b" },
    { id: "p2", title: "Network Defender", missions: 10, done: 0, color: "#3b9bff" },
    { id: "p3", title: "Red Team Operator", missions: 18, done: 0, color: "#b06bff" },
  ],

  courses: [
    { id: "c1", title: "Web Hacking 101", cat: "Web", lessons: 24, hours: 6, progress: 35, level: "Başlanğıc", author: "n0va", hue: 4 },
    { id: "c2", title: "Şəbəkə Protokolları Dərindən", cat: "Network", lessons: 18, hours: 5, progress: 0, level: "Orta", author: "byte", hue: 215 },
    { id: "c3", title: "Linux Sistem Administratoru", cat: "System", lessons: 32, hours: 9, progress: 12, level: "Orta", author: "r00t", hue: 275 },
    { id: "c4", title: "Kriptoqrafiyaya Giriş", cat: "Crypto", lessons: 16, hours: 4, progress: 0, level: "Başlanğıc", author: "0xA1", hue: 150 },
    { id: "c5", title: "Burp Suite ilə Praktika", cat: "Web", lessons: 20, hours: 5, progress: 0, level: "Orta", author: "ph4ntom", hue: 4 },
    { id: "c6", title: "OSINT və Kəşfiyyat", cat: "Recon", lessons: 14, hours: 3, progress: 0, level: "Başlanğıc", author: "maqaa", hue: 45 },
  ],

  cheatsheets: [
    { id: "cs1", title: "Linux komandaları", cat: "System", items: 64, icon: "command" },
    { id: "cs2", title: "Nmap bayraqları", cat: "Network", items: 38, icon: "target" },
    { id: "cs3", title: "HTTP status kodları", cat: "Web", items: 41, icon: "shield" },
    { id: "cs4", title: "SQL Injection payload-ları", cat: "Web", items: 52, icon: "bolt" },
    { id: "cs5", title: "Şifrələmə alqoritmləri", cat: "Crypto", items: 27, icon: "shield" },
    { id: "cs6", title: "Reverse shell-lər", cat: "System", items: 19, icon: "command" },
  ],

  readingNow: { title: "OWASP Top 10 — 2025", sub: "Web · Oxuma materialı", progress: 60, minutes: 12 },

  question: {
    title: "Günün sualı",
    sub: "Praktika yoxlaması",
    prompt: "HTTP-də hansı status kodu “Forbidden” deməkdir?",
    options: ["401", "403", "404", "500"],
    correct: 1,
    xp: 10,
  },
};

window.XK = XK;
