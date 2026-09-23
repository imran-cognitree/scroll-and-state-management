import { create } from 'zustand';
import type {
  DashboardData,
  DashboardMetadata,
  Finding,
  ScanType,
  SortOrder,
} from './types';
import { SEVERITY_ORDER } from './types';

interface DashboardState {
  metadata: DashboardMetadata | null;
  allFindings: Finding[];
  isLoaded: boolean;

  // Filters
  selectedProject: string;   // 'all' or project name
  selectedStatus: string;    // 'all' | 'Open' | 'In Progress' | 'Resolved'
  selectedSeverity: string;  // 'all' | 'Critical' | 'High' | 'Medium' | 'Low'
  selectedScanType: ScanType | 'all';
  selectedTool: string;      // 'all' or scanner name (e.g. 'Trivy')
  searchQuery: string;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;

  // Actions
  loadData: (data: DashboardData) => void;
  setProjectFilter: (project: string) => void;
  setStatusFilter: (status: string) => void;
  setSeverityFilter: (severity: string) => void;
  setScanTypeFilter: (type: ScanType | 'all') => void;
  setToolFilter: (tool: string) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  loadMorePage: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metadata: null,
  allFindings: [],
  isLoaded: false,
  selectedProject: 'all',
  selectedStatus: 'all',
  selectedSeverity: 'all',
  selectedScanType: 'all',
  selectedTool: 'all',
  searchQuery: '',
  sortOrder: 'severity-desc',
  currentPage: 1,
  pageSize: 10,

  loadData: (data) =>
    set({ metadata: data.metadata, allFindings: data.findings, isLoaded: true }),

  setProjectFilter: (project) => set({ selectedProject: project, currentPage: 1 }),
  setStatusFilter: (status) => set({ selectedStatus: status, currentPage: 1 }),
  setSeverityFilter: (severity) => set({ selectedSeverity: severity, currentPage: 1 }),
  setScanTypeFilter: (type) => set({ selectedScanType: type, currentPage: 1 }),
  setToolFilter: (tool) => set({ selectedTool: tool, currentPage: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setSortOrder: (order) => set({ sortOrder: order, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  loadMorePage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
}));

export function computeSeverityCounts(findings: Finding[]) {
  return {
    total: findings.length,
    Critical: findings.filter((f) => f.severity === 'Critical').length,
    High: findings.filter((f) => f.severity === 'High').length,
    Medium: findings.filter((f) => f.severity === 'Medium').length,
    Low: findings.filter((f) => f.severity === 'Low').length,
  };
}

