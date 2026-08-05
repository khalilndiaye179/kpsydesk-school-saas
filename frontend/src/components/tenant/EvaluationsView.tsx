import React, { useState, useEffect } from 'react';
import { Save, UserCheck, BookOpen, AlertCircle, RefreshCw, Award, CheckCircle2 } from 'lucide-react';
import { getCountryAcademicConfig, getSubjectsForClassSeries } from '../../config/academic.config';

interface Grade {
  studentId: string;
  studentName: string;
  value: string;
}

interface Evaluation {
  id: string;
  classId: string;
  className: string;
  subject: string;
  name: string;
  date: string;
  maxScore: number;
  coefficient?: number;
  grades: Grade[];
}

const DEFAULT_SUBJECTS = [
  'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 
  'SVT', 'Physique-Chimie', 'EPS', 'Arts Plastiques',
  'Éducation Civique et Morale (ECM)', 'Technologie', 'Philosophie', 'Conduite/Discipline'
];

const LANGUAGES = ['Aucune', 'Anglais', 'Espagnol', 'Allemand', 'Arabe', 'Latin', 'Grec'];

export const EvaluationsView: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  
  const [selectedTerm, setSelectedTerm] = useState('Trimestre 1');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // États locaux
  interface SubjectDetail {
    dev1: string;
    dev2: string;
    compo: string;
  }
  const [studentGrades, setStudentGrades] = useState<Record<string, SubjectDetail>>({});
  const [subjectCoefs, setSubjectCoefs] = useState<Record<string, number>>({});
  const [studentLv1, setStudentLv1] = useState('Aucune');
  const [studentLv2, setStudentLv2] = useState('Aucune');
  const [activeSubjects, setActiveSubjects] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const countryCode = localStorage.getItem('kpsydesk_active_tenant_country') || 'SN';

  useEffect(() => {
    const savedClasses = localStorage.getItem('kpsydesk_classes');
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    const savedStudents = localStorage.getItem('kpsydesk_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    const savedEvals = localStorage.getItem('kpsydesk_evaluations');
    if (savedEvals) setEvaluations(JSON.parse(savedEvals));
  }, []);

  const filteredStudents = selectedClassId 
    ? students.filter(s => s.classId === selectedClassId)
    : students;

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // ---------------------------------------------------------------------------
  // AUTO-INJECTION DES COEFFICIENTS DYNAMIQUES DU MOTEUR ACADÉMIQUE CENTRAL
  // ---------------------------------------------------------------------------
  const applyAcademicEngineCoefficients = () => {
    if (!selectedStudent) return;

    // Déduire le niveau (ex: "Terminale" ou "3ème") et la série (ex: "S2", "L2", "A") depuis le nom de la classe
    const className = selectedStudent.className || '';
    let levelCode = '3EME';
    let seriesCode: string | undefined = undefined;

    if (className.toUpperCase().includes('TLE') || className.toUpperCase().includes('TERMINALE')) {
      levelCode = 'TLE';
      if (className.includes('S2')) seriesCode = 'S2';
      else if (className.includes('S1')) seriesCode = 'S1';
      else if (className.includes('L2')) seriesCode = 'L2';
      else if (className.includes('L1')) seriesCode = 'L1';
      else if (className.includes(' A')) seriesCode = 'A';
      else if (className.includes(' C')) seriesCode = 'C';
      else if (className.includes(' D')) seriesCode = 'D';
    } else if (className.includes('2NDE') || className.includes('SECONDE')) {
      levelCode = '2NDE';
    }

    // Récupérer la grille officielle du Moteur Académique
    const officialSubjects = getSubjectsForClassSeries(countryCode, levelCode, seriesCode);
    
    if (officialSubjects.length > 0) {
      const updatedCoefs: Record<string, number> = { ...subjectCoefs };
      officialSubjects.forEach(sub => {
        // Mapper les noms de matières
        if (sub.subjectName.includes('Math')) updatedCoefs['Mathématiques'] = sub.coefficient;
        if (sub.subjectName.includes('Français')) updatedCoefs['Français'] = sub.coefficient;
        if (sub.subjectName.includes('Physique')) updatedCoefs['Physique-Chimie'] = sub.coefficient;
        if (sub.subjectName.includes('SVT') || sub.subjectName.includes('Terre')) updatedCoefs['SVT'] = sub.coefficient;
        if (sub.subjectName.includes('Philo')) updatedCoefs['Philosophie'] = sub.coefficient;
        if (sub.subjectName.includes('Anglais')) updatedCoefs['Anglais'] = sub.coefficient;
        if (sub.subjectName.includes('Histoire')) updatedCoefs['Histoire-Géographie'] = sub.coefficient;
        if (sub.subjectName.includes('EPS')) updatedCoefs['EPS'] = sub.coefficient;
      });

      setSubjectCoefs(updatedCoefs);
      setSaveStatus(`Coefficients officiels ${levelCode} ${seriesCode || ''} (${countryCode}) appliqués automatiquement !`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  useEffect(() => {
    if (!selectedStudent) {
      setStudentGrades({});
      setSubjectCoefs({});
      setStudentLv1('Aucune');
      setStudentLv2('Aucune');
      return;
    }

    const currentGrades: Record<string, SubjectDetail> = {};
    const currentCoefs: Record<string, number> = {};
    let loadedLv1 = 'Aucune';
    let loadedLv2 = 'Aucune';
    
    const parseGrade = (val: string): SubjectDetail => {
      if (val.includes('|')) {
        const parts = val.split('|');
        return { dev1: parts[1] || '', dev2: parts[2] || '', compo: parts[3] || '' };
      }
      return { dev1: val, dev2: '', compo: '' };
    };

    // Charger matières standard
    DEFAULT_SUBJECTS.forEach(subject => {
      const ev = evaluations.find(e => e.classId === selectedStudent.classId && e.subject === subject && e.name === `Moyenne ${selectedTerm}`);
      if (ev) {
        currentCoefs[subject] = ev.coefficient || 1;
        const studentGrade = ev.grades.find(g => g.studentId === selectedStudent.id);
        if (studentGrade && studentGrade.value !== '') currentGrades[subject] = parseGrade(studentGrade.value);
      } else {
        currentCoefs[subject] = 1; // Default
      }
    });

    // Charger langues
    const termEvals = evaluations.filter(e => e.classId === selectedStudent.classId && e.name === `Moyenne ${selectedTerm}`);
    termEvals.forEach(ev => {
      if (ev.subject.startsWith('LV1 - ')) {
        loadedLv1 = ev.subject.replace('LV1 - ', '');
        currentCoefs['LV1'] = ev.coefficient || 1;
        const grade = ev.grades.find(g => g.studentId === selectedStudent.id);
        if (grade && grade.value !== '') currentGrades['LV1'] = parseGrade(grade.value);
      }
      if (ev.subject.startsWith('LV2 - ')) {
        loadedLv2 = ev.subject.replace('LV2 - ', '');
        currentCoefs['LV2'] = ev.coefficient || 1;
        const grade = ev.grades.find(g => g.studentId === selectedStudent.id);
        if (grade && grade.value !== '') currentGrades['LV2'] = parseGrade(grade.value);
      }
    });

    if (!currentCoefs['LV1']) currentCoefs['LV1'] = 1;
    if (!currentCoefs['LV2']) currentCoefs['LV2'] = 1;

    // Charger les matières actives de la classe
    const savedClassSubjects = localStorage.getItem(`kpsydesk_class_subjects_${selectedStudent.classId}`);
    if (savedClassSubjects) {
      setActiveSubjects(JSON.parse(savedClassSubjects));
    } else {
      const defaultActive: Record<string, boolean> = {};
      DEFAULT_SUBJECTS.forEach(s => defaultActive[s] = true);
      defaultActive['LV1'] = true;
      defaultActive['LV2'] = true;
      setActiveSubjects(defaultActive);
    }

    setStudentGrades(currentGrades);
    setSubjectCoefs(currentCoefs);
    setStudentLv1(loadedLv1);
    setStudentLv2(loadedLv2);
    setSaveStatus(null);
  }, [selectedStudentId, selectedTerm, evaluations]);

  const handleGradeChange = (subject: string, field: 'dev1' | 'dev2' | 'compo', value: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [subject]: {
        ...(prev[subject] || { dev1: '', dev2: '', compo: '' }),
        [field]: value
      }
    }));
    setSaveStatus(null);
  };

  const handleCoefChange = (subject: string, value: number) => {
    setSubjectCoefs(prev => ({ ...prev, [subject]: value }));
    setSaveStatus(null);
  };

  const toggleSubject = (subject: string) => {
    setActiveSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
    setSaveStatus(null);
  };

  const applySubjectsToClass = () => {
    if (!selectedStudent) return;
    localStorage.setItem(`kpsydesk_class_subjects_${selectedStudent.classId}`, JSON.stringify(activeSubjects));
    setSaveStatus("Configuration des matières appliquée à toute la classe !");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const getAverage = (detail: SubjectDetail | undefined): string => {
    if (!detail) return '';
    const notes = [detail.dev1, detail.dev2, detail.compo].filter(n => n !== '').map(n => parseFloat(n));
    if (notes.length === 0) return '';
    const sum = notes.reduce((a, b) => a + b, 0);
    return (sum / notes.length).toFixed(2);
  };

  const saveGrades = () => {
    if (!selectedStudent) return;

    let updatedEvaluations = [...evaluations];

    const saveSubject = (subjectName: string, gradeKey: string) => {
      const detail = studentGrades[gradeKey];
      if (!detail) return;
      const avg = getAverage(detail);
      if (avg === '') return;

      const val = `${avg}|${detail.dev1}|${detail.dev2}|${detail.compo}`;
      const coef = subjectCoefs[gradeKey] || 1;

      let evIndex = updatedEvaluations.findIndex(e => e.classId === selectedStudent.classId && e.subject === subjectName && e.name === `Moyenne ${selectedTerm}`);
      
      if (evIndex >= 0) {
        const ev = updatedEvaluations[evIndex];
        const gradeIndex = ev.grades.findIndex(g => g.studentId === selectedStudent.id);
        
        let newGrades = [...ev.grades];
        if (gradeIndex >= 0) {
          newGrades[gradeIndex] = { ...newGrades[gradeIndex], value: val };
        } else {
          newGrades.push({ studentId: selectedStudent.id, studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`, value: val });
        }
        
        updatedEvaluations[evIndex] = { ...ev, grades: newGrades, coefficient: coef };
      } else {
        const newEval: Evaluation = {
          id: Date.now().toString() + Math.random().toString(),
          classId: selectedStudent.classId,
          className: selectedStudent.className || 'Classe Inconnue',
          subject: subjectName,
          name: `Moyenne ${selectedTerm}`,
          date: new Date().toISOString().split('T')[0],
          maxScore: 20,
          coefficient: coef,
          grades: [{
            studentId: selectedStudent.id,
            studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            value: val
          }]
        };
        updatedEvaluations.push(newEval);
      }
    };

    const removeSubjectGrade = (subjectName: string) => {
      let evIndex = updatedEvaluations.findIndex(e => e.classId === selectedStudent.classId && e.subject === subjectName && e.name === `Moyenne ${selectedTerm}`);
      if (evIndex >= 0) {
        const ev = updatedEvaluations[evIndex];
        const newGrades = ev.grades.filter(g => g.studentId !== selectedStudent.id);
        updatedEvaluations[evIndex] = { ...ev, grades: newGrades };
      }
    };

    DEFAULT_SUBJECTS.forEach(subject => {
      if (activeSubjects[subject]) {
        saveSubject(subject, subject);
      } else {
        removeSubjectGrade(subject);
      }
    });

    if (studentLv1 !== 'Aucune' && activeSubjects['LV1']) {
      saveSubject(`LV1 - ${studentLv1}`, 'LV1');
    } else {
      LANGUAGES.forEach(l => {
        if (l !== 'Aucune') removeSubjectGrade(`LV1 - ${l}`);
      });
    }

    if (studentLv2 !== 'Aucune' && activeSubjects['LV2']) {
      saveSubject(`LV2 - ${studentLv2}`, 'LV2');
    } else {
      LANGUAGES.forEach(l => {
        if (l !== 'Aucune') removeSubjectGrade(`LV2 - ${l}`);
      });
    }

    setEvaluations(updatedEvaluations);
    localStorage.setItem('kpsydesk_evaluations', JSON.stringify(updatedEvaluations));
    
    setSaveStatus("Notes enregistrées avec succès !");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* En-tête de la vue Évaluations */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            Évaluations & Saisie des Notes
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Saisie rapide des devoirs, compositions et coefficients automatiques par série.
          </p>
        </div>

        {/* Bouton d'Auto-Injection des Coefficients du Moteur Académique */}
        {selectedStudent && (
          <button
            onClick={applyAcademicEngineCoefficients}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            title="Charger les coefficients officiels ministériels de cette classe/série"
          >
            <Award size={16} /> Auto-Coefficients Ministériels ({countryCode})
          </button>
        )}
      </div>

      {/* Barre de sélection : Trimestre, Classe, Élève */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        
        {/* Trimestre */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Période Académique</label>
          <select 
            value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)' }}
          >
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
            <option value="Semestre 1">Semestre 1</option>
            <option value="Semestre 2">Semestre 2</option>
          </select>
        </div>

        {/* Classe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1.5, minWidth: '200px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrer par Classe</label>
          <select 
            value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)' }}
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Élève */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2, minWidth: '250px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sélectionner l'Élève</label>
          <select 
            value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', fontWeight: 600, color: 'var(--accent)' }}
          >
            <option value="">-- Choisir un élève --</option>
            {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.className})</option>)}
          </select>
        </div>
      </div>

      {saveStatus && (
        <div style={{ padding: '14px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#166534', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {saveStatus}
        </div>
      )}

      {/* Formulaire de Saisie des Notes de l'Élève */}
      {selectedStudent ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              Carnet de Notes : <span style={{ color: 'var(--accent)' }}>{selectedStudent.firstName} {selectedStudent.lastName}</span> ({selectedStudent.className})
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={applySubjectsToClass}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Appliquer cette configuration à toute la classe
              </button>
              <button 
                onClick={saveGrades}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={16} /> Enregistrer la Fiche
              </button>
            </div>
          </div>

          {/* Grille des Matières & Devoirs */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '60px' }}>Actif</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matière</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Coeff</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Devoir 1 (/20)</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Devoir 2 (/20)</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Composition (/20)</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Moyenne Matière</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_SUBJECTS.map(subject => {
                const isActive = activeSubjects[subject] !== false;
                const detail = studentGrades[subject] || { dev1: '', dev2: '', compo: '' };
                const avg = getAverage(detail);
                const coef = subjectCoefs[subject] || 1;

                return (
                  <tr key={subject} style={{ borderBottom: '1px solid var(--border)', opacity: isActive ? 1 : 0.45 }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input type="checkbox" checked={isActive} onChange={() => toggleSubject(subject)} />
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{subject}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" min="1" max="15" value={coef} disabled={!isActive}
                        onChange={e => handleCoefChange(subject, parseInt(e.target.value) || 1)}
                        style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 700 }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" step="0.25" min="0" max="20" value={detail.dev1} disabled={!isActive}
                        onChange={e => handleGradeChange(subject, 'dev1', e.target.value)}
                        placeholder="--" style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" step="0.25" min="0" max="20" value={detail.dev2} disabled={!isActive}
                        onChange={e => handleGradeChange(subject, 'dev2', e.target.value)}
                        placeholder="--" style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" step="0.25" min="0" max="20" value={detail.compo} disabled={!isActive}
                        onChange={e => handleGradeChange(subject, 'compo', e.target.value)}
                        placeholder="--" style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 700 }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 800, color: parseFloat(avg) >= 10 ? '#10b981' : '#ef4444' }}>
                      {avg ? `${avg} / 20` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '1rem' }}>Veuillez sélectionner un élève ci-dessus pour ouvrir son carnet de notes et coefficients.</p>
        </div>
      )}

    </div>
  );
};
