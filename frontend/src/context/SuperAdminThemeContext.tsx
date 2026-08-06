import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface SuperAdminThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const SuperAdminThemeContext = createContext<SuperAdminThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
});

export const SuperAdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('kpsydesk_superadmin_theme') as ThemeMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('kpsydesk_superadmin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <SuperAdminThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </SuperAdminThemeContext.Provider>
  );
};

export const useSuperAdminTheme = () => useContext(SuperAdminThemeContext);
