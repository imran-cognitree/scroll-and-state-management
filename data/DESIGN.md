---
name: Cyber Command Dark Glass
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#ff79b4'
  on-tertiary-container: '#780047'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
  bg-canvas: '#0B0F19'
  bg-surface: '#111827'
  bg-surface-elevated: '#1F2937'
  border-subtle: '#1E293B'
  border-glass: rgba(255, 255, 255, 0.08)
  scanner-sca: '#06B6D4'
  scanner-sast: '#8B5CF6'
  scanner-dast: '#EC4899'
  severity-critical: '#F43F5E'
  severity-high: '#F97316'
  severity-medium: '#F59E0B'
  severity-low: '#10B981'
  status-open: '#38BDF8'
  status-in-progress: '#A855F7'
  status-resolved: '#34D399'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
  metric-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  layout-max-width: 1600px
---

## Brand & Style

This design system targets SecOps engineers, AppSec analysts, and platform security leaders managing complex, high-throughput attack surfaces. The interface embodies precision, operational vigilance, and rapid incident comprehension. It replaces cluttered legacy enterprise dashboards with a sleek, dark-mode terminal-grade aesthetic that merges deep indigo canvases with vibrant neon telemetry accents.

The visual style combines **Glassmorphism** and **Technical Futurism**:
- **Atmospheric Backgrounds**: Layered deep slate and obsidian canvases (`#0B0F19`, `#111827`) provide high-contrast grounding, eliminating eye fatigue during prolonged triages.
- **Vibrant Diagnostic Luminescence**: Laser-focused neon hues signify scan modalities (SCA, SAST, DAST) and risk tiers (Critical, High, Medium, Low).
- **Subtle Glass Translucency**: Cards and panels utilize 1px hairline borders (`rgba(255, 255, 255, 0.08)`) and controlled frosted backdrops (`backdrop-filter: blur(12px)`), avoiding heavy drop shadows in favor of ambient optical depth.
- **Monospace Rigor**: CVE IDs, CWE hashes, rule pointers, and memory offsets sit on equal footing with analytical prose, offering a clean, developer-centric workflow.

## Colors

The palette operates strictly in dark mode, balancing high-absorption slate backdrops with focused spectral luminescence. 

### Core Palette Roles
- **Primary (`#06B6D4`)**: Electric Cyan serves as the foundational interactive focal point, primary action trigger, and SCA (Software Composition Analysis) scan identity.
- **Secondary (`#8B5CF6`)**: Electric Violet accents SAST (Static Application Security Testing) findings, deep-code telemetry, and workflow progress indicators.
- **Tertiary (`#EC4899`)**: Hot Coral/Pink powers DAST (Dynamic Application Security Testing) metrics and runtime environment alerts.
- **Neutral (`#0B0F19`)**: The primary deep indigo-slate canvas ground.

### Semantic Triage & Severity
Severity fills must maintain immediate optical divergence across dense telemetry:
- **Critical (`#F43F5E`)**: Neon Ruby/Crimson. Strictly reserved for exploitable RCEs, zero-days, and CVSS 9.0+. Backdrops use 12% alpha fills with 100% solid borders and text.
- **High (`#F97316`)**: Vivid Orange. CVSS 7.0–8.9 escalation barriers.
- **Medium (`#F59E0B`)**: Radiant Amber. Informational exposures and misconfigurations.
- **Low (`#10B981`)**: Emerald. Best-practice warnings and minor hardening checks.

### Surface Hierarchy
1. **Canvas (`#0B0F19`)**: Baseline viewport floor.
2. **Surface (`#111827`)**: Base cards, table bodies, and persistent navigation panes.
3. **Surface Elevated (`#1F2937`)**: Filter menus, dropdown flyouts, modal dialogs, and table row hover states.

## Typography

The typographic hierarchy bridges modern editorial product styling with dense technical debugging.

- **Headlines (`Plus Jakarta Sans`)**: Delivers geometric crispness with contemporary authority. Headings maintain tight letter spacing (`-0.02em`) to keep dashboard real estate efficient.
- **Body & Prose (`Inter`)**: Applied across long descriptions, remediation steps, and audit logs. Tuned for readability against low-luminosity backgrounds with tall x-heights.
- **Technical Readouts (`JetBrains Mono`)**: Mandatory for all raw computational entities: CVE identifiers (`CVE-2026-10001-1`), rule references (`SAST-001`), CWE taxonomies (`CWE-89`), commit SHAs, file path roots, and network ports. Code labels use slight horizontal tracking (`+0.02em`) for clarity.

## Layout & Spacing

This design system uses a strict 4px/8px modular scale built for information density and scanning speed.

### Layout Model
- **Grid Structure**: 12-column fluid grid system pinned to a maximum container width of `1600px`. Columns flex with a `24px` gutter (`space-lg`) on desktop and an `8px` to `16px` gutter on mobile/tablet viewports.
- **Density Controls**: Data tables support dense rendering (`36px` row height) and standard rendering (`48px` row height) with explicit horizontal padding of `16px` (`space-base`).
- **Responsive Adaptations**:
  - **Desktop (≥ 1280px)**: Collapsible persistent left sidebar navigation (`240px` expanded, `64px` iconized), sticky metric KPIs, multi-column filter bar, and wide tabular layout with fixed action columns.
  - **Tablet (768px – 1279px)**: Metric cards collapse to a 2x2 grid; filter bars shift into an off-canvas drawer; secondary table metadata (e.g., scanner tool, package timestamp) tucks behind expanding disclosure rows.
  - **Mobile (< 768px)**: Single-column flow; summary KPI carousel; table transforms into vertical stacked finding cards with swipe actions.

## Elevation & Depth

Visual depth is achieved through translucent planar layering, hairline edge refraction, and selective atmospheric bloom rather than opaque drop shadows.

### Elevation Levels
- **Layer 0 (Canvas Base)**: `#0B0F19` solid.
- **Layer 1 (Standard Card / Panel)**: `#111827` at 85% opacity, backdrop filter `blur(12px)`, bordered by `1px solid rgba(255, 255, 255, 0.07)`.
- **Layer 2 (Floating Toolbar / Sticky Table Headers)**: `#1F2937` at 90% opacity, backdrop filter `blur(16px)`, bordered by `1px solid rgba(255, 255, 255, 0.12)`.
- **Layer 3 (Popovers, Tooltips & Filter Menus)**: `#1F2937` solid, box shadow `0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)`.
- **Layer 4 (Critical Threat Modals & Drawers)**: `#111827` overlaid on `#0B0F19` with a 75% black blur overlay; border accented by a subtle, glowing edge highlight.

### Atmospheric Neon Bloom
Interactive and alert states project soft, tinted outer glows:
- **Critical Alert Glow**: `box-shadow: 0 0 20px -4px rgba(244, 63, 94, 0.35)`
- **SCA Primary Glow**: `box-shadow: 0 0 16px -3px rgba(6, 182, 212, 0.30)`
- **Focus Ring**: `0 0 0 2px #0B0F19, 0 0 0 4px #06B6D4`

## Shapes

The design system maintains a **Soft** shape profile (`roundedness: 1`). Curvature remains restrained to preserve the architectural, HUD-inspired feel without feeling round or playful.

- **Base Radius (`rounded-sm` / 4px)**: Checkboxes, inline code badges, CVE token tags, tooltips, and table cell highlights.
- **Element Radius (`rounded` / 6px)**: Form inputs, buttons, filter chips, dropdown menus, and pagination buttons.
- **Card & Panel Radius (`rounded-lg` / 8px)**: Summary stat metric cards, table containers, security finding drawers, and modal windows.
- **Pill Variant (`rounded-full`)**: Strictly reserved for dynamic status badges (e.g., `Open`, `In Progress`, `Resolved`) and scanner classification pills (`SCA`, `SAST`, `DAST`).

## Components

### Buttons
- **Primary**: Background filled with `#06B6D4`, text `#0B0F19` (bold weight for contrast). On hover, brightness increases with an ambient cyan glow (`box-shadow: 0 0 16px rgba(6, 182, 212, 0.4)`).
- **Secondary / Glass**: Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.12)`, text `#F3F4F6`. Hover triggers `background: rgba(255, 255, 255, 0.1)`.
- **Destructive**: Background `rgba(244, 63, 94, 0.12)`, border `1px solid #F43F5E`, text `#F43F5E`. Hover applies solid `#F43F5E` fill with `#FFFFFF` text.

### Badges & Severity Chips
- **Structural Treatment**: Built with `JetBrains Mono`, uppercase, tracking `+0.05em`, size `label-sm` (`10px`).
- **Severity Tokens**:
  - **Critical**: Background `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, border `1px solid rgba(244, 63, 94, 0.3)`. Includes a pulse indicator dot.
  - **High**: Background `rgba(249, 115, 22, 0.12)`, text `#F97316`, border `1px solid rgba(249, 115, 22, 0.3)`.
  - **Medium**: Background `rgba(245, 158, 11, 0.12)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.3)`.
  - **Low**: Background `rgba(16, 185, 129, 0.12)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.3)`.
- **Scanner Modality Tags**: Pill-shaped (`rounded-full`). `SCA` in Cyan (`#06B6D4`), `SAST` in Violet (`#8B5CF6`), `DAST` in Hot Pink (`#EC4899`).

### Input Fields & Search Bars
- Background `rgba(17, 24, 39, 0.8)`, border `1px solid rgba(255, 255, 255, 0.1)`. Text color `#F9FAFB`. Placeholder color `#6B7280`.
- Integrated monospace query shortcut indicator (`/` or `CMD+K`) positioned on the trailing edge.
- Active focus state shifts the border to `#06B6D4` with an outer ring blur.

### Data Tables
- **Header**: `#111827`, border-bottom `1px solid rgba(255, 255, 255, 0.1)`. Text in `JetBrains Mono` 11px uppercase with muted slate `#94A3B8`.
- **Rows**: Alternating hover background transition to `#1F2937` with a subtle left accent edge highlight matching the row's severity color.
- **Code Columns**: CVE and Rule tags render in monospace containers with `1px` border lines for fast copy-to-clipboard actions.
- **Pagination**: Compact glass bar with page-index pills, findings per-page selectors, and record count telemetry (`Showing 1-50 of 150 findings`).

### Metric Counters & KPI Cards
- Base surface with 1px glass border. Top border contains an ultra-thin 2px radiant accent bar reflecting the metric category (e.g., Crimson for Critical vulnerabilities).
- Large stat numbers (`metric-stat`) paired with a trend delta pill (e.g., `-12%` in emerald, `+4` in crimson).