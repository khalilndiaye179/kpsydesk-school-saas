import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Moon, Sun } from 'lucide-react';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

interface TopbarProps {
  title: string;
  userName: string;
  userRole: string;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (val: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  userName,
  userRole,
  isSuperAdmin,
  setIsSuperAdmin
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { countryConfig } = useCountryTheme();

  useEffect(() => {
    // Vérifier s'il y a un thème sauvegardé ou par défaut 'dark'
    const savedTheme = localStorage.getItem('kpsydesk_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark'); // Par défaut
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('kpsydesk_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bandeau drapeau aux couleurs du pays (visible uniquement pour les tenants) */}
      {!isSuperAdmin && (
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${countryConfig.theme.primaryColor} 33%, ${countryConfig.theme.secondaryColor} 33%, ${countryConfig.theme.secondaryColor} 66%, ${countryConfig.theme.accentColor} 66%)`,
        }} />
      )}

      <div style={{
        height: '70px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}>
        {/* Titre + Drapeau pays */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {title}
          </h2>
          {/* Badge drapeau du pays (tenants uniquement) */}
          {!isSuperAdmin && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: `${countryConfig.theme.primaryColor}15`,
              border: `1px solid ${countryConfig.theme.primaryColor}30`,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: countryConfig.theme.primaryColor,
            }}>
              <span style={{ fontSize: '1rem' }}>{countryConfig.flag}</span>
              <span>{countryConfig.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>· {countryConfig.currency.symbol}</span>
            </div>
          )}
        </div>

        {/* Barre de recherche pilule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-page)',
          padding: '8px 16px',
          borderRadius: '30px',
          width: '320px',
          border: '1px solid var(--border)'
        }}>
          <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Recherche globale..." 
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Actions & Profil utilisateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Bouton Thème */}
          <button 
            onClick={toggleTheme}
            title="Basculer le thème"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cloche notification */}
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-negative)',
              borderRadius: '50%'
            }} />
          </button>

          {/* Separateur */}
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />

          {/* Profil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-page)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              <User size={18} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
