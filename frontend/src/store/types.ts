export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'In Progress' | 'Resolved';
export type ScanType = 'SCA' | 'SAST' | 'DAST';
export type SortOrder = 'severity-desc' | 'severity-asc';

export interface Finding {
  id: string;
  type: ScanType;
  project: string;
  vulnerability_id: string;
  package_name: string;
  installed_version: string;
  vulnerability_type: string;
  severity: Severity;
  description: string;
  fixed_version: string;
  status: Status;
  scanner: string;
  location: string;
  detected_at: string;
}

export interface FindingsByType {
  SCA: number;
  SAST: number;
  DAST: number;
}

export interface DashboardMetadata {
  generated_for: string;
  generated_at: string;
  projects: string[];
  total_findings: number;
  findings_by_type: FindingsByType;
}

export interface DashboardData {
  metadata: DashboardMetadata;
  findings: Finding[];
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};
