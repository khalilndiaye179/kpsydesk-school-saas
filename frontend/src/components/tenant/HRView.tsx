import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, Key, AlertTriangle, Edit2, Trash2, Briefcase, Clock, Camera } from 'lucide-react';
import { api } from '../../lib/api';

type TenantRole = 'DIRECTOR' | 'CENSOR' | 'TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN' | 'DRIVER' | 'PARENT' | 'STUDENT';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface StaffUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  role: TenantRole;
  status: UserStatus;
  contractType?: string;
  baseSalary?: number;
  hourlyRate?: number;
  createdAt: string;
}

export const HRView: React.FC = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'PARENTS_STUDENTS' | 'CLOCK_EVENTS'>('EMPLOYEES');
  const [clockEvents, setClockEvents] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState<TenantRole>('TEACHER');
  const [newContractType, setNewContractType] = useState('CDI');
  const [newBaseSalary, setNewBaseSalary] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('');
  
  // Generated password for demo
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '39b8b0e8-1111-4444-a1a1-9b1979b00001';
    const USERS_STORAGE_KEY = `kpsydesk_tenant_users_${activeTenantId}`;
    const CLOCK_STORAGE_KEY = `kpsydesk_clock_events_${activeTenantId}`;

    try {
      const res = await api.get('/tenant/users');
      setStaff(res.data);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(res.data));
    } catch (err) {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        // Purge automatique des 3 utilisateurs de test (Amadou DIOP, Awa FALL, Ousmane SOW)
        let users: StaffUser[] = JSON.parse(saved);
        users = users.filter(u => !['directeur@kpsydesk.com', 'censeur@kpsydesk.com', 'compta@kpsydesk.com'].includes(u.email));
        setStaff(users);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } else {
        setStaff([]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      }
    }

    // Charger les pointages isolés par tenant
    const savedEvents = localStorage.getItem(CLOCK_STORAGE_KEY);
    if (savedEvents) {
      setClockEvents(JSON.parse(savedEvents));
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for(let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    return pwd;
  };

  const handleOpenModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setNewTitle('');
    setNewRole('TEACHER');
    setNewContractType('CDI');
    setNewBaseSalary('');
    setNewHourlyRate('');
    setGeneratedPassword(generatePassword());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: StaffUser = {
      id: `usr-${Date.now()}`,
      email,
      firstName,
      lastName,
      phone,
      title: newTitle,
      role: newRole,
      status: 'ACTIVE',
      contractType: newContractType,
      baseSalary: newBaseSalary ? parseFloat(newBaseSalary) : undefined,
      hourlyRate: newHourlyRate ? parseFloat(newHourlyRate) : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      // Pour la démo, on n'a pas encore l'endpoint POST /tenant/users avec le password
      // On sauvegarde juste en local
      const updated = [newUser, ...staff];
      setStaff(updated);
      const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '39b8b0e8-1111-4444-a1a1-9b1979b00001';
      const USERS_STORAGE_KEY = `kpsydesk_tenant_users_${activeTenantId}`;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(error);
    }
    
    setShowModal(false);
  };

  const getRoleLabel = (r: TenantRole) => {
    switch (r) {
      case 'DIRECTOR': return 'Directeur';
      case 'CENSOR': return 'Censeur / Surveillant';
      case 'TEACHER': return 'Enseignant';
      case 'ACCOUNTANT': return 'Comptable';
      case 'LIBRARIAN': return 'Bibliothécaire';
      case 'DRIVER': return 'Chauffeur';
      case 'PARENT': return 'Parent';
      case 'STUDENT': return 'Élève';
      default: return r;
    }
  };

  const getRoleColor = (r: TenantRole) => {
    switch (r) {
      case 'DIRECTOR': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'CENSOR': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'ACCOUNTANT': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'LIBRARIAN': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }; // Violet
      case 'DRIVER': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }; // Jaune
      case 'TEACHER': return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
    }
  };

  const getRoleAccessDescription = (r: TenantRole) => {
    switch (r) {
      case 'DIRECTOR': return 'Accès complet au système (Paramètres, RH, Finances, etc.)';
      case 'CENSOR': return 'Accès limité à la scolarité (Élèves, Classes, Absences, Emplois du temps)';
      case 'TEACHER': return 'Accès restreint à ses classes (Notes, Appel)';
      case 'ACCOUNTANT': return 'Accès exclusif aux Finances & Trésorerie';
      case 'LIBRARIAN': return 'Accès exclusif à la gestion de la bibliothèque';
      case 'DRIVER': return 'Accès exclusif à la gestion du transport scolaire';
      case 'PARENT': return 'Consultation des résultats et absences de ses enfants';
      case 'STUDENT': return 'Consultation de ses résultats et absences';
      default: return '';
    }
  };

  const filteredStaff = staff.filter(s => activeTab === 'EMPLOYEES' ? !['PARENT', 'STUDENT'].includes(s.role) : ['PARENT', 'STUDENT'].includes(s.role));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Ressources Humaines & Accès</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gérez vos employés, collaborateurs et définissez leurs droits d'accès au système.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
        >
          <Plus size={20} /> Créer un Utilisateur
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('EMPLOYEES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'EMPLOYEES' ? '#0f172a' : 'transparent', color: activeTab === 'EMPLOYEES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={18} /> Employés & Staff
        </button>
        <button 
          onClick={() => setActiveTab('CLOCK_EVENTS')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'CLOCK_EVENTS' ? '#0f172a' : 'transparent', color: activeTab === 'CLOCK_EVENTS' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Clock size={18} /> Pointages Kiosque
        </button>
        <button 
          onClick={() => setActiveTab('PARENTS_STUDENTS')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'PARENTS_STUDENTS' ? '#0f172a' : 'transparent', color: activeTab === 'PARENTS_STUDENTS' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Accès Élèves / Parents
        </button>
      </div>

      {/* Liste du Personnel */}
      {(activeTab === 'EMPLOYEES' || activeTab === 'PARENTS_STUDENTS') && (
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Utilisateur</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Fonction</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Rôle d'Accès</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Statut</th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(u => {
              const roleColor = getRoleColor(u.role);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-primary)' }}>
                    <div style={{ fontSize: '0.85rem' }}>{u.title || 'Non défini'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Contrat : {u.contractType || 'Non défini'} 
                      {u.baseSalary ? ` - ${u.baseSalary.toLocaleString()} F/mois` : ''}
                      {u.hourlyRate ? ` - ${u.hourlyRate.toLocaleString()} F/heure` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: roleColor.bg, color: roleColor.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {u.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                      <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Onglet Pointages Kiosque */}
      {activeTab === 'CLOCK_EVENTS' && (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Employé</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Type</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Date & Heure</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Preuve (Photo)</th>
            </tr>
          </thead>
          <tbody>
            {clockEvents.map((evt, idx) => (
              <tr key={evt.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>{evt.staffName}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: evt.eventType === 'CLOCK_IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: evt.eventType === 'CLOCK_IN' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {evt.eventType === 'CLOCK_IN' ? 'ARRIVÉE' : 'DÉPART'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>{new Date(evt.timestamp).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '16px' }}>
                  {evt.photoDataUrl ? (
                    <button onClick={() => setSelectedPhoto(evt.photoDataUrl)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} /> Voir la photo
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aucune photo</span>
                  )}
                </td>
              </tr>
            ))}
            {clockEvents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun pointage enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Modale de photo */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', position: 'relative', maxWidth: '600px', width: '100%' }}>
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
            <img src={selectedPhoto} alt="Preuve de pointage" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
            <p style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Cette consultation a été journalisée pour des raisons de sécurité et de conformité RGPD.
            </p>
          </div>
        </div>
      )}

      {/* Modale de création */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0', fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>Créer un nouvel utilisateur</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Prénom</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nom</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Téléphone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Fonction</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ padding: '24px', backgroundColor: 'var(--bg-page)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={18} /> Paramètres d'Accès</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email de connexion</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Rôle & Permissions</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value as TenantRole)} required style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none', backgroundColor: 'white', fontWeight: 600 }}>
                      <option value="DIRECTOR">Directeur (Accès Total)</option>
                      <option value="CENSOR">Censeur / Surveillant (Scolarité, Discipline)</option>
                      <option value="ACCOUNTANT">Comptable (Finances Uniquement)</option>
                      <option value="LIBRARIAN">Bibliothécaire (Bibliothèque Uniquement)</option>
                      <option value="DRIVER">Chauffeur (Transport Uniquement)</option>
                      <option value="TEACHER">Enseignant (Notes, Appel pour ses classes)</option>
                      <option value="STUDENT">Élève (Consultation Notes & Absences)</option>
                      <option value="PARENT">Parent (Consultation)</option>
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                      <select value={newContractType} onChange={(e) => setNewContractType(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }}>
                        <option value="CDI">CDI (Temps Plein)</option>
                        <option value="CDD">CDD (Temps Déterminé)</option>
                        <option value="PRESTATION">Prestation (Externe)</option>
                        <option value="FORFAIT">Forfait Horaire (Vacataire)</option>
                      </select>

                      {(newContractType === 'CDI' || newContractType === 'CDD') && (
                        <input type="number" placeholder="Salaire Mensuel Fixe" value={newBaseSalary} onChange={(e) => setNewBaseSalary(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                      )}
                      {(newContractType === 'PRESTATION' || newContractType === 'FORFAIT') && (
                        <input type="number" placeholder="Taux Horaire" value={newHourlyRate} onChange={(e) => setNewHourlyRate(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                      )}
                    </div>
                    
                    {/* Explication du rôle sélectionné */}
                    <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#0369a1', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>{getRoleAccessDescription(newRole)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mot de passe provisoire</label>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', backgroundColor: 'white', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px' }}>
                      {generatedPassword}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>À communiquer à l'utilisateur. Il pourra le modifier lors de sa première connexion.</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', border: '2px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Créer l'Utilisateur</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
