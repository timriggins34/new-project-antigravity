import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Download,
  Archive,
  Ban,
  Undo2
} from 'lucide-react';
import './docs.css';

export default function SmartChecklist({ masterJobId, authFetch, onUpdate }) {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  const fetchChecklist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`http://localhost:3000/api/master-jobs/${masterJobId}/checklist`);
      if (res.ok) {
        const data = await res.json();
        setChecklist(data);
        
        // Auto-expand mandatory stages initially
        const stages = {};
        data.forEach(item => {
          if (item.isMandatory) {
            const stage = item.stage || 'General';
            stages[stage] = true;
          }
        });
        setExpandedStages(prev => ({ ...prev, ...stages }));
      }
    } catch (err) {
      console.error('Failed to fetch checklist:', err);
    } finally {
      setLoading(false);
    }
  }, [masterJobId, authFetch]);

  useEffect(() => {
    if (masterJobId) {
      fetchChecklist();
    }
  }, [masterJobId, fetchChecklist]);

  const toggleStage = (stageKey) => {
    setExpandedStages(prev => ({ ...prev, [stageKey]: !prev[stageKey] }));
  };

  const handleFileUpload = async (e, checklistId, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(checklistId);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentName', docName);
    formData.append('jobChecklistId', checklistId);
    formData.append('entityType', 'masterJobChecklist');
    formData.append('entityId', masterJobId);

    try {
      const res = await authFetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        await fetchChecklist();
        if (onUpdate) onUpdate();
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingId(null);
    }
  };

  const handleIgnoreItem = async (checklistId) => {
    const reason = window.prompt("Why are you skipping this optional document?");
    if (reason === null) return; // Cancelled
    if (!reason.trim()) {
      alert("A reason is required to skip a document.");
      return;
    }

    try {
      const res = await authFetch(`http://localhost:3000/api/master-jobs/checklist/${checklistId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IGNORED', overrideReason: reason })
      });

      if (res.ok) {
        await fetchChecklist();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Ignore error:', err);
    }
  };

  const handleUndoIgnore = async (checklistId) => {
    try {
      const res = await authFetch(`http://localhost:3000/api/master-jobs/checklist/${checklistId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'MISSING', overrideReason: null })
      });

      if (res.ok) {
        await fetchChecklist();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Undo error:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE': return <CheckCircle size={18} className="text-success" />;
      case 'VERIFY': return <Clock size={18} className="text-warning" />;
      case 'MISSING': return <AlertCircle size={18} className="text-danger" />;
      case 'IGNORED': return <Ban size={18} className="text-muted" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => status;

  if (loading) return <div className="checklist-loading">Organizing smart checklist...</div>;

  // Group items by Mandatory/Optional and then by stage
  const mandatoryItems = checklist.filter(item => String(item.isMandatory) === 'true');
  const optionalItems = checklist.filter(item => String(item.isMandatory) === 'false');



  const groupItems = (items) => {
    return items.reduce((acc, item) => {
      const stage = item.stage || 'General';
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(item);
      return acc;
    }, {});
  };

  const renderSection = (title, grouped, isOptionalSection = false) => {
    if (Object.keys(grouped).length === 0) return null;

    return (
      <div className={`checklist-section ${isOptionalSection ? 'optional-section' : 'mandatory-section'}`}>
        <div className="section-title-bar">
          <h4>{title}</h4>
          <span className="section-badge">{isOptionalSection ? 'Non-Critical' : 'Required'}</span>
        </div>

        {Object.entries(grouped).map(([stage, items]) => {
          const stageKey = `${isOptionalSection ? 'opt' : 'man'}-${stage}`;
          const isExpanded = expandedStages[stageKey] !== false; // Default to true if stages were auto-expanded
          
          return (
            <div key={stageKey} className="stage-group">
              <div className={`stage-row ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleStage(stageKey)}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="stage-name">{stage}</span>
                <span className="item-count">{items.length} Docs</span>
              </div>
              
              {isExpanded && (
                <div className="stage-items">
                  {items.map(item => (
                    <div key={item.id} className={`checklist-item status-${item.status.toLowerCase()} ${item.status === 'IGNORED' ? 'item-ignored' : ''}`}>
                      <div className="item-main">
                        <div className="item-icon">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="item-details">
                          <div className="doc-name">{item.masterDocument.name}</div>
                          <div className="doc-meta">
                            <span className="doc-abbr">{item.masterDocument.abbreviation}</span>
                            <span className="dot">•</span>
                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                              {getStatusLabel(item.status)}
                            </span>
                            {item.status === 'IGNORED' && item.overrideReason && (
                              <span className="reason-text" title={item.overrideReason}> (Reason: {item.overrideReason})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="item-actions">
                        {item.status === 'IGNORED' ? (
                          <button className="btn-icon" title="Restore" onClick={() => handleUndoIgnore(item.id)}>
                            <Undo2 size={16} />
                          </button>
                        ) : item.status === 'MISSING' || item.status === 'VERIFY' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div className="file-upload-wrapper">
                              <label className="btn-upload" disabled={uploadingId === item.id}>
                                {uploadingId === item.id ? '...' : <><UploadCloud size={14} /> Upload</>}
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleFileUpload(e, item.id, item.masterDocument.name)}
                                  disabled={uploadingId === item.id}
                                />
                              </label>
                            </div>
                            {isOptionalSection && item.status === 'MISSING' && (
                              <button className="btn-icon skip-btn" title="Ignore Document" onClick={() => handleIgnoreItem(item.id)}>
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button className="btn-icon" title="Download Document" onClick={() => window.open(item.filePath)}>
                            <Download size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="smart-checklist smart-split">
      <div className="checklist-header">
        <FileCheck2 size={20} className="text-primary" />
        <h3>Compliance Smart Checklist</h3>
      </div>

      <div className="checklist-body">
        {checklist.length === 0 ? (
          <div className="empty-checklist">
            <Archive size={32} />
            <p>No document rules matched this job's profile.</p>
          </div>
        ) : (
          <>
            {renderSection("Mandatory Documents", groupItems(mandatoryItems), false)}
            {renderSection("Optional Documents", groupItems(optionalItems), true)}
          </>
        )}
      </div>
    </div>
  );
}
