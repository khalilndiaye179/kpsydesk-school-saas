import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, CheckCircle, GraduationCap, DollarSign, Calendar, Activity, Briefcase } from 'lucide-react';
import { formatAmount } from '../../lib/format';
import { TENANT_KEY_PREFIXES, getActiveTenantId, readStored, tenantScopedKey } from '../../lib/storage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface Student {
  id: string;
  className: string;
  classId?: string;
}

interface Staff {
  id: string;
  role: string;
}

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalStaff: 0,
    attendanceRate: 94.5 // Mock for now
  });

  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [classDistribution, setClassDistribution] = useState<Record<string, number>>({});
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // Load Students
    const students = readStored<Student[]>('kpsydesk_students', []);
    const dist: Record<string, number> = {};
    students.forEach(s => {
      const cls = s.className || 'Non assigné';
      dist[cls] = (dist[cls] || 0) + 1;
    });
    setClassDistribution(dist);

    const activeTenantId = getActiveTenantId();

    // Load Payments isolés
    const payments = readStored<Payment[]>(tenantScopedKey(TENANT_KEY_PREFIXES.payments, activeTenantId), []);
    
    // Sort and get recent payments
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentPayments(sortedPayments.slice(0, 5));

    let revenue = 0;
    const revArray = [1200000, 1500000, 1350000, 1600000, 1400000, 1550000, 1650000, 1200000, 1800000, 1900000, 0, 0]; // Mock previous months
    payments.forEach(p => {
      if (p.status === 'PAID') {
        revenue += p.amount;
        // In a real app, parse the date and add to the specific month
        const monthIndex = new Date(p.date).getMonth();
        revArray[monthIndex] = (revArray[monthIndex] || 0) + p.amount;
      }
    });
    setMonthlyRevenue(revArray);

    // Load Staff isolé
    const users = readStored<Staff[]>(tenantScopedKey(TENANT_KEY_PREFIXES.users, activeTenantId), []);
    const staffCount = users.filter(u => !['STUDENT', 'PARENT'].includes(u.role)).length;

    setStats({
      totalStudents: students.length,
      totalRevenue: revenue,
      totalStaff: staffCount,
      attendanceRate: 94.5
    });

  }, []);

  // --- Configuration des Graphiques ---

  const barChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: monthlyRevenue,
        backgroundColor: 'rgba(56, 189, 248, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: Object.keys(classDistribution),
    datasets: [
      {
        data: Object.values(classDistribution),
        backgroundColor: [
          '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#fbbf24', '#34d399'
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { boxWidth: 12, usePointStyle: true } }
    }
  };

  // --- Composant KPI ---
  const KpiCard = ({ title, value, icon, trend, colorClass }: { title: string, value: string, icon: React.ReactNode, trend: string, colorClass: string }) => (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        <div className={colorClass} style={{ padding: '8px', borderRadius: '12px', display: 'flex' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600 }}>{trend}</span> 
        par rapport au mois dernier
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 4 KPIs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <KpiCard 
          title="Chiffre d'Affaires" 
          value={formatAmount(stats.totalRevenue)} 
          icon={<DollarSign size={20} color="#38bdf8" />} 
          trend="+12.5%" 
          colorClass="bg-blue-100" 
        />
        <KpiCard 
          title="Effectif Total" 
          value={`${stats.totalStudents}`} 
          icon={<Users size={20} color="#818cf8" />} 
          trend="+4.2%" 
          colorClass="bg-indigo-100" 
        />
        <KpiCard 
          title="Taux de Présence" 
          value={`${stats.attendanceRate}%`} 
          icon={<CheckCircle size={20} color="#10b981" />} 
          trend="+1.8%" 
          colorClass="bg-green-100" 
        />
        <KpiCard 
          title="Personnel Actif" 
          value={`${stats.totalStaff}`} 
          icon={<Briefcase size={20} color="#f59e0b" />} 
          trend="Stable" 
          colorClass="bg-yellow-100" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Graphique des revenus */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Évolution des Revenus</h3>
            <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}>
              <option>Année 2026</option>
              <option>Année 2025</option>
            </select>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Graphique de répartition */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem' }}>Répartition par Classe</h3>
          {Object.keys(classDistribution).length > 0 ? (
            <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
               Aucune donnée d'élève.
             </div>
          )}
        </div>
      </div>

      {/* Activités récentes */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Derniers Paiements Enregistrés</h3>
          <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Voir tout</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Réf.</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Montant</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{p.id}</td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{formatAmount(p.amount)}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.date}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: p.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: p.status === 'PAID' ? '#10b981' : '#f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.status === 'PAID' ? 'Payé' : 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
            {recentPayments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun paiement récent.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
