import { ArrowRight } from 'lucide-react';
import { MetricStat } from './MetricStat';
import { ToolBarChart } from './ToolBarChart';
import type { ToolBar } from './ToolBarChart';
import type { ScanType, Severity } from '../../store/types';
import './ScannerCategoryCard.css';

interface ScannerMeta {
  type: ScanType;
  tagline: string;
  description: string;
  color: string;
  glow: string;
}

const SCANNER_META: Record<ScanType, ScannerMeta> = {
  SCA: {
    type: 'SCA',
    tagline: 'Software Composition Analysis',
    description: 'Open-source dependency CVEs & package manifests',
    color: 'var(--scanner-sca)',
    glow: 'var(--glow-sca)',
  },
  SAST: {
    type: 'SAST',
    tagline: 'Static Application Security Testing',
    description: 'Source-level code flaws, AST syntax & hardcoded secrets',
    color: 'var(--scanner-sast)',
    glow: 'var(--glow-sast)',
  },
  DAST: {
    type: 'DAST',
    tagline: 'Dynamic Application Security Testing',
    description: 'Runtime endpoint fuzzing, injection checks & headers',
    color: 'var(--scanner-dast)',
    glow: 'var(--glow-dast)',
  },
};

// Colors for individual tools within a scan type
const TOOL_BAR_COLORS: Record<string, string> = {
  Trivy:       'var(--scanner-sca)',
  Grype:       '#818cf8',
  Semgrep:     'var(--scanner-sast)',
  SonarQube:   '#c4b5fd',
  Wapiti:      '#fbbf24',
  'OWASP ZAP': 'var(--scanner-dast)',
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
  toolBreakdown: ToolBar[];
  onViewFindings?: (type: ScanType) => void;
  onSeverityClick?: (type: ScanType, severity: Severity) => void;
}

export function ScannerCategoryCard({
  type,
  counts,
  toolBreakdown,
  onViewFindings,
  onSeverityClick,
}: Props) {
  const meta = SCANNER_META[type];

  // Attach colors to bar items
  const coloredBars: ToolBar[] = toolBreakdown.map((b) => ({
    ...b,
    color: TOOL_BAR_COLORS[b.tool] ?? meta.color,
  }));

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
              {toolBreakdown.map((b) => b.tool).join(' · ')}
            </span>
          </div>
          <h3 className="scanner-card__tagline">{meta.tagline}</h3>
          <p className="scanner-card__description">{meta.description}</p>
        </div>
      </div>

      {/* Severity metrics — clickable */}
      <div className="scanner-card__metrics">
        <MetricStat label="TOTAL" value={counts.total} />
        <div className="scanner-card__divider" />
        <MetricStat
          label="CRITICAL"
          value={counts.Critical}
          variant="critical"
          onClick={onSeverityClick ? () => onSeverityClick(type, 'Critical') : undefined}
        />
        <MetricStat
          label="HIGH"
          value={counts.High}
          variant="high"
          onClick={onSeverityClick ? () => onSeverityClick(type, 'High') : undefined}
        />
        <MetricStat
          label="MEDIUM"
          value={counts.Medium}
          variant="medium"
          onClick={onSeverityClick ? () => onSeverityClick(type, 'Medium') : undefined}
        />
        {counts.Low > 0 && (
          <MetricStat
            label="LOW"
            value={counts.Low}
            variant="low"
            onClick={onSeverityClick ? () => onSeverityClick(type, 'Low') : undefined}
          />
        )}
      </div>

      {/* Tool breakdown bar chart */}
      {coloredBars.length > 1 && (
        <ToolBarChart bars={coloredBars} total={counts.total} />
      )}

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
