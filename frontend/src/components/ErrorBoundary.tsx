import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <AlertCircle size={32} className="error-boundary__icon" />
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">{this.state.error?.message}</p>
            <button
              className="error-boundary__retry"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// CSS
const errorBoundaryStyles = `
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-canvas);
  padding: var(--space-lg);
}

.error-boundary__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  text-align: center;
  max-width: 400px;
}

.error-boundary__icon {
  color: #ef4444;
}

.error-boundary__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.error-boundary__message {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

.error-boundary__retry {
  font-family: var(--font-body);
  font-size: 13px;
  padding: var(--space-md) var(--space-lg);
  background: #ef4444;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-boundary__retry:hover {
  opacity: 0.9;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = errorBoundaryStyles;
  document.head.appendChild(style);
}
