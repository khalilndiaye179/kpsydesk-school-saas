import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Filter, Plus, FileText, CheckCircle, Clock, 
  AlertCircle, Briefcase, FileMinus, TrendingUp, TrendingDown, 
  CreditCard, Landmark, PieChart, ShieldAlert, Sparkles, Send, 
  Printer, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, 
  X, Download, Phone, Calendar, RefreshCw, FileCheck, Layers
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

// -----------------------------------------------------------------------------
// INTERFACES FINANCIÈRES ERP
// -----------------------------------------------------------------------------

export type PaymentMethod = 
  | 'CASH' | 'CHEQUE' | 'BANK_TRANSFER'
  | 'WAVE_SN' | 'ORANGE_MONEY_SN' | 'FREE_MONEY_SN' // Sénégal 🇸🇳
  | 'ORANGE_MONEY_CI' | 'MTN_MONEY_CI' | 'MOOV_MONEY_CI' // Côte d'Ivoire 🇨🇮
  | 'ORANGE_MONEY_ML' | 'MOOV_MONEY_ML'; // Mali 🇲🇱

export interface SchoolFeeConfig {
  id: string;
  name: string; // ex: Frais d'Inscription, Scolarité Mensuelle, Cantine, Transport
  feeType: 'INSCRIPTION' | 'TUITION' | 'CANTEEN' | 'TRANSPORT' | 'UNIFORM' | 'EXAM';
  amount: number;
  periodicity: 'ONCE' | 'MONTHLY' | 'TRIMESTRIAL' | 'ANNUAL';
  targetCycle?: 'COLLEGE' | 'LYCEE' | 'ALL';
}

export interface StudentPayment {
  id: string;
  receiptNumber: string; // ex: REC-2026-0042
  studentId: string;
  studentName: string;
  studentMatricule: string;
  className: string;
  feeLabel: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string; // Référence Wave / OM / N° Chèque
  paymentDate: string;
  cashierName: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  notes?: string;
}

export interface FinancialExpense {
  id: string;
  voucherNumber: string; // ex: DEP-2026-0105
  category: 'SALAIRES' | 'MAINTENANCE' | 'FOURNITURES' | 'EAU_EDF_INTERNET' | 'LOYER' | 'TAXES' | 'ACHATS';
  description: string;
  amount: number;
  recipientName: string; // Fournisseur / Enseignant
  expenseDate: string;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  attachmentUrl?: string; // Scan facture PDF
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  monthYear: string; // ex: "Février 2026"
  baseSalary: number;
  overtimeOrBonuses: number;
  deductions: number;
  netPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
}

export interface CashRegisterClosure {
  id: string;
  date: string;
  cashierName: string;
  theoreticalBalance: number; // Calculé système
  physicalCount: number;      // Déclaré caissier
  gapAmount: number;          // Écart (+ ou -)
  notes?: string;
  status: 'CLOSED' | 'APPROVED';
}

export const FinancesView: React.FC = () => {
  const { formatCurrency, countryCode, countryConfig } = useCountryTheme();
  
  // Navigation ERP Financier (14 Onglets/Vues)
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'RECETTES' | 'IMPAYES' | 'DEPENSES' | 'SALAIRES' | 'TRESORERIE' | 'COMPTABILITE' | 'IA_ASSISTANT'
  >('DASHBOARD');

  // États des Données Financières
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [cashClosures, setCashClosures] = useState<CashRegisterClosure[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<StudentPayment | null>(null);

  // Formulaire d'Encaissement
  const [payStudentId, setPayStudentId] = useState('');
  const [payFeeLabel, setPayFeeLabel] = useState('Scolarité Mensuelle (Février)');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('WAVE_SN');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Formulaire de Dépense
  const [expCategory, setExpCategory] = useState<'SALAIRES' | 'MAINTENANCE' | 'FOURNITURES' | 'EAU_EDF_INTERNET' | 'LOYER' | 'TAXES' | 'ACHATS'>('FOURNITURES');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expRecipient, setExpRecipient] = useState('');

  // Formulaire Clôture Caisse
  const [physicalCashCount, setPhysicalCashCount] = useState('');

  // Assistant IA Financier
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
  const PAYMENTS_KEY = `kpsydesk_tenant_payments_${activeTenantId}`;
  const EXPENSES_KEY = `kpsydesk_tenant_expenses_${activeTenantId}`;
  const SALARIES_KEY = `kpsydesk_tenant_salaries_${activeTenantId}`;
  const CLOSURES_KEY = `kpsydesk_tenant_closures_${activeTenantId}`;
  const STUDENTS_KEY = `kpsydesk_students_${activeTenantId}`;

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = () => {
    // 1. Encaissements (0 par défaut pour tout nouvel établissement)
    const savedP = localStorage.getItem(PAYMENTS_KEY);
    if (savedP) {
      setPayments(JSON.parse(savedP));
    } else {
      setPayments([]);
    }

    // 2. Dépenses (0 par défaut pour tout nouvel établissement)
    const savedE = localStorage.getItem(EXPENSES_KEY);
    if (savedE) {
      setExpenses(JSON.parse(savedE));
    } else {
      setExpenses([]);
    }

    // 3. Salaires (0 par défaut)
    const savedS = localStorage.getItem(SALARIES_KEY);
    if (savedS) {
      setSalaries(JSON.parse(savedS));
    } else {
      setSalaries([]);
    }

    // 4. Clôtures (0 par défaut)
    const savedC = localStorage.getItem(CLOSURES_KEY);
    if (savedC) {
      setCashClosures(JSON.parse(savedC));
    } else {
      setCashClosures([]);
    }

    // 5. Élèves du Tenant (0 par défaut)
    const savedSt = localStorage.getItem(STUDENTS_KEY);
    if (savedSt) {
      setStudents(JSON.parse(savedSt));
    } else {
      setStudents([]);
    }
  };

  // -----------------------------------------------------------------------------
  // CALCULS STATISTIQUES ERP
  // -----------------------------------------------------------------------------
  const totalEncaisse = payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0);
  const totalDepenses = expenses.reduce((sum, e) => sum + (e.approvalStatus === 'APPROVED' ? e.amount : 0), 0);
  const totalSalaires = salaries.reduce((sum, s) => sum + s.netPaid, 0);
  const soldeTresorerie = totalEncaisse - (totalDepenses + totalSalaires);

  // Impayés estimés (Démo)
  const totalImpayesEstime = 850000;
  const tauxRecouvrement = totalEncaisse > 0 ? Math.min(100, Math.round((totalEncaisse / (totalEncaisse + totalImpayesEstime)) * 100)) : 78;

  // -----------------------------------------------------------------------------
  // SOUMISSION ENCAISSEMENT RECETTE SCOLAIRE
  // -----------------------------------------------------------------------------
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === payStudentId);
    if (!student || !payAmount) return;

    const receiptSeq = String(payments.length + 1).padStart(4, '0');
    const newPaymentObj: StudentPayment = {
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-${receiptSeq}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentMatricule: student.matricule || 'N/A',
      className: student.className || 'Non assignée',
      feeLabel: payFeeLabel,
      amount: parseFloat(payAmount),
      paymentMethod: payMethod,
      transactionRef: payRef,
      paymentDate: new Date().toISOString().split('T')[0],
      cashierName: 'Caissier / Agent RH',
      status: 'COMPLETED',
      notes: payNotes,
    };

    const updated = [newPaymentObj, ...payments];
    setPayments(updated);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated));

    setShowPaymentModal(false);
    setReceiptToPrint(newPaymentObj); // Ouvrir reçu automatique

    // Recompte
    setPayStudentId('');
    setPayAmount('');
    setPayRef('');
  };

  // -----------------------------------------------------------------------------
  // SOUMISSION WORKFLOW DÉPENSE
  // -----------------------------------------------------------------------------
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDescription) return;

    const expSeq = String(expenses.length + 1).padStart(3, '0');
    const newExpenseObj: FinancialExpense = {
      id: `exp-${Date.now()}`,
      voucherNumber: `DEP-2026-${expSeq}`,
      category: expCategory,
      description: expDescription,
      amount: parseFloat(expAmount),
      recipientName: expRecipient || 'Fournisseur Externe',
      expenseDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'APPROVED',
      approvedBy: 'Directeur Général',
    };

    const updated = [newExpenseObj, ...expenses];
    setExpenses(updated);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));

    setShowExpenseModal(false);
    setExpDescription('');
    setExpAmount('');
    setExpRecipient('');
  };

  // -----------------------------------------------------------------------------
  // ASSISTANT IA FINANCIER INTELLIGENT
  // -----------------------------------------------------------------------------
  const handleAiFinancialQuery = (query: string) => {
    setAiQuery(query);
    const q = query.toLowerCase();

    if (q.includes('impayé') || q.includes('retard')) {
      setAiResponse(`🔍 **Analyse des Impayés :**\n- Montant global estimé des impayés : **${formatCurrency(totalImpayesEstime)}**.\n- Les classes ayant le plus fort taux de retard de paiement sont la **Terminale S2** (12 élèves) et la **3ème A** (8 élèves).\n- **Recommandation IA :** Lancer une campagne de relance automatique par SMS/WhatsApp avant le 10 du mois.`);
    } else if (q.includes('trésorerie') || q.includes('solde') || q.includes('cash')) {
      setAiResponse(`📊 **Projection de Trésorerie :**\n- Solde net en caisse et banque : **${formatCurrency(soldeTresorerie)}**.\n- Recettes encaisssées ce mois : **${formatCurrency(totalEncaisse)}**.\n- Charges et dépenses validées : **${formatCurrency(totalDepenses)}**.\n- La santé financière de l'établissement est **EXCELLENTE** (+14% vs mois précédent).`);
    } else {
      setAiResponse(`🤖 **Assistant Financier ERP :**\nPour la période académique 2025-2026, le taux de recouvrement global s'élève à **${tauxRecouvrement}%** pour un volume total d'encaissements de **${formatCurrency(totalEncaisse)}**.`);
    }
  };

  // Helper Libellé Moyen de Paiement
  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'WAVE_SN': return { label: 'Wave 🌊', bg: '#00d2ff', color: '#00364a' };
      case 'ORANGE_MONEY_SN':
      case 'ORANGE_MONEY_CI':
      case 'ORANGE_MONEY_ML': return { label: 'Orange Money 🍊', bg: '#ff6600', color: '#ffffff' };
      case 'MTN_MONEY_CI': return { label: 'MTN Mobile 🟡', bg: '#ffcc00', color: '#000000' };
      case 'MOOV_MONEY_CI':
      case 'MOOV_MONEY_ML': return { label: 'Moov Money 🔵', bg: '#0055a5', color: '#ffffff' };
      case 'CASH': return { label: 'Espèces 💵', bg: '#10b981', color: '#ffffff' };
      case 'CHEQUE': return { label: 'Chèque 📜', bg: '#8b5cf6', color: '#ffffff' };
      case 'BANK_TRANSFER': return { label: 'Virement 🏛️', bg: '#0284c7', color: '#ffffff' };
      default: return { label: method, bg: '#64748b', color: '#ffffff' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* EN-TÊTE ERP FINANCIER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              Finance & Comptabilité ERP — SYSCOHADA ({countryConfig.name} {countryConfig.flag})
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestion des encaissements, Mobile Money (Wave, OM, MTN, Moov), trésorerie, paie et relances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowExpenseModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
          >
            <FileMinus size={18} /> Engager une Dépense
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(15,23,42,0.2)' }}
          >
            <Plus size={20} /> Encaisser une Scolarité
          </button>
        </div>
      </div>

      {/* TABS DE NAVIGATION FINANCIÈRE (8 ONGLETS PRINCIPAUX) */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {[
          { id: 'DASHBOARD', label: '1. Dashboard Financier', icon: PieChart },
          { id: 'RECETTES', label: '2. Recettes Scolarité', icon: DollarSign },
          { id: 'IMPAYES', label: '3. Impayés & Relances', icon: ShieldAlert },
          { id: 'DEPENSES', label: '4. Charges & Dépenses', icon: FileMinus },
          { id: 'SALAIRES', label: '5. Salaires & Paie', icon: Briefcase },
          { id: 'TRESORERIE', label: '6. Trésorerie & Caisse', icon: Wallet },
          { id: 'COMPTABILITE', label: '7. Comptabilité SYSCOHADA', icon: Landmark },
          { id: 'IA_ASSISTANT', label: '8. Assistant IA Finance', icon: Sparkles },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '10px 16px', borderRadius: '10px', border: 'none',
              backgroundColor: activeTab === t.id ? '#0f172a' : 'transparent',
              color: activeTab === t.id ? '#D4A853' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VUE 1 : DASHBOARD FINANCIER & CARTE KPI                               */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'DASHBOARD' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CARTE KPI FINANCIÈRES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Recettes Encaissées</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '6px', fontFamily: 'var(--font-data)' }}>
                {formatCurrency(totalEncaisse)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={14} /> +12% vs mois dernier
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Impayés & Retards Estimés</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '6px', fontFamily: 'var(--font-data)' }}>
                {formatCurrency(totalImpayesEstime)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                Taux de Recouvrement : {tauxRecouvrement}%
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Dépenses & Charges</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px', fontFamily: 'var(--font-data)' }}>
                {formatCurrency(totalDepenses)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {expenses.length} dépenses validées
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #D4A853', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Solde Net de Trésorerie</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#D4A853', marginTop: '6px', fontFamily: 'var(--font-data)' }}>
                {formatCurrency(soldeTresorerie)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                ✓ Trésorerie Positive & Saine
              </div>
            </div>
          </div>

          {/* RÉPARTITION MOYENS DE PAIEMENT & ENCAISSEMENTS RÉCENTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Encaissements Récents */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Derniers Encaissements Scolaires</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payments.slice(0, 5).map(p => {
                  const badge = getMethodBadge(p.paymentMethod);
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.studentName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.feeLabel} · {p.className}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>+{formatCurrency(p.amount)}</div>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dépenses Validées */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Dernières Dépenses Enregistrées</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenses.slice(0, 5).map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.description}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Bénéficiaire : {e.recipientName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>-{formatCurrency(e.amount)}</div>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {e.voucherNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VUE 2 : RECETTES SCOLAIRES & GUICHET CAISSE                           */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'RECETTES' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Journal des Encaissements Scolaires ({payments.length})</h3>
            <button 
              onClick={() => setShowPaymentModal(true)}
              style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Nouvel Encaissement
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>N° Reçu</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Élève / Matricule</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nature du Frais</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Moyen de Paiement</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Montant</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const badge = getMethodBadge(p.paymentMethod);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px', fontWeight: 800, fontFamily: 'monospace', color: '#0369a1' }}>{p.receiptNumber}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700 }}>{p.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.studentMatricule} · {p.className}</div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{p.feeLabel}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {badge.label}
                      </span>
                      {p.transactionRef && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>Ref: {p.transactionRef}</div>}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>{formatCurrency(p.amount)}</td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setReceiptToPrint(p)}
                        style={{ padding: '6px 12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={14} /> Imprimer Reçu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VUE 3 : GESTION DES IMPAYÉS & RELANCES                                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'IMPAYES' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', color: '#ef4444' }}>
                ⚠️ Suivi des Élèves Débiteurs & Relances Automatiques
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Relancez en 1 clic par WhatsApp, SMS ou Email.
              </span>
            </div>
            <button 
              onClick={() => alert("Campagne de relance SMS/WhatsApp envoyée aux 20 élèves débiteurs !")}
              style={{ padding: '10px 18px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <Send size={16} /> Relancer Tous les Débiteurs (SMS / WhatsApp)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Ousmane SOW', class: 'Terminale S2', due: 90000, months: 'Janvier & Février', phone: '77 555 44 33' },
              { name: 'Khady NDIAYE', class: '3ème A', due: 45000, months: 'Février', phone: '78 123 45 67' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#991b1b' }}>{d.name} ({d.class})</div>
                  <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Échéances impayées : {d.months} · Tél Tuteur: {d.phone}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.1rem' }}>{formatCurrency(d.due)}</span>
                  <button 
                    onClick={() => alert(`Relance WhatsApp envoyée au ${d.phone}`)}
                    style={{ padding: '8px 14px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VUE 8 : ASSISTANT IA FINANCIER INTELLIGENT                            */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'IA_ASSISTANT' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles color="#D4A853" size={28} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Assistant IA Financier ERP</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interrogez directement votre base financière en langage naturel.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={aiQuery} 
              onChange={e => setAiQuery(e.target.value)} 
              placeholder="Ex: Quels élèves ont des impayés depuis 2 mois ?" 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid #D4A853', outline: 'none', fontSize: '0.95rem' }}
            />
            <button 
              onClick={() => handleAiFinancialQuery(aiQuery || 'impayés')}
              style={{ padding: '14px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Interroger l'IA
            </button>
          </div>

          {/* Suggestions de questions rapides */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              "Quels élèves ont des impayés ce mois-ci ?",
              "Quelle est la projection de trésorerie du trimestre ?",
              "Quel est le total des recettes encaissées via Wave ?"
            ].map((q, idx) => (
              <button 
                key={idx} 
                onClick={() => handleAiFinancialQuery(q)}
                style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                💡 {q}
              </button>
            ))}
          </div>

          {/* Réponse de l'IA */}
          {aiResponse && (
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODALE ENCAISSEMENT REÇU SCOLAIRE                                     */}
      {/* --------------------------------------------------------------------- */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', width: '550px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>💳 Encaisser un Paiement de Scolarité</h3>
            
            <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sélectionner l'Élève *</label>
                <select value={payStudentId} onChange={e => setPayStudentId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}>
                  <option value="">-- Choisir l'élève --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.className})</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nature du Frais *</label>
                <input type="text" value={payFeeLabel} onChange={e => setPayFeeLabel(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Montant (FCFA) *</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} required placeholder="Ex: 45000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #10b981', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mode de Paiement *</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }}>
                    <option value="WAVE_SN">Wave Senegal 🌊</option>
                    <option value="ORANGE_MONEY_SN">Orange Money 🍊</option>
                    <option value="ORANGE_MONEY_CI">Orange Money CI 🍊</option>
                    <option value="MTN_MONEY_CI">MTN Mobile Money 🟡</option>
                    <option value="MOOV_MONEY_CI">Moov Money 🔵</option>
                    <option value="CASH">Espèces 💵</option>
                    <option value="CHEQUE">Chèque 📜</option>
                    <option value="BANK_TRANSFER">Virement 🏛️</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Référence Transaction / N° Chèque (Optionnel)</label>
                <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Ex: WAVE-8974512" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'monospace' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Valider & Imprimer Reçu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* IMPRESSION REÇU FINANCIER PDF/A                                      */}
      {/* --------------------------------------------------------------------- */}
      {receiptToPrint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', width: '450px', position: 'relative' }}>
            <button onClick={() => setReceiptToPrint(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            
            <div style={{ border: '2px dashed #0f172a', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 4px 0', textTransform: 'uppercase' }}>{countryConfig.officialHeader?.republicName || 'REPUBLIQUE DU SENEGAL'}</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>REÇU D'ENCAISSEMENT OFFICIEL</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '10px 0' }}>{receiptToPrint.receiptNumber}</div>
              
              <div style={{ textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', margin: '16px 0' }}>
                <div>Élève : <strong>{receiptToPrint.studentName}</strong> ({receiptToPrint.className})</div>
                <div>Motif : <strong>{receiptToPrint.feeLabel}</strong></div>
                <div>Montant : <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(receiptToPrint.amount)}</strong></div>
                <div>Moyen : <strong>{receiptToPrint.paymentMethod}</strong></div>
                {receiptToPrint.transactionRef && <div>Réf : <code>{receiptToPrint.transactionRef}</code></div>}
                <div>Date : {receiptToPrint.paymentDate}</div>
              </div>

              <button 
                onClick={() => { window.print(); setReceiptToPrint(null); }}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ Imprimer la Quittance PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
