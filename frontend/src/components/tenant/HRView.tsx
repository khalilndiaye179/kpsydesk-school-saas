import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Shield, Mail, Key, AlertTriangle, Edit2, Trash2, 
  Briefcase, Clock, Camera, Check, User, MapPin, Phone, FileText, 
  Award, DollarSign, FileCheck, Calendar, Eye, Download, Upload, 
  X, Lock, History, Star, CheckSquare, Building2, UserCheck, ShieldAlert 
} from 'lucide-react';
import { api } from '../../lib/api';
import { getCountryConfig } from '../../config/countries.config';

type TenantRole = 'DIRECTOR' | 'CENSOR' | 'TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN' | 'DRIVER' | 'PARENT' | 'STUDENT';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface HRDiploma {
  id: string;
  title: string;
  level: string; // Licence, Master, Doctorat, CAPES, etc.
  country: string;
  institution: string;
  year: string;
  grade?: string; // Mention Très Bien, Bien, etc.
  scanUrl?: string;
}

export interface HRDocument {
  id: string;
  docType: string; // CNI, Passeport, Extrait, Casier, Contrat, CV, etc.
  name: string;
  dataUrl: string;
  uploadedAt: string;
  fileType: 'pdf' | 'image';
  expiryDate?: string;
}

export interface HREvaluation {
  year: string;
  evaluator: string;
  score: number; // /20 ou /5
  objectives: string;
  strengths: string;
  recommendations: string;
}

export interface StaffUser {
  id: string;
  username?: string;
  email: string;
  
  // Onglet 1: Infos Personnelles
  civility?: 'M.' | 'Mme' | 'Mlle' | 'Dr' | 'Pr';
  firstName?: string;
  lastName?: string;
  gender?: 'Masculin' | 'Féminin';
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  maritalStatus?: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
  childrenCount?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  phone?: string;
  secondaryPhone?: string;
  personalEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;

  // Onglet 2: Infos Professionnelles
  title?: string;
  department?: string;
  service?: string;
  grade?: string;
  category?: string;
  step?: string; // Échelon
  status: UserStatus;
  contractType?: string; // CDI, CDD, Prestation, Vacataire
  hireDate?: string;
  startDate?: string;
  seniorityYears?: number;
  managerName?: string;
  assignedClasses?: string; // Classes ou matières enseignées
  weeklyHours?: number;

  // Onglet 3: Accès & Sécurité
  role: TenantRole;
  lastLoginAt?: string;
  mfaEnabled?: boolean;

  // Onglet 4: RBAC Permissions
  permissions?: string[]; // Ex: ['MANAGE_STUDENTS', 'MANAGE_GRADES']

  // Onglet 5: Financier & Paie
  baseSalary?: number;
  hourlyRate?: number;
  indemnities?: number;
  bankName?: string;
  bankAccountNumber?: string;
  paymentMode?: 'Virement' | 'Chèque' | 'Mobile Money' | 'Espèces';

  // Onglet 6: Diplômes
  diplomas?: HRDiploma[];

  // Onglet 7: GED Documents
  documents?: HRDocument[];

  // Onglet 8: Congés
  leaveBalanceDays?: number;

  // Onglet 9: Évaluations
  evaluations?: HREvaluation[];

  // Onglet 10: Traçabilité / Audit
  auditLogs?: Array<{ date: string; action: string; author: string }>;

  createdAt: string;
}

export const HRView: React.FC = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [modalTab, setModalTab] = useState<number>(1); // Onglets 1 à 10

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'PARENTS_STUDENTS' | 'CLOCK_EVENTS'>('EMPLOYEES');
  const [clockEvents, setClockEvents] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [tenantCode, setTenantCode] = useState<string>('TENANT');

  // Visionneuse GED PDF
  const [viewingDoc, setViewingDoc] = useState<{ title: string; doc: HRDocument } | null>(null);

  // -------------------------------------------------------------
  // STATES DU FORMULAIRE SIRH (10 ONGLETS)
  // -------------------------------------------------------------
  // Onglet 1
  const [civility, setCivility] = useState<'M.' | 'Mme' | 'Mlle' | 'Dr' | 'Pr'>('M.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Masculin' | 'Féminin'>('Masculin');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [nationality, setNationality] = useState('Sénégalaise');
  const [maritalStatus, setMaritalStatus] = useState<'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)'>('Célibataire');
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Onglet 2
  const [newTitle, setNewTitle] = useState('');
  const [department, setDepartment] = useState('Enseignement');
  const [service, setService] = useState('Pédagogie');
  const [grade, setGrade] = useState('Professeur Titulaire');
  const [category, setCategory] = useState('A1');
  const [step, setStep] = useState('1er Échelon');
  const [newContractType, setNewContractType] = useState('CDI');
  const [hireDate, setHireDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [managerName, setManagerName] = useState('');
  const [assignedClasses, setAssignedClasses] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<number>(18);

  // Onglet 3
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState<TenantRole>('TEACHER');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Onglet 4: RBAC Permissions
  const [permissions, setPermissions] = useState<string[]>([
    'MANAGE_STUDENTS', 'MANAGE_GRADES', 'MANAGE_ATTENDANCE'
  ]);

  // Onglet 5: Financier
  const [newBaseSalary, setNewBaseSalary] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [indemnities, setIndemnities] = useState('');
  const [bankName, setBankName] = useState('CBAO Groupe Attijariwafa Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Virement' | 'Chèque' | 'Mobile Money' | 'Espèces'>('Virement');

  // Onglet 6: Diplômes
  const [diplomas, setDiplomas] = useState<HRDiploma[]>([]);
  const [newDipTitle, setNewDipTitle] = useState('');
  const [newDipLevel, setNewDipLevel] = useState('Master 2 / DEA');
  const [newDipCountry, setNewDipCountry] = useState('Sénégal');
  const [newDipInst, setNewDipInst] = useState('UCAD Dakar');
  const [newDipYear, setNewDipYear] = useState('2018');

  // Onglet 7: GED Documents
  const [documents, setDocuments] = useState<HRDocument[]>([]);

  // Onglet 8: Congés
  const [leaveBalanceDays, setLeaveBalanceDays] = useState<number>(30);

  // Onglet 9: Évaluations
  const [evaluations, setEvaluations] = useState<HREvaluation[]>([]);
  const [evalScore, setEvalScore] = useState<number>(16);
  const [evalObj, setEvalObj] = useState('');
  const [evalRec, setEvalRec] = useState('');

  useEffect(() => {
    fetchTenantInfo();
    fetchStaff();
  }, []);

  const fetchTenantInfo = async () => {
    try {
      const res = await api.get('/tenant/settings');
      if (res.data?.code) {
        setTenantCode(res.data.code.toUpperCase());
      }
    } catch {
      const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || 'TENANT';
      setTenantCode(activeTenantId.substring(0, 7).toUpperCase());
    }
  };

  const fetchStaff = async () => {
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
    const USERS_STORAGE_KEY = `kpsydesk_tenant_users_${activeTenantId}`;
    const CLOCK_STORAGE_KEY = `kpsydesk_clock_events_${activeTenantId}`;

    try {
      const res = await api.get('/tenant/users');
      setStaff(res.data);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(res.data));
    } catch (err) {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        let users: StaffUser[] = JSON.parse(saved);
        users = users.filter(u => !['directeur@kpsydesk.com', 'censeur@kpsydesk.com', 'compta@kpsydesk.com'].includes(u.email));
        setStaff(users);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } else {
        setStaff([]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      }
    }

    const savedEvents = localStorage.getItem(CLOCK_STORAGE_KEY);
    if (savedEvents) {
      setClockEvents(JSON.parse(savedEvents));
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for(let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    return pwd;
  };

  const generateUniqueUsername = (count: number) => {
    const nextSeq = String(count + 1).padStart(4, '0');
    return `${tenantCode}-${nextSeq}`;
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setModalTab(1);
    setCivility('M.');
    setFirstName('');
    setLastName('');
    setGender('Masculin');
    setBirthDate('1985-05-12');
    setBirthPlace('Dakar');
    setNationality('Sénégalaise');
    setMaritalStatus('Marié(e)');
    setChildrenCount(2);
    setAddress('Sacré-Cœur 3, Villa N° 45');
    setCity('Dakar');
    setRegion('Dakar');
    setPhone('77 654 32 10');
    setSecondaryPhone('');
    setPersonalEmail('');
    setEmergencyContactName('Awa DIOP');
    setEmergencyContactPhone('77 111 22 33');
    setEmergencyRelation('Épouse');

    setNewTitle('Professeur de Mathématiques');
    setDepartment('Sciences & Technologies');
    setService('Enseignement Secondaire');
    setGrade('PES (Professeur de l\'Enseignement Secondaire)');
    setCategory('A1');
    setStep('3ème Échelon');
    setNewContractType('CDI');
    setHireDate('2021-10-01');
    setStartDate('2021-10-01');
    setManagerName('M. le Censeur des Études');
    setAssignedClasses('6ème A, 5ème B, 3ème C');
    setWeeklyHours(20);

    setEmail('');
    setNewRole('TEACHER');
    setGeneratedUsername(generateUniqueUsername(staff.length));
    setGeneratedPassword(generatePassword());

    setPermissions(['MANAGE_STUDENTS', 'MANAGE_GRADES', 'MANAGE_ATTENDANCE']);

    setNewBaseSalary('450000');
    setNewHourlyRate('');
    setIndemnities('50000');
    setBankName('CBAO Groupe Attijariwafa Bank');
    setBankAccountNumber('SN012 01001 12345678901 45');
    setPaymentMode('Virement');

    setDiplomas([
      { id: 'dip-1', title: 'Master 2 Mathématiques Pures', level: 'Master 2', country: 'Sénégal', institution: 'UCAD Dakar', year: '2017', grade: 'Mention Bien' }
    ]);
    setDocuments([]);
    setLeaveBalanceDays(30);
    setEvaluations([
      { year: '2024-2025', evaluator: 'Direction des Études', score: 17, objectives: 'Assurer 100% de réussite au BFEM', strengths: 'Excellente pédagogie et rigueur', recommendations: 'Proposer comme chef de département' }
    ]);

    setShowModal(true);
  };

  const handleOpenEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setModalTab(1);
    setCivility(user.civility || 'M.');
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setGender(user.gender || 'Masculin');
    setBirthDate(user.birthDate || '');
    setBirthPlace(user.birthPlace || '');
    setNationality(user.nationality || 'Sénégalaise');
    setMaritalStatus(user.maritalStatus || 'Marié(e)');
    setChildrenCount(user.childrenCount || 0);
    setAddress(user.address || '');
    setCity(user.city || '');
    setRegion(user.region || '');
    setPhone(user.phone || '');
    setSecondaryPhone(user.secondaryPhone || '');
    setPersonalEmail(user.personalEmail || '');
    setEmergencyContactName(user.emergencyContactName || '');
    setEmergencyContactPhone(user.emergencyContactPhone || '');
    setEmergencyRelation(user.emergencyRelation || '');

    setNewTitle(user.title || '');
    setDepartment(user.department || 'Enseignement');
    setService(user.service || 'Pédagogie');
    setGrade(user.grade || '');
    setCategory(user.category || 'A1');
    setStep(user.step || '1er Échelon');
    setNewContractType(user.contractType || 'CDI');
    setHireDate(user.hireDate || '');
    setStartDate(user.startDate || '');
    setManagerName(user.managerName || '');
    setAssignedClasses(user.assignedClasses || '');
    setWeeklyHours(user.weeklyHours || 18);

    setEmail(user.email || '');
    setNewRole(user.role);
    setGeneratedUsername(user.username || `${tenantCode}-0000`);
    setGeneratedPassword('••••••••');

    setPermissions(user.permissions || ['MANAGE_STUDENTS', 'MANAGE_GRADES']);

    setNewBaseSalary(user.baseSalary ? String(user.baseSalary) : '');
    setNewHourlyRate(user.hourlyRate ? String(user.hourlyRate) : '');
    setIndemnities(user.indemnities ? String(user.indemnities) : '');
    setBankName(user.bankName || 'CBAO Dakar');
    setBankAccountNumber(user.bankAccountNumber || '');
    setPaymentMode(user.paymentMode || 'Virement');

    setDiplomas(user.diplomas || []);
    setDocuments(user.documents || []);
    setLeaveBalanceDays(user.leaveBalanceDays ?? 30);
    setEvaluations(user.evaluations || []);

    setShowModal(true);
  };

  const handleAddDiploma = () => {
    if (!newDipTitle) return;
    const dip: HRDiploma = {
      id: `dip-${Date.now()}`,
      title: newDipTitle,
      level: newDipLevel,
      country: newDipCountry,
      institution: newDipInst,
      year: newDipYear,
    };
    setDiplomas([...diplomas, dip]);
    setNewDipTitle('');
  };

  const handleRemoveDiploma = (id: string) => {
    setDiplomas(diplomas.filter(d => d.id !== id));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      const newDoc: HRDocument = {
        id: `doc-${Date.now()}`,
        docType,
        name: file.name,
        dataUrl,
        uploadedAt: new Date().toLocaleDateString('fr-FR'),
        fileType,
      };
      setDocuments([...documents.filter(d => d.docType !== docType), newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    const confirmMsg = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName || ''} ${user.lastName || ''} (${user.email}) ?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/tenant/users/${user.id}`);
    } catch (err) {
      console.warn('Suppression API échouée, suppression locale appliquée');
    }

    const updated = staff.filter(u => u.id !== user.id);
    setStaff(updated);
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
    localStorage.setItem(`kpsydesk_tenant_users_${activeTenantId}`, JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeTenantId = localStorage.getItem('kpsydesk_active_tenant_id') || '';
    const USERS_STORAGE_KEY = `kpsydesk_tenant_users_${activeTenantId}`;

    const staffPayload: Partial<StaffUser> = {
      civility,
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      nationality,
      maritalStatus,
      childrenCount,
      address,
      city,
      region,
      phone,
      secondaryPhone,
      personalEmail,
      emergencyContactName,
      emergencyContactPhone,
      emergencyRelation,

      title: newTitle,
      department,
      service,
      grade,
      category,
      step,
      contractType: newContractType,
      hireDate,
      startDate,
      managerName,
      assignedClasses,
      weeklyHours,

      email,
      role: newRole,

      permissions,

      baseSalary: newBaseSalary ? parseFloat(newBaseSalary) : undefined,
      hourlyRate: newHourlyRate ? parseFloat(newHourlyRate) : undefined,
      indemnities: indemnities ? parseFloat(indemnities) : undefined,
      bankName,
      bankAccountNumber,
      paymentMode,

      diplomas,
      documents,
      leaveBalanceDays,
      evaluations,
    };

    if (editingUser) {
      try {
        await api.put(`/tenant/users/${editingUser.id}`, staffPayload);
      } catch (err) {
        console.warn('Fallback mise à jour locale RH');
      }

      const updated = staff.map(u => u.id === editingUser.id ? { ...u, ...staffPayload } as StaffUser : u);
      setStaff(updated);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } else {
      const fullPayload = {
        ...staffPayload,
        username: generatedUsername,
        pass: generatedPassword || 'KPsySchool2026!',
        status: 'ACTIVE' as UserStatus,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await api.post('/tenant/users', fullPayload);
        const createdUser = response.data;
        const updated = [createdUser, ...staff];
        setStaff(updated);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Fallback sauvegarde locale RH', error);
        const newUser: StaffUser = {
          ...(fullPayload as StaffUser),
          id: `usr-${Date.now()}`,
        };
        const updated = [newUser, ...staff];
        setStaff(updated);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      }
    }
    
    setShowModal(false);
  };

  const getRoleLabel = (r: TenantRole) => {
    switch (r) {
      case 'DIRECTOR': return 'Directeur Général';
      case 'CENSOR': return 'Censeur / Directeur des Études';
      case 'TEACHER': return 'Enseignant / Professeur';
      case 'ACCOUNTANT': return 'Responsable Financier & Comptable';
      case 'LIBRARIAN': return 'Bibliothécaire';
      case 'DRIVER': return 'Responsable Transport';
      case 'PARENT': return 'Parent d\'élève';
      case 'STUDENT': return 'Élève';
      default: return r;
    }
  };

  const getRoleColor = (r: TenantRole) => {
    switch (r) {
      case 'DIRECTOR': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'CENSOR': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'ACCOUNTANT': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'LIBRARIAN': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'DRIVER': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      case 'TEACHER': return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
    }
  };

  const allRBACPermissions = [
    { key: 'MANAGE_STUDENTS', label: 'Gestion des Élèves & Inscriptions' },
    { key: 'MANAGE_TEACHERS', label: 'Gestion des Enseignants & Affectations' },
    { key: 'MANAGE_GRADES', label: 'Saisie & Validation des Notes' },
    { key: 'MANAGE_ATTENDANCE', label: 'Pointage, Absences & Retards' },
    { key: 'MANAGE_BULLETINS', label: 'Génération & Signature des Bulletins' },
    { key: 'MANAGE_FINANCE', label: 'Comptabilité, Encaissements & Salaires' },
    { key: 'MANAGE_HR', label: 'Système d\'Information RH & Paie' },
    { key: 'MANAGE_LIBRARY', label: 'Gestion de la Bibliothèque' },
    { key: 'MANAGE_TRANSPORT', label: 'Transport Scolaire & Flotte' },
    { key: 'MANAGE_SETTINGS', label: 'Configuration Générale Établissement' },
    { key: 'EXPORT_EXCEL', label: 'Exports de Données Excel / CSV' },
    { key: 'ELECTRONIC_SIGNATURE', label: 'Signature Électronique des Actes' },
  ];

  const filteredStaff = staff.filter(s => activeTab === 'EMPLOYEES' ? !['PARENT', 'STUDENT'].includes(s.role) : ['PARENT', 'STUDENT'].includes(s.role));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* EN-TÊTE DU SIRH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              SIRH — Système d'Information des Ressources Humaines
            </h2>
            <span style={{ backgroundColor: 'rgba(212, 168, 83, 0.15)', color: '#D4A853', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
              SaaS Multi-Tenant
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestion intégrée des dossiers RH, paie, contrats, diplômes, GED et droits d'accès.
          </p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(15,23,42,0.2)' }}
        >
          <Plus size={20} /> Créer un Dossier RH
        </button>
      </div>

      {/* TABS PRINCIPAUX */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('EMPLOYEES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'EMPLOYEES' ? '#0f172a' : 'transparent', color: activeTab === 'EMPLOYEES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={18} /> Personnel & Enseignants ({staff.filter(s => !['PARENT', 'STUDENT'].includes(s.role)).length})
        </button>
        <button 
          onClick={() => setActiveTab('CLOCK_EVENTS')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'CLOCK_EVENTS' ? '#0f172a' : 'transparent', color: activeTab === 'CLOCK_EVENTS' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Clock size={18} /> Pointages Kiosque ({clockEvents.length})
        </button>
        <button 
          onClick={() => setActiveTab('PARENTS_STUDENTS')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'PARENTS_STUDENTS' ? '#0f172a' : 'transparent', color: activeTab === 'PARENTS_STUDENTS' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Comptes Élèves & Parents
        </button>
      </div>

      {/* LISTE DES DOSSIERS RH */}
      {(activeTab === 'EMPLOYEES' || activeTab === 'PARENTS_STUDENTS') && (
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Collaborateur / Identifiant</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Fonction & Grade</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Rôle SIRH</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>GED & Diplômes</th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((u, idx) => {
              const roleColor = getRoleColor(u.role);
              const displayUsername = u.username || `${tenantCode}-${String(idx + 1).padStart(4, '0')}`;
              const docCount = u.documents?.length || 0;
              const dipCount = u.diplomas?.length || 0;

              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{u.civility || ''} {u.firstName} {u.lastName}</span>
                          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace', border: '1px solid #bae6fd' }}>
                            🔑 {displayUsername}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span><Mail size={12} /> {u.email}</span>
                          {u.phone && <span>· 📞 {u.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-primary)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{u.title || 'Non défini'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {u.grade ? `Grade : ${u.grade}` : `Contrat : ${u.contractType || 'CDI'}`}
                      {u.baseSalary ? ` · ${(u.baseSalary).toLocaleString('fr-FR')} F/mois` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: roleColor.bg, color: roleColor.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #86efac' }}>
                        📄 GED ({docCount})
                      </span>
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                        🎓 Diplômes ({dipCount})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(u)}
                        title="Ouvrir le Dossier RH complet (10 Onglets)"
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#0f172a', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <Edit2 size={14} /> Dossier RH
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u)}
                        title="Supprimer cet utilisateur"
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun dossier RH enregistré pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* ONGLET POINTAGES KIOSQUE */}
      {activeTab === 'CLOCK_EVENTS' && (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Employé</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Type</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Date & Heure</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Preuve (Photo)</th>
            </tr>
          </thead>
          <tbody>
            {clockEvents.map((evt, idx) => (
              <tr key={evt.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>{evt.staffName}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: evt.eventType === 'CLOCK_IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: evt.eventType === 'CLOCK_IN' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {evt.eventType === 'CLOCK_IN' ? 'ARRIVÉE' : 'DÉPART'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>{new Date(evt.timestamp).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '16px' }}>
                  {evt.photoDataUrl ? (
                    <button onClick={() => setSelectedPhoto(evt.photoDataUrl)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} /> Voir la photo
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aucune photo</span>
                  )}
                </td>
              </tr>
            ))}
            {clockEvents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun pointage enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALE DOSSIER RH NUMÉRIQUE (10 ONGLETS SIRH)                 */}
      {/* ------------------------------------------------------------- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', width: '1000px', maxWidth: '95vw', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
            
            {/* EN-TÊTE MODALE DOSSIER RH */}
            <div style={{ padding: '20px 28px', backgroundColor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserCheck color="#D4A853" size={24} />
                  {editingUser ? `Dossier RH Numérique : ${editingUser.firstName} ${editingUser.lastName}` : "Création d'un Nouveau Dossier RH"}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Identifiant Unique Établissement : <strong style={{ color: '#38bdf8' }}>🔑 {generatedUsername}</strong>
                </span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            {/* BARRE D'ONGLETS SIRH (10 ONGLETS) */}
            <div style={{ display: 'flex', backgroundColor: '#1e293b', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { id: 1, label: '1. Perso', icon: User },
                { id: 2, label: '2. Pro & Poste', icon: Briefcase },
                { id: 3, label: '3. Accès & Sécu', icon: Key },
                { id: 4, label: '4. RBAC Rôles', icon: Shield },
                { id: 5, label: '5. Finance & Paie', icon: DollarSign },
                { id: 6, label: '6. Diplômes', icon: Award },
                { id: 7, label: '7. GED Docs', icon: FileCheck },
                { id: 8, label: '8. Congés', icon: Calendar },
                { id: 9, label: '9. Évaluations', icon: Star },
                { id: 10, label: '10. Audit RH', icon: History },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setModalTab(t.id)}
                  style={{
                    padding: '12px 18px',
                    border: 'none',
                    backgroundColor: modalTab === t.id ? '#0f172a' : 'transparent',
                    color: modalTab === t.id ? '#D4A853' : '#94a3b8',
                    fontWeight: modalTab === t.id ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderBottom: modalTab === t.id ? '3px solid #D4A853' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            {/* CONTENU DE L'ONGLET ACTIF (FORMULAIRE SIRH) */}
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              {/* ONGLETS 1 À 10 */}
              <div>
                {/* --------------------------------------------------------- */}
                {/* ONGLET 1 : INFORMATIONS PERSONNELLES                      */}
                {/* --------------------------------------------------------- */}
                {modalTab === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Informations Personnelles & État Civil
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Civilité</label>
                        <select value={civility} onChange={e => setCivility(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                          <option value="M.">M.</option>
                          <option value="Mme">Mme</option>
                          <option value="Mlle">Mlle</option>
                          <option value="Dr">Dr</option>
                          <option value="Pr">Pr</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Prénom *</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom *</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sexe *</label>
                        <select value={gender} onChange={e => setGender(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                          <option value="Masculin">Masculin</option>
                          <option value="Féminin">Féminin</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date de naissance</label>
                        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lieu de naissance</label>
                        <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="Ex: Dakar" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nationalité</label>
                        <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Situation matrimoniale</label>
                        <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                          <option value="Célibataire">Célibataire</option>
                          <option value="Marié(e)">Marié(e)</option>
                          <option value="Divorcé(e)">Divorcé(e)</option>
                          <option value="Veuf(ve)">Veuf(ve)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nombre d'enfants</label>
                        <input type="number" value={childrenCount} onChange={e => setChildrenCount(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                    </div>

                    <h4 style={{ margin: '16px 0 0 0', fontSize: '1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      Coordonnées Domicile & Contact d'Urgence
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Téléphone Principal *</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="77 000 00 00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Téléphone Secondaire</label>
                        <input type="text" value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} placeholder="78 000 00 00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Personnel</label>
                        <input type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} placeholder="employe@gmail.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contact d'Urgence (Nom)</label>
                        <input type="text" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tél d'Urgence</label>
                        <input type="text" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lien de Parenté</label>
                        <input type="text" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} placeholder="Ex: Épouse, Frère" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 2 : INFORMATIONS PROFESSIONNELLES                  */}
                {/* --------------------------------------------------------- */}
                {modalTab === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Affectation, Grade & Carrière
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Intitulé de Poste / Fonction *</label>
                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Département</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Service</label>
                        <input type="text" value={service} onChange={e => setService(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Grade Hiérarchique</label>
                        <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Ex: PES, Prof. Vacataire" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Catégorie</label>
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: A1, B2" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Échelon</label>
                        <input type="text" value={step} onChange={e => setStep(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type de Contrat</label>
                        <select value={newContractType} onChange={e => setNewContractType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                          <option value="CDI">CDI (Temps Plein)</option>
                          <option value="CDD">CDD (Temps Déterminé)</option>
                          <option value="PRESTATION">Prestation / Externe</option>
                          <option value="FORFAIT">Vacataire / Horaire</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date de Recrutement</label>
                        <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date Prise de Fonction</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                    </div>

                    <h4 style={{ margin: '16px 0 0 0', fontSize: '1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      Affectations Pédagogiques (Pour Enseignants)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Classes & Matières Enseignées</label>
                        <input type="text" value={assignedClasses} onChange={e => setAssignedClasses(e.target.value)} placeholder="Ex: 6ème A, 5ème B - Mathématiques" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Volume Horaire Hebdomadaire (Heures)</label>
                        <input type="number" value={weeklyHours} onChange={e => setWeeklyHours(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 3 : ACCÈS & SÉCURITÉ                                */}
                {/* --------------------------------------------------------- */}
                {modalTab === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Accès Établissement & Authentification
                    </h4>
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Key size={24} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>Identifiant de Connexion Établissement</div>
                        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#0c4a6e' }}>🔑 {generatedUsername}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Professionnel de Connexion *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nom@ecole.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mot de passe provisoire</label>
                        <input type="text" value={generatedPassword} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'monospace', backgroundColor: '#f8fafc' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 4 : RÔLES & PERMISSIONS RBAC                       */}
                {/* --------------------------------------------------------- */}
                {modalTab === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Matrice de Permissions Fines (RBAC)
                    </h4>
                    <div>
                      <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Rôle Principal dans le Système *</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value as TenantRole)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #0f172a', marginTop: '4px', fontWeight: 700 }}>
                        <option value="DIRECTOR">Directeur Général (Accès Total)</option>
                        <option value="CENSOR">Censeur / Directeur des Études</option>
                        <option value="TEACHER">Enseignant / Professeur</option>
                        <option value="ACCOUNTANT">Comptable / Trésorier</option>
                        <option value="LIBRARIAN">Bibliothécaire</option>
                        <option value="DRIVER">Responsable Transport</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                      {allRBACPermissions.map(p => (
                        <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: permissions.includes(p.key) ? '#f0fdf4' : '#white', cursor: 'pointer' }}>
                          <input type="checkbox" checked={permissions.includes(p.key)} onChange={() => togglePermission(p.key)} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: permissions.includes(p.key) ? '#166534' : '#334155' }}>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 5 : INFORMATIONS FINANCIÈRES & PAIE               */}
                {/* --------------------------------------------------------- */}
                {modalTab === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Rémunération & Coordonnées Bancaires
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Salaire Mensuel Fixe (F CFA)</label>
                        <input type="number" value={newBaseSalary} onChange={e => setNewBaseSalary(e.target.value)} placeholder="Ex: 350000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Taux Horaire Vacataire (F CFA)</label>
                        <input type="number" value={newHourlyRate} onChange={e => setNewHourlyRate(e.target.value)} placeholder="Ex: 5000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Primes & Indemnités (F CFA)</label>
                        <input type="number" value={indemnities} onChange={e => setIndemnities(e.target.value)} placeholder="Ex: 50000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Établissement Bancaire</label>
                        <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>N° Compte / RIB / IBAN</label>
                        <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="SN012..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mode de Paiement Préféré</label>
                        <select value={paymentMode} onChange={e => setPaymentMode(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                          <option value="Virement">Virement Bancaire</option>
                          <option value="Chèque">Chèque</option>
                          <option value="Mobile Money">Mobile Money (Wave / OM)</option>
                          <option value="Espèces">Espèces</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 6 : DIPLÔMES ET QUALIFICATIONS                     */}
                {/* --------------------------------------------------------- */}
                {modalTab === 6 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Parcours Académique & Diplômes
                    </h4>
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input type="text" placeholder="Intitulé du Diplôme (ex: Master 2 Math)" value={newDipTitle} onChange={e => setNewDipTitle(e.target.value)} style={{ flex: 2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="Niveau (ex: Master 2)" value={newDipLevel} onChange={e => setNewDipLevel(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="Université / École" value={newDipInst} onChange={e => setNewDipInst(e.target.value)} style={{ flex: 1.5, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <button type="button" onClick={handleAddDiploma} style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Ajouter</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {diplomas.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#white' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🎓 {d.title} ({d.level})</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.institution} · {d.country} · Année {d.year}</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveDiploma(d.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 7 : GED DOCUMENTS ADMINISTRATIFS                  */}
                {/* --------------------------------------------------------- */}
                {modalTab === 7 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      GED — Gestion Électronique des Documents RH
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { type: 'CNI_PASSEPORT', label: 'Carte Nationale d\'Identité / CNI CEDEAO / Passeport' },
                        { type: 'CONTRAT_TRAVAIL', label: 'Contrat de Travail Signé (CDI/CDD/Vacations)' },
                        { type: 'CV', label: 'Curriculum Vitae (CV à jour)' },
                        { type: 'EXTRAIT_NAISSANCE', label: 'Extrait d\'Acte de Naissance' },
                        { type: 'CASIER_JUDICIAIRE', label: 'Extrait de Casier Judiciaire (Moins de 3 mois)' },
                        { type: 'CERTIFICAT_MEDICAL', label: 'Certificat Médical d\'Aptitude Professionnelle' },
                      ].map(item => {
                        const existingDoc = documents.find(d => d.docType === item.type);
                        return (
                          <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', backgroundColor: existingDoc ? '#f0fdf4' : '#f8fafc', border: existingDoc ? '1px solid #86efac' : '1px solid #cbd5e1' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: existingDoc ? '#14532d' : '#334155' }}>📄 {item.label}</div>
                              {existingDoc && <div style={{ fontSize: '0.75rem', color: '#166534' }}>Téléversé le {existingDoc.uploadedAt} · {existingDoc.name}</div>}
                            </div>
                            <div>
                              {existingDoc ? (
                                <button type="button" onClick={() => setViewingDoc({ title: item.label, doc: existingDoc })} style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Eye size={14} /> Voir PDF
                                </button>
                              ) : (
                                <label style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={14} /> Téléverser (PDF)
                                  <input type="file" accept="application/pdf,image/*" onChange={e => handleDocUpload(e, item.type)} style={{ display: 'none' }} />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 8 : CONGÉS & ABSENCES                              */}
                {/* --------------------------------------------------------- */}
                {modalTab === 8 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Solde de Congés & Historique des Absences
                    </h4>
                    <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Solde Annuel de Congés Payés</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#14532d' }}>{leaveBalanceDays} Jours Disponibles</div>
                      </div>
                      <button type="button" style={{ padding: '10px 16px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>+ Poser un Congé</button>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 9 : ÉVALUATIONS ANNUELLES                         */}
                {/* --------------------------------------------------------- */}
                {modalTab === 9 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Fiche d'Évaluation Annuelle & Objectifs
                    </h4>
                    {evaluations.map((ev, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                          <span>Année Scolaire : {ev.year}</span>
                          <span style={{ color: '#0284c7' }}>Note : {ev.score}/20</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '6px' }}><strong>Objectifs :</strong> {ev.objectives}</div>
                        <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '4px' }}><strong>Points Forts :</strong> {ev.strengths}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ONGLET 10 : JOURNAL D'AUDIT RH                             */}
                {/* --------------------------------------------------------- */}
                {modalTab === 10 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      Journal d'Audit Automatique (Traçabilité RH)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: '#f1f5f9' }}>
                        📅 <strong>{new Date().toLocaleDateString('fr-FR')}</strong> — Création/Mise à jour du dossier par l'administrateur RH
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PIED DE MODALE (BOUTONS D'ACTION) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {modalTab > 1 && (
                    <button type="button" onClick={() => setModalTab(modalTab - 1)} style={{ padding: '12px 20px', backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Précédent</button>
                  )}
                  {modalTab < 10 && (
                    <button type="button" onClick={() => setModalTab(modalTab + 1)} style={{ padding: '12px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Suivant</button>
                  )}
                  <button type="submit" style={{ padding: '12px 28px', backgroundColor: '#D4A853', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 14px rgba(212,168,83,0.4)' }}>
                    {editingUser ? "Enregistrer les modifications SIRH" : "Valider le Dossier RH"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VISIONNEUSE DE DOCUMENT PDF GRAND ÉCRAN                       */}
      {/* ------------------------------------------------------------- */}
      {viewingDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '900px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', backgroundColor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>📄 {viewingDoc.title}</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Fichier : {viewingDoc.doc.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href={viewingDoc.doc.dataUrl} download={viewingDoc.doc.name} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#D4A853', color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Download size={14} /> Télécharger
                </a>
                <button onClick={() => setViewingDoc(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f8fafc', overflow: 'hidden' }}>
              {viewingDoc.doc.fileType === 'pdf' ? (
                <iframe src={viewingDoc.doc.dataUrl} title={viewingDoc.title} style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <img src={viewingDoc.doc.dataUrl} alt={viewingDoc.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE PHOTO POINTAGE KIOSQUE */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', position: 'relative', maxWidth: '600px', width: '100%' }}>
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
            <img src={selectedPhoto} alt="Preuve de pointage" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
          </div>
        </div>
      )}

    </div>
  );
};
