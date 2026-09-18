# Quickstart & Validation Guide

## Prerequisites
- Node.js (v18+)
- `pnpm` (required by constitution)

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm run dev
   ```

## Validation Scenarios

### Scenario 1: Initial Load & Overview
1. Open the application at `http://localhost:5173` (or the Vite dev URL).
2. **Verify**: The "Vulnerability Overview" page renders immediately.
3. **Verify**: The total findings count displays `150`.
4. **Verify**: The breakdowns for SCA, SAST, and DAST accurately show counts matching the dummy data.

### Scenario 2: Project Filtering
1. On the overview page, locate the Project filter.
2. Select "group" from the dropdown.
3. **Verify**: The total counts instantly update to reflect only findings associated with the `group` project.
4. Reset the filter to "All Projects".

### Scenario 3: Findings List & Pagination
1. Navigate down to the "Vulnerability Findings - SCA" section.
2. **Verify**: A data table renders displaying exactly 10 findings.
3. **Verify**: The pagination controls indicate "Showing 1 to 10 of 50 findings".
4. Click the "Next" button or page "2".
5. **Verify**: The table updates to show the next 10 findings.

### Scenario 4: Sorting & Styling
1. Locate the sort control or click the Severity column header.
2. Set sorting to "High to Low (Critical first)".
3. **Verify**: Critical findings (marked with Crimson neon styling) appear at the top.
4. **Verify**: The UI styling precisely mirrors the dark mode aesthetics, including correct typography (Plus Jakarta Sans, Inter, JetBrains Mono) and glassmorphism elements defined in `DESIGN.md`.
