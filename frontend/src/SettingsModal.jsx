import React from 'react';
import { X, User, Shield, Bell, Database, Globe, Sliders } from 'lucide-react';
import './modal.css';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sections = [
    { id: 'profile', label: 'User Profile', icon: User, desc: 'Manage your personal details and avatar.' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Update passwords and two-factor authentication.' },
    { id: 'notifs', label: 'Notifications', icon: Bell, desc: 'Configure system alerts and email preferences.' },
    { id: 'data', label: 'Data & Sync', icon: Database, desc: 'Manage database connection and API keys.' },
    { id: 'general', label: 'General', icon: Globe, desc: 'Language, timezone and display settings.' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sliders size={20} color="var(--primary-color)" />
            <h2>System Settings</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', padding: '1.5rem', height: '600px' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
            {sections.map(s => (
              <button 
                key={s.id} 
                className={`nav-item ${s.id === 'profile' ? 'active' : ''}`} 
                style={{ width: '100%', border: 'none', background: 'none' }}
              >
                <s.icon size={18} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                  <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>JD</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>John Doe</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Operations Manager • TradeFlow CHA</div>
                    <button className="btn-secondary" style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Change Avatar</button>
                  </div>
               </div>

               <div className="form-grid">
                  <label>Full Name <input value="John Doe" disabled /></label>
                  <label>Email Address <input value="john.doe@tradeflow.in" disabled /></label>
                  <label>Organization <input value="TradeFlow Logistics Solutions" disabled /></label>
                  <label>Role <input value="Operations Manager" disabled /></label>
               </div>
               
               <div style={{ padding: '1rem', border: '1px solid var(--warning-text)', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', display: 'flex', gap: '0.75rem' }}>
                  <Bell size={20} color="var(--warning-text)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--warning-text)', fontSize: '0.875rem' }}>Security Notice</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last password change was 45 days ago. We recommend changing it periodically.</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={onClose}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
