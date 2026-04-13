import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

const PORTS = ['INNSA1', 'INBOM4', 'INDEL4', 'INMAA1', 'INBLR4', 'INCCU1', 'INHYDN'];
const STAGES = ['Filing', 'Assessment', 'Duty', 'Exam', 'OOC'];

const EMPTY = {
  client: '', port: 'INNSA1', type: 'Sea Import',
  stage: 'Filing', status: 'pending', alert: false, assigned: '', date: '',
};

export default function ClearanceJobFormModal({ isOpen, onClose, onSuccess, initialData }) {
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
    const { name, value, type: inputType, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: inputType === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/clearance-jobs/${initialData.id}` : 'http://localhost:3000/api/clearance-jobs';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...form,
      date: form.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { onSuccess(); onClose(); setForm(EMPTY); }
      else alert(`Failed to ${isEdit ? 'update' : 'create'} clearance job.`);
    } catch { alert('Error saving clearance job.'); }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Clearance Job' : 'Create New Clearance Job'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-section">
            <h3 className="section-title">CJ.1 Shipment Details</h3>
            <div className="form-grid">
              <label>Client Name *
                <input required name="client" placeholder="e.g. Global Tech Traders Pvt Ltd" value={form.client} onChange={handleChange} />
              </label>
              <label>Shipment Type *
                <select name="type" value={form.type} onChange={handleChange}>
                  <option>Sea Import</option>
                  <option>Air Import</option>
                  <option>Sea Export</option>
                  <option>Air Export</option>
                </select>
              </label>
              <label>Port of Entry / Exit *
                <select name="port" value={form.port} onChange={handleChange}>
                  {PORTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Assigned Officer *
                <input required name="assigned" placeholder="e.g. Rahul S." value={form.assigned} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">CJ.2 Clearance Status</h3>
            <div className="form-grid">
              <label>Current Stage *
                <select name="stage" value={form.stage} onChange={handleChange}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Job Status *
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed (OOC)</option>
                </select>
              </label>
              <label>Date / Time
                <input name="date" placeholder="e.g. Today, 10:30" value={form.date} onChange={handleChange} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" name="alert" checked={form.alert} onChange={handleChange} style={{ width: 'auto', accentColor: 'var(--danger-text)' }} />
                <span>Flag as Alert</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16} /> {initialData ? 'Update Job' : 'Create Job'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

