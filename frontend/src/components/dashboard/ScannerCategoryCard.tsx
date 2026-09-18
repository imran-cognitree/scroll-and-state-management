import { ArrowRight } from 'lucide-react';
import { MetricStat } from './MetricStat';
import type { ScanType } from '../../store/types';
import './ScannerCategoryCard.css';

interface ScannerMeta {
  type: ScanType;
  scanner: string;
  tagline: string;
  description: string;
  color: string;
  glow: string;
}

const SCANNER_META: Record<ScanType, ScannerMeta> = {
  SCA: {
    type: 'SCA',
    scanner: 'Trivy',
    tagline: 'Software Composition Analysis',
    description: 'Open-source dependency CVEs & package manifests',
    color: 'var(--scanner-sca)',
    glow:  'var(--glow-sca)',
  },
  SAST: {
    type: 'SAST',
    scanner: 'Semgrep',
    tagline: 'Static Application Security Testing',
    description: 'Source-level code flaws, AST syntax & hardcoded secrets',
    color: 'var(--scanner-sast)',
    glow:  'var(--glow-sast)',
  },
  DAST: {
    type: 'SAST',
    scanner: 'OWASP ZAP',
    tagline: 'Dynamic Application Security Testing',
    description: 'Runtime endpoint fuzzing, injection checks & headers',
    color: 'var(--scanner-dast)',
    glow:  'var(--glow-dast)',
  },
};

interface Props {
  type: ScanType;
  counts: {
    total: number;
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  onViewFindings?: (type: ScanType) => void;
}

export function ScannerCategoryCard({ type, counts, onViewFindings }: Props) {
  const meta = SCANNER_META[type];

  return (
    <div
      className="scanner-card"
      style={{ '--scanner-color': meta.color, '--scanner-glow': meta.glow } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div className="scanner-card__accent-bar" />

      <div className="scanner-card__header">
        <div className="scanner-card__title-group">
          <div className="scanner-card__type-row">
            <span className="scanner-card__type-pill">{type}</span>
            <span className="scanner-card__scanner-label">
              Scanner: <strong>{meta.scanner}</strong>
            </span>
          </div>
          <h3 className="scanner-card__tagline">{meta.tagline}</h3>
          <p className="scanner-card__description">{meta.description}</p>
        </div>
      </div>

      <div className="scanner-card__metrics">
        <MetricStat label="TOTAL" value={counts.total} />
        <div className="scanner-card__divider" />
        <MetricStat label="CRITICAL" value={counts.Critical} variant="critical" />
        <MetricStat label="HIGH"     value={counts.High}     variant="high" />
        <MetricStat label="MEDIUM"   value={counts.Medium}   variant="medium" />
        {counts.Low > 0 && (
          <MetricStat label="LOW" value={counts.Low} variant="low" />
        )}
      </div>

      <button
        className="scanner-card__cta"
        onClick={() => onViewFindings?.(type)}
        id={`view-${type.toLowerCase()}-findings`}
      >
        View {type} Vulnerabilities
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
