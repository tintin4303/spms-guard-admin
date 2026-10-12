import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowed: string[];
  role?: string;
}

export default function ProtectedRoute({ children, allowed, role }: ProtectedRouteProps) {
  if (!role || !allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
