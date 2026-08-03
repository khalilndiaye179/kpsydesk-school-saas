import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Filter, Plus, FileText, CheckCircle, Clock, AlertCircle, Briefcase, FileMinus } from 'lucide-react';
import { api } from '../../lib/api';

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
  studentMatricule?: string;
  studentName?: string;
}

interface Expense {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  recipientId?: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  contractType?: string;
  baseSalary?: number;
  hourlyRate?: number;
}

export const FinancesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECETTES' | 'SALAIRES' | 'CHARGES'>('RECETTES');
  
  // Data States
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  
  // Form States (Recettes)
  const [newPayment, setNewPayment] = useState({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  
  // Form States (Charges)
  const [newExpense, setNewExpense] = useState({ type: 'MAINTENANCE', description: '', amount: '' });

  // Form States (Salaires)
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');

  // Pour la démo, quelques élèves statiques (idéalement à récupérer via kpsydesk_students)
  const mockStudents = [
    { id: '1', firstName: 'Amadou', lastName: 'Diop', matricule: 'MAT-2026-001' },
    { id: '2', firstName: 'Fatou', lastName: 'Sow', matricule: 'MAT-2026-002' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
  const PAYMENTS_KEY = `kpsydesk_tenant_payments_${activeTenantId}`;
  const EXPENSES_KEY = `kpsydesk_tenant_expenses_${activeTenantId}`;
  const USERS_KEY = `kpsydesk_tenant_users_${activeTenantId}`;

  const fetchData = async () => {
    // Paiements Scolarité
    const savedPayments = localStorage.getItem(PAYMENTS_KEY);
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }

    // Dépenses
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    // Employés
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      const users: Staff[] = JSON.parse(savedUsers);
      setStaff(users.filter(u => !['STUDENT', 'PARENT'].includes(u.role)));
    }
  };

  // --- Sauvegardes ---
  const savePayments = (p: Payment[]) => {
    setPayments(p);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(p));
  };
  
  const saveExpenses = (e: Expense[]) => {
    setExpenses(e);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(e));
  };

  // --- Handlers ---
  const handleAddPayment = () => {
    if (!newPayment.studentId || !newPayment.amount) return;
    const student = mockStudents.find(s => s.id === newPayment.studentId);
    
    const payment: Payment = {
      id: `REC-00${payments.length + 1}`,
      studentId: newPayment.studentId,
      studentMatricule: student?.matricule,
      studentName: `${student?.firstName} ${student?.lastName}`,
      amount: parseFloat(newPayment.amount),
      date: newPayment.date,
      status: 'PAID'
    };
    savePayments([...payments, payment]);
    setShowPaymentModal(false);
    setNewPayment({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expense: Expense = {
      id: `EXP-00${expenses.length + 1}`,
      type: newExpense.type,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split('T')[0]
    };
    saveExpenses([...expenses, expense]);
    setShowExpenseModal(false);
    setNewExpense({ type: 'MAINTENANCE', description: '', amount: '' });
  };

  const handlePaySalary = () => {
    if (!selectedStaffId || !salaryAmount) return;
    const employee = staff.find(s => s.id === selectedStaffId);
    
    let desc = `Salaire ${new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} - ${employee?.firstName} ${employee?.lastName}`;
    if (hoursWorked) {
      desc += ` (${hoursWorked} heures effectuées)`;
    }

    const expense: Expense = {
      id: `SAL-00${expenses.length + 1}`,
      type: 'SALARY',
      description: desc,
      amount: parseFloat(salaryAmount),
      date: new Date().toISOString().split('T')[0],
      recipientId: selectedStaffId
    };
    saveExpenses([...expenses, expense]);
    setShowSalaryModal(false);
    setSelectedStaffId('');
    setSalaryAmount('');
    setHoursWorked('');
  };

  // --- Auto-calcul Salaire ---
  useEffect(() => {
    if (selectedStaffId) {
      const employee = staff.find(s => s.id === selectedStaffId);
      if (employee) {
        if (employee.contractType === 'CDI' || employee.contractType === 'CDD') {
          setSalaryAmount(employee.baseSalary ? employee.baseSalary.toString() : '');
          setHoursWorked('');
        } else if ((employee.contractType === 'FORFAIT' || employee.contractType === 'PRESTATION') && employee.hourlyRate) {
          if (hoursWorked) {
            setSalaryAmount((parseFloat(hoursWorked) * employee.hourlyRate).toString());
          } else {
            setSalaryAmount('');
          }
        }
      }
    }
  }, [selectedStaffId, hoursWorked, staff]);

  // --- Stats ---
  const totalRecettes = payments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSalaires = expenses.filter(e => e.type === 'SALARY').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCharges = expenses.filter(e => e.type !== 'SALARY').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* En-tête global */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Finance & Comptabilité</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gérez vos recettes (scolarité) et vos dépenses (charges, salaires).</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Trésorerie Nette</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (totalRecettes - totalSalaires - totalCharges) >= 0 ? '#10b981' : '#ef4444' }}>
            {(totalRecettes - totalSalaires - totalCharges).toLocaleString()} F
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('RECETTES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'RECETTES' ? '#0f172a' : 'transparent', color: activeTab === 'RECETTES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <DollarSign size={18} /> Recettes (Scolarité)
        </button>
        <button 
          onClick={() => setActiveTab('SALAIRES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'SALAIRES' ? '#0f172a' : 'transparent', color: activeTab === 'SALAIRES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={18} /> Salaires & Honoraires
        </button>
        <button 
          onClick={() => setActiveTab('CHARGES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'CHARGES' ? '#0f172a' : 'transparent', color: activeTab === 'CHARGES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileMinus size={18} /> Charges & Dépenses
        </button>
      </div>

      {/* Contenu - Recettes */}
      {activeTab === 'RECETTES' && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Encaissements Scolarité</h3>
            <button onClick={() => setShowPaymentModal(true)} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Plus size={16} /> Encaisser un paiement
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Référence</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Élève</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Montant</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: '16px' }}>{p.studentName || 'Inconnu'} <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{p.studentMatricule}</span></td>
                  <td style={{ padding: '16px' }}>{p.date}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{p.amount.toLocaleString()} F</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>Payé</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contenu - Salaires */}
      {activeTab === 'SALAIRES' && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Paiements du Personnel</h3>
            <button onClick={() => setShowSalaryModal(true)} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <DollarSign size={16} /> Verser un Salaire
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Référence</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Détail / Motif</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Montant Versé</th>
              </tr>
            </thead>
            <tbody>
              {expenses.filter(e => e.type === 'SALARY').map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{e.id}</td>
                  <td style={{ padding: '16px' }}>{e.description}</td>
                  <td style={{ padding: '16px' }}>{e.date}</td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#ef4444' }}>- {e.amount.toLocaleString()} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contenu - Charges */}
      {activeTab === 'CHARGES' && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Charges & Dépenses Diverses</h3>
            <button onClick={() => setShowExpenseModal(true)} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Plus size={16} /> Saisir une dépense
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Référence</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Catégorie</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Description (Motif)</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {expenses.filter(e => e.type !== 'SALARY').map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{e.id}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: 'var(--bg-page)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{e.type}</span>
                  </td>
                  <td style={{ padding: '16px' }}>{e.description}</td>
                  <td style={{ padding: '16px' }}>{e.date}</td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#ef4444' }}>- {e.amount.toLocaleString()} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale - Paiement Scolarité */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>Encaisser la scolarité</h3>
            <select value={newPayment.studentId} onChange={e => setNewPayment({...newPayment, studentId: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <option value="">-- Sélectionner l'élève --</option>
              {mockStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
            <input type="number" placeholder="Montant (FCFA)" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '12px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddPayment} style={{ flex: 1, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale - Dépenses */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>Saisir une Dépense / Charge</h3>
            <select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <option value="MAINTENANCE">Maintenance & Réparations</option>
              <option value="SUPPLIES">Fournitures & Matériel</option>
              <option value="UTILITIES">Énergie & Eau</option>
              <option value="OTHER">Autre</option>
            </select>
            <input type="text" placeholder="Description / Motif de la dépense" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <input type="number" placeholder="Montant (FCFA)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '12px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAddExpense} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale - Salaires */}
      {showSalaryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>Verser un Salaire / Honoraire</h3>
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sélectionner le collaborateur :</label>
            <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <option value="">-- Choisir --</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.contractType || 'Sans Contrat'})
                </option>
              ))}
            </select>

            {selectedStaffId && staff.find(s => s.id === selectedStaffId)?.contractType === 'FORFAIT' && (
              <>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre d'heures travaillées ce mois-ci :</label>
                <input type="number" placeholder="Ex: 24" value={hoursWorked} onChange={e => setHoursWorked(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </>
            )}

            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Montant calculé à verser (FCFA) :</label>
            <input type="number" placeholder="Montant" value={salaryAmount} onChange={e => setSalaryAmount(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => {setShowSalaryModal(false); setSelectedStaffId(''); setHoursWorked('');}} style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '12px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handlePaySalary} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Verser</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
