import type { Status } from '../../store/types';
import './StatusBadge.css';

interface Props {
  status: Status;
}

export function StatusBadge({ status }: Props) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`status-badge status-badge--${key}`}>
      {status}
    </span>
  );
}
