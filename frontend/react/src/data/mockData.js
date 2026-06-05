const MOCK_MISSIONS = [
  {
    id: 1, slug: "sql-injection-101",
    title: "SQL Injection 101",
    track: "Web", category: "Web",
    difficulty: "beginner",
    pass_count: 5, xp_reward: 500, estimated_hours: 2,
    user_progress: null,
  },
  {
    id: 2, slug: "xss-mastery",
    title: "XSS Mastery",
    track: "Web", category: "Web",
    difficulty: "intermediate",
    pass_count: 6, xp_reward: 750, estimated_hours: 3,
    user_progress: null,
  },
  {
    id: 3, slug: "network-pentest-basics",
    title: "Network Pentest Basics",
    track: "Network", category: "Network",
    difficulty: "beginner",
    pass_count: 4, xp_reward: 400, estimated_hours: 2,
    user_progress: null,
  },
  {
    id: 4, slug: "linux-privilege-escalation",
    title: "Linux Privilege Escalation",
    track: "System", category: "System",
    difficulty: "advanced",
    pass_count: 8, xp_reward: 1200, estimated_hours: 4,
    user_progress: null,
  },
  {
    id: 5, slug: "crypto-ctf",
    title: "Kriptoqrafiya CTF",
    track: "Crypto", category: "Crypto",
    difficulty: "intermediate",
    pass_count: 5, xp_reward: 600, estimated_hours: 2.5,
    user_progress: null,
  },
  {
    id: 6, slug: "osint-recon",
    title: "OSINT Kəşfiyyat",
    track: "Recon", category: "Recon",
    difficulty: "beginner",
    pass_count: 3, xp_reward: 350, estimated_hours: 1.5,
    user_progress: null,
  },
  {
    id: 7, slug: "csrf-attack-defense",
    title: "CSRF Hücum və Müdafiə",
    track: "Web", category: "Web",
    difficulty: "intermediate",
    pass_count: 4, xp_reward: 550, estimated_hours: 2,
    user_progress: null,
  },
  {
    id: 8, slug: "windows-privesc",
    title: "Windows Privilege Escalation",
    track: "System", category: "System",
    difficulty: "expert",
    pass_count: 10, xp_reward: 1500, estimated_hours: 5,
    user_progress: null,
  },
  {
    id: 9, slug: "burp-suite-pro",
    title: "Burp Suite Pro",
    track: "Web", category: "Web",
    difficulty: "advanced",
    pass_count: 7, xp_reward: 900, estimated_hours: 3.5,
    user_progress: null,
  },
  {
    id: 10, slug: "subdomain-enumeration",
    title: "Subdomain Enumeration",
    track: "Recon", category: "Recon",
    difficulty: "beginner",
    pass_count: 3, xp_reward: 300, estimated_hours: 1,
    user_progress: null,
  },
  {
    id: 11, slug: "hash-cracking",
    title: "Hash Kracking",
    track: "Crypto", category: "Crypto",
    difficulty: "intermediate",
    pass_count: 4, xp_reward: 500, estimated_hours: 2,
    user_progress: null,
  },
  {
    id: 12, slug: "firewall-bypass",
    title: "Firewall Bypass Teknikaları",
    track: "Network", category: "Network",
    difficulty: "advanced",
    pass_count: 6, xp_reward: 850, estimated_hours: 3,
    user_progress: null,
  },
  {
    id: 13, slug: "directory-traversal",
    title: "Directory Traversal",
    track: "Web", category: "Web",
    difficulty: "beginner",
    pass_count: 4, xp_reward: 400, estimated_hours: 1.5,
    user_progress: null,
  },
  {
    id: 14, slug: "file-inclusion-lfi-rfi",
    title: "LFI / RFI Exploitation",
    track: "Web", category: "Web",
    difficulty: "intermediate",
    pass_count: 5, xp_reward: 650, estimated_hours: 2.5,
    user_progress: null,
  },
  {
    id: 15, slug: "ssrf-attacks",
    title: "SSRF Hücumları",
    track: "Web", category: "Web",
    difficulty: "advanced",
    pass_count: 7, xp_reward: 950, estimated_hours: 3.5,
    user_progress: null,
  },
  {
    id: 16, slug: "dns-enumeration",
    title: "DNS Enumeration",
    track: "Recon", category: "Recon",
    difficulty: "beginner",
    pass_count: 3, xp_reward: 300, estimated_hours: 1,
    user_progress: null,
  },
  {
    id: 17, slug: "google-dorking",
    title: "Google Dorking",
    track: "Recon", category: "Recon",
    difficulty: "beginner",
    pass_count: 2, xp_reward: 250, estimated_hours: 1,
    user_progress: null,
  },
  {
    id: 18, slug: "shodan-recon",
    title: "Shodan ilə Kəşfiyyat",
    track: "Recon", category: "Recon",
    difficulty: "intermediate",
    pass_count: 4, xp_reward: 500, estimated_hours: 2,
    user_progress: null,
  },
  {
    id: 19, slug: "arp-spoofing",
    title: "ARP Spoofing & MITM",
    track: "Network", category: "Network",
    difficulty: "intermediate",
    pass_count: 5, xp_reward: 600, estimated_hours: 2.5,
    user_progress: null,
  },
  {
    id: 20, slug: "vlan-hopping",
    title: "VLAN Hopping Hücumu",
    track: "Network", category: "Network",
    difficulty: "advanced",
    pass_count: 6, xp_reward: 800, estimated_hours: 3,
    user_progress: null,
  },
  {
    id: 21, slug: "rsa-attack",
    title: "RSA Zəiflikləri",
    track: "Crypto", category: "Crypto",
    difficulty: "advanced",
    pass_count: 5, xp_reward: 900, estimated_hours: 4,
    user_progress: null,
  },
  {
    id: 22, slug: "kernel-exploit",
    title: "Kernel Exploit İnkişafı",
    track: "System", category: "System",
    difficulty: "expert",
    pass_count: 10, xp_reward: 1800, estimated_hours: 6,
    user_progress: null,
  },
  {
    id: 23, slug: "active-directory-attacks",
    title: "Active Directory Hücumları",
    track: "System", category: "System",
    difficulty: "advanced",
    pass_count: 8, xp_reward: 1100, estimated_hours: 4,
    user_progress: null,
  },
  {
    id: 24, slug: "reverse-engineering-intro",
    title: "Reverse Engineering Əsasları",
    track: "System", category: "System",
    difficulty: "intermediate",
    pass_count: 4, xp_reward: 700, estimated_hours: 3,
    user_progress: null,
  },
];

const MOCK_ROOMS = [
  { id: 1, slug: "vulnerable-bank", title: "Vulnerable Bank", level: "beginner", progress_percent: 0, total_points: 200, tags: [{id:1,name:"web"}], tasks_count: 4, env: "docker", icon: "🏦" },
  { id: 2, slug: "breached-server", title: "Breached Server", level: "beginner", progress_percent: 0, total_points: 250, tags: [{id:2,name:"linux"}], tasks_count: 5, env: "vpn", icon: "🐧" },
  { id: 3, slug: "dark-forum", title: "Dark Forum", level: "intermediate", progress_percent: 0, total_points: 350, tags: [{id:1,name:"web"},{id:3,name:"sqli"}], tasks_count: 6, env: "docker", icon: "🌐" },
  { id: 4, slug: "corp-network", title: "Corp Network", level: "intermediate", progress_percent: 0, total_points: 400, tags: [{id:4,name:"network"}], tasks_count: 7, env: "vpn", icon: "🔌" },
  { id: 5, slug: "secured-zone", title: "Secured Zone", level: "advanced", progress_percent: 0, total_points: 500, tags: [{id:5,name:"privesc"}], tasks_count: 8, env: "vpn", icon: "🛡️" },
  { id: 6, slug: "crypto-vault", title: "Crypto Vault", level: "advanced", progress_percent: 0, total_points: 450, tags: [{id:6,name:"crypto"}], tasks_count: 5, env: "docker", icon: "🔐" },
  { id: 7, slug: "zero-day-playground", title: "Zero Day Playground", level: "expert", progress_percent: 0, total_points: 700, tags: [{id:7,name:"exploit"}], tasks_count: 10, env: "vpn", icon: "💥" },
  { id: 8, slug: "recon-mission", title: "Recon Mission", level: "beginner", progress_percent: 0, total_points: 150, tags: [{id:8,name:"osint"}], tasks_count: 3, env: "browser", icon: "👁️" },
  { id: 9, slug: "malware-analysis-lab", title: "Malware Analysis Lab", level: "expert", progress_percent: 0, total_points: 800, tags: [{id:9,name:"reverse"}], tasks_count: 9, env: "vpn", icon: "⚙️" },
  { id: 10, slug: "phishing-campaign", title: "Phishing Campaign", level: "intermediate", progress_percent: 0, total_points: 300, tags: [{id:10,name:"social"}], tasks_count: 5, env: "docker", icon: "🎣" },
  { id: 11, slug: "active-directory-lab", title: "Active Directory Lab", level: "advanced", progress_percent: 0, total_points: 600, tags: [{id:11,name:"windows"},{id:12,name:"ad"}], tasks_count: 8, env: "vpn", icon: "🪟" },
  { id: 12, slug: "iot-hacking", title: "IoT Hacking", level: "expert", progress_percent: 0, total_points: 650, tags: [{id:13,name:"iot"}], tasks_count: 7, env: "vpn", icon: "📡" },
  { id: 13, slug: "sql-injection-lab", title: "SQL Injection Lab", level: "beginner", progress_percent: 0, total_points: 180, tags: [{id:1,name:"web"},{id:3,name:"sqli"}], tasks_count: 4, env: "docker", icon: "💉" },
  { id: 14, slug: "xss-arena", title: "XSS Arena", level: "intermediate", progress_percent: 0, total_points: 280, tags: [{id:1,name:"web"},{id:14,name:"xss"}], tasks_count: 5, env: "docker", icon: "⚡" },
  { id: 15, slug: "dns-takeover", title: "DNS Takeover Lab", level: "intermediate", progress_percent: 0, total_points: 320, tags: [{id:4,name:"network"},{id:15,name:"dns"}], tasks_count: 4, env: "vpn", icon: "🌍" },
  { id: 16, slug: "crypto-challenge", title: "Crypto Challenge", level: "advanced", progress_percent: 0, total_points: 480, tags: [{id:6,name:"crypto"}], tasks_count: 6, env: "browser", icon: "🔑" },
  { id: 17, slug: "osint-deep-dive", title: "OSINT Deep Dive", level: "beginner", progress_percent: 0, total_points: 160, tags: [{id:8,name:"osint"}], tasks_count: 3, env: "browser", icon: "🔍" },
  { id: 18, slug: "buffer-overflow-lab", title: "Buffer Overflow Lab", level: "expert", progress_percent: 0, total_points: 750, tags: [{id:16,name:"bof"},{id:17,name:"exploit"}], tasks_count: 8, env: "vpn", icon: "💣" },
  { id: 19, slug: "wifi-hacking", title: "Wi-Fi Hacking Lab", level: "intermediate", progress_percent: 0, total_points: 360, tags: [{id:4,name:"network"},{id:18,name:"wifi"}], tasks_count: 5, env: "vpn", icon: "📶" },
  { id: 20, slug: "cloud-misconfig", title: "Cloud Misconfiguration", level: "advanced", progress_percent: 0, total_points: 520, tags: [{id:4,name:"network"},{id:19,name:"cloud"}], tasks_count: 6, env: "browser", icon: "☁️" },
];

const MOCK_COURSES = [
  { id: 1, slug: "web-security-fundamentals", title: "Web Security Fundamentals", category: "Web", level: "beginner", progress_percent: 0, lesson_count: 12, estimated_hours: 8, author_name: "Tural H." },
  { id: 2, slug: "advanced-pentesting", title: "Advanced Pentesting", category: "Web", level: "advanced", progress_percent: 0, lesson_count: 18, estimated_hours: 14, author_name: "Murad K." },
  { id: 3, slug: "network-security", title: "Network Security 101", category: "Network", level: "beginner", progress_percent: 0, lesson_count: 10, estimated_hours: 6, author_name: "Elvin M." },
  { id: 4, slug: "linux-privesc-course", title: "Linux Privilege Escalation", category: "System", level: "advanced", progress_percent: 0, lesson_count: 15, estimated_hours: 10, author_name: "Kənan R." },
  { id: 5, slug: "cryptography-basics", title: "Kriptoqrafiya Əsasları", category: "Crypto", level: "beginner", progress_percent: 0, lesson_count: 8, estimated_hours: 5, author_name: "Aytac S." },
  { id: 6, slug: "osint-techniques", title: "OSINT Kəşfiyyat Texnikaları", category: "Recon", level: "beginner", progress_percent: 0, lesson_count: 6, estimated_hours: 4, author_name: "Nicat P." },
  { id: 7, slug: "buffer-overflow-exploit", title: "Buffer Overflow Exploit", category: "System", level: "expert", progress_percent: 0, lesson_count: 20, estimated_hours: 16, author_name: "Rəşad M." },
  { id: 8, slug: "social-engineering", title: "Social Engineering", category: "Web", level: "intermediate", progress_percent: 0, lesson_count: 7, estimated_hours: 4, author_name: "Zaur E." },
  { id: 9, slug: "mobile-security", title: "Mobile Security", category: "Web", level: "advanced", progress_percent: 0, lesson_count: 14, estimated_hours: 10, author_name: "Ləman Q." },
  { id: 10, slug: "cloud-security", title: "Cloud Security", category: "Network", level: "advanced", progress_percent: 0, lesson_count: 16, estimated_hours: 12, author_name: "Fərid B." },
  { id: 11, slug: "reverse-engineering", title: "Reverse Engineering", category: "System", level: "advanced", progress_percent: 0, lesson_count: 13, estimated_hours: 10, author_name: "Kamran T." },
  { id: 12, slug: "malware-development", title: "Malware İnkişafı", category: "System", level: "expert", progress_percent: 0, lesson_count: 18, estimated_hours: 14, author_name: "Rəşad M." },
  { id: 13, slug: "wifi-security", title: "Wi-Fi Təhlükəsizliyi", category: "Network", level: "intermediate", progress_percent: 0, lesson_count: 9, estimated_hours: 6, author_name: "Elvin M." },
  { id: 14, slug: "web-app-firewall", title: "WAF Bypass Texnikaları", category: "Web", level: "advanced", progress_percent: 0, lesson_count: 11, estimated_hours: 8, author_name: "Tural H." },
  { id: 15, slug: "threat-intelligence", title: "Threat Intelligence", category: "Recon", level: "intermediate", progress_percent: 0, lesson_count: 8, estimated_hours: 5, author_name: "Nicat P." },
  { id: 16, slug: "docker-security", title: "Docker Konteyner Təhlükəsizliyi", category: "System", level: "intermediate", progress_percent: 0, lesson_count: 10, estimated_hours: 7, author_name: "Zaur E." },
  { id: 17, slug: "api-security", title: "API Təhlükəsizliyi", category: "Web", level: "intermediate", progress_percent: 0, lesson_count: 12, estimated_hours: 8, author_name: "Ləman Q." },
  { id: 18, slug: "iot-security", title: "IoT Cihaz Təhlükəsizliyi", category: "Network", level: "advanced", progress_percent: 0, lesson_count: 14, estimated_hours: 10, author_name: "Murad K." },
];

const MOCK_PLANS = [
  {
    id: 1, slug: "bug-bounty-hunter",
    title: "Bug Bounty Hunter",
    summary: "Web zəifliklərini tapmaq üçün tam marşrut. SQL injection-dan XSS-ə, CSRF-dən SSRF-ə qədər.",
    color: "#3b82f6",
    missions: 8,
    user_progress: { completed: 0, total: 8 },
  },
  {
    id: 2, slug: "penetration-tester",
    title: "Penetration Tester",
    summary: "Sıfırdan professional pentester-ə qədər. Network, web, system və exploitation.",
    color: "#ff3b3b",
    missions: 12,
    user_progress: { completed: 0, total: 12 },
  },
  {
    id: 3, slug: "soc-analyst",
    title: "SOC Analyst",
    summary: "Log təhlili, threat hunting, incident response və blue team bacarıqları.",
    color: "#22c55e",
    missions: 6,
    user_progress: { completed: 0, total: 6 },
  },
  {
    id: 4, slug: "crypto-expert",
    title: "Kriptoqrafiya Mütəxəssisi",
    summary: "Şifrələmə, hash, steganoqrafiya və kriptoanaliz üzrə dərin bilik.",
    color: "#c084fc",
    missions: 5,
    user_progress: { completed: 0, total: 5 },
  },
  {
    id: 5, slug: "red-team-specialist",
    title: "Red Team Specialist",
    summary: "Advanced persistent threat simulyasiyası, sosial mühəndislik və zero-day kəşfi.",
    color: "#ff7a8a",
    missions: 10,
    user_progress: { completed: 0, total: 10 },
  },
];

const MOCK_QUESTIONS = [
  {
    id: 1, title: "Port skanı və xidmət aşkarlama", question_type: "terminal", points: 50, level: "beginner",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "Hədəf serverdə açıq portları tapın və HTTP xidmətini aşkarlayın. nmap -sV istifadə edin.",
    starter_code: "nmap -sV 10.10.10.1",
  },
  {
    id: 2, title: "Gizli faylı tapın", question_type: "terminal", points: 75, level: "intermediate",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "Serverdə gizli faylı tapmaq üçün find və cat əmrlərindən istifadə edin. İpucu: .hidden qovluğunda flag var.",
    starter_code: "ls -la",
  },
  {
    id: 3, title: "Base64 məlumatını deşifrə et", question_type: "terminal", points: 40, level: "beginner",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "Aşağıdakı Base64 mətnini deşifrə edin: ZW5jb2RlZCBtZXNzYWdl. base64 -d istifadə edin.",
    starter_code: "echo 'eGtyezEybWVuNHRpb259'",
  },
  {
    id: 4, title: "SQL Injection nədir?", question_type: "open", points: 30, level: "beginner",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "SQL Injection zəifliyini qısaca izah edin və onun qarşısını almaq üçün 2 üsul yazın.",
  },
  {
    id: 5, title: "CSRF token izahı", question_type: "open", points: 35, level: "intermediate",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "CSRF (Cross-Site Request Forgery) hücumundan qorunmaq üçün CSRF token necə işləyir? Addımlarla izah edin.",
  },
  {
    id: 6, title: "Lateral movement nədir?", question_type: "open", points: 45, level: "advanced",
    course: { id: 4, title: "Linux Privilege Escalation" }, user_status: "pending",
    prompt: "Lateral movement (yan hərəkət) nədir və pentest zamanı necə həyata keçirilir? Ən azı 3 texnika göstərin.",
  },
  {
    id: 7, title: "XSS növləri", question_type: "closed", points: 25, level: "beginner",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "Aşağıdakılardan hansı XSS (Cross-Site Scripting) növü DEYİL?",
    choices: [
      { id: 1, text: "Reflected XSS" },
      { id: 2, text: "Stored XSS" },
      { id: 3, text: "DOM-based XSS" },
      { id: 4, text: "SQL XSS" },
    ],
  },
  {
    id: 8, title: "OWASP Top 10", question_type: "closed", points: 30, level: "intermediate",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "OWASP Top 10 aşağıdakılardan hansını özündə saxlamır?",
    choices: [
      { id: 1, text: "Broken Access Control" },
      { id: 2, text: "Cryptographic Failures" },
      { id: 3, text: "DDoS Protection" },
      { id: 4, text: "Injection" },
    ],
  },
  {
    id: 9, title: "Port nömrələri", question_type: "closed", points: 20, level: "beginner",
    course: { id: 3, title: "Network Security 101" }, user_status: "pending",
    prompt: "HTTP xidməti standart olaraq hansı portda işləyir?",
    choices: [
      { id: 1, text: "21" },
      { id: 2, text: "22" },
      { id: 3, text: "80" },
      { id: 4, text: "443" },
    ],
  },
  {
    id: 10, title: "Gobuster ilə directory brute-force", question_type: "terminal", points: 60, level: "intermediate",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Gobuster ilə hədəf veb serverdə gizli direktoriyaları tapın. Admin login formasını aşkarlayın.",
    starter_code: "gobuster dir -u http://target.local",
  },
  {
    id: 11, title: "Steganoqrafiya", question_type: "open", points: 50, level: "advanced",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "Steganoqrafiya nədir? Şəkil və ya səs faylında gizli məlumatı necə gizlətmək olar? Praktiki nümunə ilə izah edin.",
  },
  {
    id: 12, title: "Symmetric vs Asymmetric", question_type: "closed", points: 35, level: "intermediate",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "Aşağıdakılardan hansı asymmetric (asimmetrik) şifrələmə alqoritmidir?",
    choices: [
      { id: 1, text: "AES" },
      { id: 2, text: "DES" },
      { id: 3, text: "RSA" },
      { id: 4, text: "Blowfish" },
    ],
  },

  // --- 6 more TERMINAL questions ---
  {
    id: 13, title: "Netcat ilə reverse shell", question_type: "terminal", points: 80, level: "intermediate",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Hədəf maşında Netcat reverse shell açın. Dinləyici portunu 4444 edin. nc əmrindən istifadə edin.",
    starter_code: "nc -lvnp 4444",
  },
  {
    id: 14, title: "Hashcat ilə MD5 krakı", question_type: "terminal", points: 70, level: "intermediate",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "Aşağıdakı MD5 hash-i wordlist ilə krak edin: 5f4dcc3b5aa765d61d8327deb882cf99. rockyou.txt istifadə edin.",
    starter_code: "hashcat -m 0 5f4dcc3b5aa765d61d8327deb882cf99 /usr/share/wordlists/rockyou.txt",
  },
  {
    id: 15, title: "Hydra ilə SSH brute-force", question_type: "terminal", points: 90, level: "advanced",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Hydra ilə SSH servisinə brute-force hücumu həyata keçirin. Hədəf: 10.10.10.5, istifadəçi: admin.",
    starter_code: "hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.10.5 ssh",
  },
  {
    id: 16, title: "Wireshark filtri", question_type: "terminal", points: 55, level: "beginner",
    course: { id: 3, title: "Network Security 101" }, user_status: "pending",
    prompt: "tshark ilə yalnız HTTP GET sorğularını çıxardın. capture.pcap faylını analiz edin.",
    starter_code: "tshark -r capture.pcap -Y 'http.request.method == \"GET\"'",
  },
  {
    id: 17, title: "John the Ripper", question_type: "terminal", points: 65, level: "intermediate",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "John the Ripper ilə /etc/shadow faylındakı şifrəni krak edin. shadow.txt faylını istifadə edin.",
    starter_code: "john --wordlist=/usr/share/wordlists/rockyou.txt shadow.txt",
  },
  {
    id: 18, title: "Metasploit exploit işlətmək", question_type: "terminal", points: 100, level: "advanced",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Metasploit ilə EternalBlue exploit-ini işlədin. Hədəf: 10.10.10.10 (Windows 7). msf> prompt-dan başlayın.",
    starter_code: "use exploit/windows/smb/ms17_010_eternalblue",
  },

  // --- 6 more OPEN questions ---
  {
    id: 19, title: "Buffer Overflow izahı", question_type: "open", points: 40, level: "intermediate",
    course: { id: 7, title: "Buffer Overflow Exploit" }, user_status: "pending",
    prompt: "Buffer overflow zəifliyi nədir? Stack-based buffer overflow zamanı nə baş verir? Exploit inkişafında EIP registrinin rolu nədir?",
  },
  {
    id: 20, title: "Niyə HTTPS kifayət deyil?", question_type: "open", points: 30, level: "beginner",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "HTTPS saytı təhlükəsiz edir deyimi doğrudurmu? HTTPS-in qorumadığı 3 hücum vektorunu izah edin.",
  },
  {
    id: 21, title: "Threat Modeling prosesi", question_type: "open", points: 50, level: "advanced",
    course: { id: 4, title: "Linux Privilege Escalation" }, user_status: "pending",
    prompt: "STRIDE modeli nədir? Hər 6 hücum növünü qısaca izah edin və hər biri üçün real nümunə verin.",
  },
  {
    id: 22, title: "Zero-day zəifliyi", question_type: "open", points: 60, level: "advanced",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Zero-day zəifliyi nədir? Responsible disclosure (məsuliyyətli açıqlama) prosesini addımlarla izah edin. Bug bounty proqramlarının rolu nədir?",
  },
  {
    id: 23, title: "Kriptovalyuta və təhlükəsizlik", question_type: "open", points: 45, level: "intermediate",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "Blockchain texnologiyasında kriptoqrafiya necə istifadə edilir? Public key infrastructure (PKI) sistemi kriptovalyutada necə işləyir?",
  },
  {
    id: 24, title: "Pentest hesabatı necə yazılır?", question_type: "open", points: 35, level: "beginner",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Professional pentest hesabatı hansı bölümlərdən ibarət olmalıdır? Kritik tapıntıları müştəriyə necə çatdırmaq lazımdır?",
  },

  // --- 6 more CLOSED questions ---
  {
    id: 25, title: "Nmap skanlama növü", question_type: "closed", points: 25, level: "beginner",
    course: { id: 3, title: "Network Security 101" }, user_status: "pending",
    prompt: "Nmap ilə gizli (stealth) skan üçün hansı flag istifadə edilir?",
    choices: [
      { id: 1, text: "-sS (SYN scan)" },
      { id: 2, text: "-sT (TCP connect scan)" },
      { id: 3, text: "-sU (UDP scan)" },
      { id: 4, text: "-sP (Ping scan)" },
    ],
  },
  {
    id: 26, title: "HTTPS portu", question_type: "closed", points: 20, level: "beginner",
    course: { id: 3, title: "Network Security 101" }, user_status: "pending",
    prompt: "HTTPS xidməti standart olaraq hansı portda işləyir?",
    choices: [
      { id: 1, text: "80" },
      { id: 2, text: "443" },
      { id: 3, text: "8080" },
      { id: 4, text: "8443" },
    ],
  },
  {
    id: 27, title: "SQL injection növü", question_type: "closed", points: 30, level: "intermediate",
    course: { id: 1, title: "Web Security Fundamentals" }, user_status: "pending",
    prompt: "Serverdən birbaşa xəta mesajı olmadan SQL injection həyata keçirmək üçün hansı texnikadan istifadə olunur?",
    choices: [
      { id: 1, text: "Error-based SQLi" },
      { id: 2, text: "UNION-based SQLi" },
      { id: 3, text: "Blind Boolean-based SQLi" },
      { id: 4, text: "Stacked queries" },
    ],
  },
  {
    id: 28, title: "Kerberoasting hücumu", question_type: "closed", points: 40, level: "advanced",
    course: { id: 4, title: "Linux Privilege Escalation" }, user_status: "pending",
    prompt: "Kerberoasting hücumu nəyi hədəf alır?",
    choices: [
      { id: 1, text: "Domain Controller şifrəsi" },
      { id: 2, text: "Service Account-ların TGS biletləri" },
      { id: 3, text: "NTLM hash-ləri" },
      { id: 4, text: "Kerberos master key" },
    ],
  },
  {
    id: 29, title: "Şifrələmə rejimi", question_type: "closed", points: 35, level: "intermediate",
    course: { id: 5, title: "Kriptoqrafiya Əsasları" }, user_status: "pending",
    prompt: "AES-nin hansı rejimi hər bloku əvvəlki şifrəli blokla XOR edir?",
    choices: [
      { id: 1, text: "ECB (Electronic Codebook)" },
      { id: 2, text: "CBC (Cipher Block Chaining)" },
      { id: 3, text: "CTR (Counter)" },
      { id: 4, text: "GCM (Galois/Counter Mode)" },
    ],
  },
  {
    id: 30, title: "Reverse shell vs Bind shell", question_type: "closed", points: 30, level: "intermediate",
    course: { id: 2, title: "Advanced Pentesting" }, user_status: "pending",
    prompt: "Firewall arxasındakı hədəf maşında hansı shell növü daha effektivdir?",
    choices: [
      { id: 1, text: "Bind shell — hədəf port açır" },
      { id: 2, text: "Reverse shell — hədəf bağlantı qurur" },
      { id: 3, text: "Web shell — sadəcə HTTP istifadə edir" },
      { id: 4, text: "Meterpreter — yalnız Windows-da işləyir" },
    ],
  },
];

const MOCK_QUESTION_PROGRESS = {
  total_questions: 30,
  correct_answers: 0,
  answered_questions: 0,
  total_attempts: 0,
  total_points_earned: 0,
  accuracy_percent: 0,
};

const MOCK_PLAN_ROADMAP = {
  "bug-bounty-hunter": [
    { id: 1, title: "Web Əsasları", type: "course", target: "/courses/web-security-fundamentals", desc: "HTTP, HTML, JavaScript, DOM", done: false },
    { id: 2, title: "SQL Injection", type: "mission", target: "/missions/sql-injection-101", desc: "Manual və avtomatik SQLI testi", done: false },
    { id: 3, title: "XSS Mastery", type: "mission", target: "/missions/xss-mastery", desc: "Reflected, Stored, DOM-based XSS", done: false },
    { id: 4, title: "CSRF & SSRF", type: "mission", target: "/missions/csrf-attack-defense", desc: "CSRF token bypass, SSRF exploitation", done: false },
    { id: 5, title: "Burp Suite Pro", type: "mission", target: "/missions/burp-suite-pro", desc: "Proxy, Repeater, Intruder, Scanner", done: false },
    { id: 6, title: "Web Lab: Vulnerable Bank", type: "room", target: "/rooms/vulnerable-bank", desc: "Real bank tətbiqində pentest", done: false },
    { id: 7, title: "Web Lab: Dark Forum", type: "room", target: "/rooms/dark-forum", desc: "Forumda SQLI + XSS kombinasiyası", done: false },
    { id: 8, title: "Final Sınaq", type: "exam", target: "/self-study", desc: "Bug bounty simulyasiyası", done: false },
  ],
  "penetration-tester": [
    { id: 1, title: "Network Fundamentals", type: "course", target: "/courses/network-security", desc: "TCP/IP, subnets, routing, firewalls", done: false },
    { id: 2, title: "Network Pentest Basics", type: "mission", target: "/missions/network-pentest-basics", desc: "Port scanning, service enumeration", done: false },
    { id: 3, title: "Linux Privilege Escalation", type: "mission", target: "/missions/linux-privilege-escalation", desc: "SUID, cron, kernel exploits", done: false },
    { id: 4, title: "Windows Privilege Escalation", type: "mission", target: "/missions/windows-privesc", desc: "Token manipulation, service hijacking", done: false },
    { id: 5, title: "Active Directory Lab", type: "room", target: "/rooms/active-directory-lab", desc: "AD enumeration, kerberoasting", done: false },
    { id: 6, title: "Corp Network Lab", type: "room", target: "/rooms/corp-network", desc: "Multi-host network pentest", done: false },
    { id: 7, title: "Buffer Overflow", type: "course", target: "/courses/buffer-overflow-exploit", desc: "Stack overflow, shellcode development", done: false },
    { id: 8, title: "Firewall Bypass", type: "mission", target: "/missions/firewall-bypass", desc: "IDS/IPS evasion techniques", done: false },
    { id: 9, title: "Secured Zone Lab", type: "room", target: "/rooms/secured-zone", desc: "Hardened server exploitation", done: false },
    { id: 10, title: "Zero Day Playground", type: "room", target: "/rooms/zero-day-playground", desc: "0-day vulnerability research", done: false },
    { id: 11, title: "OSINT & Recon", type: "mission", target: "/missions/osint-recon", desc: "Passive information gathering", done: false },
    { id: 12, title: "Final Exam", type: "exam", target: "/self-study", desc: "Full-scope penetration test", done: false },
  ],
  "soc-analyst": [
    { id: 1, title: "Network Security Course", type: "course", target: "/courses/network-security", desc: "TCP/IP, firewalls, IDS/IPS", done: false },
    { id: 2, title: "Log Analysis", type: "room", target: "/rooms/recon-mission", desc: "Log parsing, SIEM fundamentals", done: false },
    { id: 3, title: "Threat Hunting", type: "room", target: "/rooms/malware-analysis-lab", desc: "IOC hunting, YARA rules", done: false },
    { id: 4, title: "Incident Response", type: "mission", target: "/missions/firewall-bypass", desc: "Incident handling workflow", done: false },
    { id: 5, title: "Phishing Analysis", type: "room", target: "/rooms/phishing-campaign", desc: "Email analysis, URL scanning", done: false },
    { id: 6, title: "SOC Capstone", type: "exam", target: "/self-study", desc: "SOC analyst simulyasiyası", done: false },
  ],
  "crypto-expert": [
    { id: 1, title: "Cryptography Basics", type: "course", target: "/courses/cryptography-basics", desc: "AES, RSA, hashing, signatures", done: false },
    { id: 2, title: "Crypto CTF", type: "mission", target: "/missions/crypto-ctf", desc: "Crypto challenge-lər", done: false },
    { id: 3, title: "Hash Cracking", type: "mission", target: "/missions/hash-cracking", desc: "MD5, SHA1, bcrypt kracking", done: false },
    { id: 4, title: "Crypto Vault Lab", type: "room", target: "/rooms/crypto-vault", desc: "Encryption bypass, key extraction", done: false },
    { id: 5, title: "Steganoqrafiya", type: "exam", target: "/self-study", desc: "Image/audio stenography", done: false },
  ],
  "red-team-specialist": [
    { id: 1, title: "Advanced Pentesting", type: "course", target: "/courses/advanced-pentesting", desc: "Advanced web and network attacks", done: false },
    { id: 2, title: "Social Engineering", type: "course", target: "/courses/social-engineering", desc: "Phishing, pretexting, physical", done: false },
    { id: 3, title: "Phishing Campaign Lab", type: "room", target: "/rooms/phishing-campaign", desc: "Email campaign simulyasiyası", done: false },
    { id: 4, title: "IoT Hacking Lab", type: "room", target: "/rooms/iot-hacking", desc: "Embedded device exploitation", done: false },
    { id: 5, title: "Malware Analysis Lab", type: "room", target: "/rooms/malware-analysis-lab", desc: "Reverse engineering", done: false },
    { id: 6, title: "Zero Day Playground", type: "room", target: "/rooms/zero-day-playground", desc: "Vulnerability research", done: false },
    { id: 7, title: "Buffer Overflow", type: "course", target: "/courses/buffer-overflow-exploit", desc: "Exploit development", done: false },
    { id: 8, title: "Mobile Security", type: "course", target: "/courses/mobile-security", desc: "Android/iOS pentesting", done: false },
    { id: 9, title: "Cloud Security", type: "course", target: "/courses/cloud-security", desc: "AWS/Azure security assessment", done: false },
    { id: 10, title: "Red Team Exercise", type: "exam", target: "/self-study", desc: "Full-scope red team operation", done: false },
  ],
};

export function getMockMissions() {
  return MOCK_MISSIONS;
}

export function getMockRooms() {
  return MOCK_ROOMS;
}

export function getMockCourses() {
  return MOCK_COURSES;
}

export function getMockPlans() {
  return MOCK_PLANS;
}

export function getMockQuestions() {
  return MOCK_QUESTIONS;
}

export function getMockQuestionProgress() {
  return MOCK_QUESTION_PROGRESS;
}

export function getMockPlanRoadmap(slug) {
  return MOCK_PLAN_ROADMAP[slug] || [];
}
