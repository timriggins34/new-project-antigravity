import React from 'react';
import { X, Package, MapPin, User, Clock, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import './modal.css';

export default function ClearanceDetailModal({ isOpen, onClose, job, onEdit, onDelete }) {
  if (!isOpen || !job) return null;

  const steps = [
    { name: 'Filing', desc: 'Checklist & Document Indexing' },
    { name: 'Assessment', desc: 'Customs Verification & Query' },
    { name: 'Duty', desc: 'Challan Generation & Payment' },
    { name: 'Exam', desc: 'Physical Inspection & Cargo Release' },
    { name: 'OOC', desc: 'Out of Charge (Cleared)' }
  ];

  const currentStepIdx = steps.findIndex(s => s.name === job.stage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon" style={{ padding: '0.4rem', borderRadius: '8px' }}><Package size={20} /></div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Job #{job.id} Detail</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.client} • {job.type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" title="Edit Job" onClick={() => { onEdit(); onClose(); }}><FileText size={18} /></button>
            <button className="btn-icon reject" title="Delete Job" onClick={() => { onDelete(); onClose(); }} style={{ color: 'var(--danger-text)' }}><X size={20} /></button>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', padding: '1.5rem' }}>
          
          {/* Left Column: Progress & Timeline */}
          <div>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Clearance Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1rem' }}>
              <div style={{ position: 'absolute', left: '1.5rem', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx || (job.status === 'completed' && idx === currentStepIdx);
                const isCurrent = idx === currentStepIdx && job.status !== 'completed';
                const isPending = idx > currentStepIdx;

                return (
                  <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--success-text)' : isCurrent ? 'var(--primary-color)' : 'var(--bg-color)',
                      border: `2px solid ${isCompleted ? 'var(--success-text)' : isCurrent ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : (idx + 1)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: isCurrent ? 'var(--text-main)' : 'inherit' }}>{step.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                      {isCurrent && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--info-bg)', borderRadius: '4px', fontSize: '0.75rem', borderLeft: '3px solid var(--info-text)' }}>
                          {job.alert ? '⚠️ Action Required: Resolve pending document queries' : 'Current active stage'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipment Info</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Port</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job.port}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Assigned</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job.assigned}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Last Updated</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job.date}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
               <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents (3)</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <FileText size={16} color="var(--primary-color)" />
                    <span style={{ flex: 1 }}>Commercial Invoice</span>
                    <CheckCircle2 size={14} color="var(--success-text)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <FileText size={16} color="var(--primary-color)" />
                    <span style={{ flex: 1 }}>Packing List</span>
                    <CheckCircle2 size={14} color="var(--success-text)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <FileText size={16} color="var(--primary-color)" />
                    <span style={{ flex: 1 }}>Bill of Lading</span>
                    <Clock size={14} color="var(--warning-text)" />
                  </div>
               </div>
            </div>

            <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
              Manage Documents <ArrowRight size={16} />
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => { alert('Advancing job...'); onClose(); }}>Next Action: Advance Stage</button>
        </div>
      </div>
    </div>
  );
}
