import React, { useState, useMemo } from 'react';
import { X, Search, Check, Save } from 'lucide-react';

export default function RuleLibraryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  allDocuments, 
  existingRules, 
  disabledRuleIds,
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


  const formatType = (type) => {
    if (!type) return 'Other';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const groupedDocs = useMemo(() => {
    const groups = {};
    
    // 1. Group documents
    filteredDocs.forEach(doc => {
      const typeKey = doc.type || 'OTHER';
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push(doc);
    });

    // 2. Sort groups based on order
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
        docs: groups[key]
      }));
  }, [filteredDocs]);


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
                {groupedDocs.map(group => (
                  <React.Fragment key={group.type}>
                    {/* Category Header Row */}
                    <tr style={{ 
                      position: 'sticky', 
                      top: '36px', // Header height offset
                      zIndex: 1, 
                      backgroundColor: 'var(--bg-muted)', 
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <td colSpan="4" style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {group.label}
                      </td>
                    </tr>

                    {group.docs.map(doc => {
                      const selection = selections[doc.id];
                      const isSelected = !!selection?.selected;
                      const isDisabled = disabledRuleIds?.includes(doc.id);
                      const oppositeTypeLabel = type === 'mandatory' ? 'Optional' : 'Mandatory';
                      
                      return (
                        <tr 
                          key={doc.id} 
                          className={`${isSelected ? 'row-selected' : ''} ${isDisabled ? 'row-disabled' : ''}`} 
                          onClick={() => !isDisabled && toggleDoc(doc.id)} 
                          style={{ 
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.5 : 1
                          }}
                        >
                          <td style={{ padding: '0.4rem 0.5rem' }}>
                            <div className={`checkbox-custom ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`} style={{ width: '16px', height: '16px' }}>
                              {isSelected && <Check size={12} color="white" />}
                            </div>
                          </td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {doc.name}
                              {isDisabled && (
                                <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                                  (Selected in {oppositeTypeLabel})
                                </span>
                              )}
                            </div>
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
                  </React.Fragment>
                ))}
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
