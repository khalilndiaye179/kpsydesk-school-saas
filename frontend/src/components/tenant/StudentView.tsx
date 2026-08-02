import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, FileSpreadsheet, User, MapPin, Phone, Mail, Calendar as CalendarIcon, Printer, BadgeInfo, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { STORAGE_KEYS, readStored, readStoredOrSeed, writeStored } from '../../lib/storage';

interface StudentData {
  id: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
  studentPhone?: string;
  studentEmail?: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  birthDate: string;
  birthPlace: string;
  previousSchool?: string;
  address: string;
}

// Composant Helper pour les champs (déplacé en dehors pour éviter la perte de focus)
const InputField = ({ label, value, setter, type = 'text', required = false, placeholder = '' }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      {label} {required && <span style={{ color: 'var(--status-negative)' }}>*</span>}
    </label>
    <input 
      type={type} value={value} onChange={e => setter(e.target.value)} required={required} placeholder={placeholder}
      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    />
  </div>
);

export const StudentView: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  
  // States du formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [classId, setClassId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Père');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [address, setAddress] = useState('');

  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/tenant/classes');
      setAvailableClasses(response.data);
      if (response.data.length > 0) setClassId(response.data[0].id);
    } catch (err) {
      console.warn('Erreur classes, fallback local:', err);
      const parsedClasses = readStoredOrSeed(STORAGE_KEYS.classes, [
        { id: 'cls-1', name: 'Classe de 6ème A' },
        { id: 'cls-2', name: 'Classe de 5ème B' },
        { id: 'cls-3', name: 'Classe de 3ème' }
      ]);
      setAvailableClasses(parsedClasses);
      if (parsedClasses.length > 0) setClassId(parsedClasses[0].id);
    }
  };

  const generateMatricule = (existing: any[]): string => {
    let max = 0;
    existing.forEach(s => {
      if (s.matricule && s.matricule.startsWith('ELEV')) {
        const num = parseInt(s.matricule.substring(4), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return `ELEV${String(max + 1).padStart(5, '0')}`;
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/tenant/students');
      const apiStudents = response.data.map((s: any) => ({
        id: s.id,
        matricule: s.matricule,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        className: s.class?.name || 'Inconnue',
        studentPhone: s.studentPhone || '',
        studentEmail: s.studentEmail || '',
        guardianName: s.guardianName || '',
        guardianRelation: s.guardianRelation || 'Père',
        guardianPhone: s.guardianPhone || '',
        guardianEmail: s.guardianEmail || '',
        birthDate: s.birthDate || '',
        birthPlace: s.birthPlace || '',
        previousSchool: s.previousSchool || '',
        address: s.address || ''
      }));
      setStudents(apiStudents);
      writeStored(STORAGE_KEYS.students, apiStudents);
    } catch (err) {
      console.warn('Erreur API students:', err);
      const parsed = readStored<any[]>(STORAGE_KEYS.students, []);
      let changed = false;

      // Attribuer un matricule aux étudiants existants s'ils n'en ont pas
      parsed.forEach((s: any, index: number) => {
        if (!s.matricule) {
          const tempArray = parsed.slice(0, index);
          s.matricule = generateMatricule(tempArray.concat(parsed.slice(index + 1)));
          changed = true;
        }
      });

      if (changed) {
        writeStored(STORAGE_KEYS.students, parsed);
      }
      setStudents(parsed);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setStudentPhone('');
    setStudentEmail('');
    setGuardianName('');
    setGuardianRelation('Père');
    setGuardianPhone('');
    setGuardianEmail('');
    setBirthDate('');
    setBirthPlace('');
    setPreviousSchool('');
    setAddress('');
  };

  const handleAddOrUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !classId || !guardianName || !guardianPhone || !guardianEmail || !birthDate || !birthPlace || !address) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const studentPayload = {
      firstName, lastName, classId,
      studentPhone, studentEmail,
      guardianName, guardianRelation,
      guardianPhone, guardianEmail,
      birthDate, birthPlace,
      previousSchool, address
    };

    if (editingId) {
      try {
        await api.put(`/tenant/students/${editingId}`, studentPayload);
        fetchStudents();
      } catch (err) {
        console.warn('Fallback: Update local');
        const selectedClass = availableClasses.find(c => c.id === classId);
        const updatedStudents = students.map(s => 
          s.id === editingId ? { ...s, ...studentPayload, className: selectedClass?.name || 'Inconnue' } : s
        );
        setStudents(updatedStudents);
        writeStored(STORAGE_KEYS.students, updatedStudents);
      }
    } else {
      try {
        await api.post('/tenant/students', studentPayload);
        fetchStudents();
      } catch (err) {
        console.warn('Fallback: Inscription locale', err);
        const selectedClass = availableClasses.find(c => c.id === classId);
        const newStudent: StudentData = {
          id: `local-std-${Date.now()}`,
          matricule: generateMatricule(students),
          ...studentPayload,
          className: selectedClass ? selectedClass.name : 'Inconnue'
        };
        const updatedStudents = [newStudent, ...students];
        setStudents(updatedStudents);
        writeStored(STORAGE_KEYS.students, updatedStudents);
      }
    }

    resetForm();
  };

  const handleEditStudent = (std: StudentData) => {
    setEditingId(std.id);
    setFirstName(std.firstName);
    setLastName(std.lastName);
    setClassId(std.classId);
    setStudentPhone(std.studentPhone || '');
    setStudentEmail(std.studentEmail || '');
    setGuardianName(std.guardianName);
    setGuardianRelation(std.guardianRelation);
    setGuardianPhone(std.guardianPhone);
    setGuardianEmail(std.guardianEmail);
    setBirthDate(std.birthDate);
    setBirthPlace(std.birthPlace);
    setPreviousSchool(std.previousSchool || '');
    setAddress(std.address);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet élève ?')) {
      try {
        await api.delete(`/tenant/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.warn('Fallback: Suppression locale');
        const updatedStudents = students.filter(s => s.id !== id);
        setStudents(updatedStudents);
        writeStored(STORAGE_KEYS.students, updatedStudents);
      }
    }
  };

  const getSchoolSettings = () =>
    readStored<Record<string, any>>(STORAGE_KEYS.schoolSettings, {
      schoolName: 'Établissement (Non configuré)',
      address: '',
      phone: '',
      motto: ''
    });

  const generateDocument = (std: StudentData, type: 'IDCARD' | 'CERTIFICATE') => {
    const settings = getSchoolSettings();
    const qrData = encodeURIComponent(`Authentification KPSyDesk | Matricule: ${std.matricule} | Nom: ${std.firstName} ${std.lastName} | Classe: ${std.className}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre. Veuillez autoriser les pop-ups.");
      return;
    }

    let content = '';

    if (type === 'IDCARD') {
      content = `
        <style>
          body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f1f5f9; }
          .card { width: 340px; height: 540px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; position: relative; border: 2px solid #0f172a; }
          .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 1.2rem; }
          .header p { margin: 4px 0 0 0; font-size: 0.8rem; opacity: 0.8; }
          .header img.logo { height: 40px; margin-bottom: 8px; border-radius: 4px; object-fit: contain; }
          .photo-container { display: flex; justify-content: center; margin-top: -30px; }
          .photo { width: 120px; height: 120px; border-radius: 60px; background: #e2e8f0; border: 4px solid white; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 40px; color: #94a3b8; }
          .details { padding: 20px; text-align: center; }
          .name { font-size: 1.4rem; font-weight: bold; margin: 0; color: #0f172a; }
          .class { color: #38bdf8; font-weight: bold; font-size: 1.1rem; margin: 5px 0 15px 0; }
          .info { font-size: 0.85rem; color: #475569; margin: 4px 0; display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
          .footer { position: absolute; bottom: 0; width: 100%; background: #f8fafc; padding: 15px 0; text-align: center; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; }
          .qr { width: 80px; height: 80px; margin-top: 10px; }
        </style>
        <div class="card">
          <div class="header">
            ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo"/>` : ''}
            <h1>${settings.schoolName}</h1>
            <p>CARTE D'IDENTITÉ SCOLAIRE</p>
          </div>
          <div class="photo-container">
            <div class="photo">👤</div>
          </div>
          <div class="details">
            <h2 class="name">${std.firstName} ${std.lastName}</h2>
            <div class="class">${std.className}</div>
            
            <div class="info"><span>Matricule:</span> <strong>${std.matricule || 'N/A'}</strong></div>
            <div class="info"><span>Né(e) le:</span> <strong>${std.birthDate}</strong></div>
            <div class="info"><span>Contact Urgence:</span> <strong>${std.guardianPhone}</strong></div>
            
          </div>
          <div class="footer">
            <span style="font-size: 0.75rem; color: #64748b; font-weight: bold;">Valide pour l'année scolaire en cours</span>
            <img src="${qrUrl}" class="qr" alt="QR Code" />
          </div>
        </div>
      `;
    } else {
      content = `
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; margin: 0; background: white; color: #000; }
          .doc { max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #ccc; position: relative; }
          .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header img.logo { max-height: 80px; margin-bottom: 10px; object-fit: contain; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .header p { margin: 5px 0; font-size: 14px; }
          .title { text-align: center; font-size: 28px; text-decoration: underline; font-weight: bold; margin: 40px 0; }
          .content { font-size: 18px; line-height: 1.8; text-align: justify; }
          .content strong { text-transform: uppercase; }
          .footer { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature { text-align: right; margin-top: 40px; font-weight: bold; }
          .qr { width: 120px; height: 120px; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); z-index: -1; white-space: nowrap; pointer-events: none; }
        </style>
        <div class="doc">
          <div class="watermark">${settings.schoolName}</div>
          <div class="header">
            ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo"/>` : ''}
            <h1>${settings.schoolName}</h1>
            <p>${settings.address} | Tél: ${settings.phone}</p>
            <p><em>${settings.motto}</em></p>
          </div>
          
          <div class="title">CERTIFICAT DE SCOLARITÉ</div>
          
          <div class="content">
            Je soussigné(e), Directeur(trice) de l'établissement <strong>${settings.schoolName}</strong>,<br/><br/>
            Certifie par la présente que l'élève :<br/><br/>
            Nom et Prénom : <strong>${std.firstName} ${std.lastName}</strong><br/>
            Matricule : <strong>${std.matricule || 'N/A'}</strong><br/>
            Né(e) le : <strong>${std.birthDate}</strong> à <strong>${std.birthPlace}</strong><br/><br/>
            Est régulièrement inscrit(e) dans notre établissement pour l'année scolaire en cours, dans la classe de <strong>${std.className}</strong>.<br/><br/>
            En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
          </div>
          
          <div class="footer">
            <div>
              <p style="font-size:12px; margin-bottom:5px;">Vérification d'authenticité (Scan)</p>
              <img src="${qrUrl}" class="qr" alt="QR Code" />
            </div>
            <div class="signature">
              Fait à ______________________, le ${formatDate(new Date())}<br/><br/>
              Le Directeur / La Directrice<br/><br/>
              <em>(Cachet et Signature)</em>
            </div>
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${type === 'IDCARD' ? 'Carte Scolaire' : 'Certificat'} - ${std.lastName}</title>
        </head>
        <body onload="window.print(); window.setTimeout(window.close, 500);">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Formulaire (plus grand) */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1.5, // Plus de place pour le formulaire
          minWidth: '450px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-title)' }}>
              {editingId ? 'Modifier les informations' : 'Dossier d\'inscription complet'}
            </h3>
            {editingId && (
              <button 
                onClick={resetForm}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section Identité */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Identité & Classe</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Prénom" value={firstName} setter={setFirstName} required />
                <InputField label="Nom" value={lastName} setter={setLastName} required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Classe <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={classId} onChange={e => setClassId(e.target.value)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                  >
                    {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <InputField label="Date de naissance" value={birthDate} setter={setBirthDate} type="date" required />
                <InputField label="Lieu de naissance" value={birthPlace} setter={setBirthPlace} required />
              </div>
            </div>

            {/* Section Contacts Élève */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Coordonnées de l'élève (Optionnel)</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Téléphone (Élève)" value={studentPhone} setter={setStudentPhone} type="tel" />
                <InputField label="Email (Élève)" value={studentEmail} setter={setStudentEmail} type="email" />
              </div>
            </div>

            {/* Section Contacts Tuteur */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Responsable Légal</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Nom du Responsable" value={guardianName} setter={setGuardianName} required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lien de parenté <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={guardianRelation} onChange={e => setGuardianRelation(e.target.value)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur légal">Tuteur légal</option>
                    <option value="Autre parent">Autre parent</option>
                  </select>
                </div>
                <InputField label="Téléphone (Tuteur)" value={guardianPhone} setter={setGuardianPhone} type="tel" required />
                <InputField label="Email (Tuteur)" value={guardianEmail} setter={setGuardianEmail} type="email" required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adresse complète <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <textarea 
                    value={address} onChange={e => setAddress(e.target.value)} required rows={2}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Section Divers */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Scolarité précédente</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Structure d'origine (Optionnel)" value={previousSchool} setter={setPreviousSchool} placeholder="Ex: Collège Mermoz" />
              </div>
            </div>

            <button type="submit" style={{
              backgroundColor: editingId ? '#10b981' : 'var(--accent)', color: '#FFFFFF', border: 'none', padding: '14px',
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', marginTop: '10px'
            }}>
              <UserPlus size={18} /> {editingId ? 'Sauvegarder les modifications' : 'Valider l\'inscription'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1,
          minWidth: '350px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', margin: 0 }}>
              Dossiers ({students.length})
            </h3>
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              <FileSpreadsheet size={16} /> Exporter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students.map((std) => (
              <div key={std.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: editingId === std.id ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-page)', transition: 'background 0.2s' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '8px', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{std.firstName} {std.lastName}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>{std.className}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => generateDocument(std, 'IDCARD')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Générer Carte d'identité">
                      <BadgeInfo size={18} />
                    </button>
                    <button type="button" onClick={() => generateDocument(std, 'CERTIFICATE')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Générer Certificat de scolarité">
                      <FileText size={18} />
                    </button>
                    <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>
                    <button type="button" onClick={() => handleEditStudent(std)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Modifier">
                      <UserPlus size={18} />
                    </button>
                    <button type="button" onClick={() => handleDeleteStudent(std.id)} style={{ background: 'none', border: 'none', color: 'var(--status-negative)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Détails supplémentaires dans la carte */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                  {std.guardianName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <User size={14} /> Tuteur: {std.guardianName} ({std.guardianRelation})
                    </div>
                  )}
                  {std.guardianPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Phone size={14} /> Tél: {std.guardianPhone}
                    </div>
                  )}
                  {std.guardianEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Mail size={14} /> {std.guardianEmail}
                    </div>
                  )}
                  {std.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} /> {std.address.substring(0, 30)}{std.address.length > 30 ? '...' : ''}
                    </div>
                  )}
                </div>

              </div>
            ))}
            
            {students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Aucun dossier d'inscription pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
