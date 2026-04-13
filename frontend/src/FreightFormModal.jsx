import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud, Loader2, FileCheck } from 'lucide-react';
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
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    // Start Mock Parsing
    setIsParsing(true);
    setTimeout(() => {
      setForm(prev => ({
        ...prev,
        mbl: 'MSC' + Math.floor(Math.random()*1000000),
        vessel: 'MSC EMANUELA V.234',
        pol: 'SHANGHAI (CNSHA)',
        pod: 'NHAVA SHEVA (INNSA)',
        etd: '15-MAY-2024',
        eta: '02-JUN-2024',
        status: 'Origin'
      }));
      setIsParsing(false);
      alert('Pre-Alert Parsing Complete: Form fields auto-populated.');
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/freight-jobs/${initialData.job_id}` : 'http://localhost:3000/api/freight-jobs';
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
        alert(`Failed to save shipment.`);
      }
    } catch {
      alert('Error saving freight shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card large-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Shipment' : 'Create New Shipment'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div className="left-side">
            <div className="form-section">
              <h3 className="section-title">Reference & Mode</h3>
              <div className="form-grid">
                <label>Job ID * <input required name="job_id" value={form.job_id} onChange={handleChange} /></label>
                <label>Mode *
                  <select name="type" value={form.type} onChange={handleChange}>
                    {MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Routing & Dates</h3>
              <div className="form-grid">
                <label>POL * <input required name="pol" value={form.pol} onChange={handleChange} /></label>
                <label>POD * <input required name="pod" value={form.pod} onChange={handleChange} /></label>
                <label>ETD <input name="etd" value={form.etd} onChange={handleChange} /></label>
                <label>ETA * <input required name="eta" value={form.eta} onChange={handleChange} /></label>
              </div>
            </div>
          </div>

          <div className="right-side">
            {!initialData && (
              <div className="form-section">
                <h3 className="section-title">Smart Pre-Alert Upload</h3>
                <div 
                  className={`drop-zone ${dragActive ? 'active' : ''} ${isParsing ? 'parsing' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  style={{ 
                    border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', 
                    textAlign: 'center', transition: 'all 0.3s', backgroundColor: 'rgba(255,255,255,0.02)',
                    position: 'relative'
                  }}
                >
                  {isParsing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                       <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
                       <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Analyzing OCR Data...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Drop Pre-Alert File Here</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-populates MBL, Vessel, and Schedule</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="form-section">
              <h3 className="section-title">Vessel & Status</h3>
              <div className="form-grid">
                <label>MBL / AWB <input name="mbl" value={form.mbl} onChange={handleChange} /></label>
                <label>Vessel / Flight * <input required name="vessel" value={form.vessel} onChange={handleChange} /></label>
                <label>Initial Status *
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '2.5rem', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Shipment</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
