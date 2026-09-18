import { useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterDropdown } from '../ui/FilterDropdown';
import type { ScanType } from '../../store/types';
import './FindingsList.css';

interface Props {
  scanType: ScanType;
  onBack: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
];

const SORT_OPTIONS = [
  { value: 'severity-desc', label: 'Severity: High to Low' },
  { value: 'severity-asc', label: 'Severity: Low to High' },
];

const SCANNER_NAMES: Record<ScanType, string> = {
  SCA: 'Trivy',
  SAST: 'Semgrep',
  DAST: 'OWASP ZAP',
};

export function FindingsList({ scanType, onBack }: Props) {
  const metadata       = useDashboardStore((s) => s.metadata);
  const selectedProject = useDashboardStore((s) => s.selectedProject);
  const selectedStatus = useDashboardStore((s) => s.selectedStatus);
  const sortOrder      = useDashboardStore((s) => s.sortOrder);
  const currentPage    = useDashboardStore((s) => s.currentPage);
  const pageSize       = useDashboardStore((s) => s.pageSize);
  const setProject     = useDashboardStore((s) => s.setProjectFilter);
  const setStatus      = useDashboardStore((s) => s.setStatusFilter);
  const setScanType    = useDashboardStore((s) => s.setScanTypeFilter);
  const setSortOrder   = useDashboardStore((s) => s.setSortOrder);
  const loadMorePage   = useDashboardStore((s) => s.loadMorePage);
  const allFindings    = useDashboardStore((s) => s.allFindings);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset page to 1 when scan type is set/changed
  useEffect(() => {
    setScanType(scanType);
    return () => {
      setScanType('all');
    };
  }, [scanType, setScanType]);

  // Filtered + sorted full list (no pagination slice yet)
  const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const allFiltered = allFindings
    .filter((f) => f.type === scanType)
    .filter((f) => selectedProject === 'all' || f.project === selectedProject)
    .filter((f) => selectedStatus === 'all' || f.status === selectedStatus)
    .sort((a, b) => {
      const diff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      return sortOrder === 'severity-desc' ? diff : -diff;
    });

  // Show all rows up to currentPage * pageSize  (rows accumulate)
  const visibleCount = currentPage * pageSize;
  const visibleRows  = allFiltered.slice(0, visibleCount);
  const hasMore      = visibleCount < allFiltered.length;

  // IntersectionObserver — fires loadMorePage when sentinel enters viewport
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePage();
      }
    },
    [hasMore, loadMorePage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,       // viewport
      rootMargin: '0px',
      threshold: 0.1,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersection]);

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...(metadata?.projects ?? []).map((p) => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    })),
  ];

  return (
    <section className="findings" aria-label={`${scanType} Vulnerability Findings`}>
      {/* Header */}
      <div className="findings__header">
        <button className="findings__back-btn" onClick={onBack} id="back-to-overview">
          <ChevronLeft size={14} />
          Back to Overview
        </button>
        <div className="findings__title-group">
          <span className="findings__scanner-pill">{scanType} · {SCANNER_NAMES[scanType]}</span>
          <h2 className="findings__title">Vulnerability Findings — {scanType}</h2>
        </div>
      </div>

      {/* Toolbar */}
      <div className="findings__toolbar">
        <div className="findings__filters">
          <FilterDropdown
            id="findings-project-filter"
            label="Project"
            value={selectedProject}
            options={projectOptions}
            onChange={setProject}
          />
          <FilterDropdown
            id="findings-status-filter"
            label="Status"
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
          <FilterDropdown
            id="findings-sort"
            label="Sort"
            value={sortOrder}
            options={SORT_OPTIONS}
            onChange={(v) => setSortOrder(v as 'severity-desc' | 'severity-asc')}
          />
        </div>
        <span className="findings__count">
          Showing <strong>{visibleRows.length}</strong> of <strong>{allFiltered.length}</strong> findings
        </span>
      </div>

      {/* Table */}
      <div className="findings__table-wrap">
        <table className="findings__table" aria-label="Vulnerability findings table">
          <thead>
            <tr>
              <th>SEVERITY</th>
              <th>ID / CVE</th>
              <th>SCANNER</th>
              <th>PACKAGE</th>
              <th>VERSION</th>
              <th>FIXED IN</th>
              <th>TYPE</th>
              <th>DESCRIPTION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="findings__empty">
                  No vulnerabilities found for the selected filters.
                </td>
              </tr>
            ) : (
              visibleRows.map((finding) => (
                <tr
                  key={finding.id}
                  className={`findings__row findings__row--${finding.severity.toLowerCase()}`}
                  id={`finding-row-${finding.id}`}
                >
                  <td>
                    <SeverityBadge severity={finding.severity} showDot />
                  </td>
                  <td>
                    <div className="findings__id-cell">
                      <span className="findings__custom-id">{finding.id}</span>
                      <span className="findings__cve">{finding.vulnerability_id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="findings__scanner-tag">{finding.scanner}</span>
                  </td>
                  <td>
                    <span className="findings__package">{finding.package_name}</span>
                  </td>
                  <td>
                    <span className="findings__version">{finding.installed_version}</span>
                  </td>
                  <td>
                    <span className="findings__fixed-version">{finding.fixed_version}</span>
                  </td>
                  <td>
                    <span className="findings__type">{finding.vulnerability_type}</span>
                  </td>
                  <td className="findings__description-cell">
                    <span className="findings__description">{finding.description}</span>
                    <span className="findings__location">{finding.location}</span>
                  </td>
                  <td>
                    <StatusBadge status={finding.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invisible sentinel — triggers next page load when scrolled into view */}
      <div
        ref={sentinelRef}
        className="findings__scroll-sentinel"
        aria-hidden="true"
      />

      {/* Loading indicator */}
      {hasMore && (
        <div className="findings__loading-more">
          <Loader2 size={18} className="findings__spinner" />
          <span>Loading more…</span>
        </div>
      )}

      {/* End-of-list message */}
      {!hasMore && allFiltered.length > 0 && (
        <div className="findings__end-of-list">
          All {allFiltered.length} findings loaded
        </div>
      )}
    </section>
  );
}
