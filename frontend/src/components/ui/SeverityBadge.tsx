import type { Severity } from '../../store/types';
import './SeverityBadge.css';

interface Props {
  severity: Severity;
  showDot?: boolean;
}

export function SeverityBadge({ severity, showDot = false }: Props) {
  return (
    <span className={`severity-badge severity-badge--${severity.toLowerCase()}`}>
      {showDot && severity === 'Critical' && (
        <span className="severity-badge__dot" aria-hidden="true" />
      )}
      {severity.toUpperCase()}
    </span>
  );
}
