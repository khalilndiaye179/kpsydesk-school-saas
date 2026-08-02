import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Building2, Plus, Search, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Eye, FileBadge, RefreshCcw, Trash2, Tag } from 'lucide-react';
import { api } from '../../lib/api';
import { readStoredOrSeed, writeStored } from '../../lib/storage';

const SUPERADMIN_TENANTS_KEY = 'kpsydesk_superadmin_tenants';

interface TenantData {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  studentsCount: number;
}

export const TenantsManager: React.FC = () => {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState<{ type: string, tenant: TenantData | null }>({ type: '', tenant: null });
  const [purgeInput, setPurgeInput] = useState('');

  // Nouveaux champs tenant
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('Pro');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    // Simulons la récupération des tenants (car on n'a pas encore la route admin/tenants dans le backend)
    // Mais on prévoit l'hybride pour respecter la règle.
    try {
      const response = await api.get('/admin/tenants');
      setTenants(response.data);
    } catch (err) {
      console.warn('Erreur API /admin/tenants (Attendue en Phase 5), fallback local');
      setTenants(readStoredOrSeed<TenantData[]>(SUPERADMIN_TENANTS_KEY, [
        { id: '1', name: 'Lycée d\'Excellence', domain: 'excellence.kpsydesk.com', plan: 'Premium', status: 'ACTIVE', createdAt: '2023-01-15', studentsCount: 450 },
        { id: '2', name: 'Collège Saint-Louis', domain: 'stlouis.kpsydesk.com', plan: 'Pro', status: 'ACTIVE', createdAt: '2023-03-22', studentsCount: 320 },
        { id: '3', name: 'Groupe Scolaire Les Pédagogues', domain: 'pedagogues.kpsydesk.com', plan: 'Basic', status: 'SUSPENDED', createdAt: '2023-05-10', studentsCount: 150 },
      ]));
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain) return;

    try {
      // API call (simulé pour le moment)
      await api.post('/admin/tenants', { name, domain, plan });
      fetchTenants();
    } catch (err) {
      const newTenant: TenantData = {
        id: Date.now().toString(),
        name,
        domain: domain + '.kpsydesk.com',
        plan,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
        studentsCount: 0
      };
      const updated = [newTenant, ...tenants];
      setTenants(updated);
      writeStored(SUPERADMIN_TENANTS_KEY, updated);
    }

    setShowModal(false);
    setName('');
    setDomain('');
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    const updated = tenants.map(t => {
      if (t.id === id) {
        return { ...t, status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } as TenantData;
      }
      return t;
    });
    setTenants(updated);
    writeStored(SUPERADMIN_TENANTS_KEY, updated);
  };

  const handlePurge = (e: React.FormEvent) => {
    e.preventDefault();
    if (purgeInput === 'PURGE' && actionModal.tenant) {
      const updated = tenants.filter(t => t.id !== actionModal.tenant!.id);
      setTenants(updated);
      writeStored(SUPERADMIN_TENANTS_KEY, updated);
      setActionModal({ type: '', tenant: null });
      setPurgeInput('');
    } else {
      alert("Validation incorrecte. Veuillez taper PURGE en majuscules.");
    }
  };

  const filteredTenants = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.domain.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Gestion des Écoles
          </h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Liste et statut des établissements utilisant KPsyDesk.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Inscrire une école
        </button>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '10px 16px', borderRadius: '8px', flex: 1, border: '1px solid #334155' }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Rechercher une école ou un domaine..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '16px 12px' }}>Établissement</th>
              <th style={{ padding: '16px 12px' }}>Domaine</th>
              <th style={{ padding: '16px 12px' }}>Plan</th>
              <th style={{ padding: '16px 12px' }}>Élèves</th>
              <th style={{ padding: '16px 12px' }}>Statut</th>
              <th style={{ padding: '16px 12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #334155', color: '#38bdf8' }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{t.name}</p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Depuis {t.createdAt}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#cbd5e1' }}>{t.domain}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                    backgroundColor: t.plan === 'Premium' ? 'rgba(139, 92, 246, 0.2)' : t.plan === 'Pro' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: t.plan === 'Premium' ? '#c084fc' : t.plan === 'Pro' ? '#60a5fa' : '#94a3b8'
                  }}>
                    {t.plan}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', fontFamily: 'var(--font-data)' }}>{t.studentsCount}</td>
                <td style={{ padding: '16px 12px' }}>
                  {t.status === 'ACTIVE' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Actif
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      <XCircle size={16} /> Suspendu
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    title="Voir Fiche"
                    onClick={() => setActionModal({ type: 'fiche', tenant: t })}
                    style={{ background: '#334155', border: 'none', padding: '6px', borderRadius: '6px', color: '#cbd5e1', cursor: 'pointer' }}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    title="Licence"
                    onClick={() => setActionModal({ type: 'licence', tenant: t })}
                    style={{ background: '#334155', border: 'none', padding: '6px', borderRadius: '6px', color: '#f59e0b', cursor: 'pointer' }}
                  >
                    <FileBadge size={16} />
                  </button>
                  <button 
                    title="Affecter un plan"
                    onClick={() => setActionModal({ type: 'plan', tenant: t })}
                    style={{ background: '#334155', border: 'none', padding: '6px', borderRadius: '6px', color: '#38bdf8', cursor: 'pointer' }}
                  >
                    <Tag size={16} />
                  </button>
                  <button 
                    title="Reset manuel"
                    onClick={() => setActionModal({ type: 'reset', tenant: t })}
                    style={{ background: '#334155', border: 'none', padding: '6px', borderRadius: '6px', color: '#8b5cf6', cursor: 'pointer' }}
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button 
                    title={t.status === 'ACTIVE' ? "Suspendre" : "Réactiver"}
                    onClick={() => toggleStatus(t.id, t.status)}
                    style={{ background: t.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: t.status === 'ACTIVE' ? '#ef4444' : '#10b981', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {t.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                  </button>
                  <button 
                    title="PURGER (Suppression définitive)"
                    onClick={() => { setPurgeInput(''); setActionModal({ type: 'purge', tenant: t }); }}
                    style={{ background: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Aucune école trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      {showModal && (
        <Modal variant="dark" maxWidth="450px" title="Nouvelle École" onClose={() => setShowModal(false)} contentStyle={{ borderRadius: '16px' }}>
            <form onSubmit={handleAddTenant} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nom de l'établissement</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)} required 
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} 
                  placeholder="Ex. Lycée d'Excellence"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sous-domaine (URL)</label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                  <input 
                    type="text" value={domain} onChange={e => setDomain(e.target.value)} required 
                    style={{ padding: '12px', border: 'none', backgroundColor: 'transparent', color: 'white', outline: 'none', flex: 1 }} 
                    placeholder="excellence"
                  />
                  <span style={{ padding: '0 16px', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#1e293b', borderLeft: '1px solid #334155', height: '100%', display: 'flex', alignItems: 'center' }}>
                    .kpsydesk.com
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Forfait de base</label>
                <select 
                  value={plan} onChange={e => setPlan(e.target.value)} 
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
                >
                  <option value="Basic">Basic (Jusqu'à 150 élèves)</option>
                  <option value="Pro">Pro (Jusqu'à 500 élèves)</option>
                  <option value="Premium">Premium (Illimité)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Créer l'école</button>
              </div>
            </form>
        </Modal>
      )}

      {/* Action Modals */}
      {actionModal.type === 'fiche' && actionModal.tenant && (
        <Modal variant="dark" maxWidth="450px" showCloseButton={false} contentStyle={{ borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem' }}>Fiche de l'Établissement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#cbd5e1' }}>
              <p><strong>Nom :</strong> {actionModal.tenant.name}</p>
              <p><strong>Domaine :</strong> {actionModal.tenant.domain}</p>
              <p><strong>Email Admin :</strong> admin@{actionModal.tenant.domain}</p>
              <p><strong>Téléphone (OTP) :</strong> +221 7X XXX XX XX</p>
              <p><strong>Date d'inscription :</strong> {actionModal.tenant.createdAt}</p>
            </div>
            <button onClick={() => setActionModal({ type: '', tenant: null })} style={{ width: '100%', marginTop: '24px', padding: '12px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
        </Modal>
      )}

      {actionModal.type === 'licence' && actionModal.tenant && (
        <Modal variant="dark" maxWidth="450px" showCloseButton={false} contentStyle={{ borderRadius: '16px', border: '1px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: '#f59e0b' }}>Licence Logicielle</h3>
            <div style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 8px 0' }}>LICENCE: KPSY-{actionModal.tenant.id}-2024</p>
              <p style={{ margin: '0 0 8px 0' }}>TYPE: {actionModal.tenant.plan.toUpperCase()}</p>
              <p style={{ margin: '0' }}>STATUS: VALID</p>
            </div>
            <button onClick={() => setActionModal({ type: '', tenant: null })} style={{ width: '100%', marginTop: '24px', padding: '12px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
        </Modal>
      )}

      {actionModal.type === 'plan' && actionModal.tenant && (
        <Modal variant="dark" maxWidth="450px" showCloseButton={false} contentStyle={{ borderRadius: '16px', border: '1px solid #38bdf8' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Affecter un Plan</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Forcer manuellement un plan pour {actionModal.tenant.name}.</p>
            <select style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}>
              <option>Basic</option>
              <option>Pro</option>
              <option>Premium</option>
            </select>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setActionModal({ type: '', tenant: null })} style={{ flex: 1, padding: '12px', backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { alert('Plan affecté manuellement.'); setActionModal({ type: '', tenant: null }); }} style={{ flex: 1, padding: '12px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', color: '#0f172a', cursor: 'pointer', fontWeight: 600 }}>Appliquer</button>
            </div>
        </Modal>
      )}

      {actionModal.type === 'reset' && actionModal.tenant && (
        <Modal variant="dark" maxWidth="450px" showCloseButton={false} contentStyle={{ borderRadius: '16px', border: '1px solid #8b5cf6' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>Reset Manuel des accès</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>Générer de nouveaux identifiants administrateur temporaires pour {actionModal.tenant.name} et les envoyer par SMS/Email.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActionModal({ type: '', tenant: null })} style={{ flex: 1, padding: '12px', backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { alert('Nouveaux accès envoyés à l\'administrateur du locataire.'); setActionModal({ type: '', tenant: null }); }} style={{ flex: 1, padding: '12px', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Générer et Envoyer</button>
            </div>
        </Modal>
      )}

      {actionModal.type === 'purge' && actionModal.tenant && (
        <Modal variant="dark" maxWidth="450px" showCloseButton={false} contentStyle={{ borderRadius: '16px', border: '2px solid #ef4444' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert /> Zone Dangereuse
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.5' }}>
              Vous êtes sur le point de <strong>PURGER</strong> l'établissement <em>{actionModal.tenant.name}</em>. Cette action détruira définitivement toutes ses données, bases de données, factures et accès.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>Pour confirmer, tapez le mot <strong>PURGE</strong> ci-dessous :</p>
            <form onSubmit={handlePurge}>
              <input 
                type="text" 
                value={purgeInput} 
                onChange={e => setPurgeInput(e.target.value)} 
                placeholder="Tapez PURGE"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', marginBottom: '24px', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '2px' }}
                required
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { setActionModal({ type: '', tenant: null }); setPurgeInput(''); }} style={{ flex: 1, padding: '12px', backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={purgeInput !== 'PURGE'} style={{ flex: 1, padding: '12px', backgroundColor: purgeInput === 'PURGE' ? '#ef4444' : 'rgba(239, 68, 68, 0.5)', border: 'none', borderRadius: '8px', color: 'white', cursor: purgeInput === 'PURGE' ? 'pointer' : 'not-allowed', fontWeight: 600 }}>Confirmer la Purge</button>
              </div>
            </form>
        </Modal>
      )}

    </div>
  );
};
