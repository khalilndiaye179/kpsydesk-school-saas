import React, { useState, useEffect } from 'react';
import { MessagesSquare, Clock, AlertCircle, LogIn } from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';

interface Ticket {
  id: string;
  tenantName: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export const SupportView: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [impersonatedTenant, setImpersonatedTenant] = useState<string | null>(null);

  useEffect(() => {
    const savedTickets = localStorage.getItem('kpsydesk_support_tickets');
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
      const defaultTickets: Ticket[] = [
        { id: 'TK-1042', tenantName: "Lycée d'Excellence Birago Diop", subject: 'Problème de synchronisation des emplois du temps', status: 'OPEN', priority: 'HIGH', createdAt: '2023-10-15 08:30' },
        { id: 'TK-1043', tenantName: "Institut Supérieur de Management", subject: 'Configuration du module Export Légal', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2023-10-14 14:15' },
        { id: 'TK-1040', tenantName: "Groupe Scolaire Les Pédagogues", subject: 'Erreur lors de la facturation cantine', status: 'RESOLVED', priority: 'LOW', createdAt: '2023-10-10 10:00' },
      ];
      setTickets(defaultTickets);
      localStorage.setItem('kpsydesk_support_tickets', JSON.stringify(defaultTickets));
    }
  }, []);

  const handleImpersonate = (tenantName: string) => {
    const consent = window.confirm(`⚠️ ATTENTION : Vous êtes sur le point de vous connecter en tant que Super Admin sur l'espace du tenant "${tenantName}". 
Cette action est strictement tracée dans le journal d'audit et doit faire suite à une demande explicite du client.

Voulez-vous continuer ?`);
    
    if (consent) {
      setImpersonatedTenant(tenantName);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'HIGH': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-negative)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>URGENT</span>;
      case 'MEDIUM': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-warning)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>NORMAL</span>;
      case 'LOW': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-sidebar-active)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>FAIBLE</span>;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'OPEN': return <span style={{ color: 'var(--status-negative)', fontWeight: 600 }}>Ouvert</span>;
      case 'IN_PROGRESS': return <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>En cours</span>;
      case 'RESOLVED': return <span style={{ color: 'var(--status-positive)', fontWeight: 600 }}>Résolu</span>;
      default: return status;
    }
  };

  if (impersonatedTenant) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid var(--status-negative)', position: 'relative', overflow: 'hidden' }}>
        {/* Bandeau d'avertissement permanent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'var(--status-negative)', color: 'white', padding: '12px', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          MODE IMPERSONATION ACTIF : Vous agissez sur les données de {impersonatedTenant}. Toutes vos actions sont enregistrées de façon non répudiable.
        </div>
        
        <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '16px' }}>Espace Tenant : {impersonatedTenant}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Vous êtes connecté en tant que technicien de support. Vous avez un accès complet pour diagnostiquer et résoudre le ticket.
          </p>
          <button 
            onClick={() => setImpersonatedTenant(null)}
            style={{ padding: '12px 24px', backgroundColor: '#12131A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Quitter la session d'impersonation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* KPI Support */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <CardKPI label="Tickets Ouverts" value={tickets.filter(t => t.status === 'OPEN').length.toString()} icon={<AlertCircle size={24} />} trend="+2 aujourd'hui" isPositive={false} />
        <CardKPI label="En cours de traitement" value={tickets.filter(t => t.status === 'IN_PROGRESS').length.toString()} icon={<Clock size={24} />} trend="Normal" isPositive={true} />
        <CardKPI label="Résolus (30j)" value="142" icon={<MessagesSquare size={24} />} trend="+12" isPositive={true} />
      </div>

      {/* Liste des Tickets */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Tickets de Support Récents</h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>N° Ticket</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Établissement</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Sujet</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Priorité</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(tk => (
              <tr key={tk.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{tk.id}</td>
                <td style={{ padding: '16px 12px', fontWeight: 500 }}>{tk.tenantName}</td>
                <td style={{ padding: '16px 12px' }}>
                  {tk.subject}<br/>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Créé le {tk.createdAt}</span>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'center' }}>{getPriorityBadge(tk.priority)}</td>
                <td style={{ padding: '16px 12px', textAlign: 'center' }}>{getStatusText(tk.status)}</td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleImpersonate(tk.tenantName)} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }} 
                    title="Se connecter au tenant pour diagnostiquer"
                  >
                    <LogIn size={16} /> Diagnostiquer (Impersonation)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
