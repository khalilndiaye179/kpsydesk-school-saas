import React from 'react';

interface CardKPIProps {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export const CardKPI: React.FC<CardKPIProps> = ({ label, value, trend, isPositive, icon }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1,
      minWidth: '220px',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Icone enveloppée dans un carré arrondi */}
        <div style={{
          backgroundColor: 'var(--bg-page)',
          padding: '10px',
          borderRadius: '10px',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        {/* Pastille de tendance */}
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: '20px',
          backgroundColor: isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          color: isPositive ? 'var(--status-positive)' : 'var(--status-negative)'
        }}>
          {trend}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span style={{
          fontSize: '1.75rem',
          fontFamily: 'var(--font-title)',
          color: 'var(--text-primary)'
        }}>
          {value}
        </span>
      </div>
    </div>
  );
};
