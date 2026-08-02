import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, AlertTriangle, CheckCircle, Search, Save, Filter, X } from 'lucide-react';
import { api, fetchWithLocalFallback } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { STORAGE_KEYS, readStored, writeStored } from '../../lib/storage';

type AttendanceType = 'PRESENT' | 'ABSENCE' | 'LATE' | 'EXCUSED';

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  type: AttendanceType;
  reason?: string;
  durationMinutes?: number;
}

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  matricule?: string;
}

export const AttendanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPEL' | 'HISTORIQUE'>('APPEL');
  
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    const loadedClasses = await fetchWithLocalFallback<{ id: string; name: string }[]>(
      '/tenant/classes',
      STORAGE_KEYS.classes,
      [],
    );
    setClasses(loadedClasses);
    if (loadedClasses.length > 0) setSelectedClass(loadedClasses[0].id);

    setAttendances(await fetchWithLocalFallback<AttendanceRecord[]>('/tenant/attendances', STORAGE_KEYS.attendances, []));
    setAllStudents(await fetchWithLocalFallback<StudentData[]>('/tenant/students', STORAGE_KEYS.students, []));
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await api.get(`/tenant/students?classId=${classId}`);
      setStudents(res.data);
    } catch (err) {
      const allStudents = readStored<StudentData[]>(STORAGE_KEYS.students, []);
      setStudents(allStudents.filter(s => s.classId === classId));
    }
  };

  const saveAttendances = (newRecords: AttendanceRecord[]) => {
    setAttendances(newRecords);
    writeStored(STORAGE_KEYS.attendances, newRecords);
  };

  const handleStatusChange = (studentId: string, newType: AttendanceType) => {
    let updated = [...attendances];
    const existingIndex = updated.findIndex(a => a.studentId === studentId && a.date === currentDate && a.classId === selectedClass);
    
    if (newType === 'PRESENT') {
      if (existingIndex >= 0) updated.splice(existingIndex, 1);
    } else {
      if (existingIndex >= 0) {
        updated[existingIndex].type = newType;
        if (newType !== 'LATE') updated[existingIndex].durationMinutes = undefined;
      } else {
        updated.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          classId: selectedClass,
          date: currentDate,
          type: newType
        });
      }
    }
    saveAttendances(updated);
  };

  const handleDurationChange = (studentId: string, minutes: number) => {
    let updated = [...attendances];
    const existingIndex = updated.findIndex(a => a.studentId === studentId && a.date === currentDate && a.classId === selectedClass);
    if (existingIndex >= 0) {
      updated[existingIndex].durationMinutes = minutes;
      saveAttendances(updated);
    }
  };

  const handleReasonChange = (id: string, reason: string) => {
    let updated = [...attendances];
    const index = updated.findIndex(a => a.id === id);
    if (index >= 0) {
      updated[index].reason = reason;
      saveAttendances(updated);
    }
  };
  
  const handleTypeChangeHist = (id: string, type: AttendanceType) => {
    let updated = [...attendances];
    const index = updated.findIndex(a => a.id === id);
    if (index >= 0) {
      if (type === 'PRESENT') {
         updated.splice(index, 1);
      } else {
         updated[index].type = type;
      }
      saveAttendances(updated);
    }
  };

  // Statistiques du jour pour la classe sélectionnée
  const todaysRecords = attendances.filter(a => a.date === currentDate && a.classId === selectedClass);
  const totalAbsences = todaysRecords.filter(a => a.type === 'ABSENCE').length;
  const totalLates = todaysRecords.filter(a => a.type === 'LATE').length;
  const totalExcused = todaysRecords.filter(a => a.type === 'EXCUSED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Absences & Retards</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gérez les présences de vos élèves.</p>
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('APPEL')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'APPEL' ? 'var(--accent)' : 'transparent', color: activeTab === 'APPEL' ? '#FFF' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Faire l'appel
          </button>
          <button 
            onClick={() => setActiveTab('HISTORIQUE')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'HISTORIQUE' ? 'var(--accent)' : 'transparent', color: activeTab === 'HISTORIQUE' ? '#FFF' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Historique & Justifications
          </button>
        </div>
      </div>

      {activeTab === 'APPEL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filtres et KPIs */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Classe</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none' }}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date</label>
                <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ flex: 2, display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><AlertTriangle size={24} /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalAbsences}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Absences</div>
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Clock size={24} /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalLates}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Retards</div>
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={24} /></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalExcused}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Justifiés</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille de saisie */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Élève</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', width: '300px' }}>Statut</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', width: '200px' }}>Détails (Retard)</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const record = todaysRecords.find(a => a.studentId === student.id);
                  const status = record ? record.type : 'PRESENT';

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {student.firstName} {student.lastName}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', background: status === 'PRESENT' ? '#10b981' : 'var(--bg-page)', color: status === 'PRESENT' ? '#FFF' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                          >
                            Présent
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.id, 'ABSENCE')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', background: status === 'ABSENCE' ? '#ef4444' : 'var(--bg-page)', color: status === 'ABSENCE' ? '#FFF' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                          >
                            Absent
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', background: status === 'LATE' ? '#f59e0b' : 'var(--bg-page)', color: status === 'LATE' ? '#FFF' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                          >
                            Retard
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {status === 'LATE' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="number" 
                              min="1" 
                              placeholder="Min."
                              value={record?.durationMinutes || ''} 
                              onChange={e => handleDurationChange(student.id, parseInt(e.target.value))}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>min.</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aucun élève trouvé dans cette classe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HISTORIQUE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
             <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>Historique des Absences & Retards</h3>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Classe / Élève</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Statut & Détails</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Justification</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendances.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                  
                  // Ici, récupération du nom de l'élève et de son matricule
                  const student = allStudents.find(s => s.id === record.studentId);
                  const studentName = student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu';
                  const studentMatricule = student?.matricule || (student ? `ELEV${student.id.substring(0,5).replace(/[^0-9]/g, '0').padEnd(5, '0')}` : 'N/A');
                  
                  const cls = classes.find(c => c.id === record.classId)?.name || 'Classe inconnue';
                  const isExcused = record.type === 'EXCUSED';

                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{formatDate(record.date)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                        <div style={{ fontWeight: 600 }}>{studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {cls} | Mat: {studentMatricule}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                         <span style={{ 
                           padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                           backgroundColor: record.type === 'ABSENCE' ? 'rgba(239, 68, 68, 0.1)' : record.type === 'LATE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                           color: record.type === 'ABSENCE' ? '#ef4444' : record.type === 'LATE' ? '#f59e0b' : '#10b981'
                         }}>
                           {record.type === 'ABSENCE' ? 'ABSENT(E)' : record.type === 'LATE' ? 'RETARD' : 'JUSTIFIÉ'}
                         </span>
                         {record.type === 'LATE' && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({record.durationMinutes} min)</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input 
                          type="text" 
                          placeholder="Motif (ex: Certificat médical)" 
                          value={record.reason || ''}
                          onChange={e => handleReasonChange(record.id, e.target.value)}
                          style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {record.type !== 'EXCUSED' ? (
                            <button
                              onClick={() => handleTypeChangeHist(record.id, 'EXCUSED')}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Justifier
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTypeChangeHist(record.id, 'ABSENCE')}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Non justifier
                            </button>
                          )}
                          <button
                            onClick={() => handleTypeChangeHist(record.id, 'PRESENT')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            Annuler (Présent)
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {attendances.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun historique d'absence.</td></tr>
                )}
              </tbody>
            </table>
           </div>
        </div>
      )}
    </div>
  );
};
