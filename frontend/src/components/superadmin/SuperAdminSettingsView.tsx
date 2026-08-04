import React, { useState } from 'react';
import { Save, Server, Mail, CreditCard, Shield, Globe, AlertTriangle, Layers, Edit2, Trash2, Plus } from 'lucide-react';

interface SuperAdminSettingsViewProps {
  initialTab?: 'GENERAL' | 'SMTP' | 'PAYMENT' | 'SECURITY' | 'PLANS';
}

export const SuperAdminSettingsView: React.FC<SuperAdminSettingsViewProps> = ({ initialTab = 'GENERAL' }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SMTP' | 'PAYMENT' | 'SECURITY' | 'PLANS'>(initialTab);
  
  // States (simulés)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState('587');
  const [selectedPaymentCountry, setSelectedPaymentCountry] = useState<'SN' | 'CI' | 'ML'>('SN');
  const [countryApiKeys, setCountryApiKeys] = useState<Record<string, { wave: string; orange: string }>>({
    SN: { wave: 'wave_live_sn_xxxxxxxx', orange: 'orange_prod_sn_xxxxxxxx' },
    CI: { wave: 'wave_live_ci_xxxxxxxx', orange: 'orange_prod_ci_xxxxxxxx' },
    ML: { wave: 'wave_live_ml_xxxxxxxx', orange: 'orange_prod_ml_xxxxxxxx' },
  });
  const [defaultSubscriptionMonths, setDefaultSubscriptionMonths] = useState(9);

  // Gestion des plans tarifaires
  const defaultPlans = [
    { id: 'BASIC', name: 'Starter (Basic)', price: 25000, activeQuota: 25, maxStudents: 350, annualDiscount: 0, description: 'Le plan idéal pour commencer.', features: ['Gestion Scolaire de base', 'Support par email'], tags: 'Basic', recommended: false },
    { id: 'PRO', name: 'Professionnel', price: 45000, activeQuota: 50, maxStudents: 750, annualDiscount: 10, description: 'Pour les écoles en pleine croissance.', features: ['Gestion Scolaire de base', 'Module Financier', 'Kiosque Pointage'], tags: 'Pro, Recommandé', recommended: true },
    { id: 'PREMIUM', name: 'Premium / Enterprise', price: 75000, activeQuota: 100, maxStudents: 99999, annualDiscount: 15, description: 'La suite complète avec serveur dédié.', features: ['Gestion Scolaire de base', 'Module Financier', 'Kiosque Pointage', 'Espace RH', 'Multi-campus'], tags: 'Enterprise, Illimité', recommended: false }
  ];

  const [pricingPlans, setPricingPlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('kpsydesk_pricing_plans');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migration automatique des anciens tarifs 50k, 150k, 350k -> 25k, 45k, 75k
          parsed = parsed.map((p: any) => ({
            ...p,
            price: p.price === 50000 ? 25000 : (p.price === 150000 ? 45000 : (p.price === 350000 ? 75000 : p.price)),
            maxStudents: p.maxStudents === 500 ? 350 : p.maxStudents
          }));
          localStorage.setItem('kpsydesk_pricing_plans', JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {
        // Fallback en cas d'erreur de parsing
      }
    }
    localStorage.setItem('kpsydesk_pricing_plans', JSON.stringify(defaultPlans));
    return defaultPlans;
  });

  React.useEffect(() => {
    localStorage.setItem('kpsydesk_pricing_plans', JSON.stringify(pricingPlans));
  }, [pricingPlans]);

  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const handleDeletePlan = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce plan ? (Ceci n'affectera pas les locataires déjà abonnés)")) {
      setPricingPlans(pricingPlans.filter(p => p.id !== id));
    }
  };

  const handleEditPlan = (id: string) => {
    const plan = pricingPlans.find(p => p.id === id);
    if (plan) setEditingPlan({ ...plan });
  };

  const handleAddPlan = () => {
    setEditingPlan({
      id: `PLAN_${Date.now()}`,
      name: 'Nouveau Plan',
      price: 0,
      activeQuota: 0,
      maxStudents: 0,
      annualDiscount: 0,
      description: '',
      features: [],
      tags: '',
      recommended: false
    });
  };

  const saveEditedPlan = () => {
    if (!editingPlan) return;
    const exists = pricingPlans.find(p => p.id === editingPlan.id);
    if (exists) {
      setPricingPlans(pricingPlans.map(p => p.id === editingPlan.id ? editingPlan : p));
    } else {
      setPricingPlans([...pricingPlans, editingPlan]);
    }
    setEditingPlan(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Paramètres globaux sauvegardés avec succès ! (Simulation)");
  };

  const tabs = [
    { id: 'GENERAL', label: 'Général & Plateforme', icon: Globe },
    { id: 'SMTP', label: 'Serveur Email (SMTP)', icon: Mail },
    { id: 'PAYMENT', label: 'Passerelles de Paiement', icon: CreditCard },
    { id: 'PLANS', label: 'Plans Tarifaires', icon: Layers },
    { id: 'SECURITY', label: 'Sécurité & Sauvegardes', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      
      {/* Menu Latéral Paramètres */}
      <div style={{ width: '250px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === tab.id ? '#334155' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#94a3b8',
              cursor: 'pointer', fontWeight: 500, textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} color={activeTab === tab.id ? '#38bdf8' : 'currentColor'} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu Principal */}
      <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white', fontFamily: 'var(--font-title)' }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Save size={18} /> Sauvegarder
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'GENERAL' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Nom de la Plateforme SaaS</label>
                <input type="text" defaultValue="KPsyDesk School" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontWeight: 500 }}>URL de Base API</label>
                <input type="text" defaultValue="https://api.kpsydesk.com/v1" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <AlertTriangle color="#f59e0b" size={24} />
                  <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '1.1rem' }}>Mode Maintenance</h3>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>En activant ce mode, toutes les écoles seront déconnectées et un écran de maintenance sera affiché. Seuls les super-admins pourront se connecter.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#f59e0b' }} />
                  <span style={{ color: 'white', fontWeight: 600 }}>Activer le mode maintenance global</span>
                </label>
              </div>
            </>
          )}

          {activeTab === 'SMTP' && (
            <>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2 }}>
                  <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Hôte SMTP</label>
                  <input type="text" value={smtpHost} onChange={(e)=>setSmtpHost(e.target.value)} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Port</label>
                  <input type="text" value={smtpPort} onChange={(e)=>setSmtpPort(e.target.value)} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Utilisateur SMTP</label>
                <input type="text" defaultValue="postmaster@kpsydesk.com" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontWeight: 500 }}>Mot de passe SMTP</label>
                <input type="password" defaultValue="********" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              <button type="button" style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '8px', alignSelf: 'flex-start', cursor: 'pointer', fontWeight: 600 }}>
                Envoyer un email de test
              </button>
            </>
          )}

          {activeTab === 'PAYMENT' && (
            <>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Configuration des passerelles Mobile Money par territoire national (UEMOA / FCFA).</p>
              
              {/* Sélecteur de Pays pour les Clés API */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {[
                  { code: 'SN' as const, flag: '🇸🇳', name: 'Sénégal' },
                  { code: 'CI' as const, flag: '🇨🇮', name: "Côte d'Ivoire" },
                  { code: 'ML' as const, flag: '🇲🇱', name: 'Mali' }
                ].map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedPaymentCountry(c.code)}
                    style={{
                      padding: '10px 18px', borderRadius: '10px',
                      backgroundColor: selectedPaymentCountry === c.code ? '#38bdf8' : '#1e293b',
                      color: selectedPaymentCountry === c.code ? '#0f172a' : '#cbd5e1',
                      border: '1px solid #334155', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <span>{c.flag}</span> <span>{c.name}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div> Wave API ({selectedPaymentCountry})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Clé Secrète Live — {selectedPaymentCountry}</label>
                  <input 
                    type="text" 
                    value={countryApiKeys[selectedPaymentCountry]?.wave || ''} 
                    onChange={(e) => setCountryApiKeys({
                      ...countryApiKeys,
                      [selectedPaymentCountry]: { ...countryApiKeys[selectedPaymentCountry], wave: e.target.value }
                    })} 
                    style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none', fontFamily: 'monospace' }} 
                  />
                </div>
              </div>

              <div style={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '50%' }}></div> Orange Money API ({selectedPaymentCountry})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Clé Marchand — {selectedPaymentCountry}</label>
                  <input 
                    type="text" 
                    value={countryApiKeys[selectedPaymentCountry]?.orange || ''} 
                    onChange={(e) => setCountryApiKeys({
                      ...countryApiKeys,
                      [selectedPaymentCountry]: { ...countryApiKeys[selectedPaymentCountry], orange: e.target.value }
                    })} 
                    style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none', fontFamily: 'monospace' }} 
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'SECURITY' && (
            <>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Double Authentification (2FA) Forcée</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Exiger le 2FA pour tous les directeurs d'écoles (Admins Tenant).</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#10b981', borderRadius: '24px', transition: '0.4s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: '26px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s' }}></span>
                  </span>
                </label>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Sauvegardes de la base de données</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Fréquence des dumps PostgreSQL chiffrés sur S3.</p>
                </div>
                <select style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', outline: 'none' }}>
                  <option>Toutes les 6 heures</option>
                  <option>Quotidien (Minuit)</option>
                  <option>Hebdomadaire</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'PLANS' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Configurez et redimensionnez librement vos offres SaaS pour vos clients.</p>
                <button type="button" onClick={handleAddPlan} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <Plus size={16} /> Nouveau Plan
                </button>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.1rem' }}>Durée de l'année scolaire (par défaut)</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Les locataires pourront payer ce nombre de mois en une seule fois (Abonnement Annuel).</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    min={1} 
                    max={12} 
                    value={defaultSubscriptionMonths} 
                    onChange={(e) => setDefaultSubscriptionMonths(Number(e.target.value))}
                    style={{ width: '80px', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1rem', outline: 'none' }} 
                  />
                  <span style={{ color: '#cbd5e1' }}>mois</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pricingPlans.map(plan => (
                  <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '12px', backgroundColor: '#0f172a', border: plan.recommended ? '1px solid #38bdf8' : '1px solid #334155' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{plan.name}</h4>
                        {plan.recommended && <span style={{ padding: '4px 8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>RECOMMANDÉ</span>}
                      </div>
                      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'white' }}>{plan.price.toLocaleString('fr-FR')} F / mois</strong> — Max Élèves : {plan.maxStudents === 99999 ? 'Illimité' : plan.maxStudents}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEditPlan(plan.id)} style={{ padding: '8px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#38bdf8', cursor: 'pointer' }} title="Modifier le prix">
                        <Edit2 size={18} />
                      </button>
                      <button type="button" onClick={() => handleDeletePlan(plan.id)} style={{ padding: '8px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} title="Supprimer ce plan">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </form>
      </div>

      {/* Modale d'édition de plan */}
      {editingPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #27272a', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'white', fontSize: '1.4rem' }}>{editingPlan.id.startsWith('PLAN_') ? 'Créer un Plan' : `Modifier le plan : ${editingPlan.name}`}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Nom du Plan</label>
                <input type="text" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Tarif Mensuel (FCFA)</label>
                <input type="number" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Comptes Admin & Profs (Actifs)</label>
                <input type="number" value={editingPlan.activeQuota} onChange={e => setEditingPlan({...editingPlan, activeQuota: Number(e.target.value)})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Nombre maximum d'élèves</label>
                <input type="number" value={editingPlan.maxStudents} onChange={e => setEditingPlan({...editingPlan, maxStudents: Number(e.target.value)})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Réduction abonnement annuel (%)</label>
                <input type="number" value={editingPlan.annualDiscount} onChange={e => setEditingPlan({...editingPlan, annualDiscount: Number(e.target.value)})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Description Marketing</label>
              <textarea rows={3} value={editingPlan.description} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Fonctionnalités activées</label>
              <div style={{ backgroundColor: '#27272a', padding: '16px', borderRadius: '8px', border: '1px solid #3f3f46', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  'Module Financier', 'Kiosque Pointage', 'Portail Parents', 
                  'Espace RH', 'Génération Bulletins', 'Transport Scolaire'
                ].map(feat => (
                  <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={editingPlan.features.includes(feat)}
                      onChange={e => {
                        const newFeatures = e.target.checked 
                          ? [...editingPlan.features, feat] 
                          : editingPlan.features.filter((f: string) => f !== feat);
                        setEditingPlan({...editingPlan, features: newFeatures});
                      }}
                      style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                    />
                    {feat}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>Tags Marketing (séparés par des virgules)</label>
              <input type="text" value={editingPlan.tags} onChange={e => setEditingPlan({...editingPlan, tags: e.target.value})} style={{ padding: '12px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setEditingPlan(null)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', border: '1px solid #3f3f46', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
                Annuler
              </button>
              <button onClick={saveEditedPlan} style={{ flex: 1, padding: '14px', backgroundColor: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
