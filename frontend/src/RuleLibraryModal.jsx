import React, { useState, useMemo } from 'react';
import { X, Search, Check, Save } from 'lucide-react';

export default function RuleLibraryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  allDocuments, 
  existingRules, 
  type 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  // Map of documentId -> { selected: boolean, stage: string, isMandatory: boolean }
  const [selections, setSelections] = useState({});

  // Clean initialization on mount or type change
  React.useEffect(() => {
    setSearchTerm('');
    const initial = {};
    existingRules.forEach(rule => {
      initial[rule.masterDocumentId] = {
        selected: true,
        stage: rule.stageRequired || 'Pre-Shipment',
        isMandatory: rule.isMandatory
      };
    });
    setSelections(initial);
  }, [type, existingRules]);

  const filteredDocs = useMemo(() => {
    const filtered = allDocuments.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Sort: Selected first (alphabetical), then others (alphabetical)
    return filtered.sort((a, b) => {
      const aSel = !!selections[a.id]?.selected;
      const bSel = !!selections[b.id]?.selected;
      
      if (aSel && !bSel) return -1;
      if (!aSel && bSel) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allDocuments, searchTerm, selections]);


  const toggleDoc = (docId) => {
    setSelections(prev => {
      const current = prev[docId];
      if (current && current.selected) {
        // Deselect
        const next = { ...prev };
        delete next[docId];
        return next;
      } else {
        // Select
        return {
          ...prev,
          [docId]: {
            selected: true,
            stage: 'Pre-Shipment',
            isMandatory: type === 'mandatory'
          }
        };
      }
    });
  };

  const updateStage = (docId, stage) => {
    setSelections(prev => ({
      ...prev,
      [docId]: { ...prev[docId], stage }
    }));
  };

  const handleSave = () => {
    const finalRules = Object.entries(selections)
      .filter(([_, val]) => val.selected)
      .map(([docId, val]) => ({
        masterDocumentId: docId,
        stageRequired: val.stage,
        isMandatory: type === 'mandatory'
      }));
    onSave(finalRules);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ width: '800px', maxHeight: '90vh', zIndex: 10000, position: 'relative' }}>
        <div className="modal-header" style={{ padding: '0.75rem 1.25rem' }}>
          <div className="modal-title">
             <h3 style={{ fontSize: '1.1rem' }}>Manage {type === 'mandatory' ? 'Mandatory' : 'Optional'} Rule Library</h3>
             <p style={{ fontSize: '0.8rem' }}>Select documents to apply to this matrix intersection</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20}/></button>
        </div>

        <div className="modal-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search master library by name or abbreviation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.875rem', height: '36px' }}
            />
          </div>

          <div className="library-list" style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <table className="data-table compact-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-color)' }}>
                <tr>
                  <th style={{ width: '40px', padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Document Name</th>
                  <th style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Abbreviation</th>
                  <th style={{ width: '160px', padding: '0.5rem', fontSize: '0.8rem' }}>Default Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => {
                  const selection = selections[doc.id];
                  const isSelected = !!selection?.selected;
                  
                  return (
                    <tr 
                      key={doc.id} 
                      className={isSelected ? 'row-selected' : ''} 
                      onClick={() => toggleDoc(doc.id)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <div className={`checkbox-custom ${isSelected ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                          {isSelected && <Check size={12} color="white" />}
                        </div>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{doc.name}</div>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <span className="badge-outline" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{doc.abbreviation}</span>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }} onClick={(e) => e.stopPropagation()}>
                        <select 
                          className="form-input" 
                          disabled={!isSelected}
                          value={selection?.stage || ''}
                          onChange={(e) => updateStage(doc.id, e.target.value)}
                          style={{ height: '28px', fontSize: '12px', padding: '0 4px' }}
                        >
                          <option value="Pre-Shipment">Pre-Shipment</option>
                          <option value="Filing">Filing</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Duty">Duty</option>
                          <option value="Exam">Exam</option>
                          <option value="OOC">OOC</option>
                          <option value="Transit">Transit</option>
                          <option value="Post-Shipment">Post-Shipment</option>
                          <option value="General">General</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '0.75rem 1.25rem' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: '0.875rem' }}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ fontSize: '0.875rem' }}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>

  );
}
