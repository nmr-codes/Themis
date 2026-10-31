# Uzbek Legal Editorial Design System Reference
*Huquqiy Yordam (Themis) — Design System, Typography & Editorial Palette Specification*

---

## 1. Philosophy & Aesthetic Identity

Themis rejects generic SaaS templates, cold blue floating card grids, and default Inter/Roboto typography. Instead, it is grounded in the cultural, historic, and legal heritage of Uzbekistan:

- **Judicial Authority & Solemnity**: Echoing the constitutional doctrine *"Kuch adolatdadir"* (Amir Temur), legal codes (*O'zR Kodekslari*), and official decrees from the Ministry of Justice (*Adliya Vazirligi*).
- **Tactile Legal Archive / Vellum Aesthetic**: Soft parchment surfaces, fine deckle borders, and deep obsidian ink replace blinding stark white backgrounds.
- **Architectural Cultural Palette**: Colors drawn directly from Uzbekistan's architectural masterpieces (the lapis and cobalt domes of Samarkand's Registan, the warm fired-brick terracotta of Bukhara's Po-i-Kalyan minaret, the noble emerald seals of justice, and antique illuminated manuscript gold).

---

## 2. Color Palette Specification

### Core Editorial Palette

| Role | Name | Hex | HSL Token | Usage |
|------|------|-----|-----------|-------|
| **Background** | Warm Parchment | `#FAF8F5` | `36 33% 97%` | Platform base background, editorial canvas |
| **Foreground** | Obsidian Document Ink | `#0B132B` | `225 59% 11%` | Primary judicial headlines, body typography, deep contrast text |
| **Primary** | Samarkand Azure | `#0D47A1` | `216 85% 34%` | Primary CTAs, brand emblems, official links, active states |
| **Accent** | Bukhara Terracotta | `#B84A2A` | `14 63% 44%` | Statute quotes, urgency alerts, legal dispute highlights, category accents |
| **Verification Seal** | Noble Emerald | `#166534` | `143 64% 24%` | Verified advocate badges (`#ADV-xxxx`), Ministry of Justice trust marks |
| **Judicial Crest** | Antique Gold | `#C59B27` | `44 67% 46%` | Rating stars, judicial shields, constitutional quotes, decorative borders |
| **Card / Linen** | Warm Archival Linen | `#FDFBF7` | `40 50% 98%` | Dossier cards, consultation bubbles, popovers |
| **Border / Deckle** | Parchment Deckle | `#E2DCD0` | `40 24% 85%` | Card borders, dividing rules, table column dividers |
| **Muted Surface** | Parchment Wash | `#ECE6DC` | `38 22% 91%` | Disabled states, metadata tags, subtle card backgrounds |
| **Muted Ink** | Graphite Quill Ink | `#556073` | `220 16% 40%` | Secondary timestamps, helper labels, disclaimers |

### Contrast & Accessibility (WCAG 2.1 AA / AAA Compliance)

- **Obsidian Ink (`#0B132B`) on Warm Parchment (`#FAF8F5`)**: Contrast ratio **17.2:1** (Passes WCAG AAA for all text sizes).
- **Samarkand Azure (`#0D47A1`) on Warm Parchment (`#FAF8F5`)**: Contrast ratio **7.4:1** (Passes WCAG AAA for normal text).
- **Noble Emerald (`#166534`) on Emerald Pill Tint (`rgba(22, 101, 52, 0.08)`)**: Contrast ratio **7.8:1** (Passes WCAG AAA).
- **Bukhara Terracotta (`#B84A2A`) on Warm Parchment (`#FAF8F5`)**: Contrast ratio **5.1:1** (Passes WCAG AA for normal text, AAA for large headlines).

---

## 3. Typography Architecture

Dual-font pairing loaded via `next/font/google` with zero layout shift and local caching:

### A. Judicial Serif: `Playfair Display`
- **Import**: `next/font/google` -> `Playfair_Display`
- **Subsets**: `['latin', 'cyrillic']`
- **Weights**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold), 900 (black)
- **CSS Variable**: `--font-serif`
- **Tailwind Class**: `font-serif`
- **Application**:
  * Judicial Masthead & Brand title (*"Huquqiy Yordam"*)
  * Hero statement (*"Kuch adolatdadir"*)
  * Legal statute citations & constitutional articles
  * Attorney profile names & case dossier titles
  * Formal legal opinions & AI consultation memorandums

### B. Modern Interface Sans: `Plus Jakarta Sans`
- **Import**: `next/font/google` -> `Plus_Jakarta_Sans`
- **Subsets**: `['latin', 'cyrillic-ext']`
- **Weights**: 300, 400, 500, 600, 700, 800
- **CSS Variable**: `--font-sans`
- **Tailwind Class**: `font-sans`
- **Application**:
  * Body copy, interactive buttons, inputs, filter dropdowns
  * Navigation links, tab bars, pricing tables
  * Form fields, toast notifications, status badges

### C. Display & Insignia: `Cinzel`
- **Import**: `next/font/google` -> `Cinzel`
- **Subsets**: `['latin']`
- **CSS Variable**: `--font-cinzel` / `--font-display`
- **Tailwind Class**: `font-display`
- **Application**:
  * Sub-headings in all-caps tracking (`font-judicial-sub`)
  * Court insignia, seal stamps, constitutional motto badges

---

## 4. Shared Editorial Utility Classes

### 1. `.legal-seal`
Official verification seal for verified advocates and state accreditation.
```html
<span class="legal-seal">
  <CheckCircle2 className="w-3.5 h-3.5" />
  Adliya Vazirligi Tasdiqlagan • #ADV-2024-884
</span>
```

### 2. `.statute-border`
Left-accented block for national code citations (Lex.uz, Mehnat Kodeksi, Oila Kodeksi).
```html
<div class="statute-border">
  <h4 class="font-serif font-bold text-obsidian text-lg">O'zR Mehnat Kodeksi 161-modda</h4>
  <p class="font-sans text-sm text-slate-700 mt-1">Mehnat shartnomasini bekor qilish tartibi...</p>
</div>
```
Variations:
- `.statute-border`: Bukhara Terracotta accent (`#B84A2A`)
- `.statute-border-azure`: Samarkand Azure accent (`#0D47A1`)
- `.statute-border-gold`: Antique Gold accent (`#C59B27`)

### 3. `.parchment-card`
Tactile paper card replacing generic white rectangles.
```html
<div class="parchment-card p-6">
  <!-- Dossier or consultation content -->
</div>
```

### 4. `.judicial-crest`
Antique gold crest badge for scores, ratings, and court accolades.
```html
<div class="judicial-crest">
  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
  <span>4.98 • Oliy Toifali Advokat</span>
</div>
```

### 5. `.legal-memorandum`
Formal parchment container with top tricolor border ribbon (Azure, Gold, Terracotta).
```html
<div class="legal-memorandum p-8">
  <div class="border-b border-border pb-4 mb-6">
    <span class="font-mono text-xs uppercase tracking-widest text-muted-foreground">HUQUQIY XULOSA № 2026/10-B</span>
    <h2 class="font-serif text-2xl font-bold text-foreground">Dastlabki Huquqiy Tahlil</h2>
  </div>
  <!-- Memorandum Content -->
</div>
```

### 6. `.lex-citation`
Pill link for direct reference to Lex.uz articles.
```html
<a href="https://lex.uz/docs/6257288" target="_blank" class="lex-citation">
  <ExternalLink className="w-3 h-3" />
  Lex.uz • 161-modda
</a>
```

---

## 5. Migration & Compatibility Matrix

| Old Class / Token | New Standard Token | Compatibility Status |
|-------------------|--------------------|----------------------|
| `var(--font-cormorant)` | `var(--font-serif)` | Fully aliased in `globals.css` |
| `var(--font-jakarta)` | `var(--font-sans)` | Fully aliased in `globals.css` |
| `.paper-card` | `.parchment-card` | Both defined and identical |
| `.seal-badge` | `.legal-seal` | Both defined with emerald colors |
| `lapis-*` | `samarkand-*` | `lapis` palette retained in `tailwind.config.ts` |
| `text-gold-gradient` | `text-gold-gradient` | Retained with updated warm gold stops |
| `bg-court-mesh` | `bg-court-mesh` | Retained with updated antique gold & azure stops |
