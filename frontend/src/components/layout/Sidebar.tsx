import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  HelpCircle,
  GraduationCap,
  Calendar,
  AlertTriangle,
  FileEdit,
  FileText,
  Settings,
  ShieldCheck,
  Activity,
  MessageSquare,
  CreditCard,
  Menu,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Bus,
  Info,
  BookOpen
} from 'lucide-react';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  isSuperAdmin: boolean;
  currentRole: string;
  activeView: string;
  setActiveView: (val: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  setCollapsed, 
  isSuperAdmin,
  currentRole,
  activeView,
  setActiveView
}) => {
  const { countryConfig } = useCountryTheme();

  const allTenantItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, roles: ['DIRECTOR', 'CENSOR', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER', 'STUDENT', 'PARENT'] },
    { label: 'Structure Pédago.', icon: GraduationCap, roles: ['DIRECTOR', 'CENSOR'] },
    { label: 'Référentiel Académique', icon: BookOpen, roles: ['DIRECTOR', 'CENSOR'] },
    { label: 'Élèves & Inscriptions', icon: Users, roles: ['DIRECTOR', 'CENSOR'] },
    { label: 'Ressources Humaines', icon: ShieldCheck, roles: ['DIRECTOR'] },
    { label: 'Professeurs', icon: Briefcase, roles: ['DIRECTOR', 'CENSOR'] },
    { label: 'Emploi du temps', icon: Calendar, roles: ['DIRECTOR', 'CENSOR', 'TEACHER', 'STUDENT', 'PARENT'] },
    { label: 'Absences & Retards', icon: AlertTriangle, roles: ['DIRECTOR', 'CENSOR', 'TEACHER', 'STUDENT', 'PARENT'] },
    { label: 'Transport Scolaire', icon: Bus, roles: ['DIRECTOR', 'CENSOR', 'DRIVER', 'STUDENT', 'PARENT'] },
    { label: 'Kiosque Pointage', icon: Clock, roles: ['DIRECTOR', 'CENSOR'] },
    { label: 'Évaluations', icon: FileEdit, roles: ['DIRECTOR', 'CENSOR', 'TEACHER'] },
    { label: 'Bulletins', icon: FileText, roles: ['DIRECTOR', 'CENSOR', 'STUDENT', 'PARENT'] },
    { label: 'Communication & Parents', icon: MessageSquare, roles: ['DIRECTOR', 'CENSOR', 'TEACHER'] },
    { label: 'Finance - Comptabilité', icon: DollarSign, roles: ['DIRECTOR', 'ACCOUNTANT'] },
    { label: 'Mon Abonnement', icon: CreditCard, roles: ['DIRECTOR'] },
    { label: 'Guide d\'utilisation', icon: BookOpen, roles: ['DIRECTOR', 'CENSOR', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER', 'STUDENT', 'PARENT'] },
    { label: 'Configuration', icon: Settings, roles: ['DIRECTOR'] },
    { label: 'À Propos', icon: Info, roles: ['DIRECTOR', 'CENSOR', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'DRIVER', 'STUDENT', 'PARENT'] },
  ];

  const menuItems = isSuperAdmin ? [
    { label: 'Tableau de bord', icon: LayoutDashboard },
    { label: 'Gestion Tenants', icon: Users },
    { label: 'Abonnements & Plans', icon: DollarSign },
    { label: 'Activation Modules', icon: ShieldCheck },
    { label: 'Tickets Support', icon: HelpCircle },
    { label: 'Monitoring Technique', icon: Activity },
  ] : allTenantItems.filter(item => item.roles.includes(currentRole));

  // Couleur d'accent dynamique : couleur pays pour les tenants, accent KPSyDesk pour superadmin
  const accentColor = isSuperAdmin ? 'var(--accent)' : countryConfig.theme.primaryColor;

  return (
    <div style={{
      width: collapsed ? '80px' : '260px',
      height: '100vh',
      backgroundColor: 'var(--bg-sidebar)',
      transition: 'width 250ms ease-out',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      borderRight: '1px solid var(--bg-sidebar-active)'
    }}>
      {/* En-tête Sidebar */}
      <div style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid var(--bg-sidebar-active)'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-title)',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              {isSuperAdmin ? 'KPSyAdmin' : 'KPSySchool'}
            </span>
            {/* Drapeau emoji à côté du nom (tenants uniquement) */}
            {!isSuperAdmin && (
              <span style={{ fontSize: '1.15rem' }} title={countryConfig.name}>
                {countryConfig.flag}
              </span>
            )}
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Rôle / Profil en Sidebar */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--bg-sidebar-active)',
          color: '#FFFFFF'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Espace courant</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
            {isSuperAdmin ? 'Console SaaS' : 'Etablissement Démo'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: accentColor,
              color: '#FFFFFF'
            }}>
              {currentRole}
            </span>
            {/* Badge devise (tenants uniquement) */}
            {!isSuperAdmin && (
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: 'rgba(212, 168, 83, 0.2)',
                color: '#D4A853',
              }}>
                {countryConfig.currency.symbol}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Menu principal */}
      <div style={{
        flex: 1,
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          padding: '0 10px',
          marginBottom: '6px',
          textTransform: 'uppercase',
          display: collapsed ? 'none' : 'block'
        }}>
          Menu principal
        </div>

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeView === item.label;
          return (
            <button
              key={idx}
              onClick={() => setActiveView(item.label)}
              className={isActive ? 'glow-active' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#8A8D98',
                transition: 'background-color 200ms ease-out',
                textAlign: 'left'
              }}
            >
              <Icon size={20} style={{ color: isActive ? accentColor : 'inherit' }} />
              {!collapsed && (
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pied de sidebar : mini-badge pays (sidebar non-collapsed, tenants uniquement) */}
      {!collapsed && !isSuperAdmin && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--bg-sidebar-active)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
        }}>
          <span style={{ fontSize: '1rem' }}>{countryConfig.flag}</span>
          <span>{countryConfig.name}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#D4A853' }}>{countryConfig.currency.symbol}</span>
        </div>
      )}
    </div>
  );
};
