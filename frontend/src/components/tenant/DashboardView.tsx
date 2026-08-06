import React from 'react';
import {
  Users, BookOpen, GraduationCap, AlertTriangle, TrendingUp,
  DollarSign, CheckCircle, XCircle, RefreshCw, Clock, ArrowRight,
  UserX, CreditCard, PieChart, ShieldAlert, Award, Heart, UserCheck
} from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

interface DashboardStats {
  totalStudents: number;
  femaleStudents?: number;
  maleStudents?: number;
  totalTeachers: number;
  totalClasses: number;
  totalUsers: number;
  absencesToday: number;
  absencesThisMonth: number;
  attendanceRate: number;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  overdueFeesCount: number;
  collegeStudentsCount?: number;
  lyceeStudentsCount?: number;
  absencesTrend?: { date: string; count: number }[];
  topAbsentStudents?: { studentId: string; firstName: string; lastName: string; className: string; absenceCount: number }[];
  recentPayments?: { id: string; amount: number; method: string; paidAt: string; studentName: string; feeLabel: string }[];
}

const POLL_INTERVAL = 60_000;

const KpiCard: React.FC<{
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: string; trendUp?: boolean;
}> = ({ title, value, sub, icon: Icon, color, trend, trendUp = true }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px',
    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${color}20`; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06, color }}>
      <Icon size={75} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
      <div style={{ backgroundColor: `${color}15`, padding: '9px', borderRadius: '12px', color, border: `1px solid ${color}25` }}>
        <Icon size={18} />
      </div>
      {trend && (
        <span style={{ backgroundColor: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: trendUp ? '#10b981' : '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
          {trend}
        </span>
      )}
    </div>
    <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>{title}</p>
    <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'var(--font-data)' }}>{value}</h3>
    {sub && <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary, #94a3b8)', fontSize: '0.78rem' }}>{sub}</p>}
  </div>
);

export const DashboardView: React.FC = () => {
  const { formatCurrency, countryConfig } = useCountryTheme();
  const { data: stats, loading, error, lastUpdated, refresh } = useRealtime<DashboardStats>(
    '/tenant/dashboard/stats',
    { interval: POLL_INTERVAL }
  );

  // Calcul direct et infaillible des métriques réelles de l'établissement courant
  const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
  const STUDENTS_STORAGE_KEY = `kpsydesk_students_${activeTenantId}`;
  const PAYMENTS_STORAGE_KEY = `kpsydesk_tenant_payments_${activeTenantId}`;
  const USERS_STORAGE_KEY = `kpsydesk_tenant_users_${activeTenantId}`;
  const CLASSES_STORAGE_KEY = `kpsydesk_classes`;

  let localStudents: any[] = [];
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (raw) localStudents = JSON.parse(raw);
  } catch(e) {}

  let localPayments: any[] = [];
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (raw) localPayments = JSON.parse(raw);
  } catch(e) {}

  let localUsers: any[] = [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) localUsers = JSON.parse(raw);
  } catch(e) {}

  let localClasses: any[] = [];
  try {
    const raw = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (raw) localClasses = JSON.parse(raw);
  } catch(e) {}

  // Comptages réels stricts
  const total = stats?.totalStudents || localStudents.length;
  
  const femaleCount = stats?.femaleStudents || localStudents.filter(s => s.gender === 'Féminin' || s.gender === 'F').length;
  const maleCount = stats?.maleStudents || localStudents.filter(s => s.gender === 'Masculin' || s.gender === 'M').length;

  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;
  const malePercent = total > 0 ? (100 - femalePercent) : 0;

  // Répartition Collège / Lycée basée sur les vraies classes des élèves
  const collegeKeywords = ['6', '5', '4', '3', '6ème', '5ème', '4ème', '3ème', 'college', 'collège'];
  const collegeCount = stats?.collegeStudentsCount || localStudents.filter(s => {
    const cName = (s.className || s.classId || '').toLowerCase();
    return collegeKeywords.some(kw => cName.includes(kw));
  }).length;

  const lyceeCount = stats?.lyceeStudentsCount || Math.max(0, total - collegeCount);

  // Professeurs & Finances réels
  const totalTeachers = stats?.totalTeachers || localUsers.filter(u => u.role === 'TEACHER' || u.role === 'PROFESSOR').length;
  const totalClasses = stats?.totalClasses || localClasses.length;
  
  const totalCollected = stats?.totalCollected || localPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpected = stats?.totalExpected || (total * 45000); // Estimation indicative si configuré
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>

      {/* EN-TÊTE DU DASHBOARD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            Tableau de Bord & Analytics — {countryConfig.name} {countryConfig.flag}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Tour de contrôle académique, démographie et finances de l'établissement.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdated && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} /> Mis à jour : {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button
            onClick={refresh}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} /> Statistiques en temps réel basculées sur l'index local.
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 1 : CARTES KPIs CLÉS                                           */}
      {/* --------------------------------------------------------------------- */}
      {/* --------------------------------------------------------------------- */}
      {/* SECTION 1 : KPI STRATÉGIQUES (ACCÈS RAPIDE)                           */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
        <KpiCard title="Effectif Élèves" value={total} sub={`${femaleCount} Filles · ${maleCount} Garçons`} icon={Users} color="#0284c7" />
        <KpiCard title="Professeurs & Staff" value={totalTeachers} sub={`${totalClasses} Classes actives`} icon={GraduationCap} color="#8b5cf6" />
        <KpiCard title="Taux d'Assiduité" value={`${stats?.attendanceRate || 0}%`} sub={`${stats?.absencesToday || 0} absences aujourd'hui`} icon={UserCheck} color="#10b981" />
        <KpiCard title="Recouvrement Scolarité" value={`${collectionRate}%`} sub={`Encaissé : ${formatCurrency(totalCollected)}`} icon={DollarSign} color="#f59e0b" />
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2 : DÉMOGRAPHIE PAR SEXE & CYCLE ACADÉMIQUE                    */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* CARTE 1 : RÉPARTITION PAR SEXE (FILLES VS GARÇONS) */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Démographie & Parité Élèves</h3>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {total > 0 ? `Parité F/G : ${(femaleCount / (maleCount || 1)).toFixed(2)} ♀️` : 'Données Vierges'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Jauge / Barre de progression visuelle */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 700 }}>
                <span style={{ color: '#ec4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ♀️ Filles : {femaleCount} ({femalePercent}%)
                </span>
                <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ♂️ Garçons : {maleCount} ({malePercent}%)
                </span>
              </div>

              {/* BARRE BICOLORE */}
              <div style={{ height: '16px', width: '100%', borderRadius: '8px', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${femalePercent}%`, backgroundColor: '#ec4899', transition: 'width 0.5s' }} title={`Filles : ${femaleCount}`} />
                <div style={{ width: `${malePercent}%`, backgroundColor: '#3b82f6', transition: 'width 0.5s' }} title={`Garçons : ${maleCount}`} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
            <div style={{ backgroundColor: '#fdf2f8', padding: '12px', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.78rem', color: '#be185d', fontWeight: 600 }}>Filles Inscrites</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9d174d' }}>{femaleCount}</div>
            </div>
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>Garçons Inscrits</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af' }}>{maleCount}</div>
            </div>
          </div>
        </div>

        {/* CARTE 2 : RÉPARTITION COLLÈGE VS LYCÉE */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Répartition par Cycle d'Enseignement</h3>
            <span style={{ fontSize: '0.78rem', backgroundColor: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Collège & Lycée
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Premier Cycle (Collège) */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Premier Cycle (Collège)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{collegeCount} Élèves</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classes de 6ème, 5ème, 4ème, 3ème</div>
            </div>

            {/* Second Cycle (Lycée) */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Second Cycle (Lycée)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4A853', margin: '4px 0' }}>{lyceeCount} Élèves</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Séries L1, L2, S1, S2, A, C, D, G</div>
            </div>
          </div>
        </div>

      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 3 : FINANCES & RAPPORTS EN TEMPS RÉEL                         */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Synthèse Financière & Trésorerie Établissement</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>Recettes Encaissées ce Mois</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14532d', marginTop: '4px' }}>{formatCurrency(stats?.totalCollected || 0)}</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 600 }}>Objectif Recouvrement Attendu</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c2d12', marginTop: '4px' }}>{formatCurrency(stats?.totalExpected || 0)}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
