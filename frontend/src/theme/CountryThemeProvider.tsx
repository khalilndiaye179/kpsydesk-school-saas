import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { getCountryConfig, CountryConfig, formatCurrency } from '../config/countries.config';
import { useAuth } from '../auth/AuthContext';

interface CountryThemeContextType {
  countryConfig: CountryConfig;
  countryCode: string;
  formatCurrency: (amount: number) => string;
}

const CountryThemeContext = createContext<CountryThemeContextType | undefined>(undefined);

interface CountryThemeProviderProps {
  children: React.ReactNode;
  overrideCountry?: string;
}

export const CountryThemeProvider: React.FC<CountryThemeProviderProps> = ({ children, overrideCountry }) => {
  const { user } = useAuth();
  
  // Extraire le pays du tenant depuis le context ou fallback sur override/SN
  const countryCode = useMemo(() => {
    if (overrideCountry) return overrideCountry;
    // Si l'utilisateur est connecté et possède un champ country ou si présent dans le localStorage
    const storedTenantCountry = localStorage.getItem('kpsydesk_active_tenant_country');
    return (user as any)?.country || storedTenantCountry || 'SN';
  }, [user, overrideCountry]);

  const countryConfig = useMemo(() => getCountryConfig(countryCode), [countryCode]);

  // Injecter dynamiquement les variables CSS du pays sur :root
  useEffect(() => {
    const root = document.documentElement;
    const { primaryColor, secondaryColor, accentColor, brandColor } = countryConfig.theme;

    root.style.setProperty('--tenant-primary-color', primaryColor);
    root.style.setProperty('--tenant-secondary-color', secondaryColor);
    root.style.setProperty('--tenant-accent-color', accentColor);
    root.style.setProperty('--tenant-brand-color', brandColor);
    root.style.setProperty('--tenant-currency-symbol', countryConfig.currency.symbol);
    root.setAttribute('data-tenant-country', countryConfig.code);
  }, [countryConfig]);

  const value = useMemo(() => ({
    countryConfig,
    countryCode: countryConfig.code,
    formatCurrency: (amount: number) => formatCurrency(amount, countryConfig.code),
  }), [countryConfig]);

  return (
    <CountryThemeContext.Provider value={value}>
      {children}
    </CountryThemeContext.Provider>
  );
};

export const useCountryTheme = () => {
  const context = useContext(CountryThemeContext);
  if (!context) {
    // Si appelé hors du Provider, renvoyer la config par défaut Sénégal sans planter
    const defaultConfig = getCountryConfig('SN');
    return {
      countryConfig: defaultConfig,
      countryCode: 'SN',
      formatCurrency: (amount: number) => formatCurrency(amount, 'SN'),
    };
  }
  return context;
};
