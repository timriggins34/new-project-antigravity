import React from 'react';
import { X, Briefcase, Trash2, Ship, Airplay, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import SmartChecklist from './SmartChecklist';
import './modal.css';

export default function MasterJobDetailModal({ isOpen, onClose, job, onDelete, authFetch, onRefresh }) {
  if (!isOpen || !job) return null;

  const handleDelete = () => {
    if (window.confirm(`ARE YOU SURE? This will permanently delete Master Job ${job.jobNo} and ALL its compliance checklists. This action cannot be undone.`)) {
      onDelete(job.id);
    }
  };

  const doneCount = job.checklists?.filter(c => c.status === 'DONE').length || 0;
  const verifyCount = job.checklists?.filter(c => c.status === 'VERIFY').length || 0;
  const totalCount = job.checklists?.length || 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card large-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={22} className="text-primary" />
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Master Job: {job.jobNo}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.client?.name} • {job.direction}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon delete" onClick={handleDelete} title="Delete Master Job">
              <Trash2 size={20} />
            </button>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', padding: '1.5rem' }}>
          
          {/* Summary Sidebar */}
          <div className="detail-sidebar">
            <div className="glass-card" style={{ padding: '1.25rem', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <h3 className="section-title" style={{ fontSize: '0.9rem' }}>Job Profile</h3>
              
              <div className="profile-grid">
                <div className="profile-item">
                  <span className="label">Client</span>
                  <span className="value">{job.client?.name}</span>
                </div>
                <div className="profile-item">
                  <span className="label">Mode & Direction</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {job.mode === 'Sea' ? <Ship size={14} /> : <Airplay size={14} />}
                    {job.mode} {job.direction}
                  </span>
                </div>
                <div className="profile-item">
                  <span className="label">Incoterm</span>
                  <span className="value">{job.incoterm}</span>
                </div>
                <div className="profile-item">
                  <span className="label">HS Code</span>
                  <span className="value">{job.hsCode || 'Not specified'}</span>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3 className="section-title" style={{ fontSize: '0.9rem' }}>Compliance Summary</h3>
                <div className="stats-row" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <div className="stat-mini">
                    <CheckCircle size={14} className="text-success" />
                    <span>{doneCount}</span>
                  </div>
                  <div className="stat-mini">
                    <Clock size={14} className="text-warning" />
                    <span>{verifyCount}</span>
                  </div>
                  <div className="stat-mini">
                    <AlertCircle size={14} className="text-danger" />
                    <span>{totalCount - doneCount - verifyCount}</span>
                  </div>
                </div>
                
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(doneCount / (totalCount || 1)) * 100}%` }}
                  ></div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                  {Math.round((doneCount / (totalCount || 1)) * 100)}% Documentation Ready
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Main Content */}
          <div className="detail-main" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
             <SmartChecklist 
               masterJobId={job.id} 
               authFetch={authFetch} 
               onUpdate={onRefresh} 
             />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Detail</button>
        </div>
      </div>
    </div>
  );
}
