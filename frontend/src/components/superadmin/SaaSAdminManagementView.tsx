import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, CheckCircle2, XCircle, CreditCard, Layers, Save, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../config/countries.config';

export const SaaSAdminManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PLANS' | 'METHODS'>('PLANS');
  const [plans, setPlans] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [editingMethod, setEditingMethod] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/plans').catch(() => ({ data: [] })),
      api.get('/admin/payment-methods').catch(() => ({ data: [] })),
    ])
      .then(([plansRes, methodsRes]) => {
        setPlans(plansRes.data || []);
        setMethods(methodsRes.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePlanActive = async (plan: any) => {
    try {
      await api.put(`/admin/plans/${plan.id}`, { isActive: !plan.isActive });
      setFeedback(`Plan ${plan.name} ${!plan.isActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'} avec succès.`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la mise à jour du plan.');
    }
  };

  const handleToggleMethodActive = async (method: any) => {
    try {
      await api.put(`/admin/payment-methods/${method.id}`, { isActive: !method.isActive });
      setFeedback(`Moyen de paiement ${method.label} ${!method.isActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'} avec succès.`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la mise à jour du moyen de paiement.');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      if (editingPlan.id) {
        await api.put(`/admin/plans/${editingPlan.id}`, editingPlan);
      } else {
        await api.post('/admin/plans', editingPlan);
      }
      setEditingPlan(null);
      setFeedback('Plan enregistré avec succès.');
      loadData();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement du plan.');
    }
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    try {
      if (editingMethod.id) {
        await api.put(`/admin/payment-methods/${editingMethod.id}`, editingMethod);
      } else {
        await api.post('/admin/payment-methods', editingMethod);
      }
      setEditingMethod(null);
      setFeedback('Moyen de paiement enregistré avec succès.');
      loadData();
    } catch (err) {
      alert('Erreur lors de l\'enregistrement du moyen de paiement.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Onglets de navigation console SaaS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('PLANS')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
              border: 'none', backgroundColor: activeTab === 'PLANS' ? '#38bdf8' : '#1e293b',
              color: activeTab === 'PLANS' ? '#0f172a' : '#cbd5e1', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Layers size={18} /> Gestion Dynamique des Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('METHODS')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
              border: 'none', backgroundColor: activeTab === 'METHODS' ? '#38bdf8' : '#1e293b',
              color: activeTab === 'METHODS' ? '#0f172a' : '#cbd5e1', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <CreditCard size={18} /> Moyens de Règlement (Wave/OM/RIB)
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'PLANS') {
              setEditingPlan({ name: '', price: 25000, quotaStudents: 500, description: '', features: [], isActive: true, isPublic: true });
            } else {
              setEditingMethod({ code: '', label: '', instructions: '', iconColor: '#2563eb', isActive: true, displayOrder: methods.length + 1 });
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={18} /> {activeTab === 'PLANS' ? 'Ajouter un Plan' : 'Ajouter un Moyen de Paiement'}
        </button>
      </div>

      {feedback && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px 16px', borderRadius: '10px', fontWeight: 600 }}>
          {feedback}
        </div>
      )}

      {/* ONGLET 1 : GESTION DES PLANS */}
      {activeTab === 'PLANS' && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
          <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '1.2rem' }}>Catalogue des Plans Tarifaires SaaS</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nom du Plan</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Prix Mensuel</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Quota Élèves</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Affichage Public</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Statut Système</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #334155', opacity: p.isActive ? 1 : 0.6 }}>
                  <td style={{ padding: '14px', color: 'white', fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: '14px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#cbd5e1' }}>{p.quotaStudents.toLocaleString()} élèves</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {p.isPublic ? <span style={{ color: '#38bdf8' }}>Public</span> : <span style={{ color: '#94a3b8' }}>Privé</span>}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {p.isActive ? (
                      <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>ACTIF</span>
                    ) : (
                      <span style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>DÉSACTIVÉ</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" onClick={() => setEditingPlan(p)} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit2 size={14} /> Éditer
                      </button>
                      <button type="button" onClick={() => handleTogglePlanActive(p)} style={{ padding: '6px 10px', backgroundColor: p.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: p.isActive ? '#ef4444' : '#10b981', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        {p.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ONGLET 2 : GESTION DES MOYENS DE PAIEMENT */}
      {activeTab === 'METHODS' && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
          <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '1.2rem' }}>Moyens de Règlement Manuel (Wave, OM, RIB)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Intitulé Affiché</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Consignes / Numéro Marchand</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #334155', opacity: m.isActive ? 1 : 0.6 }}>
                  <td style={{ padding: '14px', color: '#38bdf8', fontWeight: 700 }}>{m.code}</td>
                  <td style={{ padding: '14px', color: 'white', fontWeight: 600 }}>{m.label}</td>
                  <td style={{ padding: '14px', color: '#cbd5e1', maxWidth: '350px' }}>{m.instructions}</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    {m.isActive ? (
                      <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>ACTIF</span>
                    ) : (
                      <span style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>DÉSACTIVÉ</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" onClick={() => setEditingMethod(m)} style={{ padding: '6px 10px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit2 size={14} /> Éditer
                      </button>
                      <button type="button" onClick={() => handleToggleMethodActive(m)} style={{ padding: '6px 10px', backgroundColor: m.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: m.isActive ? '#ef4444' : '#10b981', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        {m.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Édition Plan */}
      {editingPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <form onSubmit={handleSavePlan} style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', maxWidth: '500px', width: '100%', padding: '24px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{editingPlan.id ? 'Éditer le Plan' : 'Créer un Nouveau Plan'}</h4>
            
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Nom du Plan :</label>
              <input type="text" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Prix Mensuel (FCFA) :</label>
                <input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Quota Élèves :</label>
                <input type="number" value={editingPlan.quotaStudents} onChange={(e) => setEditingPlan({ ...editingPlan, quotaStudents: Number(e.target.value) })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Description :</label>
              <textarea rows={2} value={editingPlan.description || ''} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setEditingPlan(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Édition Moyen de Paiement */}
      {editingMethod && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <form onSubmit={handleSaveMethod} style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', maxWidth: '500px', width: '100%', padding: '24px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{editingMethod.id ? 'Éditer le Moyen de Règlement' : 'Créer un Moyen de Règlement'}</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Code Unique (ex: WAVE) :</label>
                <input type="text" value={editingMethod.code} onChange={(e) => setEditingMethod({ ...editingMethod, code: e.target.value.toUpperCase() })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Intitulé Affiché :</label>
                <input type="text" value={editingMethod.label} onChange={(e) => setEditingMethod({ ...editingMethod, label: e.target.value })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Consignes / Numéro Merchant (Affiché au client) :</label>
              <textarea rows={3} value={editingMethod.instructions || ''} onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', marginTop: '4px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setEditingMethod(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
