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
  Library
} from 'lucide-react';
import RuleLibraryModal from './RuleLibraryModal';

const INCOTERMS = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];

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
  const [allMasterDocs, setAllMasterDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState(null); // { type: 'mandatory' | 'optional' }

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
  }, [fetchLib]);

  const mandatoryRules = rules.filter(r => r.isMandatory);
  const optionalRules = rules.filter(r => !r.isMandatory);

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
            Define document requirements for specific job intersections
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
          <div className="input-with-icon">
            <Binary size={14} />
            <input 
              type="text" 
              placeholder="Exact HS Code..." 
              value={filters.hsCode} 
              onChange={e => setFilters({...filters, hsCode: e.target.value})}
            />
          </div>
        </div>
        <button className="btn-primary" onClick={handleGo} disabled={loading}>
          {loading ? '...' : 'Load Matrix'}
        </button>
      </div>


      <div className="matrix-grid">
         {/* Mandatory Column */}
         <div className="matrix-column glass-card">
            <div className="column-header">
               <div className="status-indicator mandatory"></div>
               <h4>Mandatory Documents</h4>
               <button className="btn-ghost" onClick={() => setModalConfig({ type: 'mandatory' })}>
                  <Edit3 size={14} /> Modify
               </button>
            </div>
            
            <div className="rule-list">
               {mandatoryRules.length === 0 ? (
                 <div className="empty-state">No mandatory rules defined for this intersection.</div>
               ) : (
                 mandatoryRules.map(rule => (
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
                 ))
               )}
            </div>

         </div>

         {/* Optional Column */}
         <div className="matrix-column glass-card">
            <div className="column-header">
               <div className="status-indicator optional"></div>
               <h4>Optional Documents</h4>
               <button className="btn-ghost" onClick={() => setModalConfig({ type: 'optional' })}>
                  <Edit3 size={14} /> Modify
               </button>
            </div>

            <div className="rule-list">
               {optionalRules.length === 0 ? (
                 <div className="empty-state">No optional rules defined for this intersection.</div>
               ) : (
                 optionalRules.map(rule => (
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
                 ))

               )}
            </div>
         </div>
      </div>

      <div className="matrix-footer glass-card" style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem',
          padding: '1.25rem 2rem'
       }}>
          <button 
            className="btn-danger" 
            onClick={handleDelete}
            disabled={loading || rules.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Trash2 size={18} /> Delete Explicit Rules
          </button>
          <button 
            className="btn-primary" 
            onClick={handleFinalise}
            disabled={loading || rules.length === 0}
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white',
              borderColor: '#2563eb', 
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


       {toast && (
         <div className="success-toast">
            {toast}
         </div>
       )}

      {modalConfig && (
        <RuleLibraryModal 
          isOpen={true}
          onClose={() => setModalConfig(null)}
          type={modalConfig?.type}
          allDocuments={allMasterDocs}
          existingRules={rules.filter(r => r.isMandatory === (modalConfig?.type === 'mandatory'))}
          onSave={handleSyncRules}
        />
      )}
    </div>
  );
}

