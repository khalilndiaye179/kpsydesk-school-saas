import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle2, AlertCircle, CreditCard, FileText, ArrowRight, Layers, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../config/countries.config';
import { calculateTierPricing } from '../../utils/pricing.utils';

interface PaymentProofSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: any;
  currentStatus: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  onSuccess: () => void;
}

export const PaymentProofSubmissionModal: React.FC<PaymentProofSubmissionModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentStatus,
  onSuccess,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState('');
  const [requestedQuota, setRequestedQuota] = useState<number>(500);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Calcul dynamique des paliers
  const pricing = calculateTierPricing(requestedQuota);

  useEffect(() => {
    if (isOpen) {
      setSubmittedSuccess(false);
      setError(null);
      setFile(null);
      setTransactionReference('');
      setRequestedQuota(500);

      api.get('/public/payment-methods')
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setPaymentMethods(res.data);
            setSelectedMethodId(res.data[0].id);
          } else {
            fallbackMethods();
          }
        })
        .catch(fallbackMethods);
    }
  }, [isOpen]);

  const fallbackMethods = () => {
    const defaults = [
      { id: 'WAVE', code: 'WAVE', label: 'Wave Senegal', instructions: 'Effectuer le transfert Wave au +221 77 123 45 67 (Merchant KPSyDesk)', iconColor: '#00c3ff' },
      { id: 'ORANGE_MONEY', code: 'ORANGE_MONEY', label: 'Orange Money', instructions: 'Composer le #144# ou utiliser l\'application OM au +221 77 987 65 43', iconColor: '#ff6600' },
      { id: 'VIREMENT', code: 'VIREMENT', label: 'Virement Bancaire (RIB)', instructions: 'Banque CBAO / IBAN : SN012 01001 12345678901 45 - Intitulé : KPSyDesk SARL', iconColor: '#2563eb' },
    ];
    setPaymentMethods(defaults);
    setSelectedMethodId(defaults[0].id);
  };

  if (!isOpen) return null;

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez joindre la photo ou le document PDF de votre récépissé de paiement.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('proof', file);
    formData.append('planCode', selectedPlan?.name || 'Pro (Full Pack)');
    formData.append('paymentMethodId', selectedMethodId);
    formData.append('amount', String(pricing.totalPrice));
    formData.append('requestedQuota', String(pricing.requestedQuota));
    formData.append('transactionReference', transactionReference);

    try {
      await api.post('/tenant/billing/proofs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la transmission du récépissé. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155',
        maxWidth: '680px', width: '100%', padding: '32px', color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', maxHeight: '92vh', overflowY: 'auto',
      }}>
        {submittedSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: 'white' }}>Récépissé Transmis avec Succès !</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0 }}>
              Votre preuve de paiement pour <strong>{pricing.requestedQuota} élèves</strong> ({formatCurrency(pricing.totalPrice)}/mois) a bien été envoyée à notre service financier.
              Votre accès sera activé sous 24 heures maximum.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>
                  Abonnement & Réglage du Quota d'Élèves
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {currentStatus === 'TRIAL' ? 'Période d\'Essai → Passation vers Forfait Payant' : 'Mise à niveau de votre capacité d\'élèves'}
                </span>
              </div>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {/* SECTION DYNAMIQUE : CURSEUR DES PALIERS D'ÉLÈVES */}
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="#38bdf8" />
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Capacité d'Élèves Souhaitée :</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={500}
                    max={5000}
                    step={50}
                    value={requestedQuota}
                    onChange={(e) => setRequestedQuota(Number(e.target.value))}
                    style={{
                      width: '90px', padding: '6px 10px', borderRadius: '8px',
                      backgroundColor: '#1e293b', border: '1px solid #38bdf8', color: '#38bdf8',
                      fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>élèves</span>
                </div>
              </div>

              {/* Slider interactif */}
              <input
                type="range"
                min={500}
                max={5000}
                step={50}
                value={requestedQuota}
                onChange={(e) => setRequestedQuota(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px', marginBottom: '16px' }}
              />

              {/* DÉCOMPOSITION EN TEMPS RÉEL DE LA FACTURATION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Forfait de Base (Jusqu'à 500 élèves) :</span>
                  <strong>{formatCurrency(pricing.basePrice)} / mois</strong>
                </div>
                {pricing.extraTiers > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <span>Surplus +{pricing.extraQuota} élèves ({pricing.extraTiers} palier(s) de 50 à +5 000 F) :</span>
                    <strong>+{formatCurrency(pricing.extraCost)} / mois</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #334155', color: '#34d399', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>TARIF TOTAL RÉACTUALISÉ :</span>
                  <span style={{ fontSize: '1.3rem', fontFamily: 'var(--font-data)' }}>{formatCurrency(pricing.totalPrice)} / mois</span>
                </div>
              </div>
            </div>

            {/* SELECTION DU MOYEN DE REGLEMENT */}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Choisissez votre Moyen de Règlement :
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {paymentMethods.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMethodId(m.id)}
                    style={{
                      padding: '12px', borderRadius: '10px',
                      border: selectedMethodId === m.id ? `2px solid ${m.iconColor || '#38bdf8'}` : '1px solid #334155',
                      backgroundColor: selectedMethodId === m.id ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <strong style={{ display: 'block', color: 'white', fontSize: '0.9rem' }}>{m.label}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSIGNES DE PAIEMENT */}
            {selectedMethod && (
              <div style={{ padding: '14px', backgroundColor: '#0f172a', borderRadius: '10px', borderLeft: `4px solid ${selectedMethod.iconColor || '#38bdf8'}`, fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Consignes de paiement :</strong>
                {selectedMethod.instructions}
              </div>
            )}

            {/* RÉFÉRENCE DE TRANSACTION */}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                N° de Transaction / Référence du Règlement (Optionnel) :
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="Ex: W-982347102 ou Ref Orange Money"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>

            {/* UPLOAD DE LA PREUVE */}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Joindre le Récépissé ou Reçu (Photo / PDF - Max 5 Mo) * :
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px dashed #38bdf8', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}
              />
            </div>

            {/* BOUTON DE SOUMISSION */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#10b981', color: 'white', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {loading ? 'Transmission en cours...' : `Transmettre le Récépissé (${formatCurrency(pricing.totalPrice)})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
