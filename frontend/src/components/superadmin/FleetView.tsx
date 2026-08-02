import React, { useState, useEffect } from 'react';
import { Building2, Plus, Server, Activity, ShieldAlert, Power } from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';

interface TenantData {
  id: string;
  name: string;
  type: string;
  plan: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  studentsCount: number;
  contactEmail: string;
}

export const FleetView: React.FC = () => {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [publishedPlans, setPublishedPlans] = useState<any[]>([]);

  // Nouveaux états du formulaire
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('COLLEGE');
  const [newPlanId, setNewPlanId] = useState('PRO');
  const [newEmail, setNewEmail] = useState('');

  // 1. Charger les plans publiés en direct depuis la table plans / localStorage
  useEffect(() => {
    const savedPlans = localStorage.getItem('kpsydesk_pricing_plans');
    if (savedPlans) {
      try {
        const plans = JSON.parse(savedPlans);
        setPublishedPlans(plans);
        if (plans.length > 0 && !plans.find((p: any) => p.id === newPlanId)) {
          setNewPlanId(plans[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultPlans = [
        { id: 'BASIC', name: 'Starter (Basic)', price: 25000 },
        { id: 'PRO', name: 'Professionnel', price: 45000 },
        { id: 'PREMIUM', name: 'Premium / Enterprise', price: 75000 }
      ];
      setPublishedPlans(defaultPlans);
    }
  }, []);

  // 2. Charger le parc de tenants
  useEffect(() => {
    const savedTenants = localStorage.getItem('kpsydesk_tenants_fleet');
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    } else {
      const defaultTenants: TenantData[] = [
        { id: '1', name: 'Lycée d\'Excellence Birago Diop', type: 'LYCEE', plan: 'PREMIUM', status: 'ACTIVE', studentsCount: 1250, contactEmail: 'direction@birago.edu.sn' },
        { id: '2', name: 'Groupe Scolaire Les Pédagogues', type: 'ECOLE', plan: 'PRO', status: 'TRIAL', studentsCount: 450, contactEmail: 'contact@lespedagogues.sn' },
        { id: '3', name: 'Institut Supérieur de Management', type: 'FORMATION_PRO', plan: 'PREMIUM', status: 'SUSPENDED', studentsCount: 3200, contactEmail: 'admin@ism.edu.sn' }
      ];
      setTenants(defaultTenants);
      localStorage.setItem('kpsydesk_tenants_fleet', JSON.stringify(defaultTenants));
    }
  }, []);

  const saveTenants = (data: TenantData[]) => {
    setTenants(data);
    localStorage.setItem('kpsydesk_tenants_fleet', JSON.stringify(data));
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = `tenant_${Date.now()}`;
    
    // Trouver le plan sélectionné dans la table des plans publiés
    const selectedPlan = publishedPlans.find(p => p.id === newPlanId) || {
      id: newPlanId,
      name: newPlanId,
      price: newPlanId === 'BASIC' ? 25000 : (newPlanId === 'PRO' ? 45000 : 75000)
    };

    const lockedPriceAtCreation = Number(selectedPlan.price || selectedPlan.prix);

    // 1. Création du tenant dans le parc
    const newTenant: TenantData = {
      id: tenantId,
      name: newName,
      type: newType,
      plan: selectedPlan.name || newPlanId,
      status: 'TRIAL',
      studentsCount: 0,
      contactEmail: newEmail,
    };
    saveTenants([...tenants, newTenant]);

    // 2. CRITICAL : Insertion immédiate dans tenant_subscriptions avec prix_verrouille = plans.prix AU MOMENT T
    const newSubscription = {
      id: `sub_${Date.now()}`,
      tenantId: tenantId,
      planId: selectedPlan.id,
      prixVerrouille: lockedPriceAtCreation, // COPIE FIGÉE DU PRIX LIVE À LA CRÉATION
      dateDebutCycle: new Date().toISOString(),
      dateProchainRenouvellement: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      statut: 'ACTIF'
    };
    localStorage.setItem(`kpsydesk_tenant_sub_${tenantId}`, JSON.stringify(newSubscription));

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    if (window.confirm('Confirmer le changement de statut ?')) {
      const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      saveTenants(tenants.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-positive)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>ACTIF</span>;
      case 'TRIAL': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-warning)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>ESSAI</span>;
      case 'SUSPENDED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-negative)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>SUSPENDU</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <CardKPI label="Total Établissements" value={tenants.length.toString()} icon={<Building2 size={24} />} trend="+2 ce mois" isPositive={true} />
        <CardKPI label="Élèves gérés" value={tenants.reduce((acc, curr) => acc + curr.studentsCount, 0).toLocaleString('fr-FR')} icon={<Activity size={24} />} trend="+15%" isPositive={true} />
        <CardKPI label="Tenants Suspendus" value={tenants.filter(t => t.status === 'SUSPENDED').length.toString()} icon={<ShieldAlert size={24} />} trend="0" isPositive={true} />
        <CardKPI label="Santé Serveur" value="99.9%" icon={<Server size={24} />} trend="Optimal" isPositive={true} />
      </div>

      {/* Main List */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Parc de Tenants (Fleet)</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} /> Provisionner un Tenant
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nom de l'Établissement</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Contact</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                  {t.name} <br/>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Type: {t.type} | {t.studentsCount} élèves</span>
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{t.contactEmail}</td>
                <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)' }}>{t.plan}</td>
                <td style={{ padding: '16px 12px' }}>{getStatusBadge(t.status)}</td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button onClick={() => toggleStatus(t.id, t.status)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.status === 'SUSPENDED' ? 'var(--status-positive)' : 'var(--status-negative)' }} title="Changer le statut">
                    <Power size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '400px' }}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-title)' }}>Nouveau Tenant</h3>
            <form onSubmit={handleAddTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input placeholder="Nom de l'établissement" value={newName} onChange={e => setNewName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <input type="email" placeholder="Email du contact" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              
              <select value={newType} onChange={e => setNewType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <option value="ECOLE">École Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
                <option value="FORMATION_PRO">Formation Pro</option>
              </select>

              {/* SÉLECTEUR DYNAMIQUE DE PLANS PUBLIÉS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Plan d'Abonnement (Direct Table Plans)</label>
                <select value={newPlanId} onChange={e => setNewPlanId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {publishedPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.nom} — {(p.price || p.prix || 0).toLocaleString('fr-FR')} FCFA / mois
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
