# xakker.org — Dizayn Handoff (Claude Code üçün)

> **Məqsəd:** Dashboard-a tətbiq olunan dizayn sistemini **bütün digər ekranlara və onların daxili/detal səhifələrinə** tətbiq et.
> **İSTİSNA:** **Profil** ekranına TOXUNMA — olduğu kimi qalsın.

Bu prototip artıq layihədə var. Onu **həqiqət mənbəyi (source of truth)** kimi istifadə et:
`styles.css`, `detail.css`, `ui.jsx`, `dashboard.jsx`, `screens.jsx`, `screens2.jsx`, `detail.jsx`, `detail2.jsx`, `data.jsx`, `lessons-data.jsx`.

---

## 1. Dizayn sistemi (tokenlər)

```
Rənglər:
  --bg:        #08080a   (səhifə fonu)
  --surface:   #0f0f13   (kart fonu)
  --surface-2: #15151b   (input/chip fonu)
  --surface-3: #1d1d24   (ikincil)
  --border:    rgba(255,255,255,.07)
  --text:      #f4f4f6
  --text-2:    #b3b3bd
  --muted:     #74747f
  --accent:    #ff3b3b   (brend qırmızısı — AZ işlət, məqsədli)
  uğur (yaşıl): #19c37d

Tipoqrafiya:
  Başlıqlar:        Space Grotesk (600/700)
  Mətn:             Manrope (400–700)
  Etiket/kod/rəqəm: JetBrains Mono (uppercase + letter-spacing .12–.18em)

Spacing/forma:
  Kart radiusu: 16px (--radius)
  8px grid; kart padding ~22px; gap ~20px

Animasiyalar (orta):
  - Kartlar yüklənəndə pillələ açılır (reveal: opacity 0→1, translateY 14px→0)
  - Sayğaclar artır (count-up), progress/ring 0-dan dolur
  - Hover-də incə qaldırma (translateY -3px) + qırmızı border
  - VACİB: giriş animasiyaları "anim-ready" + "settled" fallback ilə qorunmalıdır
    ki, məzmun heç vaxt görünməz qalmasın (mövcud app.jsx-dəki məntiqə bax).
```

## 2. Təkrar istifadə olunan komponent nümunələri (ui.jsx)
`Card` (hover lift), `Badge` (accent/muted/ok), `ProgressBar`, `Ring`, `AnimatedNumber`, `Avatar`, `Icon`, `Heatmap`. Yeni ekranlarda bunları işlət — yeni stil icad etmə.

Düymələr: `.xk-btn.primary` (qırmızı), `.ghost`, `.outline`. Chip-lər: `.xk-chip`, filter: `.xk-filter`.

---

## 3. Yenilənəcək ekranlar (HƏR BİRİNİN DAXİLİ DƏ)

### Missiyalar (`screens.jsx` → MissionsScreen)
- Kart grid: rəngli üst zolaq, track + level badge, dərs/XP meta, progress, "Başla/Davam et".
- Filter chip-ləri (Hamısı/Web/Network/...).
**Daxili — Missiya detalı (`detail.jsx` → MissionDetail):**
- Hero: rəngli zolaq, başlıq, level, təsvir, meta (dərs/XP/vaxt), progress, "Missiyanı başlat".
- Dərslər siyahısı: status (✓ tamamlandı / → cari / nömrəli), tip etiketi (Nəzəriyyə/Quiz/Terminal), +XP.
- Aside: "Nə öyrənəcəksən" + "Mükafat".
**Daxili — Dərs görünüşü (`detail.jsx` → LessonView):**
- Üst: progress bar + dərs nöqtələri; tip etiketi.
- **Nəzəriyyə:** başlıq, paraqraflar, kod bloku (traffic-light bar + mono), ipucu callout-u.
- **Quiz:** variantlar, "Yoxla" → doğru/yanlış + izah, "Növbəti dərs".
- **Terminal:** interaktiv konsol (əmr yaz → icra → çıxış sətirləri), ipucu.
- **Mükafat overlay:** konfeti + medal + "+XP" + nişan.

### Laboratoriyalar (`screens.jsx` → LabsScreen)
- Sətir kartları: beaker ikonu, env/difficulty chip, status badge, "İşə sal".
**Daxili — Lab detalı (`detail2.jsx` → LabDetail):**
- Hero + interaktiv konsol (nmap/curl/sqlmap → məqsədlər avtomatik ✓ olur), məqsədlər siyahısı.

### Öyrənmə yolları (`screens.jsx` → PathsScreen)
- Mission tərzi kartlar (route ikonu).
**Daxili — Yol detalı (`detail2.jsx` → PathDetail):**
- Şaquli roadmap timeline: node statusları (done ✓ yaşıl / current → qırmızı / locked nömrə), missiya kartları → klikləyib missiyaya keç.

### Kurslar (`screens2.jsx` → CoursesScreen)
- Kart: kateqoriya-rəngli grid thumbnail, level, dərs/saat, müəllif avatarı, progress.
**Daxili — Kurs detalı (`detail2.jsx` → CourseDetail):**
- Sol: video pleyer mock (16:9, play). Sağ: kurs proqramı (bölmələr, dərs sətirləri, done/cari, progress).

### Reytinq (`screens.jsx` → LeaderboardScreen)
- Podium (top 3, #1 hündür) + tam cədvəl: rank, avatar, ad, progress bar, bal. "sən" vurğusu.

### Müstəqil öyrənmə (`screens2.jsx` → SelfStudyScreen)
- "Davam etdiyin material" hero kartı + cheatsheet grid (ikon + ad + kateqoriya/qeyd sayı).
**Daxili — Cheatsheet detalı (`detail2.jsx` → CheatsheetDetail):**
- Axtarış input + cədvəl (mono `code` açar → təsvir).

### ⛔ Profil — DƏYİŞMƏ
`ProfileScreen` olduğu kimi qalsın.

---

## 4. Naviqasiya/qaydalar
- Naviqasiya `{ name, params }` + back-stack ilə (`app.jsx`-ə bax). Kartlar detal səhifəsinə `nav.deep(...)` ilə keçir, geri düyməsi `nav.back()`.
- İrəliləyiş `localStorage`-də saxlanılır (`lessons-data.jsx` → XK_PROGRESS).
- Bütün mətnlər **Azərbaycan dilində**.
- Hər ekranın başında breadcrumb + "Geri" düyməsi (`PageBack`).

## 5. Qəbul meyarları
- [ ] Dashboard-dan başqa hər ekran yuxarıdakı sistemə uyğundur.
- [ ] Hər ekranın detal/daxili səhifəsi də redizayn olunub.
- [ ] Animasiyalar işləyir, məzmun heç vaxt görünməz qalmır.
- [ ] **Profil dəyişməyib.**
- [ ] Mobil/dar ekranda responsiv (mövcud breakpoint-lərə bax).
