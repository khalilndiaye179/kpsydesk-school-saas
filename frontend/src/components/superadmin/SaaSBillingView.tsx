import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, CreditCard, Download, Search, Layers } from 'lucide-react';
import { formatCurrency } from '../../config/countries.config';
import { PaymentProofQueueView } from './PaymentProofQueueView';
import { SaaSAdminManagementView } from './SaaSAdminManagementView';

interface Invoice {
  id: string;
  tenantName: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  plan: string;
}

interface SaaSBillingViewProps {
  onConfigureGateways?: () => void;
}

export const SaaSBillingView: React.FC<SaaSBillingViewProps> = ({ onConfigureGateways }) => {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'MANAGEMENT' | 'HISTORY'>('QUEUE');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [mrr, setMrr] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedInvoices = localStorage.getItem('kpsydesk_saas_invoices');
    if (savedInvoices) {
      let parsed = JSON.parse(savedInvoices);
      // Rétrocompatibilité : remplacer les anciens INV- par FAC-
      parsed = parsed.map((inv: any) => ({
        ...inv,
        id: inv.id.replace('INV-', 'FAC-')
      }));
      setInvoices(parsed);
      calculateMRR(parsed);
      localStorage.setItem('kpsydesk_saas_invoices', JSON.stringify(parsed));
    } else {
      const defaultInvoices: Invoice[] = [
        { id: 'FAC-001', tenantName: "Lycée d'Excellence Birago Diop", amount: 150000, date: '2023-10-01', status: 'PAID', plan: 'ENTERPRISE' },
        { id: 'FAC-002', tenantName: "Institut Supérieur de Management", amount: 150000, date: '2023-10-05', status: 'OVERDUE', plan: 'ENTERPRISE' },
        { id: 'FAC-003', tenantName: "Groupe Scolaire Les Pédagogues", amount: 0, date: '2023-10-10', status: 'PENDING', plan: 'PRO (Essai)' },
        { id: 'FAC-004', tenantName: "Collège Saint-Louis", amount: 50000, date: '2023-10-12', status: 'PAID', plan: 'PRO' },
      ];
      setInvoices(defaultInvoices);
      localStorage.setItem('kpsydesk_saas_invoices', JSON.stringify(defaultInvoices));
      calculateMRR(defaultInvoices);
    }
  }, []);

  const calculateMRR = (invs: Invoice[]) => {
    const total = invs.filter(i => i.status !== 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
    setMrr(total);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> RÉGLÉE</span>;
      case 'PENDING': return <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> EN ESSAI</span>;
      case 'OVERDUE': return <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> EN RETARD</span>;
      default: return null;
    }
  };

  const filteredInvoices = invoices.filter(inv => inv.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Console Financière & Validation SaaS
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Validation des récépissés, gestion dynamique des forfaits et suivi du chiffre d'affaires.
          </p>
        </div>
      </div>

      {/* KPI Financiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { title: 'MRR (Revenu Mensuel)', value: formatCurrency(mrr), trend: '+12%', icon: TrendingUp, color: '#10b981' },
          { title: 'ARR Estimé', value: formatCurrency(mrr * 12), trend: '+12%', icon: DollarSign, color: '#38bdf8' },
          { title: 'Impayés', value: formatCurrency(150000), trend: '-2%', icon: TrendingDown, color: '#ef4444' },
          { title: 'Comptes en Essai', value: '1', trend: '+1', icon: Clock, color: '#f59e0b' },
        ].map((kpi, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: kpi.color }}>
                <kpi.icon size={22} />
              </div>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
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

      {/* Barres d'onglets SuperAdmin */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('QUEUE')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
            border: 'none', backgroundColor: activeTab === 'QUEUE' ? '#2563eb' : '#1e293b',
            color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Clock size={18} /> File d'Attente Récépissés
        </button>
        <button
          onClick={() => setActiveTab('MANAGEMENT')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
            border: 'none', backgroundColor: activeTab === 'MANAGEMENT' ? '#2563eb' : '#1e293b',
            color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Layers size={18} /> Gestion des Plans & Moyens de Règlement
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
            border: 'none', backgroundColor: activeTab === 'HISTORY' ? '#2563eb' : '#1e293b',
            color: 'white', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <CreditCard size={18} /> Historique des Factures
        </button>
      </div>

      {/* CONTENU SELON L'ONGLET SÉLECTIONNÉ */}
      {activeTab === 'QUEUE' && <PaymentProofQueueView />}

      {activeTab === 'MANAGEMENT' && <SaaSAdminManagementView />}

      {activeTab === 'HISTORY' && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', color: 'white', margin: 0 }}>Dernières Factures Émises</h3>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', width: '250px' }}>
              <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="Rechercher une école..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>N° Facture</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Établissement (Tenant)</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Plan</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Montant</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'white' }}>{inv.id}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 500, color: '#cbd5e1' }}>{inv.tenantName}</td>
                    <td style={{ padding: '16px 12px', color: '#94a3b8' }}>{inv.plan}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'white' }}>{inv.amount.toLocaleString('fr-FR')} F</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{getStatusBadge(inv.status)}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => alert(`Génération et téléchargement du PDF pour la facture ${inv.id} en cours...`)}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }} 
                        title="Télécharger la facture"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Aucune facture trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Plans */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px', flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', marginBottom: '24px', color: 'white', margin: '0 0 24px 0' }}>Répartition des Plans</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: 'white' }}>STARTER</span>
                <span style={{ fontFamily: 'var(--font-data)', color: '#94a3b8' }}>0 tenant</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '4px' }}>
                <div style={{ width: '0%', height: '100%', backgroundColor: '#64748b', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: 'white' }}>PRO</span>
                <span style={{ fontFamily: 'var(--font-data)', color: '#94a3b8' }}>2 tenants</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '4px' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#38bdf8', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: 'white' }}>ENTERPRISE</span>
                <span style={{ fontFamily: 'var(--font-data)', color: '#94a3b8' }}>2 tenants</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '4px' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
