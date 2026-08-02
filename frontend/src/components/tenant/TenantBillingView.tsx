import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertCircle, Smartphone, Clock } from 'lucide-react';
import { useSubscriptionPricing } from '../../hooks/useSubscriptionPricing';

export const TenantBillingView: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState('ESSAI');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null);
  const [subscriptionMonths, setSubscriptionMonths] = useState(9); // 9 mois par défaut

  const [plans, setPlans] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadPlans = () => {
      const saved = localStorage.getItem('kpsydesk_pricing_plans');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed = parsed.map((p: any) => ({
            ...p,
            price: p.price === 50000 ? 25000 : (p.price === 150000 ? 45000 : (p.price === 350000 ? 75000 : p.price)),
            maxStudents: p.maxStudents === 500 ? 350 : p.maxStudents
          }));
          setPlans(parsed);
        }
      } else {
        setPlans([
          {
            id: 'STANDARD',
            name: 'Plan Standard',
            price: 25000,
            activeQuota: 30,
            maxStudents: 500,
            annualDiscount: 20,
            description: 'Gestion essentielle : élèves, bulletins & pointage kiosque.',
            features: ['Gestion Scolaire de base', 'Absences & Bulletins', 'Pointage Kiosque QR'],
            tags: 'Standard, Populaire',
            recommended: false
          },
          {
            id: 'PREMIUM',
            name: 'Plan Premium',
            price: 50000,
            activeQuota: 70,
            maxStudents: 2000,
            annualDiscount: 20,
            description: 'Gestion complète avec RH et comptabilité.',
            features: ['Gestion Scolaire complète', 'Module Financier & Paie RH', 'Kiosque Pointage', 'Messagerie Parents'],
            tags: 'Premium, Recommandé',
            recommended: true
          },
          {
            id: 'PRO',
            name: 'Plan Pro',
            price: 75000,
            activeQuota: 100,
            maxStudents: 99999,
            annualDiscount: 20,
            description: 'Haute performance et multi-établissements.',
            features: ['Tout le Plan Premium', 'Multi-campuses', 'Exports Illimités', 'Support Prioritaire 24/7'],
            tags: 'Pro, Haute Performance',
            recommended: false
          }
        ]);
      }
    };

    loadPlans();
    
    // Polling léger pour réactivité immédiate sans rechargement (mockup)
    const interval = setInterval(loadPlans, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPlanColor = (index: number) => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
    return colors[index % colors.length];
  };

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlanForPayment(planId);
    setPaymentModalOpen(true);
  };

  const handleSimulatePayment = (gateway: string) => {
    alert(`Simulation de paiement via ${gateway} pour le plan ${selectedPlanForPayment}... Paiement réussi !`);
    if (selectedPlanForPayment) {
      setCurrentPlan(selectedPlanForPayment);
    }
    setPaymentModalOpen(false);
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
              {currentPlan === 'ESSAI' ? '0 FCFA' : `${currentLockedPrice.toLocaleString('fr-FR')} FCFA / mois`}
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
              {livePlanPrice.toLocaleString('fr-FR')} FCFA / mois
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

        </div>
      </div>

      {/* Section Factures */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '1.4rem' }}>Dernières Factures KPsyDesk</h3>
        {currentPlan === 'ESSAI' ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            Vous êtes en période d'essai. Aucune facture n'a encore été générée.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>N° Facture</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Plan</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Montant</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 12px', fontWeight: 600, color: '#1e293b' }}>FAC-2023-10-01</td>
                <td style={{ padding: '16px 12px', color: '#64748b' }}>01 Oct 2023</td>
                <td style={{ padding: '16px 12px', color: '#64748b' }}>Professionnel</td>
                <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>150 000 F</td>
                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>PAYÉ</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Modale de Paiement Mobile Money */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Paiement Sécurisé</h3>
              <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                Sélectionnez votre moyen de paiement pour souscrire au forfait <strong>{plans.find(p => p.id === selectedPlanForPayment)?.name}</strong>.
              </p>

              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', color: '#475569', fontWeight: 600, marginBottom: '8px' }}>Durée de l'abonnement (mois)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="number" 
                    min={1} 
                    max={12} 
                    value={subscriptionMonths} 
                    onChange={(e) => setSubscriptionMonths(Number(e.target.value) || 1)}
                    style={{ width: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
                  />
                  <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    x {(plans.find(p => p.id === selectedPlanForPayment)?.price || 0).toLocaleString('fr-FR')} F
                  </span>
                </div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Total à payer :</span>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.2rem' }}>
                    {((plans.find(p => p.id === selectedPlanForPayment)?.price || 0) * subscriptionMonths).toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                  onClick={() => handleSimulatePayment('Wave')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Smartphone size={28} color="#10b981" />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ display: 'block', color: '#1e293b', fontSize: '1.1rem' }}>Payer avec Wave</strong>
                      <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Immédiat & Sécurisé</span>
                    </div>
                  </div>
                  <ShieldCheck size={24} color="#10b981" />
                </button>

                <button 
                  onClick={() => handleSimulatePayment('Orange Money')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff7ed', border: '1px solid #f97316', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Smartphone size={28} color="#f97316" />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ display: 'block', color: '#1e293b', fontSize: '1.1rem' }}>Payer avec Orange Money</strong>
                      <span style={{ color: '#f97316', fontSize: '0.85rem' }}>Code marchand (#144#)</span>
                    </div>
                  </div>
                  <ShieldCheck size={24} color="#f97316" />
                </button>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', justifyContent: 'center' }}>
                <ShieldCheck size={16} /> Transaction protégée par chiffrement 256-bit
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
