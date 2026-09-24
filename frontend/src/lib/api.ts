import {
  TokenSchema,
  UserResponseSchema,
  DashboardDataSchema,
  FindingDetailSchema,
  normalizeFindingId,
} from './schemas';
import type {
  LoginInput,
  Token,
  UserResponse,
  DashboardData,
  FindingDetail,
  FindingStatusUpdate,
} from './schemas';

const API_BASE = 'http://127.0.0.1:8000/api';

// Token management
const TOKEN_KEY = 'vul_dashboard_token';
const ROLE_KEY = 'vul_dashboard_role';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function isLoggedIn(): boolean {
  return !!getStoredToken();
}

export function isAdmin(): boolean {
  return getStoredRole() === 'ADMIN';
}

function decodeTokenRole(token: string): string {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch {
    return 'USER';
  }
}

export function setToken(token: string, role?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role ?? decodeTokenRole(token));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// Helper to make authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const message = error.detail || `API Error: ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  return data;
}

// Auth API
export async function login(credentials: LoginInput): Promise<Token> {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  const data = await response.json();
  return TokenSchema.parse(data);
}

export async function signup(formData: any): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
    throw new Error(error.detail || 'Signup failed');
  }

  const data = await response.json();
  return UserResponseSchema.parse(data);
}

// Findings API
export async function getFindings(
  project?: string,
  type?: string,
  severity?: string,
  status?: string,
  scanner?: string,
  page: number = 1,
  limit: number = 50,
): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (project && project !== 'all') params.append('project', project);
  if (type) params.append('type', type);
  if (severity && severity !== 'all') params.append('severity', severity);
  if (status && status !== 'all') params.append('status', status);
  if (scanner && scanner !== 'all') params.append('scanner', scanner);
  params.append('page', String(page));
  params.append('limit', String(limit));

  const raw = await fetchWithAuth<any>(`/findings?${params.toString()}`);

  // Normalize _id → id for every finding (backend uses Pydantic alias)
  if (raw?.findings) {
    raw.findings = raw.findings.map((f: any) => ({
      ...f,
      id: normalizeFindingId(f),
    }));
  }

  const result = DashboardDataSchema.safeParse(raw);
  if (!result.success) {
    console.error('[API] DashboardDataSchema validation failed:', result.error.format());
    // Return the raw data cast to type so the UI still renders
    return raw as DashboardData;
  }
  return result.data;
}

export async function getFinding(id: string): Promise<FindingDetail> {
  const raw = await fetchWithAuth<any>(`/findings/${id}`);
  // Normalize _id → id
  const normalized = { ...raw, id: normalizeFindingId(raw) };
  const result = FindingDetailSchema.safeParse(normalized);
  if (!result.success) {
    console.error('[API] FindingDetailSchema validation failed:', result.error.format());
    return normalized as FindingDetail;
  }
  return result.data as FindingDetail;
}

export async function updateFindingStatus(
  id: string,
  update: FindingStatusUpdate,
): Promise<any> {
  return fetchWithAuth(`/findings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

export async function deleteFinding(id: string): Promise<void> {
  await fetchWithAuth(`/findings/${id}`, {
    method: 'DELETE',
  });
}
