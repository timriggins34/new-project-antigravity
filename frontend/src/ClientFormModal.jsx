import React, { useState, useEffect } from 'react';
import { X, Save, Building2, ShieldCheck, MapPin, CreditCard, FileText, UploadCloud } from 'lucide-react';
import './modal.css';

export default function ClientFormModal({ isOpen, onClose, onSuccess, initialData, authFetch }) {
  const [activeTab, setActiveTab] = useState('general');
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
    const url = isEdit ? `http://localhost:3000/api/clients/${initialData.client_id}` : 'http://localhost:3000/api/clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const resp = await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      if (resp.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await resp.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Failed to save client profile.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not reach the server.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card large-modal">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{initialData ? 'Update Client Record' : 'Onboard New Client'}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{initialData ? `Editing: ${initialData.name}` : 'Fill in the details to register a new client profile'}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs" style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          {[
            { id: 'general', label: 'General Info', icon: Building2 },
            { id: 'compliance', label: 'Compliance & Tax', icon: ShieldCheck },
            { id: 'contact', label: 'Contact Details', icon: MapPin },
            { id: 'banking', label: 'Banking & AD', icon: CreditCard }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
                backgroundColor: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer'
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          
          {activeTab === 'general' && (
            <div className="form-section animate-fade-in">
              <div className="form-grid">
                <label>Client Legal Name * <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Registered Name" /></label>
                <label>Display Nickname * <input required name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Trade Name" /></label>
                <label>Entity Type * 
                  <select name="constitution" value={formData.constitution} onChange={handleChange}>
                    <option>Pvt Ltd</option><option>Public Ltd</option><option>LLP</option><option>Proprietorship</option><option>Partnership</option>
                  </select>
                </label>
                <label>Client Category * 
                  <select name="clientType" value={formData.clientType} onChange={handleChange}>
                    <option>Importer</option><option>Exporter</option><option>Both</option>
                  </select>
                </label>
                <label>Operational Status * 
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </label>
                <label>Relationship Since <input type="number" name="clientSinceYear" value={formData.clientSinceYear} onChange={handleChange} placeholder="YYYY" /></label>
              </div>
              <div className="form-grid full-width" style={{ marginTop: '1rem' }}>
                <label>Internal Notes / Profile Details <textarea name="details" value={formData.details} onChange={handleChange} rows="3" placeholder="Any specific requirements or instructions..."></textarea></label>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="form-section animate-fade-in">
              <div className="form-grid">
                <label>IT PAN Number * <input required name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" /></label>
                <label>GSTIN Number * <input required name="gstin" value={formData.gstin} onChange={handleChange} placeholder="27XXXXX0000X1Z1" /></label>
                <label>Import Export Code (IEC) * <input required name="iec" value={formData.iec} onChange={handleChange} placeholder="03XXXXXXXX" /></label>
                <label>CIN / LLPIN * <input required name="cin_llpin" value={formData.cin_llpin} onChange={handleChange} placeholder="U/LXXXXXMHXXXXPLCXXXXX" /></label>
                <label>Income Tax TAN * <input required name="tan" value={formData.tan} onChange={handleChange} placeholder="MUMGXXXXXC" /></label>
              </div>
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px dashed var(--info-text)' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--info-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} /> Verification documents can be uploaded in the Client Vault after profile creation.
                 </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="form-section animate-fade-in">
              <div className="form-grid full-width">
                <label>Full Registered Office Address * <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="Building, Street, Area, City, State, PIN"></textarea></label>
              </div>
              <div className="form-grid" style={{ marginTop: '1rem' }}>
                <label>Decision Maker / Primary Contact * <input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} /></label>
                <label>Contact Nickname * <input required name="contactNickname" value={formData.contactNickname} onChange={handleChange} /></label>
                <label>Mobile Number (Primary) * <input required name="mobile" value={formData.mobile} onChange={handleChange} /></label>
                <label>Official Email ID * <input type="email" required name="email" value={formData.email} onChange={handleChange} /></label>
                <label>Alternative Number 1 * <input required name="contact1" value={formData.contact1} onChange={handleChange} /></label>
                <label>Alternative Number 2 <input name="contact2" value={formData.contact2} onChange={handleChange} /></label>
              </div>
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="form-section animate-fade-in">
              <div className="form-grid">
                <label>Primary Bank Name * <input required name="bankName" value={formData.bankName} onChange={handleChange} /></label>
                <label>Branch & Location * <input required name="branchName" value={formData.branchName} onChange={handleChange} /></label>
                <label>Account Number * <input required name="accountNumber" value={formData.accountNumber} onChange={handleChange} /></label>
                <label>Account Category * 
                  <select name="accountType" value={formData.accountType} onChange={handleChange}>
                    <option>Current</option><option>Savings</option><option>OD</option><option>Cash Credit</option>
                  </select>
                </label>
                <label>IFSC Code * <input required name="ifsc" value={formData.ifsc} onChange={handleChange} /></label>
                <label>SWIFT Identifier * <input required name="swift" value={formData.swift} onChange={handleChange} /></label>
                <label>AD Code (Authorized Dealer) * <input required name="adCode" value={formData.adCode} onChange={handleChange} /></label>
              </div>
              <div className="form-grid full-width" style={{marginTop: '1.5rem'}}>
                <label>Bank Address (for documentation) * <textarea required name="bankAddress" value={formData.bankAddress} onChange={handleChange} rows="2"></textarea></label>
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem -1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ marginRight: 'auto', display: 'flex', gap: '1rem' }}>
               <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '10px 24px' }}>
              {isSubmitting ? 'Processing...' : <><Save size={18}/> {initialData ? 'Update Profile' : 'Complete Setup'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
