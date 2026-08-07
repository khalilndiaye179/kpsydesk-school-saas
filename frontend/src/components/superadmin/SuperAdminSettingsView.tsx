import React, { useState, useEffect } from 'react';
import { Save, Server, Mail, CreditCard, Shield, Globe, AlertTriangle, Layers, Edit2, Trash2, Plus, Wrench, RefreshCw } from 'lucide-react';
import { SaaSAdminManagementView } from './SaaSAdminManagementView';
import { api } from '../../lib/api';

interface SuperAdminSettingsViewProps {
  initialTab?: 'GENERAL' | 'SMTP' | 'PAYMENT' | 'SECURITY' | 'PLANS';
}

export const SuperAdminSettingsView: React.FC<SuperAdminSettingsViewProps> = ({ initialTab = 'GENERAL' }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SMTP' | 'PAYMENT' | 'SECURITY' | 'PLANS'>(initialTab);
  
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Paramètres enregistrés avec succès.");
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

        {activeTab === 'PLANS' ? (
          <SaaSAdminManagementView />
        ) : (
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

          </form>
        )}
      </div>

    </div>
  );
};
