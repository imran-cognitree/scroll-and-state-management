import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    loginMutation.mutate(
      { username: email, password },
      {
        onSuccess: () => {
          setEmail('');
          setPassword('');
          onLoginSuccess();
        },
        onError: (err) => {
          setError(err.message || 'Login failed');
        },
      },
    );
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box">
            <Shield size={32} className="login-icon" />
          </div>
          <h1 className="login-title">Cognitree APPSEC</h1>
          <p className="login-subtitle">Vulnerability Management Dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <AlertCircle size={16} className="login-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="login-field-group">
            <label htmlFor="email" className="login-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              disabled={loginMutation.isPending}
              aria-invalid={!!error}
            />
          </div>

          <div className="login-field-group">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <div className="login-password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                disabled={loginMutation.isPending}
                aria-invalid={!!error}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '✕' : '○'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <span className="login-spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-demo-hint">
            Use test credentials to explore the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
