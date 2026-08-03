import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'ADMIN' | 'DIRECTOR' | 'TEACHER' | string | null;

interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  tenantId?: string; // Si le user appartient à une école
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si une session existe dans le localStorage (persistance)
    const storedUser = localStorage.getItem('kpsydesk_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('kpsydesk_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kpsydesk_user');
    localStorage.removeItem('kpsydesk_access_token');
    localStorage.removeItem('kpsydesk_active_tenant_id');
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Chargement KPsyDesk...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
