import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

const MODES = ['Sea Import', 'Air Import', 'Sea Export', 'Air Export'];
const STATUSES = ['Booked', 'Origin', 'In Transit', 'Arrived', 'Delayed', 'Cancelled'];

const EMPTY = {
  job_id: '',
  mbl: '',
  awb: '',
  type: 'Sea Import',
  pol: '',
  pod: '',
  vessel: '',
  etd: '',
  eta: '',
  status: 'Booked',
  alert: false
};

export default function FreightFormModal({ isOpen, onClose, onSuccess, initialData }) {
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData });
    } else {
      setForm(EMPTY);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/freight/${initialData.id}` : 'http://localhost:3000/api/freight';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setForm(EMPTY);
      } else {
        alert(`Failed to ${isEdit ? 'update' : 'save'} freight shipment.`);
      }
    } catch {
      alert('Error saving freight shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Shipment' : 'Create New Shipment'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3 className="section-title">F.1 Shipment Reference</h3>
            <div className="form-grid">
              <label>Job ID *
                <input required name="job_id" placeholder="e.g. FRT-9009" value={form.job_id} onChange={handleChange} />
              </label>
              <label>Shipment Mode *
                <select name="type" value={form.type} onChange={handleChange}>
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label>MBL Number
                <input name="mbl" placeholder="Ocean Bill of Lading" value={form.mbl} onChange={handleChange} />
              </label>
              <label>AWB Number
                <input name="awb" placeholder="Airway Bill Number" value={form.awb} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">F.2 Routing & Vessel</h3>
            <div className="form-grid">
              <label>Port of Loading (POL) *
                <input required name="pol" placeholder="e.g. Shanghai, CNSHA" value={form.pol} onChange={handleChange} />
              </label>
              <label>Port of Delivery (POD) *
                <input required name="pod" placeholder="e.g. Nhava Sheva, INNSA" value={form.pod} onChange={handleChange} />
              </label>
              <label>Vessel / Flight *
                <input required name="vessel" placeholder="e.g. MSC EMANUELA" value={form.vessel} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">F.3 Schedule & Status</h3>
            <div className="form-grid">
              <label>ETD (Departure)
                <input name="etd" placeholder="e.g. 15-May-2024" value={form.etd} onChange={handleChange} />
              </label>
              <label>ETA (Arrival) *
                <input required name="eta" placeholder="e.g. 04-June-2024" value={form.eta} onChange={handleChange} />
              </label>
              <label>Current Status *
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" name="alert" checked={form.alert} onChange={handleChange} style={{ width: 'auto', accentColor: 'var(--danger-text)' }} />
                <span>Flag for Alert</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16} /> {initialData ? 'Update Shipment' : 'Save Shipment'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

