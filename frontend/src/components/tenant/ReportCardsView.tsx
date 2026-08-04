import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Download, Printer, Award, Star, UserCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { getCountryConfig } from '../../config/countries.config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Student {
  id: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
}

interface SchoolSettings {
  ministry: string;
  ia: string;
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  country?: string;
}

export const ReportCardsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2023-2024');
  const [selectedTerm, setSelectedTerm] = useState<string>('Trimestre 1');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 0. Charger les paramètres d'établissement depuis le backend (avec country, ministry, ia, schoolName)
    try {
      const setRes = await api.get('/tenant/settings');
      if (setRes.data) {
        setSettings(setRes.data);
        localStorage.setItem('kpsydesk_school_settings', JSON.stringify(setRes.data));
      }
    } catch (err) {
      const savedSettings = localStorage.getItem('kpsydesk_school_settings');
      if (savedSettings) {
        try { setSettings(JSON.parse(savedSettings)); } catch (e) {}
      }
    }

    // 1. Charger les étudiants
    try {
      const stdRes = await api.get('/tenant/students');
      const apiStudents = stdRes.data.map((s: any) => ({
        id: s.id,
        matricule: s.matricule,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        className: s.class?.name || 'Inconnue'
      }));
      setStudents(apiStudents);
      localStorage.setItem('kpsydesk_students', JSON.stringify(apiStudents));
    } catch (err) {
      const savedStudents = localStorage.getItem('kpsydesk_students');
      if (savedStudents) setStudents(JSON.parse(savedStudents));
    }

    // 2. Charger les évaluations
    try {
      const evalRes = await api.get('/tenant/evaluations');
      setEvaluations(evalRes.data);
      localStorage.setItem('kpsydesk_evaluations', JSON.stringify(evalRes.data));
    } catch (err) {
      const savedEvals = localStorage.getItem('kpsydesk_evaluations');
      if (savedEvals) setEvaluations(JSON.parse(savedEvals));
    }

    // 3. Charger les absences
    try {
      const attRes = await api.get('/tenant/attendances');
      setAttendances(attRes.data);
    } catch (err) {
      const savedAtt = localStorage.getItem('kpsydesk_attendances');
      if (savedAtt) setAttendances(JSON.parse(savedAtt));
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Agréger les notes par matière pour l'étudiant sélectionné
  interface SubjectGradeDetails {
    dev1: string;
    dev2: string;
    compo: string;
    moyenne: string;
    coef: number;
  }
  const studentSubjectDetails: Record<string, SubjectGradeDetails> = {};
  
  if (selectedStudentId) {
    evaluations.forEach(ev => {
      const gradeObj = ev.grades.find((g: any) => g.studentId === selectedStudentId);
      if (gradeObj && gradeObj.value !== '') {
        const parts = String(gradeObj.value).split('|');
        let moyenneStr = gradeObj.value;
        let d1 = '';
        let d2 = '';
        let c = '';
        
        if (parts.length > 1) {
          moyenneStr = parts[0];
          d1 = parts[1] || '';
          d2 = parts[2] || '';
          c = parts[3] || '';
        }
        
        studentSubjectDetails[ev.subject] = {
          dev1: d1,
          dev2: d2,
          compo: c,
          moyenne: moyenneStr,
          coef: ev.coefficient || 1
        };
      }
    });
  }

  // Calcul du rang et de la moyenne globale de la classe
  const classStudents = students.filter(s => selectedStudent && s.classId === selectedStudent.classId);
  const studentGlobalAverages: Record<string, number> = {};

  classStudents.forEach(student => {
    let tScore = 0;
    let tCoef = 0;
    const classEvaluations = evaluations.filter(ev => ev.classId === student.classId);
    
    classEvaluations.forEach(ev => {
      const gradeObj = ev.grades.find((g: any) => g.studentId === student.id);
      if (gradeObj && gradeObj.value !== '') {
        const val = parseFloat(gradeObj.value);
        const coef = ev.coefficient || 1;
        tScore += (val / ev.maxScore) * 20 * coef;
        tCoef += coef;
      }
    });
    
    studentGlobalAverages[student.id] = tCoef > 0 ? (tScore / tCoef) : 0;
  });

  const currentStudentAvg = selectedStudentId ? (studentGlobalAverages[selectedStudentId] || 0) : 0;
  const allAverages = Object.values(studentGlobalAverages).sort((a, b) => b - a);
  const rankIndex = allAverages.findIndex(a => a === currentStudentAvg);
  const rank = rankIndex !== -1 ? rankIndex + 1 : '-';
  const rankSuffix = rank === 1 ? 'er' : 'ème';

  // Calcul des absences et de la note de discipline (Conduite)
  // Règle conventionnelle : 20/20 par défaut
  // -1 point par absence non justifiée
  // -0.5 point par retard non justifié
  const studentAttendances = attendances.filter(a => selectedStudentId && a.studentId === selectedStudentId);
  const totalAbsences = studentAttendances.filter(a => a.type === 'ABSENCE').length;
  const totalLates = studentAttendances.filter(a => a.type === 'LATE').length;
  
  let disciplineGradeNum = 20 - (totalAbsences * 1) - (totalLates * 0.5);
  if (disciplineGradeNum < 0) disciplineGradeNum = 0;
  
  // La discipline a généralement un coefficient (ex: 1)
  const disciplineCoef = 1;
  const disciplinePoints = (disciplineGradeNum * disciplineCoef);

  let globalScore = disciplinePoints;
  let totalCoef = disciplineCoef;
  const subjects = Object.keys(studentSubjectDetails);
  
  subjects.forEach(sub => {
    const avgNum = parseFloat(studentSubjectDetails[sub].moyenne);
    if (!isNaN(avgNum)) {
      const coef = studentSubjectDetails[sub].coef;
      globalScore += avgNum * coef;
      totalCoef += coef;
    }
  });

  const globalAverage = totalCoef > 0 ? (globalScore / totalCoef).toFixed(2) : '0';
  const numAverage = parseFloat(globalAverage);

  // Configuration Graphe Circulaire
  const doughnutData = {
    labels: ['Obtenu', 'Restant'],
    datasets: [
      {
        data: [numAverage, 20 - numAverage],
        backgroundColor: [
          numAverage >= 12 ? '#10b981' : numAverage >= 10 ? '#f59e0b' : '#ef4444',
          '#e2e8f0',
        ],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const getAppreciation = (note: number) => {
    if (note >= 16) return "Excellent travail, félicitations !";
    if (note >= 14) return "Très bon trimestre, continuez ainsi.";
    if (note >= 12) return "Bon trimestre, des résultats satisfaisants.";
    if (note >= 10) return "Trimestre moyen, il faut approfondir.";
    return "Des difficultés ressenties. Un effort est attendu.";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Sélection */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '500px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <UserCheck size={20} style={{ color: 'var(--accent)' }} /> Filtres & Sélection
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Année Scolaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>1. Année scolaire</label>
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', fontSize: '0.95rem', outline: 'none' }}
            >
              <option value="2023-2024">2023 - 2024</option>
              <option value="2024-2025">2024 - 2025</option>
            </select>
          </div>

          {/* Trimestre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>2. Choisir le trimestre</label>
            <select 
              value={selectedTerm}
              onChange={e => setSelectedTerm(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', fontSize: '0.95rem', outline: 'none' }}
            >
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </select>
          </div>

          {/* Classe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>3. Filtrer par classe (Optionnel)</label>
            <select 
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId(''); // Reset student selection
              }}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', fontSize: '0.95rem', outline: 'none' }}
            >
              <option value="">-- Toutes les classes --</option>
              {Array.from(new Set(students.map(s => s.className))).map(className => {
                const clsId = students.find(s => s.className === className)?.classId;
                return clsId ? <option key={clsId} value={clsId}>{className}</option> : null;
              })}
            </select>
          </div>

          {/* Élève */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>4. Sélectionner un élève</label>
            <select 
              value={selectedStudentId} 
              onChange={e => setSelectedStudentId(e.target.value)}
              style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                border: selectedStudentId ? '2px solid var(--accent)' : '1px solid var(--border)', 
                backgroundColor: 'var(--bg-page)', 
                fontSize: '0.95rem', 
                outline: 'none',
                transition: 'border 0.2s',
                boxShadow: selectedStudentId ? 'none' : (document.activeElement?.id === 'student-select' ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none')
              }}
              id="student-select"
            >
              <option value="">-- Choisir un élève --</option>
              {students
                .filter(s => !selectedClassId || s.classId === selectedClassId)
                .map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.className})</option>)
              }
            </select>
          </div>

          {selectedStudentId && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'transparent', border: '2px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                <Printer size={18} /> Imprimer
              </button>
              <button onClick={() => window.print()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                <Download size={18} /> Générer PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }
        @media screen {
          .print-wrapper {
            display: none !important;
          }
        }
        @media print {
          /* Cacher tout le contenu normal de l'application */
          body > *:not(.print-wrapper) {
            display: none !important;
          }
          
          /* Forcer l'affichage de notre wrapper d'impression */
          .print-wrapper {
            display: block !important;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Variables du contenu du bulletin pour pouvoir le réutiliser */}
      {(() => {
        const reportCardContent = selectedStudent ? (
          <>
            {/* En-tête officiel du Bulletin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid var(--accent)', paddingBottom: '24px', marginBottom: '24px' }}>
              
              {/* Gauche: Tutelle */}
              <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{settings?.ministry || "Ministère de l'Éducation Nationale"}</div>
                <div style={{ fontWeight: 600 }}>{settings?.ia || "Inspection d'Académie"}</div>
                <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--text-primary)', margin: '8px auto' }}></div>
                <div style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
                  {getCountryConfig(settings?.country).officialHeader.republicName}<br/>
                  {getCountryConfig(settings?.country).officialHeader.motto}
                </div>
              </div>

              {/* Centre: Logo */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" style={{ maxHeight: '100px', maxWidth: '120px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Award size={40} />
                  </div>
                )}
              </div>

              {/* Droite: Infos École */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--accent)', textTransform: 'uppercase' }}>{settings?.schoolName || "Établissement Scolaire"}</h1>
                {settings?.motto && <div style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: '4px 0 8px 0' }}>« {settings.motto} »</div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {settings?.address && <div>{settings.address}</div>}
                  {settings?.phone && <div>Tél: {settings.phone}</div>}
                  {settings?.email && <div>Email: {settings.email}</div>}
                </div>
              </div>

            </div>

            {/* Informations de l'élève */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-page)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <span style={{ backgroundColor: 'var(--bg-card)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid var(--border)' }}>Classe : {selectedStudent.className}</span>
                  <span style={{ backgroundColor: 'var(--bg-card)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Matricule: {selectedStudent.matricule || `ELEV${selectedStudent.id.substring(0, 5).replace(/[^0-9]/g, '0').padEnd(5, '0')}`}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--text-primary)' }}>Bulletin du {selectedTerm}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Année Scolaire {selectedYear.replace('-', ' - ')}</div>
              </div>
            </div>

            {/* Section Résumé Notes (Moyenne, Rang, Graphique) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                  <div style={{ backgroundColor: 'var(--bg-page)', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Moyenne</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{globalAverage} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/20</span></div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-page)', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rang</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rank}<sup style={{ fontSize: '0.7rem' }}>{rankSuffix}</sup> <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {classStudents.length}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: true, plugins: { tooltip: { enabled: false } }, animation: { duration: 1500 } }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-data)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{globalAverage}</span>
                    </div>
                  </div>
                  <span style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 700, color: numAverage >= 12 ? '#10b981' : numAverage >= 10 ? '#f59e0b' : '#ef4444' }}>
                    {numAverage >= 10 ? 'ADMIS' : 'AJOURNÉ'}
                  </span>
                </div>
              </div>
            
            <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, fontStyle: 'normal', color: 'var(--text-primary)' }}>Appréciation générale :</span> "{getAppreciation(numAverage)}"
            </div>

            {/* Tableau des notes */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', backgroundColor: 'var(--bg-page)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Matière & Prof.</th>
                  <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '35px' }}>Dev1</th>
                  <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '35px' }}>Dev2</th>
                  <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '45px' }}>Compo</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '45px', color: 'var(--accent)' }}>Moy.</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '40px' }}>Coef</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--border)', width: '50px' }}>Points</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(sub => {
                  const details = studentSubjectDetails[sub];
                  const avgNum = parseFloat(details.moyenne) || 0;
                  const points = (avgNum * details.coef).toFixed(2);
                  
                  return (
                    <tr key={sub} style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--bg-page)' }}>
                      <td style={{ padding: '4px 8px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{sub}</div>
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{details.dev1 || '-'}</td>
                      <td style={{ padding: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{details.dev2 || '-'}</td>
                      <td style={{ padding: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{details.compo || '-'}</td>
                      
                      <td style={{ padding: '4px 8px', textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: '0.85rem', fontWeight: 700, color: avgNum < 10 ? '#ef4444' : 'var(--accent)' }}>
                        {details.moyenne}
                      </td>
                      
                      <td style={{ padding: '4px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {details.coef}
                      </td>
                      <td style={{ padding: '4px 8px', textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {points}
                      </td>
                      
                      <td style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{getAppreciation(avgNum)}"
                      </td>
                    </tr>
                  )
                })}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Star size={24} opacity={0.3} />
                        <span style={{ fontSize: '0.85rem' }}>Aucune note n'a été saisie.</span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Ligne pour la Conduite / Discipline */}
                <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '2px solid var(--border)', borderTop: '2px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Conduite / Discipline</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Absences: {totalAbsences} | Retards: {totalLates}
                    </div>
                  </td>
                  <td colSpan={3} style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    -1 pt/absence, -0.5 pt/retard
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: '0.85rem', fontWeight: 700, color: disciplineGradeNum < 10 ? '#ef4444' : 'var(--accent)' }}>
                    {disciplineGradeNum.toFixed(2)}
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {disciplineCoef}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {disciplinePoints.toFixed(2)}
                  </td>
                  
                  <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{getAppreciation(disciplineGradeNum)}"
                  </td>
                </tr>

              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--bg-page)' }}>
                  <td colSpan={5} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    TOTAUX :
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {totalCoef}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {globalScore.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)' }}>
                    Moy. Générale: {globalAverage} &nbsp;|&nbsp; Rang: {rank}<sup style={{ fontSize: '0.6rem' }}>{rankSuffix}</sup> / {classStudents.length}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Pied de page du bulletin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '2px dashed var(--border)', paddingTop: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '32px' }}>Le Conseil des Professeurs</span>
                <span style={{ borderBottom: '1px solid var(--border)', width: '80%' }}></span>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '32px' }}>Le Chef d'Établissement</span>
                <span style={{ borderBottom: '1px solid var(--border)', width: '80%' }}></span>
              </div>
            </div>
          </>
        ) : null;

        return (
          <>
            {/* Rendu du Bulletin à l'écran */}
            {selectedStudent && (
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)', maxWidth: '900px', margin: '0 auto', width: '100%' }} className="screen-only">
                {reportCardContent}
              </div>
            )}

            {/* Rendu du Bulletin pour l'impression (injecté directement dans le body via Portal) */}
            {selectedStudent && createPortal(
              <div className="print-wrapper" style={{ width: '100%', maxWidth: '100%', backgroundColor: 'white', color: 'black' }}>
                {reportCardContent}
              </div>,
              document.body
            )}
          </>
        );
      })()}
    </div>
  );
};
