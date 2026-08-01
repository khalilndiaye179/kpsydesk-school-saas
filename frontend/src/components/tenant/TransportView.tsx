import React, { useState, useEffect } from 'react';
import { Bus, Map, MapPin, Users, Plus, Shield, CheckCircle, AlertTriangle, Clock, Trash2, Edit2, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

interface Zone {
  id: string;
  name: string;
}

interface TransportBus {
  id: string;
  plateNumber: string;
  capacity: number;
  driverId: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

interface Route {
  id: string;
  name: string;
  zoneId: string;
  busId: string;
  departureTime: string;
  returnTime: string;
}

interface Assignment {
  id: string;
  studentId: string;
  routeId: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule?: string;
  classId?: string;
}

interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export const TransportView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ZONES' | 'FLEET' | 'ASSIGNMENTS'>('DASHBOARD');

  // Données
  const [zones, setZones] = useState<Zone[]>([]);
  const [buses, setBuses] = useState<TransportBus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const { user } = useAuth();
  // Les chauffeurs, élèves et parents ne peuvent que consulter.
  const isReadOnly = ['DRIVER', 'STUDENT', 'PARENT'].includes(user?.role || '');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Élèves
    const savedStudents = localStorage.getItem('kpsydesk_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));

    // Chauffeurs (Depuis les utilisateurs HR)
    const savedUsers = localStorage.getItem('kpsydesk_tenant_users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      const drvs = parsedUsers.filter((u: any) => u.role === 'DRIVER');
      setDrivers(drvs);
    }

    // Transport Data (Mock ou LocalStorage)
    const sZones = localStorage.getItem('kpsydesk_transport_zones');
    if (sZones) setZones(JSON.parse(sZones));
    else {
      const defZones = [{ id: 'z1', name: 'Dakar Plateau' }, { id: 'z2', name: 'Almadies / Ngor' }];
      setZones(defZones);
      localStorage.setItem('kpsydesk_transport_zones', JSON.stringify(defZones));
    }

    const sBuses = localStorage.getItem('kpsydesk_transport_buses');
    if (sBuses) setBuses(JSON.parse(sBuses));
    else {
      const defBuses: TransportBus[] = [{ id: 'b1', plateNumber: 'DK-1234-A', capacity: 30, driverId: '', status: 'ACTIVE' }];
      setBuses(defBuses);
      localStorage.setItem('kpsydesk_transport_buses', JSON.stringify(defBuses));
    }

    const sRoutes = localStorage.getItem('kpsydesk_transport_routes');
    if (sRoutes) setRoutes(JSON.parse(sRoutes));
    else {
      const defRoutes: Route[] = [{ id: 'r1', name: 'Ligne 1 - Corniche', zoneId: 'z1', busId: 'b1', departureTime: '06:30', returnTime: '15:30' }];
      setRoutes(defRoutes);
      localStorage.setItem('kpsydesk_transport_routes', JSON.stringify(defRoutes));
    }

    const sAssigns = localStorage.getItem('kpsydesk_transport_assigns');
    if (sAssigns) setAssignments(JSON.parse(sAssigns));
  };

  // Sauvegardes
  const saveZones = (z: Zone[]) => { setZones(z); localStorage.setItem('kpsydesk_transport_zones', JSON.stringify(z)); };
  const saveBuses = (b: TransportBus[]) => { setBuses(b); localStorage.setItem('kpsydesk_transport_buses', JSON.stringify(b)); };
  const saveRoutes = (r: Route[]) => { setRoutes(r); localStorage.setItem('kpsydesk_transport_routes', JSON.stringify(r)); };
  const saveAssigns = (a: Assignment[]) => { setAssignments(a); localStorage.setItem('kpsydesk_transport_assigns', JSON.stringify(a)); };

  // Handlers pour Modales (Simplifiés via prompts pour la démo, ou directement inline)
  const addZone = () => {
    const name = window.prompt("Nom de la zone géographique (ex: Parcelles Assainies):");
    if (name) saveZones([...zones, { id: `z${Date.now()}`, name }]);
  };

  const addBus = () => {
    const plate = window.prompt("Plaque d'immatriculation (ex: DK-9999-Z):");
    const cap = window.prompt("Capacité (nombre de places):", "30");
    if (plate && cap) {
      saveBuses([...buses, { id: `b${Date.now()}`, plateNumber: plate, capacity: parseInt(cap), driverId: '', status: 'ACTIVE' }]);
    }
  };

  const addRoute = () => {
    if (zones.length === 0 || buses.length === 0) {
      alert("Créez d'abord une zone et un bus.");
      return;
    }
    const name = window.prompt("Nom de la ligne / itinéraire:");
    if (name) {
      saveRoutes([...routes, { id: `r${Date.now()}`, name, zoneId: zones[0].id, busId: buses[0].id, departureTime: '06:30', returnTime: '15:30' }]);
    }
  };

  const assignStudent = (studentId: string, routeId: string) => {
    // Vérification de capacité
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    const bus = buses.find(b => b.id === route.busId);
    if (!bus) return;

    const currentAssigns = assignments.filter(a => a.routeId === routeId).length;
    if (currentAssigns >= bus.capacity) {
      alert(`Impossible : La capacité maximale du bus (${bus.capacity} places) est atteinte pour cette ligne !`);
      return;
    }

    // Vérifier si l'élève est déjà assigné
    if (assignments.find(a => a.studentId === studentId)) {
      alert("Cet élève est déjà affecté à une ligne.");
      return;
    }

    saveAssigns([...assignments, { id: `a${Date.now()}`, studentId, routeId }]);
  };

  const removeAssignment = (studentId: string) => {
    saveAssigns(assignments.filter(a => a.studentId !== studentId));
  };

  // Stats
  const activeBuses = buses.filter(b => b.status === 'ACTIVE').length;
  const totalCapacity = buses.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalAssigned = assignments.length;
  const fillRate = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Transport Scolaire</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gérez vos itinéraires, votre flotte de bus et les affectations des élèves.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('DASHBOARD')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'DASHBOARD' ? '#0f172a' : 'transparent', color: activeTab === 'DASHBOARD' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Map size={18} /> Vue d'ensemble
        </button>
        <button 
          onClick={() => setActiveTab('ZONES')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'ZONES' ? '#0f172a' : 'transparent', color: activeTab === 'ZONES' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MapPin size={18} /> Zones & Lignes
        </button>
        <button 
          onClick={() => setActiveTab('FLEET')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'FLEET' ? '#0f172a' : 'transparent', color: activeTab === 'FLEET' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Bus size={18} /> Flotte & Chauffeurs
        </button>
        <button 
          onClick={() => setActiveTab('ASSIGNMENTS')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'ASSIGNMENTS' ? '#0f172a' : 'transparent', color: activeTab === 'ASSIGNMENTS' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Affectations
        </button>
      </div>

      {/* Vues selon l'onglet */}
      
      {activeTab === 'DASHBOARD' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <Bus size={20} /> <span style={{ fontWeight: 600 }}>Bus Actifs</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeBuses} / {buses.length}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <Users size={20} /> <span style={{ fontWeight: 600 }}>Élèves Transportés</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalAssigned}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <CheckCircle size={20} /> <span style={{ fontWeight: 600 }}>Taux de Remplissage</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: fillRate > 90 ? '#ef4444' : 'var(--text-primary)' }}>{fillRate}%</div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-page)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${fillRate}%`, height: '100%', backgroundColor: fillRate > 90 ? '#ef4444' : '#10b981' }}></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ZONES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Zones */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Zones Géographiques</h3>
              {!isReadOnly && <button onClick={addZone} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: 'none', cursor: 'pointer' }}><Plus size={16} /></button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {zones.map(z => (
                <div key={z.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} color="var(--accent)" />
                  <span style={{ fontWeight: 600 }}>{z.name}</span>
                </div>
              ))}
              {zones.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aucune zone définie.</div>}
            </div>
          </div>

          {/* Itinéraires / Lignes */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Lignes & Itinéraires</h3>
              {!isReadOnly && <button onClick={addRoute} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><Plus size={16} /> Nouvelle Ligne</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {routes.map(r => {
                const zone = zones.find(z => z.id === r.zoneId);
                const bus = buses.find(b => b.id === r.busId);
                const assignCount = assignments.filter(a => a.routeId === r.id).length;
                return (
                  <div key={r.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{r.name}</div>
                      <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {zone?.name || 'Inconnue'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Aller {r.departureTime} - Retour {r.returnTime}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '4px' }}>
                        Bus: {bus?.plateNumber || 'Aucun'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Occupation : {assignCount} / {bus?.capacity || 0}
                      </div>
                    </div>
                  </div>
                );
              })}
              {routes.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aucune ligne configurée.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FLEET' && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Flotte de Véhicules</h3>
            {!isReadOnly && <button onClick={addBus} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><Plus size={16} /> Ajouter un Bus</button>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Immatriculation</th>
                <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>Capacité</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Chauffeur Assigné</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {buses.map(b => {
                const driver = drivers.find(d => d.id === b.driverId);
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{b.plateNumber}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{b.capacity} places</td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={b.driverId || ''} 
                        onChange={(e) => {
                          const newBuses = buses.map(bus => bus.id === b.id ? { ...bus, driverId: e.target.value } : bus);
                          saveBuses(newBuses);
                        }}
                        disabled={isReadOnly}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: isReadOnly ? 'var(--bg-page)' : 'white' }}
                      >
                        <option value="">-- Assigner un chauffeur --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: b.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: b.status === 'ACTIVE' ? '#10b981' : '#f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ASSIGNMENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: isReadOnly ? '1fr' : '1fr 2fr', gap: '24px' }}>
          
          {/* Formulaire d'affectation */}
          {!isReadOnly && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Nouvelle Affectation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select id="studentSelect" style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }}>
                <option value="">-- Sélectionner un élève --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.matricule})</option>
                ))}
              </select>
              
              <select id="routeSelect" style={{ padding: '12px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }}>
                <option value="">-- Sélectionner une ligne --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <button 
                onClick={() => {
                  const s = (document.getElementById('studentSelect') as HTMLSelectElement).value;
                  const r = (document.getElementById('routeSelect') as HTMLSelectElement).value;
                  if(s && r) assignStudent(s, r);
                }}
                style={{ padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Valider l'affectation
              </button>

              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                Le système bloquera l'affectation si la jauge de capacité du bus assigné est pleine.
              </div>
            </div>
          </div>
          )}

          {/* Liste des affectations */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Élèves Inscrits au Transport</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {assignments.map(a => {
                const student = students.find(s => s.id === a.studentId);
                const route = routes.find(r => r.id === a.routeId);
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{student?.firstName} {student?.lastName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student?.matricule}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ backgroundColor: 'var(--bg-page)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {route?.name}
                      </div>
                      {!isReadOnly && (
                        <button onClick={() => removeAssignment(a.studentId)} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                          Retirer de la ligne
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {assignments.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>Aucun élève affecté.</div>}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
