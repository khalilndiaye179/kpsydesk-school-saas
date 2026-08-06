import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { CardKPI } from './components/shared/CardKPI';
import { PillSwitcher } from './components/shared/PillSwitcher';
import { StructureView } from './components/tenant/StructureView';
import { StudentView } from './components/tenant/StudentView';
import { TimetableView } from './components/tenant/TimetableView';
import { EvaluationsView } from './components/tenant/EvaluationsView';
import { AttendanceView } from './components/tenant/AttendanceView';
import { ReportCardsView } from './components/tenant/ReportCardsView';
import { FinancesView } from './components/tenant/FinancesView';
import { CommunicationView } from './components/tenant/CommunicationView';
import { SettingsView } from './components/tenant/SettingsView';
import { TeacherView } from './components/tenant/TeacherView';
import { HRView } from './components/tenant/HRView';
import { TransportView } from './components/tenant/TransportView';
import { DashboardView } from './components/tenant/DashboardView';
import { KioskView } from './components/tenant/KioskView';
import { TenantAboutView } from './components/tenant/TenantAboutView';
import { TenantBillingView } from './components/tenant/TenantBillingView';
import { TenantGuideView } from './components/tenant/TenantGuideView';
import { AcademicSettingsView } from './components/tenant/AcademicSettingsView';
import { WatermarkOverlay } from './components/shared/WatermarkOverlay';
import { MaintenanceOverlay } from './components/common/MaintenanceOverlay';

// SuperAdmin
import { SuperAdminThemeProvider } from './context/SuperAdminThemeContext';
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { FleetView } from './components/superadmin/FleetView';
import { SaaSBillingView } from './components/superadmin/SaaSBillingView';
import { SuperAdminSettingsView } from './components/superadmin/SuperAdminSettingsView';
import { SuperAdminAuditsView } from './components/superadmin/SuperAdminAuditsView';
import { SuperAdminCollaboratorsView } from './components/superadmin/SuperAdminCollaboratorsView';
import { SuperAdminFinancesView } from './components/superadmin/SuperAdminFinancesView';
import { SuperAdminAboutView } from './components/superadmin/SuperAdminAboutView';

// Auth
import { LoginView } from './auth/LoginView';
import { ActivateAccountPage } from './auth/ActivateAccountPage';
import { MfaEnrollmentPage } from './auth/MfaEnrollmentPage';
import { TenantSignupWizard } from './signup/TenantSignupWizard';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';

import { Users, TrendingUp, CheckCircle, GraduationCap } from 'lucide-react';

const SuperAdminApp = () => {
  const [activeAdminView, setActiveAdminView] = useState('dashboard');
  const [targetSettingsTab, setTargetSettingsTab] = useState<'GENERAL' | 'SMTP' | 'PAYMENT' | 'SECURITY'>('GENERAL');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SuperAdminThemeProvider>
      <SuperAdminLayout 
        activeTab={activeAdminView} 
        onTabChange={setActiveAdminView}
        onLogout={handleLogout}
      >
        {activeAdminView === 'dashboard' && <SuperAdminDashboard />}
        {activeAdminView === 'fleet' && <FleetView />}
        {activeAdminView === 'tenants' && <FleetView />}
        {activeAdminView === 'billing' && <SaaSBillingView onConfigureGateways={() => {
          setTargetSettingsTab('PAYMENT');
          setActiveAdminView('settings');
        }} />}
        {activeAdminView === 'finances' && <SuperAdminFinancesView />}
        {activeAdminView === 'audits' && <SuperAdminAuditsView />}
        {activeAdminView === 'audit' && <SuperAdminAuditsView />}
        {activeAdminView === 'collaborators' && <SuperAdminCollaboratorsView />}
        {activeAdminView === 'settings' && <SuperAdminSettingsView initialTab={targetSettingsTab} />}
        {activeAdminView === 'system' && <SuperAdminSettingsView initialTab={targetSettingsTab} />}
        {activeAdminView === 'about' && <SuperAdminAboutView />}
      </SuperAdminLayout>
    </SuperAdminThemeProvider>
  );
};

const TenantApp = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTenantView, setActiveTenantView] = useState('Tableau de bord'); 
  const [period, setPeriod] = useState('Mensuel');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Écoute réactive du Mode Maintenance Globale
  useEffect(() => {
    const checkMaintenance = () => {
      api.get('/platform/system-config')
        .then((res) => {
          if (res.data?.maintenanceMode && user?.role !== 'SUPER_ADMIN') {
            setIsMaintenance(true);
            setMaintenanceMsg(res.data.maintenanceMessage);
            logout(); // Déconnexion automatique des établissements
          } else {
            setIsMaintenance(false);
          }
        })
        .catch((err) => {
          if (err?.response?.status === 503 && user?.role !== 'SUPER_ADMIN') {
            setIsMaintenance(true);
            setMaintenanceMsg(err?.response?.data?.message || 'Maintenance planifiée.');
            logout();
          }
        });
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 10000);
    return () => clearInterval(interval);
  }, [user, logout]);

  if (isMaintenance && user?.role !== 'SUPER_ADMIN') {
    return <MaintenanceOverlay message={maintenanceMsg} onRefresh={() => window.location.reload()} />;
  }

  // Purge unique des anciennes données de démo conservées dans le localStorage du navigateur
  React.useEffect(() => {
    try {
      const isPurged = localStorage.getItem('kpsydesk_demo_purged_v2');
      if (!isPurged) {
        Object.keys(localStorage).forEach(key => {
          if (
            key.startsWith('kpsydesk_tenant_payments_') ||
            key.startsWith('kpsydesk_tenant_expenses_') ||
            key.startsWith('kpsydesk_tenant_salaries_') ||
            key.startsWith('kpsydesk_tenant_closures_')
          ) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('kpsydesk_demo_purged_v2', 'true');
      }
    } catch(e) {}
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        isSuperAdmin={false}
        currentRole={user?.role === 'TENANT_ADMIN' ? 'DIRECTOR' : (user?.role || 'DIRECTOR')}
        activeView={activeTenantView}
        setActiveView={setActiveTenantView}
      />
      <div style={{
        flex: 1, marginLeft: collapsed ? '80px' : '260px',
        transition: 'margin-left 250ms ease-out', display: 'flex', flexDirection: 'column'
      }}>
        <Topbar 
          title={activeTenantView} userName={user?.name || 'Directeur'} userRole="Directeur d'Établissement"
          isSuperAdmin={false} setIsSuperAdmin={() => {}}
        />
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          <WatermarkOverlay color="#D4A853" opacity={0.04} />
          
          <div style={{ position: 'absolute', top: '20px', right: '40px', opacity: 0.06, pointerEvents: 'none', color: 'var(--accent)' }}>
            <GraduationCap size={160} strokeWidth={1} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Bonjour, {user?.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>État actuel de votre établissement aujourd'hui.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <PillSwitcher options={['Hebdo', 'Mensuel', 'Annuel']} activeOption={period} onChange={setPeriod} />
              <button onClick={handleLogout} style={{ backgroundColor: 'var(--status-negative)', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Déconnexion
              </button>
            </div>
          </div>

          {activeTenantView === 'Tableau de bord' && <DashboardView />}
          {activeTenantView === 'Structure Pédago.' && <StructureView />}
          {activeTenantView === 'Référentiel Académique' && <AcademicSettingsView />}
          {activeTenantView === 'Élèves & Inscriptions' && <StudentView />}
          {activeTenantView === 'Ressources Humaines' && <HRView />}
          {activeTenantView === 'Professeurs' && <TeacherView />}
          {activeTenantView === 'Emploi du temps' && <TimetableView />}
          {activeTenantView === 'Absences & Retards' && <AttendanceView />}
          {activeTenantView === 'Transport Scolaire' && <TransportView />}
          {activeTenantView === 'Évaluations' && <EvaluationsView />}
          {activeTenantView === 'Bulletins' && <ReportCardsView />}
          {activeTenantView === 'Communication & Parents' && <CommunicationView />}
          {activeTenantView === 'Kiosque Pointage' && <KioskView />}
          {activeTenantView === 'Finance - Comptabilité' && <FinancesView />}
          {activeTenantView === 'Mon Abonnement' && <TenantBillingView />}
          {activeTenantView === 'Guide d\'utilisation' && <TenantGuideView />}
          {(activeTenantView === 'Paramètres' || activeTenantView === 'Configuration') && <SettingsView />}
          {activeTenantView === 'À Propos' && <TenantAboutView />}

        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<TenantSignupWizard />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />
      <Route path="/mfa-enrollment" element={<MfaEnrollmentPage />} />
      <Route 
        path="/superadmin/*" 
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminApp />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tenant/*" 
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
            <TenantApp />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
