import './ToolBarChart.css';

export interface ToolBar {
  tool: string;
  count: number;
  color?: string;
}

interface Props {
  bars: ToolBar[];
  total: number;
}

export function ToolBarChart({ bars, total }: Props) {
  if (total === 0 || bars.length === 0) return null;

  return (
    <div className="tool-bar-chart" aria-label="Tool breakdown chart">
      <span className="tool-bar-chart__label">BY TOOL</span>
      <div className="tool-bar-chart__rows">
        {bars.map((bar) => {
          const pct = total > 0 ? Math.round((bar.count / total) * 100) : 0;
          return (
            <div key={bar.tool} className="tool-bar-chart__row">
              <span className="tool-bar-chart__tool-name">{bar.tool}</span>
              <div className="tool-bar-chart__track">
                <div
                  className="tool-bar-chart__fill"
                  style={{
                    width: `${pct}%`,
                    background: bar.color ?? 'var(--scanner-color)',
                  }}
                  role="progressbar"
                  aria-valuenow={bar.count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label={`${bar.tool}: ${bar.count} findings`}
                />
              </div>
              <span className="tool-bar-chart__count">{bar.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
