import React, { useState, useEffect } from 'react';
import { Save, BookOpen } from 'lucide-react';

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

    // Helper pour sauvegarder une matière
    const saveSubject = (subjectName: string, gradeKey: string) => {
      const detail = studentGrades[gradeKey];
      if (!detail) return; // Ne rien faire si vide
      const avg = getAverage(detail);
      if (avg === '') return; // Ne rien faire s'il n'y a aucune note

      // Format: "moyenne|dev1|dev2|compo" pour que parseFloat(val) fonctionne côté bulletin
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

    // Helper pour retirer la note si la matière est désactivée
    const removeSubjectGrade = (subjectName: string) => {
      let evIndex = updatedEvaluations.findIndex(e => e.classId === selectedStudent.classId && e.subject === subjectName && e.name === `Moyenne ${selectedTerm}`);
      if (evIndex >= 0) {
        const ev = updatedEvaluations[evIndex];
        const newGrades = ev.grades.filter(g => g.studentId !== selectedStudent.id);
        updatedEvaluations[evIndex] = { ...ev, grades: newGrades };
      }
    };

    // Sauvegarder uniquement les matières actives, retirer les désactivées
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
      // Retirer n'importe quelle LV1 existante
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
    
    setSaveStatus("Notes & Coefficients enregistrés !");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-title)', fontSize: '1.4rem' }}>Saisie des Bulletins (Par Élève)</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Sélectionnez un élève pour saisir ses moyennes. Laissez la note vide pour indiquer que la matière n'est pas évaluée.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Panneau Gauche : Filtres */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1,
          minWidth: '300px',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--accent)" /> Filtres & Sélection
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>1. Choisir le trimestre</label>
              <select 
                value={selectedTerm} 
                onChange={e => setSelectedTerm(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', fontSize: '0.95rem', width: '100%', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
              >
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>2. Filtrer par classe (Optionnel)</label>
              <select 
                value={selectedClassId} 
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setSelectedStudentId(''); 
                }}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', fontSize: '0.95rem', width: '100%', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Toutes les classes --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>3. Sélectionner un élève</label>
              <select 
                value={selectedStudentId} 
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--accent)', fontSize: '0.95rem', width: '100%', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Choisir un élève --</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.className || 'Sans classe'})</option>)}
              </select>
            </div>
          </div>

          {students.length === 0 && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--status-warning)', borderRadius: '8px', display: 'flex', gap: '12px', color: 'var(--status-warning)' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.9rem' }}>Aucun élève n'est inscrit.</span>
            </div>
          )}
        </div>

        {/* Panneau Droit : Saisie */}
        <div style={{
          flex: 2,
          minWidth: '400px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!selectedStudent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-secondary)' }}>
              <BookOpen size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
              <p>Veuillez sélectionner un élève à gauche pour commencer la saisie de ses notes.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', margin: '0 0 4px 0' }}>{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Classe : {selectedStudent.className || 'Non assignée'}</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-page)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {selectedTerm} (sur 20)
                </div>
              </div>

              {/* LV1 / LV2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                {/* LV1 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)', opacity: activeSubjects['LV1'] ? 1 : 0.5 }}>
                  <input type="checkbox" checked={!!activeSubjects['LV1']} onChange={() => toggleSubject('LV1')} title="Activer/Désactiver cette matière" style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Langue Vivante 1</span>
                    <select value={studentLv1} onChange={e => setStudentLv1(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', width: '100%' }}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 1</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV1']?.dev1 || ''} onChange={(e) => handleGradeChange('LV1', 'dev1', e.target.value)} disabled={studentLv1 === 'Aucune' || !activeSubjects['LV1']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 2</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV1']?.dev2 || ''} onChange={(e) => handleGradeChange('LV1', 'dev2', e.target.value)} disabled={studentLv1 === 'Aucune' || !activeSubjects['LV1']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compo.</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV1']?.compo || ''} onChange={(e) => handleGradeChange('LV1', 'compo', e.target.value)} disabled={studentLv1 === 'Aucune' || !activeSubjects['LV1']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', marginLeft: '8px', paddingLeft: '16px', borderLeft: '1px dashed var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Moyenne</span>
                      <input type="text" value={getAverage(studentGrades['LV1'])} readOnly style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'rgba(91, 108, 255, 0.1)', color: 'var(--accent)', fontWeight: 'bold' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coef.</span>
                      <input type="number" min={1} value={subjectCoefs['LV1'] || 1} onChange={(e) => handleCoefChange('LV1', parseFloat(e.target.value) || 1)} disabled={studentLv1 === 'Aucune'} style={{ width: '45px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </div>

                {/* LV2 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)', opacity: activeSubjects['LV2'] ? 1 : 0.5 }}>
                  <input type="checkbox" checked={!!activeSubjects['LV2']} onChange={() => toggleSubject('LV2')} title="Activer/Désactiver cette matière" style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Langue Vivante 2</span>
                    <select value={studentLv2} onChange={e => setStudentLv2(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', width: '100%' }}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 1</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV2']?.dev1 || ''} onChange={(e) => handleGradeChange('LV2', 'dev1', e.target.value)} disabled={studentLv2 === 'Aucune' || !activeSubjects['LV2']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 2</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV2']?.dev2 || ''} onChange={(e) => handleGradeChange('LV2', 'dev2', e.target.value)} disabled={studentLv2 === 'Aucune' || !activeSubjects['LV2']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compo.</span>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades['LV2']?.compo || ''} onChange={(e) => handleGradeChange('LV2', 'compo', e.target.value)} disabled={studentLv2 === 'Aucune' || !activeSubjects['LV2']} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', marginLeft: '8px', paddingLeft: '16px', borderLeft: '1px dashed var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Moyenne</span>
                      <input type="text" value={getAverage(studentGrades['LV2'])} readOnly style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'rgba(91, 108, 255, 0.1)', color: 'var(--accent)', fontWeight: 'bold' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coef.</span>
                      <input type="number" min={1} value={subjectCoefs['LV2'] || 1} onChange={(e) => handleCoefChange('LV2', parseFloat(e.target.value) || 1)} disabled={studentLv2 === 'Aucune'} style={{ width: '45px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Autres Matières */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Matières Générales</h4>
                  <button 
                    onClick={applySubjectsToClass}
                    style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '2px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Sauvegarder ces matières (activées/désactivées) comme référence pour toute la classe."
                  >
                    Appliquer cette liste à toute la classe
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '16px', gap: '8px' }}>
                  <div style={{ width: '60px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 1</div>
                  <div style={{ width: '60px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Devoir 2</div>
                  <div style={{ width: '60px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compo.</div>
                  <div style={{ width: '60px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px', paddingLeft: '16px' }}>Moyenne</div>
                  <div style={{ width: '45px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Coef.</div>
                </div>
                {DEFAULT_SUBJECTS.map(subject => (
                  <div key={subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)', opacity: activeSubjects[subject] ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                      <input type="checkbox" checked={!!activeSubjects[subject]} onChange={() => toggleSubject(subject)} title="Activer/Désactiver cette matière" style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={subject}>{subject}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades[subject]?.dev1 || ''} onChange={(e) => handleGradeChange(subject, 'dev1', e.target.value)} disabled={!activeSubjects[subject]} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades[subject]?.dev2 || ''} onChange={(e) => handleGradeChange(subject, 'dev2', e.target.value)} disabled={!activeSubjects[subject]} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                      <input type="number" max={20} min={0} step="0.25" value={studentGrades[subject]?.compo || ''} onChange={(e) => handleGradeChange(subject, 'compo', e.target.value)} disabled={!activeSubjects[subject]} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                      
                      <div style={{ marginLeft: '8px', paddingLeft: '16px', borderLeft: '1px dashed var(--border)' }}>
                        <input type="text" value={getAverage(studentGrades[subject])} readOnly style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid transparent', textAlign: 'center', backgroundColor: 'rgba(91, 108, 255, 0.1)', color: 'var(--accent)', fontWeight: 'bold' }} />
                      </div>
                      
                      <div style={{ marginLeft: '8px' }}>
                        <input type="number" min={1} value={subjectCoefs[subject] || 1} onChange={(e) => handleCoefChange(subject, parseFloat(e.target.value) || 1)} style={{ width: '45px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ color: 'var(--status-positive)', fontWeight: 500, fontSize: '0.95rem' }}>
                  {saveStatus}
                </span>
                
                <button 
                  onClick={saveGrades}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91, 108, 255, 0.3)' }}
                >
                  <Save size={18} /> Enregistrer le bulletin
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
