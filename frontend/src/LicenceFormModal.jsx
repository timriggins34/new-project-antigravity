import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

const LICENCE_TYPES = [
  'EPCG', 'Advance Auth.', 'AEO T1', 'AEO T2', 'FSSAI Import Lic.',
  'LUT 2024-25', 'IEC Modification', 'SEIS', 'RoSCTL', 'Drawback', 'Other'
];

const EMPTY = {
  client: '', type: 'EPCG', status: 'Active',
  expiry: '', utilized: '', alert: false,
};

export default function LicenceFormModal({ isOpen, onClose, onSuccess, initialData, authFetch }) {
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        utilized: initialData.utilized === null ? '' : initialData.utilized
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: inputType === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/licences/${initialData.id}` : 'http://localhost:3000/api/licences';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...form,
      utilized: form.utilized !== '' ? parseInt(form.utilized, 10) : null,
    };
    try {
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        onSuccess(); 
        onClose(); 
        setForm(EMPTY); 
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to save licence.'}`);
      }
    } catch { 
      alert('Network error: Could not reach the server.'); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Licence / Certificate' : 'Add New Licence / Certificate'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-section">
            <h3 className="section-title">L.1 Licence Details</h3>
            <div className="form-grid">
              <label>Client Name *
                <input required name="client" placeholder="e.g. Alpha Manufacturing Ltd" value={form.client} onChange={handleChange} />
              </label>
              <label>Licence / Certificate Type *
                <select name="type" value={form.type} onChange={handleChange}>
                  {LICENCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">L.2 Status & Validity</h3>
            <div className="form-grid">
              <label>Status *
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Active</option>
                  <option>Expiring</option>
                  <option>Pending renewal</option>
                  <option>Processing</option>
                  <option>Expired</option>
                  <option>Cancelled</option>
                </select>
              </label>
              <label>Expiry Date *
                <input required name="expiry" type="date" value={form.expiry} onChange={handleChange} />
              </label>
              <label>Value Utilized (%)
                <input type="number" name="utilized" min="0" max="100" placeholder="e.g. 45"
                  value={form.utilized} onChange={handleChange} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" name="alert" checked={form.alert} onChange={handleChange} style={{ width: 'auto', accentColor: 'var(--danger-text)' }} />
                <span>Flag as Expiry Alert</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16} /> {initialData ? 'Update Licence' : 'Save Licence'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

