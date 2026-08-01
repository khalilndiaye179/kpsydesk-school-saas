import React from 'react';
import { Activity, Cpu, Server, Database, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MonitoringView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* KPI Monitoring */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-page)', padding: '12px', borderRadius: '12px', color: 'var(--status-positive)' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uptime (30 jours)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-data)' }}>99.99%</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-page)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Charge CPU Moyenne</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-data)' }}>24%</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-page)', padding: '12px', borderRadius: '12px', color: 'var(--status-positive)' }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latence DB</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-data)' }}>12 ms</div>
          </div>
        </div>
      </div>

      {/* Logs System */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#12131A', color: '#E4E5EC', borderRadius: '16px', padding: '24px', flex: 2, minWidth: '400px', fontFamily: 'var(--font-data)', fontSize: '0.85rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} /> Logs Applicatifs en Direct
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: '#16A34A' }}>[INFO] 10:45:22 - TenantProvisioningJob: Création réussie du tenant 'Lycée Birago Diop'.</div>
            <div style={{ color: '#16A34A' }}>[INFO] 10:45:25 - DatabaseService: Migration Prisma exécutée avec succès (0ms).</div>
            <div style={{ color: '#D97706' }}>[WARN] 10:48:10 - EmailQueueService: Retard de 5s détecté dans la file d'attente SendGrid.</div>
            <div style={{ color: '#16A34A' }}>[INFO] 10:50:00 - ScheduledJob(DetectDropouts): Analyse terminée. 0 alertes générées.</div>
            <div style={{ color: '#DC2626' }}>[ERROR] 10:55:12 - AuthGuard: Tentative d'accès non autorisé sur /api/v1/platform/tenants (IP: 192.168.1.45)</div>
            <div style={{ color: '#16A34A' }}>[INFO] 11:00:00 - BackupService: Sauvegarde complète de la base de données terminée. (Taille: 450MB)</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--status-positive)' }} /> Santé des Services
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 500 }}>API Principale (NestJS)</span>
              <span style={{ color: 'var(--status-positive)', fontWeight: 600, fontSize: '0.85rem' }}>OPÉRATIONNEL</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 500 }}>Base de données (PostgreSQL 16)</span>
              <span style={{ color: 'var(--status-positive)', fontWeight: 600, fontSize: '0.85rem' }}>OPÉRATIONNEL</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 500 }}>File d'attente Emails</span>
              <span style={{ color: 'var(--status-warning)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> RALENTIE
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 500 }}>Service de Génération PDF</span>
              <span style={{ color: 'var(--status-positive)', fontWeight: 600, fontSize: '0.85rem' }}>OPÉRATIONNEL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
