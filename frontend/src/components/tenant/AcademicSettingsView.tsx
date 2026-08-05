import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Award, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { getCountryAcademicConfig, CountryAcademicConfig, SeriesConfig, SubjectConfig } from '../../config/academic.config';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

export const AcademicSettingsView: React.FC = () => {
  const { countryCode, countryConfig: currentCountry } = useCountryTheme();
  const [academicConfig, setAcademicConfig] = useState<CountryAcademicConfig>(getCountryAcademicConfig(countryCode));

  const [selectedCycle, setSelectedCycle] = useState<'COLLEGE' | 'LYCEE'>('LYCEE');
  const [selectedLevel, setSelectedLevel] = useState<string>('TLE');
  const [selectedSeries, setSelectedSeries] = useState<string>('S2');

  // Modal d'ajout/édition de série ou matière
  const [showAddSeriesModal, setShowAddSeriesModal] = useState(false);
  const [newSeriesCode, setNewSeriesCode] = useState('');
  const [newSeriesName, setNewSeriesName] = useState('');

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCoeff, setNewSubCoeff] = useState<number>(3);

  useEffect(() => {
    setAcademicConfig(getCountryAcademicConfig(countryCode));
  }, [countryCode]);

  const currentLevelConfig = academicConfig.levels.find(l => l.code === selectedLevel) || academicConfig.levels[0];
  const activeSeriesList = currentLevelConfig?.availableSeries || [];
  const currentSeriesObj = activeSeriesList.find(s => s.code === selectedSeries) || activeSeriesList[0];

  const handleCoefficientsChange = (subjectCode: string, newCoeff: number) => {
    if (!currentSeriesObj) return;

    const updatedSubjects = currentSeriesObj.subjects.map(s => 
      s.subjectCode === subjectCode ? { ...s, coefficient: newCoeff } : s
    );

    const updatedSeries = activeSeriesList.map(s => 
      s.code === currentSeriesObj.code ? { ...s, subjects: updatedSubjects } : s
    );

    const updatedLevels = academicConfig.levels.map(l => 
      l.code === selectedLevel ? { ...l, availableSeries: updatedSeries } : l
    );

    setAcademicConfig({ ...academicConfig, levels: updatedLevels });
  };

  const handleAddSeriesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeriesCode || !newSeriesName) return;

    const newSeries: SeriesConfig = {
      code: newSeriesCode.toUpperCase(),
      name: newSeriesName,
      subjects: [
        { subjectCode: 'MATH', subjectName: 'Mathématiques', coefficient: 4 },
        { subjectCode: 'FRA', subjectName: 'Français', coefficient: 4 },
        { subjectCode: 'ANG', subjectName: 'Anglais', coefficient: 3 },
        { subjectCode: 'EPS', subjectName: 'EPS', coefficient: 2 },
      ]
    };

    const updatedSeries = [...activeSeriesList, newSeries];
    const updatedLevels = academicConfig.levels.map(l => 
      l.code === selectedLevel ? { ...l, availableSeries: updatedSeries } : l
    );

    setAcademicConfig({ ...academicConfig, levels: updatedLevels });
    setSelectedSeries(newSeries.code);
    setShowAddSeriesModal(false);
    setNewSeriesCode('');
    setNewSeriesName('');
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName || !currentSeriesObj) return;

    const newSub = {
      subjectCode: newSubCode.toUpperCase(),
      subjectName: newSubName,
      coefficient: newSubCoeff
    };

    const updatedSubjects = [...currentSeriesObj.subjects, newSub];
    const updatedSeries = activeSeriesList.map(s => 
      s.code === currentSeriesObj.code ? { ...s, subjects: updatedSubjects } : s
    );

    const updatedLevels = academicConfig.levels.map(l => 
      l.code === selectedLevel ? { ...l, availableSeries: updatedSeries } : l
    );

    setAcademicConfig({ ...academicConfig, levels: updatedLevels });
    setShowAddSubjectModal(false);
    setNewSubCode('');
    setNewSubName('');
  };

  const handleSaveToLocalStorage = () => {
    localStorage.setItem(`kpsydesk_academic_config_${countryCode}`, JSON.stringify(academicConfig));
    alert(`Configuration académique de la ${currentCountry.name} sauvegardée avec succès !`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* EN-TÊTE CONFIGURATION ACADÉMIQUE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              Moteur Académique Central — Référentiel National ({academicConfig.countryName} {academicConfig.flag})
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Paramétrage des cycles (Collège / Lycée), des séries (S1, S2, L1, L2, A, C, D), des matières et des coefficients ministériels.
          </p>
        </div>

        <button 
          onClick={handleSaveToLocalStorage}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
        >
          <Save size={18} /> Sauvegarder la Grille
        </button>
      </div>

      {/* SÉLECTEUR DE CYCLE & NIVEAUX */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button 
          onClick={() => { setSelectedCycle('LYCEE'); setSelectedLevel('TLE'); }}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: selectedCycle === 'LYCEE' ? '#0f172a' : 'transparent', color: selectedCycle === 'LYCEE' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Layers size={18} /> Second Cycle (Lycée : 2nde, 1ère, Terminale)
        </button>
        <button 
          onClick={() => { setSelectedCycle('COLLEGE'); setSelectedLevel('3EME'); }}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: selectedCycle === 'COLLEGE' ? '#0f172a' : 'transparent', color: selectedCycle === 'COLLEGE' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <BookOpen size={18} /> Premier Cycle (Collège : 6ème à 3ème)
        </button>
      </div>

      {/* CONTENU ACADÉMIQUE */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* COLONNE GAUCHE : SÉRIES DU LYCÉE */}
        {selectedCycle === 'LYCEE' && (
          <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-title)' }}>Séries Officielle du Lycée</h3>
              <button 
                onClick={() => setShowAddSeriesModal(true)}
                style={{ padding: '6px 12px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Créer une Série
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeSeriesList.map(series => (
                <div 
                  key={series.code}
                  onClick={() => setSelectedSeries(series.code)}
                  style={{ 
                    padding: '14px 16px', borderRadius: '10px', 
                    backgroundColor: selectedSeries === series.code ? 'rgba(212, 168, 83, 0.15)' : 'var(--bg-page)',
                    border: selectedSeries === series.code ? '2px solid #D4A853' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: selectedSeries === series.code ? '#92400e' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {series.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#white', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700 }}>
                      {series.subjects.length} matières
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLONNE DROITE : MATRICES DES MATIÈRES ET COEFFICIENTS */}
        <div style={{ flex: 2, minWidth: '450px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>
                Grille des Coefficients — {currentSeriesObj?.name || currentLevelConfig?.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Les coefficients sont automatiquement déduits lors de la création des bulletins et examens.
              </span>
            </div>
            {selectedCycle === 'LYCEE' && (
              <button 
                onClick={() => setShowAddSubjectModal(true)}
                style={{ padding: '8px 14px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Ajouter une Matière
              </button>
            )}
          </div>

          {/* TABLEAU DES COEFFICIENTS */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg-page)' }}>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matière Ministérielle</th>
                <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Coefficient Officiel</th>
              </tr>
            </thead>
            <tbody>
              {(currentSeriesObj?.subjects || currentLevelConfig?.defaultSubjects || []).map(sub => (
                <tr key={sub.subjectCode} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>{sub.subjectCode}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.subjectName}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <input 
                      type="number"
                      min="1"
                      max="15"
                      value={sub.coefficient}
                      onChange={e => handleCoefficientsChange(sub.subjectCode, parseInt(e.target.value) || 1)}
                      style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '2px solid #D4A853', textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: '#0f172a', backgroundColor: '#fef3c7' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE CRÉATION SÉRIE */}
      {showAddSeriesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '450px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>Créer une Nouvelle Série Ministérielle</h3>
            <form onSubmit={handleAddSeriesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Code Série (ex: S3, L3, F4)</label>
                <input type="text" value={newSeriesCode} onChange={e => setNewSeriesCode(e.target.value)} required placeholder="S3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom Complet de la Série</label>
                <input type="text" value={newSeriesName} onChange={e => setNewSeriesName(e.target.value)} required placeholder="Série S3 - Agronomie" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddSeriesModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Créer la Série</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CRÉATION MATIÈRE */}
      {showAddSubjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '450px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>Ajouter une Matière à la Série {currentSeriesObj?.code}</h3>
            <form onSubmit={handleAddSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Code Matière (ex: PHILO, COMPTA, EPS)</label>
                <input type="text" value={newSubCode} onChange={e => setNewSubCode(e.target.value)} required placeholder="PHILO" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom Complet de la Matière</label>
                <input type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)} required placeholder="Philosophie & Éthique" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Coefficient Officiel</label>
                <input type="number" min="1" max="15" value={newSubCoeff} onChange={e => setNewSubCoeff(parseInt(e.target.value) || 1)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddSubjectModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Ajouter la Matière</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
