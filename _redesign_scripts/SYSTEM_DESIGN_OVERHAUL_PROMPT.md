# PROGREX — COMPLETE SYSTEM DESIGN OVERHAUL PROMPT
## Theme: Deep Space · Constellation · Futuristic Tech · Dark Universe

---

> **CRITICAL RULE — READ FIRST:**
> **DO NOT change any content, text, data, or logic whatsoever.**
> All existing `mockData.ts` entries, all headings, all descriptions, all labels, all navigation links, all page routes — keep everything exactly as-is.
> This is a **VISUAL REDESIGN ONLY**. You are only touching: colors, backgrounds, typography styling, component visuals, animations, spacing, layouts, images, effects, and decorative elements.
> The tech stack remains: Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion.

---

## 0. DESIGN PHILOSOPHY

This is not a template. This is not AI-generated boilerplate. This should feel like it was designed by a rebellious senior product designer at a NASA-funded startup — someone who obsesses over pixel precision, negative space, and the feeling of floating through the cosmos at 3AM. Every pixel has purpose. Every animation has weight and timing that feels physical and real. Every section must feel like a different region of deep space.

The goal: A visitor lands on this site and immediately stops scrolling Twitter. Their jaw drops. They feel like they're looking at mission control software from 2145. They think: *"These people are elite."*

**What it must NEVER feel like:**
- AI-generated purple gradient soup
- Boring glassmorphism card grid with glow borders slapped everywhere
- Cookie-cutter SaaS landing page
- Anything that could be a Framer template

**What it MUST feel like:**
- Hand-crafted by a design team that studied astronomy and worked at SpaceX
- Intentional, editorial, with strong typographic hierarchy
- A living, breathing universe — not a static pretty page
- Technical depth: clean code-like precision meets cosmic scale

---

## 1. COLOR SYSTEM — "DEEP SPACE PALETTE"

Completely replace the current purple-only palette. Introduce a full cosmic color system with multiple accent families.

### Base / Void Colors (Backgrounds)
```
--void-black:    #00000A   ← deepest space, used sparingly
--space-950:     #03030F   ← primary page background
--space-900:     #060614   ← section backgrounds
--space-800:     #0A0A1E   ← card backgrounds
--space-700:     #0F0F2A   ← elevated surfaces
--space-600:     #141435   ← borders, dividers upper range
```

### Nebula Accent — Cyan/Teal (PRIMARY ACCENT — replaces the flat purple dominance)
```
--nebula-400:    #67E8F9   ← brightest — glows, highlights
--nebula-500:    #22D3EE   ← primary interactive, CTAs
--nebula-600:    #0EA5E9   ← hover states
--nebula-700:    #0284C7   ← deep accents
```

### Aurora Accent — Electric Indigo/Violet (SECONDARY)
```
--aurora-300:    #C4B5FD   ← text highlights, gradients
--aurora-400:    #A78BFA   ← prominent text accents
--aurora-500:    #8B5CF6   ← interactive secondary
--aurora-600:    #7C3AED   ← deeper secondary
--aurora-700:    #6D28D9   ← border glow secondary
--aurora-900:    #2E1065   ← very deep background tints
```

### Starlight — White/Silver (TEXT & HIGHLIGHTS)
```
--star-100:      #F0F4FF   ← primary headings
--star-200:      #E2E8F7   ← body text (main readable)
--star-300:      #C8D3E8   ← secondary text
--star-400:      #94A3B8   ← muted / metadata text
--star-500:      #64748B   ← disabled / placeholder
```

### Pulsar — Amber/Gold (RARE ACCENT — use extremely sparingly, for premium moments)
```
--pulsar-400:    #FBBF24   ← star ratings, badge "premium"
--pulsar-500:    #F59E0B   ← ultra-rare highlight
```

### Gradient Recipes
```
/* Hero title gradient */
background: linear-gradient(135deg, #F0F4FF 0%, #67E8F9 40%, #A78BFA 100%);

/* Primary CTA button */
background: linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%);

/* Card border gradient (top edge only) */
background: linear-gradient(90deg, transparent, #22D3EE, transparent);

/* Section nebula wash */
background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,211,238,0.06) 0%, transparent 70%);

/* Deep constellation section */
background: radial-gradient(ellipse 60% 80% at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 30%, rgba(14,165,233,0.06) 0%, transparent 60%),
            #060614;

/* Footer nebula */
background: radial-gradient(ellipse 100% 50% at 50% 100%, rgba(109,40,217,0.12) 0%, transparent 70%), #03030F;

/* Shooting star tail */
background: linear-gradient(90deg, rgba(103,232,249,0) 0%, #67E8F9 50%, rgba(167,139,250,0.6) 100%);
```

---

## 2. TYPOGRAPHY SYSTEM — "CELESTIAL TYPE"

### Font Stack
- **Display / Hero Headlines:** `Space Grotesk` (Google Fonts) — weight 700/800. This font has a techy, geometric character without being over-designed.
- **UI / Body / Navigation:** `Inter` — weight 400/500/600. The gold standard for legible dark UIs.
- **Monospace / Code / Data / Labels:** `JetBrains Mono` — weight 400/500. Used for stat numbers, tech tags, terminal-esque decorative text, coordinate labels.

Import in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
```

### Scale & Usage
| Role | Font | Size | Weight | Color |
|------|------|------|--------|-------|
| Hero H1 | Space Grotesk | clamp(3rem, 8vw, 7rem) | 800 | Gradient (star→nebula→aurora) |
| Page H1 | Space Grotesk | clamp(2.5rem, 5vw, 4rem) | 700 | `--star-100` |
| Section H2 | Space Grotesk | clamp(1.8rem, 3vw, 2.75rem) | 700 | `--star-100` |
| Card Title | Space Grotesk | 1.1–1.3rem | 600 | `--star-200` |
| Body | Inter | 1rem | 400 | `--star-300` |
| Metadata / Tags | JetBrains Mono | 0.7–0.8rem | 500 | `--nebula-400` or `--aurora-300` |
| Stat Numbers | JetBrains Mono | clamp(2rem, 4vw, 3.5rem) | 700 | `--nebula-400` |
| Navigation | Inter | 0.875rem | 500 | `--star-300` |
| Badge Labels | JetBrains Mono | 0.65rem | 600 | `--nebula-400` |

### Typographic Rules
- **Section labels / eyebrows** (the small badge above section titles): Always in JetBrains Mono, uppercase, letter-spacing 0.2em, color `--nebula-500`, preceded by a `▸` or `//` prefix character.
- **Highlighted gradient words** in headings: Apply a cyan-to-violet gradient clip. Never apply gradient to more than 1-2 words per heading.
- **No italic text** anywhere in the UI. This is a precision technical environment.
- **Line height on hero**: 1.05–1.10 (tight, editorial). Body: 1.65–1.75 (airy, readable).

---

## 3. GLOBAL BACKGROUND SYSTEM — "THE UNIVERSE LAYER"

This is the most important section. The background is not just colors — it's an active, living environment. The starfield must be rendered efficiently and look authentic.

### `StarfieldCanvas` Component (New — create `components/StarfieldCanvas.tsx`)
- Use HTML5 Canvas (or a `<canvas>` element driven by a `useEffect` + `requestAnimationFrame` loop).
- Render **~350 stars** of varying sizes (0.5px–2.5px), opacity (0.2–1.0), and color (80% white, 12% `#67E8F9` tinted, 8% `#A78BFA` tinted).
- Stars must **twinkle** — their opacity oscillates on separate random timers (not all in sync).
- **Parallax:** On `mousemove`, the canvas shifts at 0.02× cursor offset ratio — subtle depth effect.
- **Shooting stars:** Every 6–12 seconds, a thin bright streak (JetBrains Mono character streak aesthetic — a line from upper-right moving to lower-left), fades in and out over 1.2s. Use canvas lineTo with gradient stroke. Maximum 1 at a time.
- This canvas is fixed, full-viewport, z-index 0, `pointer-events: none`. It sits behind all content.
- On mobile: reduce to 150 stars, disable parallax, reduce shooting star frequency.

### `ConstellationOverlay` Component (New — create `components/ConstellationOverlay.tsx`)
- Separate SVG layer, also fixed and pointer-events none, z-index 1.
- Draw **3–4 subtle constellation patterns** (custom geometric ones, NOT real zodiac constellations — make up techy ones: a network topology pattern, a circuit-board-like pattern, a satellite dish pattern, a server rack diamond pattern).
- Nodes are small circles (r=2px, fill `rgba(103,232,249,0.6)` with a `drop-shadow(0 0 4px #67E8F9)`).
- Edges are `stroke: rgba(103,232,249,0.12)` lines — barely visible, just texture.
- **Animate:** Lines "draw in" with SVG stroke-dashoffset animation on initial load over 3 seconds (staggered).
- After draw-in, nodes pulse gently (scale 1 → 1.4 → 1, opacity flicker, random per-node timing).
- The constellations are spread to different screen quadrants, not clustered.
- No text labels on the constellations.

### Nebula Blobs (CSS-based, per section)
Each page section gets its own nebula positioning. Never use the same arrangement twice in the same page. Rules:
- Max 2 blobs per section.
- Colors: alternate between `rgba(14,165,233,0.06)` (cyan) and `rgba(109,40,217,0.08)` (violet). Never both the same hue in the same section.
- Sizes: 400px–800px diameter, `border-radius: 50%`, `filter: blur(80px–140px)`.
- `pointer-events: none`, `user-select: none`, `position: absolute`.
- Animate with `animation: nebulaFloat 20s ease-in-out infinite alternate` — drift 30px in X and 20px in Y, very slow.
- Use CSS `@keyframes`, not Framer Motion, to keep these cheap on GPU.

### Background Grid / Scanline Texture
Two overlapping textures (CSS only, no images needed):
1. **Dot grid**: `background-image: radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)` with `background-size: 40px 40px`.
2. **Horizontal scanlines**: `background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.015) 2px, rgba(14,165,233,0.015) 4px)`.
Both are on a `::before` pseudo-element of each section, opacity 1, blending with `mix-blend-mode: screen`.

---

## 4. GLOBAL COMPONENT REDESIGNS

### 4.1 NAVBAR — "Mission Control"

**Concept:** Think of a spacecraft HUD navigation bar. Not just a nav — a control panel.

**Visual spec:**
- Background (on scroll): `rgba(3,3,15,0.85)` with `backdrop-filter: blur(24px) saturate(1.8)`. A single `1px` bottom border using: `border-image: linear-gradient(90deg, transparent 5%, rgba(34,211,238,0.4) 40%, rgba(139,92,246,0.4) 60%, transparent 95%) 1`.
- Before scroll: fully transparent.
- **PROGREX Logo:**
  - Drop the Zap/lightning icon. Replace with a custom SVG: a small constellation-node cluster (3 nodes connected by 2 lines, forming a triangle). The nodes are `#22D3EE` circles, lines are thinner `#22D3EE`. One node should have an animated pulse ring.
  - The word "PROGREX" in Space Grotesk 800 weight, with a gradient: `#F0F4FF` → `#67E8F9`. No gradient on the icon.
  - On hover: the constellation nodes brighten + the word gets a very faint cyan text-shadow.
- **Nav Links:** Inter 500, `--star-400` default. Hover: color morphs to `--star-100`. No underline. Instead: on hover, a small `·` dot appears below the link (scale-in animation). Active link: `--nebula-400` color, small `·` dot persistent.
- **Coordinate display (Desktop only):** Between the nav links and the CTA button, add a decorative element in JetBrains Mono `0.65rem` `--star-500`: something like `// SYS-ONLINE · 00°N 00°E` that animates its "coordinates" slowly. Pure decoration, no function.
- **CTA Button "Get a Quote":** See button spec in §4.5.
- **Mobile menu:** When open, the menu slides down as a full-width panel. Background: `rgba(6,6,20,0.98)` blur. Links appear one by one with a staggered fade-up (15ms each). At the bottom of mobile menu: a thin horizontal line with a `> PROGREX SYSTEMS ONLINE_` blinking cursor — pure decoration.

### 4.2 HERO — "Launch Sequence"

The hero is the most important component. It must be absolutely stunning.

**Layout (Desktop):** Two-column asymmetric. Left column (60%): text content. Right column (40%): the decorative visual element.

**Left Column:**
- **Badge:** `// NEXT-GEN TECHNOLOGY SOLUTIONS` in JetBrains Mono, `--nebula-400`, with a tiny animated `< >` bracket pair flanking it that slowly shifts apart and back together.
- **Headline `TECHNOLOGY SOLUTIONS THAT`:** Space Grotesk 800, `clamp(3.5rem, 7vw, 6.5rem)`, `--star-100`. All caps, very tight line-height (1.0).
- **`DRIVES SUCCESS.`:** Same size, but this line uses a full gradient clip: `linear-gradient(135deg, #67E8F9 0%, #22D3EE 30%, #8B5CF6 70%, #A78BFA 100%)`. It should appear to glow faintly behind the text (matching color text-shadow at 0 0 40px).
- **Subtitle `BUILD FASTER. SCALE SMARTER. WIN WITH PROGREX.`**: Rendered as three separate spans, each one in JetBrains Mono, `--star-400`, with a `·` separator between them. Below this: the body description in Inter.
- **CTA Buttons:** `Get a Quote` (primary) + `View Projects` (ghost/outline). See §4.5.
- **Stats row (if `showStats`):** 4 stats in a horizontal row. Stat value in JetBrains Mono 700 `--nebula-400`. Stat label in Inter 400 `--star-500`. Each stat separated by a `|` divider. Values should count up from 0 on mount (use framer motion `useMotionValue` + `useTransform` or a simple `useState` interval — smooth easing, 1.5s duration).

**Right Column — "The Orb" (Decorative Visual):**
- A large (480px×480px desktop, scales down) circular decorative element.
- **Center:** A semi-transparent sphere effect: CSS `background: radial-gradient(circle at 35% 35%, rgba(103,232,249,0.15) 0%, rgba(34,211,238,0.08) 30%, rgba(109,40,217,0.05) 70%, transparent 100%)` with a `border: 1px solid rgba(103,232,249,0.12)` and `border-radius: 50%`. Add a very subtle inset box-shadow.
- **Orbit rings:** 3 ellipses orbiting around the sphere, rendered as SVG `<ellipse>` elements. Each ring is a dashed stroke (`stroke-dasharray: 5 10`) in different orientations (one horizontal, one 45°, one vertical, creating a 3D globe illusion). Colors: `rgba(34,211,238,0.25)`, `rgba(139,92,246,0.2)`, `rgba(103,232,249,0.15)`. Each ring rotates infinitely at different speeds (18s, 26s, 34s). Rings are `pointer-events: none`.
- **Nodes on orbits:** Each ring has 1–2 small glowing dots (4px circles) that move along the ring path. Use CSS `animation: orbit Xs linear infinite`. The dots are `#22D3EE` with a `box-shadow: 0 0 8px #22D3EE, 0 0 16px rgba(34,211,238,0.4)`.
- **Constellation inside the sphere:** A small constellation pattern (4–5 nodes, 4 edges) centered within the sphere. Nodes pulse. Edges are faint.
- **Floating data fragments:** Small text snippets in JetBrains Mono `0.6rem` drifting around the orb: things like `01101001`, `>_ exec`, `sys::online`, `λ()`, `0xFF3A`. They drift upward and fade out on repeat. Purely decorative.
- The whole orb floats up and down: `animation: floatOrb 8s ease-in-out infinite alternate` (±15px Y).
- On mobile: hide the orb, make the hero single-column.

**Background overlays (hero-specific on top of the global starfield):**
- A large centered radial glow: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(14,165,233,0.1) 0%, transparent 65%)`.
- A horizon line at bottom of hero: a thin `1px` rule with a gradient `transparent → rgba(34,211,238,0.2) → transparent` centered.

**Scroll indicator:** At the very bottom center of the hero, a small animated down-arrow indicator. Style it as two stacked `›` characters rotated 90°, in JetBrains Mono, `--star-500`, bouncing slightly. Label it `SCROLL` in tiny uppercase mono below.

### 4.3 SECTION WRAPPER — "Sector Dividers"

Every `SectionWrapper`:
- The corresponding section background alternates between `--space-950` and `--space-900`.
- **Section header eyebrow badge:** Replace the current pill badge. New style: a line of text in JetBrains Mono that reads `▸ WHAT WE BUILD` (or whatever the badge text is). No background pill — just the text with `--nebula-500` color and a very subtle `text-shadow: 0 0 12px rgba(34,211,238,0.4)`. Preceded by a 40px wide `rgba(34,211,238,0.4)` horizontal hairline.
- **Section H2:** Space Grotesk 700. The key word (the `highlight`) gets the gradient clip treatment.
- **Section subtitle:** Inter 400, `--star-400`, max-width 560px, centered.
- Between major page sections, add an invisible (visual separator only) full-width 1px line: `background: linear-gradient(90deg, transparent, rgba(34,211,238,0.15) 30%, rgba(139,92,246,0.15) 70%, transparent)`.

### 4.4 SERVICE CARDS — "System Modules"

**Current feel:** Generic glass card with colored gradient top border.  
**New feel:** A tech panel / module card — like something from a spacecraft systems dashboard.

**Visual spec:**
- Background: `--space-800` (`#0A0A1E`).
- Border: `1px solid rgba(34,211,238,0.08)` default. On hover: `1px solid rgba(34,211,238,0.3)`.
- Top edge accent: A `2px` line at the very top. Gradient: `linear-gradient(90deg, transparent, --nebula-500, transparent)`. This replaces the left-border colored strip.
- **Top-left corner decoration:** A small corner bracket in `rgba(34,211,238,0.3)`:
  ```
  ┌─
  │
  ```
  Rendered as absolutely positioned pseudo-element or SVG. 4px wide, 4px tall, `stroke: rgba(34,211,238,0.4)`, no fill. This gives a "panel" feel.
- **Icon:** Remove emoji icons. Replace with a single **Lucide icon** (or React-Icons) matching the service. Use a proper tech icon — do NOT use 3D icons. Style: `size={28}`, `stroke-width={1.2}`, color `--nebula-500`. Place it inside a `48×48` square with `background: rgba(34,211,238,0.05)`, `border: 1px solid rgba(34,211,238,0.12)`, `border-radius: 8px`.
  - Custom Software Dev → `<Code2>`
  - Web Development → `<Globe>`
  - Mobile App → `<Smartphone>`
  - System Integration → `<GitMerge>`
  - Academic/Capstone → `<BookOpen>`
  - IT Consulting → `<Server>`
- **Service number:** Top-right corner, in JetBrains Mono `0.65rem` `--star-500`: `01`, `02`, `03`… like a module index.
- **Title:** Space Grotesk 600, `--star-100`, 1.1rem.
- **Short desc:** Inter 400, `--star-400`, 0.875rem.
- **Bottom row:** Left: a `→ Explore` link in `--nebula-400` Inter 500. Right: a small tag-like chip in JetBrains Mono `0.65rem` reading something like `MODULE::ACTIVE`.
- **Hover state:** Card lifts (`translateY(-4px)`), border brightens, top-edge accent widens slightly, the icon's container glows (`box-shadow: 0 0 16px rgba(34,211,238,0.2)`), and the corner bracket fully brightens. Transition: 200ms ease.
- **On scroll entrance:** Staggered fade-up with a 40ms delay between cards. Use Framer Motion `initial={{ opacity: 0, y: 24 }}` → `whileInView={{ opacity: 1, y: 0 }}`.

### 4.5 BUTTONS — "Interface Controls"

**Primary Button `btn-primary` (Get a Quote):**
- Background: `linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)`
- No border on normal state.
- ON HOVER: Background remains, but a 1px border appears with matching gradient. Box-shadow: `0 0 24px rgba(14,165,233,0.35), 0 0 48px rgba(124,58,237,0.2)`. Scale: 1.02. Transition: 150ms ease.
- Inner text: Inter 600, white, 0.875rem. Slight letter-spacing: 0.04em.
- Padding: `12px 24px`.
- Border-radius: `6px` (not too rounded — this is a techy UI, not bubbly).
- Add a subtle inner `::before` scanline texture at 4% opacity.
- On click: Brief `scale(0.97)` squish effect (Framer `whileTap`).

**Outline/Ghost Button `btn-outline` (View Projects, Explore All):**
- Background: transparent.
- Border: `1px solid rgba(34,211,238,0.35)`.
- Text: `--nebula-400`, Inter 500.
- ON HOVER: Background: `rgba(34,211,238,0.06)`. Border: `rgba(34,211,238,0.7)`. Text: `--nebula-300`. Box-shadow: `0 0 16px rgba(34,211,238,0.15)`.
- Same padding and border-radius as primary.

**Danger / No CTA (never use):** No red on this site — it clashes with the space palette. There is no danger state in the design system.

### 4.6 PROJECT CARDS — "Mission Files"

**Concept:** Each project is like a classified mission dossier.

- Background: `--space-800`.
- NO image thumbnail (the current mockData images are placeholders that don't exist, so remove the broken image). Instead: A generated visual — a CSS art abstract scene specific to each project. Create a `ProjectCardVisual` component that renders different abstract geometric patterns for each `category`:
  - Enterprise: Grid of intersecting lines + a central hexagon node cluster.
  - Web: Flowing curved lines (SVG paths) like a web topology.
  - Academic: Angular geometric shapes, circuit-board trace style.
  - SaaS: Concentric circle halftone pattern.
  - E-commerce: Grid of small rectangles at varying opacities.
  - Mobile: Vertical bars like a signal strength display.
  All in the `--nebula` / `--aurora` palette, very subtle and abstract. No text inside visuals.
  The visual area is `240px` tall on desktop.
- **Corner tags:** Top-left: Industry chip in JetBrains Mono. Top-right: Category chip.
- **Title + desc:** Space Grotesk 600 + Inter 400 as before.
- **Tags row:** Use `[]` bracket style tags: `[React]` `[Node.js]` in JetBrains Mono `0.65rem` `--aurora-300` with `background: rgba(167,139,250,0.08)` and `border: 1px solid rgba(167,139,250,0.2)`.
- **CTA:** "View Case Study →" in `--nebula-400`.
- **Hover:** The visual area gets a light scanline sweep animation (a bright horizontal line traverses from top to bottom over 0.8s on hover, then stops). Card lifts.

### 4.7 BLOG CARDS

- No hero image (same placeholder issue). Replace with a generated visual: a blurred radial gradient blob unique per post, using the blog category to determine color (Tech=cyan, Business=violet, Academic=amber tint).
- Category badge: JetBrains Mono bracket style.
- Title: Space Grotesk 600.
- Excerpt: Inter 400 `--star-400`.
- Meta row: Author · Date in JetBrains Mono `0.7rem` `--star-500`. Separated by ` · `.
- Reading time estimate chip: `// ~X MIN READ` styling.

### 4.8 SYSTEM/PRODUCT CARDS (Ready-Made Systems)

- These should feel premium — like SaaS product cards.
- A colored "status bar" at top (not gradient, but a solid 3px line in `--nebula-500` or `--aurora-400` depending on index, full width).
- `SYSTEM AVAILABLE` label in top-right, JetBrains Mono, green-ish: `rgba(34,211,238,0.8)`, animated blinking dot beside it.
- Pricing displayed prominently in JetBrains Mono 700.
- Feature list: Each item preceded by a `✓` in `--nebula-400`. Inter 400 `--star-300`.

### 4.9 FOOTER — "Deep Space Navigation"

- Background: The nebula footer gradient (see §1).
- Top decoration: A full-width SVG illustration of a simple constellation cluster — about 40px tall, centered. White stars connected by faint lines.
- **Brand section:** Keep content, re-style. Logo same as navbar. Description in Inter 400 `--star-400`. Contact info: each item has a small `[→]` prefix in JetBrains Mono `--nebula-500`.
- **Footer nav columns:** Column headers in JetBrains Mono 600 uppercase, `--star-500`, with `// ` prefix. Links in Inter 400 `--star-400` → hover `--nebula-400`.
- **Bottom bar:** Copyright in JetBrains Mono `0.7rem` `--star-500`. Right side: a small line `SYS::BUILD_2025 · PROGREX_CORP`. The separators use `·` not `|`.
- No social media icon buttons (icon-only buttons look cheap). Replace with text links: `GitHub`, `LinkedIn`, `Twitter` in JetBrains Mono `--star-400`.

### 4.10 CUSTOM CURSOR — "Targeting Reticle"

Replace the current `CustomCursor.tsx` with a proper space-targeting cursor:

- **Default cursor:** A thin crosshair: two lines (16px × 16px) crossing at center. The lines are `rgba(34,211,238,0.7)`. No filled dot. Has a very subtle rotating outer ring (24px diameter, 1px stroke, `rgba(34,211,238,0.3)`, spin at 12s).
- **Hover state (on interactive elements):** The crosshair lines retract (scale 0.5x), the outer ring expands to 32px and brightens. Add 4 small tick marks at the cardinal points of the ring (like a targeting HUD).
- **Click state:** Quick flash — the ring pulses outward and fades.
- **Trail:** Do NOT add a trailing particle trail (it's overdone and slow). Just the cursor itself.
- Hide default cursor (`cursor: none`) on desktop only. On mobile/touch: restore default.

### 4.11 CHATBOT — "AI COPILOT"

- Trigger button (floating): Replace the current button with a small floating panel bottom-right. Style: `56×56px`, background `--space-700`, border `1px solid rgba(34,211,238,0.2)`, border-radius `12px`. Icon: `<MessageSquare>` Lucide, `--nebula-400`. On hover: border brightens, subtle glow. A small `ONLINE` indicator dot (green-ish, animated pulse) in the top-right corner of the button.
- Chat window: `--space-800` background with a dot-grid texture. Header with `// AI COPILOT` in JetBrains Mono. Message bubbles: user messages right-aligned `rgba(14,165,233,0.15)` background + `rgba(14,165,233,0.3)` border. AI responses left-aligned `--space-700` background.

---

## 5. PAGE-BY-PAGE VISUAL SPECIFICATIONS

### 5.1 HOME PAGE

**Hero:** Full spec in §4.2. The hero's right column orb should be partially visible, with part of it extending off-screen to the right (cropped), creating visual depth.

**Services Section:**
- Background: `--space-950` + dot-grid texture.
- Nebula blob: top-right, cyan.
- 6 cards in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout.
- A decorative element above the grid: a thin horizontal line with three evenly-spaced tick marks and a `MODULES :: 06 ACTIVE` label in JetBrains Mono `--star-500` `0.65rem`.

**Featured Projects Section:**
- Background: `--space-900` + scanline texture.
- Nebula blob: bottom-left, violet.
- Title treatment: "Featured **Projects**" — "Featured" in `--star-100`, "Projects" gradient.

**Ready-Made Systems Section:**
- Background: `--space-950`.
- Add a distinctive visual separator at the top of this section: a row of small animated dots (5 dots, like a loading state, in `--nebula-400`) fading in and out in sequence — purely decorative, like a system is processing.

**Tech Stack Section:**
- Background: `--space-900`.
- Completely redesign. Instead of logo boxes, create a **"tech constellation"**: Place the tech names (React, Node.js, AWS, Docker, etc.) as text nodes positioned across the section area. Connect related technologies with thin `rgba(34,211,238,0.1)` SVG lines (like a dependency graph). On hover of each node: the node highlights (`--nebula-400`) and its connection lines brighten. All tech names in JetBrains Mono, `--star-500` default, `--nebula-400` hover.

**Testimonials Section:**
- Background: `--space-950`.
- The testimonial card should be large (max-width 700px, centered). Background: `--space-700` with a subtle quote-mark watermark behind the text (`"` character, size 200px, `--aurora-900` color, positioned top-left of the card).
- Author avatar: Instead of a blank placeholder image, generate a circle with initials in JetBrains Mono on a gradient background (`--aurora-600` to `--nebula-700`).
- Star rating: 5 stars in `--pulsar-400` (the rare amber accent — used here intentionally for stars).
- Navigation arrows: Small `←` `→` in `--star-400`, not big icons — subtle and precise.

**Final CTA Section:**
- Full bleed background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(14,165,233,0.12) 0%, rgba(109,40,217,0.08) 40%, transparent 70%), --space-950`.
- The heading should be the largest text on the page aside from hero — `clamp(2.2rem, 4.5vw, 3.5rem)` Space Grotesk, gradient.
- Add a decorative element: a set of three concentric dashed circles (SVG) centered behind the CTA text, rotating at different rates (very slow, 60s/80s/100s). Radius 100px/180px/260px. Stroke `rgba(34,211,238,0.06)`.

### 5.2 ABOUT PAGE

**Hero (reused Hero component):**
- Badge: `▸ ABOUT US`
- No orb in the right column on inner pages. Use a full-width, centered single-column hero.
- Add a mission-statement-style secondary line below the title in a larger Inter weight.

**Company Story section:**
- Two-column layout (desktop): text left, decorative visual right.
- Right column visual: A "timeline node" visualization — vertical line with 4–5 nodes and year labels in JetBrains Mono. The nodes are filled circles `--nebula-500`. Lines are `rgba(34,211,238,0.2)`. Year labels like `2019 ·`, `2021 ·`, `2024 ·`. This is decorative but contextually appropriate.

**Stats counters:** Already handled by the Hero stats row. If there's a separate stats section on About: render them in a 4-column horizontal layout with JetBrains Mono values in `--nebula-400`, big (3rem+), and a thin `1px` top separator above each stat.

**Core Values cards:**
- Use the same card shell as Service Cards (see §4.4) but without the numbered index.
- Icon: Lucide icon, same technique.

**Team Member cards:**
- No profile photos (avoid broken placeholder images).
- Each team card: background `--space-800`, a gradient avatar circle (initials, see Testimonials above), Name in Space Grotesk 600, Role in JetBrains Mono `--nebula-400`, a short bio in Inter 400 `--star-400`, and social icon links (LinkedIn etc.) as JetBrains Mono text links.

**Process Timeline:**
- Horizontal on desktop, vertical on mobile.
- Each step: number in JetBrains Mono 700 `--nebula-400` `2.5rem`, title in Space Grotesk 600, desc in Inter 400.
- Connecting elements: dashed lines between steps in `rgba(34,211,238,0.15)`.
- On scroll: steps animate in from opacity 0, with the connecting line "drawing" in using stroke-dashoffset.

### 5.3 SERVICES PAGE

- Grid of 6 service cards (same cards from Home) — but here also add filter pills at the top:
  `[All] [Software] [Web] [Mobile] [Integration] [Consulting]` — style these as JetBrains Mono toggle chips. Active state: `background: rgba(34,211,238,0.1)`, `border: 1px solid rgba(34,211,238,0.5)`, `color: --nebula-400`. Inactive: `--star-500`.
- Section header includes a description of PROGREX's overall service philosophy.

### 5.4 SERVICE DETAIL PAGE (`/services/[service]`)

**Hero banner:**
- Full-width. Background: a gradient specific to the service (use the existing `color` field from mockData, keep those gradient directions but re-interpret: `from-[#3A0CA3] to-[#4361EE]` stays as-is in gradient direction but apply at 30% opacity over `--space-950`).
- Title in Space Grotesk 800, big.
- Icon treatment: Use the Lucide icon (same mapping as §4.4), but at `size={64}`, stroke-width 1.0, inside a large (100×100px) frosted glass panel.
- Below title: the `shortDesc` in Inter 400, `--star-300`.

**Process Section:**
- 6 steps. Alternate layout: step numbers are large JetBrains Mono `--aurora-700` watermarks (6rem, behind the text). Card content lays over them.
- Use horizontal scrolling scrollbar on mobile for the steps.

**Technologies grid:**
- Display the tech names as a tag-cloud style arrangement in JetBrains Mono. Tags use the bracket `[tag]` style.
- On hover: tag glows. Otherwise: `--star-500` on `rgba(34,211,238,0.04)` background.

**FAQs:**
- Accordion style. Default closed. On click: expand with smooth height animation (Framer `AnimatePresence` + `initial={{ height: 0 }}`).
- The trigger row: has a `+` / `×` character in JetBrains Mono `--nebula-400` on the right.
- No decorative borders on FAQs — keep them minimal.

### 5.5 PROJECTS PAGE

**Filter tabs:** Same chip style as Services page. Categories: `[All] [Web] [Mobile] [Enterprise] [Academic] [SaaS] [E-commerce]`.

**Project grid:** 3 columns desktop → 2 tablet → 1 mobile. Cards per §4.6.

**Filter animation:** When switching categories, cards that don't match fade out and collapse (Framer `AnimatePresence` + `layout` prop). Remaining cards rearrange with spring physics.

### 5.6 CASE STUDY PAGE (`/projects/[slug]`)

This is a critical credibility page. Make it feel editorial — like an in-depth mission report.

**Layout:** Narrow (max-width 800px) editorial column — centered, NOT full-width grid. Like reading a detailed technical document.

**Hero:** The project title in very large Space Grotesk 800 (clamp 3rem–5rem). Industry + Client as metadata below in JetBrains Mono `--star-500`. A `STATUS: COMPLETED` badge in JetBrains Mono `--nebula-400` top-left.

**No screenshots carousel** (images don't exist). Replace with a large abstract visual: the `ProjectCardVisual` component at larger scale (full-width, 400px tall), generative and beautiful.

**Problem / Solution blocks:** Two-column. Each block has a top label (`THE PROBLEM`, `OUR SOLUTION`) in JetBrains Mono `0.7rem` `--star-500`, then the body text. Thin `1px` vertical divider between columns in the `rgba(34,211,238,0.1)` style.

**Results stats:** 4 stats in a `2×2` grid. Each: large JetBrains Mono number in `--nebula-400`, animated count-up on entrance. Label below in Inter 400.

**Testimonial:** Full-width card, `--space-700` background, large `"` watermark, full author credit.

**Technologies Used:** Tag cloud (see §5.4 tech grid style).

### 5.7 READY-MADE SYSTEMS PAGE

**Page concept:** This should feel like a product catalog / software store. Each system is a product listing.

**Hero:** "Battle-test-ready software systems. Deploy today." — editorial tone.

**System layout:** Each system is a large horizontal card (on desktop). Left: system name + feature list + pricing. Right: a generated UI preview mockup (described below).

**UI Preview mockup:** A 400×260px contained div with background `--space-900`, showing a simplified "wireframe" of what the system's dashboard might look like — built entirely with CSS/SVG:
  - A narrow sidebar (20% width) with 4–5 colored rectangle "nav items".
  - A top bar with 3 small "button rectangles".
  - A main area with grid lines suggesting a data table.
  - All in very low-opacity lines: `rgba(103,232,249,0.15)`.
  - A subtle "scanline" sweep animation plays on loop.
  This gives the feel of a software preview without needing actual screenshots.

**Pricing display:** Large, in JetBrains Mono. One-time or subscription clearly labeled with a small chip.

**Demo CTA:** "Request Live Demo →" as an outline button.

### 5.8 BLOGS PAGE

**Top filters:** Category chips — `[All] [Tech] [Business] [Academic] [Case Studies]` + a search input field styled like a terminal: `background: rgba(34,211,238,0.04)`, `border: 1px solid rgba(34,211,238,0.2)`, monospace font, placeholder `> Search articles...`, glow on focus.

**Featured post:** Full-width asymmetric card. Left: large generated visual (abstract gradient blob specific to category). Right: post title (large, Space Grotesk 700), excerpt, author row, CTA. No horizontal rule borders between sections — use space and contrast instead.

**Blog grid:** 3 columns desktop. Blog cards per §4.7.

### 5.9 BLOG POST PAGE (`/blogs/[slug]`)

**Layout:** Exactly like Case Study — narrow editorial column, max-width 720px, centered.

**Hero:** Post title in Space Grotesk 700, large. The generated colored abstract blob (category-specific) as a full-width visual above the article body.

**Article body typography:** This is where readability matters most.
  - Body: Inter 400, `--star-200` (brighter than normal), 1.1rem, line-height 1.8.
  - Headings inside article: Space Grotesk 600.
  - Code/technical snippets (inline): JetBrains Mono, `rgba(34,211,238,0.1)` background, `1px solid rgba(34,211,238,0.2)` border, `--nebula-300` text, `border-radius: 4px`, padding `1px 6px`.

**Meta bar:** `Author · Date · Category · // ~X MIN READ` in JetBrains Mono `0.75rem` `--star-500`, with a thin horizontal separator line below.

**Share buttons:** Just text links: `Share on Twitter · Share on LinkedIn` in JetBrains Mono `--star-400`.

**Related posts:** 3 blog mini-cards below the article, consistent with blog card style.

### 5.10 CONTACT PAGE

**Layout:** Two-column desktop. Left: form. Right: contact info + map.

**Form design:**
- Background: `--space-800`, `border: 1px solid rgba(34,211,238,0.08)`, `border-radius: 12px`, padding `40px`.
- Form labels: JetBrains Mono `0.75rem` uppercase `--star-500`, placed above (not floating).
- Inputs: `background: rgba(34,211,238,0.03)`, `border: 1px solid rgba(34,211,238,0.12)`, `border-radius: 6px`, text in Inter 400 `--star-200`, padding `12px 16px`.
- Focus: border becomes `rgba(34,211,238,0.5)`, `box-shadow: 0 0 16px rgba(34,211,238,0.12)`. Smooth transition.
- Textarea: same style, min-height `140px`.
- Submit button: primary button style (§4.5), full width inside the form.
- Success state: the form fades out and a success message fades in: `✓ TRANSMISSION SENT` in JetBrains Mono `--nebula-400`, centered, with a subtle scale-in animation.

**Right column:**
- Contact details in the same style as footer contact.
- Map embed: wrap the `<iframe>` with a `border: 1px solid rgba(34,211,238,0.12)` and apply a CSS `filter: invert(1) hue-rotate(180deg)` to give it a dark space-map aesthetic that matches the site. Then slightly adjust opacity to 0.85 to soften it.
- Social links: JetBrains Mono text links in `--star-400`.

---

## 6. IMAGES — REAL PHOTOS FROM UNSPLASH

All real images must be sourced from Unsplash (free use). Use `next/image` with proper `alt` tags and `priority` on above-fold images.

### Hero / Page Hero backgrounds (abstract tech/space photos):
Use as subtle background at low opacity (10–20%) layered under the CSS gradients:
```
// Abstract space / technology textures
https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80  // galaxy deep field
https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80  // space stars
https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80  // digital earth/globe
https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80  // circuit board closeup
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80  // tech abstract blue
https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1920&q=80  // galaxy purple nebula
```

**How to apply:** In the hero and certain hero-banner sections, import these as `next/image` with `fill`, `object-fit: cover`, and a CSS `opacity: 0.08–0.15`. Always layer the CSS gradient on top so the image is only a texture, not a distracting photo.

### About page — Company atmosphere photo:
```
// Server room / data center (professional tech space feel)
https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80  // server rack data center
https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80  // dark laptop code night
```
Use in the company story section's right column, with `border-radius: 12px`, `border: 1px solid rgba(34,211,238,0.12)`, and a slight `box-shadow: 0 0 40px rgba(14,165,233,0.08)`.

### Contact page — office/work from home atmosphere:
```
https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80  // modern office dark
```

### Ready-Made Systems Hero:
```
https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80  // dashboard/analytics dark
```

**IMPORTANT:** Never use images as decorative backgrounds at full opacity. They are always texture layers at opacity < 0.2. The CSS system carries the primary visual weight. Images are photographic texture, not focal elements.

---

## 7. ANIMATIONS — PRECISE SPECS

### Global page transitions
Wrap the main content in a Framer `<motion.main>` with:
```tsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
```
Use a custom cubic-bezier easing everywhere instead of the generic `'easeOut'`. The easing `[0.25, 0.46, 0.45, 0.94]` (Quart Out) feels snappy and professional.

### Scroll-triggered entrances
All section content: `initial={{ opacity: 0, y: 24 }}` → `whileInView={{ opacity: 1, y: 0 }}`. Viewport threshold: `{ once: true, amount: 0.15 }`. Duration: `0.5s`. Stagger on grids: `0.05s` between children (not `0.1s` — faster stagger feels less sluggish).

### Constellation draw-in (ConstellationOverlay, on mount)
SVG edges: `stroke-dasharray` = total path length. `stroke-dashoffset` animates from total length → 0 over 2.5s. Stagger each edge by 200ms. Use Framer `animate` with `transition={{ duration: 2.5, ease: 'easeInOut', delay: index * 0.2 }}`.

### Star twinkling (StarfieldCanvas)
In the canvas render loop: each star has its own `phase` (random 0–2π) and `speed` (random 0.3–0.8). Opacity per star: `Math.sin(time * speed + phase) * 0.4 + 0.6` clamped to 0–1. Result: stars naturally breathe independently.

### Shooting stars (StarfieldCanvas)
- Trigger: random timer, every 6–12s (use `setTimeout` with re-scheduling).
- Path: start from random point in top-right quadrant, travel ~40% of viewport diagonally toward lower-left over 1000ms.
- Render as a canvas path with a gradient stroke: transparent at tail → `rgba(103,232,249,0.9)` at head (1px), with a wider `rgba(103,232,249,0.1)` glow beneath (3px, blur it by rendering semi-transparent on canvas context).
- Easing: linear motion for the star itself.
- Fade out: opacity 0 in last 200ms of the animation.

### Count-up stats
When the element enters viewport, trigger. Duration: 1.5s. Easing: ease-out (fast start, decelerate). Use `requestAnimationFrame` internally or Framer `useMotionValue` + spring with stiffness: 50, damping: 30. Numbers formatted with `+` suffix where applicable.

### Hover: service card scanline sweep
When card is hovered: a `::after` pseudo-element (or an absolutely positioned div) with `background: linear-gradient(transparent, rgba(34,211,238,0.06) 40%, rgba(103,232,249,0.06) 60%, transparent)` sweeps from top (translateY: -100%) to bottom (translateY: 100%) over `700ms` once. Not repeating on hold — only on hover entry. Implement via a CSS animation triggered by adding a class on hover (React state).

### Orb float animation (Hero right column)
```css
@keyframes floatOrb {
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-18px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
animation: floatOrb 8s ease-in-out infinite;
```

### Nebula drift
```css
@keyframes nebulaFloat {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(30px, -20px); }
}
animation: nebulaFloat 20s ease-in-out infinite alternate;
```

---

## 8. WHAT TO ABSOLUTELY AVOID

These are anti-patterns that will kill the design's credibility:

1. **No uniform glow borders on every single card.** Pick 1–2 key elements per page to glow. Overuse destroys hierarchy.
2. **No rainbow gradient text on more than 1–2 words per page.** It becomes wallpaper.
3. **No rounded-full pill badges on every section header.** The `▸ LABEL` treatment replaces this.
4. **No 3D icons or 3D anything.** Flat, precise, vector, line-based only.
5. **No stock purple-gradient hero background repeated on every page.** Each page's hero has a unique nebula positioning and intensity.
6. **No centered full-width text blocks for body copy.** Long body text must be left-aligned (only headings/badges center-aligned).
7. **No `text-gradient` class applied to every heading.** Gradient text is a premium accent — use it maximum once per page section.
8. **No auto-playing anything with sound.** The sound toggle stays opt-in.
9. **No emoji in UI.** The service icons are now Lucide icons. Remove all emoji from the UI. If emoji appears in mockData, keep it in data only, but render a Lucide icon instead in the card.
10. **No Bootstrap-looking card shadows.** If you use shadow, it must be a colored shadow: `box-shadow: 0 0 24px rgba(14,165,233,0.12)`.
11. **No generic `bg-white/10` glassmorphism on everything.** Reserve glass panels for specific contexts: navbar on scroll, chatbot window, form containers.
12. **No animation on background elements that trips the user up.** The starfield, constellations, and nebulas must be completely non-distracting. If in doubt, reduce intensity by 50%.
13. **Do not change `tailwind.config.ts` theme colors and break existing utility classes without ensuring backward compatibility.**

---

## 9. TAILWIND CONFIG ADDITIONS

Add to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    fontFamily: {
      display: ['Space Grotesk', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    colors: {
      void: '#00000A',
      space: {
        950: '#03030F',
        900: '#060614',
        800: '#0A0A1E',
        700: '#0F0F2A',
        600: '#141435',
      },
      nebula: {
        300: '#93E6FB',
        400: '#67E8F9',
        500: '#22D3EE',
        600: '#0EA5E9',
        700: '#0284C7',
      },
      aurora: {
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6',
        600: '#7C3AED',
        700: '#6D28D9',
        900: '#2E1065',
      },
      star: {
        100: '#F0F4FF',
        200: '#E2E8F7',
        300: '#C8D3E8',
        400: '#94A3B8',
        500: '#64748B',
      },
      pulsar: {
        400: '#FBBF24',
        500: '#F59E0B',
      },
    },
    animation: {
      'float-orb': 'floatOrb 8s ease-in-out infinite',
      'nebula-drift': 'nebulaFloat 20s ease-in-out infinite alternate',
      'twinkle': 'twinkle 3s ease-in-out infinite',
      'orbit-ring': 'orbitring 20s linear infinite',
      'scanline-sweep': 'scanlineSweep 0.7s ease-out forwards',
      'cursor-ring-spin': 'spin 12s linear infinite',
      'blink': 'blink 1s step-end infinite',
    },
    keyframes: {
      floatOrb: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-18px)' },
      },
      nebulaFloat: {
        '0%': { transform: 'translate(0, 0)' },
        '100%': { transform: 'translate(30px, -20px)' },
      },
      twinkle: {
        '0%, 100%': { opacity: '0.4' },
        '50%': { opacity: '1' },
      },
      orbitring: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      scanlineSweep: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(100%)' },
      },
      blink: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0' },
      },
    },
    backgroundImage: {
      'dot-grid': 'radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)',
      'scanlines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.015) 2px, rgba(14,165,233,0.015) 4px)',
    },
    backgroundSize: {
      'grid-40': '40px 40px',
    },
  },
}
```

---

## 10. `globals.css` ADDITIONS

```css
/* Font imports */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

/* Default cursor — hide on desktop, cursor component handles it */
@media (pointer: fine) {
  * { cursor: none !important; }
}

/* Root CSS variables */
:root {
  --void: #00000A;
  --space-950: #03030F;
  --space-900: #060614;
  --space-800: #0A0A1E;
  --space-700: #0F0F2A;
  --nebula-400: #67E8F9;
  --nebula-500: #22D3EE;
  --aurora-400: #A78BFA;
  --aurora-500: #8B5CF6;
  --star-100: #F0F4FF;
  --star-200: #E2E8F7;
  --star-300: #C8D3E8;
  --star-400: #94A3B8;
  --star-500: #64748B;
}

/* Text gradient utility */
.text-gradient-space {
  background: linear-gradient(135deg, #F0F4FF 0%, #67E8F9 40%, #A78BFA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-nebula {
  background: linear-gradient(135deg, #67E8F9 0%, #22D3EE 50%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dot-grid background texture */
.bg-dot-grid {
  background-image: radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Scanline texture */
.bg-scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(14,165,233,0.015) 2px,
    rgba(14,165,233,0.015) 4px
  );
}

/* Panel corner bracket pseudo-element */
.panel-corner::before,
.panel-corner::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(34,211,238,0.3);
  border-style: solid;
}
.panel-corner::before { top: 0; left: 0; border-width: 1px 0 0 1px; }
.panel-corner::after  { top: 0; right: 0; border-width: 1px 1px 0 0; }

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Selection color */
::selection {
  background: rgba(34,211,238,0.2);
  color: #F0F4FF;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #03030F; }
::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.25); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.5); }
```

---

## 11. NEW COMPONENT FILE CHECKLIST

Files to **CREATE** (new):
- `components/StarfieldCanvas.tsx` — canvas starfield with shooting stars + parallax
- `components/ConstellationOverlay.tsx` — SVG constellation patterns + draw-in animation
- `components/ProjectCardVisual.tsx` — CSS/SVG abstract visual per project category
- `components/CustomCursor.tsx` — already exists, completely rewrite to targeting reticle
- `components/OrbitOrb.tsx` — the hero right column decorative orb + rings
- `components/TechConstellation.tsx` — interactive tech stack node-graph for home
- `components/SystemPreviewMockup.tsx` — wireframe-style system preview for Ready-Made Systems

Files to **MODIFY** (keep all props/content, only visual code):
- `components/Navbar.tsx`
- `components/Hero.tsx`
- `components/Footer.tsx`
- `components/ServiceCard.tsx`
- `components/ProjectCard.tsx`
- `components/BlogCard.tsx`
- `components/CTASection.tsx`
- `components/SectionWrapper.tsx`
- `components/AnimatedContainer.tsx`
- `app/globals.css`
- `tailwind.config.ts`
- All `*Client.tsx` files (visual/layout restructuring only)

Files to **NEVER TOUCH**:
- `lib/mockData.ts` — not a single character changes
- `app/**/page.tsx` — metadata stays, only child component may be updated
- `app/api/chat/route.ts`
- Any existing routing logic

---

## 12. QUALITY CHECK CRITERIA

Before considering the redesign complete, verify:

- [ ] Navigate through all 9 pages — each one feels distinct yet cohesive.
- [ ] On the hero, the orb is visible and animating on desktop; hidden elegantly on mobile.
- [ ] The starfield is subtle — can read text comfortably. Stars are not competing with content.
- [ ] Constellation lines are barely visible — texture, not distraction.
- [ ] The navbar on scroll shows the frosted dark glass effect with gradient border.
- [ ] Service cards all have Lucide icons (no emoji leaked to UI).
- [ ] All stat numbers animate up from 0 when entering viewport.
- [ ] The custom cursor shows correctly on desktop, reverts to normal on mobile/touch.
- [ ] The Google Map on Contact has the dark filter applied.
- [ ] The blog post page reads comfortably (wide line-height, high contrast body text).
- [ ] The case study page feels editorial and premium.
- [ ] No gradient text is applied to more than one heading per visible screen area at a time.
- [ ] `npm run build` passes without errors.
- [ ] On mobile (375px), no horizontal overflow, no broken layouts.
- [ ] Lighthouse Performance score > 80. (Optimize canvas rendering, lazy load images, code split new components.)

---

*This is the full design spec for PROGREX v3 — The Constellation Edition.*  
*Designed for an elite technology company that exists in the future.*
