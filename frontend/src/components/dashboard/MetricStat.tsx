import './MetricStat.css';

interface Props {
  label: string;
  value: number | string;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'default';
}

export function MetricStat({ label, value, variant = 'default' }: Props) {
  return (
    <div className={`metric-stat metric-stat--${variant}`}>
      <span className="metric-stat__value">{value}</span>
      <span className="metric-stat__label">{label}</span>
    </div>
  );
}
