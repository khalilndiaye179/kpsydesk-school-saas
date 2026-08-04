import React, { useState, useEffect, useRef } from 'react';
import { Save, Image as ImageIcon, Building, MapPin, Phone, Mail, FileCheck, Navigation } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

export interface SchoolSettings {
  ministry: string;
  ia: string;
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  country?: string;
  kioskLatitude?: string;
  kioskLongitude?: string;
  kioskToleranceMeters?: number;
  kioskRequirePhoto?: boolean;
  kioskPhotoRetentionDays?: number;
}

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings>({
    ministry: '',
    ia: '',
    schoolName: '',
    motto: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    kioskLatitude: '',
    kioskLongitude: '',
    kioskToleranceMeters: 150,
    kioskRequirePhoto: true,
    kioskPhotoRetentionDays: 30
  });
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kpsydesk_school_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && window.L && !leafletMap.current) {
      // Init map
      const initialLat = settings.kioskLatitude ? parseFloat(settings.kioskLatitude) : 14.6928;
      const initialLng = settings.kioskLongitude ? parseFloat(settings.kioskLongitude) : -17.4467;

      leafletMap.current = window.L.map(mapRef.current).setView([initialLat, initialLng], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);

      if (settings.kioskLatitude && settings.kioskLongitude) {
        marker.current = window.L.marker([initialLat, initialLng]).addTo(leafletMap.current);
      }

      leafletMap.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
      });
    }
  }, [settings.kioskLatitude, settings.kioskLongitude]); // add deps to re-init if needed, but the ref check prevents double init

  const updateLocation = (lat: number, lng: number) => {
    setSettings(prev => ({
      ...prev,
      kioskLatitude: lat.toFixed(6),
      kioskLongitude: lng.toFixed(6)
    }));
    
    if (leafletMap.current) {
      if (!marker.current) {
        marker.current = window.L.marker([lat, lng]).addTo(leafletMap.current);
      } else {
        marker.current.setLatLng([lat, lng]);
      }
      leafletMap.current.setView([lat, lng]);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible de récupérer votre position. Vérifiez vos permissions.');
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kpsydesk_school_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>Paramètres de l'établissement</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Configurez les informations qui apparaîtront sur les documents officiels.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section Logo */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ImageIcon size={18} style={{ color: 'var(--accent)' }}/> Logo Officiel
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--bg-page)' }}>
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={32} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              )}
            </div>
            <div>
              <label style={{ display: 'inline-block', padding: '10px 16px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                Choisir une image
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Format recommandé: PNG ou JPG transparent (Max 2MB).</p>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Autorités */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Building size={18} style={{ color: 'var(--accent)' }}/> Autorités de Tutelle
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ministère de tutelle</label>
              <input type="text" name="ministry" value={settings.ministry} onChange={handleChange} placeholder="Ex: Ministère de l'Éducation Nationale" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inspection d'Académie (IA)</label>
              <input type="text" name="ia" value={settings.ia} onChange={handleChange} placeholder="Ex: IA de Dakar" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Etablissement */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <FileCheck size={18} style={{ color: 'var(--accent)' }}/> Identité de l'Établissement
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nom de l'établissement</label>
              <input type="text" name="schoolName" value={settings.schoolName} onChange={handleChange} placeholder="Ex: Groupe Scolaire Excellence" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Devise</label>
              <input type="text" name="motto" value={settings.motto} onChange={handleChange} placeholder="Ex: Travail - Discipline - Réussite" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Contacts */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <MapPin size={18} style={{ color: 'var(--accent)' }}/> Coordonnées
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Adresse complète</label>
              <input type="text" name="address" value={settings.address} onChange={handleChange} placeholder="Ex: 123 Avenue Blaise Diagne, BP 1234, Dakar" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Phone size={14} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/>Téléphone</label>
                <input type="text" name="phone" value={settings.phone} onChange={handleChange} placeholder="Ex: +221 33 000 00 00" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Mail size={14} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/>Email de contact</label>
                <input type="email" name="email" value={settings.email} onChange={handleChange} placeholder="Ex: contact@ecole.com" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        {/* Configuration Kiosque */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <MapPin size={18} style={{ color: 'var(--accent)' }}/> Kiosque de Pointage & Géolocalisation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latitude (GPS)</label>
              <input type="number" step="any" name="kioskLatitude" value={settings.kioskLatitude || ''} onChange={handleChange} placeholder="Ex: 14.6928" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Longitude (GPS)</label>
              <input type="number" step="any" name="kioskLongitude" value={settings.kioskLongitude || ''} onChange={handleChange} placeholder="Ex: -17.4467" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pointer sur la carte pour définir la zone</label>
                <button type="button" onClick={handleGetCurrentLocation} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Navigation size={14} style={{ color: 'var(--accent)' }}/> Ma position actuelle
                </button>
              </div>
              <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '12px', border: '1px solid var(--border)', zIndex: 1 }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rayon de tolérance (mètres)</label>
              <input type="number" name="kioskToleranceMeters" value={settings.kioskToleranceMeters || 150} onChange={(e) => setSettings(prev => ({ ...prev, kioskToleranceMeters: parseInt(e.target.value) }))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Conservation des photos (jours)</label>
              <input type="number" name="kioskPhotoRetentionDays" value={settings.kioskPhotoRetentionDays || 30} onChange={(e) => setSettings(prev => ({ ...prev, kioskPhotoRetentionDays: parseInt(e.target.value) }))} max={90} min={1} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1', marginTop: '8px' }}>
              <input type="checkbox" id="requirePhoto" checked={settings.kioskRequirePhoto ?? true} onChange={(e) => setSettings(prev => ({ ...prev, kioskRequirePhoto: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              <label htmlFor="requirePhoto" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>Exiger la prise de photo instantanée pour le pointage</label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
            <Save size={18} />
            {isSaved ? 'Enregistré avec succès !' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
};
