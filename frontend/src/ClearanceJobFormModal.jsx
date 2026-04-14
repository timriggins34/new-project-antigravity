import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import './modal.css';

export default function ClearanceJobFormModal({ isOpen, onClose, onSuccess, initialData, clients, vendors, employees }) {
  const [formData, setFormData] = useState({
    client: '', port: 'INNSA1', type: 'Sea Import', stage: 'Filing', status: 'pending', 
    alert: false, assignedToId: '', date: '', icegateChallan: '', dutyAmount: '', penalty: '', hsCodeItems: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData,
        dutyAmount: initialData.dutyAmount || '',
        penalty: initialData.penalty || '',
        hsCodeItems: initialData.hsCodeItems || []
      });
    } else {
      setFormData({
        client: clients?.[0]?.name || '', port: 'INNSA1', type: 'Sea Import', stage: 'Filing', status: 'pending', 
        alert: false, assignedToId: '', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), 
        icegateChallan: '', dutyAmount: '', penalty: '', hsCodeItems: []
      });
    }
  }, [initialData, isOpen, clients]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddHSCode = () => {
    setFormData(prev => ({
      ...prev,
      hsCodeItems: [...prev.hsCodeItems, { itemName: '', hsCode: '', assessableValue: '' }]
    }));
  };

  const handleHSCodeChange = (index, field, value) => {
    const newItems = [...formData.hsCodeItems];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, hsCodeItems: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = !!initialData?.id;
    const url = isEdit ? `http://localhost:3000/api/clearance-jobs/${initialData.job_id}` : 'http://localhost:3000/api/clearance-jobs';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      dutyAmount: formData.dutyAmount ? parseFloat(formData.dutyAmount) : null,
      penalty: formData.penalty ? parseFloat(formData.penalty) : null,
      hsCodeItems: formData.hsCodeItems.map(item => ({
        ...item,
        assessableValue: item.assessableValue ? parseFloat(item.assessableValue) : null
      }))
    };

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save clearance job.');
      }
    } catch (err) {
      console.error(err);
      alert("Error saving job.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card large-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Clearance Job' : 'Register New Clearance'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem' }}>
          
          <div className="form-section">
            <h3 className="section-title">Core Job Info</h3>
            <div className="form-grid">
              <label>Select Client * 
                <select name="client" value={formData.client} onChange={handleChange} required>
                  {clients?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </label>
              <label>Port of Entry/Exit * 
                <select name="port" value={formData.port} onChange={handleChange}>
                  <option>INNSA1</option><option>INBOM4</option><option>INMAA1</option><option>INDEL4</option>
                </select>
              </label>
              <label>Service Type * 
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option>Sea Import</option><option>Air Import</option><option>Sea Export</option><option>Air Export</option>
                </select>
              </label>
              <label>Current Stage * 
                <select name="stage" value={formData.stage} onChange={handleChange}>
                  <option>Filing</option><option>Assessment</option><option>Duty</option><option>Exam</option><option>OOC</option>
                </select>
              </label>
              <label>Assigned To
                <select name="assignedToId" value={formData.assignedToId} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Duty & Finance</h3>
            <div className="form-grid">
              <label>IceGate Challan No. <input name="icegateChallan" value={formData.icegateChallan} onChange={handleChange} /></label>
              <label>Duty Amount (INR) <input type="number" step="0.01" name="dutyAmount" value={formData.dutyAmount} onChange={handleChange} /></label>
              <label>Penalty Amount (INR) <input type="number" step="0.01" name="penalty" value={formData.penalty} onChange={handleChange} /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '1.5rem' }}>
                 <input type="checkbox" name="alert" checked={formData.alert} onChange={handleChange} />
                 <span>Flag for Escalation (Alert)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h3 className="section-title" style={{ marginBottom: 0 }}>HS Code Line Items</h3>
               <button type="button" className="btn-primary" onClick={handleAddHSCode} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+ Add Item</button>
            </div>
            <div className="hs-code-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {formData.hsCodeItems.map((item, idx) => (
                 <div key={idx} className="hs-item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '0.5rem', alignItems: 'end', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                    <label style={{ fontSize: '0.75rem' }}>Item Name <input required value={item.itemName} onChange={(e) => handleHSCodeChange(idx, 'itemName', e.target.value)} /></label>
                    <label style={{ fontSize: '0.75rem' }}>HS Code <input required value={item.hsCode} onChange={(e) => handleHSCodeChange(idx, 'hsCode', e.target.value)} /></label>
                    <label style={{ fontSize: '0.75rem' }}>Asses. Value <input type="number" step="0.01" value={item.assessableValue} onChange={(e) => handleHSCodeChange(idx, 'assessableValue', e.target.value)} /></label>
                    <button type="button" className="btn-icon reject" style={{ marginBottom: '4px' }} onClick={() => setFormData(prev => ({ ...prev, hsCodeItems: prev.hsCodeItems.filter((_, i) => i !== idx) }))}><X size={14}/></button>
                 </div>
               ))}
               {formData.hsCodeItems.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No items added yet.</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16}/> {initialData ? 'Update Job' : 'Initialize Job'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
