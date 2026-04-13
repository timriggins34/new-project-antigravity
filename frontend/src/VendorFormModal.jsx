import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

const EMPTY = {
  name: '', type: 'Trucking', contact: '', phone: '', email: '',
};

export default function VendorFormModal({ isOpen, onClose, onSuccess, initialData }) {
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

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/vendors/${initialData.id}` : 'http://localhost:3000/api/vendors';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, activeJobs: form.activeJobs || [], pastJobs: form.pastJobs || [] }),
      });
      if (res.ok) { 
        onSuccess(); 
        onClose(); 
        setForm(EMPTY); 
      }
      else alert(`Failed to ${isEdit ? 'update' : 'save'} vendor.`);
    } catch { alert('Error saving vendor.'); }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-section">
            <h3 className="section-title">V.1 Vendor Identity</h3>
            <div className="form-grid">
              <label>Vendor / Company Name *
                <input required name="name" placeholder="e.g. FastTrack Logistics Pvt Ltd" value={form.name} onChange={handleChange} />
              </label>
              <label>Vendor Type *
                <select name="type" value={form.type} onChange={handleChange}>
                  <option>Trucking</option>
                  <option>Freight</option>
                  <option>Terminal</option>
                  <option>Gov</option>
                  <option>CFS</option>
                  <option>Warehouse</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">V.2 Contact Details</h3>
            <div className="form-grid">
              <label>Primary Contact Person *
                <input required name="contact" placeholder="e.g. Ramesh Singh" value={form.contact} onChange={handleChange} />
              </label>
              <label>Phone Number *
                <input required name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </label>
              <label>Email Address *
                <input required type="email" name="email" placeholder="ops@vendor.in" value={form.email} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16} /> {initialData ? 'Update Vendor' : 'Save Vendor'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

