import React, { useState } from 'react';
import { DollarSign, TrendingDown, FileText, FileSpreadsheet, Plus, Download, Printer, Filter, Building2, CreditCard } from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

interface Quote {
  id: string;
  date: string;
  client: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
}

export const SuperAdminFinancesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'QUOTES' | 'REPORTS'>('TRANSACTIONS');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Données simulées pour la comptabilité du SaaS
  const transactions: Transaction[] = [
    { id: 'TRX-001', date: '2023-10-15', description: 'Abonnement Mensuel - Lycée Excellence', category: 'Revenus SaaS', amount: 150000, type: 'INCOME', status: 'PAID' },
    { id: 'TRX-002', date: '2023-10-14', description: 'Frais Hébergement AWS / Vercel', category: 'Infrastructure', amount: 45000, type: 'EXPENSE', status: 'PAID' },
    { id: 'TRX-003', date: '2023-10-12', description: 'Campagne Facebook Ads (Rentrée)', category: 'Marketing', amount: 75000, type: 'EXPENSE', status: 'PAID' },
    { id: 'TRX-004', date: '2023-10-10', description: 'Abonnement Annuel - Collège Mermoz', category: 'Revenus SaaS', amount: 1200000, type: 'INCOME', status: 'PAID' },
    { id: 'TRX-005', date: '2023-10-05', description: 'Salaires Équipe Dev (Octobre)', category: 'Ressources Humaines', amount: 850000, type: 'EXPENSE', status: 'PENDING' },
  ];

  const quotes: Quote[] = [
    { id: 'DEV-23-01', date: '2023-10-16', client: 'Groupe Scolaire International (Multi-campus)', amount: 4500000, status: 'SENT' },
    { id: 'DEV-23-02', date: '2023-10-10', client: 'Ministère de l\'Éducation (Projet Pilote)', amount: 12500000, status: 'ACCEPTED' },
    { id: 'DEV-23-03', date: '2023-10-02', client: 'Institut Privé La Réussite', amount: 350000, status: 'REJECTED' },
  ];

  const totalIncome = transactions.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': 
      case 'ACCEPTED': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'PENDING': 
      case 'SENT': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'OVERDUE': 
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'DRAFT': return { bg: '#334155', color: '#cbd5e1' };
      default: return { bg: '#334155', color: '#cbd5e1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Finance & Comptabilité Interne
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Gestion des revenus, charges de l'entreprise SaaS, et suivi des devis clients.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <FileSpreadsheet size={18} /> Export CSV
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={18} /> Nouvelle Entrée
          </button>
        </div>
      </div>

      {/* KPIs Financiers du SaaS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: '#10b981' }}><DollarSign size={22} /></div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Chiffre d'Affaires (Encaissé)</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'white', fontFamily: 'var(--font-data)' }}>{totalIncome.toLocaleString('fr-FR')} F</h3>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: '#ef4444' }}><TrendingDown size={22} /></div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Total Charges & Dépenses</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'white', fontFamily: 'var(--font-data)' }}>{totalExpense.toLocaleString('fr-FR')} F</h3>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: balance >= 0 ? '1px solid #10b981' : '1px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', color: balance >= 0 ? '#10b981' : '#ef4444' }}><Building2 size={22} /></div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Résultat Net (Trésorerie)</p>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: balance >= 0 ? '#10b981' : '#ef4444', fontFamily: 'var(--font-data)' }}>{balance.toLocaleString('fr-FR')} F</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <button onClick={() => setActiveTab('TRANSACTIONS')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'TRANSACTIONS' ? '#0f172a' : 'transparent', color: activeTab === 'TRANSACTIONS' ? '#38bdf8' : '#94a3b8', border: activeTab === 'TRANSACTIONS' ? '1px solid #334155' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
          Revenus & Dépenses
        </button>
        <button onClick={() => setActiveTab('QUOTES')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'QUOTES' ? '#0f172a' : 'transparent', color: activeTab === 'QUOTES' ? '#38bdf8' : '#94a3b8', border: activeTab === 'QUOTES' ? '1px solid #334155' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
          Devis (Prospections)
        </button>
        <button onClick={() => setActiveTab('REPORTS')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'REPORTS' ? '#0f172a' : 'transparent', color: activeTab === 'REPORTS' ? '#38bdf8' : '#94a3b8', border: activeTab === 'REPORTS' ? '1px solid #334155' : 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
          Rapports Fiscaux
        </button>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
        
        {activeTab === 'TRANSACTIONS' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Historique des Flux Financiers</h3>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
                <button onClick={() => setFilterType('ALL')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: filterType === 'ALL' ? '#334155' : 'transparent', color: filterType === 'ALL' ? 'white' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Tout</button>
                <button onClick={() => setFilterType('INCOME')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: filterType === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: filterType === 'INCOME' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Revenus</button>
                <button onClick={() => setFilterType('EXPENSE')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: filterType === 'EXPENSE' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: filterType === 'EXPENSE' ? '#ef4444' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Dépenses</button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>ID / Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Description & Catégorie</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <p style={{ margin: '0 0 4px 0', color: 'white', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{t.id}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{t.date}</p>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <p style={{ margin: '0 0 4px 0', color: 'white', fontWeight: 500 }}>{t.description}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{t.category}</p>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: getStatusColor(t.status).bg, color: getStatusColor(t.status).color 
                      }}>{t.status}</span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: t.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} F
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'QUOTES' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Gestion des Devis (Grands Comptes)</h3>
              <button style={{ padding: '8px 16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Nouveau Devis</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>N° Devis</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Client Prospect</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Montant HT</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(q => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px 12px', color: 'white', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{q.id}</td>
                    <td style={{ padding: '16px 12px', color: '#cbd5e1' }}>{q.client}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: getStatusColor(q.status).bg, color: getStatusColor(q.status).color 
                      }}>{q.status}</span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'white' }}>{q.amount.toLocaleString('fr-FR')} F</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}><Printer size={18} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }}><Download size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'REPORTS' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} color="#334155" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Rapports Comptables & Fiscaux</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>Générez le grand livre, le bilan, le compte de résultat et l'état des taxes (TVA) pour la déclaration fiscale de l'entreprise SaaS.</p>
            <button style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Générer la liasse fiscale (PDF)
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
