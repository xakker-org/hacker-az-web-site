// lessons-data.jsx — lesson content templates per track
// Each lesson: { title, type: 'theory'|'quiz'|'terminal', xp, ...payload }

const WEB_LESSONS = [
  { title: "HTTP necə işləyir", type: "theory", xp: 10,
    heading: "İstək–cavab modeli",
    body: [
      "HTTP (HyperText Transfer Protocol) — brauzer ilə server arasında mətn əsaslı protokoldur. Hər əməliyyat bir istək (request) və bir cavabdan (response) ibarətdir.",
      "İstək metod (GET, POST, ...), yol və başlıqlardan ibarətdir. Cavabda isə status kodu, başlıqlar və gövdə (body) olur. Təhlükəsizlik testinin çoxu bu mübadiləni izləmək və dəyişməkdən ibarətdir.",
    ],
    code: { lang: "http", lines: ["GET /login HTTP/1.1", "Host: target.az", "User-Agent: xakker", "Accept: text/html"] },
    tip: "Başlıqları görmək üçün brauzerin DevTools → Network bölməsindən istifadə et." },

  { title: "Status kodları", type: "quiz", xp: 10,
    prompt: "HTTP-də hansı status kodu “Forbidden” (qadağan) deməkdir?",
    options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Server Error"],
    correct: 1,
    explain: "403 — server istəyi başa düşür, amma icra etməyi rədd edir. 401 isə kimlik təsdiqi tələb olunduğunu bildirir." },

  { title: "Sorğu başlıqlarını oxu", type: "terminal", xp: 15,
    promptText: "curl ilə hədəfin yalnız cavab başlıqlarını gör. (-I bayrağı)",
    expected: ["curl -i https://target.az", "curl -I https://target.az", "curl -I target.az", "curl -i target.az"],
    hint: "İpucu: curl -I <ünvan>",
    output: ["HTTP/1.1 200 OK", "Server: nginx/1.24", "Content-Type: text/html", "X-Powered-By: PHP/8.2", "Set-Cookie: SESSID=...; HttpOnly"] },

  { title: "Same-Origin Policy", type: "theory", xp: 10,
    heading: "Mənbə (origin) nədir?",
    body: [
      "Origin = sxem + host + port. Same-Origin Policy (SOP) brauzerin əsas müdafiə qaydasıdır: bir mənbədəki skript başqa mənbənin məlumatını sərbəst oxuya bilməz.",
      "CORS başlıqları bu qaydanı nəzarətli şəkildə yumşaldır. Səhv konfiqurasiya olunmuş CORS çox vaxt məlumat sızmasına gətirib çıxarır.",
    ],
    tip: "https://a.az və http://a.az fərqli origin-lərdir — sxem dəyişib." },

  { title: "XSS əsasları", type: "quiz", xp: 15,
    prompt: "Reflected XSS hücumunda zərərli kod harada saxlanılır?",
    options: ["Verilənlər bazasında", "Heç yerdə — istəkdən cavaba əks olunur", "İstifadəçinin cookie-sində", "Server log-larında"],
    correct: 1,
    explain: "Reflected XSS-də payload URL/parametrdən birbaşa cavaba əks olunur və saxlanılmır. Stored XSS isə bazada qalır." },
];

const NETWORK_LESSONS = [
  { title: "TCP/IP modeli", type: "theory", xp: 10,
    heading: "Qatlar (layers)",
    body: [
      "Şəbəkə rabitəsi qatlara bölünür: Tətbiq, Nəqliyyat (TCP/UDP), İnternet (IP) və Şəbəkə girişi. Hər qat öz vəzifəsini yerinə yetirir.",
      "Pentester üçün ən vacib qat Nəqliyyatdır — portlar və TCP əl-sıxması (handshake) burada baş verir.",
    ],
    code: { lang: "txt", lines: ["SYN      →", "  ← SYN-ACK", "ACK      →", "[ əlaqə quruldu ]"] } },

  { title: "Port nədir", type: "quiz", xp: 10,
    prompt: "HTTPS xidməti standart olaraq hansı portda işləyir?",
    options: ["21", "22", "443", "8080"],
    correct: 2,
    explain: "443 — HTTPS. 80 isə HTTP, 22 SSH, 21 FTP üçündür." },

  { title: "Nmap ilə skan", type: "terminal", xp: 20,
    promptText: "Hədəfdə açıq portları sürətli skan et. (Nmap, -F sürətli rejim)",
    expected: ["nmap -F target.az", "nmap target.az", "nmap -F 10.0.0.5", "nmap -sV target.az"],
    hint: "İpucu: nmap -F <hədəf>",
    output: ["Starting Nmap scan...", "PORT     STATE  SERVICE", "22/tcp   open   ssh", "80/tcp   open   http", "443/tcp  open   https", "Nmap done: 1 host up"] },

  { title: "Banner grabbing", type: "theory", xp: 10,
    heading: "Xidmət barmaq izləri",
    body: [
      "Açıq port tapdıqdan sonra növbəti addım — orada hansı xidmətin və versiyanın işlədiyini müəyyən etməkdir. Buna banner grabbing deyilir.",
      "Versiya məlumatı məlum zəifliklərlə (CVE) uyğunlaşdırılır. Köhnə versiyalar adətən zəif nöqtələrdir.",
    ] },
];

const SYSTEM_LESSONS = [
  { title: "Linux fayl icazələri", type: "theory", xp: 10,
    heading: "rwx və sahiblik",
    body: [
      "Hər faylın sahibi (owner), qrupu və icazə bitləri var: oxu (r), yaz (w), icra (x). Bunlar istifadəçi/qrup/digərləri üçün ayrıca təyin olunur.",
      "Yanlış icazələr (məs. dünyaya yazıla bilən skript) privilege escalation üçün klassik vektordur.",
    ],
    code: { lang: "bash", lines: ["$ ls -l /etc/passwd", "-rw-r--r-- 1 root root 2.1K passwd"] } },

  { title: "İcazələri oxu", type: "quiz", xp: 10,
    prompt: "chmod 755 fayl — hansı icazəni verir?",
    options: ["Hamıya tam icazə", "Sahib: rwx, qrup və digər: r-x", "Yalnız sahibə oxu", "Heç bir icazə"],
    correct: 1,
    explain: "7=rwx (sahib), 5=r-x (qrup), 5=r-x (digərləri). Yəni hamı oxuyub icra edə bilər, amma yalnız sahib yaza bilər." },

  { title: "SUID axtarışı", type: "terminal", xp: 20,
    promptText: "Sistemdə SUID bayraqlı icra fayllarını tap. (find + -perm)",
    expected: ["find / -perm -4000 2>/dev/null", "find / -perm -u=s -type f 2>/dev/null", "find / -perm -4000"],
    hint: "İpucu: find / -perm -4000 2>/dev/null",
    output: ["/usr/bin/passwd", "/usr/bin/sudo", "/usr/bin/find", "/usr/bin/pkexec", "[ pkexec — CVE-2021-4034 yoxla! ]"] },
];

const CRYPTO_LESSONS = [
  { title: "Heş funksiyaları", type: "theory", xp: 10,
    heading: "Birtərəfli funksiyalar",
    body: [
      "Heş funksiya istənilən uzunluqdakı girişi sabit uzunluqlu çıxışa çevirir və geri qaytarıla bilməz. MD5 və SHA-1 köhnəlib; bu gün SHA-256 standartdır.",
      "Parollar heç vaxt açıq saxlanmamalı — duz (salt) əlavə edilərək heşlənməlidir.",
    ],
    code: { lang: "bash", lines: ["$ echo -n 'salam' | sha256sum", "c1b2... (64 simvol)"] } },

  { title: "Şifrələmə növləri", type: "quiz", xp: 10,
    prompt: "Simmetrik şifrələmənin əsas xüsusiyyəti nədir?",
    options: ["İki fərqli açar", "Eyni açar həm şifrələyir, həm açır", "Açar lazım deyil", "Yalnız imzalama üçündür"],
    correct: 1,
    explain: "Simmetrik (məs. AES) — eyni gizli açar. Asimmetrik (RSA) isə açıq/gizli açar cütündən istifadə edir." },

  { title: "Heşi qır", type: "terminal", xp: 20,
    promptText: "John the Ripper ilə hash.txt faylını lüğət hücumu ilə qır.",
    expected: ["john hash.txt", "john --wordlist=rockyou.txt hash.txt", "john --wordlist rockyou.txt hash.txt"],
    hint: "İpucu: john --wordlist=rockyou.txt hash.txt",
    output: ["Loaded 1 password hash (md5crypt)", "Press 'q' to abort", "password123     (admin)", "1 password cracked"] },
];

const RECON_LESSONS = [
  { title: "OSINT nədir", type: "theory", xp: 10,
    heading: "Açıq mənbə kəşfiyyatı",
    body: [
      "OSINT — açıq, qanuni mənbələrdən (sosial şəbəkə, DNS, sızmış bazalar, axtarış motorları) məlumat toplama prosesidir.",
      "Hücumun ən sakit mərhələsidir — hədəflə birbaşa təmas olmadan çoxlu məlumat əldə etmək olar.",
    ] },

  { title: "DNS kəşfiyyatı", type: "quiz", xp: 10,
    prompt: "Bir domenin alt-domenlərini tapmaq üçün hansı qeyd növü faydalıdır?",
    options: ["MX qeydləri", "A və CNAME qeydləri", "Yalnız TXT", "Heç biri"],
    correct: 1,
    explain: "A (ünvan) və CNAME (ləqəb) qeydləri alt-domenləri IP-lərə bağlayır. MX yalnız poçt serverləri üçündür." },

  { title: "Subdomain tap", type: "terminal", xp: 20,
    promptText: "subfinder ilə hədəf domenin alt-domenlərini topla.",
    expected: ["subfinder -d target.az", "subfinder -d target.az -silent", "subfinder target.az"],
    hint: "İpucu: subfinder -d target.az",
    output: ["www.target.az", "mail.target.az", "dev.target.az", "vpn.target.az", "[ 4 alt-domen tapıldı ]"] },
];

const TRACK_LESSONS = {
  Web: WEB_LESSONS, Network: NETWORK_LESSONS, System: SYSTEM_LESSONS,
  Crypto: CRYPTO_LESSONS, Recon: RECON_LESSONS,
};

// Build a lesson list for a mission of given length, cycling the track template.
function buildLessons(mission) {
  const tmpl = TRACK_LESSONS[mission.track] || WEB_LESSONS;
  const out = [];
  for (let i = 0; i < mission.lessons; i++) {
    const base = tmpl[i % tmpl.length];
    out.push({ ...base, id: `${mission.id}-l${i}`, index: i,
      title: i < tmpl.length ? base.title : `${base.title} · ${Math.floor(i / tmpl.length) + 1}` });
  }
  return out;
}

window.XK_LESSONS = { TRACK_LESSONS, buildLessons };

// ---- progress store (persisted in localStorage) ----
const XK_PROGRESS = {
  _read() { try { return JSON.parse(localStorage.getItem("xk_progress") || "{}"); } catch (e) { return {}; } },
  _write(o) { try { localStorage.setItem("xk_progress", JSON.stringify(o)); } catch (e) {} },
  done(missionId) { return this._read()[missionId] || []; },
  isDone(missionId, idx) { return this.done(missionId).includes(idx); },
  complete(missionId, idx) {
    const o = this._read();
    const arr = new Set(o[missionId] || []);
    arr.add(idx);
    o[missionId] = [...arr].sort((a, b) => a - b);
    this._write(o);
  },
  count(missionId) { return this.done(missionId).length; },
  pct(missionId, total) { return total ? Math.round((this.count(missionId) / total) * 100) : 0; },
  nextIndex(missionId, total) {
    const d = this.done(missionId);
    for (let i = 0; i < total; i++) if (!d.includes(i)) return i;
    return 0;
  },
};
window.XK_PROGRESS = XK_PROGRESS;
