import { X, Truck, MapPin, User, Clock, AlertTriangle, CheckCircle2, Phone, Navigation, ArrowRight, FileText } from 'lucide-react';
import './modal.css';

export default function LogisticsDetailModal({ isOpen, onClose, trip, onEdit, onDelete }) {
  if (!isOpen || !trip) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon" style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}><Truck size={20} color="var(--success-text)" /></div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Trip: {trip.truck}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job #{trip.job} • {trip.status === 'enroute' ? 'En Route' : 'Pending Dispatch'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" title="Edit Trip" onClick={() => { onEdit(); onClose(); }}><FileText size={18} /></button>
            <button className="btn-icon reject" title="Delete Trip" onClick={() => { onDelete(); onClose(); }} style={{ color: 'var(--danger-text)' }}><X size={20} /></button>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', padding: '1.5rem' }}>
          
          {/* Left Column: Map/Route View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              height: '300px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
               <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Navigation size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <div style={{ fontSize: '0.875rem' }}>Map Preview: {trip.from} to {trip.to}</div>
               </div>
               
               {/* Mock Route Line */}
               <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', height: '4px', background: 'var(--border-color)', borderRadius: '2px' }}>
                  <div style={{ width: trip.status === 'enroute' ? '65%' : '0%', height: '100%', background: 'var(--primary-color)', borderRadius: '2px', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '-8px', top: '-14px', background: 'white', borderRadius: '50%', padding: '4px', border: '2px solid var(--primary-color)' }}>
                       <Truck size={12} color="var(--primary-color)" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="form-grid">
               <div className="glass-card" style={{ padding: '1rem', background: 'var(--bg-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Origin</span>
                  <div style={{ fontWeight: 600 }}>{trip.from}</div>
               </div>
               <div className="glass-card" style={{ padding: '1rem', background: 'var(--bg-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Destination</span>
                  <div style={{ fontWeight: 600 }}>{trip.to}</div>
               </div>
            </div>
          </div>

          {/* Right Column: Driver & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                <h3 className="section-title" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Driver & Fleet Details</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                   <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>{trip.driver.split(' ').map(n=>n[0]).join('')}</div>
                   <div>
                     <div style={{ fontWeight: 700 }}>{trip.driver}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Internal Personnel</div>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <Phone size={14} color="var(--primary-color)" />
                      <span>+91 98765 43210</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <ShieldCheck size={14} color="var(--success-text)" />
                      <span>Vehicle Verified (Valid PUC/RC)</span>
                   </div>
                </div>
             </div>

             {trip.delayed && (
               <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-text)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                  <AlertTriangle size={20} color="var(--danger-text)" />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--danger-text)', fontSize: '0.875rem' }}>Delay Alert</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Congestion at Terminal Gate 4. Impact: 2hrs+</div>
                  </div>
               </div>
             )}

             <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                <h3 className="section-title" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Timeline</h3>
                <div style={{ fontSize: '0.875rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>ETA</span>
                      <span style={{ fontWeight: 600, color: trip.delayed ? 'var(--danger-text)' : 'var(--success-text)' }}>{trip.eta}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Assigned Date</span>
                      <span style={{ color: 'var(--text-muted)' }}>Oct 12, 2023</span>
                   </div>
                </div>
             </div>
             
             <button className="btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Update GPS Segment <ArrowRight size={16} /></button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary">Confirm Delivery</button>
        </div>
      </div>
    </div>
  );
}
