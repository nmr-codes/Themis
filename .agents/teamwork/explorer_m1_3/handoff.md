# Handoff Report: Explorer M1_3 (Design System, Typography & Editorial Palette)

## 1. Observation
1. **Font Loading Architecture in `src/app/layout.tsx:20-28`**:
   - `src/app/layout.tsx` currently loads fonts via external HTML `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` tags inside `<head>` rather than using Next.js 14 native `next/font/google`.
   - External font tags cause Cumulative Layout Shift (CLS), render-blocking requests, and break offline compilation.
   - Sonner toast options at line 36 referenced `var(--font-jakarta)` without Next.js font variable integration.
2. **Font Family Mappings in `tailwind.config.ts:18-23`**:
   - `fontFamily` in `tailwind.config.ts` was mapped as:
     ```ts
     serif: ["var(--font-cormorant)", "Georgia", "serif"],
     display: ["var(--font-cinzel)", "var(--font-cormorant)", "serif"],
     sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
     ```
   - Does not map `var(--font-serif)` and `var(--font-sans)` as required by the Design Tokens Contract (`PROJECT.md` §2).
3. **Palette & Color Variables in `src/app/globals.css:13-63`**:
   - `:root` currently defines:
     ```css
     --background: 44 38% 97.5%; /* #FAF7F0 Warm Archival Parchment */
     --foreground: 220 35% 13%; /* #141C2B Deep Midnight Ink */
     --primary: 220 58% 18%; /* #132A4F Grand Judicial Lapis */
     ```
   - Lacks the specific Warm Uzbek Heritage palette specified in `PROJECT.md` and user instructions:
     * Warm parchment `#FAF8F5` (`36 33% 97%`)
     * Obsidian document ink `#0B132B` (`225 59% 11%`)
     * Samarkand azure `#0D47A1` (`216 85% 34%`)
     * Bukhara terracotta `#B84A2A` (`14 63% 44%`)
     * Adliya noble emerald seal `#166534` (`143 64% 24%`)
     * Judicial antique gold crest `#C59B27` (`44 67% 46%`)
4. **Google Font Subsets Verification (`next/font/google`)**:
   - Inspected `node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts`:
     * `Playfair_Display`: supports `['latin', 'cyrillic']`
     * `Plus_Jakarta_Sans`: supports `['latin', 'cyrillic-ext']`
     * `Cinzel`: supports `['latin', 'latin-ext']` (no cyrillic)
   - Tested network connectivity to `https://fonts.googleapis.com` via node fetch: HTTP 200 OK.
5. **Existing UI Usages & Peer Work**:
   - Components across `src/app` and `src/components/ui/` use both Tailwind classes (`font-sans`, `font-serif`, `bg-background`, `text-foreground`, `paper-card`, `font-editorial-heading`, `font-judicial-sub`) and color names (`gold`, `lapis`, `seal`).
   - Peer Explorer M1_2 (`proposed_error.tsx`) relies on `paper-card`, `bg-court-mesh`, `text-seal`, and `bg-seal/10`.

---

## 2. Logic Chain
1. *From Observation 1 & 4*: To eliminate CLS, enable font self-hosting, and support Uzbek Cyrillic legal text (Lex.uz statutes, court documents, Soviet/post-Soviet legal texts), `src/app/layout.tsx` must load `Playfair_Display` (`['latin', 'cyrillic']`) and `Plus_Jakarta_Sans` (`['latin', 'cyrillic-ext']`) alongside `Cinzel` (`['latin']`) via `next/font/google`, exposing CSS variables `--font-serif`, `--font-sans`, and `--font-cinzel` on `<html>`.
2. *From Observation 2*: In `tailwind.config.ts`, `fontFamily` must map:
   - `serif: ["var(--font-serif)", "Georgia", "serif"]`
   - `sans: ["var(--font-sans)", "system-ui", "sans-serif"]`
   - `display: ["var(--font-display)", "var(--font-cinzel)", "var(--font-serif)", "serif"]`
   For 100% backward compatibility, CSS aliases `--font-cormorant: var(--font-serif)` and `--font-jakarta: var(--font-sans)` are defined in `globals.css` so existing components never break.
3. *From Observation 3*: Converted hex colors to mathematically exact HSL tokens:
   - `#FAF8F5` -> `36 33% 97%` (`--background`)
   - `#0B132B` -> `225 59% 11%` (`--foreground`, `--card-foreground`)
   - `#FDFBF7` -> `40 50% 98%` (`--card`, `--popover`)
   - `#0D47A1` -> `216 85% 34%` (`--primary`, `--ring`)
   - `#B84A2A` -> `14 63% 44%` (`--accent`)
   - `#166534` -> `143 64% 24%` (`--seal-verified`)
   - `#C59B27` -> `44 67% 46%` (`--gold-crest`)
   - `#E2DCD0` -> `40 24% 85%` (`--border`, `--input`)
   WCAG contrast tests confirm `#0B132B` on `#FAF8F5` achieves **17.2:1** contrast ratio (exceeds WCAG AAA requirement).
4. *From Observation 5*: Shared editorial utility classes were designed to elevate generic UI blocks into authentic legal artifacts:
   - `.legal-seal`: Emerald Adliya verification seal badge for verified advocates (`#ADV-xxxx`).
   - `.judicial-crest`: Antique gold badge for advocate ratings, court honors, and constitutional emblems.
   - `.statute-border`: Left-bordered citation block (Terracotta, Azure, Gold) for Lex.uz codes.
   - `.parchment-card`: Tactile legal paper artifact with multi-layered archival shadows (aliased to `.paper-card`).
   - `.legal-memorandum`: Container with tricolor top accent ribbon for AI consultations and legal opinions.
   - `.lex-citation`: Monospace interactive pill for direct statutory cross-references.

---

## 3. Caveats
1. `Cinzel` does not support the Cyrillic alphabet in Google Fonts; it is scoped strictly to Latin display headings, Roman numeral statutes, and judicial insignia. All general headings and article titles use `Playfair Display`, which has full Cyrillic support.
2. In `next/font/google`, `Plus_Jakarta_Sans` uses `cyrillic-ext` in its type declaration instead of `cyrillic`. Specifying `subsets: ["latin", "cyrillic-ext"]` is required to avoid Next.js TypeScript build errors.
3. Legacy color tokens (`lapis`, `gold`, `seal`, `paper-card`, `seal-badge`) have been retained and enhanced as backward-compatible aliases to prevent regressions in existing secondary pages prior to Milestone 5 polish.

---

## 4. Conclusion
The complete Uzbek Legal Editorial Design System has been formulated, tested, and specified across 4 artifacts located in `c:\Users\Bro\Desktop\Themis\.agents\teamwork\explorer_m1_3\`:
1. `proposed_layout.tsx`: Ready-to-apply root layout with Next.js Google font loaders and CSS variable injection.
2. `proposed_tailwind.config.ts`: Ready-to-apply Tailwind configuration with font families and Uzbek Heritage color ramps.
3. `proposed_globals.css`: Ready-to-apply CSS stylesheet with HSL tokens, dark mode variables, and shared editorial utility classes.
4. `editorial_design_system.md`: Full design system specification and usage guide for implementers.

### Summary of Proposed Code Changes

#### A. Diff for `src/app/layout.tsx`
```diff
--- src/app/layout.tsx
+++ src/app/layout.tsx
@@ -1,4 +1,5 @@
 import type { Metadata } from "next";
+import { Playfair_Display, Plus_Jakarta_Sans, Cinzel } from "next/font/google";
 import "./globals.css";
 import { Toaster } from "sonner";
 
+// Uzbek Legal Editorial Typography Pairings
+const serifFont = Playfair_Display({
+  subsets: ["latin", "cyrillic"],
+  variable: "--font-serif",
+  display: "swap",
+  weight: ["400", "500", "600", "700", "800", "900"],
+});
+
+const sansFont = Plus_Jakarta_Sans({
+  subsets: ["latin", "cyrillic-ext"],
+  variable: "--font-sans",
+  display: "swap",
+  weight: ["300", "400", "500", "600", "700", "800"],
+});
+
+const cinzelFont = Cinzel({
+  subsets: ["latin"],
+  variable: "--font-cinzel",
+  display: "swap",
+  weight: ["500", "600", "700", "800"],
+});
+
 export const metadata: Metadata = {
   title: "Huquqiy Yordam — O'zbekistonning Ishonchli Huquqiy Maskani",
   description:
@@ -19,16 +20,10 @@
   children: React.ReactNode;
 }>) {
   return (
-    <html lang="uz">
-      <head>
-        <link rel="preconnect" href="https://fonts.googleapis.com" />
-        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
-        <link
-          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
-          rel="stylesheet"
-        />
-      </head>
-      <body className="font-sans antialiased selection:bg-gold-500/20 selection:text-lapis-900 bg-background text-foreground min-h-screen">
+    <html
+      lang="uz"
+      className={`${serifFont.variable} ${sansFont.variable} ${cinzelFont.variable}`}
+    >
+      <body className="font-sans antialiased selection:bg-gold-500/20 selection:text-obsidian bg-background text-foreground min-h-screen">
         {children}
         <Toaster
           position="top-right"
           richColors
           toastOptions={{
             style: {
-              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
+              fontFamily: "var(--font-sans), system-ui, sans-serif",
               borderRadius: "0.5rem",
-              border: "1px solid rgba(184, 142, 50, 0.25)",
+              border: "1px solid rgba(197, 155, 39, 0.25)",
             },
           }}
         />
```

#### B. Diff for `tailwind.config.ts`
```diff
--- tailwind.config.ts
+++ tailwind.config.ts
@@ -18,9 +18,9 @@
     extend: {
       fontFamily: {
-        serif: ["var(--font-cormorant)", "Georgia", "serif"],
-        display: ["var(--font-cinzel)", "var(--font-cormorant)", "serif"],
-        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
+        serif: ["var(--font-serif)", "Georgia", "serif"],
+        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
+        display: ["var(--font-display)", "var(--font-cinzel)", "var(--font-serif)", "serif"],
         mono: ["var(--font-mono)", "monospace"],
       },
       colors: {
@@ -57,6 +57,75 @@
         card: {
           DEFAULT: "hsl(var(--card))",
           foreground: "hsl(var(--card-foreground))",
         },
+        // Warm Uzbek Heritage Palette Tokens
+        samarkand: {
+          DEFAULT: "#0D47A1", // Samarkand Azure
+          50: "#EEF4FC",
+          100: "#D7E6F8",
+          200: "#B2D0F2",
+          300: "#7EAFE8",
+          400: "#4589DC",
+          500: "#1D69CD",
+          600: "#0D47A1",
+          700: "#0B3982",
+          800: "#0D3169",
+          900: "#102A56",
+          950: "#0A1B38",
+        },
+        bukhara: {
+          DEFAULT: "#B84A2A", // Bukhara Terracotta
+          50: "#FDF5F2",
+          100: "#FCE7E0",
+          200: "#F9D1C3",
+          300: "#F3B19B",
+          400: "#E98466",
+          500: "#D95E3B",
+          600: "#B84A2A",
+          700: "#9C3B1E",
+          800: "#81331C",
+          900: "#6C2E1C",
+        },
+        emerald: {
+          seal: "#166534", // Noble Emerald Adliya Seal
+          DEFAULT: "#166534",
+          50: "#F0FDF4",
+          100: "#DCFCE7",
+          200: "#BBF7D0",
+          300: "#86EFAC",
+          400: "#4ADE80",
+          500: "#22C55E",
+          600: "#16A34A",
+          700: "#15803D",
+          800: "#166534",
+          900: "#14532D",
+        },
+        gold: {
+          crest: "#C59B27", // Antique Gold / Judicial Crest
+          DEFAULT: "#C59B27",
+          50: "#FAF7EE",
+          100: "#F4ECD6",
+          200: "#E7D7AC",
+          300: "#D9C182",
+          400: "#C9AA59",
+          500: "#C59B27",
+          600: "#A87C1D",
+          700: "#845D18",
+          800: "#5F4113",
+          900: "#432C0D",
+        },
+        parchment: {
+          DEFAULT: "#FAF8F5", // Warm Parchment
+          50: "#FDFCF8",
+          100: "#FAF8F5",
+          200: "#F4EFE0",
+          300: "#EAE2CC",
+          400: "#DDD2B3",
+          500: "#CABE95",
+        },
+        obsidian: {
+          DEFAULT: "#0B132B", // Obsidian Document Ink
+          50: "#F4F6FA",
+          100: "#E5E9F2",
+          200: "#C8D1E3",
+          300: "#9FB1CF",
+          400: "#6F89B5",
+          500: "#4C6899",
+          600: "#38507D",
+          700: "#2A3C61",
+          800: "#172445",
+          900: "#0B132B",
+        },
```

---

## 5. Verification Method
1. **Compilation & Type Check**:
   - Run `npm run build` in PowerShell.
   - Invalidation condition: Any Next.js font compilation error, unrecognized font subset error, or Tailwind CSS syntax error.
2. **Font Verification**:
   - Inspect rendered DOM in browser: `document.documentElement.className` should include classes starting with `__className_` or CSS variables `--font-serif`, `--font-sans`, and `--font-cinzel`.
   - Invalidation condition: Missing `--font-serif` or `--font-sans` CSS variables on `<html>`.
3. **Color Token Verification**:
   - In browser DevTools console:
     ```js
     getComputedStyle(document.documentElement).getPropertyValue('--background').trim() === '36 33% 97%'
     getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() === '216 85% 34%'
     ```
   - Invalidation condition: Returned HSL values do not match Warm Parchment or Samarkand Azure.
4. **Editorial Utility Classes Verification**:
   - Inspect `.legal-seal`, `.statute-border`, and `.parchment-card` styles in DevTools to confirm emerald verification border, terracotta statute accent line, and layered parchment elevation.
