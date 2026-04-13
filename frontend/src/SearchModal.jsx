import React, { useState } from 'react';
import { X, Search as SearchIcon, ArrowRightCircle } from 'lucide-react';
import './modal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '600px', top: '15%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', padding: '1.5rem 1.5rem 0.5rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <SearchIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              autoFocus
              placeholder="Search anything... (Jobs, Clients, Vendors, MBL...)" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.75rem', 
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                fontSize: '1rem', background: 'var(--bg-color)', transition: 'var(--transition)'
              }}
            />
          </div>
          <button className="btn-icon" onClick={onClose} style={{ marginLeft: '1rem' }}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '0 1.5rem 1.5rem' }}>
          {query.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recent Matches</div>
              <div className="notif-item" style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                <SearchIcon size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Job #IMP-8201 for Alpha Corp</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found in Customs Clearance</div>
                </div>
                <ArrowRightCircle size={16} color="var(--primary-color)"/>
              </div>
              {/* Add more mock results as needed */}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>Start typing to search across all modules...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
