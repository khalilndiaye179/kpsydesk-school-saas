import React from 'react';
import { Info, Code2, Database, LayoutTemplate, ShieldCheck, Heart, Terminal, Globe, Cpu } from 'lucide-react';

export const SuperAdminAboutView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #334155', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={32} color="#38bdf8" /> À Propos de KPsyDesk SaaS
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
            Conception, Architecture & Auteur de la plateforme.
          </p>
        </div>
        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
          Version 2.0 (Modern Dark UI)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* L'Auteur */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Terminal size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.4rem' }}>L'Auteur</h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>Ingénierie & Vision Produit</p>
            </div>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
            Ce système SaaS de gestion scolaire a été intégralement pensé et structuré par <strong>Ibrahima Ndiaye</strong>. 
            L'objectif : offrir aux établissements éducatifs une plateforme premium, multi-tenant et ultra-sécurisée, tout en garantissant une expérience utilisateur moderne (UI/UX) à la hauteur des standards technologiques mondiaux.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginTop: 'auto' }}>
            Développé avec <Heart size={16} fill="#ef4444" color="#ef4444" /> et passion pour l'éducation.
          </div>
        </div>

        {/* Architecture Technique */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Cpu size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.4rem' }}>L'Architecture (Stack)</h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>Fondations robustes & scalables</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutTemplate size={20} color="#38bdf8" />
              <div>
                <strong style={{ color: 'white' }}>Frontend (Client) :</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>React.js + Vite, TypeScript, UI Moderne (Vanilla CSS / Flexbox), Leaflet (GPS).</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Code2 size={20} color="#ef4444" />
              <div>
                <strong style={{ color: 'white' }}>Backend (Serveur) :</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>NestJS, API RESTful, JWT pour l'isolation Multi-Tenant.</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} color="#f59e0b" />
              <div>
                <strong style={{ color: 'white' }}>Base de données :</strong>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>PostgreSQL + Prisma ORM.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spécificités du Projet */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', padding: '32px' }}>
        <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '1.4rem' }}>Innovations & Spécificités</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
            <Globe size={24} color="#8b5cf6" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Multi-Tenant Isolé</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Chaque établissement (Tenant) dispose de son propre environnement. Les données sont strictement séparées grâce à un <code>tenantId</code> injecté cryptographiquement dans les tokens JWT.
            </p>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
            <ShieldCheck size={24} color="#10b981" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Pointage Anti-Fraude</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Le Kiosque RH intègre un algorithme de géolocalisation strict (Rayon d'action au mètre près) combiné à une capture photo en temps réel via WebRTC pour valider les présences.
            </p>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
            <LayoutTemplate size={24} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Design System Premium</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              L'interface s'affranchit des bibliothèques lourdes pour un CSS Vanilla pur. Le Dark Mode de la console SaaS garantit une ergonomie futuriste et un confort visuel optimal.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
