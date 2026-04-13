import React, { useState } from 'react';
import { X, Ship, MapPin, Calendar, User, FileText, ArrowRight, ShieldCheck, Clock, AlertTriangle, Save } from 'lucide-react';
import './modal.css';

export default function FreightDetailModal({ isOpen, onClose, shipment, onEdit, onDelete, onRefresh }) {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    newETA: shipment?.eta || '',
    delayReason: ''
  });

  if (!isOpen || !shipment) return null;

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    const isDelayed = new Date(trackingForm.newETA) > new Date(shipment.eta) || trackingForm.delayReason.length > 0;
    
    try {
      const resp = await fetch(`http://localhost:3000/api/freight-jobs/${shipment.job_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipment,
          eta: trackingForm.newETA,
          alert: isDelayed,
          status: isDelayed ? 'Delayed' : shipment.status
        })
      });
      if (resp.ok) {
        setIsTrackingOpen(false);
        onRefresh();
      }
    } catch (e) { console.error(e); }
  };

  const handleLogOriginDocs = async () => {
    try {
      const resp = await fetch(`http://localhost:3000/api/freight-jobs/${shipment.job_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipment,
          status: 'In Transit'
        })
      });
      if (resp.ok) onRefresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon" style={{ padding: '0.4rem', borderRadius: '8px' }}><Ship size={20} /></div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Voyage Detail: #{shipment.job_id}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shipment.type} • {shipment.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {shipment.status === 'Origin' && (
              <button className="btn-primary" onClick={handleLogOriginDocs} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                Log Pre-Alert Received
              </button>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', padding: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Vessel Tracking</h3>
                {shipment.alert && <span className="badge danger">DELAYED</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{shipment.pol}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>POL</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: 'var(--border-color)', margin: '0 1rem', position: 'relative' }}>
                  <Ship size={16} style={{ position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', color: shipment.alert ? 'var(--danger-text)' : 'var(--primary-color)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{shipment.pod}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>POD</div>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Departure (ETD)</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{shipment.etd}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Arrival (ETA)</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: shipment.alert ? 'var(--danger-text)' : 'inherit' }}>{shipment.eta}</div>
                </div>
              </div>
            </div>

            {isTrackingOpen ? (
              <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Update Schedule</h4>
                <form onSubmit={handleUpdateTracking} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                   <label>Revised ETA Date <input type="text" value={trackingForm.newETA} onChange={e => setTrackingForm({...trackingForm, newETA: e.target.value})} /></label>
                   <label>Delay Reason (if any) <input placeholder="e.g. Weather / Port Congestion" value={trackingForm.delayReason} onChange={e => setTrackingForm({...trackingForm, delayReason: e.target.value})} /></label>
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }}><Save size={16} /> Update Tracking</button>
                      <button type="button" className="btn-secondary" onClick={() => setIsTrackingOpen(false)}>Cancel</button>
                   </div>
                </form>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setIsTrackingOpen(true)} style={{ width: '100%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)' }}>
                <Clock size={16} /> Update Vessel Tracking
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ fontSize: '0.875rem', margin: 0 }}>Manifest & BL</h3>
                <ShieldCheck size={18} color="var(--success-text)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vessel</label><div style={{ fontWeight: 600 }}>{shipment.vessel}</div></div>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MBL No.</label><div style={{ fontWeight: 600 }}>{shipment.mbl || 'PENDING'}</div></div>
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Detail</button>
        </div>
      </div>
    </div>
  );
}
