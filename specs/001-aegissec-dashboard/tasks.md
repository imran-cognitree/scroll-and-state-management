# Tasks: Cognitree Dashboard

**Input**: Design documents from `/specs/001-aegissec-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React project with Vite using `pnpm create vite@latest . --template react-ts`
- [x] T002 [P] Install dependencies: `radix-ui/react-*`, `zustand`, `lucide-react`
- [x] T003 [P] Create project structure per implementation plan (components/, store/, data/, styles/)
- [x] T004 [P] Setup Vanilla CSS variables in `src/styles/variables.css` using `data/DESIGN.md` tokens
- [x] T005 [P] Setup global CSS in `src/styles/index.css`
- [x] T006 [P] Copy `data/dummy-vulnerability-findings.json` to `src/data/dummy-vulnerability-findings.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create base `DashboardMetadata` and `Finding` types in `src/store/types.ts`
- [x] T008 Implement Zustand store in `src/store/dashboardStore.ts` to hold data and filter state
- [x] T009 Create basic Radix UI building block components (Button, Badge, Card) in `src/components/ui/`
- [x] T010 Implement data loader hook or function to populate store from the mock JSON

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Vulnerability Overview (Priority: P1) 🎯 MVP

**Goal**: Display high-level overview of vulnerabilities across projects, categorized by scanner type and severity.

**Independent Test**: Can be fully tested by loading the dashboard and verifying the aggregated counts and project filters reflect the underlying vulnerability data correctly.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create `MetricStat` component in `src/components/dashboard/MetricStat.tsx` for large numbers
- [x] T012 [P] [US1] Create `ScannerCategoryCard` component in `src/components/dashboard/ScannerCategoryCard.tsx`
- [x] T013 [P] [US1] Create `ProjectFilterDropdown` component in `src/components/dashboard/ProjectFilterDropdown.tsx`
- [x] T014 [US1] Assemble `VulnerabilityOverview` layout in `src/components/dashboard/VulnerabilityOverview.tsx`
- [x] T015 [US1] Wire `VulnerabilityOverview` to `dashboardStore` to display aggregated metrics
- [x] T016 [US1] Integrate `VulnerabilityOverview` into `src/App.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Detailed Vulnerability Findings (Priority: P2)

**Goal**: View a detailed, paginated list of vulnerabilities for a specific scanner.

**Independent Test**: Can be fully tested by navigating to the list view and verifying that the table displays 10 items per page with all required columns and data points.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create reusable `Table` primitives using Radix UI in `src/components/ui/Table.tsx`
- [x] T018 [P] [US2] Create `SeverityBadge` component in `src/components/ui/SeverityBadge.tsx`
- [x] T019 [P] [US2] Create `StatusBadge` component in `src/components/ui/StatusBadge.tsx`
- [x] T020 [P] [US2] Create `Pagination` controls component in `src/components/ui/Pagination.tsx`
- [x] T021 [US2] Implement `FindingsList` component in `src/components/dashboard/FindingsList.tsx`
- [x] T022 [US2] Wire `FindingsList` to `dashboardStore` with client-side pagination logic (10 items per page)
- [x] T023 [US2] Integrate `FindingsList` into `src/App.tsx` below the overview

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Sort and Filter Vulnerabilities (Priority: P3)

**Goal**: Sort vulnerabilities by severity and filter them by project and status.

**Independent Test**: Can be tested independently on the list view by applying a combination of filters and sorting, and verifying the returned list strictly matches those criteria.

### Implementation for User Story 3

- [x] T024 [P] [US3] Create `StatusFilterDropdown` component in `src/components/dashboard/StatusFilterDropdown.tsx`
- [x] T025 [P] [US3] Create `SortControl` component in `src/components/dashboard/SortControl.tsx`
- [x] T026 [US3] Wire filter dropdowns and sort controls to update `dashboardStore` state
- [x] T027 [US3] Update `dashboardStore` derived state logic to properly sort (Critical -> Low) and filter findings based on selected criteria
- [x] T028 [US3] Integrate filter and sort controls into the `FindingsList` toolbar

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 Query the Figma MCP Server to verify layouts, spacing, and design tokens during implementation
- [x] T030 Polish styling to ensure 100% adherence to Glassmorphism and technical futurism neon glow effects
- [x] T031 Code cleanup, removing unused imports, standardizing types
- [x] T032 Run quickstart.md validation to ensure everything works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Models within a story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
