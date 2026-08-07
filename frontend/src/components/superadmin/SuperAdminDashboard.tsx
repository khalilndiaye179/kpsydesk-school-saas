import React from 'react';
import {
  Users, Building2, TrendingUp, Activity, DollarSign, Wallet,
  ShieldCheck, AlertCircle, CreditCard, Target, UserMinus, ArrowRight,
  RefreshCw, GraduationCap, BookOpen, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';

interface GlobalStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  newTenantsThisMonth: number;
  mrrEstimate: number;
  demoTenantsCount?: number;
  demoStudentsCount?: number;
  tenantsByPlan: { plan: string; count: number; monthlyRevenue: number }[];
  countryStats: { code: string; name: string; flag: string; color: string; count: number; perc: number }[];
  updatedAt: string;
}

const POLL_INTERVAL = 30_000; // 30 secondes

const PlanBadge: React.FC<{ plan: string }> = ({ plan }) => {
  const colors: Record<string, string> = {
    TRIAL_7D: '#94a3b8', STANDARD: '#38bdf8', PREMIUM: '#f59e0b', PRO: '#10b981', ENTERPRISE: '#8b5cf6', DEMO: '#a855f7',
  };
  const color = colors[plan] ?? '#94a3b8';
  return (
    <span style={{ backgroundColor: `${color}20`, color, padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${color}40` }}>
      {plan.replace('_', ' ')}
    </span>
  );
};

const KpiCard: React.FC<{
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: string; isDemoBadge?: boolean;
}> = ({ title, value, sub, icon: Icon, color, trend, isDemoBadge }) => (
  <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: `1px solid ${color}30`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06, color }}>
      <Icon size={90} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color, border: '1px solid #334155' }}>
        <Icon size={20} />
      </div>
      {isDemoBadge ? (
        <span style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(168,85,247,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🧪 DEMO
        </span>
      ) : trend && (
        <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
          {trend}
        </span>
      )}
    </div>
    <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.85rem' }}>{title}</p>
    <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'white', fontWeight: 700, fontFamily: 'var(--font-data)' }}>{value}</h3>
    {sub && <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>{sub}</p>}
  </div>
);

export const SuperAdminDashboard: React.FC = () => {
  const { data: stats, loading, error, lastUpdated, refresh } = useRealtime<GlobalStats>(
    '/platform/stats/global',
    { interval: POLL_INTERVAL }
  );

  const formatCfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
  const mrrGoal = 1_500_000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ENTÊTE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Tableau de Bord Global — Zone UEMOA
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Aperçu multi-pays de la plateforme SaaS KPSyDesk School.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdated && (
            <span style={{ color: '#64748b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} />
              Mis à jour : {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button
            onClick={refresh}
            title="Actualiser maintenant"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
          <div style={{ padding: '8px 14px', backgroundColor: error ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', borderRadius: '8px', color: error ? '#ef4444' : '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${error ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, fontWeight: 600 }}>
            <ShieldCheck size={14} />
            {error ? 'Erreur de connexion' : loading && !stats ? 'Chargement...' : 'Systèmes opérationnels'}
          </div>
        </div>
      </div>

      {/* SKELETON LOADER */}
      {loading && !stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', height: '120px', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      )}

      {stats && (
        <>
          {/* KPIs PRINCIPAUX */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
              Indicateurs Clés de la Plateforme (Production)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <KpiCard title="Établissements Actifs" value={stats.activeTenants} sub={`${stats.totalTenants} au total`} icon={Building2} color="#10b981" trend={`+${stats.newTenantsThisMonth} ce mois`} />
              <KpiCard title="En Période d'Essai" value={stats.trialTenants} icon={Clock} color="#f59e0b" />
              <KpiCard title="Suspendus" value={stats.suspendedTenants} icon={XCircle} color="#ef4444" />
              <KpiCard title="Total Élèves Gérés" value={stats.totalStudents.toLocaleString('fr-FR')} icon={GraduationCap} color="#38bdf8" />
              <KpiCard title="Enseignants" value={stats.totalTeachers.toLocaleString('fr-FR')} icon={BookOpen} color="#a78bfa" />
              <KpiCard title="Utilisateurs Plateforme" value={stats.totalUsers.toLocaleString('fr-FR')} icon={Users} color="#34d399" />
              <KpiCard title="Nouveaux ce mois" value={stats.newTenantsThisMonth} sub="établissements" icon={TrendingUp} color="#fb923c" />
              <KpiCard title="MRR Estimé" value={`${(stats.mrrEstimate / 1000).toFixed(0)}K FCFA`} sub="Revenu mensuel récurrent" icon={DollarSign} color="#f59e0b" />
              
              {/* CARTE ÉTABLISSEMENTS DE DÉMO ET TEST À L'ÉCART */}
              <KpiCard
                title="Établissements de Démo"
                value={stats.demoTenantsCount || 0}
                sub={`${(stats.demoStudentsCount || 0).toLocaleString('fr-FR')} élèves de test`}
                icon={Building2}
                color="#c084fc"
                isDemoBadge={true}
              />
            </div>
          </div>

          {/* RÉPARTITION PAR PAYS */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
              Répartition Géographique (Sous-Région UEMOA)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {stats.countryStats.slice(0, 6).map((country) => (
                <div key={country.code} style={{ backgroundColor: '#1e293b', padding: '22px', borderRadius: '16px', border: `1px solid ${country.color}35` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '2rem' }}>{country.flag}</span>
                      <div>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>{country.name}</h4>
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Zone FCFA (XOF)</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: `${country.color}20`, color: country.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, border: `1px solid ${country.color}40` }}>
                      {country.perc}%
                    </span>
                  </div>
                  {/* Barre de progression */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ width: `${country.perc}%`, height: '100%', backgroundColor: country.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                    <div>
                      <p style={{ margin: '0 0 2px 0', color: '#94a3b8', fontSize: '0.78rem' }}>Établissements</p>
                      <h4 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 700 }}>{country.count}</h4>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px 0', color: '#94a3b8', fontSize: '0.78rem' }}>Part de marché</p>
                      <h4 style={{ margin: 0, fontSize: '1.4rem', color: country.color, fontWeight: 700 }}>{country.perc}%</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RÉPARTITION PAR PLAN + OBJECTIF MRR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Plans SaaS */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#38bdf8" /> Répartition par Plan SaaS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats.tenantsByPlan
                  .sort((a, b) => b.count - a.count)
                  .map((p) => (
                    <div key={p.plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <PlanBadge plan={p.plan} />
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden', margin: '0 12px' }}>
                          <div style={{ width: `${stats.totalTenants > 0 ? (p.count / stats.totalTenants) * 100 : 0}%`, height: '100%', backgroundColor: '#38bdf8', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                      <span style={{ color: 'white', fontWeight: 700, minWidth: '30px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>{p.count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Objectif MRR */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#f59e0b" /> Objectif Mensuel Sous-Région
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-data)' }}>
                    {(stats.mrrEstimate / 1_000_000).toFixed(2)}M
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.95rem', marginLeft: '8px' }}>/ 1.50M FCFA</span>
                </div>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.3rem' }}>
                  {Math.min(100, Math.round((stats.mrrEstimate / mrrGoal) * 100))}%
                </span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: '#0f172a', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155', marginBottom: '16px' }}>
                <div style={{ width: `${Math.min(100, (stats.mrrEstimate / mrrGoal) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '6px', transition: 'width 1s ease' }} />
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Encore {Math.max(0, mrrGoal - stats.mrrEstimate).toLocaleString('fr-FR')} FCFA pour atteindre l'objectif.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>ARR Estimé</p>
                  <h4 style={{ margin: 0, color: '#10b981', fontFamily: 'var(--font-data)', fontSize: '1.1rem' }}>
                    {formatCfa(stats.mrrEstimate * 12)}
                  </h4>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.8rem' }}>Taux de conversion</p>
                  <h4 style={{ margin: 0, color: '#38bdf8', fontFamily: 'var(--font-data)', fontSize: '1.1rem' }}>
                    {stats.totalTenants > 0 ? Math.round((stats.activeTenants / stats.totalTenants) * 100) : 0}%
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PIED : Timestamp */}
          <div style={{ textAlign: 'center', color: '#334155', fontSize: '0.78rem' }}>
            Données actualisées automatiquement toutes les 30 secondes · Dernière mise à jour : {lastUpdated?.toLocaleString('fr-FR') ?? '—'}
          </div>
        </>
      )}
    </div>
  );
};
