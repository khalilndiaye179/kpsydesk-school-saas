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

// SuperAdmin
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { TenantsManager } from './components/superadmin/TenantsManager';
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
    <SuperAdminLayout 
      currentView={activeAdminView} 
      onViewChange={setActiveAdminView}
      onLogout={handleLogout}
    >
      {activeAdminView === 'dashboard' && <SuperAdminDashboard />}
      {activeAdminView === 'tenants' && <TenantsManager />}
      {activeAdminView === 'billing' && <SaaSBillingView onConfigureGateways={() => {
        setTargetSettingsTab('PAYMENT');
        setActiveAdminView('settings');
      }} />}
      {activeAdminView === 'finances' && <SuperAdminFinancesView />}
      {activeAdminView === 'audits' && <SuperAdminAuditsView />}
      {activeAdminView === 'collaborators' && <SuperAdminCollaboratorsView />}
      {activeAdminView === 'settings' && <SuperAdminSettingsView initialTab={targetSettingsTab} />}
      {activeAdminView === 'about' && <SuperAdminAboutView />}
    </SuperAdminLayout>
  );
};

const TenantApp = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTenantView, setActiveTenantView] = useState('Tableau de bord'); 
  const [period, setPeriod] = useState('Mensuel');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          {activeTenantView === 'Paramètres' && <SettingsView />}
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
