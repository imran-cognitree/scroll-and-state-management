import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterDropdown } from '../ui/FilterDropdown';
import { SearchInput } from '../ui/SearchInput';
import { FindingDetailPanel } from './FindingDetailPanel';
import type { ScanType, Finding } from '../../store/types';
import './FindingsList.css';

interface Props {
  scanType: ScanType | 'all';
  onBack: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
];

const SEVERITY_OPTIONS = [
  { value: 'all',      label: 'All Severities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High',     label: 'High' },
  { value: 'Medium',   label: 'Medium' },
  { value: 'Low',      label: 'Low' },
];

const PAGE_SIZE_OPTIONS = [
  { value: '10',  label: '10 rows' },
  { value: '25',  label: '25 rows' },
  { value: '50',  label: '50 rows' },
  { value: '100', label: '100 rows' },
];

const SCANNER_NAMES: Record<ScanType | 'all', string> = {
  SCA: 'Trivy + Grype',
  SAST: 'Semgrep + SonarQube',
  DAST: 'Wapiti + OWASP ZAP',
  all: 'All Scanners',
};

export function FindingsList({ scanType, onBack }: Props) {
  const metadata        = useDashboardStore((s) => s.metadata);
  const selectedProject = useDashboardStore((s) => s.selectedProject);
  const selectedStatus  = useDashboardStore((s) => s.selectedStatus);
  const selectedSeverity = useDashboardStore((s) => s.selectedSeverity);
  const selectedTool    = useDashboardStore((s) => s.selectedTool);
  const searchQuery     = useDashboardStore((s) => s.searchQuery);
  const sortOrder       = useDashboardStore((s) => s.sortOrder);
  const currentPage     = useDashboardStore((s) => s.currentPage);
  const pageSize        = useDashboardStore((s) => s.pageSize);
  const setProject      = useDashboardStore((s) => s.setProjectFilter);
  const setStatus       = useDashboardStore((s) => s.setStatusFilter);
  const setSeverity     = useDashboardStore((s) => s.setSeverityFilter);
  const setScanType     = useDashboardStore((s) => s.setScanTypeFilter);
  const setTool         = useDashboardStore((s) => s.setToolFilter);
  const setSearchQuery  = useDashboardStore((s) => s.setSearchQuery);
  const setSortOrder    = useDashboardStore((s) => s.setSortOrder);
  const setPageSize     = useDashboardStore((s) => s.setPageSize);
  const loadMorePage    = useDashboardStore((s) => s.loadMorePage);
  const allFindings     = useDashboardStore((s) => s.allFindings);

  // Selected finding for detail panel
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset page + set scan type filter when view mounts; reset tool/search on scan type change
  useEffect(() => {
    setScanType(scanType);
    setTool('all');
    setSearchQuery('');
    return () => {
      setScanType('all');
      setTool('all');
      setSearchQuery('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanType]);

  const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  // Tools available for the current scan type, used to populate the tool filter
  const toolOptions = useMemo(() => {
    const scoped = allFindings.filter((f) => scanType === 'all' || f.type === scanType);
    const tools = Array.from(new Set(scoped.map((f) => f.scanner))).sort();
    return [
      { value: 'all', label: 'All Tools' },
      ...tools.map((t) => ({ value: t, label: t })),
    ];
  }, [allFindings, scanType]);

  const query = searchQuery.trim().toLowerCase();

  const allFiltered = allFindings
    .filter((f) => scanType === 'all' || f.type === scanType)
    .filter((f) => selectedProject === 'all' || f.project === selectedProject)
    .filter((f) => selectedStatus  === 'all' || f.status   === selectedStatus)
    .filter((f) => selectedSeverity === 'all' || f.severity === selectedSeverity)
    .filter((f) => selectedTool === 'all' || f.scanner === selectedTool)
    .filter((f) => {
      if (!query) return true;
      return (
        f.id.toLowerCase().includes(query) ||
        f.vulnerability_id.toLowerCase().includes(query) ||
        f.package_name.toLowerCase().includes(query) ||
        f.vulnerability_type.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.location.toLowerCase().includes(query) ||
        f.scanner.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const diff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      return sortOrder === 'severity-desc' ? diff : -diff;
    });

  // Infinite scroll accumulation
  const visibleCount = currentPage * pageSize;
  const visibleRows  = allFiltered.slice(0, visibleCount);
  const hasMore      = visibleCount < allFiltered.length;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) loadMorePage();
    },
    [hasMore, loadMorePage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
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
    <>
      <section className="findings" aria-label={`${scanType} Vulnerability Findings`}>
        {/* Header */}
        <div className="findings__header">
          <button className="findings__back-btn" onClick={onBack} id="back-to-overview">
            <ChevronLeft size={14} />
            Back to Overview
          </button>
          <div className="findings__title-group">
            <span className="findings__scanner-pill">{scanType === 'all' ? 'ALL' : scanType} · {SCANNER_NAMES[scanType]}</span>
            <h2 className="findings__title">Vulnerability Findings — {scanType === 'all' ? 'All Types' : scanType}</h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="findings__toolbar">
          <div className="findings__filters">
            <SearchInput
              id="findings-search"
              label="Search"
              value={searchQuery}
              placeholder="Search ID, CVE, package, description…"
              onChange={setSearchQuery}
            />
            <FilterDropdown
              id="findings-project-filter"
              label="Project"
              value={selectedProject}
              options={projectOptions}
              onChange={setProject}
            />
            <FilterDropdown
              id="findings-tool-filter"
              label="Tool"
              value={selectedTool}
              options={toolOptions}
              onChange={setTool}
            />
            <FilterDropdown
              id="findings-severity-filter"
              label="Severity"
              value={selectedSeverity}
              options={SEVERITY_OPTIONS}
              onChange={setSeverity}
            />
            <FilterDropdown
              id="findings-status-filter"
              label="Status"
              value={selectedStatus}
              options={STATUS_OPTIONS}
              onChange={setStatus}
            />
            <FilterDropdown
              id="findings-page-size"
              label="Rows per Page"
              value={String(pageSize)}
              options={PAGE_SIZE_OPTIONS}
              onChange={(v) => setPageSize(Number(v))}
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
                <th>
                  <span className="findings__severity-header">
                    SEVERITY
                    <button
                      className="findings__sort-toggle"
                      onClick={() => setSortOrder(sortOrder === 'severity-desc' ? 'severity-asc' : 'severity-desc')}
                      title="Toggle severity sort order"
                      aria-label={`Sort by severity, currently ${sortOrder === 'severity-desc' ? 'high to low' : 'low to high'}`}
                      id="severity-sort-toggle"
                    >
                      {sortOrder === 'severity-desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                    </button>
                  </span>
                </th>
                {scanType === 'all' && <th>CATEGORY</th>}
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
                  <td colSpan={scanType === 'all' ? 10 : 9} className="findings__empty">
                    No vulnerabilities found for the selected filters.
                  </td>
                </tr>
              ) : (
                visibleRows.map((finding) => (
                  <tr
                    key={finding.id}
                    className={`findings__row findings__row--${finding.severity.toLowerCase()}${selectedFinding?.id === finding.id ? ' findings__row--selected' : ''}`}
                    id={`finding-row-${finding.id}`}
                    onClick={() => setSelectedFinding(finding)}
                    title="Click to view full details"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedFinding(finding)}
                    role="button"
                    aria-pressed={selectedFinding?.id === finding.id}
                  >
                    <td>
                      <SeverityBadge severity={finding.severity} showDot />
                    </td>
                    {scanType === 'all' && (
                      <td>
                        <span className={`findings__category-pill findings__category-pill--${finding.type.toLowerCase()}`}>
                          {finding.type}
                        </span>
                      </td>
                    )}
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
                      <span className="findings__description" title={finding.description}>{finding.description}</span>
                      <span className="findings__location" title={finding.location}>{finding.location}</span>
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

        {/* Invisible sentinel */}
        <div ref={sentinelRef} className="findings__scroll-sentinel" aria-hidden="true" />

        {hasMore && (
          <div className="findings__loading-more">
            <Loader2 size={18} className="findings__spinner" />
            <span>Loading more…</span>
          </div>
        )}

        {!hasMore && allFiltered.length > 0 && (
          <div className="findings__end-of-list">
            All {allFiltered.length} findings loaded
          </div>
        )}
      </section>

      {/* Detail panel — outside section so it can be fixed-positioned */}
      <FindingDetailPanel
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </>
  );
}
