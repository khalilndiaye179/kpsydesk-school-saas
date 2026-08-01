import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Clock, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { SchoolSettings } from './SettingsView';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ClockEvent {
  id: string;
  staffId: string;
  staffName: string;
  eventType: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  photoDataUrl?: string; // base64
}

export const KioskView: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [locationStatus, setLocationStatus] = useState<'PENDING' | 'OK' | 'ERROR'>('PENDING');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [cameraError, setCameraError] = useState('');
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Horloge
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement des données
  useEffect(() => {
    // Récupérer le personnel
    const savedUsers = localStorage.getItem('kpsydesk_tenant_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setStaffList(users.filter((u: any) => !['STUDENT', 'PARENT'].includes(u.role)));
    }
    
    // Récupérer les paramètres Kiosque
    const savedSettings = localStorage.getItem('kpsydesk_school_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Démarrer la géolocalisation et la caméra dès la sélection d'un employé
  useEffect(() => {
    if (selectedStaff) {
      startCamera();
      checkLocation();
    } else {
      stopCamera();
      setIsPhotoCaptured(false);
      setPhotoData(null);
      setLocationStatus('PENDING');
    }
    return () => stopCamera();
  }, [selectedStaff]);

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, // Caméra frontale
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setCameraError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Calculer la distance (Haversine)
  const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Rayon de la terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('ERROR');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Si l'admin a configuré le Kiosque
        if (settings?.kioskLatitude && settings?.kioskLongitude) {
          const lat = parseFloat(settings.kioskLatitude);
          const lng = parseFloat(settings.kioskLongitude);
          const tolerance = settings.kioskToleranceMeters || 150;
          
          const distance = getDistanceFromLatLonInM(latitude, longitude, lat, lng);
          if (distance <= tolerance) {
            setLocationStatus('OK');
          } else {
            setLocationStatus('ERROR'); // Trop loin
          }
        } else {
          // Non configuré, on accepte par défaut
          setLocationStatus('OK');
        }
      },
      (error) => {
        console.error('Erreur GPS:', error);
        setLocationStatus('ERROR');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Dimensionner le canvas comme la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Qualité JPEG 0.7 pour alléger
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoData(dataUrl);
        setIsPhotoCaptured(true);
        stopCamera();
      }
    }
  };

  const handleRetakePhoto = () => {
    setIsPhotoCaptured(false);
    setPhotoData(null);
    startCamera();
  };

  const handleClockInOut = (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    if (!selectedStaff) return;
    
    // Vérification finale
    if (settings?.kioskRequirePhoto && !photoData) {
      alert("Une photo est requise pour pointer.");
      return;
    }
    
    if (locationStatus === 'ERROR' && settings?.kioskLatitude) {
      alert("Vous n'êtes pas dans le périmètre autorisé de l'établissement.");
      return;
    }

    const newEvent: ClockEvent = {
      id: `clk-${Date.now()}`,
      staffId: selectedStaff.id,
      staffName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
      eventType: type,
      timestamp: new Date().toISOString(),
      latitude: currentLocation?.lat,
      longitude: currentLocation?.lng,
      photoDataUrl: photoData || undefined
    };

    // Sauvegarde
    const existing = localStorage.getItem('kpsydesk_clock_events');
    const events = existing ? JSON.parse(existing) : [];
    localStorage.setItem('kpsydesk_clock_events', JSON.stringify([newEvent, ...events]));

    // Feedback
    setSuccessMessage(`${type === 'CLOCK_IN' ? 'Arrivée' : 'Départ'} enregistré avec succès à ${currentTime.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`);
    
    // Reset
    setTimeout(() => {
      setSelectedStaff(null);
      setSuccessMessage('');
    }, 3000);
  };

  if (successMessage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', backgroundColor: 'var(--bg-page)' }}>
        <CheckCircle size={80} color="#10b981" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', color: '#10b981', fontFamily: 'var(--font-title)' }}>Pointage Validé</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{successMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 8px 0', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
          {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'capitalize' }}>
          {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {!selectedStaff ? (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Sélectionnez votre profil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {staffList.map(staff => (
              <button 
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                  {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{staff.firstName} {staff.lastName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{staff.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', display: 'flex', gap: '32px' }}>
          
          {/* Côté Info & Validation */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <button onClick={() => setSelectedStaff(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', marginBottom: '16px' }}>← Retour à la liste</button>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{selectedStaff.firstName} {selectedStaff.lastName}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Enregistrement du pointage</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Statut GPS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: locationStatus === 'OK' ? 'rgba(16, 185, 129, 0.1)' : locationStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                <MapPin size={24} color={locationStatus === 'OK' ? '#10b981' : locationStatus === 'PENDING' ? '#f59e0b' : '#ef4444'} />
                <div>
                  <div style={{ fontWeight: 600 }}>Position GPS</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {locationStatus === 'OK' ? 'Dans la zone de l\'établissement' : locationStatus === 'PENDING' ? 'Recherche en cours...' : 'Hors de la zone autorisée (ou refusée)'}
                  </div>
                </div>
              </div>

              {/* Statut Photo */}
              {settings?.kioskRequirePhoto !== false && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: isPhotoCaptured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                  <Camera size={24} color={isPhotoCaptured ? '#10b981' : '#f59e0b'} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Preuve visuelle</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {isPhotoCaptured ? 'Photo capturée' : 'Capture requise'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => handleClockInOut('CLOCK_IN')}
                disabled={locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)}
                style={{ flex: 1, padding: '20px', borderRadius: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: (locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)) ? 'not-allowed' : 'pointer', opacity: (locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)) ? 0.5 : 1 }}
              >
                📥 ARRIVÉE
              </button>
              <button 
                onClick={() => handleClockInOut('CLOCK_OUT')}
                disabled={locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)}
                style={{ flex: 1, padding: '20px', borderRadius: '16px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: (locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)) ? 'not-allowed' : 'pointer', opacity: (locationStatus === 'ERROR' || (settings?.kioskRequirePhoto !== false && !isPhotoCaptured)) ? 0.5 : 1 }}
              >
                📤 DÉPART
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              Conformément à notre politique, vos données de pointage (GPS et photo) sont conservées pendant {settings?.kioskPhotoRetentionDays || 30} jours à des fins de vérification RH exclusivement.
            </p>
          </div>

          {/* Côté Caméra */}
          {settings?.kioskRequirePhoto !== false && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                {cameraError ? (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textAlign: 'center', padding: '24px' }}>
                    {cameraError}
                  </div>
                ) : isPhotoCaptured && photoData ? (
                  <img src={photoData} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              
              {!isPhotoCaptured ? (
                <button 
                  onClick={capturePhoto}
                  style={{ padding: '16px 32px', borderRadius: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Camera size={20} /> Capturer la photo
                </button>
              ) : (
                <button 
                  onClick={handleRetakePhoto}
                  style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: 'transparent', border: '2px solid var(--border)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reprendre la photo
                </button>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
