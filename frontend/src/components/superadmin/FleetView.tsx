import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Server, Activity, ShieldAlert, Power, RefreshCw, AlertCircle } from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';
import { api } from '../../lib/api';
import { Modal } from '../shared/Modal';
import { formatAmount, formatDate, formatNumber } from '../../lib/format';
import { readPricingPlans } from '../../lib/pricing';
import { removeStored } from '../../lib/storage';

const NEW_SIGNUP_ALERT_KEY = 'kpsydesk_new_signup_created';

interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  studentsCount: number;
  usersCount: number;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
}

export const FleetView: React.FC = () => {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [publishedPlans, setPublishedPlans] = useState<any[]>([]);
  const [newSignupAlert, setNewSignupAlert] = useState(false);

  // Nouveaux états du formulaire
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('COLLEGE');
  const [newPlanId, setNewPlanId] = useState('PRO');
  const [newEmail, setNewEmail] = useState('');

  // 1. Charger les plans publiés depuis localStorage
  useEffect(() => {
    const plans = readPricingPlans([
      { id: 'BASIC', name: 'Starter (Basic)', price: 25000 },
      { id: 'PRO', name: 'Professionnel', price: 45000 },
      { id: 'PREMIUM', name: 'Premium / Enterprise', price: 75000 }
    ]);
    setPublishedPlans(plans);
    if (plans.length > 0 && !plans.find((p: any) => p.id === newPlanId)) {
      setNewPlanId(plans[0].id);
    }

    // Vérification d'une notification de nouveau tenant créé via le portail d'inscription
    if (localStorage.getItem(NEW_SIGNUP_ALERT_KEY)) {
      setNewSignupAlert(true);
    }
  }, []);

  // 2. Charger le parc de tenants depuis l'API réelle (PostgreSQL)
  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await api.get('/platform/tenants', {
        headers: { Authorization: 'Bearer fake-jwt-token-superadmin' }
      });
      setTenants(res.data);
      // Effacer la notification après rechargement
      removeStored(NEW_SIGNUP_ALERT_KEY);
      setNewSignupAlert(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur de chargement des tenants.';
      setApiError(Array.isArray(msg) ? msg.join(' | ') : msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const saveTenants = (data: TenantData[]) => {
    setTenants(data);
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

    // 1. Création locale provisoire (le modal admin ne crée pas encore en BDD)
    // Le rechargement API est déclenché après fermeture du modal
    const newTenant: TenantData = {
      id: tenantId,
      name: newName,
      subdomain: newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      plan: selectedPlan.name || newPlanId,
      status: 'TRIAL',
      studentsCount: 0,
      usersCount: 1,
      contactEmail: newEmail,
      contactName: null,
      contactPhone: null,
      createdAt: new Date().toISOString(),
    };
    saveTenants([...tenants, newTenant]);

    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    // Recharger depuis l'API pour refléter l'état réel de la base
    loadTenants();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (window.confirm('Confirmer le changement de statut ?')) {
      const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      try {
        await api.patch(`/platform/tenants/${id}/status`, { status: newStatus }, {
          headers: { Authorization: 'Bearer fake-jwt-token-superadmin' }
        });
        // Recharger la liste depuis l'API pour refléter l'état réel en base
        await loadTenants();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Erreur lors du changement de statut.';
        alert(Array.isArray(msg) ? msg.join(' | ') : msg);
      }
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
      
      {/* Bandeau alerte nouveau signup */}
      {newSignupAlert && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: '#fff7ed', border: '1px solid #f59e0b', borderRadius: '10px', color: '#92400e' }}>
          <AlertCircle size={18} />
          <span style={{ fontWeight: 600 }}>Un nouvel établissement vient de s'inscrire via le portail public. Cliquez sur Actualiser pour le voir.</span>
          <button onClick={loadTenants} style={{ marginLeft: 'auto', padding: '6px 14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            Actualiser
          </button>
        </div>
      )}

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <CardKPI label="Total Établissements" value={tenants.length.toString()} icon={<Building2 size={24} />} trend="Source : BDD" isPositive={true} />
        <CardKPI label="Élèves gérés" value={formatNumber(tenants.reduce((acc, curr) => acc + curr.studentsCount, 0))} icon={<Activity size={24} />} trend="Données réelles" isPositive={true} />
        <CardKPI label="Tenants Suspendus" value={tenants.filter(t => t.status === 'SUSPENDED').length.toString()} icon={<ShieldAlert size={24} />} trend="Live" isPositive={true} />
        <CardKPI label="Santé Serveur" value="99.9%" icon={<Server size={24} />} trend="Optimal" isPositive={true} />
      </div>

      {/* Main List */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Parc de Tenants (Fleet)</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={loadTenants}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              <RefreshCw size={15} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              Actualiser
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              <Plus size={18} /> Provisionner un Tenant
            </button>
          </div>
        </div>

        {/* Erreur API */}
        {apiError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '16px', color: '#991b1b' }}>
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Spinner de chargement */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
            <p style={{ marginTop: '12px' }}>Chargement du parc de tenants...</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nom de l'Établissement</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Contact Admin</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Créé le</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Aucun établissement enregistré.
                  </td>
                </tr>
              )}
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    {t.name}<br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                      {t.subdomain}.kpsyschool.com &bull; {t.studentsCount} élèves
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{t.contactName ?? '—'}</span><br />
                    {t.contactEmail ?? '—'}
                  </td>
                  <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{t.plan}</td>
                  <td style={{ padding: '16px 12px' }}>{getStatusBadge(t.status)}</td>
                  <td style={{ padding: '16px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDate(t.createdAt)}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(t.id, t.status)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.status === 'SUSPENDED' ? 'var(--status-positive)' : 'var(--status-negative)' }}
                      title={t.status === 'SUSPENDED' ? 'Réactiver' : 'Suspendre'}
                    >
                      <Power size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Ajout */}
      {showAddModal && (
        <Modal maxWidth="400px" title="Nouveau Tenant" onClose={() => setShowAddModal(false)} contentStyle={{ borderRadius: '16px', backgroundColor: 'white' }}>
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
                      {p.name || p.nom} — {formatAmount(p.price || p.prix, 'FCFA')} / mois
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Créer</button>
              </div>
            </form>
        </Modal>
      )}

    </div>
  );
};
