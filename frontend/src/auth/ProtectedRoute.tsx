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

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Si l'utilisateur n'a pas le droit d'accéder à cette route, on le redirige 
    // vers son espace approprié
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/superadmin" replace />;
    } else {
      return <Navigate to="/tenant" replace />;
    }
  }

  return <>{children}</>;
};
