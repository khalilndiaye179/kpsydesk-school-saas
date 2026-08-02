import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit2, Check, UserPlus } from 'lucide-react';
import { readStoredOrSeed, writeStored } from '../../lib/storage';

const COLLABORATORS_KEY = 'kpsydesk_superadmin_collaborators';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  password?: string;
  isMfaActive: boolean;
  mfaSecret?: string;
  permissions: {
    manageTenants: boolean;
    manageBilling: boolean;
    viewAudits: boolean;
    manageSettings: boolean;
  };
  status: 'ACTIVE' | 'SUSPENDED';
}

export const SuperAdminCollaboratorsView: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const defaultCollaborators: Collaborator[] = [
        {
          id: 'COL-1',
          name: 'Ibrahima Ndiaye',
          email: 'admin@kpsydesk.com',
          password: 'Admin2026!',
          isMfaActive: true,
          mfaSecret: 'KPSYSCHOOL-ADMIN-MFA-001',
          permissions: { manageTenants: true, manageBilling: true, viewAudits: true, manageSettings: true },
          status: 'ACTIVE'
        },
        {
          id: 'COL-2',
          name: 'Fatou Sow',
          email: 'compta@kpsydesk.com',
          password: 'Fatou2026!',
          isMfaActive: true,
          mfaSecret: 'KPSYSCHOOL-FATOU-MFA-002',
          permissions: { manageTenants: false, manageBilling: true, viewAudits: true, manageSettings: false },
          status: 'ACTIVE'
        }
      ];
    setCollaborators(readStoredOrSeed(COLLABORATORS_KEY, defaultCollaborators));
  }, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // States formulaire
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMfaActive, setIsMfaActive] = useState(true);
  const [perms, setPerms] = useState({
    manageTenants: false,
    manageBilling: false,
    viewAudits: false,
    manageSettings: false
  });

  const saveCollaborators = (data: Collaborator[]) => {
    setCollaborators(data);
    writeStored(COLLABORATORS_KEY, data);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setIsMfaActive(true);
    setPerms({ manageTenants: false, manageBilling: false, viewAudits: false, manageSettings: false });
    setIsFormOpen(false);
  };

  const handleEdit = (col: Collaborator) => {
    setEditingId(col.id);
    setName(col.name);
    setEmail(col.email);
    setPassword(col.password || '');
    setIsMfaActive(col.isMfaActive);
    setPerms(col.permissions);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Suspendre ce collaborateur ?")) {
      const updated = collaborators.map(c => c.id === id ? { ...c, status: 'SUSPENDED' as const } : c);
      saveCollaborators(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Collaborator[];

    if (editingId) {
      updatedList = collaborators.map(c => c.id === editingId ? { 
        ...c, 
        name, 
        email, 
        password: password || c.password || 'Secured2026!', 
        isMfaActive,
        permissions: perms 
      } : c);
    } else {
      const newCol: Collaborator = {
        id: `COL-${Date.now()}`,
        name,
        email,
        password: password || 'Secured2026!',
        isMfaActive,
        mfaSecret: `KPSYSCHOOL-MFA-${Date.now()}`,
        permissions: perms,
        status: 'ACTIVE'
      };
      updatedList = [...collaborators, newCol];
    }

    saveCollaborators(updatedList);
    resetForm();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0', color: 'white', fontFamily: 'var(--font-title)' }}>
            Équipe & Collaborateurs
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
            Gestion des accès internes à la Console SaaS.
          </p>
        </div>
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <UserPlus size={18} /> Ajouter un collaborateur
          </button>
        )}
      </div>

      {isFormOpen && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #38bdf8', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{editingId ? 'Modifier les accès' : 'Nouveau collaborateur'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Nom complet</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Adresse Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Mot de passe d'accès Console Admin</label>
                <input required={!editingId} type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#0f172a', borderRadius: '8px', border: isMfaActive ? '1px solid #38bdf8' : '1px solid #334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isMfaActive} onChange={e => setIsMfaActive(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#38bdf8' }} />
                  <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>Activer la Double Authentification MFA (QR Code OTP)</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>Rôles et Permissions attribuées</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: perms.manageTenants ? '1px solid #38bdf8' : '1px solid #334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={perms.manageTenants} onChange={e => setPerms({...perms, manageTenants: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#38bdf8' }} />
                  <span style={{ color: 'white', fontSize: '0.95rem' }}>Gérer les Écoles</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: perms.manageBilling ? '1px solid #10b981' : '1px solid #334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={perms.manageBilling} onChange={e => setPerms({...perms, manageBilling: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  <span style={{ color: 'white', fontSize: '0.95rem' }}>Facturation / Abonnements</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: perms.viewAudits ? '1px solid #f59e0b' : '1px solid #334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={perms.viewAudits} onChange={e => setPerms({...perms, viewAudits: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }} />
                  <span style={{ color: 'white', fontSize: '0.95rem' }}>Consultation des Audits</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: perms.manageSettings ? '1px solid #ef4444' : '1px solid #334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={perms.manageSettings} onChange={e => setPerms({...perms, manageSettings: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#ef4444' }} />
                  <span style={{ color: 'white', fontSize: '0.95rem' }}>Paramètres Globaux</span>
                </label>

              </div>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Enregistrer le collaborateur
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Collaborateur</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Sécurité (Mot de Passe & MFA)</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Accès</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 600 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: 'white', fontWeight: 600 }}>{c.name}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{c.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {showPassword[c.id] ? (c.password || '••••••••••••') : '••••••••••••'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword({ ...showPassword, [c.id]: !showPassword[c.id] })}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {showPassword[c.id] ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                    <div>
                      {c.isMfaActive ? (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> MFA OTP Actif
                        </span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                          MFA Inactif
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {c.permissions.manageTenants && <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>Écoles</span>}
                    {c.permissions.manageBilling && <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Abonnements</span>}
                    {c.permissions.viewAudits && <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>Audits</span>}
                    {c.permissions.manageSettings && <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Settings</span>}
                    {!c.permissions.manageTenants && !c.permissions.manageBilling && !c.permissions.viewAudits && !c.permissions.manageSettings && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Aucun accès</span>}
                  </div>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                  {c.status === 'ACTIVE' 
                    ? <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Actif</span>
                    : <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Suspendu</span>
                  }
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '6px' }} title="Modifier">
                      <Edit2 size={18} />
                    </button>
                    {c.status === 'ACTIVE' && (
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }} title="Suspendre">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
