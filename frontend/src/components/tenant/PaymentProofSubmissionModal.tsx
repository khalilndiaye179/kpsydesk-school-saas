import React, { useState, useEffect } from 'react';
import { CreditCard, Upload, CheckCircle2, AlertTriangle, FileText, X, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../config/countries.config';

interface PaymentMethod {
  id: string;
  code: string;
  label: string;
  instructions: string;
  iconColor: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  quotaStudents: number;
}

interface PaymentProofSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  currentStatus: string;
  onSuccess: () => void;
}

export const PaymentProofSubmissionModal: React.FC<PaymentProofSubmissionModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentStatus,
  onSuccess,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingMethods, setFetchingMethods] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetchingMethods(true);
      api.get('/public/payment-methods')
        .then((res) => {
          const activeMethods = res.data || [];
          setMethods(activeMethods);
          if (activeMethods.length > 0) {
            setSelectedMethodId(activeMethods[0].id);
          }
        })
        .catch(() => {
          // Fallback par défaut si API en maintenance
          setMethods([
            { id: 'wave-def', code: 'WAVE', label: 'Wave Mobile Money', instructions: 'Envoyez le règlement Wave au +221 76 261 39 39.', iconColor: '#00c3ff' },
            { id: 'om-def', code: 'ORANGE_MONEY', label: 'Orange Money', instructions: 'Règlement OM au +221 77 123 45 67.', iconColor: '#ff6600' },
            { id: 'rib-def', code: 'VIREMENT', label: 'Virement Bancaire (RIB)', instructions: 'Virement sur IBAN: SN012 01001 12345678901 45.', iconColor: '#2563eb' },
          ]);
        })
        .finally(() => setFetchingMethods(false));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Le fichier dépasse la taille maximale autorisée (5 Mo).');
        return;
      }
      setError('');
      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez joindre la photo ou le document de votre reçu de règlement.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (selectedPlan) {
        formData.append('planId', selectedPlan.id);
        formData.append('planCode', selectedPlan.name);
        formData.append('amount', selectedPlan.price.toString());
      }
      formData.append('paymentMethodId', selectedMethodId);
      formData.append('transactionReference', transactionRef);
      formData.append('file', file);

      await api.post('/tenant/billing/submit-payment-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setFile(null);
        setTransactionRef('');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la transmission du récépissé.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentMethod = methods.find((m) => m.id === selectedMethodId);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '18px', maxWidth: '580px', width: '100%',
        padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'left',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={22} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', color: '#0f172a' }}>Preuve Transmise avec Succès !</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Votre récépissé a été transmis au service financier. Votre abonnement sera activé dès la vérification de la transaction.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#0f172a', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={24} color="#2563eb" /> Transmettre une Preuve de Règlement
              </h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                {currentStatus === 'ACTIVE' 
                  ? 'Demande de modification de plan. Votre contrat actuel reste pleinement actif pendant la vérification.'
                  : 'Activez votre établissement et débloquez l\'impression de tous vos documents.'}
              </p>
            </div>

            {selectedPlan && (
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>Plan Sélectionné</span>
                  <h4 style={{ margin: '2px 0 0 0', color: '#1e3a8a', fontSize: '1.1rem' }}>Plan {selectedPlan.name}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#2563eb' }}>{formatCurrency(selectedPlan.price)} / mois</strong>
                </div>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', color: '#dc2626', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            {/* Sélection de la méthode */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                1. Choisissez votre Mode de Règlement :
              </label>
              {fetchingMethods ? (
                <div style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}><Loader2 size={16} className="spin" /> Chargement des modes de paiement...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethodId(m.id)}
                      style={{
                        padding: '12px', borderRadius: '10px',
                        border: selectedMethodId === m.id ? `2px solid ${m.iconColor || '#2563eb'}` : '1px solid #cbd5e1',
                        backgroundColor: selectedMethodId === m.id ? `${m.iconColor}10` : 'white',
                        cursor: 'pointer', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: '#1e293b',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Consignes du mode sélectionné */}
            {currentMethod && (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>Consignes de paiement ({currentMethod.label}) :</strong>
                {currentMethod.instructions}
              </div>
            )}

            {/* Référence de Transaction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                2. N° / Référence de Transaction (Optionnel) :
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Ex: TX-984728912 ou ID de SMS Wave/OM"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Upload Fichier */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                3. Joindre la Photo ou le PDF du Reçu (Obligatoire, max 5 Mo) :
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '20px', borderRadius: '12px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc',
                cursor: 'pointer', transition: 'border 0.2s',
              }}>
                <Upload size={28} color="#64748b" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                  {file ? file.name : 'Cliquez pour sélectionner la photo ou le PDF'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG ou PDF supportés</span>
                <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              {previewUrl && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img src={previewUrl} alt="Aperçu du reçu" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />} Transmettre le Récépissé
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
