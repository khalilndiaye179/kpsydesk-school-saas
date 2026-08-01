import React from 'react';
import { LayoutDashboard, Building2, CreditCard, Settings, LogOut, ShieldAlert, Activity, Users, DollarSign, Info } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children, currentView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'tenants', label: 'Écoles (Tenants)', icon: Building2 },
    { id: 'billing', label: 'Abonnements', icon: CreditCard },
    { id: 'finances', label: 'Finance & Compta', icon: DollarSign },
    { id: 'audits', label: 'Audits & Traçabilité', icon: Activity },
    { id: 'collaborators', label: 'Collaborateurs', icon: Users },
    { id: 'settings', label: 'Paramètres Globaux', icon: Settings },
    { id: 'about', label: 'À Propos', icon: Info },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'var(--font-main)' }}>
      {/* Sidebar Super-Admin */}
      <aside style={{ width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#ef4444', padding: '8px', borderRadius: '10px', color: 'white' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-title)', margin: 0, color: 'white' }}>KPsyDesk</h1>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Super Admin</span>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px',
                border: 'none', backgroundColor: currentView === item.id ? '#334155' : 'transparent',
                color: currentView === item.id ? 'white' : '#94a3b8', cursor: 'pointer',
                fontWeight: currentView === item.id ? 600 : 500, transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <item.icon size={20} color={currentView === item.id ? '#38bdf8' : 'currentColor'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 8px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f172a', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold' }}>
              SA
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Propriétaire</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>admin@kpsydesk.com</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, justifyContent: 'center' }}
          >
            <LogOut size={18} /> Quitter le mode Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #334155' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0', color: '#f8fafc', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🛠️ Console de Pilotage SaaS
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
};
