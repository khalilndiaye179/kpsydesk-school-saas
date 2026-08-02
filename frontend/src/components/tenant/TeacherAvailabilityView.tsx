import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, AlertTriangle, Star, X } from 'lucide-react';
import { api } from '../../lib/api';
import { STORAGE_KEYS, availabilitiesKey, readStored, writeStored } from '../../lib/storage';

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

export const TeacherAvailabilityView: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [availabilities, setAvailabilities] = useState<AvailabilityCell[]>([]);
  const [requiredHours, setRequiredHours] = useState<number>(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      loadAvailabilities(selectedTeacherId);
      // Simuler le calcul des heures requises basé sur les matières assignées
      setRequiredHours(Math.floor(Math.random() * 10) + 10); // Entre 10 et 20h pour la démo
    } else {
      setAvailabilities([]);
      setRequiredHours(0);
    }
  }, [selectedTeacherId]);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/tenant/teachers');
      setTeachers(response.data);
      if (response.data.length > 0) setSelectedTeacherId(response.data[0].id);
    } catch (err) {
      const parsed = readStored(STORAGE_KEYS.teachers, [
        { id: 't-1', firstName: 'Moussa', lastName: 'Diop', specialty: 'Mathématiques' },
        { id: 't-2', firstName: 'Fatou', lastName: 'Sow', specialty: 'Français' }
      ]);
      setTeachers(parsed);
      if (parsed.length > 0) setSelectedTeacherId(parsed[0].id);
    }
  };

  const loadAvailabilities = async (teacherId: string) => {
    try {
      const response = await api.get(`/tenant/availabilities/${teacherId}`);
      setAvailabilities(response.data);
    } catch (err) {
      setAvailabilities(readStored<any[]>(availabilitiesKey(teacherId), []));
    }
  };

  const handleCellClick = (dayId: number, slotId: string) => {
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

  const saveAvailabilities = async () => {
    if (!selectedTeacherId) return;
    try {
      await api.post(`/tenant/availabilities/${selectedTeacherId}`, { availabilities });
      alert('Disponibilités sauvegardées !');
    } catch (err) {
      writeStored(availabilitiesKey(selectedTeacherId), availabilities);
      alert('Disponibilités sauvegardées localement !');
    }
  };

  const getCellState = (dayId: number, slotId: string): Preference => {
    const found = availabilities.find(a => a.dayOfWeek === dayId && a.timeSlotId === slotId);
    return found ? found.preference : 'NONE';
  };

  const renderCellContent = (pref: Preference) => {
    switch (pref) {
      case 'AVAILABLE': return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#10b981' }}><CheckCircle size={20} /><span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Disponible</span></div>;
      case 'PREFERRED': return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8b5cf6' }}><Star size={20} /><span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Préféré</span></div>;
      case 'AVOID': return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f59e0b' }}><AlertTriangle size={20} /><span style={{ fontSize: '0.7rem', fontWeight: 600 }}>À Éviter</span></div>;
      default: return <div style={{ color: 'var(--border)' }}><X size={20} /></div>;
    }
  };

  const getCellBg = (pref: Preference) => {
    switch (pref) {
      case 'AVAILABLE': return 'rgba(16, 185, 129, 0.1)';
      case 'PREFERRED': return 'rgba(139, 92, 246, 0.1)';
      case 'AVOID': return 'rgba(245, 158, 11, 0.1)';
      default: return 'transparent';
    }
  };

  const getCellBorder = (pref: Preference) => {
    switch (pref) {
      case 'AVAILABLE': return '2px solid #10b981';
      case 'PREFERRED': return '2px solid #8b5cf6';
      case 'AVOID': return '2px solid #f59e0b';
      default: return '1px dashed var(--border)';
    }
  };

  // Calcul du volume horaire total disponible
  const totalAvailableHours = availabilities.length * 2; // Chaque slot fait 2h
  const isInsufficient = totalAvailableHours < requiredHours;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Disponibilités Enseignants</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Déclarez vos créneaux pour la génération automatique de l'emploi du temps.
          </p>
        </div>
        <select 
          value={selectedTeacherId}
          onChange={e => setSelectedTeacherId(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none', fontWeight: 600 }}
        >
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.firstName} {t.lastName} - {t.specialty}</option>
          ))}
        </select>
      </div>

      {selectedTeacherId && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-data)' }}>{totalAvailableHours}h</span>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Volume</span>
                  <span>Déclaré</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-data)' }}>{requiredHours}h</span>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Volume</span>
                  <span>Requis minimum</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {isInsufficient ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <AlertTriangle size={18} />
                  Heures insuffisantes
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <CheckCircle size={18} />
                  Couverture ok
                </div>
              )}
              
              <button 
                onClick={saveAvailabilities}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <Save size={18} />
                Enregistrer
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', gap: '12px' }}>
            {/* Entête des jours */}
            <div></div>
            {DAYS.map(day => (
              <div key={day.id} style={{ textAlign: 'center', fontWeight: 600, padding: '12px 0', backgroundColor: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {day.name}
              </div>
            ))}

            {/* Grille */}
            {TIME_SLOTS.map(slot => (
              <React.Fragment key={slot.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {slot.label}
                </div>
                {DAYS.map(day => {
                  const pref = getCellState(day.id, slot.id);
                  return (
                    <div 
                      key={`${day.id}-${slot.id}`}
                      onClick={() => handleCellClick(day.id, slot.id)}
                      style={{
                        height: '80px',
                        borderRadius: '8px',
                        border: getCellBorder(pref),
                        backgroundColor: getCellBg(pref),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {renderCellContent(pref)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-page)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Légende (clics successifs) :</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981' }}></div> Disponible</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(139, 92, 246, 0.2)', border: '2px solid #8b5cf6' }}></div> Préféré</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '2px solid #f59e0b' }}></div> À Éviter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px dashed var(--border)' }}></div> Indisponible</div>
          </div>
        </div>
      )}
    </div>
  );
};
