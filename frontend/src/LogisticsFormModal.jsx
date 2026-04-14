import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

const STATUSES = ['dispatch', 'enroute', 'arrived'];

const EMPTY = {
  trip_id: '',
  job: '',
  truck: '',
  driver: '',
  from: '',
  to: '',
  status: 'dispatch',
  eta: '',
  delayed: false,
  assignedToId: ''
};

export default function LogisticsFormModal({ isOpen, onClose, onSuccess, initialData, employees }) {
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
    const url = isEdit ? `http://localhost:3000/api/logistics-trips/${initialData.id}` : 'http://localhost:3000/api/logistics-trips';
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
        alert(`Failed to ${isEdit ? 'update' : 'save'} logistics trip.`);
      }
    } catch {
      alert('Error saving logistics trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Logistics Trip' : 'Create New Logistics Trip'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3 className="section-title">L.1 Trip Identity</h3>
            <div className="form-grid">
              <label>Trip ID *
                <input required name="trip_id" placeholder="e.g. TRP-109" value={form.trip_id} onChange={handleChange} />
              </label>
              <label>Clearance Job ID *
                <input required name="job" placeholder="e.g. IMP-8802" value={form.job} onChange={handleChange} />
              </label>
              <label>Truck Number / ID *
                <input required name="truck" placeholder="e.g. MH-01-XY-1234" value={form.truck} onChange={handleChange} />
              </label>
              <label>Driver Name *
                <input required name="driver" placeholder="e.g. Rajesh Kumar" value={form.driver} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">L.2 Route & Schedule</h3>
            <div className="form-grid">
              <label>From (Pickup) *
                <input required name="from" placeholder="e.g. CFS Nhava Sheva" value={form.from} onChange={handleChange} />
              </label>
              <label>To (Destination) *
                <input required name="to" placeholder="e.g. Warehouse Bhiwandi" value={form.to} onChange={handleChange} />
              </label>
              <label>Status *
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="dispatch">Pending Dispatch</option>
                  <option value="enroute">En Route</option>
                  <option value="arrived">Arrived</option>
                </select>
              </label>
              <label>Assigned To
                <select name="assignedToId" value={form.assignedToId} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </label>
              <label>ETA / Arrival Time
                <input name="eta" placeholder="e.g. Today 18:00" value={form.eta} onChange={handleChange} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" name="delayed" checked={form.delayed} onChange={handleChange} style={{ width: 'auto', accentColor: 'var(--danger-text)' }} />
                <span>Flag as Delayed</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16} /> {initialData ? 'Update Trip' : 'Create Trip'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

