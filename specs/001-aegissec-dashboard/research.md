# Phase 0: Research & Technical Context

## Technical Context Decisions

### Frontend Framework
- **Decision**: React.js with Vite
- **Rationale**: Mandated by the project constitution (`constitution.md`). Vite provides an extremely fast build environment and hot module replacement, which is best practice for modern React apps.
- **Alternatives considered**: Next.js (rejected as constitution specifies Vite), Create React App (deprecated).

### State Management
- **Decision**: Zustand
- **Rationale**: Mandated by the project constitution. It is a lightweight, hook-based state management solution that avoids the boilerplate of Redux while providing the same global state capabilities.
- **Alternatives considered**: Redux Toolkit, Context API.

### UI Components & Styling
- **Decision**: Radix UI Primitives with Vanilla CSS (or CSS Modules)
- **Rationale**: Mandated by constitution (Radix UI) and general guidelines (Vanilla CSS). The design system in `data/DESIGN.md` explicitly calls for "Glassmorphism" and "Technical Futurism" (strict dark mode). Vanilla CSS variables will be used to map all the design tokens (colors, typography, spacing) exactly as specified.
- **Alternatives considered**: TailwindCSS (avoided based on web application development guidelines), Material UI.

### Package Management
- **Decision**: `pnpm`
- **Rationale**: Exclusively mandated by the constitution.
- **Alternatives considered**: `npm`, `yarn` (both explicitly forbidden).

### Data Source
- **Decision**: Mocked JSON data (`dummy-vulnerability-findings.json`)
- **Rationale**: Specified by the user. The app will fetch or import this data and populate the Zustand store.
- **Alternatives considered**: Live API (no backend specified).

### Icons
- **Decision**: Lucide React
- **Rationale**: A modern, lightweight icon library that integrates seamlessly with React and fits the crisp, technical aesthetic required by the design system.
- **Alternatives considered**: Heroicons, FontAwesome.
