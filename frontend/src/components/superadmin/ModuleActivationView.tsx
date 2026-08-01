import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, ToggleLeft, ToggleRight, Search } from 'lucide-react';

interface TenantModule {
  tenantId: string;
  tenantName: string;
  modules: {
    offlineMode: boolean; // Vague 1
    parentPortal: boolean; // Vague 2
    proCertificates: boolean; // Vague 3
    aiScheduling: boolean; // Vague 4
    complianceExport: boolean; // Vague 5
  }
}

export const ModuleActivationView: React.FC = () => {
  const [tenantModules, setTenantModules] = useState<TenantModule[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedConfig = localStorage.getItem('kpsydesk_tenant_modules');
    if (savedConfig) {
      setTenantModules(JSON.parse(savedConfig));
    } else {
      const defaultConfig: TenantModule[] = [
        { 
          tenantId: '1', 
          tenantName: "Lycée d'Excellence Birago Diop", 
          modules: { offlineMode: true, parentPortal: true, proCertificates: false, aiScheduling: true, complianceExport: true } 
        },
        { 
          tenantId: '2', 
          tenantName: "Groupe Scolaire Les Pédagogues", 
          modules: { offlineMode: true, parentPortal: false, proCertificates: false, aiScheduling: false, complianceExport: false } 
        },
        { 
          tenantId: '3', 
          tenantName: "Institut Supérieur de Management", 
          modules: { offlineMode: false, parentPortal: false, proCertificates: true, aiScheduling: false, complianceExport: true } 
        }
      ];
      setTenantModules(defaultConfig);
      localStorage.setItem('kpsydesk_tenant_modules', JSON.stringify(defaultConfig));
    }
  }, []);

  const toggleModule = (tenantId: string, moduleKey: keyof TenantModule['modules']) => {
    const updated = tenantModules.map(tm => {
      if (tm.tenantId === tenantId) {
        return {
          ...tm,
          modules: { ...tm.modules, [moduleKey]: !tm.modules[moduleKey] }
        };
      }
      return tm;
    });
    setTenantModules(updated);
    localStorage.setItem('kpsydesk_tenant_modules', JSON.stringify(updated));
  };

  const filteredTenants = tenantModules.filter(tm => tm.tenantName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--accent)' }}/>
              Activation des Modules (Feature Flags)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Activez ou désactivez les fonctionnalités différenciantes pour chaque établissement.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-page)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Search size={18} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Rechercher un tenant..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '200px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '250px' }}>Établissement</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Mode Hors-Ligne (V1)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Portail Parents (V2)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Certifs Pro (V3)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Emploi du temps IA (V4)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Export Légal (V5)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map(tm => (
                <tr key={tm.tenantId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>{tm.tenantName}</td>
                  
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button onClick={() => toggleModule(tm.tenantId, 'offlineMode')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.modules.offlineMode ? 'var(--status-positive)' : 'var(--text-secondary)' }}>
                      {tm.modules.offlineMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>
                  
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button onClick={() => toggleModule(tm.tenantId, 'parentPortal')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.modules.parentPortal ? 'var(--status-positive)' : 'var(--text-secondary)' }}>
                      {tm.modules.parentPortal ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>

                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button onClick={() => toggleModule(tm.tenantId, 'proCertificates')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.modules.proCertificates ? 'var(--status-positive)' : 'var(--text-secondary)' }}>
                      {tm.modules.proCertificates ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>

                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button onClick={() => toggleModule(tm.tenantId, 'aiScheduling')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.modules.aiScheduling ? 'var(--status-positive)' : 'var(--text-secondary)' }}>
                      {tm.modules.aiScheduling ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>

                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button onClick={() => toggleModule(tm.tenantId, 'complianceExport')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.modules.complianceExport ? 'var(--status-positive)' : 'var(--text-secondary)' }}>
                      {tm.modules.complianceExport ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
