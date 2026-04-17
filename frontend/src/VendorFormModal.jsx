import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import './modal.css';

export default function VendorFormModal({ isOpen, onClose, onSuccess, initialData, authFetch }) {
  const [formData, setFormData] = useState({
    name: '', type: 'Trucking', contact: '', phone: '', email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        name: '', type: 'Trucking', contact: '', phone: '', email: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/vendors/${initialData.vendor_id}` : 'http://localhost:3000/api/vendors';
    const method = isEdit ? 'PUT' : 'POST';

    // Sanitize data — only send core fields to avoid DB errors with relations
    const submissionData = {
      name: formData.name,
      type: formData.type,
      contact: formData.contact,
      phone: formData.phone,
      email: formData.email
    };

    try {
      const resp = await authFetch(url, {
        method,
        body: JSON.stringify(submissionData)
      });
      if (resp.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to save vendor.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not reach the server.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card small-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <label>Vendor Business Name * <input required name="name" value={formData.name} onChange={handleChange} /></label>
            <label>Provider Type * 
              <select name="type" value={formData.type} onChange={handleChange}>
                <option>Trucking</option><option>Freight</option><option>Custom Broker</option><option>Warehousing</option><option>Inspection</option>
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>Contact Person * <input required name="contact" value={formData.contact} onChange={handleChange} /></label>
              <label>Phone Number * <input required name="phone" value={formData.phone} onChange={handleChange} /></label>
            </div>
            <label>Email Address * <input type="email" required name="email" value={formData.email} onChange={handleChange} /></label>
          </div>

          <div className="modal-footer" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16}/> {initialData ? 'Update Vendor' : 'Save Vendor'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
