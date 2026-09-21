import './MetricStat.css';

interface Props {
  label: string;
  value: number | string;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'default';
  onClick?: () => void;
}

export function MetricStat({ label, value, variant = 'default', onClick }: Props) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={`metric-stat metric-stat--${variant}${onClick ? ' metric-stat--clickable' : ''}`}
      onClick={onClick}
      title={onClick ? `Filter by ${label}` : undefined}
    >
      <span className="metric-stat__value">{value}</span>
      <span className="metric-stat__label">{label}</span>
    </Tag>
  );
}
