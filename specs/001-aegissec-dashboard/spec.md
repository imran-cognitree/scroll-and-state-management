# Feature Specification: AegisSec Vulnerability Management Dashboard

**Feature Branch**: `[###-aegissec-dashboard]`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Implement the AegisSec Vulnerability Management Dashboard as per the Figma design. The application needs two main views. First, a 'Vulnerability Overview' page that displays aggregated vulnerability counts (Total Findings) and breaks them down by scanner type: SCA (Trivy), SAST (Semgrep), and DAST (OWASP ZAP). Each scanner section should display metrics for Critical, High, Medium, and Low severities. It must also include a filter by Project (e.g., group, payment, user). Second, a detailed 'Vulnerability Findings' list view (e.g., for SCA/Trivy) that displays a paginated list of vulnerabilities (10 items per page). Each list item must display the Severity, custom ID (e.g., SCA-001), CVE number, Scanner, Status (Open, In Progress, Resolved), Package name, current version, fixed-in version, Vulnerability Type, and a short description. This list must support sorting by Severity (High to Low) and filtering by Project and Status."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Vulnerability Overview (Priority: P1)

As a security administrator, I want to see a high-level overview of all vulnerabilities across projects, categorized by scanner type and severity, so that I can quickly assess the current security posture.

**Why this priority**: The overview provides the entry point to the application and gives immediate situational awareness, which is the primary value of the dashboard.

**Independent Test**: Can be fully tested by loading the dashboard and verifying the aggregated counts and project filters reflect the underlying vulnerability data correctly.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** the page loads, **Then** I see the total findings count and breakdowns for SCA, SAST, and DAST with critical/high/medium/low severity counts.
2. **Given** I am on the dashboard, **When** I select a specific project from the filter dropdown, **Then** the vulnerability counts update to reflect only that project's findings.

---

### User Story 2 - View Detailed Vulnerability Findings (Priority: P2)

As a security analyst, I want to view a detailed, paginated list of vulnerabilities for a specific scanner (e.g., SCA/Trivy), so that I can investigate and prioritize specific issues for remediation.

**Why this priority**: Detailed findings allow the team to take action on the vulnerabilities surfaced in the overview.

**Independent Test**: Can be fully tested by navigating to the list view and verifying that the table displays 10 items per page with all required columns and data points.

**Acceptance Scenarios**:

1. **Given** I am on the Vulnerability Findings list view, **When** I view the table, **Then** I see up to 10 vulnerabilities per page with Severity, ID, CVE, Scanner, Status, Package, Versions, Type, and Description.
2. **Given** I am on the Vulnerability Findings list view, **When** I click "Next", **Then** I am taken to the second page of vulnerabilities.

---

### User Story 3 - Sort and Filter Vulnerabilities (Priority: P3)

As a security analyst, I want to sort vulnerabilities by severity and filter them by project and status, so that I can focus on resolving the most critical, open issues first.

**Why this priority**: Essential for workflow management, but the list view provides baseline value even without advanced sorting and filtering.

**Independent Test**: Can be tested independently on the list view by applying a combination of filters and sorting, and verifying the returned list strictly matches those criteria.

**Acceptance Scenarios**:

1. **Given** a list of findings, **When** I sort by Severity (High to Low), **Then** Critical vulnerabilities appear first, followed by High, Medium, and Low.
2. **Given** a list of findings, **When** I filter by Status "Open", **Then** only open vulnerabilities are displayed in the list.

### Edge Cases

- What happens when a project has zero vulnerabilities? (System should display "0" counts and an empty state for lists)
- How does the system handle missing data for a vulnerability, such as a missing CVE or missing fixed-in version? (System should display "N/A" or "-" gracefully)
- What happens when a user attempts to go past the last page of pagination? (The "Next" button should be disabled)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an aggregated overview of total vulnerabilities, broken down by SCA (Trivy), SAST (Semgrep), and DAST (OWASP ZAP).
- **FR-002**: System MUST display Critical, High, Medium, and Low severity counts for each scanner type.
- **FR-003**: System MUST provide a global project filter on the overview page that updates all visible metrics.
- **FR-004**: System MUST display a detailed list view of vulnerabilities, paginated at 10 items per page.
- **FR-005**: System MUST display the following data points per vulnerability in the list: Severity, ID, CVE, Scanner, Status, Package name, current version, fixed-in version, Vulnerability Type, and Description.
- **FR-006**: System MUST allow users to sort the vulnerability list by Severity (High to Low).
- **FR-007**: System MUST allow users to filter the vulnerability list by Project and Status (Open, In Progress, Resolved).

### Key Entities

- **Vulnerability**: Represents a single security flaw. Contains severity, status, CVE, scanner type, affected package, and descriptive metadata.
- **Project**: Represents a specific application or service (e.g., group, payment, user) that contains vulnerabilities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the aggregated counts and breakdowns within 2 seconds of loading the dashboard.
- **SC-002**: Filtering the dashboard by a specific project updates the metrics instantly (under 1 second).
- **SC-003**: Users can successfully sort the vulnerabilities and identify the highest severity open items without confusion.

## Assumptions

- Vulnerability data will be provided via a mock JSON file or mocked API endpoint since no backend is specified.
- The UI must strictly follow the Figma design system specifications defined in `data/DESIGN.md`.
