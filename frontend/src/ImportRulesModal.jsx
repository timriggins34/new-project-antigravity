import React, { useState } from 'react';
import { X, Search, DownloadCloud, AlertTriangle } from 'lucide-react';
import { INCOTERMS } from './RulesManager';

export default function ImportRulesModal({ isOpen, onClose, onImport, authFetch }) {
  const [filters, setFilters] = useState({
    direction: 'Import',
    mode: 'Sea',
    incoterm: 'ANY',
    hsCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleImportClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await authFetch(`http://localhost:3000/api/document-rules/matrix?${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          setError('No rules found for the selected coordinates.');
          return;
        }
        onImport(data);
        onClose();
      } else {
        setError('Failed to fetch rules from the source.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="rule-modal glass-card" style={{ width: '450px' }}>
        <div className="modal-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DownloadCloud size={20} color="var(--primary-color)" />
              <h3 style={{ margin: 0 }}>Import Rules From...</h3>
           </div>
           <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Select the source coordinates you want to clone rules from. This will overwrite your current draft.
           </p>

           <div className="filter-group" style={{ marginBottom: '1rem' }}>
             <label>Direction</label>
             <select 
               value={filters.direction} 
               onChange={e => setFilters({...filters, direction: e.target.value})}
               style={{ width: '100%' }}
             >
               <option value="Import">Import</option>
               <option value="Export">Export</option>
               <option value="ANY">Any</option>
             </select>
           </div>

           <div className="filter-group" style={{ marginBottom: '1rem' }}>
             <label>Mode</label>
             <select 
               value={filters.mode} 
               onChange={e => setFilters({...filters, mode: e.target.value})}
               style={{ width: '100%' }}
             >
               <option value="Sea">Sea</option>
               <option value="Air">Air</option>
               <option value="ANY">Any</option>
             </select>
           </div>

           <div className="filter-group" style={{ marginBottom: '1rem' }}>
             <label>Incoterm</label>
             <select 
               value={filters.incoterm} 
               onChange={e => setFilters({...filters, incoterm: e.target.value})}
               style={{ width: '100%' }}
             >
               <option value="ANY">Any</option>
               {INCOTERMS.map(inc => <option key={inc} value={inc}>{inc}</option>)}
             </select>
           </div>

           <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
             <label>HS Code</label>
             <input 
                type="text" 
                placeholder="e.g. 8501"
                value={filters.hsCode}
                onChange={e => setFilters({...filters, hsCode: e.target.value})}
                style={{ width: '100%' }}
             />
           </div>

           {error && (
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '8px', 
               color: 'var(--danger-color)', 
               fontSize: '0.85rem',
               marginBottom: '1rem',
               padding: '0.5rem',
               backgroundColor: 'rgba(239, 68, 68, 0.1)',
               borderRadius: '4px'
             }}>
               <AlertTriangle size={14} />
               <span>{error}</span>
             </div>
           )}
        </div>

        <div className="modal-footer" style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
           <button 
             className="btn-primary" 
             onClick={handleImportClick} 
             disabled={loading}
             style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
           >
              {loading ? 'Fetching...' : (
                <>
                  <DownloadCloud size={16} />
                  Import Rules
                </>
              )}
           </button>
        </div>
      </div>
    </div>
  );
}
