import React, { useState } from 'react';
import { BookOpen, UserPlus, DollarSign, FileText, Settings, Search, ChevronRight, HelpCircle } from 'lucide-react';

export const TenantGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demarrage');

  const tabs = [
    { id: 'demarrage', label: 'Démarrage Rapide', icon: <Zap size={18} /> },
    { id: 'eleves', label: 'Gestion des Élèves', icon: <UserPlus size={18} /> },
    { id: 'finances', label: 'Finances & Scolarité', icon: <DollarSign size={18} /> },
    { id: 'pedagogie', label: 'Pédagogie & Notes', icon: <FileText size={18} /> },
    { id: 'parametres', label: 'Configuration', icon: <Settings size={18} /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'demarrage':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', margin: '0 0 8px 0' }}>Bienvenue sur KPsyDesk ! 🚀</h3>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Ce guide vous accompagne pas à pas pour prendre en main votre plateforme de gestion scolaire. 
              Pour bien démarrer, nous vous conseillons de suivre ces 3 étapes essentielles :
            </p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>1</div>
                Configurer votre école
              </h4>
              <p style={{ margin: '0 0 16px 28px', color: '#475569', lineHeight: '1.5' }}>Allez dans le menu <strong>Configuration</strong> pour définir vos classes, les matières enseignées et les montants des scolarités selon les niveaux.</p>

              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>2</div>
                Inscrire les élèves
              </h4>
              <p style={{ margin: '0 0 16px 28px', color: '#475569', lineHeight: '1.5' }}>Naviguez vers <strong>Inscriptions</strong> pour ajouter vos élèves un par un, ou utiliser notre outil d'import massif (si disponible dans votre plan).</p>

              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>3</div>
                Gérer les paiements
              </h4>
              <p style={{ margin: '0 0 0 28px', color: '#475569', lineHeight: '1.5' }}>Rendez-vous dans <strong>Finances - Comptabilité</strong> pour encaisser les droits d'inscription et générer les premiers reçus.</p>
            </div>
          </div>
        );
      
      case 'eleves':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', margin: '0 0 8px 0' }}>Gestion des Élèves et Inscriptions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#166534', margin: '0 0 12px 0', fontSize: '1.1rem' }}>Ajouter un élève</h4>
                <p style={{ color: '#14532d', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                  Dans le module <strong>Inscriptions</strong>, cliquez sur le bouton "Nouvelle Inscription". Remplissez les informations personnelles de l'élève ainsi que celles de son tuteur légal. Assignez-le ensuite à une classe.
                </p>
              </div>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#1e40af', margin: '0 0 12px 0', fontSize: '1.1rem' }}>Historique et Dossier</h4>
                <p style={{ color: '#1e3a8a', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                  Le <strong>Dossier Élève</strong> regroupe tout : ses notes, ses paiements, ses absences et ses documents numérisés (acte de naissance, certificats...).
                </p>
              </div>
            </div>
          </div>
        );

      case 'finances':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', margin: '0 0 8px 0' }}>Finances & Comptabilité</h3>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
              La trésorerie est le cœur de votre établissement. KPsyDesk vous permet de suivre chaque franc qui entre ou sort.
            </p>
            <ul style={{ padding: '0 0 0 20px', margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1rem', lineHeight: '1.5' }}>
              <li><strong>Scolarité :</strong> Encaissez les mensualités directement depuis le dossier de l'élève ou le module Caisse. Un reçu est généré automatiquement.</li>
              <li><strong>Dépenses :</strong> Saisissez vos factures fournisseurs, salaires et autres charges dans l'onglet Dépenses pour avoir un vrai bilan comptable.</li>
              <li><strong>Rapports :</strong> Le tableau de bord financier vous indique les retards de paiement (impayés) pour vous aider dans vos relances.</li>
            </ul>
          </div>
        );

      case 'pedagogie':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', margin: '0 0 8px 0' }}>Évaluations & Bulletins</h3>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Automatisez le calcul des moyennes et l'édition des bulletins de fin de trimestre.
            </p>
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '24px', borderRadius: '12px', marginTop: '12px' }}>
              <h4 style={{ color: '#c2410c', margin: '0 0 12px 0', fontSize: '1.1rem' }}>Comment générer un bulletin ?</h4>
              <ol style={{ padding: '0 0 0 20px', margin: 0, color: '#9a3412', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                <li>Assurez-vous que toutes les notes de la période ont été saisies dans <strong>Évaluations</strong>.</li>
                <li>Allez dans le module <strong>Bulletins</strong>.</li>
                <li>Sélectionnez la classe et le trimestre/semestre souhaité.</li>
                <li>Cliquez sur "Calculer les moyennes". KPsyDesk appliquera les coefficients automatiquement.</li>
                <li>Imprimez les bulletins en PDF (avec le logo de votre école).</li>
              </ol>
            </div>
          </div>
        );

      case 'parametres':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '1.4rem', margin: '0 0 8px 0' }}>Paramètres de l'école</h3>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
              C'est ici que vous personnalisez l'application pour qu'elle corresponde exactement à votre établissement.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1rem' }}>Matières & Coeffs</h5>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Définissez les matières et attribuez-les aux classes avec leurs coefficients.</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1rem' }}>Année Scolaire</h5>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Passez facilement d'une année scolaire à l'autre sans perdre votre historique.</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1rem' }}>Utilisateurs</h5>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Ajoutez vos surveillants et comptables et limitez leurs droits d'accès.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={32} color="#2563eb" /> Guide d'Utilisation
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>
            Consultez notre base de connaissances pour maîtriser KPsyDesk.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Rechercher une aide..." 
            style={{ padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Sidebar Navigation */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 12px', marginBottom: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Thématiques
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px',
                backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#475569',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 500,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {tab.icon}
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight size={16} />}
            </button>
          ))}
          
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed #e2e8f0', padding: '24px 12px 12px 12px', textAlign: 'center' }}>
            <HelpCircle size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
            <h5 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Besoin d'aide ?</h5>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px 0' }}>Notre équipe technique est à votre disposition.</p>
            <button style={{ width: '100%', padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Contacter le Support
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', minHeight: '500px' }}>
          {renderContent()}
        </div>

      </div>

    </div>
  );
};

const Zap = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
