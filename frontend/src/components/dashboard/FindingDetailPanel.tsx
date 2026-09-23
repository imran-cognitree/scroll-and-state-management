import { useEffect } from 'react';
import { X, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { useFindingDetail } from '../../hooks/useFindings';
import './FindingDetailPanel.css';

interface Props {
  findingId: string | null;
  onClose: () => void;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="detail-panel__summary" aria-busy="true" aria-label="Loading finding details">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="detail-panel__field">
          <div className="skeleton skeleton--label" style={{ width: 60, height: 11, marginBottom: 4 }} />
          <div className="skeleton skeleton--value" style={{ width: i % 2 === 0 ? 160 : 120, height: 15 }} />
        </div>
      ))}
      <div className="detail-panel__field detail-panel__field--full">
        <div className="skeleton skeleton--label" style={{ width: 80, height: 11, marginBottom: 6 }} />
        <div className="skeleton skeleton--para" style={{ width: '100%', height: 52 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="skeleton skeleton--json" style={{ width: '100%', height: 180 }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function FindingDetailPanel({ findingId, onClose }: Props) {
  const { data: finding, isLoading, isError, refetch } = useFindingDetail(findingId);

  // Close on Escape key
  useEffect(() => {
    if (!findingId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [findingId, onClose]);

  // Lock background scroll while the panel is open
  useEffect(() => {
    if (!findingId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [findingId]);

  if (!findingId) return null;

  // Format the raw_data JSON if available, otherwise fall back to the normalized fields
  const rawJson = finding?.raw_data
    ? JSON.stringify(finding.raw_data, null, 2)
    : finding
      ? JSON.stringify(finding, null, 2)
      : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="detail-panel__overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="detail-panel"
        role="complementary"
        aria-label={`Finding detail: ${findingId}`}
        id="finding-detail-panel"
      >
        {/* Header — always visible even while loading */}
        <div className="detail-panel__header">
          <div className="detail-panel__title-group">
            <span className="detail-panel__id">{findingId}</span>
            {finding && (
              <div className="detail-panel__badges">
                <SeverityBadge severity={finding.severity} showDot />
                <StatusBadge status={finding.status} />
              </div>
            )}
          </div>
          <button
            className="detail-panel__close"
            onClick={onClose}
            aria-label="Close detail panel"
            id="close-detail-panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && <DetailSkeleton />}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="detail-panel__error" role="alert">
            <AlertCircle size={16} />
            <span>Failed to load finding details.</span>
            <button className="detail-panel__retry-btn" onClick={() => refetch()}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* Loaded content */}
        {finding && !isLoading && (
          <>
            {/* Summary fields */}
            <div className="detail-panel__summary">
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">CVE / ID</span>
                <span className="detail-panel__field-value">{finding.vulnerability_id}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Scanner</span>
                <span className="detail-panel__field-value">{finding.scanner}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Package</span>
                <span className="detail-panel__field-value">
                  {finding.package_name} <span className="detail-panel__version">v{finding.installed_version}</span>
                </span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Fixed In</span>
                <span className="detail-panel__field-value detail-panel__fixed">{finding.fixed_version}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Type</span>
                <span className="detail-panel__field-value">{finding.vulnerability_type}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Project</span>
                <span className="detail-panel__field-value">{finding.project}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Location</span>
                <span className="detail-panel__field-value detail-panel__location">{finding.location}</span>
              </div>
              <div className="detail-panel__field">
                <span className="detail-panel__field-label">Detected</span>
                <span className="detail-panel__field-value">
                  {new Date(finding.detected_at).toLocaleString()}
                </span>
              </div>
              <div className="detail-panel__field detail-panel__field--full">
                <span className="detail-panel__field-label">Description</span>
                <p className="detail-panel__description">{finding.description}</p>
              </div>
            </div>

            {/* Raw JSON — real raw_data from backend */}
            {rawJson && (
              <div className="detail-panel__json-section">
                <div className="detail-panel__json-header">
                  <span className="detail-panel__json-title">
                    {finding.raw_data ? 'RAW JSON (Original Report)' : 'RAW JSON'}
                  </span>
                  <button
                    className="detail-panel__copy-btn"
                    onClick={() => navigator.clipboard.writeText(rawJson)}
                    title="Copy JSON"
                  >
                    <ExternalLink size={12} />
                    Copy
                  </button>
                </div>
                <pre className="detail-panel__json">
                  <code>{rawJson}</code>
                </pre>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
