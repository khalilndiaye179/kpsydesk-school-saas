import React, { useState } from 'react';
import { Printer, Lock, AlertCircle } from 'lucide-react';

interface TrialPrintButtonProps {
  onPrint: () => void;
  tenantStatus?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
}

export const TrialPrintButton: React.FC<TrialPrintButtonProps> = ({
  onPrint,
  tenantStatus = 'TRIAL',
  label = 'Imprimer le Document',
  style,
  iconSize = 16,
}) => {
  const [showModal, setShowModal] = useState(false);
  const isTrial = tenantStatus === 'TRIAL';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isTrial) {
      setShowModal(true);
    } else {
      onPrint();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={isTrial ? "L'impression est bloquée pendant la période d'essai. Cliquez pour en savoir plus." : label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: isTrial ? '1px solid #cbd5e1' : 'none',
          backgroundColor: isTrial ? '#f1f5f9' : 'var(--accent-color, #2563eb)',
          color: isTrial ? '#64748b' : '#ffffff',
          cursor: isTrial ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.88rem',
          opacity: isTrial ? 0.8 : 1,
          transition: 'all 0.2s ease',
          ...style,
        }}
      >
        {isTrial ? <Lock size={iconSize} color="#f59e0b" /> : <Printer size={iconSize} />}
        {label}
      </button>

      {/* Modal d'information sur le blocage en mode essai */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
                <Lock size={28} color="#d97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontFamily: 'var(--font-title)' }}>
                  Fonctionnalité Bloquée en Période d'Essai
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Abonnement non activé</span>
              </div>
            </div>

            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              L'impression et l'exportation des documents officiels (bulletins, reçus de scolarité, certificats, factures) sont <strong>réservées aux établissements ayant activé leur abonnement</strong>.
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <AlertCircle size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                Vous pouvez continuer à consulter les données à l'écran. Pour débloquer l'impression, soumettez votre preuve de règlement depuis la rubrique <strong>Mon Abonnement</strong>.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'white',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  window.location.hash = '#billing';
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Activer mon Abonnement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
