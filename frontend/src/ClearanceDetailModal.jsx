import React, { useState } from 'react';
import { X, Package, MapPin, User, Clock, AlertTriangle, CheckCircle2, FileText, ArrowRight, Download, Calculator, Save } from 'lucide-react';
import './modal.css';

export default function ClearanceDetailModal({ 
  isOpen, onClose, job, docJobs, onEdit, onDelete, onAdvance, onRefresh,
  onUploadDoc, onDownloadDoc, uploadFile, setUploadFile, newDocName, setNewDocName
}) {
  const [isDutyUpdating, setIsDutyUpdating] = useState(false);
  const [dutyData, setDutyData] = useState({
    icegateChallan: job?.icegateChallan || '',
    dutyAmount: job?.dutyAmount || '',
    penalty: job?.penalty || '',
    paymentDate: job?.paymentDate ? new Date(job.paymentDate).toISOString().split('T')[0] : ''
  });

  if (!isOpen || !job) return null;

  const steps = [
    { name: 'Filing', desc: 'Checklist & Document Indexing' },
    { name: 'Assessment', desc: 'Customs Verification & Query' },
    { name: 'Duty', desc: 'Challan Generation & Payment' },
    { name: 'Exam', desc: 'Physical Inspection & Cargo Release' },
    { name: 'OOC', desc: 'Out of Charge (Cleared)' }
  ];

  const currentStepIdx = steps.findIndex(s => s.name === job.stage);
  const targetDocJob = docJobs?.find(d => d.job_id === job.job_id);

  const handleStepClick = async (targetStage, idx) => {
    // Validation: Only allow advancing one by one or clicking active/past stages
    if (idx > currentStepIdx + 1) return; 

    // Guardrail: Assessment -> Duty
    if (targetStage === 'Duty' && job.stage === 'Assessment') {
      if (!targetDocJob?.hasHardCopyBOL || !targetDocJob?.hasHardCopyDO) {
        alert("🚨 BLOCKER: Physical Documents Required\n\nYou cannot advance to Duty without verifying original BOL and hard copy DO in the Documentation module.");
        return;
      }
      setIsDutyUpdating(true); // Open Duty modal form
      return;
    }

    if (idx === currentStepIdx + 1) {
      onAdvance(job.job_id);
    }
  };

  const handleSaveDutyDetails = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`http://localhost:3000/api/clearance-jobs/${job.job_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dutyData,
          dutyAmount: parseFloat(dutyData.dutyAmount),
          penalty: parseFloat(dutyData.penalty),
          stage: 'Duty' // Transition to Duty
        })
      });
      if (resp.ok) {
        setIsDutyUpdating(false);
        onRefresh();
      } else {
        alert('Failed to save duty details');
      }
    } catch (e) { console.error(e); }
  };

  const handleTallyExport = () => {
    window.location.href = `http://localhost:3000/api/clearance/${job.job_id}/tally-export`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card large-modal" onClick={e => e.stopPropagation()} style={{ minHeight: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon" style={{ padding: '0.4rem', borderRadius: '8px' }}><Package size={20} /></div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Interactive Pipeline: #{job.job_id}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.client} • {job.type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={handleTallyExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.8rem' }}>
               <Download size={14} /> Tally Export
            </button>
            <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', padding: '1.5rem' }}>
          
          {/* Left Column: Interactive Stepper */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 className="section-title" style={{ marginBottom: 0 }}>Progress Stepper</h3>
               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Click nodes to advance</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1rem' }}>
              <div style={{ position: 'absolute', left: '1.5rem', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx || (job.status === 'completed' && idx === currentStepIdx);
                const isCurrent = idx === currentStepIdx && job.status !== 'completed';
                const isNext = idx === currentStepIdx + 1;
                const isLocked = idx > currentStepIdx + 1;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleStepClick(step.name, idx)}
                    style={{ 
                      display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, 
                      cursor: isNext || isCurrent ? 'pointer' : 'default',
                      opacity: isLocked ? 0.4 : 1
                    }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--success-text)' : isCurrent ? 'var(--primary-color)' : isNext ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-color)',
                      border: `2px solid ${isCompleted ? 'var(--success-text)' : isCurrent ? 'var(--primary-color)' : isNext ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      color: isCompleted || isCurrent ? 'white' : isNext ? 'var(--primary-color)' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                      boxShadow: isCurrent ? '0 0 10px var(--primary-color)' : 'none'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : (idx + 1)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: isCurrent ? 'var(--text-main)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {step.name}
                        {isNext && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px' }}>NEXT</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isDutyUpdating && (
              <div className="glass-card animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--primary-color)', background: 'rgba(56, 189, 248, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calculator size={18} /> Duty Payment Details</h4>
                   <button className="btn-icon" onClick={() => setIsDutyUpdating(false)}><X size={16}/></button>
                </div>
                <form onSubmit={handleSaveDutyDetails} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <label style={{ fontSize: '0.8rem' }}>IceGate Challan No. * <input required value={dutyData.icegateChallan} onChange={e => setDutyData({...dutyData, icegateChallan: e.target.value})} /></label>
                   <label style={{ fontSize: '0.8rem' }}>Payment Date * <input type="date" required value={dutyData.paymentDate} onChange={e => setDutyData({...dutyData, paymentDate: e.target.value})} /></label>
                   <label style={{ fontSize: '0.8rem' }}>Duty Amount (INR) * <input type="number" step="0.01" required value={dutyData.dutyAmount} onChange={e => setDutyData({...dutyData, dutyAmount: e.target.value})} /></label>
                   <label style={{ fontSize: '0.8rem' }}>Penalty (if any) <input type="number" step="0.01" value={dutyData.penalty} onChange={e => setDutyData({...dutyData, penalty: e.target.value})} /></label>
                   <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}><Save size={16} /> Save & Advance to Duty</button>
                   </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Validation Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compliance Guardrail</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: targetDocJob?.hasHardCopyBOL ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  {targetDocJob?.hasHardCopyBOL ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span style={{ fontSize: '0.85rem', flex: 1 }}>Original Bill of Lading Verification</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: targetDocJob?.hasHardCopyDO ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  {targetDocJob?.hasHardCopyDO ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span style={{ fontSize: '0.85rem', flex: 1 }}>Hard Copy Delivery Order Status</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  Duty payment stage is electronically locked until physical document arrival is logged by the documentation team.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
               <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Line Item Assessable Value</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {job.hsCodeItems?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.itemName}</span>
                      <span style={{ fontWeight: 600 }}>₹{item.assessableValue?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total Value</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>₹{job.hsCodeItems?.reduce((a,b) => a + (b.assessableValue || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
               </div>
            </div>
          </div>

            </div>

            {/* Document Vault Section */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>Document Vault</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <input 
                        placeholder="Document Name" 
                        value={newDocName} 
                        onChange={(e) => setNewDocName(e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8rem', width: '150px' }}
                     />
                     <label className="btn-icon" style={{ cursor: 'pointer', backgroundColor: uploadFile ? 'var(--info-bg)' : 'var(--surface-color)', border: '1px solid var(--border-color)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={uploadFile ? uploadFile.name : 'Select File'}>
                        <input 
                           type="file" 
                           style={{ display: 'none' }} 
                           onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                        <FileText size={18} color={uploadFile ? 'var(--info-text)' : 'inherit'} />
                     </label>
                     <button 
                       className="btn-primary" 
                       style={{ padding: '0.5rem 1rem' }}
                       onClick={() => onUploadDoc('clearanceJob', job.job_id, newDocName)}
                       disabled={!uploadFile || !newDocName}
                     >
                        Upload Doc
                     </button>
                  </div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {(job.documents || []).length > 0 ? job.documents.map((doc, idx) => (
                     <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <FileText size={18} color="var(--primary-color)" />
                           <div>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(doc.createdAt).toLocaleDateString()}</div>
                           </div>
                        </div>
                        <button className="btn-icon" onClick={() => onDownloadDoc(doc.id, doc.name)}><Download size={14} /></button>
                     </div>
                  )) : <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>No documents uploaded for this job.</div>}
               </div>
            </div>

         <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close Detail</button>
        </div>
      </div>
    </div>
  );
}
