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
  Download
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
        
        // Auto-expand all stages initially
        const stages = {};
        data.forEach(item => {
          const stage = item.masterDocument?.stageRequired || 'General';
          stages[stage] = true;
        });
        setExpandedStages(stages);
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

  const toggleStage = (stage) => {
    setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }));
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
      alert('Network error during upload.');
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE': return <CheckCircle size={18} className="text-success" />;
      case 'VERIFY': return <Clock size={18} className="text-warning" />;
      case 'MISSING': return <AlertCircle size={18} className="text-danger" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'DONE': return 'DONE';
      case 'VERIFY': return 'VERIFY';
      case 'MISSING': return 'MISSING';
      default: return status;
    }
  };

  if (loading) return <div className="checklist-loading">Analyzing documentation rules...</div>;

  // Group items by stage
  const groupedChecklist = checklist.reduce((acc, item) => {
    const stage = item.masterDocument?.stageRequired || 'General';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(item);
    return acc;
  }, {});

  return (
    <div className="smart-checklist">
      <div className="checklist-header">
        <FileCheck2 size={20} className="text-primary" />
        <h3>Compliance Checklist</h3>
      </div>

      <div className="checklist-body">
        {Object.entries(groupedChecklist).map(([stage, items]) => (
          <div key={stage} className="stage-group">
            <div className={`stage-row ${expandedStages[stage] ? 'expanded' : ''}`} onClick={() => toggleStage(stage)}>
              {expandedStages[stage] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="stage-name">{stage}</span>
              <span className="item-count">{items.length} Documents</span>
            </div>
            
            {expandedStages[stage] && (
              <div className="stage-items">
                {items.map(item => (
                  <div key={item.id} className={`checklist-item status-${item.status.toLowerCase()}`}>
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
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      {item.status === 'MISSING' ? (
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
                      ) : (
                        <button className="btn-icon" title="View Document" onClick={() => window.open(item.filePath)}>
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {checklist.length === 0 && (
          <div className="empty-checklist">
            <Archive size={32} />
            <p>No document rules matched this job's profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
