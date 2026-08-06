import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertCircle, Clock, FileText, Upload } from 'lucide-react';
import { useSubscriptionPricing } from '../../hooks/useSubscriptionPricing';
import { formatCurrency } from '../../config/countries.config';
import { PaymentProofSubmissionModal } from './PaymentProofSubmissionModal';
import { api } from '../../lib/api';

export const TenantBillingView: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<'TRIAL' | 'ACTIVE' | 'SUSPENDED'>('TRIAL');
  const [currentPlan, setCurrentPlan] = useState('STANDARD');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [submittedProofs, setSubmittedProofs] = useState<any[]>([]);

  const loadData = () => {
    // Charger les plans publics
    api.get('/public/plans')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data);
        } else {
          fallbackPlans();
        }
      })
      .catch(fallbackPlans);

    // Charger les preuves soumises
    api.get('/tenant/billing/proofs')
      .then((res) => setSubmittedProofs(res.data || []))
      .catch(() => {});
  };

  const fallbackPlans = () => {
    setPlans([
      {
        id: 'STANDARD',
        name: 'STANDARD',
        price: 25000,
        quotaStudents: 350,
        description: 'Gestion essentielle : élèves, bulletins & pointage kiosque.',
        features: ['Gestion Scolaire de base', 'Absences & Bulletins', 'Pointage Kiosque QR'],
        recommended: false,
      },
      {
        id: 'PREMIUM',
        name: 'PREMIUM',
        price: 50000,
        quotaStudents: 2000,
        description: 'Gestion complète avec RH et comptabilité.',
        features: ['Gestion Scolaire complète', 'Module Financier & Paie RH', 'Kiosque Pointage', 'Messagerie Parents'],
        recommended: true,
      },
      {
        id: 'PRO',
        name: 'PRO',
        price: 75000,
        quotaStudents: 99999,
        description: 'Haute performance et multi-établissements.',
        features: ['Tout le Plan Premium', 'Multi-campuses', 'Exports Illimités', 'Support Prioritaire 24/7'],
        recommended: false,
      },
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlanForPayment(plan);
    setPaymentModalOpen(true);
  };

  const { 
    currentLockedPrice, 
    livePlanPrice, 
    nextRenewalDate, 
    isPriceChanged 
  } = useSubscriptionPricing('samba_diouf');

  const formattedRenewalDate = new Date(nextRenewalDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={32} color="#2563eb" /> Mon Abonnement SaaS
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>
            Gérez votre forfait, vos options de paiement et vos factures.
          </p>
        </div>
      </div>

      {/* État actuel & Tarif Verrouillé au Contrat */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan & Tarif Actuel (Prix Verrouillé au Contrat)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '2rem', fontWeight: 800 }}>
                {currentPlan === 'ESSAI' ? 'Période d\'Essai (14 jours restants)' : (plans.find(p => p.id === currentPlan)?.name || 'Professionnel')}
              </h2>
              {currentPlan === 'ESSAI' && (
                <span style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                  Expire Bientôt
                </span>
              )}
              {currentPlan !== 'ESSAI' && (
                <span style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Contrat Actif
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.9rem' }}>Votre tarif actuel (jusqu'au {formattedRenewalDate}) :</p>
            <strong style={{ color: '#2563eb', fontSize: '1.6rem', fontWeight: 800 }}>
              {currentPlan === 'ESSAI' ? formatCurrency(0) : `${formatCurrency(currentLockedPrice)} / mois`}
            </strong>
          </div>
        </div>

        {/* AFFICHAGE CONDITIONNEL DU NOUVEAU TARIF À VENIR (Affiché uniquement s'il diffère du prix verrouillé) */}
        {isPriceChanged && (
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={22} color="#2563eb" />
              <div>
                <strong style={{ color: '#1e3a8a', fontSize: '0.95rem', display: 'block' }}>Nouveau tarif à partir du {formattedRenewalDate}</strong>
                <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>Le prix public de votre formule a évolué et s'appliquera lors de votre prochain renouvellement.</span>
              </div>
            </div>
            <span style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: 'white', borderRadius: '20px', fontWeight: 700, fontSize: '0.95rem' }}>
              {formatCurrency(livePlanPrice)} / mois
            </span>
          </div>
        )}
      </div>

      {/* Choix des Plans */}
      <div>
        <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '1.4rem' }}>Changer de Forfait</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {plans.map((plan, index) => {
            const planColor = getPlanColor(index);
            return (
              <div key={plan.id} style={{ 
                backgroundColor: 'white', borderRadius: '16px', border: plan.recommended ? `2px solid ${planColor}` : '1px solid #e2e8f0', 
                padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative',
                boxShadow: plan.recommended ? '0 10px 15px -3px rgba(139, 92, 246, 0.2)' : 'none'
              }}>
                {plan.recommended && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: planColor, color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} /> RECOMMANDÉ
                  </div>
                )}
                
                <h4 style={{ margin: '0 0 16px 0', color: planColor, fontSize: '1.2rem' }}>{plan.name}</h4>
                <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '2rem', fontFamily: 'var(--font-data)' }}>{(plan.price || 0).toLocaleString('fr-FR')} F / mois</h2>
                <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '0.9rem' }}>{plan.description || 'Facturé annuellement ou mensuellement.'}</p>
                
                <ul style={{ padding: 0, margin: '0 0 32px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {(plan.features || []).map((feature: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', fontSize: '0.95rem' }}>
                      <CheckCircle2 size={18} color={planColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleUpgradeClick(plan.id)}
                  disabled={currentPlan === plan.id}
                  style={{ 
                    width: '100%', padding: '14px', borderRadius: '8px', border: 'none', 
                    backgroundColor: currentPlan === plan.id ? '#f1f5f9' : planColor, 
                    color: currentPlan === plan.id ? '#94a3b8' : 'white', 
                    cursor: currentPlan === plan.id ? 'not-allowed' : 'pointer', 
                    fontWeight: 600, fontSize: '1rem', transition: '0.2s'
                  }}
                >
                  {currentPlan === plan.id ? 'Plan Actuel' : 'Choisir ce plan'}
                </button>
              </div>
            );
          })}

             {/* Section des Preuves de Règlement Transmises */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.3rem' }}>Historique des Preuves de Règlement Transmises</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Suivi des demandes d'activation et de changement de plan en cours.</span>
          </div>
          <button
            onClick={() => {
              setSelectedPlanForPayment(plans[0] || null);
              setPaymentModalOpen(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            <Upload size={16} /> Transmettre un Récépissé
          </button>
        </div>

        {submittedProofs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            Aucun récépissé de paiement transmis pour le moment. Cliquez sur "Choisir ce plan" ci-dessus pour soumettre votre règlement.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Date de Soumission</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Plan Demandé</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Moyen de Règlement</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Référence</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Montant</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {submittedProofs.map((proof) => (
                  <tr key={proof.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 12px', color: '#475569' }}>
                      {new Date(proof.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#1e293b' }}>
                      Plan {proof.planCode}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569' }}>
                      {proof.paymentMethod?.label || proof.paymentMethodId}
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'var(--font-data)', color: '#475569' }}>
                      {proof.transactionReference || 'Non renseignée'}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      {formatCurrency(proof.amount)}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      {proof.status === 'PENDING' && (
                        <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> EN ATTENTE DE VALIDATION
                        </span>
                      )}
                      {proof.status === 'APPROVED' && (
                        <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> VALIDÉ & ACTIF
                        </span>
                      )}
                      {proof.status === 'REJECTED' && (
                        <span style={{ padding: '4px 10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={proof.rejectionReason}>
                          <AlertCircle size={12} /> REJETÉ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Soumission de Preuve de Paiement */}
      <PaymentProofSubmissionModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedPlan={selectedPlanForPayment}
        currentStatus={currentStatus}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
