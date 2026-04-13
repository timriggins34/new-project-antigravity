import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import './modal.css';

export default function ClientFormModal({ isOpen, onClose, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    name: '', nickname: '', clientType: 'Importer', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '',
    pan: '', gstin: '', iec: '', cin_llpin: '', tan: '',
    address: '', contactPerson: '', contactNickname: '', mobile: '', email: '', contact1: '', contact2: '',
    bankName: '', branchName: '', accountNumber: '', accountType: 'Current', ifsc: '', swift: '', bankAddress: '', adCode: '',
    details: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        name: '', nickname: '', clientType: 'Importer', constitution: 'Pvt Ltd', status: 'Active', clientSinceYear: '',
        pan: '', gstin: '', iec: '', cin_llpin: '', tan: '',
        address: '', contactPerson: '', contactNickname: '', mobile: '', email: '', contact1: '', contact2: '',
        bankName: '', branchName: '', accountNumber: '', accountType: 'Current', ifsc: '', swift: '', bankAddress: '', adCode: '',
        details: ''
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
    const url = isEdit ? `http://localhost:3000/api/clients/${initialData.id}` : 'http://localhost:3000/api/clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, docs: formData.docs || []})
      });
      if (resp.ok) {
        onSuccess();
        onClose();
      } else {
        alert(`Failed to ${isEdit ? 'update' : 'save'} client.`);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving client.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card large-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Client' : 'Add New Client'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          <div className="form-section">
            <h3 className="section-title">1.1 Client Identity</h3>
            <div className="form-grid">
              <label>Client Name * <input required name="name" value={formData.name} onChange={handleChange} /></label>
              <label>NickName * <input required name="nickname" value={formData.nickname} onChange={handleChange} /></label>
              <label>Client Type * 
                <select name="clientType" value={formData.clientType} onChange={handleChange}>
                  <option>Importer</option><option>Exporter</option><option>Both</option>
                </select>
              </label>
              <label>Constitution * 
                <select name="constitution" value={formData.constitution} onChange={handleChange}>
                  <option>Pvt Ltd</option><option>Public Ltd</option><option>LLP</option><option>Proprietorship</option>
                </select>
              </label>
              <label>Status * 
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </label>
              <label>Client Since Year <input type="number" name="clientSinceYear" value={formData.clientSinceYear} onChange={handleChange} /></label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">1.2 Registration & Compliance</h3>
            <div className="form-grid">
              <label>PAN Number * <input required name="pan" value={formData.pan} onChange={handleChange} /></label>
              <label>GSTIN * <input required name="gstin" value={formData.gstin} onChange={handleChange} /></label>
              <label>IEC Code * <input required name="iec" value={formData.iec} onChange={handleChange} /></label>
              <label>CIN/LLPIN * <input required name="cin_llpin" value={formData.cin_llpin} onChange={handleChange} /></label>
              <label>TAN * <input required name="tan" value={formData.tan} onChange={handleChange} /></label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">1.3 Primary Contact</h3>
            <div className="form-grid full-width">
              <label>Registered Address * <textarea required name="address" value={formData.address} onChange={handleChange} rows="2"></textarea></label>
            </div>
            <div className="form-grid">
              <label>Contact Person * <input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} /></label>
              <label>Contact NickName * <input required name="contactNickname" value={formData.contactNickname} onChange={handleChange} /></label>
              <label>Primary Mobile * <input required name="mobile" value={formData.mobile} onChange={handleChange} /></label>
              <label>Primary Email * <input type="email" required name="email" value={formData.email} onChange={handleChange} /></label>
              <label>Contact Number 1 * <input required name="contact1" value={formData.contact1} onChange={handleChange} /></label>
              <label>Contact Number 2 <input name="contact2" value={formData.contact2} onChange={handleChange} /></label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">1.4 Bank Account Details</h3>
            <div className="form-grid">
              <label>Bank Name * <input required name="bankName" value={formData.bankName} onChange={handleChange} /></label>
              <label>Branch Name * <input required name="branchName" value={formData.branchName} onChange={handleChange} /></label>
              <label>Account Number * <input required name="accountNumber" value={formData.accountNumber} onChange={handleChange} /></label>
              <label>Account Type * 
                <select name="accountType" value={formData.accountType} onChange={handleChange}>
                  <option>Current</option><option>Savings</option><option>OD</option><option>Cash Credit</option>
                </select>
              </label>
              <label>IFSC Code * <input required name="ifsc" value={formData.ifsc} onChange={handleChange} /></label>
              <label>SWIFT Code * <input required name="swift" value={formData.swift} onChange={handleChange} /></label>
              <label>AD Code * <input required name="adCode" value={formData.adCode} onChange={handleChange} /></label>
            </div>
            <div className="form-grid full-width" style={{marginTop: '1rem'}}>
              <label>Bank Address * <textarea required name="bankAddress" value={formData.bankAddress} onChange={handleChange} rows="2"></textarea></label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">1.5 Other Details</h3>
            <div className="form-grid full-width">
              <label>Additional Notes <textarea name="details" value={formData.details} onChange={handleChange} rows="3"></textarea></label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Save size={16}/> {initialData ? 'Update Client' : 'Save Client'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

