import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Smartphone, Clock, Users, Calendar } from 'lucide-react';
import { CardKPI } from '../shared/CardKPI';

interface MessageLog {
  id: string;
  type: 'SMS' | 'EMAIL';
  recipientGroup: string;
  subject: string;
  content: string;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
}

export const CommunicationView: React.FC = () => {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [targetClass, setTargetClass] = useState('ALL');
  const [msgType, setMsgType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const savedClasses = localStorage.getItem('kpsydesk_classes');
    if (savedClasses) setClasses(JSON.parse(savedClasses));

    const savedLogs = localStorage.getItem('kpsydesk_communication_logs');
    if (savedLogs) {
      setMessages(JSON.parse(savedLogs));
    } else {
      const defaultLogs: MessageLog[] = [
        { id: 'MSG-001', type: 'SMS', recipientGroup: 'Parents (6ème A)', subject: 'Retard exceptionnel', content: 'Le professeur de Mathématiques sera absent ce jour.', sentAt: '2023-10-15 07:30', status: 'SENT' },
        { id: 'MSG-002', type: 'EMAIL', recipientGroup: 'Tous les parents', subject: 'Convocation Réunion Parents-Professeurs', content: 'Chers parents, la réunion annuelle aura lieu ce vendredi...', sentAt: '2023-10-10 14:00', status: 'SENT' }
      ];
      setMessages(defaultLogs);
      localStorage.setItem('kpsydesk_communication_logs', JSON.stringify(defaultLogs));
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSending(true);

    // Simulation d'un envoi asynchrone (Fallback SMS/USSD)
    setTimeout(() => {
      const clsName = targetClass === 'ALL' ? 'Tous les parents' : `Parents (${classes.find(c => c.id === targetClass)?.name || 'Inconnu'})`;
      
      const newLog: MessageLog = {
        id: `MSG-${Date.now().toString().slice(-4)}`,
        type: msgType,
        recipientGroup: clsName,
        subject: msgType === 'EMAIL' ? subject : 'N/A (SMS)',
        content,
        sentAt: new Date().toLocaleString('fr-FR'),
        status: 'SENT'
      };

      const updated = [newLog, ...messages];
      setMessages(updated);
      localStorage.setItem('kpsydesk_communication_logs', JSON.stringify(updated));
      
      setSubject('');
      setContent('');
      setIsSending(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* KPI Communication */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <CardKPI label="SMS Envoyés (Mois)" value="1,240" icon={<Smartphone size={20} />} trend="+12%" isPositive={true} />
        <CardKPI label="Emails Envoyés" value="450" icon={<MessageSquare size={20} />} trend="+5%" isPositive={true} />
        <CardKPI label="Réunions Planifiées" value="12" icon={<Calendar size={20} />} trend="+2" isPositive={true} />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Formulaire d'envoi */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', flex: 1, minWidth: '350px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} style={{ color: 'var(--accent)' }}/> Diffuser un message
          </h3>
          
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setMsgType('SMS')}
                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: msgType === 'SMS' ? 'var(--bg-sidebar-active)' : 'transparent', color: msgType === 'SMS' ? 'white' : 'var(--text-primary)', fontWeight: 600 }}
              >
                <Smartphone size={18} /> SMS (Urgent)
              </button>
              <button 
                type="button" 
                onClick={() => setMsgType('EMAIL')}
                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: msgType === 'EMAIL' ? 'var(--bg-sidebar-active)' : 'transparent', color: msgType === 'EMAIL' ? 'white' : 'var(--text-primary)', fontWeight: 600 }}
              >
                <MessageSquare size={18} /> Email (Détaillé)
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Destinataires</label>
              <select value={targetClass} onChange={e => setTargetClass(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}>
                <option value="ALL">Tous les parents de l'établissement</option>
                {classes.map(c => <option key={c.id} value={c.id}>Parents d'élèves : {c.name}</option>)}
              </select>
            </div>

            {msgType === 'EMAIL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sujet de l'email</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Convocation" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contenu du message</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                required 
                rows={5}
                placeholder={msgType === 'SMS' ? "Message court (160 caractères max)..." : "Corps du mail..."}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', resize: 'none', fontFamily: 'inherit' }} 
              />
              {msgType === 'SMS' && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{content.length} / 160 caractères</span>}
            </div>

            <button disabled={isSending} type="submit" style={{ padding: '14px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSending ? 0.7 : 1 }}>
              {isSending ? <Clock size={18} className="spin" /> : <Send size={18} />}
              {isSending ? 'Envoi en cours...' : 'Envoyer la communication'}
            </button>
          </form>
        </div>

        {/* Historique */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', flex: 2, minWidth: '400px' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', marginBottom: '24px' }}>Historique d'envoi</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {msg.type === 'SMS' ? <Smartphone size={16} style={{ color: 'var(--text-secondary)' }} /> : <MessageSquare size={16} style={{ color: 'var(--text-secondary)' }} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{msg.type} → {msg.recipientGroup}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{msg.sentAt}</span>
                </div>
                {msg.type === 'EMAIL' && <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sujet : {msg.subject}</div>}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {msg.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: msg.status === 'SENT' ? 'var(--status-positive)' : 'var(--status-warning)' }}>
                    {msg.status === 'SENT' ? '✓ Délivré' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
