import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, FileSpreadsheet, User, MapPin, Phone, Mail, Calendar as CalendarIcon, Printer, BadgeInfo, FileText, Upload, ShieldAlert, HeartPulse, GraduationCap, DollarSign, FileCheck, Eye, X, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { getCountryConfig } from '../../config/countries.config';

interface AttachedDoc {
  name: string;
  dataUrl: string; // Base64 / PDF / Image
  uploadedAt: string;
  fileType: 'pdf' | 'image';
}

interface StudentData {
  id: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  gender: 'Masculin' | 'Féminin';
  nationality?: string;
  birthCertificateNo?: string;
  photoUrl?: string;
  registrationStatus: 'Nouvelle Inscription' | 'Réinscription' | 'Transfert';
  
  classId: string;
  className: string;
  studentPhone?: string;
  studentEmail?: string;
  
  // Responsable Légal
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianProfession?: string;
  guardianIdCardNo?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  authorizedPersons?: string;
  address: string;

  // Naissance
  birthDate: string;
  birthPlace: string;

  // Santé
  bloodGroup?: string;
  medicalNotes?: string;

  // Scolarité
  previousSchool?: string;
  lastClass?: string;
  transferReason?: string;

  // Administratif & Financier
  regime: 'Externe' | 'Demi-pensionnaire' | 'Interne';
  paymentPlan: 'Mensuel' | 'Trimestriel' | 'Annuel';

  // Documents Numérisés (PDF / Images)
  scannedDocs?: {
    birthCertificate?: AttachedDoc;
    photo?: AttachedDoc;
    previousReport?: AttachedDoc;
    dischargeCertificate?: AttachedDoc;
    vaccinationRecord?: AttachedDoc;
  };
}

// Composant Helper réutilisable pour les champs de saisie
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
  const [gender, setGender] = useState<'Masculin' | 'Féminin'>('Masculin');
  const [nationality, setNationality] = useState('Sénégalaise');
  const [birthCertificateNo, setBirthCertificateNo] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'Nouvelle Inscription' | 'Réinscription' | 'Transfert'>('Nouvelle Inscription');

  const [classId, setClassId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [address, setAddress] = useState('');

  // Tuteur & Urgence
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Père');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianProfession, setGuardianProfession] = useState('');
  const [guardianIdCardNo, setGuardianIdCardNo] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [authorizedPersons, setAuthorizedPersons] = useState('');

  // Santé
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Scolarité
  const [previousSchool, setPreviousSchool] = useState('');
  const [lastClass, setLastClass] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Administratif & Financier
  const [regime, setRegime] = useState<'Externe' | 'Demi-pensionnaire' | 'Interne'>('Externe');
  const [paymentPlan, setPaymentPlan] = useState<'Mensuel' | 'Trimestriel' | 'Annuel'>('Mensuel');

  // Documents Scannés
  const [docBirthCert, setDocBirthCert] = useState<AttachedDoc | undefined>(undefined);
  const [docPhoto, setDocPhoto] = useState<AttachedDoc | undefined>(undefined);
  const [docPrevReport, setDocPrevReport] = useState<AttachedDoc | undefined>(undefined);
  const [docDischarge, setDocDischarge] = useState<AttachedDoc | undefined>(undefined);
  const [docVaccine, setDocVaccine] = useState<AttachedDoc | undefined>(undefined);

  // État de la visionneuse de document PDF/Image
  const [viewingDoc, setViewingDoc] = useState<{ title: string; doc: AttachedDoc } | null>(null);
  const [viewingStudentDocsModal, setViewingStudentDocsModal] = useState<StudentData | null>(null);

  const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const [networkError, setNetworkError] = useState('');

  const fetchClasses = async () => {
    try {
      const response = await api.get('/tenant/classes');
      setAvailableClasses(response.data);
      if (response.data.length > 0) setClassId(response.data[0].id);
    } catch (err: any) {
      console.error('Erreur API /tenant/classes:', err);
      setAvailableClasses([]);
    }
  };

  const fetchStudents = async () => {
    setNetworkError('');
    try {
      const response = await api.get('/tenant/students');
      setStudents(response.data);
    } catch (err: any) {
      console.error('Erreur API /tenant/students:', err);
      setNetworkError('Échec du chargement des élèves depuis le serveur. Vérifiez votre connexion.');
      setStudents([]);
    }
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

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('Masculin');
    setNationality('Sénégalaise');
    setBirthCertificateNo('');
    setPhotoUrl('');
    setRegistrationStatus('Nouvelle Inscription');

    setStudentPhone('');
    setStudentEmail('');
    setBirthDate('');
    setBirthPlace('');
    setAddress('');

    setGuardianName('');
    setGuardianRelation('Père');
    setGuardianPhone('');
    setGuardianEmail('');
    setGuardianProfession('');
    setGuardianIdCardNo('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setAuthorizedPersons('');

    setBloodGroup('O+');
    setMedicalNotes('');

    setPreviousSchool('');
    setLastClass('');
    setTransferReason('');

    setRegime('Externe');
    setPaymentPlan('Mensuel');

    setDocBirthCert(undefined);
    setDocPhoto(undefined);
    setDocPrevReport(undefined);
    setDocDischarge(undefined);
    setDocVaccine(undefined);

    setEditingId(null);
  };

  // Convertisseur de fichier scanné (PDF/Image) en DataURL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (doc: AttachedDoc) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      setter({
        name: file.name,
        dataUrl,
        uploadedAt: new Date().toLocaleDateString('fr-FR'),
        fileType,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = availableClasses.find(c => c.id === classId);
    const className = targetClass ? targetClass.name : 'Non assignée';
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
    const STUDENTS_STORAGE_KEY = `kpsydesk_students_${activeTenantId}`;

    const studentPayload: Partial<StudentData> = {
      firstName,
      lastName,
      gender,
      nationality,
      birthCertificateNo,
      photoUrl: docPhoto ? docPhoto.dataUrl : photoUrl,
      registrationStatus,
      classId,
      className,
      studentPhone,
      studentEmail,
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
      guardianProfession,
      guardianIdCardNo,
      emergencyContactName,
      emergencyContactPhone,
      authorizedPersons,
      birthDate,
      birthPlace,
      address,
      bloodGroup,
      medicalNotes,
      previousSchool,
      lastClass,
      transferReason,
      regime,
      paymentPlan,
      scannedDocs: {
        birthCertificate: docBirthCert,
        photo: docPhoto,
        previousReport: docPrevReport,
        dischargeCertificate: docDischarge,
        vaccinationRecord: docVaccine,
      }
    };

    if (editingId) {
      try {
        await api.put(`/tenant/students/${editingId}`, studentPayload);
      } catch (err) {
        console.warn('Fallback mise à jour locale élève');
      }

      const updated = students.map(s => s.id === editingId ? { ...s, ...studentPayload } as StudentData : s);
      setStudents(updated);
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
    } else {
      const matricule = generateMatricule(students);
      const fullPayload = { ...studentPayload, matricule };

      try {
        const res = await api.post('/tenant/students', fullPayload);
        const created = res.data;
        const updated = [created, ...students];
        setStudents(updated);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Fallback sauvegarde locale élève:', err);
        const newStudent: StudentData = {
          ...(fullPayload as StudentData),
          id: `std-${Date.now()}`,
          matricule,
        };
        const updated = [newStudent, ...students];
        setStudents(updated);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
      }
    }

    resetForm();
  };

  const handleEditStudent = (std: StudentData) => {
    setEditingId(std.id);
    setFirstName(std.firstName || '');
    setLastName(std.lastName || '');
    setGender(std.gender || 'Masculin');
    setNationality(std.nationality || 'Sénégalaise');
    setBirthCertificateNo(std.birthCertificateNo || '');
    setPhotoUrl(std.photoUrl || '');
    setRegistrationStatus(std.registrationStatus || 'Nouvelle Inscription');

    setClassId(std.classId || (availableClasses[0]?.id || ''));
    setStudentPhone(std.studentPhone || '');
    setStudentEmail(std.studentEmail || '');
    setBirthDate(std.birthDate || '');
    setBirthPlace(std.birthPlace || '');
    setAddress(std.address || '');

    setGuardianName(std.guardianName || '');
    setGuardianRelation(std.guardianRelation || 'Père');
    setGuardianPhone(std.guardianPhone || '');
    setGuardianEmail(std.guardianEmail || '');
    setGuardianProfession(std.guardianProfession || '');
    setGuardianIdCardNo(std.guardianIdCardNo || '');
    setEmergencyContactName(std.emergencyContactName || '');
    setEmergencyContactPhone(std.emergencyContactPhone || '');
    setAuthorizedPersons(std.authorizedPersons || '');

    setBloodGroup(std.bloodGroup || 'O+');
    setMedicalNotes(std.medicalNotes || '');

    setPreviousSchool(std.previousSchool || '');
    setLastClass(std.lastClass || '');
    setTransferReason(std.transferReason || '');

    setRegime(std.regime || 'Externe');
    setPaymentPlan(std.paymentPlan || 'Mensuel');

    setDocBirthCert(std.scannedDocs?.birthCertificate);
    setDocPhoto(std.scannedDocs?.photo);
    setDocPrevReport(std.scannedDocs?.previousReport);
    setDocDischarge(std.scannedDocs?.dischargeCertificate);
    setDocVaccine(std.scannedDocs?.vaccinationRecord);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) return;

    try {
      await api.delete(`/tenant/students/${id}`);
    } catch (err) {
      console.warn('Suppression API échouée, fallback local');
    }

    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
    localStorage.setItem(`kpsydesk_students_${activeTenantId}`, JSON.stringify(updated));
  };

  const generateDocument = async (std: StudentData, type: 'IDCARD' | 'CERTIFICATE') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let settings = {
      schoolName: 'ÉTABLISSEMENT EXCELLENCE KPSY',
      address: 'Dakar, Sénégal',
      phone: '+221 33 800 00 00',
      logo: '',
      motto: 'Excellence & Discipline'
    };

    try {
      const res = await api.get('/tenant/settings');
      if (res.data) {
        settings = { ...settings, ...res.data };
      }
    } catch (e) {
      console.warn('Fallback settings document local');
    }

    const countryCode = localStorage.getItem('kpsydesk_active_tenant_country') || 'SN';
    const countryConfig = getCountryConfig(countryCode);

    const qrData = `MATRICULE:${std.matricule}|NOM:${std.firstName}_${std.lastName}|CLASSE:${std.className}|VALIDE:2025-2026`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    let content = '';

    if (type === 'IDCARD') {
      content = `
        <style>
          body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px; display: flex; justify-content: center; }
          .card { width: 350px; height: 220px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 16px; padding: 16px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px; }
          .school-name { font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: #38bdf8; }
          .photo-container { width: 65px; height: 65px; border-radius: 50%; background: #334155; display: flex; align-items: center; justify-content: center; border: 2px solid #38bdf8; float: left; margin-right: 12px; overflow: hidden; }
          .details { overflow: hidden; }
          .name { font-size: 0.95rem; font-weight: bold; margin: 0 0 2px 0; color: #fff; }
          .class { font-size: 0.8rem; color: #38bdf8; font-weight: 600; margin-bottom: 6px; }
          .info { font-size: 0.7rem; color: #94a3b8; margin-bottom: 2px; }
          .info strong { color: #f8fafc; }
          .footer { position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; }
          .qr { width: 40px; height: 40px; border-radius: 4px; background: white; padding: 2px; }
        </style>
        <div class="card">
          <div class="header">
            <span class="school-name">${settings.schoolName}</span>
            <span style="font-size:0.65rem; background:#38bdf8; color:#0f172a; padding:2px 6px; border-radius:4px; font-weight:bold;">ÉLÈVE</span>
          </div>
          <div class="photo-container">
            ${std.photoUrl ? `<img src="${std.photoUrl}" style="width:100%;height:100%;object-fit:cover;"/>` : `<div style="font-size: 24px;">👤</div>`}
          </div>
          <div class="details">
            <h2 class="name">${std.firstName} ${std.lastName}</h2>
            <div class="class">${std.className}</div>
            
            <div class="info"><span>Matricule:</span> <strong>${std.matricule || 'N/A'}</strong></div>
            <div class="info"><span>Sexe:</span> <strong>${std.gender}</strong> · <span>Né(e) le:</span> <strong>${std.birthDate}</strong></div>
            <div class="info"><span>Tuteur:</span> <strong>${std.guardianPhone}</strong></div>
          </div>
          <div class="footer">
            <span style="font-size: 0.65rem; color: #94a3b8; font-weight: bold;">CARTE SCOLAIRE 2025-2026</span>
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
            <div style="font-size: 13px; font-weight: bold; text-transform: uppercase;">${countryConfig.officialHeader.republicName}</div>
            <div style="font-size: 11px; font-style: italic; margin-bottom: 10px;">${countryConfig.officialHeader.motto}</div>
            ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo"/>` : ''}
            <h1>${settings.schoolName}</h1>
            <p>${settings.address} | Tél: ${settings.phone}</p>
            ${settings.motto ? `<p><em>« ${settings.motto} »</em></p>` : ''}
          </div>
          
          <div class="title">CERTIFICAT DE SCOLARITÉ</div>
          
          <div class="content">
            Je soussigné(e), Directeur(trice) de l'établissement <strong>${settings.schoolName}</strong>,<br/><br/>
            Certifie par la présente que l'élève :<br/><br/>
            Nom et Prénom : <strong>${std.firstName} ${std.lastName}</strong> (${std.gender})<br/>
            Matricule : <strong>${std.matricule || 'N/A'}</strong><br/>
            Né(e) le : <strong>${std.birthDate}</strong> à <strong>${std.birthPlace}</strong><br/>
            Régime : <strong>${std.regime || 'Externe'}</strong><br/><br/>
            Est régulièrement inscrit(e) dans notre établissement pour l'année scolaire en cours, dans la classe de <strong>${std.className}</strong>.<br/><br/>
            En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
          </div>
          
          <div class="footer">
            <div>
              <p style="font-size:12px; margin-bottom:5px;">Vérification d'authenticité (Scan)</p>
              <img src="${qrUrl}" class="qr" alt="QR Code" />
            </div>
            <div class="signature">
              Fait à ______________________, le ${new Date().toLocaleDateString('fr-FR')}<br/><br/>
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

  // Composant d'upload de document individuel
  const DocumentUploaderItem = ({ title, doc, setter }: { title: string; doc?: AttachedDoc; setter: (d: AttachedDoc) => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: doc ? '#f0fdf4' : 'var(--bg-page)', border: doc ? '1px solid #86efac' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileCheck size={18} color={doc ? '#166534' : '#64748b'} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: doc ? '#14532d' : 'var(--text-primary)' }}>{title}</div>
          {doc && <div style={{ fontSize: '0.75rem', color: '#15803d' }}>📄 {doc.name} ({doc.uploadedAt})</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {doc ? (
          <>
            <button
              type="button"
              onClick={() => setViewingDoc({ title, doc })}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <Eye size={14} /> Voir
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#white', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              <Upload size={13} /> Remplacer
              <input type="file" accept="application/pdf,image/*" onChange={(e) => handleFileUpload(e, setter)} style={{ display: 'none' }} />
            </label>
          </>
        ) : (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            <Upload size={14} /> Joindre / Scanner (PDF)
            <input type="file" accept="application/pdf,image/*" onChange={(e) => handleFileUpload(e, setter)} style={{ display: 'none' }} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Formulaire Enrichi (Dossier d'inscription complet) */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border)',
          flex: 1.6,
          minWidth: '480px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-title)' }}>
              {editingId ? 'Modifier les informations de l\'élève' : 'Dossier d\'inscription complet'}
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
            
            {/* 1. IDENTITÉ DE L'ÉLÈVE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> 1. Identité & Informations de l'Élève
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Prénom" value={firstName} setter={setFirstName} required />
                <InputField label="Nom" value={lastName} setter={setLastName} required />
                
                {/* Sexe (Masculin / Féminin) * */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sexe <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={gender} onChange={e => setGender(e.target.value as any)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>

                {/* Statut Inscription * */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Statut Inscription <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={registrationStatus} onChange={e => setRegistrationStatus(e.target.value as any)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="Nouvelle Inscription">Nouvelle Inscription</option>
                    <option value="Réinscription">Réinscription</option>
                    <option value="Transfert">Transfert</option>
                  </select>
                </div>

                {/* Classe * */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Classe d'affectation <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={classId} onChange={e => setClassId(e.target.value)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <InputField label="Date de naissance" value={birthDate} setter={setBirthDate} type="date" required />
                <InputField label="Lieu de naissance" value={birthPlace} setter={setBirthPlace} required />
                <InputField label="Nationalité (Optionnel)" value={nationality} setter={setNationality} placeholder="Ex: Sénégalaise" />
                <InputField label="N° Extrait d'acte de naissance (Optionnel)" value={birthCertificateNo} setter={setBirthCertificateNo} placeholder="Ex: 2012/0458/DK" />
              </div>
            </div>

            {/* 2. COORDONNÉES DE L'ÉLÈVE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> 2. Coordonnées Directes de l'Élève (Optionnel)
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Téléphone (Élève)" value={studentPhone} setter={setStudentPhone} type="tel" placeholder="77 000 00 00" />
                <InputField label="Email (Élève)" value={studentEmail} setter={setStudentEmail} type="email" placeholder="eleve@ecole.com" />
              </div>
            </div>

            {/* 3. RESPONSABLE LÉGAL & CONTACTS D'URGENCE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} /> 3. Responsable Légal & Contacts d'Urgence
              </h4>
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
                
                <InputField label="Profession du Responsable (Optionnel)" value={guardianProfession} setter={setGuardianProfession} placeholder="Ex: Ingénieur, Commerçant" />
                <InputField label="N° CNI / Passeport du Responsable (Optionnel)" value={guardianIdCardNo} setter={setGuardianIdCardNo} placeholder="Ex: 1 759 1990 01234" />
                
                <InputField label="Second Contact / Urgence - Nom (Optionnel)" value={emergencyContactName} setter={setEmergencyContactName} placeholder="Ex: Oncle Mamadou" />
                <InputField label="Second Contact / Urgence - Tél (Optionnel)" value={emergencyContactPhone} setter={setEmergencyContactPhone} type="tel" placeholder="78 000 00 00" />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personnes autorisées à récupérer l'enfant (Optionnel)</label>
                  <input 
                    type="text" value={authorizedPersons} onChange={e => setAuthorizedPersons(e.target.value)} placeholder="Ex: Grand-mère Aminata, Chauffeur Ousmane (77 111 22 33)"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adresse Domicile Complète <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <textarea 
                    value={address} onChange={e => setAddress(e.target.value)} required rows={2} placeholder="Ville, Quartier, Rue, N° villa..."
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* 4. SANTÉ ET SITUATION PARTICULIÈRE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={16} /> 4. Santé & Informations Médicales (Optionnel)
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Groupe Sanguin</label>
                  <select 
                    value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                    <option value="Inconnu">Inconnu / Non renseigné</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allergies, Traitements urgents ou Besoins spécifiques (PAI)</label>
                  <input 
                    type="text" value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Ex: Asthmatique (Ventoline), Allergie arachides"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 5. SCOLARITÉ PRÉCÉDENTE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} /> 5. Scolarité Précédente (Optionnel)
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <InputField label="Dernier Établissement Fréquenté" value={previousSchool} setter={setPreviousSchool} placeholder="Ex: Collège Mermoz" />
                <InputField label="Dernière Classe Fréquentée" value={lastClass} setter={setLastClass} placeholder="Ex: CM2, 6ème" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 100%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Motif de changement d'établissement</label>
                  <input 
                    type="text" value={transferReason} onChange={e => setTransferReason(e.target.value)} placeholder="Ex: Déménagement familial, Recherche d'excellence"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 6. ADMINISTRATIF ET RÉGIME FINANCIER */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} /> 6. Régime Scolaire & Modalité de Paiement
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Régime de l'élève <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={regime} onChange={e => setRegime(e.target.value as any)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="Externe">Externe</option>
                    <option value="Demi-pensionnaire">Demi-pensionnaire</option>
                    <option value="Interne">Interne</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 45%' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Échéancier de Paiement <span style={{ color: 'var(--status-negative)' }}>*</span></label>
                  <select 
                    value={paymentPlan} onChange={e => setPaymentPlan(e.target.value as any)} required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="Mensuel">Mensuel (10 tranches)</option>
                    <option value="Trimestriel">Trimestriel (3 tranches)</option>
                    <option value="Annuel">Annuel (Paiement intégral)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. NUMÉRISATION & PIÈCES JOINTE EN FORMAT PDF/IMAGE */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={16} /> 7. Numérisation des Pièces Jointes (GED / PDF)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <DocumentUploaderItem title="Extrait d'acte de naissance (PDF)" doc={docBirthCert} setter={setDocBirthCert} />
                <DocumentUploaderItem title="Photo d'identité (Image / PDF)" doc={docPhoto} setter={setDocPhoto} />
                <DocumentUploaderItem title="Bulletins de l'année précédente (PDF)" doc={docPrevReport} setter={setDocPrevReport} />
                <DocumentUploaderItem title="Certificat de radiation (Ex-Sortie) (PDF)" doc={docDischarge} setter={setDocDischarge} />
                <DocumentUploaderItem title="Carnet de vaccination / Certificat médical (PDF)" doc={docVaccine} setter={setDocVaccine} />
              </div>
            </div>

            <button type="submit" style={{
              backgroundColor: editingId ? '#10b981' : 'var(--accent)', color: '#FFFFFF', border: 'none', padding: '14px',
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', marginTop: '10px'
            }}>
              <UserPlus size={18} /> {editingId ? 'Sauvegarder les modifications' : 'Valider le dossier d\'inscription'}
            </button>
          </form>
        </div>

        {/* Liste des Dossiers */}
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
            {students.map((std) => {
              const docCount = Object.values(std.scannedDocs || {}).filter(Boolean).length;
              return (
                <div key={std.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: editingId === std.id ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-page)', transition: 'background 0.2s' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {std.photoUrl ? (
                          <img src={std.photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{std.firstName} {std.lastName}</h4>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: std.gender === 'Féminin' ? '#f472b6' : '#38bdf8', color: 'white', fontWeight: 700 }}>
                            {std.gender === 'Féminin' ? 'F' : 'M'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{std.className}</span>
                          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(212, 168, 83, 0.15)', color: '#D4A853', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {std.regime || 'Externe'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {/* BOUTON DE VISIONNAGE DE TOUS LES DOCUMENTS SCANNÉS */}
                      <button 
                        type="button" 
                        onClick={() => setViewingStudentDocsModal(std)} 
                        style={{ background: docCount > 0 ? '#dcfce7' : 'none', border: docCount > 0 ? '1px solid #86efac' : 'none', color: docCount > 0 ? '#166534' : '#64748b', cursor: 'pointer', padding: '6px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }} 
                        title="Consulter les documents scannés du dossier"
                      >
                        <FileCheck size={16} /> GED ({docCount})
                      </button>
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
                        <User size={14} /> Responsable: {std.guardianName} ({std.guardianRelation}) {std.guardianProfession ? `- ${std.guardianProfession}` : ''}
                      </div>
                    )}
                    {std.guardianPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> Tél Tuteur: {std.guardianPhone}
                      </div>
                    )}
                    {std.emergencyContactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                        <ShieldAlert size={14} /> Urgence: {std.emergencyContactName} ({std.emergencyContactPhone})
                      </div>
                    )}
                    {std.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} /> {std.address.substring(0, 30)}{std.address.length > 30 ? '...' : ''}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
            
            {students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Aucun dossier d'inscription pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODALE VISIONNEUSE INTELLIGENTE DE DOCUMENT INDIVIDUEL (PDF/IMG)*/}
      {/* ------------------------------------------------------------- */}
      {viewingDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '900px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Header Modale */}
            <div style={{ padding: '16px 24px', backgroundColor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>📄 {viewingDoc.title}</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Fichier : {viewingDoc.doc.name} · Numérisé le {viewingDoc.doc.uploadedAt}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a
                  href={viewingDoc.doc.dataUrl}
                  download={viewingDoc.doc.name}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', backgroundColor: '#38bdf8', color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  <Download size={14} /> Télécharger
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Contenu Visionneuse */}
            <div style={{ flex: 1, backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewingDoc.doc.fileType === 'pdf' ? (
                <iframe
                  src={viewingDoc.doc.dataUrl}
                  title={viewingDoc.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <img
                  src={viewingDoc.doc.dataUrl}
                  alt={viewingDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }}
                />
              )}
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALE LISTE DES DOCUMENTS DU DOSSIER D'UN ÉLÈVE             */}
      {/* ------------------------------------------------------------- */}
      {viewingStudentDocsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '600px', maxWidth: '90vw', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>
                  📁 Pièces Numérisées de {viewingStudentDocsModal.firstName} {viewingStudentDocsModal.lastName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Classe : {viewingStudentDocsModal.className} · Matricule : {viewingStudentDocsModal.matricule}</span>
              </div>
              <button onClick={() => setViewingStudentDocsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: "Extrait d'acte de naissance", doc: viewingStudentDocsModal.scannedDocs?.birthCertificate },
                { title: "Photo d'identité de l'élève", doc: viewingStudentDocsModal.scannedDocs?.photo },
                { title: "Bulletins de l'année précédente", doc: viewingStudentDocsModal.scannedDocs?.previousReport },
                { title: "Certificat de radiation (Ex-Certificat de sortie)", doc: viewingStudentDocsModal.scannedDocs?.dischargeCertificate },
                { title: "Carnet de vaccination / Certificat médical", doc: viewingStudentDocsModal.scannedDocs?.vaccinationRecord },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', backgroundColor: item.doc ? '#f0fdf4' : '#f8fafc', border: item.doc ? '1px solid #86efac' : '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: item.doc ? '#14532d' : '#64748b' }}>{item.title}</strong>
                    {item.doc ? (
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '2px' }}>📄 {item.doc.name} ({item.doc.uploadedAt})</div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Non fourni / Non scanné</div>
                    )}
                  </div>

                  {item.doc ? (
                    <button
                      type="button"
                      onClick={() => {
                        setViewingDoc({ title: item.title, doc: item.doc! });
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      <Eye size={14} /> Consulter le PDF
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Absente</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button onClick={() => setViewingStudentDocsModal(null)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
