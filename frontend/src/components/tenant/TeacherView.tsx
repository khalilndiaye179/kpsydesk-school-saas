import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { api } from '../../lib/api';

// Définitions
const DAYS = [
  { id: 1, name: 'Lundi' },
  { id: 2, name: 'Mardi' },
  { id: 3, name: 'Mercredi' },
  { id: 4, name: 'Jeudi' },
  { id: 5, name: 'Vendredi' },
  { id: 6, name: 'Samedi' }
];

const TIME_SLOTS = [
  { id: '08:00-10:00', label: '08:00 - 10:00', duration: 2 },
  { id: '10:00-12:00', label: '10:00 - 12:00', duration: 2 },
  { id: '14:00-16:00', label: '14:00 - 16:00', duration: 2 },
  { id: '16:00-18:00', label: '16:00 - 18:00', duration: 2 }
];

type Preference = 'NONE' | 'AVAILABLE' | 'PREFERRED' | 'AVOID';

interface AvailabilityCell {
  dayOfWeek: number;
  timeSlotId: string;
  preference: Preference;
}

interface TeacherData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
}

export const TeacherView: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]); // Pour griser les créneaux occupés
  
  // Formulaire
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  
  // Disponibilités
  const [availabilities, setAvailabilities] = useState<AvailabilityCell[]>([]);

  useEffect(() => {
    fetchTeachers();
    fetchTimetables();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/tenant/teachers');
      setTeachers(response.data);
    } catch (err) {
      const saved = localStorage.getItem('kpsydesk_teachers');
      if (saved) {
        setTeachers(JSON.parse(saved));
      } else {
        const mock = [
          { id: 't-1', firstName: 'Moussa', lastName: 'Diop', email: 'moussa@ecole.com', phone: '771234567', specialty: 'Mathématiques' }
        ];
        setTeachers(mock);
        localStorage.setItem('kpsydesk_teachers', JSON.stringify(mock));
      }
    }
  };

  const fetchTimetables = async () => {
    try {
      const response = await api.get('/tenant/timetables');
      setTimetables(response.data);
    } catch (err) {
      const saved = localStorage.getItem('kpsydesk_timetables');
      if (saved) setTimetables(JSON.parse(saved));
    }
  };

  const loadAvailabilities = async (teacherId: string) => {
    try {
      const response = await api.get(`/tenant/availabilities/${teacherId}`);
      setAvailabilities(response.data);
    } catch (err) {
      const saved = localStorage.getItem(`kpsydesk_availabilities_${teacherId}`);
      if (saved) setAvailabilities(JSON.parse(saved));
      else setAvailabilities([]);
    }
  };

  const handleEditTeacher = (t: TeacherData) => {
    console.log("Edit clicked for:", t);
    setEditingId(t.id);
    setFirstName(t.firstName);
    setLastName(t.lastName);
    setEmail(t.email);
    setPhone(t.phone || '');
    setSpecialty(t.specialty);
    loadAvailabilities(t.id);
    
    // Défilement vers le haut pour voir le formulaire (sécurisé)
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.log("ScrollTo not supported");
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce professeur ?')) return;
    try {
      await api.delete(`/tenant/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      localStorage.setItem('kpsydesk_teachers', JSON.stringify(updated));
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { firstName, lastName, email, phone, specialty };
    let savedId: string = editingId || `local-t-${Date.now()}`;

    if (editingId) {
      try {
        await api.put(`/tenant/teachers/${editingId}`, payload);
        fetchTeachers();
      } catch (err) {
        const updated = teachers.map(t => t.id === editingId ? { ...t, ...payload } : t);
        setTeachers(updated);
        localStorage.setItem('kpsydesk_teachers', JSON.stringify(updated));
      }
    } else {
      try {
        const res = await api.post('/tenant/teachers', payload);
        savedId = res.data.id;
        fetchTeachers();
      } catch (err) {
        const newT: TeacherData = { id: savedId, ...payload };
        const updated = [...teachers, newT];
        setTeachers(updated);
        localStorage.setItem('kpsydesk_teachers', JSON.stringify(updated));
      }
    }

    // Sauvegarder les disponibilités
    if (savedId) {
      try {
        await api.post(`/tenant/availabilities/${savedId}`, { availabilities });
      } catch (err) {
        localStorage.setItem(`kpsydesk_availabilities_${savedId}`, JSON.stringify(availabilities));
      }
    }

    // Reset form
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSpecialty('');
    setAvailabilities([]);
  };

  // --- Logique Grille ---

  const isSlotOccupied = (dayId: number, slotId: string) => {
    if (!editingId) return false;
    // Vérifier si le professeur a déjà un cours à ce moment
    return timetables.some(tt => tt.teacherId === editingId && tt.dayOfWeek === dayId && tt.startTime === slotId.split('-')[0]);
  };

  const handleCellClick = (dayId: number, slotId: string) => {
    if (isSlotOccupied(dayId, slotId)) return; // Bloqué car déjà occupé

    const existingIndex = availabilities.findIndex(a => a.dayOfWeek === dayId && a.timeSlotId === slotId);
    let newAvailabilities = [...availabilities];

    if (existingIndex >= 0) {
      const currentPref = newAvailabilities[existingIndex].preference;
      if (currentPref === 'AVAILABLE') newAvailabilities[existingIndex].preference = 'PREFERRED';
      else if (currentPref === 'PREFERRED') newAvailabilities[existingIndex].preference = 'AVOID';
      else if (currentPref === 'AVOID') newAvailabilities.splice(existingIndex, 1);
    } else {
      newAvailabilities.push({ dayOfWeek: dayId, timeSlotId: slotId, preference: 'AVAILABLE' });
    }
    setAvailabilities(newAvailabilities);
  };

  const getCellState = (dayId: number, slotId: string): Preference => {
    const found = availabilities.find(a => a.dayOfWeek === dayId && a.timeSlotId === slotId);
    return found ? found.preference : 'NONE';
  };

  const renderCellContent = (pref: Preference, occupied: boolean) => {
    if (occupied) return <div style={{ color: 'var(--text-secondary)' }}>Occupé</div>;
    switch (pref) {
      case 'AVAILABLE': return <div style={{ color: '#10b981' }}><CheckCircle size={20} /></div>;
      case 'PREFERRED': return <div style={{ color: '#8b5cf6' }}><Star size={20} /></div>;
      case 'AVOID': return <div style={{ color: '#f59e0b' }}><AlertTriangle size={20} /></div>;
      default: return <div style={{ color: 'var(--border)' }}><X size={20} /></div>;
    }
  };

  const getCellBg = (pref: Preference, occupied: boolean) => {
    if (occupied) return 'var(--bg-page)';
    switch (pref) {
      case 'AVAILABLE': return 'rgba(16, 185, 129, 0.1)';
      case 'PREFERRED': return 'rgba(139, 92, 246, 0.1)';
      case 'AVOID': return 'rgba(245, 158, 11, 0.1)';
      default: return 'transparent';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
        Gestion des Professeurs
      </h2>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Formulaire et Grille */}
        <div style={{ flex: 1, minWidth: '600px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
            {editingId ? 'Modifier un Professeur' : 'Ajouter un Professeur'}
          </h3>
          
          <form onSubmit={handleSaveTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Prénom</label>
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nom</label>
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Téléphone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Spécialité / Matière principale</label>
                <input required type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Disponibilités (Créneaux horaires)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', gap: '8px' }}>
                <div></div>
                {DAYS.map(d => (
                  <div key={d.id} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{d.name.substring(0,3)}.</div>
                ))}

                {TIME_SLOTS.map(slot => (
                  <React.Fragment key={slot.id}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {slot.label.replace(' - ', '-')}
                    </div>
                    {DAYS.map(day => {
                      const occupied = isSlotOccupied(day.id, slot.id);
                      const pref = getCellState(day.id, slot.id);
                      return (
                        <div 
                          key={`${day.id}-${slot.id}`}
                          onClick={() => handleCellClick(day.id, slot.id)}
                          style={{
                            height: '50px',
                            borderRadius: '6px',
                            border: occupied ? '1px solid var(--border)' : (pref !== 'NONE' ? `2px solid ${pref==='AVAILABLE'?'#10b981':pref==='PREFERRED'?'#8b5cf6':'#f59e0b'}` : '1px dashed var(--border)'),
                            backgroundColor: getCellBg(pref, occupied),
                            cursor: occupied ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: occupied ? 0.5 : 1
                          }}
                          title={occupied ? "Ce créneau est déjà affecté à un cours dans l'emploi du temps." : "Cliquez pour changer l'état"}
                        >
                          {renderCellContent(pref, occupied)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Vert: Disponible</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Violet: Préféré</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Orange: À éviter</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Gris: Occupé</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-page)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total disponibilité : <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>{availabilities.length * 2}h</span>/semaine
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setSpecialty(''); setAvailabilities([]); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Annuler
                </button>
              )}
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent)', color: '#FFF', cursor: 'pointer', fontWeight: 600 }}>
                <Save size={18} />
                {editingId ? 'Mettre à jour' : 'Ajouter le professeur'}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des professeurs */}
        <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
            Liste des Professeurs ({teachers.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teachers.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {t.firstName[0]}{t.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.firstName} {t.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.specialty}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => handleEditTeacher(t)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }} title="Modifier">
                    <Edit size={18} />
                  </button>
                  <button type="button" onClick={() => handleDeleteTeacher(t.id)} style={{ background: 'none', border: 'none', color: 'var(--status-negative)', cursor: 'pointer', padding: '6px' }} title="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                Aucun professeur enregistré.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
