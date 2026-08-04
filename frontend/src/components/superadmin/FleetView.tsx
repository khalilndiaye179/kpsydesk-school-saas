import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Plus, Server, Activity, ShieldAlert, Power, RefreshCw, AlertCircle,
  Eye, Award, KeyRound, Trash2, Check, Copy, X, Mail, Phone, User, Calendar, Shield, Cpu
} from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';
import { api } from '../../lib/api';
import { formatCurrency } from '../../config/countries.config';

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

  // Modales d'action SuperAdmin
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState('');
  
  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetResult, setResetResult] = useState<{ adminEmail: string; adminName: string; tempPassword: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Purge Modal
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInput, setPurgeInput] = useState('');

  // Nouveaux états du formulaire d'ajout
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('COLLEGE');
  const [newPlanId, setNewPlanId] = useState('PRO');
  const [newEmail, setNewEmail] = useState('');

  const token = localStorage.getItem('kpsydesk_access_token') || '';
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // 1. Charger les plans publiés depuis localStorage ou valeurs par défaut
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
        { id: 'TRIAL_7D', name: 'Essai Gratuit 7 Jours', price: 0 },
        { id: 'STANDARD', name: 'Standard (Base)', price: 25000 },
        { id: 'PREMIUM', name: 'Professionnel (PRO)', price: 45000 },
        { id: 'PRO', name: 'Premium Full', price: 75000 },
        { id: 'ENTERPRISE', name: 'Sur Mesure (Enterprise)', price: 150000 },
      ];
      setPublishedPlans(defaultPlans);
    }

    const signupAlert = localStorage.getItem('kpsydesk_new_signup_created');
    if (signupAlert) {
      setNewSignupAlert(true);
    }
  }, []);

  // 2. Charger le parc de tenants depuis l'API réelle (PostgreSQL)
  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await api.get('/platform/tenants', { headers: authHeaders });
      setTenants(res.data);
      localStorage.removeItem('kpsydesk_new_signup_created');
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

  // Actions d'administration
  const toggleStatus = async (id: string, currentStatus: string) => {
    if (window.confirm('Confirmer le changement de statut (Suspendre / Activer) ?')) {
      const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      try {
        await api.patch(`/platform/tenants/${id}/status`, { status: newStatus }, { headers: authHeaders });
        await loadTenants();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Erreur lors du changement de statut.';
        alert(Array.isArray(msg) ? msg.join(' | ') : msg);
      }
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedTenant || !selectedPlanForEdit) return;
    try {
      await api.patch(`/platform/tenants/${selectedTenant.id}/plan`, { plan: selectedPlanForEdit }, { headers: authHeaders });
      setShowPlanModal(false);
      setSelectedTenant(null);
      await loadTenants();
    } catch (err: any) {
      alert("Erreur lors de la mise à jour du plan : " + (err?.response?.data?.message || err.message));
    }
  };

  const handleResetPassword = async (tenant: TenantData) => {
    setSelectedTenant(tenant);
    setResetResult(null);
    setShowResetModal(true);
    try {
      const res = await api.post(`/platform/tenants/${tenant.id}/reset-password`, {}, { headers: authHeaders });
      setResetResult(res.data);
    } catch (err: any) {
      alert("Erreur lors de la réinitialisation : " + (err?.response?.data?.message || err.message));
    }
  };

  const handlePurgeTenant = async () => {
    if (purgeInput.trim() !== 'PURGER' || !selectedTenant) return;
    try {
      await api.delete(`/platform/tenants/${selectedTenant.id}`, { headers: authHeaders });
      setShowPurgeModal(false);
      setSelectedTenant(null);
      setPurgeInput('');
      await loadTenants();
    } catch (err: any) {
      alert("Erreur lors de la purge : " + (err?.response?.data?.message || err.message));
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      await api.post('/platform/tenants', {
        name: newName,
        email: newEmail,
        plan: newPlanId,
      }, { headers: authHeaders });

      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      await loadTenants();
    } catch (err: any) {
      alert("Erreur lors de la création de l'établissement : " + (err?.response?.data?.message || err.message));
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
        <CardKPI label="Élèves gérés" value={tenants.reduce((acc, curr) => acc + curr.studentsCount, 0).toLocaleString('fr-FR')} icon={<Activity size={24} />} trend="Données réelles" isPositive={true} />
        <CardKPI label="Tenants Suspendus" value={tenants.filter(t => t.status === 'SUSPENDED').length.toString()} icon={<ShieldAlert size={24} />} trend="Live" isPositive={true} />
        <CardKPI label="Santé Serveur" value="99.9%" icon={<Server size={24} />} trend="Optimal" isPositive={true} />
      </div>

      {/* Main List */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Parc de Tenants (Fleet Management)</h3>
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
                <th style={{ padding: '12px', textAlign: 'left' }}>Établissement</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Contact Admin</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Plan Actuel</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Inscrit le</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions d'Administration</th>
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
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{t.contactName ?? 'Non spécifié'}</span><br />
                    {t.contactEmail ?? '—'}
                  </td>
                  <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{t.plan}</td>
                  <td style={{ padding: '16px 12px' }}>{getStatusBadge(t.status)}</td>
                  <td style={{ padding: '16px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      
                      {/* 1. Bouton Fiche Client */}
                      <button
                        onClick={() => { setSelectedTenant(t); setShowDetailModal(true); }}
                        style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Fiche Client"
                      >
                        <Eye size={14} /> Fiche
                      </button>

                      {/* 2. Bouton Licence & Plan */}
                      <button
                        onClick={() => { setSelectedTenant(t); setSelectedPlanForEdit(t.plan); setShowPlanModal(true); }}
                        style={{ padding: '6px 10px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Changer de Plan / Licence"
                      >
                        <Award size={14} /> Licence
                      </button>

                      {/* 3. Bouton Reset Password Manuel */}
                      <button
                        onClick={() => handleResetPassword(t)}
                        style={{ padding: '6px 10px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer', color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                        title="Réinitialiser Mot de Passe Admin"
                      >
                        <KeyRound size={14} /> Reset Pass
                      </button>

                      {/* 4. Bouton On/Off Statut */}
                      <button
                        onClick={() => toggleStatus(t.id, t.status)}
                        style={{ padding: '6px 8px', backgroundColor: t.status === 'SUSPENDED' ? '#dcfce7' : '#fee2e2', border: `1px solid ${t.status === 'SUSPENDED' ? '#86efac' : '#fca5a5'}`, borderRadius: '6px', cursor: 'pointer', color: t.status === 'SUSPENDED' ? '#166534' : '#991b1b' }}
                        title={t.status === 'SUSPENDED' ? 'Réactiver' : 'Suspendre'}
                      >
                        <Power size={14} />
                      </button>

                      {/* 5. Bouton Purger */}
                      <button
                        onClick={() => { setSelectedTenant(t); setPurgeInput(''); setShowPurgeModal(true); }}
                        style={{ padding: '6px 8px', backgroundColor: '#450a0a', border: '1px solid #991b1b', borderRadius: '6px', cursor: 'pointer', color: '#f87171' }}
                        title="Purger définitivement l'établissement"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1 : FICHE CLIENT */}
      {showDetailModal && selectedTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0284c7' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>Fiche Client Établissement</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedTenant.subdomain}.kpsyschool.com</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>NOM & PRÉNOM CONTACT ADMIN</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedTenant.contactName || 'Non renseigné'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ADRESSE EMAIL D'ADMINISTRATION</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedTenant.contactEmail || 'Non renseigné'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>TÉLÉPHONE DIRECT</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedTenant.contactPhone || 'Non renseigné'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>PLAN SAAS</span>
                  <strong style={{ color: '#0f172a' }}>{selectedTenant.plan}</strong>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>STATUT COMPTE</span>
                  <div>{getStatusBadge(selectedTenant.status)}</div>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Élèves gérés : <strong>{selectedTenant.studentsCount}</strong></span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Utilisateurs : <strong>{selectedTenant.usersCount}</strong></span>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : AFFECTER / MODIFIER UN PLAN (LICENCE) */}
      {showPlanModal && selectedTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '450px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="#0284c7" /> Affecter un Plan SaaS
              </h3>
              <button onClick={() => setShowPlanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
              Modifiez manuellement le plan ou redimensionnez la licence pour <strong>{selectedTenant.name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>Choisir le nouveau plan</label>
                <select 
                  value={selectedPlanForEdit} 
                  onChange={e => setSelectedPlanForEdit(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                >
                  {publishedPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.nom || p.id} ({p.id})
                    </option>
                  ))}
                  <option value="TRIAL_7D">TRIAL_7D (Essai 7 jours)</option>
                  <option value="STANDARD">STANDARD (Starter)</option>
                  <option value="PREMIUM">PREMIUM (Pro)</option>
                  <option value="PRO">PRO (Full)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Sur-mesure)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setShowPlanModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleUpdatePlan} style={{ flex: 1, padding: '12px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Enregistrer le Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3 : RESET MOT DE PASSE MANUEL */}
      {showResetModal && selectedTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '480px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                <KeyRound color="#d97706" /> Réinitialisation Mot de Passe Admin
              </h3>
              <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            {!resetResult ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#d97706' }} />
                <p style={{ marginTop: '12px', color: '#64748b' }}>Génération d'un nouveau mot de passe sécurisé...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', color: '#92400e', fontSize: '0.85rem' }}>
                  Un mot de passe temporaire a été généré pour l'administrateur de l'établissement <strong>{selectedTenant.name}</strong>.
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ADMINISTRATEUR CIBLE</span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{resetResult.adminName} ({resetResult.adminEmail})</strong>
                </div>

                {/* Champ d'affichage du mot de passe avec copie */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>MOT DE PASSE TEMPORAIRE DÉFINI</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#020617', padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155' }}>
                    <span style={{ color: '#38bdf8', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '2px', flex: 1, fontFamily: 'monospace' }}>
                      {resetResult.tempPassword}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resetResult.tempPassword);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      style={{ padding: '8px 12px', backgroundColor: isCopied ? '#10b981' : '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  💡 Vous pouvez copier ce mot de passe et l'envoyer manuellement au client (WhatsApp/Email) si besoin.
                </p>

                <button onClick={() => setShowResetModal(false)} style={{ padding: '12px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                  Terminé
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4 : PURGER DÉFINITIVEMENT UN TENANT */}
      {showPurgeModal && selectedTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '460px', padding: '32px', border: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <Trash2 color="#dc2626" /> Purge Définitive d'Établissement
              </h3>
              <button onClick={() => setShowPurgeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '12px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '20px' }}>
              ⚠️ <strong>ATTENTION : ACTION IRRÉVERSIBLE !</strong><br />
              Cette action supprimera définitivement le tenant <strong>{selectedTenant.name}</strong> ainsi que l'ensemble de ses comptes, élèves, classes, cours et données de comptabilité.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Pour confirmer, saisissez précisément le mot <strong style={{ color: '#dc2626' }}>PURGER</strong> :
                </label>
                <input
                  type="text"
                  placeholder="Tapez PURGER"
                  value={purgeInput}
                  onChange={e => setPurgeInput(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #fca5a5', outline: 'none', fontSize: '1rem', fontWeight: 700, letterSpacing: '2px', textAlign: 'center', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setShowPurgeModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button 
                  onClick={handlePurgeTenant}
                  disabled={purgeInput.trim() !== 'PURGER'}
                  style={{ flex: 1, padding: '12px', backgroundColor: purgeInput.trim() === 'PURGER' ? '#dc2626' : '#fca5a5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: purgeInput.trim() === 'PURGER' ? 'pointer' : 'not-allowed' }}
                >
                  PURGER CE TENANT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Plan d'Abonnement</label>
                <select value={newPlanId} onChange={e => setNewPlanId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {publishedPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.nom} — {formatCurrency(p.price || p.prix || 0)} / mois
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
