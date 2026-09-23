# Data Model: Cognitree Dashboard

## Core Entities

### Vulnerability Finding
Represents a single security flaw detected by a scanner.

**Fields**:
- `id` (string): Unique identifier for the finding (e.g., "SCA-001")
- `type` (string): The scanner category (e.g., "SCA", "SAST", "DAST")
- `project` (string): The project associated with the finding (e.g., "group", "payment", "user")
- `vulnerability_id` (string): The CVE or specific vulnerability identifier
- `package_name` (string): The affected dependency or component (e.g., "lodash")
- `installed_version` (string): The currently installed vulnerable version
- `vulnerability_type` (string): Short classification (e.g., "Prototype Pollution")
- `severity` (enum): "Critical", "High", "Medium", "Low"
- `description` (string): Detailed explanation of the vulnerability
- `fixed_version` (string): The version where the issue is resolved
- `status` (enum): "Open", "In Progress", "Resolved"
- `scanner` (string): The specific tool used (e.g., "Trivy")
- `location` (string): File path or endpoint where detected
- `detected_at` (string/ISO-8601): Timestamp of detection

### Dashboard Metadata
Represents the aggregated metrics for the overview.

**Fields**:
- `generated_for` (string)
- `generated_at` (string/ISO-8601)
- `projects` (Array<string>): List of available projects for filtering
- `total_findings` (number)
- `findings_by_type` (Object): Map of scanner type to total counts (e.g., `{ "SCA": 50 }`)

## State Management (Zustand)

The global state will manage the currently selected filters and the loaded data.

**State Shape**:
```typescript
interface DashboardState {
  // Data
  metadata: DashboardMetadata | null;
  findings: Finding[];
  
  // Filters
  selectedProject: string | "All";
  selectedStatus: string | "All";
  sortOrder: "severity-desc" | "severity-asc";
  
  // Actions
  setProjectFilter: (project: string) => void;
  setStatusFilter: (status: string) => void;
  setSortOrder: (order: "severity-desc" | "severity-asc") => void;
  loadData: (data: any) => void;
}
```
