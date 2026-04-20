import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Settings2, 
  ArrowRight, 
  Plus, 
  Filter, 
  ChevronRight, 
  Binary,
  Edit3,
  Trash2,
  Library,
  DownloadCloud
} from 'lucide-react';
import RuleLibraryModal from './RuleLibraryModal';
import ImportRulesModal from './ImportRulesModal';

export const INCOTERMS = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];

const formatType = (type) => {
  if (!type) return 'Other';
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const groupRulesByType = (rules) => {
  const groups = {};
  rules.forEach(rule => {
    const type = rule.masterDocument.type || 'OTHER';
    if (!groups[type]) groups[type] = [];
    groups[type].push(rule);
  });

  // Sort within groups
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => a.masterDocument.name.localeCompare(b.masterDocument.name));
  });

  // Category Order
  const order = ['SHIPMENT', 'RECURRING', 'ONE_TIME', 'CONTAINER'];
  
  return Object.keys(groups)
    .sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    })
    .map(key => ({
      type: key,
      label: formatType(key),
      items: groups[key]
    }));
};

export default function RulesManager({ authFetch }) {
  const [filters, setFilters] = useState({
    direction: 'Import',
    mode: 'Sea',
    incoterm: 'ANY',
    hsCode: ''
  });

  const [activeFilters, setActiveFilters] = useState({
    direction: 'Import',
    mode: 'Sea',
    incoterm: 'ANY',
    hsCode: ''
  });


  const [rules, setRules] = useState([]); // This acts as our "Draft" state
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allMasterDocs, setAllMasterDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState(null); // { type: 'mandatory' | 'optional' }
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchMatrix = useCallback(async (searchParams) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(searchParams || activeFilters).toString();
      const res = await authFetch(`http://localhost:3000/api/document-rules/matrix?${query}`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, authFetch]);

  const fetchLib = useCallback(async () => {
    try {
      const res = await authFetch(`http://localhost:3000/api/master-documents`);
      if (res.ok) {
        setAllMasterDocs(await res.json());
      }
    } catch (err) { console.error(err); }
  }, [authFetch]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await authFetch(`http://localhost:3000/api/document-rules/audit-logs`);
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (err) { console.error(err); }
  }, [authFetch]);

  const handleQuickLoad = (log) => {
    const coords = {
      direction: log.direction,
      mode: log.mode,
      incoterm: log.incoterm || 'ANY',
      hsCode: log.hsCode || ''
    };
    setFilters(coords);
    setActiveFilters(coords);
    fetchMatrix(coords);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle manual "Load Matrix" ONLY
  const handleGo = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unfinalised changes in the current draft. Are you sure you want to load a new matrix and discard them?')) return;
    }
    
    setRules([]); // Clear immediately for visual feedback
    setHasUnsavedChanges(false);
    setActiveFilters({ ...filters }); // Commit draft filters to active search
    fetchMatrix({ ...filters });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImport = (matrixData) => {
    // Strip IDs and keep only necessary fields for the draft
    const importedRules = matrixData.map(r => ({
      masterDocumentId: r.masterDocumentId,
      masterDocument: r.masterDocument,
      stageRequired: r.stageRequired,
      isMandatory: r.isMandatory
    }));

    setRules(importedRules);
    setHasUnsavedChanges(true);
    showToast('Rules imported as draft. Review and click Finalise to save.');
  };

  const handleSyncRules = (newRulesForType) => {
    // 1. Get other rules (those NOT of the current type being edited)
    const currentTypeEditingIsMandatory = modalConfig.type === 'mandatory';
    const otherRules = rules.filter(r => r.isMandatory !== currentTypeEditingIsMandatory);

    // 2. Enrich new rules with masterDocument information to prevent rendering crashes
    const enrichedRules = newRulesForType.map(rule => ({
      ...rule,
      id: rule.id || `temp-${rule.masterDocumentId}`, // Ensure unique ID for key
      masterDocument: allMasterDocs.find(doc => doc.id === rule.masterDocumentId)
    }));

    // 3. Combine and update local state ONLY (Draft)
    setRules([...otherRules, ...enrichedRules]);
    setHasUnsavedChanges(true); // Flag for unsaved changes
    setModalConfig(null);
  };

  const handleFinalise = async () => {
    setLoading(true);
    try {
      const payload = {
        ...activeFilters, // Always save for the coordinates that were LOADED
        rules: rules.map(r => ({
          masterDocumentId: r.masterDocumentId,
          stageRequired: r.stageRequired,
          isMandatory: r.isMandatory
        }))
      };

      const res = await authFetch('http://localhost:3000/api/document-rules/sync', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Checklist Rules finalised successfully!');
        setHasUnsavedChanges(false);
        fetchMatrix(activeFilters);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete all explicit rules for this coordinate? This will revert the system to inherited rules.')) return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams(activeFilters).toString();
      const res = await authFetch(`http://localhost:3000/api/document-rules/reset?${query}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Explicit rules deleted and reverted to inheritance.');
        setHasUnsavedChanges(false);
        fetchMatrix(activeFilters);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Initial load on mount
  useEffect(() => {
    fetchLib();
    fetchMatrix(activeFilters);
    fetchAuditLogs();
  }, [fetchLib, fetchAuditLogs]);

  const mandatoryGroups = groupRulesByType(rules.filter(r => r.isMandatory));
  const optionalGroups = groupRulesByType(rules.filter(r => !r.isMandatory));

  // Normalize for comparison to avoid false positives (e.g. "" vs null)
  const normalize = (f) => ({
    direction: f.direction || 'ANY',
    mode: f.mode || 'ANY',
    incoterm: f.incoterm || 'ANY',
    hsCode: f.hsCode || ''
  });
  const isDesynced = JSON.stringify(normalize(filters)) !== JSON.stringify(normalize(activeFilters));

  return (
    <div className="dashboard-content rules-matrix-page">
      <div className="sub-header" style={{ alignItems: 'baseline', gap: '1rem' }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <h3 style={{ marginBottom: 0 }}>Checklist Rules</h3>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-muted)', 
            fontWeight: 400,
            marginBottom: 0
          }}>
            Checklist Matrix: {activeFilters.direction || 'Any'} &bull; {activeFilters.mode || 'Any'} &bull; {activeFilters.incoterm || 'Any'} {activeFilters.hsCode ? `&bull; HS ${activeFilters.hsCode}` : ''}
          </p>
        </div>
      </div>

      <div className="matrix-filters glass-card" style={{ marginTop: '0.5rem' }}>
        <div className="filter-group">
          <label>Direction</label>
          <select 
            value={filters.direction} 
            onChange={e => setFilters({...filters, direction: e.target.value})}
          >
            <option value="Import">Import</option>
            <option value="Export">Export</option>
            <option value="ANY">Any</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Mode</label>
          <select 
            value={filters.mode} 
            onChange={e => setFilters({...filters, mode: e.target.value})}
          >
            <option value="Sea">Sea</option>
            <option value="Air">Air</option>
            <option value="ANY">Any</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Incoterm</label>
          <select 
            value={filters.incoterm || ''} 
            onChange={e => setFilters({...filters, incoterm: e.target.value || 'ANY'})}
          >
            <option value="ANY">Any</option>
            {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>HS Code</label>
          <input 
             type="text" 
             placeholder="e.g. 8500, 8501..."
             value={filters.hsCode}
             onChange={e => setFilters({...filters, hsCode: e.target.value})}
          />
        </div>

        <button className="btn-primary" onClick={handleGo} disabled={loading}>
          {loading ? '...' : 'Load Matrix'}
        </button>
      </div>

      {isDesynced && (
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          color: '#854d0e',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} />
          <span>Filters have changed. Please click <strong>Load Matrix</strong> to view or edit this coordinate.</span>
        </div>
      )}


      <div className="matrix-grid">
         {/* Mandatory Column */}
         <div className="matrix-column glass-card">
            <div className="column-header">
               <div className="status-indicator mandatory"></div>
               <h4>Mandatory Documents</h4>
                <button 
                  className="btn-ghost" 
                  onClick={() => setModalConfig({ type: 'mandatory' })}
                  disabled={isDesynced || loading}
                >
                   <Edit3 size={14} /> Modify
                </button>
            </div>
            
            <div className="rule-list">
               {mandatoryGroups.length === 0 ? (
                 <div className="empty-state">No mandatory rules defined for this intersection.</div>
               ) : (
                 mandatoryGroups.map(group => (
                   <div key={group.type} className="rule-type-group">
                      <div className="type-separator">
                         <span>{group.label}</span>
                      </div>
                      {group.items.map(rule => (
                        <div key={rule.id} className={`matrix-item ${rule.isInherited ? 'inherited' : ''}`}>
                           <div className="item-info">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span className="doc-name">{rule.masterDocument.name}</span>
                                 {rule.isInherited && <span className="badge inherited-badge">Inherited</span>}
                              </div>
                              <span className="doc-stage">{rule.stageRequired}</span>
                           </div>
                           <ChevronRight size={14} color="var(--text-muted)" />
                        </div>
                      ))}
                   </div>
                 ))
               )}
            </div>

         </div>

         {/* Optional Column */}
         <div className="matrix-column glass-card">
            <div className="column-header">
               <div className="status-indicator optional"></div>
               <h4>Optional Documents</h4>
                <button 
                  className="btn-ghost" 
                  onClick={() => setModalConfig({ type: 'optional' })}
                  disabled={isDesynced || loading}
                >
                   <Edit3 size={14} /> Modify
                </button>
            </div>

            <div className="rule-list">
               {optionalGroups.length === 0 ? (
                 <div className="empty-state">No optional rules defined for this intersection.</div>
               ) : (
                 optionalGroups.map(group => (
                   <div key={group.type} className="rule-type-group">
                      <div className="type-separator">
                         <span>{group.label}</span>
                      </div>
                      {group.items.map(rule => (
                        <div key={rule.id} className={`matrix-item ${rule.isInherited ? 'inherited' : ''}`}>
                           <div className="item-info">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span className="doc-name">{rule.masterDocument.name}</span>
                                 {rule.isInherited && <span className="badge inherited-badge">Inherited</span>}
                              </div>
                              <span className="doc-stage">{rule.stageRequired}</span>
                           </div>
                           <ChevronRight size={14} color="var(--text-muted)" />
                        </div>
                      ))}
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>

      <div className="matrix-footer glass-card" style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1.25rem 2rem'
       }}>
          <div className="footer-left">
             <button 
               className="btn-ghost" 
               onClick={() => setIsImportModalOpen(true)}
               disabled={loading || isDesynced}
               style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
             >
                <DownloadCloud size={18} /> Import Rules
             </button>
          </div>

          <div className="footer-right" style={{ display: 'flex', gap: '1rem' }}>
             <button 
               className="btn-danger" 
               onClick={handleDelete}
               disabled={loading || rules.length === 0 || isDesynced}
               style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
             >
               <Trash2 size={18} /> Delete Explicit Rules
             </button>
             <button 
               className="btn-primary" 
               onClick={handleFinalise}
               disabled={loading || rules.length === 0 || isDesynced}
               style={{ 
                 backgroundColor: isDesynced ? '#94a3b8' : '#2563eb', 
                 color: 'white',
                 borderColor: isDesynced ? '#94a3b8' : '#2563eb', 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '8px', 
                 padding: '0.75rem 2rem', 
                 fontSize: '1rem',
                 fontWeight: '600'
               }}
            >
              <ShieldAlert size={18} /> Finalise Checklist Rules
            </button>
          </div>
       </div>

       {/* Audit Trail Section */}
       <div className="audit-trail-section glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
             <ShieldAlert size={18} color="var(--primary-color)" />
             <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Compliance Audit Trail</h4>
          </div>

          <div className="audit-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
             <table className="data-table compact-table" style={{ fontSize: '0.75rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--surface-color)' }}>
                   <tr>
                      <th style={{ padding: '0.5rem' }}>Timestamp</th>
                      <th style={{ padding: '0.5rem' }}>Coordinate</th>
                      <th style={{ padding: '0.5rem' }}>Changed By</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Mand. Add/Rem</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>Opt. Add/Rem</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {auditLogs.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No audit logs found.</td></tr>
                   ) : (
                      auditLogs.map(log => (
                         <tr key={log.id}>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                               <div style={{ fontWeight: 500 }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                               <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                               <div style={{ fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: 600 }}>{log.direction || 'Any'}</span> ({log.mode || 'Any'})
                               </div>
                               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {log.incoterm || 'Any'} | {log.hsCode || 'Any'}
                               </div>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                               <div style={{ fontWeight: 500 }}>{log.user?.name}</div>
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                               <span style={{ color: log.addedMandatory > 0 ? 'var(--success-color)' : 'inherit', fontWeight: 600 }}>+{log.addedMandatory}</span> / 
                               <span style={{ color: log.removedMandatory > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: 600 }}> -{log.removedMandatory}</span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.4rem 0.5rem' }}>
                               <span style={{ color: log.addedOptional > 0 ? 'var(--success-color)' : 'inherit', fontWeight: 600 }}>+{log.addedOptional}</span> / 
                               <span style={{ color: log.removedOptional > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: 600 }}> -{log.removedOptional}</span>
                            </td>
                            <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>
                               <button className="btn-ghost" onClick={() => handleQuickLoad(log)} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                  Quick Load
                               </button>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
       </div>

       {toast && (
         <div className="success-toast">
            {toast}
         </div>
       )}

       {isImportModalOpen && (
         <ImportRulesModal 
           isOpen={true}
           onClose={() => setIsImportModalOpen(false)}
           onImport={handleImport}
           authFetch={authFetch}
         />
       )}

       {modalConfig && (
         <RuleLibraryModal 
           isOpen={true}
           onClose={() => setModalConfig(null)}
           type={modalConfig.type}
           allDocuments={allMasterDocs}
           existingRules={rules.filter(r => r.isMandatory === (modalConfig.type === 'mandatory'))}
           disabledRuleIds={rules.filter(r => r.isMandatory !== (modalConfig.type === 'mandatory')).map(r => r.masterDocumentId)}
           onSave={handleSyncRules}
         />
       )}
    </div>
  );
}
