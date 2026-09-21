import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import type { Finding } from '../../store/types';
import './FindingDetailPanel.css';

interface Props {
  finding: Finding | null;
  onClose: () => void;
}

export function FindingDetailPanel({ finding, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!finding) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finding, onClose]);

  if (!finding) return null;

  const formattedJson = JSON.stringify(finding, null, 2);

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
        aria-label={`Finding detail: ${finding.id}`}
        id="finding-detail-panel"
      >
        {/* Header */}
        <div className="detail-panel__header">
          <div className="detail-panel__title-group">
            <span className="detail-panel__id">{finding.id}</span>
            <div className="detail-panel__badges">
              <SeverityBadge severity={finding.severity} showDot />
              <StatusBadge status={finding.status} />
            </div>
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

        {/* Raw JSON */}
        <div className="detail-panel__json-section">
          <div className="detail-panel__json-header">
            <span className="detail-panel__json-title">RAW JSON</span>
            <button
              className="detail-panel__copy-btn"
              onClick={() => navigator.clipboard.writeText(formattedJson)}
              title="Copy JSON"
            >
              <ExternalLink size={12} />
              Copy
            </button>
          </div>
          <pre className="detail-panel__json">
            <code>{formattedJson}</code>
          </pre>
        </div>
      </aside>
    </>
  );
}
