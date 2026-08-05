import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Image as ImageIcon, Building, MapPin, Phone, Mail, FileCheck, 
  Navigation, Loader2, ShieldCheck, FileText, QrCode, Upload, Check, 
  Globe, User, Award, Stamp, Lock, CheckCircle2, AlertTriangle, Layers, X 
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCountryTheme } from '../../theme/CountryThemeProvider';

declare global {
  interface Window {
    L: any;
  }
}

export interface TropicalizedSchoolSettings {
  // Identité
  schoolName: string;
  acronym?: string;
  motto?: string;
  establishmentType?: 'PUBLIC' | 'PRIVATE' | 'CONFESSIONAL' | 'TECHNICAL';
  creationYear?: string;
  description?: string;
  logo?: string;
  officialStamp?: string;         // Scan du cachet officiel
  directorSignature?: string;     // Signature numérique du Directeur
  founderSignature?: string;      // Signature du Fondateur

  // Localisation
  country?: string;
  region?: string;
  department?: string;
  city?: string;
  address?: string;
  postalCode?: string;

  // Tutelle administrative
  ministry?: string;
  regionalDirection?: string;     // IA 🇸🇳, DRENA 🇨🇮, AE 🇲🇱
  inspection?: string;            // IEF 🇸🇳, IEPP 🇨🇮, CAP 🇲🇱

  // Identifiants administratifs
  authorizationNumber?: string;
  authorizationDate?: string;
  schoolCode?: string;
  ninea?: string;                 // Sénégal 🇸🇳
  rccm?: string;                  // Côte d'Ivoire 🇨🇮 & Mali 🇲🇱
  nif?: string;                   // Mali 🇲🇱
  taxAccount?: string;            // Compte Contribuable 🇨🇮
  ifu?: string;

  // Contacts & Responsable
  phone?: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  email?: string;
  adminEmail?: string;
  website?: string;
  directorName?: string;
  directorTitle?: string;

  // Géofencing Kiosque Pointage
  kioskLatitude?: string;
  kioskLongitude?: string;
  kioskToleranceMeters?: number;
  kioskRequirePhoto?: boolean;
  kioskPhotoRetentionDays?: number;

  // Personnalisation des impressions
  documentPrimaryColor?: string;
  showStampOnDocuments?: boolean;
  showQrCodeOnDocuments?: boolean;
}

export type SchoolSettings = TropicalizedSchoolSettings;

export const SettingsView: React.FC = () => {
  const { countryCode, countryConfig } = useCountryTheme();
  
  const [activeTab, setActiveTab] = useState<
    'IDENTITY' | 'LOCATION' | 'TUTELLE' | 'ADMIN_IDS' | 'VISUALS' | 'CONTACTS' | 'PRINT_ENGINE' | 'KIOSK'
  >('IDENTITY');

  const [settings, setSettings] = useState<TropicalizedSchoolSettings>({
    schoolName: 'ÉTABLISSEMENT EXCELLENCE KPSY',
    acronym: 'EEK',
    motto: 'Excellence, Discipline & Réussite',
    establishmentType: 'PRIVATE',
    creationYear: '2015',
    logo: '',
    officialStamp: '',
    directorSignature: '',
    founderSignature: '',

    country: countryCode,
    region: 'Dakar',
    department: 'Dakar',
    city: 'Dakar',
    address: 'Sacré-Cœur 3, Avenue Cheikh Anta Diop, Villa N° 104',

    ministry: countryConfig.officialHeader.republicName,
    regionalDirection: 'Inspection d\'Académie (IA) de Dakar',
    inspection: 'Inspection de l\'Éducation et de la Formation (IEF) de Grand-Dakar',

    authorizationNumber: 'N° 00458/MEN/DAJ/2016',
    authorizationDate: '2016-09-15',
    schoolCode: 'SEN-DKR-0458',
    ninea: '004589210 2Y3',
    rccm: 'SN-DKR-2016-B-12540',
    nif: '789456123M',
    taxAccount: 'CC-4512987-CI',
    ifu: 'IFU-987654321',

    phone: '+221 33 825 00 00',
    secondaryPhone: '+221 77 000 00 00',
    whatsappNumber: '+221 77 888 99 00',
    email: 'contact@kpsyschool.edu',
    adminEmail: 'direction@kpsyschool.edu',
    website: 'https://school.kpsyinformatique.com',
    directorName: 'Pr. Ibrahima FALL',
    directorTitle: 'Directeur Général d\'Établissement',

    kioskLatitude: '14.6928',
    kioskLongitude: '-17.4467',
    kioskToleranceMeters: 150,
    kioskRequirePhoto: true,
    kioskPhotoRetentionDays: 30,

    documentPrimaryColor: '#0f172a',
    showStampOnDocuments: true,
    showQrCodeOnDocuments: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Carte OpenStreetMap / Leaflet
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/tenant/settings');
      if (res.data && res.data.schoolName) {
        setSettings(prev => ({ ...prev, ...res.data }));
        localStorage.setItem('kpsydesk_school_settings', JSON.stringify(res.data));
      }
    } catch (err: any) {
      console.warn('Backend settings indisponible, fallback local:', err);
      const saved = localStorage.getItem('kpsydesk_school_settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error('Erreur lecture localStorage:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisation carte GPS pour Kiosque
  useEffect(() => {
    if (mapRef.current && window.L && !leafletMap.current && activeTab === 'KIOSK') {
      const initialLat = settings.kioskLatitude ? parseFloat(settings.kioskLatitude) : 14.6928;
      const initialLng = settings.kioskLongitude ? parseFloat(settings.kioskLongitude) : -17.4467;

      leafletMap.current = window.L.map(mapRef.current).setView([initialLat, initialLng], 14);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap.current);

      if (settings.kioskLatitude && settings.kioskLongitude) {
        marker.current = window.L.marker([initialLat, initialLng]).addTo(leafletMap.current);
      }

      leafletMap.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setSettings(prev => ({
          ...prev,
          kioskLatitude: lat.toFixed(6),
          kioskLongitude: lng.toFixed(6)
        }));
        if (marker.current) {
          marker.current.setLatLng([lat, lng]);
        } else {
          marker.current = window.L.marker([lat, lng]).addTo(leafletMap.current);
        }
      });
    }
  }, [activeTab]);

  // Convertisseur d'images (Logo, Cachet, Signatures) en Base64 / DataURL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof TropicalizedSchoolSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSettings(prev => ({ ...prev, [fieldName]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg('');

    try {
      await api.post('/tenant/settings', settings);
      localStorage.setItem('kpsydesk_school_settings', JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      console.warn('Sauvegarde backend échouée, sauvegarde locale appliquée');
      localStorage.setItem('kpsydesk_school_settings', JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* EN-TÊTE DU MODULE DE PARAMÈTRES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              Paramètres Institutionnels Établissement ({countryConfig.name} {countryConfig.flag})
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Configuration administrative, identifiants fiscaux (NINEA, RCCM, NIF), visuels officiels & signatures.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Sauvegarder les Paramètres
        </button>
      </div>

      {isSaved && (
        <div style={{ padding: '14px 20px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> Paramètres institutionnels et identifiants administratifs sauvegardés avec succès !
        </div>
      )}

      {/* BARRE DE NAVIGATION (8 ONGLETS DE PARAMÉTRAGE) */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {[
          { id: 'IDENTITY', label: '1. Identité Établissement', icon: Building },
          { id: 'LOCATION', label: '2. Localisation & Siège', icon: MapPin },
          { id: 'TUTELLE', label: '3. Autorités de Tutelle', icon: ShieldCheck },
          { id: 'ADMIN_IDS', label: `4. Identifiants (${countryCode})`, icon: FileCheck },
          { id: 'VISUALS', label: '5. Visuels, Cachet & Signatures', icon: Stamp },
          { id: 'CONTACTS', label: '6. Contacts & Direction', icon: Phone },
          { id: 'PRINT_ENGINE', label: '7. Moteur d\'Impression PDF', icon: FileText },
          { id: 'KIOSK', label: '8. Kiosque GPS & Pointage', icon: Navigation },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '10px 16px', borderRadius: '10px', border: 'none',
              backgroundColor: activeTab === t.id ? '#0f172a' : 'transparent',
              color: activeTab === t.id ? '#D4A853' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* FORMULAIRE DE PARAMÉTRAGE */}
      <form onSubmit={handleSave} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)' }}>
        
        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 1 : IDENTITÉ DE L'ÉTABLISSEMENT                           */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'IDENTITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Identité Institutionnelle & Statut Juridique
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom Officiel de l'Établissement *</label>
                <input type="text" value={settings.schoolName} onChange={e => setSettings({ ...settings, schoolName: e.target.value })} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700, fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sigle / Acronyme</label>
                <input type="text" value={settings.acronym} onChange={e => setSettings({ ...settings, acronym: e.target.value })} placeholder="Ex: EEK" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Devise Institutionnelle</label>
                <input type="text" value={settings.motto} onChange={e => setSettings({ ...settings, motto: e.target.value })} placeholder="Ex: Discipline - Travail - Excellence" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontStyle: 'italic' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type / Statut d'Établissement</label>
                <select value={settings.establishmentType} onChange={e => setSettings({ ...settings, establishmentType: e.target.value as any })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}>
                  <option value="PRIVATE">Enseignement Privé Laïc</option>
                  <option value="PUBLIC">Enseignement Public</option>
                  <option value="CONFESSIONAL">Enseignement Confessionnel</option>
                  <option value="TECHNICAL">Enseignement Technique & Pro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 2 : LOCALISATION ET GPS                                    */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'LOCATION' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Siège Social & Localisation Géographique
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pays de Résidence *</label>
                <input type="text" value={countryConfig.name} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700, backgroundColor: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Région / District</label>
                <input type="text" value={settings.region} onChange={e => setSettings({ ...settings, region: e.target.value })} placeholder="Ex: Dakar / Abidjan" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Département / Ville</label>
                <input type="text" value={settings.city} onChange={e => setSettings({ ...settings, city: e.target.value })} placeholder="Ex: Dakar / Bouaké" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Adresse Physiques Complète *</label>
                <textarea value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} required rows={2} placeholder="Avenue, Rue, Numéro de villa, Quartier..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 3 : AUTORITÉS DE TUTELLE (MINISTÈRE, IA, DRENA, CAP)      */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'TUTELLE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Autorités Administratives de Tutelle ({countryConfig.name})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Intitulé Officiel du Ministère de Tutelle</label>
                <input type="text" value={settings.ministry} onChange={e => setSettings({ ...settings, ministry: e.target.value })} placeholder={countryConfig.officialHeader.republicName} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Direction Régionale / Académie (IA / DRENA / AE)</label>
                <input type="text" value={settings.regionalDirection} onChange={e => setSettings({ ...settings, regionalDirection: e.target.value })} placeholder="Ex: IA de Dakar / DRENA Abidjan 1" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Inspection de Circonscription (IEF / IEPP / CAP)</label>
                <input type="text" value={settings.inspection} onChange={e => setSettings({ ...settings, inspection: e.target.value })} placeholder="Ex: IEF Dakar Plateau / CAP Bamako" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 4 : IDENTIFIANTS ADMINISTRATIFS (NINEA, RCCM, NIF, IFU)   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'ADMIN_IDS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Identifiants Juridiques & Fiscaux Officiels ({countryConfig.name})
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Code Établissement National</label>
                <input type="text" value={settings.schoolCode} onChange={e => setSettings({ ...settings, schoolCode: e.target.value })} placeholder="Ex: SEN-DKR-0458" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'monospace', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>N° Autorisation d'Ouverture</label>
                <input type="text" value={settings.authorizationNumber} onChange={e => setSettings({ ...settings, authorizationNumber: e.target.value })} placeholder="Ex: N° 00458/MEN/DAJ" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date de l'Autorisation</label>
                <input type="date" value={settings.authorizationDate} onChange={e => setSettings({ ...settings, authorizationDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>

              {/* SÉNÉGAL : NINEA */}
              {countryCode === 'SN' && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', gridColumn: 'span 3' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>NINEA (Numéro d'Identification Nationale des Entreprises et Associations - Sénégal 🇸🇳)</label>
                  <input type="text" value={settings.ninea} onChange={e => setSettings({ ...settings, ninea: e.target.value })} placeholder="Ex: 004589210 2Y3" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #166534', marginTop: '6px', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#14532d' }} />
                </div>
              )}

              {/* CÔTE D'IVOIRE : RCCM & COMPTE CONTRIBUABLE */}
              {countryCode === 'CI' && (
                <>
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9a3412' }}>RCCM (Registre du Commerce - Côte d'Ivoire 🇨🇮)</label>
                    <input type="text" value={settings.rccm} onChange={e => setSettings({ ...settings, rccm: e.target.value })} placeholder="Ex: CI-ABJ-2016-B-12540" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ea580c', marginTop: '6px', fontFamily: 'monospace', fontWeight: 800 }} />
                  </div>
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9a3412' }}>Compte Contribuable (CC Côte d'Ivoire 🇨🇮)</label>
                    <input type="text" value={settings.taxAccount} onChange={e => setSettings({ ...settings, taxAccount: e.target.value })} placeholder="Ex: CC-4512987-CI" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ea580c', marginTop: '6px', fontFamily: 'monospace', fontWeight: 800 }} />
                  </div>
                </>
              )}

              {/* MALI : NIF & RCCM */}
              {countryCode === 'ML' && (
                <>
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>NIF (Numéro d'Identification Fiscale - Mali 🇲🇱)</label>
                    <input type="text" value={settings.nif} onChange={e => setSettings({ ...settings, nif: e.target.value })} placeholder="Ex: 087654321M" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #0284c7', marginTop: '6px', fontFamily: 'monospace', fontWeight: 800 }} />
                  </div>
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>RCCM (Registre du Commerce - Mali 🇲🇱)</label>
                    <input type="text" value={settings.rccm} onChange={e => setSettings({ ...settings, rccm: e.target.value })} placeholder="Ex: MA-BKO-2018-B-4500" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #0284c7', marginTop: '6px', fontFamily: 'monospace', fontWeight: 800 }} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 5 : VISUELS, CACHET ET SIGNATURES OFFICIELS               */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'VISUALS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Visuels, Cachet d'Établissement & Signatures Numériques
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              
              {/* Logo Officiel */}
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Logo HD Établissement</h4>
                <div style={{ width: '100px', height: '100px', margin: '0 auto 12px auto', borderRadius: '12px', border: '2px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'white' }}>
                  {settings.logo ? <img src={settings.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <ImageIcon size={32} color="#94a3b8" />}
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Upload size={14} /> Joindre Logo (PNG)
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Cachet Officiel */}
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Cachet Humide / Sceau Officiel</h4>
                <div style={{ width: '100px', height: '100px', margin: '0 auto 12px auto', borderRadius: '50%', border: '2px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'white' }}>
                  {settings.officialStamp ? <img src={settings.officialStamp} alt="Cachet" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Stamp size={32} color="#94a3b8" />}
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Upload size={14} /> Joindre Cachet (PNG)
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'officialStamp')} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Signature Directeur */}
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Signature du Directeur</h4>
                <div style={{ width: '140px', height: '80px', margin: '0 auto 12px auto', borderRadius: '8px', border: '2px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'white' }}>
                  {settings.directorSignature ? <img src={settings.directorSignature} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <FileText size={32} color="#94a3b8" />}
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Upload size={14} /> Joindre Signature (PNG)
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'directorSignature')} style={{ display: 'none' }} />
                </label>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 6 : CONTACTS ET DIRECTION                                  */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'CONTACTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Coordonnées Institutionnelles & Direction Générale
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Téléphone Principal *</label>
                <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Numéro WhatsApp Officiel</label>
                <input type="text" value={settings.whatsappNumber} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Institutionnel *</label>
                <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nom & Prénom du Directeur *</label>
                <input type="text" value={settings.directorName} onChange={e => setSettings({ ...settings, directorName: e.target.value })} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Qualité / Titre Officiel</label>
                <input type="text" value={settings.directorTitle} onChange={e => setSettings({ ...settings, directorTitle: e.target.value })} placeholder="Ex: Directeur Général" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Site Web Officiel</label>
                <input type="text" value={settings.website} onChange={e => setSettings({ ...settings, website: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 7 : MOTEUR D'IMPRESSION & QR CODE                        */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'PRINT_ENGINE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Personnalisation des En-têtes, Pieds de Page & Sécurité QR Code
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>Options de Sécurité des Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.showStampOnDocuments} onChange={e => setSettings({ ...settings, showStampOnDocuments: e.target.checked })} />
                    Apposer automatiquement le Cachet officiel & les Signatures
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.showQrCodeOnDocuments} onChange={e => setSettings({ ...settings, showQrCodeOnDocuments: e.target.checked })} />
                    Générer un QR Code de vérification d'authenticité sur les bulletins et certificats
                  </label>
                </div>
              </div>

              {/* APERÇU DE L'EN-TÊTE NATIONAL & ÉTABLISSEMENT */}
              <div style={{ padding: '20px', borderRadius: '12px', border: '2px dashed #0f172a', backgroundColor: '#white' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0369a1', textTransform: 'uppercase', fontWeight: 800 }}>Aperçu d'En-tête Officiel</h4>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>{countryConfig.officialHeader.republicName}</div>
                  <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>{countryConfig.officialHeader.motto}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{settings.schoolName}</div>
                  <div>{settings.address} · Tél: {settings.phone}</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
                    {countryCode === 'SN' && `NINEA : ${settings.ninea || 'N/A'}`}
                    {countryCode === 'CI' && `RCCM : ${settings.rccm || 'N/A'} · CC : ${settings.taxAccount || 'N/A'}`}
                    {countryCode === 'ML' && `NIF : ${settings.nif || 'N/A'}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ONGLET 8 : KIOSQUE POINTAGE GPS                                  */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'KIOSK' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-title)', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              Géofencing GPS & Paramètres Kiosque de Pointage
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Latitude GPS</label>
                  <input type="text" value={settings.kioskLatitude} onChange={e => setSettings({ ...settings, kioskLatitude: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Longitude GPS</label>
                  <input type="text" value={settings.kioskLongitude} onChange={e => setSettings({ ...settings, kioskLongitude: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rayon de Tolérance de Pointage (Mètres)</label>
                  <input type="number" value={settings.kioskToleranceMeters} onChange={e => setSettings({ ...settings, kioskToleranceMeters: parseInt(e.target.value) || 150 })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                </div>
              </div>

              {/* Carte Leaflet */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Cliquez sur la carte pour définir la position GPS de l'école</label>
                <div ref={mapRef} style={{ width: '100%', height: '220px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
