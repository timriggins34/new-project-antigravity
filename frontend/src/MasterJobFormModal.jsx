import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase } from 'lucide-react';
import './modal.css';

export default function MasterJobFormModal({ isOpen, onClose, onSuccess, clients, authFetch }) {
  const [formData, setFormData] = useState({
    clientId: '',
    direction: 'Import', // Import / Export
    mode: 'Sea', // Sea / Air
    incoterm: 'CIF',
    hsCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && clients?.length > 0 && !formData.clientId) {
      setFormData(prev => ({ ...prev, clientId: clients[0].dbId }));
    }
  }, [isOpen, clients]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const resp = await authFetch('http://localhost:3000/api/master-jobs', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (resp.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to create Master Job.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not reach the server.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={22} className="text-primary" />
            <h2>Initialize Master Job</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem' }}>
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label>Select Client * 
              <select name="clientId" value={formData.clientId} onChange={handleChange} required>
                {clients?.map(c => <option key={c.id} value={c.dbId}>{c.name} ({c.nickname})</option>)}
              </select>
            </label>
          </div>

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="radio-group-container">
              <label className="section-title" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Direction</label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label className="radio-label">
                  <input type="radio" name="direction" value="Import" checked={formData.direction === 'Import'} onChange={handleChange} />
                  <span>Import</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="direction" value="Export" checked={formData.direction === 'Export'} onChange={handleChange} />
                  <span>Export</span>
                </label>
              </div>
            </div>

            <div className="radio-group-container">
              <label className="section-title" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Mode</label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label className="radio-label">
                  <input type="radio" name="mode" value="Sea" checked={formData.mode === 'Sea'} onChange={handleChange} />
                  <span>Sea</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="mode" value="Air" checked={formData.mode === 'Air'} onChange={handleChange} />
                  <span>Air</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <label>Incoterm * 
              <select name="incoterm" value={formData.incoterm} onChange={handleChange}>
                <option>CIF</option>
                <option>FOB</option>
                <option>EXW</option>
                <option>DAP</option>
                <option>DDP</option>
                <option>CFR</option>
                <option>FCA</option>
              </select>
            </label>
            <label>Primary HS Code (Optional)
              <input type="text" name="hsCode" value={formData.hsCode} onChange={handleChange} placeholder="e.g. 84713010" />
            </label>
          </div>

          <div className="modal-footer" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Initializing...' : <><Save size={16}/> Create Master Job</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
