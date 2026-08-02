import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users, X } from 'lucide-react';
import { api } from '../../lib/api';

interface ClassData {
  id: string;
  name: string;
  code: string;
  studentCount: number;
}

export const StructureView: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingClassId, setViewingClassId] = useState<string | null>(null);

  const generateCode = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // 1. Appel API + Persistance locale avec LocalStorage (Règle Personnalisée)
  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/tenant/students');
      setStudents(response.data);
    } catch (err) {
      const savedStudents = localStorage.getItem('kpsydesk_students');
      if (savedStudents) setStudents(JSON.parse(savedStudents));
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/tenant/classes');
      const apiClasses = response.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        studentCount: c._count?.students || 0
      }));
      setClasses(apiClasses);
      localStorage.setItem('kpsydesk_classes', JSON.stringify(apiClasses));
    } catch (err) {
      console.error('Erreur API classes:', err);
      // Fallback local
      const saved = localStorage.getItem('kpsydesk_classes');
      if (saved) {
        setClasses(JSON.parse(saved));
      } else {
        // Données de démo initiales
        const defaultClasses = [
          { id: '1', name: 'Classe de 6ème A', code: '6EME-A', studentCount: 28 },
          { id: '2', name: 'Classe de 3ème B', code: '3EME-B', studentCount: 24 },
          { id: '3', name: 'Terminale S1', code: 'TERM-S1', studentCount: 30 }
        ];
        setClasses(defaultClasses);
        localStorage.setItem('kpsydesk_classes', JSON.stringify(defaultClasses));
      }
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingId) {
      try {
        await api.put(`/tenant/classes/${editingId}`, { name, code: code.toUpperCase() });
        fetchClasses();
      } catch (err) {
        console.error('Erreur modif:', err);
        const updatedClasses = classes.map(c => c.id === editingId ? { ...c, name, code: code.toUpperCase() } : c);
        setClasses(updatedClasses);
        localStorage.setItem('kpsydesk_classes', JSON.stringify(updatedClasses));
        
        // Mettre à jour les élèves en local
        const savedStudents = localStorage.getItem('kpsydesk_students');
        if (savedStudents) {
           let parsed = JSON.parse(savedStudents);
           parsed = parsed.map((s:any) => s.classId === editingId ? { ...s, className: name } : s);
           localStorage.setItem('kpsydesk_students', JSON.stringify(parsed));
           setStudents(parsed);
        }
      }
      setEditingId(null);
    } else {
      try {
        await api.post('/tenant/classes', { name, code: code.toUpperCase() });
        fetchClasses();
      } catch (err) {
        console.error('Erreur création:', err);
        const newClass = { id: `local-cls-${Date.now()}`, name, code: code.toUpperCase(), studentCount: 0 };
        const updated = [...classes, newClass];
        setClasses(updated);
        localStorage.setItem('kpsydesk_classes', JSON.stringify(updated));
      }
    }
    setName('');
    setCode('');
  };

  const handleEditClass = (cls: ClassData) => {
    setEditingId(cls.id);
    setName(cls.name);
    setCode(cls.code);
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      try {
        await api.delete(`/tenant/classes/${id}`);
        fetchClasses();
      } catch (err) {
        const updated = classes.filter(c => c.id !== id);
        setClasses(updated);
        localStorage.setItem('kpsydesk_classes', JSON.stringify(updated));
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Grille Double Colonne : Formulaire & Liste */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Formulaire de création */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1,
          minWidth: '320px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', margin: 0 }}>
              {editingId ? 'Modifier la classe' : 'Ajouter une classe / section'}
            </h3>
            {editingId && (
              <button onClick={() => { setEditingId(null); setName(''); setCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Annuler</button>
            )}
          </div>
          <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nom de la classe</label>
              <input 
                type="text" 
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setCode(generateCode(e.target.value));
                }}
                placeholder="Ex. 4ème B"
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code unique (Automatique)</label>
              <input 
                type="text" 
                value={code}
                readOnly
                placeholder="Généré automatiquement"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-secondary)'
                }}
              />
            </div>

            <button type="submit" style={{
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              {editingId ? <Edit size={18} /> : <Plus size={18} />}
              {editingId ? 'Modifier la classe' : 'Enregistrer la classe'}
            </button>
          </form>
        </div>

        {/* Liste des classes existantes */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 2,
          minWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>
              Classes & Niveaux ({classes.length})
            </h3>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              <FileSpreadsheet size={16} />
              Exporter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {classes.map((cls) => (
              <div key={cls.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-page)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)'
                  }}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{cls.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Code : {cls.code} · {cls.studentCount} Élèves
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    type="button"
                    onClick={() => setViewingClassId(cls.id)}
                    title="Voir les élèves"
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '6px' }}
                  >
                    <Users size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleEditClass(cls)}
                    title="Modifier la classe"
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteClass(cls.id)}
                    title="Supprimer la classe"
                    style={{ background: 'none', border: 'none', color: 'var(--status-negative)', cursor: 'pointer', padding: '6px' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {classes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                Aucune classe enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modale pour voir les élèves d'une classe */}
      {viewingClassId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Élèves de la classe {classes.find(c => c.id === viewingClassId)?.name}
              </h2>
              <button onClick={() => setViewingClassId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {students.filter(s => s.classId === viewingClassId).length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Aucun élève dans cette classe.</div>
              ) : (
                students.filter(s => s.classId === viewingClassId).map(s => (
                  <div key={s.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.matricule || s.id.substring(0,8)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
