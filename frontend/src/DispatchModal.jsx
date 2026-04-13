import React, { useState } from 'react';
import { X, Truck, User, Save, Building2 } from 'lucide-react';
import './modal.css';

export default function DispatchModal({ isOpen, onClose, trip, vendors, onDispatch }) {
  const [formData, setFormData] = useState({
    truck: '',
    driver: '',
    vendor: ''
  });

  if (!isOpen || !trip) return null;

  const truckingVendors = vendors.filter(v => v.type === 'Trucking');

  const handleSubmit = (e) => {
    e.preventDefault();
    onDispatch(trip.id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card small-modal">
        <div className="modal-header">
          <h2>Dispatch Trip: #{trip.job}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            <label>Select Trucking Vendor *
              <select required value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})}>
                <option value="">Select Vendor...</option>
                {truckingVendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </label>
            <label>Vehicle / Truck Number *
              <input required placeholder="e.g. MH-43-AK-1234" value={formData.truck} onChange={e => setFormData({...formData, truck: e.target.value})} />
            </label>
            <label>Assigned Driver Name *
              <input required placeholder="Full Name" value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} />
            </label>
          </div>
          <div className="modal-footer" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Truck size={16} /> Confirm Dispatch</button>
          </div>
        </form>
      </div>
    </div>
  );
}
