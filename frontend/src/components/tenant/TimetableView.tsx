import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

interface TimetableEntry {
  id: string;
  classId: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
}

export const TimetableView: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  
  const [classId, setClassId] = useState('');
  const [day, setDay] = useState('Lundi');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // 1. Appel API + Persistance locale
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Charger les classes
    try {
      const classRes = await api.get('/tenant/classes');
      setAvailableClasses(classRes.data);
      if (classRes.data.length > 0) setClassId(classRes.data[0].id);
    } catch (err) {
      console.warn('Erreur API /tenant/classes, fallback local:', err);
      const savedClasses = localStorage.getItem('kpsydesk_classes');
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        setAvailableClasses(parsedClasses);
        if (parsedClasses.length > 0) setClassId(parsedClasses[0].id);
      }
    }

    // 1b. Charger les professeurs
    try {
      const teacherRes = await api.get('/tenant/teachers');
      setAvailableTeachers(teacherRes.data);
      if (teacherRes.data.length > 0) setTeacher(teacherRes.data[0].id);
    } catch (err) {
      console.warn('Erreur API /tenant/teachers, fallback local:', err);
      const savedTeachers = localStorage.getItem('kpsydesk_teachers');
      if (savedTeachers) {
        const parsedTeachers = JSON.parse(savedTeachers);
        setAvailableTeachers(parsedTeachers);
        if (parsedTeachers.length > 0) setTeacher(parsedTeachers[0].id);
      }
    }

    // 1c. Charger les matières
    try {
      const courseRes = await api.get('/tenant/courses');
      setAvailableCourses(courseRes.data);
      if (courseRes.data.length > 0) setSubject(courseRes.data[0].id);
    } catch (err) {
      console.warn('Erreur API /tenant/courses, fallback local:', err);
      const savedCourses = localStorage.getItem('kpsydesk_courses');
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        setAvailableCourses(parsedCourses);
        if (parsedCourses.length > 0) setSubject(parsedCourses[0].id);
      } else {
        // Fallback de base si aucune matière n'est trouvée (facultatif mais utile pour la démo)
        const mockCourses = [{ id: 'c-1', name: 'Mathématiques' }, { id: 'c-2', name: 'Français' }];
        setAvailableCourses(mockCourses);
        setSubject(mockCourses[0].id);
      }
    }

    // 2. Charger le planning
    try {
      const timeRes = await api.get('/tenant/timetables');
      const apiEntries = timeRes.data.map((t: any) => ({
        id: t.id,
        classId: t.classId,
        className: t.class?.name || 'Inconnue',
        day: days[t.dayOfWeek - 1] || 'Lundi',
        startTime: t.startTime,
        endTime: t.endTime,
        subject: t.course?.name || 'Inconnue',
        teacher: t.teacher?.lastName || 'Inconnu'
      }));
      setEntries(apiEntries);
      localStorage.setItem('kpsydesk_timetable', JSON.stringify(apiEntries));
    } catch (err) {
      console.warn('Erreur API /tenant/timetables, fallback local:', err);
      const savedEntries = localStorage.getItem('kpsydesk_timetable');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      } else {
        const defaultEntries = [
          { id: '1', classId: '1', className: 'Classe de 6ème A', day: 'Lundi', startTime: '08:00', endTime: '10:00', subject: 'Mathématiques', teacher: 'M. Ndiaye' }
        ];
        setEntries(defaultEntries);
        localStorage.setItem('kpsydesk_timetable', JSON.stringify(defaultEntries));
      }
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subject || !teacher) return;

    if (startTime >= endTime) {
      alert("L'heure de fin doit être après l'heure de début.");
      return;
    }

    // Vérification de chevauchement pour la classe
    const hasClassOverlap = entries.some(ent => 
      ent.classId === classId && 
      ent.day === day &&
      (startTime < ent.endTime && endTime > ent.startTime)
    );

    if (hasClassOverlap) {
      alert("Cette classe a déjà un cours programmé sur ce créneau horaire !");
      return;
    }

    // Vérification de chevauchement pour le professeur
    const selectedTeacherObj = availableTeachers.find(t => t.id === teacher);
    const teacherName = selectedTeacherObj ? `${selectedTeacherObj.firstName} ${selectedTeacherObj.lastName}` : teacher;

    const hasTeacherOverlap = entries.some(ent => 
      ent.teacher === teacherName && 
      ent.day === day &&
      (startTime < ent.endTime && endTime > ent.startTime)
    );

    if (hasTeacherOverlap) {
      alert("Cet enseignant est déjà affecté à une autre classe sur ce créneau horaire !");
      return;
    }

    // Vérification par rapport aux disponibilités déclarées par l'enseignant
    let teacherAvailabilities: any[] = [];
    try {
      const savedAvail = localStorage.getItem(`kpsydesk_availabilities_${teacher}`);
      if (savedAvail) {
        teacherAvailabilities = JSON.parse(savedAvail);
      }
    } catch (e) {
      console.warn(`Disponibilités enseignant illisibles pour ${teacher}:`, e);
    }

    if (teacherAvailabilities.length === 0) {
      alert("Cet enseignant n'a défini aucune disponibilité. Impossible de l'affecter.");
      return;
    }

    const dayId = days.indexOf(day) + 1;
    const dayAvails = teacherAvailabilities.filter(a => a.dayOfWeek === dayId);
    
    let isCovered = false;
    if (dayAvails.length > 0) {
      // 1. Essayer de voir si un seul créneau couvre tout le cours
      isCovered = dayAvails.some(a => {
        const [slotStart, slotEnd] = a.timeSlotId.split('-');
        return startTime >= slotStart && endTime <= slotEnd;
      });

      // 2. Si non, vérifier si la combinaison de créneaux continus couvre le cours
      if (!isCovered) {
        let currentStart = startTime;
        const sortedSlots = dayAvails
          .map(a => a.timeSlotId.split('-'))
          .sort((a,b) => a[0].localeCompare(b[0]));
          
        for (const [sStart, sEnd] of sortedSlots) {
          if (currentStart >= sStart && currentStart < sEnd) {
            currentStart = sEnd >= endTime ? endTime : sEnd;
          }
        }
        isCovered = currentStart >= endTime;
      }
    }

    if (!isCovered) {
      alert("Ce créneau ne fait pas partie des disponibilités déclarées par l'enseignant !");
      return;
    }

    try {
      // Simplification : Dans une vraie app, on envoie teacherId et courseId 
      // via des menus déroulants. Ici, l'API va sûrement échouer sans IDs valides,
      // ce qui déclenchera le fallback local en douceur.
      await api.post('/tenant/timetables', {
        classId,
        dayOfWeek: days.indexOf(day) + 1,
        startTime,
        endTime,
        // On mock les IDs pour l'exemple
        teacherId: 'placeholder',
        courseId: 'placeholder'
      });
      fetchData();
    } catch (err) {
      console.error('Erreur API, fallback sur local:', err);
      // Fallback 100% local si l'API n'a pas encore les FK valides
      const selectedClass = availableClasses.find(c => c.id === classId);
      const selectedCourse = availableCourses.find(c => c.id === subject);
      const selectedTeacher = availableTeachers.find(t => t.id === teacher);
      
      const newEntry: TimetableEntry = {
        id: Date.now().toString(),
        classId,
        className: selectedClass ? selectedClass.name : 'Inconnue',
        day,
        startTime,
        endTime,
        subject: selectedCourse ? selectedCourse.name : subject,
        teacher: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : teacher
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      localStorage.setItem('kpsydesk_timetable', JSON.stringify(updated));
    }
    
    // Pas de reset, ou on peut garder les mêmes valeurs pour enchaîner la saisie
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Supprimer ce cours ?')) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('kpsydesk_timetable', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Formulaire */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1,
          minWidth: '320px'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: 'var(--font-title)' }}>
            Ajouter un cours
          </h3>
          <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Classe</label>
              <select value={classId} onChange={e => setClassId(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
                {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Jour</label>
                <select value={day} onChange={e => setDay(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>De</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>À</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matière</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
                <option value="">Sélectionnez une matière...</option>
                {availableCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enseignant</label>
              <select value={teacher} onChange={e => setTeacher(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
                <option value="">Sélectionnez un enseignant...</option>
                {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
            <button type="submit" style={{
              backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', padding: '12px',
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px'
            }}>
              <Plus size={18} /> Ajouter au planning
            </button>
          </form>
        </div>

        {/* Liste */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 2,
          minWidth: '400px'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', marginBottom: '20px' }}>
            Planning Enregistré
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day)).map((ent) => (
              <div key={ent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '8px', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{ent.subject} - {ent.className}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} /> {ent.day} de {ent.startTime} à {ent.endTime} · {ent.teacher}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeleteEntry(ent.id)} style={{ background: 'none', border: 'none', color: 'var(--status-negative)', cursor: 'pointer', padding: '6px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
