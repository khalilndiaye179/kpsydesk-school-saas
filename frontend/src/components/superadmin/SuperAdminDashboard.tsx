import React, { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, Activity, BarChart3, DollarSign, Wallet, LineChart, Server, Globe2, MousePointerClick, ShieldCheck, AlertCircle, MapPin, CreditCard, Target, UserMinus, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export const SuperAdminDashboard: React.FC = () => {
  const [mrr, setMrr] = useState(0);
  const [activeTenantsCount, setActiveTenantsCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Calcul de l'Audience depuis l'API réelle
    api.get('/platform/tenants', {
      headers: { Authorization: 'Bearer fake-jwt-token-superadmin' }
    }).then((res) => {
      const tenants = res.data;
      setActiveTenantsCount(tenants.length);
      const students = tenants.reduce((acc: number, curr: any) => acc + (curr.studentsCount || 0), 0);
      setTotalStudents(students);
    }).catch(() => {
      // Fallback si indisponible
      const savedTenants = localStorage.getItem('kpsydesk_superadmin_tenants');
      if (savedTenants) {
        const tenants = JSON.parse(savedTenants);
        setActiveTenantsCount(tenants.length);
      }
    });

    // Calcul Financier
    const savedInvoices = localStorage.getItem('kpsydesk_saas_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const paid = invoices.filter((i: any) => i.status === 'PAID');
      const overdue = invoices.filter((i: any) => i.status === 'OVERDUE');
      
      const totalMrr = paid.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      setMrr(totalMrr);
      
      setOverdueInvoices(overdue);
      // Prendre les 3 dernières factures payées
      setRecentTransactions(paid.slice(-3).reverse());
    }
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Tableau de Bord Global
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Aperçu des performances financières, de l'audience et de la santé de la plateforme SaaS.
          </p>
        </div>
        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
          <ShieldCheck size={16} color="#10b981" /> Tous les systèmes sont opérationnels
        </div>
      </div>

      {/* SECTION 1: KPIs FINANCIERS & COMPTABLES */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Finances & Comptabilité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { title: 'MRR (Revenu Mensuel)', value: `${mrr.toLocaleString('fr-FR')} F`, trend: '+12.5%', icon: TrendingUp, color: '#10b981' },
            { title: 'ARR (Revenu Annuel)', value: `${(mrr * 12).toLocaleString('fr-FR')} F`, trend: '+15.2%', icon: DollarSign, color: '#38bdf8' },
            { title: 'Taux de Churn', value: '0%', trend: '0%', icon: UserMinus, color: '#ef4444' },
            { title: 'Valeur Vie Client (LTV)', value: '450 000 F', trend: '+5%', icon: Wallet, color: '#8b5cf6' },
          ].map((kpi, i) => (
            <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05, color: kpi.color }}>
                <kpi.icon size={100} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: kpi.color, border: '1px solid #334155' }}>
                  <kpi.icon size={22} />
                </div>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: kpi.trend.startsWith('-') && kpi.title !== 'Taux de Churn' ? '#ef4444' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {kpi.trend}
                </span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{kpi.title}</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'white', fontFamily: 'var(--font-data)' }}>{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OBJECTIF MENSUEL & DERNIERES TRANSACTIONS */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Objectif */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '300px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#f59e0b" /> Objectif Mensuel (MRR)
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
            <div>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-data)' }}>{(mrr / 1000000).toFixed(2)}M</span>
              <span style={{ color: '#94a3b8', fontSize: '1rem', marginLeft: '8px' }}>/ 1.50M FCFA</span>
            </div>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.2rem' }}>{Math.min(100, Math.round((mrr / 1500000) * 100))}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#0f172a', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ width: `${Math.min(100, (mrr / 1500000) * 100)}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '6px' }}></div>
          </div>
          <p style={{ margin: '16px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Encore {Math.max(0, 1500000 - mrr).toLocaleString('fr-FR')} F pour atteindre l'objectif.</p>
        </div>

        {/* Dernières Transactions */}
        <div style={{ flex: 2, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#38bdf8" /> Flux des encaissements
            </h3>
            <span style={{ color: '#38bdf8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Voir tout <ArrowRight size={14}/></span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {recentTransactions.length > 0 ? recentTransactions.map((tx, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p style={{ margin: 0, color: 'white', fontWeight: 500 }}>{tx.tenantName}</p>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{tx.date}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>{tx.plan}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: 'white', fontWeight: 600, fontFamily: 'var(--font-data)' }}>+ {tx.amount.toLocaleString('fr-FR')} F</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Aucune transaction récente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: STATISTIQUES USAGE & AUDIENCE */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Audience & Répartition</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Écoles Actives', value: activeTenantsCount.toString(), trend: '+1', icon: Building2, color: '#3b82f6' },
            { title: 'Élèves Gérés au total', value: totalStudents.toLocaleString('fr-FR'), trend: '+15', icon: Users, color: '#8b5cf6' },
            { title: 'Utilisateurs Actifs (DAU)', value: (totalStudents + (activeTenantsCount * 12)).toLocaleString('fr-FR'), trend: '+12%', icon: Globe2, color: '#f59e0b' },
            { title: 'Taux de Conversion', value: '4.8%', trend: '+0.5%', icon: MousePointerClick, color: '#10b981' },
          ].map((kpi, i) => (
            <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: kpi.color, border: '1px solid #334155' }}>
                  <kpi.icon size={22} />
                </div>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: kpi.trend.startsWith('-') ? '#ef4444' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {kpi.trend}
                </span>
              </div>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{kpi.title}</p>
                <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'white', fontFamily: 'var(--font-data)' }}>{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPARTITION GEO & ALERTES */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Géographie */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '300px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#8b5cf6" /> Répartition Géographique
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { region: 'Dakar', count: 28, perc: 66 },
              { region: 'Thiès', count: 8, perc: 19 },
              { region: 'Ziguinchor', count: 4, perc: 10 },
              { region: 'Saint-Louis', count: 2, perc: 5 },
            ].map((reg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', color: '#cbd5e1', fontSize: '0.9rem' }}>{reg.region}</div>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${reg.perc}%`, height: '100%', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{reg.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes & Monitoring */}
        <div style={{ flex: 1.5, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #ef4444', minWidth: '400px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#ef4444" /> Alertes & Actions Requises
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {overdueInvoices.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <AlertCircle size={20} color="#ef4444" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>{overdueInvoices.length} Facture(s) impayée(s)</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{overdueInvoices[0].tenantName} {overdueInvoices.length > 1 ? `et ${overdueInvoices.length - 1} autre(s) école(s)` : ''} en retard de paiement.</p>
                  <button style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Relancer par email</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <Server size={20} color="#f59e0b" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>Mise à jour serveur requise</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Le cluster Base de données a atteint 85% d'utilisation CPU cette nuit.</p>
                <button style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Voir les logs</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Graphique MRR */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '400px', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#38bdf8" /> Croissance du MRR (6 derniers mois)
          </h3>
          <div style={{ height: '240px', borderBottom: '1px solid #334155', borderLeft: '1px solid #334155', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', position: 'relative' }}>
            {[30, 45, 50, 70, 85, 100].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                <div style={{ width: '100%', height: `${h}%`, backgroundColor: '#38bdf8', borderRadius: '4px 4px 0 0', opacity: 0.9, transition: 'height 0.5s' }}></div>
                <span style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>Mois {i+1}</span>
              </div>
            ))}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #475569', zIndex: 0 }}></div>
          </div>
        </div>

        {/* Graphique Visites & DAU */}
        <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '400px', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={20} color="#10b981" /> Visites & Trafic Serveur
          </h3>
          <div style={{ height: '240px', borderBottom: '1px solid #334155', borderLeft: '1px solid #334155', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', position: 'relative' }}>
            {/* Ligne simulée par des points connectés */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <polyline fill="none" stroke="#10b981" strokeWidth="3" points="20,200 100,180 180,120 260,150 340,80 420,40" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ position: 'absolute', bottom: '-25px', display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 40px)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lun</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mar</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mer</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Jeu</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ven</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sam</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
