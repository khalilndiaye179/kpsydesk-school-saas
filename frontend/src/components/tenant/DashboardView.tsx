import React from 'react';
import {
  Users, BookOpen, GraduationCap, AlertTriangle, TrendingUp,
  DollarSign, CheckCircle, XCircle, RefreshCw, Clock, ArrowRight,
  UserX, CreditCard,
} from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

interface DashboardStats {
  totalStudents: number;
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
  absencesTrend: { date: string; count: number }[];
  topAbsentStudents: { studentId: string; firstName: string; lastName: string; className: string; absenceCount: number }[];
  recentPayments: { id: string; amount: number; method: string; paidAt: string; studentName: string; feeLabel: string }[];
}

const POLL_INTERVAL = 60_000; // 60 secondes pour le dashboard tenant

const KpiCard: React.FC<{
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: string; trendUp?: boolean;
}> = ({ title, value, sub, icon: Icon, color, trend, trendUp = true }) => (
  <div style={{
    backgroundColor: 'var(--bg-card)', padding: '22px', borderRadius: '16px',
    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${color}20`; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06, color }}>
      <Icon size={80} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ backgroundColor: `${color}15`, padding: '10px', borderRadius: '12px', color, border: `1px solid ${color}25` }}>
        <Icon size={20} />
      </div>
      {trend && (
        <span style={{ backgroundColor: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: trendUp ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
          {trend}
        </span>
      )}
    </div>
    <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</p>
    <h3 style={{ margin: 0, fontSize: '1.7rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-data)' }}>{value}</h3>
    {sub && <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary, #94a3b8)', fontSize: '0.78rem' }}>{sub}</p>}
  </div>
);

// formatCfa remplacé par formatCurrency dynamique du hook useCountryTheme

export const DashboardView: React.FC = () => {
  const { formatCurrency } = useCountryTheme();
  const { data: stats, loading, error, lastUpdated, refresh } = useRealtime<DashboardStats>(
    '/tenant/dashboard/stats',
    { interval: POLL_INTERVAL }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Barre d'état en temps réel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
        {lastUpdated && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} />
            Mis à jour : {lastUpdated.toLocaleTimeString('fr-FR')}
          </span>
        )}
        <button
          onClick={refresh}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s' }}
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* SKELETON */}
      {loading && !stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', height: '110px', opacity: 0.5 }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} /> Impossible de charger les statistiques : {error}
        </div>
      )}

      {stats && (
        <>
          {/* KPIs PRINCIPAUX */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
              Vue d'ensemble de l'Établissement
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
              <KpiCard title="Élèves Inscrits" value={stats.totalStudents.toLocaleString('fr-FR')} icon={GraduationCap} color="#6366f1" />
              <KpiCard title="Enseignants" value={stats.totalTeachers} icon={BookOpen} color="#10b981" />
              <KpiCard title="Classes Actives" value={stats.totalClasses} icon={Users} color="#f59e0b" />
              <KpiCard
                title="Taux de Présence"
                value={`${stats.attendanceRate}%`}
                sub={`${stats.absencesToday} absences aujourd'hui`}
                icon={stats.attendanceRate >= 85 ? CheckCircle : AlertTriangle}
                color={stats.attendanceRate >= 85 ? '#10b981' : '#f59e0b'}
                trend={`${stats.absencesToday} abs.`}
                trendUp={stats.absencesToday === 0}
              />
              <KpiCard
                title="Revenus Collectés"
                value={`${(stats.totalCollected / 1000).toFixed(0)}K`}
                sub={`sur ${(stats.totalExpected / 1000).toFixed(0)}K attendus`}
                icon={DollarSign}
                color="#10b981"
                trend={`${stats.collectionRate}%`}
                trendUp={stats.collectionRate >= 70}
              />
              <KpiCard
                title="Frais Impayés"
                value={stats.overdueFeesCount}
                sub="échéances dépassées"
                icon={XCircle}
                color={stats.overdueFeesCount > 0 ? '#ef4444' : '#10b981'}
                trend={stats.overdueFeesCount > 0 ? '⚠ Retard' : '✓ OK'}
                trendUp={stats.overdueFeesCount === 0}
              />
              <KpiCard
                title="Absences ce mois"
                value={stats.absencesThisMonth}
                icon={UserX}
                color="#f43f5e"
              />
              <KpiCard
                title="Personnel Actif"
                value={stats.totalUsers}
                sub="comptes utilisateurs"
                icon={Users}
                color="#8b5cf6"
              />
            </div>
          </div>

          {/* BARRE DE COLLECTE DES FRAIS */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#10b981" /> Collecte des Frais Scolaires
              </h3>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>{stats.collectionRate}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-page, #f1f5f9)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${stats.collectionRate}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '5px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>Collecté : <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.totalCollected)}</strong></span>
              <span>Attendu : <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats.totalExpected)}</strong></span>
              <span>Reste : <strong style={{ color: '#ef4444' }}>{formatCurrency(Math.max(0, stats.totalExpected - stats.totalCollected))}</strong></span>
            </div>
          </div>

          {/* ÉLÈVES ABSENTS + DERNIERS PAIEMENTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Top absents */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserX size={18} color="#f43f5e" /> Élèves les Plus Absents ce Mois
              </h3>
              {stats.topAbsentStudents.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px', fontSize: '0.9rem' }}>
                  <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>Aucune absence enregistrée ce mois !</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.topAbsentStudents.map((s, i) => (
                    <div key={s.studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: i === 0 ? 'rgba(244,63,94,0.08)' : 'var(--bg-page, #f8fafc)', borderRadius: '10px', border: i === 0 ? '1px solid rgba(244,63,94,0.2)' : '1px solid var(--border)' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {s.firstName} {s.lastName}
                        </p>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{s.className}</span>
                      </div>
                      <span style={{ backgroundColor: i === 0 ? '#f43f5e' : '#f59e0b', color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem' }}>
                        {s.absenceCount} abs.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Derniers paiements */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="#10b981" /> Derniers Paiements Enregistrés
              </h3>
              {stats.recentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px', fontSize: '0.9rem' }}>
                  <DollarSign size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>Aucun paiement enregistré.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.recentPayments.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-page, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.studentName}</p>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{p.feeLabel} · {p.method}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>+{p.amount.toLocaleString('fr-FR')}</p>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {new Date(p.paidAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary, #94a3b8)', fontSize: '0.76rem' }}>
            Données actualisées automatiquement toutes les 60 secondes · {lastUpdated?.toLocaleString('fr-FR') ?? '—'}
          </div>
        </>
      )}
    </div>
  );
};
