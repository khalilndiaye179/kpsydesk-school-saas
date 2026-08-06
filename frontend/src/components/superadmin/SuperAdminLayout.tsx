import React from 'react';
import { LayoutDashboard, Building2, CreditCard, Settings, LogOut, ShieldAlert, Activity, Users, DollarSign, Info, Cpu, Sun, Moon } from 'lucide-react';
import { WatermarkOverlay } from '../shared/WatermarkOverlay';
import { useSuperAdminTheme } from '../../context/SuperAdminThemeContext';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (view: string) => void;
  onLogout: () => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const { theme, toggleTheme, isDark } = useSuperAdminTheme();

  const navItems = [
    { id: 'dashboard', label: 'Vue d\'Ensemble (KPIs)', icon: LayoutDashboard },
    { id: 'fleet', label: 'Parc de Tenants (Écoles)', icon: Building2 },
    { id: 'billing', label: 'Console Financière & Subscriptions', icon: DollarSign },
    { id: 'audit', label: 'Logs d\'Audit & Intégrité', icon: ShieldAlert },
    { id: 'system', label: 'Configuration SaaS', icon: Cpu },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', transition: 'all 0.2s' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo / Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: isDark ? 'white' : '#0f172a', fontFamily: 'var(--font-title)' }}>KPSyDesk SaaS</h2>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700, letterSpacing: '0.5px' }}>CONSOLE SUPERADMIN</span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? (isDark ? '#2563eb' : '#2563eb') : 'transparent',
                    color: isActive ? 'white' : (isDark ? '#cbd5e1' : '#475569'),
                    fontWeight: isActive ? 700 : 500, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={20} color={isActive ? 'white' : (isDark ? '#94a3b8' : '#64748b')} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / User / Theme Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Commutateur de Thème (Light / Dark) */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '10px',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
              color: isDark ? '#38bdf8' : '#0284c7', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? <Moon size={18} color="#38bdf8" /> : <Sun size={18} color="#d97706" />}
              Mode {isDark ? 'Sombre' : 'Clair'}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? 'white' : '#0f172a' }}>
              Basculer
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              SA
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: isDark ? 'white' : '#0f172a' }}>Propriétaire</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>admin@kpsydesk.com</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, justifyContent: 'center' }}
          >
            <LogOut size={18} /> Quitter le mode Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', position: 'relative' }}>
        <WatermarkOverlay color={isDark ? '#D4A853' : '#2563eb'} opacity={isDark ? 0.04 : 0.03} />
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0', color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🛠️ Console de Pilotage SaaS
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
};
