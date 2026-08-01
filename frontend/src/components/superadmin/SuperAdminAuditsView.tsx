import React, { useState } from 'react';
import { Activity, Filter, Calendar, Search } from 'lucide-react';

export const SuperAdminAuditsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation des logs d'audit
  const audits = [
    { id: 1, date: '2023-10-15 14:32', user: 'admin@kpsydesk.com', action: 'Création d\'un nouveau locataire (Tenant)', target: 'Lycée Excellence', type: 'CREATE' },
    { id: 2, date: '2023-10-14 09:12', user: 'compta@kpsydesk.com', action: 'Modification clé API Wave', target: 'Paramètres Globaux', type: 'UPDATE' },
    { id: 3, date: '2023-10-14 08:45', user: 'admin@kpsydesk.com', action: 'Suspension de l\'école', target: 'Institut Supérieur', type: 'DANGER' },
    { id: 4, date: '2023-10-13 16:20', user: 'support@kpsydesk.com', action: 'Attribution du module "Transport"', target: 'Collège Saint-Louis', type: 'UPDATE' },
    { id: 5, date: '2023-10-12 11:05', user: 'Système Automatique', action: 'Génération des factures mensuelles', target: 'Tous les locataires', type: 'SYSTEM' },
    { id: 6, date: '2023-10-10 10:00', user: 'admin@kpsydesk.com', action: 'Ajout collaborateur (Fatou Sow)', target: 'Console Admin', type: 'CREATE' },
  ];

  const filteredAudits = audits.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'CREATE': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'UPDATE': return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' };
      case 'DANGER': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'SYSTEM': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: '#334155', color: '#cbd5e1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Audits & Traçabilité
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Journal des événements critiques et actions effectuées sur la plateforme SaaS.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Calendar size={18} /> Période
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Filter size={18} /> Filtrer
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
        
        {/* Barre de recherche */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '24px', width: '100%', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
          <input 
            type="text" 
            placeholder="Rechercher une action, un utilisateur ou une cible..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        {/* Tableau des logs */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Date & Heure</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Utilisateur (Admin)</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Type d'Action</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Action Effectuée</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Cible / Objet</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map(audit => (
              <tr key={audit.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px 12px', color: '#94a3b8', fontFamily: 'var(--font-data)' }}>{audit.date}</td>
                <td style={{ padding: '16px 12px', color: 'white', fontWeight: 500 }}>{audit.user}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                    backgroundColor: getBadgeColor(audit.type).bg,
                    color: getBadgeColor(audit.type).color
                  }}>
                    {audit.type}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', color: '#cbd5e1' }}>{audit.action}</td>
                <td style={{ padding: '16px 12px', color: '#38bdf8', fontWeight: 500 }}>{audit.target}</td>
              </tr>
            ))}
            {filteredAudits.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Aucun enregistrement d'audit trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
