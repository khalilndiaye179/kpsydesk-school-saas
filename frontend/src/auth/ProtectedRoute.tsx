import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'TENANT_ADMIN')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const isSuperAdminRoute = allowedRoles.includes('SUPER_ADMIN');
    const isUserSuperAdmin = user.role === 'SUPER_ADMIN';

    if (isSuperAdminRoute && !isUserSuperAdmin) {
      return <Navigate to="/tenant" replace />;
    }

    if (!isSuperAdminRoute && isUserSuperAdmin) {
      return <Navigate to="/superadmin" replace />;
    }
  }

  return <>{children}</>;
};
