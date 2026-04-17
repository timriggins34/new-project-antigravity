import React from 'react';
import { Briefcase, Plus, Search, Filter, Ship, Airplay, ArrowRightCircle } from 'lucide-react';

export default function MasterJobList({ jobs, onCreateJob, onSelectJob }) {
  return (
    <div className="dashboard-content animate-fade-in">
      <div className="sub-header">
        <div className="page-title" style={{ fontSize: '1.25rem' }}>Master Operations Directory</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={16} />
            <input type="text" placeholder="Search Job No, Client..." />
          </div>
          <button className="btn-primary" onClick={onCreateJob}>
            <Plus size={18} /> New Master Job
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="master-jobs-table">
          <thead>
            <tr>
              <th>Job ID / No</th>
              <th>Client</th>
              <th>Direction</th>
              <th>Mode</th>
              <th>Incoterm</th>
              <th>Status</th>
              <th>Compliance</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? jobs.map(job => (
              <tr key={job.id} onClick={() => onSelectJob(job)} className="clickable-row">
                <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                  {job.jobNo}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{job.client?.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{job.client?.nickname}</div>
                </td>
                <td>
                  <span className={`badge ${job.direction?.toLowerCase()}`}>
                    {job.direction}
                  </span>
                </td>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {job.mode === 'Sea' ? <Ship size={14} /> : <Airplay size={14} />}
                  {job.mode}
                </td>
                <td>{job.incoterm || 'N/A'}</td>
                <td>
                  <div className="status-indicator">
                    <span className={`status-dot ${job.computedStatus?.toLowerCase()}`}></span>
                    {job.computedStatus}
                  </div>
                </td>
                <td>
                  <div className="mini-checklist-preview">
                    {/* Simplified progress bar or counter */}
                    <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                      {job.checklists?.filter(c => c.status === 'DONE').length} / {job.checklists?.length} Docs
                    </div>
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(job.checklists?.filter(c => c.status === 'DONE').length / (job.checklists?.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon">
                    <ArrowRightCircle size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No Master Jobs found. Initialize your first job to see it here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
