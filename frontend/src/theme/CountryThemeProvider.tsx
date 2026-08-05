import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCountryConfig, CountryConfig, formatCurrency } from '../config/countries.config';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';

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
  const { user, isAuthenticated } = useAuth();
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Au montage, si un tenant est connecté, récupérer son pays via l'API settings
  useEffect(() => {
    if (overrideCountry) return;

    // Essayer d'abord le localStorage (cache rapide)
    const cached = localStorage.getItem('kpsydesk_active_tenant_country');
    if (cached) {
      setDetectedCountry(cached);
    }

    // Si l'utilisateur est connecté en tant que tenant, interroger l'API pour obtenir le pays réel
    if (isAuthenticated && user && user.role !== 'SUPER_ADMIN') {
      const token = localStorage.getItem('kpsydesk_access_token');
      if (token) {
        api.get('/tenant/settings', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            const country = res.data?.country;
            if (country) {
              setDetectedCountry(country);
              localStorage.setItem('kpsydesk_active_tenant_country', country);
            }
          })
          .catch(() => {
            // Silencieux — on gardera le fallback SN
          });
      }
    }
  }, [isAuthenticated, user, overrideCountry]);

  const countryCode = useMemo(() => {
    if (overrideCountry) return overrideCountry;
    return detectedCountry || 'SN';
  }, [overrideCountry, detectedCountry]);

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
