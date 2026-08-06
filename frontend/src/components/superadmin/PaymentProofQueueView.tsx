import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, Clock, ExternalLink, RefreshCw, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../config/countries.config';

interface PaymentProof {
  id: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    code: string;
    subdomain: string;
    status: string;
    country: string;
  };
  planCode: string;
  amount: number;
  currency: string;
  paymentMethod: {
    label: string;
    code: string;
  };
  transactionReference?: string;
  proofFileUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  rejectionReason?: string;
}

interface PaymentProofQueueViewProps {
  onPendingCountChange?: (count: number) => void;
}

export const PaymentProofQueueView: React.FC<PaymentProofQueueViewProps> = ({ onPendingCountChange }) => {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [rejectingProof, setRejectingProof] = useState<PaymentProof | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchQueue = (silent = false) => {
    if (!silent) setLoading(true);
    api.get('/admin/payment-proofs?status=PENDING')
      .then((res) => {
        const items = res.data?.items || [];
        setProofs(items);
        if (onPendingCountChange) {
          onPendingCountChange(items.length);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  // Polling automatique en temps réel toutes les 15 secondes
  useEffect(() => {
    fetchQueue(false);
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (proof: PaymentProof) => {
    if (!window.confirm(`Confirmez-vous la validation du règlement pour l'établissement "${proof.tenant.name}" ? L'accès sera activé immédiatement.`)) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      await api.put(`/admin/payment-proofs/${proof.id}/approve`);
      setFeedback({ type: 'success', message: `Paiement validé avec succès. L'établissement "${proof.tenant.name}" est désormais ACTIF.` });
      fetchQueue();
      if (selectedProof?.id === proof.id) setSelectedProof(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la validation du paiement.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingProof) return;
    if (!rejectionReason.trim()) {
      alert('Veuillez saisir le motif du rejet.');
      return;
    }

    setActionLoading(true);
    setFeedback(null);
    try {
      await api.put(`/admin/payment-proofs/${rejectingProof.id}/reject`, { rejectionReason });
      setFeedback({ type: 'success', message: `Preuve de paiement rejetée. Motif communiqué à l'établissement.` });
      setRejectingProof(null);
      setRejectionReason('');
      fetchQueue();
      if (selectedProof?.id === rejectingProof.id) setSelectedProof(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erreur lors du rejet du paiement.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      
      {/* En-tête de la file */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'white', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} color="#f59e0b" /> File d'Attente des Preuves de Règlement (PENDING)
          </h3>
          <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            {proofs.length} demande(s) de validation en attente de vérification financière.
          </span>
        </div>
        <button
          onClick={fetchQueue}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Rafraîchir
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px',
          backgroundColor: feedback.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: feedback.type === 'success' ? '#34d399' : '#f87171', fontSize: '0.9rem', fontWeight: 600,
        }}>
          {feedback.message}
        </div>
      )}

      {/* Tableau des preuves */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chargement de la file d'attente...</div>
      ) : proofs.length === 0 ? (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #334155', color: '#94a3b8' }}>
          <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          Aucune preuve de paiement en attente. Toutes les transactions ont été traitées !
        </div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '14px', textAlign: 'left', fontWeight: 600 }}>Établissement (Tenant)</th>
                <th style={{ padding: '14px', textAlign: 'left', fontWeight: 600 }}>Plan Demandé</th>
                <th style={{ padding: '14px', textAlign: 'left', fontWeight: 600 }}>Méthode & Référence</th>
                <th style={{ padding: '14px', textAlign: 'right', fontWeight: 600 }}>Montant</th>
                <th style={{ padding: '14px', textAlign: 'center', fontWeight: 600 }}>Justificatif</th>
                <th style={{ padding: '14px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px', color: 'white', fontWeight: 600 }}>
                    {p.tenant?.name || 'Inconnu'}
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>
                      {p.tenant?.subdomain}.kpsydesk.com ({p.tenant?.country || 'SN'})
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#38bdf8', fontWeight: 700 }}>
                    Plan {p.planCode}
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500, marginTop: '2px' }}>
                      Quota : {(p as any).requestedQuota || 500} élèves
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#cbd5e1' }}>
                    <strong style={{ display: 'block', color: 'white' }}>{p.paymentMethod?.label || 'Paiement Manuel'}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-data)' }}>
                      Ref: {p.transactionReference || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '1.05rem' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {p.proofFileUrl ? (
                      <button
                        onClick={() => setSelectedProof(p)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#334155', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <Eye size={14} /> Voir le Reçu
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Aucun fichier</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(p)}
                        disabled={actionLoading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        <CheckCircle2 size={14} /> Valider
                      </button>
                      <button
                        onClick={() => setRejectingProof(p)}
                        disabled={actionLoading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        <XCircle size={14} /> Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'Aperçu du Récépissé */}
      {selectedProof && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', maxWidth: '700px', width: '100%', padding: '24px', color: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Reçu de Paiement — {selectedProof.tenant.name}</h4>
              <button onClick={() => setSelectedProof(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px' }}>
              {selectedProof.proofFileUrl?.endsWith('.pdf') ? (
                <a href={selectedProof.proofFileUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={18} /> Ouvrir le document PDF joint
                </a>
              ) : (
                <img src={selectedProof.proofFileUrl} alt="Reçu" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }} />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setSelectedProof(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>Fermer</button>
              <button onClick={() => handleApprove(selectedProof)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Valider le Paiement</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejet avec Motif */}
      {rejectingProof && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', maxWidth: '480px', width: '100%', padding: '24px', color: 'white' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#ef4444' }}>Rejeter la Preuve de Règlement</h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
              Veuillez indiquer la raison du rejet. Ce motif sera affiché au directeur de l'établissement "{rejectingProof.tenant.name}".
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Récépissé illisible, montant incorrect ou référence non trouvée sur notre compte Wave."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '0.9rem', outline: 'none', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setRejectingProof(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleConfirmReject} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Confirmer le Rejet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
