import React from 'react';
import { Info, Mail, Phone, Code2, ShieldCheck, Heart, Monitor } from 'lucide-react';

export const TenantAboutView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={32} color="#2563eb" /> À Propos du Logiciel
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>
            Informations sur la conception, l'architecture et l'assistance technique.
          </p>
        </div>
        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px', color: '#2563eb', fontSize: '0.9rem', fontWeight: 600 }}>
          Version 2.0 (SaaS Edition)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* Auteur & Contact */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Code2 size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.4rem' }}>Développement & Assistance</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Conçu et réalisé par</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>Ibrahima NDIAYE</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
              <Mail size={18} color="#2563eb" />
              <span>khalil.ndiaye@kpsyinformatique.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
              <Mail size={18} color="#2563eb" />
              <span>neguinho.ndiaye@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
              <Phone size={18} color="#10b981" />
              <span style={{ fontWeight: 600, color: '#1e293b' }}>+221 77 803 47 56</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginTop: 'auto' }}>
            Développé avec <Heart size={16} fill="#ef4444" color="#ef4444" /> au service de l'éducation.
          </div>
        </div>

        {/* Architecture & Qualité */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.4rem' }}>Architecture de la Solution</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Performance & Sécurité des données</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Monitor size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px' }}>Interface Moderne (React.js)</strong>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Pensée pour une ergonomie optimale et une fluidité totale sur ordinateur, optimisée pour le travail quotidien de l'administration scolaire.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <ShieldCheck size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px' }}>Sécurité Multi-Tenant</strong>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Chaque école possède un espace de données strictement isolé. La plateforme repose sur un backend NestJS et une base de données PostgreSQL sécurisée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
