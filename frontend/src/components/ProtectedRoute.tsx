import type { ReactNode } from 'react';
import { isLoggedIn } from '../lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  onRedirect: () => void;
}

export function ProtectedRoute({ children, onRedirect }: ProtectedRouteProps) {
  if (!isLoggedIn()) {
    onRedirect();
    return null;
  }

  return <>{children}</>;
}
