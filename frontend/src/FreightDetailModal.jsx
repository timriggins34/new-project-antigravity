import React from 'react';
import { X, Ship, MapPin, Calendar, User, FileText, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import './modal.css';

export default function FreightDetailModal({ isOpen, onClose, shipment, onEdit, onDelete }) {
  if (!isOpen || !shipment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon" style={{ padding: '0.4rem', borderRadius: '8px' }}><Ship size={20} /></div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Shipment #{shipment.id}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shipment.type} • {shipment.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" title="Edit Shipment" onClick={() => { onEdit(); onClose(); }}><FileText size={18} /></button>
            <button className="btn-icon reject" title="Delete Shipment" onClick={() => { onDelete(); onClose(); }} style={{ color: 'var(--danger-text)' }}><X size={20} /></button>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '1.5rem' }}>
          
          {/* Left: Journey & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <h3 className="section-title" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Voyage Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{shipment.pol}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Port of Loading</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: 'var(--border-color)', margin: '0 1rem', position: 'relative' }}>
                  <Ship size={16} style={{ position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', color: 'var(--primary-color)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{shipment.pod}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Port of Discharge</div>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ETD / Sailing</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{shipment.etd}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ETA / Arrival</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{shipment.eta}</div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <h3 className="section-title" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Cargo & BL Info</h3>
              <div className="form-grid">
                <div>
                  <label style={{ fontSize: '0.7rem' }}>Vessel / Voyage</label>
                  <div style={{ fontWeight: 600 }}>CMA CGM ANTOINE #V.2341</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem' }}>Master BL No.</label>
                  <div style={{ fontWeight: 600 }}>{shipment.mbl}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem' }}>House BL No.</label>
                  <div style={{ fontWeight: 600 }}>{shipment.hbl}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem' }}>Inventory Status</label>
                  <div style={{ fontWeight: 600, color: 'var(--success-text)' }}>Grounded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Docs & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ fontSize: '0.875rem', margin: 0 }}>Documents</h3>
                <ShieldCheck size={18} color="var(--success-text)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['MBL Copy', 'House BL', 'Container List'].map((doc, i) => (
                  <div key={i} className="doc-item" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <FileText size={14} /> {doc}.pdf
                    </div>
                    <ArrowRight size={14} style={{ opacity: 0.5 }}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <h3 className="section-title" style={{ fontSize: '0.875rem', color: 'var(--info-text)' }}>Last Event</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Clock size={20} color="var(--info-text)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Vessel Berthing Confirmed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated 2 hours ago by terminal API</div>
                </div>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Manage Logistics <ArrowRight size={16} /></button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary">Update Status</button>
        </div>
      </div>
    </div>
  );
}
