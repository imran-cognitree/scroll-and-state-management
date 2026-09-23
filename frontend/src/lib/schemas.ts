import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  username: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;

// User response
export const UserResponseSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'USER']),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Finding schemas
export const SeveritySchema = z.enum(['Critical', 'High', 'Medium', 'Low']);
export type Severity = z.infer<typeof SeveritySchema>;

export const StatusSchema = z.enum(['Open', 'In Progress', 'Resolved']);
export type Status = z.infer<typeof StatusSchema>;

export const ScanTypeSchema = z.enum(['SCA', 'SAST', 'DAST']);
export type ScanType = z.infer<typeof ScanTypeSchema>;

export const FindingBaseSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  type: ScanTypeSchema,
  project: z.string(),
  vulnerability_id: z.string(),
  package_name: z.string(),
  installed_version: z.string(),
  vulnerability_type: z.string(),
  severity: SeveritySchema,
  description: z.string(),
  fixed_version: z.string(),
  status: z.string(),
  scanner: z.string(),
  location: z.string(),
  detected_at: z.string(),
});

export const FindingSchema = FindingBaseSchema.omit({ _id: true });
export type Finding = z.infer<typeof FindingSchema>;

export const FindingDetailSchema = FindingBaseSchema.extend({
  raw_data: z.record(z.string(), z.any()).optional(),
});
export type FindingDetail = z.infer<typeof FindingDetailSchema>;

export const FindingStatusUpdateSchema = z.object({
  status: StatusSchema,
});

export type FindingStatusUpdate = z.infer<typeof FindingStatusUpdateSchema>;

export const FindingsByTypeSchema = z.object({
  SCA: z.number(),
  SAST: z.number(),
  DAST: z.number(),
});

export type FindingsByType = z.infer<typeof FindingsByTypeSchema>;

export const DashboardMetadataSchema = z.object({
  generated_for: z.string(),
  generated_at: z.string(),
  projects: z.array(z.string()),
  total_findings: z.number(),
  findings_by_type: FindingsByTypeSchema,
});

export type DashboardMetadata = z.infer<typeof DashboardMetadataSchema>;

export const DashboardDataSchema = z.object({
  metadata: DashboardMetadataSchema,
  findings: z.array(FindingSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

// Utility to extract safe ID from finding
export function getFindingId(finding: any): string {
  return finding.id || finding._id || '';
}
