import React from 'react';
import { Wrench, ShieldAlert, RefreshCw } from 'lucide-react';

interface MaintenanceOverlayProps {
  message?: string;
  onRefresh?: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  message = "La plateforme KPSyDesk SaaS est actuellement en maintenance planifiée pour amélioration de nos services. Nos équipes techniques interviennent.",
  onRefresh
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Pattern de Fond */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Badge Icône */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: '2px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          color: '#f59e0b'
        }}>
          <Wrench size={40} style={{ animation: 'bounce 2s infinite' }} />
        </div>

        <span style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid #ef4444',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '16px'
        }}>
          🚨 Maintenance System Globale
        </span>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          margin: '0 0 16px 0',
          color: '#ffffff'
        }}>
          Plateforme en Maintenance
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          margin: '0 0 32px 0'
        }}>
          {message}
        </p>

        <div style={{
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #334155',
          fontSize: '0.85rem',
          color: '#94a3b8',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left'
        }}>
          <ShieldAlert size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
          <span>
            Toutes les sessions utilisateurs des établissements ont été temporairement suspendues par sécurité. Seule l'équipe SuperAdmin gère cette opération.
          </span>
        </div>

        <button
          onClick={onRefresh || (() => window.location.reload())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.2s'
          }}
        >
          <RefreshCw size={18} /> Vérifier la disponibilité
        </button>
      </div>
    </div>
  );
};
