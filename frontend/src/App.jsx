import { useState, useEffect } from 'react';
import { 
  Copyleft, 
  LayoutDashboard, 
  FolderOpenDot, 
  Ship, 
  Truck, 
  FileCheck2, 
  Bell, 
  Search,
  Settings,
  MoreVertical,
  TrendingUp,
  AlertTriangle,
  Clock,
  PackageCheck,
  Plus,
  ArrowRightCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  X,
  Eye,
  MapPin,
  User,
  Navigation,
  Archive,
  Users,
  Edit,
  Trash2,
  Building2,
  Download,
  UploadCloud,
  Briefcase,
  History,
  Waves,
  Compass,
  Anchor
} from 'lucide-react';
import './App.css';
import './clearance.css';
import './docs.css';
import './logistics.css';
import './modal.css';
import ClientFormModal from './ClientFormModal';

function App() {
  const [activeTab, setActiveTab] = useState('freight');
  const [selectedClient, setSelectedClient] = useState('CLI-001');
  const [selectedVendor, setSelectedVendor] = useState('VND-001');
  const [jobFilter, setJobFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [freightFilter, setFreightFilter] = useState('All');
  const [selectedDocJob, setSelectedDocJob] = useState('IMP-8802');
  const [licenceFilter, setLicenceFilter] = useState('All');

  const navigation = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Client Directory', icon: Users },
    { id: 'vendors', label: 'Vendor Management', icon: Briefcase },
    { id: 'clearance', label: 'Customs Clearance', icon: PackageCheck },
    { id: 'docs', label: 'Documentation', icon: FolderOpenDot },
    { id: 'licences', label: 'Licences & Cert', icon: FileCheck2 },
    { id: 'logistics', label: 'Domestic Logistics', icon: Truck },
    { id: 'freight', label: 'Freight Forwarding', icon: Ship },
  ];

  // Customs Stages
  const stages = ['Filing', 'Assessment', 'Duty', 'Exam', 'OOC'];

  const [clientsData, setClientsData] = useState([]);
  const [vendorsData, setVendorsData] = useState([]);
  const [freightJobs, setFreightJobs] = useState([]);
  const [docJobs, setDocJobs] = useState([]);
  const [logisticsTrips, setLogisticsTrips] = useState([]);
  const [clearanceJobs, setClearanceJobs] = useState([]);
  const [licencesData, setLicencesData] = useState([]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchAllData = () => {
    fetch('http://localhost:3000/api/clients')
      .then(res => res.json())
      .then(data => setClientsData(data.map(d => ({ ...d, id: d.client_id }))));
      
    fetch('http://localhost:3000/api/vendors')
      .then(res => res.json())
      .then(data => setVendorsData(data.map(d => ({ ...d, id: d.vendor_id }))));

    fetch('http://localhost:3000/api/freight')
      .then(res => res.json())
      .then(data => setFreightJobs(data.map(d => ({ ...d, id: d.job_id }))));

    fetch('http://localhost:3000/api/doc-jobs')
      .then(res => res.json())
      .then(data => setDocJobs(data.map(d => ({ ...d, id: d.job_id }))));

    fetch('http://localhost:3000/api/logistics')
      .then(res => res.json())
      .then(data => setLogisticsTrips(data.map(d => ({ ...d, id: d.trip_id }))));

    fetch('http://localhost:3000/api/clearance-jobs')
      .then(res => res.json())
      .then(data => setClearanceJobs(data.map(d => ({ ...d, id: d.job_id }))));

    fetch('http://localhost:3000/api/licences')
      .then(res => res.json())
      .then(data => setLicencesData(data.map(d => ({ ...d, id: d.licence_id }))));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteClient = async (id) => {
    if(window.confirm('Are you sure you want to delete this client?')) {
      try {
        await fetch(`http://localhost:3000/api/clients/${id}`, { method: 'DELETE' });
        setSelectedClient(null);
        fetchAllData();
      } catch (e) {
        alert('Failed to delete client');
      }
    }
  };

  const activeClient = clientsData.find(c => c.id === selectedClient);
  const filteredVendors = vendorFilter === 'All' ? vendorsData : vendorsData.filter(v => v.type === vendorFilter);
  const activeVendor = vendorsData.find(v => v.id === selectedVendor);
  const filteredFreight = freightFilter === 'All' ? freightJobs : freightJobs.filter(f => f.type.includes(freightFilter));
  const activeDocJob = docJobs.find(j => j.id === selectedDocJob);
  const filteredJobs = jobFilter === 'All' ? clearanceJobs : clearanceJobs.filter(j => j.type.includes(jobFilter));

  const filteredLicences = licenceFilter === 'All' ? licencesData : licencesData.filter(l => {
    if (licenceFilter === 'Active') return l.status === 'Active';
    if (licenceFilter === 'Expiring') return l.status === 'Expiring' || l.status === 'Pending renewal';
    if (licenceFilter === 'Processing') return l.status === 'Processing';
    return true;
  });

  const renderStageProgress = (currentStage, status, hasAlert) => {
    const currentIndex = stages.indexOf(currentStage);
    
    return (
      <div>
        <div className="stage-label">
          {hasAlert ? <AlertCircle size={14} color="var(--danger-text)" /> : 
           (status === 'completed' && currentStage === 'OOC' ? <CheckCircle2 size={14} color="var(--success-text)" /> : 
           <ArrowRightCircle size={14} color="var(--primary-color)" />)}
          <span style={{ 
            color: hasAlert ? 'var(--danger-text)' : 
                   (status === 'completed' ? 'var(--success-text)' : 'inherit'),
            fontWeight: 600
          }}>
            {currentStage}
          </span>
        </div>
        <div className="stage-progress">
          {stages.map((stage, idx) => {
            let stepClass = 'stage-step ';
            if (idx < currentIndex || status === 'completed') stepClass += 'completed';
            else if (idx === currentIndex) {
              stepClass += hasAlert ? 'error' : 'active';
            }
            return <div key={stage} className={stepClass} title={stage}></div>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">
            <Copyleft size={20} />
          </div>
          <span>TradeFlow CHA</span>
        </div>
        
        <nav className="nav-links">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a 
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Operations Manager</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="page-title">
            {navigation.find(n => n.id === activeTab)?.label}
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                <span style={{ 
                  position: 'absolute', top: 0, right: 0, width: 8, height: 8, 
                  backgroundColor: 'var(--danger-text)', borderRadius: '50%' 
                }}></span>
              </button>
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button className="btn-icon" onClick={() => setShowNotifications(false)}><X size={16}/></button>
                  </div>
                  <div className="modal-body" style={{ padding: 0, maxHeight: '300px', gap: 0 }}>
                    {clearanceJobs.filter(j => j.alert).map((job, i) => (
                      <div key={`c-${i}`} className="notif-item">
                        <AlertTriangle size={16} color="var(--danger-text)" style={{ flexShrink: 0, marginTop: '2px' }}/>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Clearance Alert: #{job.id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.client} • Duty Payment Overdue</div>
                        </div>
                      </div>
                    ))}
                    {freightJobs.filter(j => j.alert).map((job, i) => (
                      <div key={`f-${i}`} className="notif-item">
                        <AlertTriangle size={16} color="var(--warning-text)" style={{ flexShrink: 0, marginTop: '2px' }}/>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Freight Alert: #{job.id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.pol} to {job.pod} • Delayed</div>
                        </div>
                      </div>
                    ))}
                    {licencesData.filter(l => l.alert).map((lic, i) => (
                      <div key={`l-${i}`} className="notif-item">
                        <Clock size={16} color="var(--danger-text)" style={{ flexShrink: 0, marginTop: '2px' }}/>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Licence Expiring: {lic.id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lic.client} • {lic.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="icon-btn"><Settings size={18} /></button>
          </div>
        </header>

        {/* Global Client Form Modal */}
        <ClientFormModal 
          isOpen={isClientModalOpen} 
          onClose={() => setIsClientModalOpen(false)} 
          onSuccess={fetchAllData} 
        />

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
             <div className="metrics-grid">
              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Active Clearances</span>
                  <div className="metric-icon"><PackageCheck size={20} /></div>
                </div>
                <div className="metric-value">142</div>
                <div className="metric-trend trend-up">
                  <TrendingUp size={14} /> +12% from last week
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Logistics (En Route)</span>
                  <div className="metric-icon"><Truck size={20} /></div>
                </div>
                <div className="metric-value">38</div>
                <div className="metric-trend trend-up">
                  <TrendingUp size={14} /> 4 arriving today
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Pending Documents</span>
                  <div className="metric-icon"><FolderOpenDot size={20} /></div>
                </div>
                <div className="metric-value" style={{ color: 'var(--warning-text)'}}>24</div>
                <div className="metric-trend trend-down">
                  <AlertTriangle size={14} /> 5 critical missing
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Upcoming Freight</span>
                  <div className="metric-icon"><Ship size={20} /></div>
                </div>
                <div className="metric-value">18</div>
                <div className="metric-trend trend-up">
                  <Clock size={14} /> Next ETA: 14:00 (Vessel A)
                </div>
              </div>
            </div>
            
            <div className="bento-grid">
               <div className="bento-item glass-card">
                 <div className="section-title">Use the sidebar to navigate to Customs Clearance.</div>
               </div>
            </div>
          </div>
        )}

        {/* CUSTOMS CLEARANCE MODULE */}
        {activeTab === 'clearance' && (
          <div className="dashboard-content">
            
            {/* Contextual Actions */}
            <div className="sub-header">
              <div className="filter-pills">
                {['All', 'Sea Import', 'Air Import', 'Export'].map(filter => (
                  <div 
                    key={filter} 
                    className={`filter-pill ${jobFilter === filter ? 'active' : ''}`}
                    onClick={() => setJobFilter(filter)}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <button className="btn-primary">
                <Plus size={18} /> New Job
              </button>
            </div>

            {/* Sub-Metrics */}
            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Assessment Pending</span><AlertTriangle size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>12</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Duty Unpaid</span><Clock size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>8</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Exam Scheduled</span><Search size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>5</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Cleared Today (OOC)</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>24</div>
              </div>
            </div>

            <div className="bento-item glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="section-title" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
                Active Clearance Jobs
              </div>
              <div className="data-table-container">
                <table className="data-table data-table-enhanced">
                  <thead>
                    <tr>
                      <th>Job No.</th>
                      <th>Client</th>
                      <th>Type / Port</th>
                      <th>Clearance Stage</th>
                      <th>Assigned To</th>
                      <th>Last Updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id}>
                        <td><strong>#{job.id}</strong></td>
                        <td>{job.client}</td>
                        <td>
                          <div>{job.type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.port}</div>
                        </td>
                        <td>
                          {renderStageProgress(job.stage, job.status, job.alert)}
                          {job.alert && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', marginTop: '4px' }}>
                              {job.stage === 'Filing' ? 'Missing HBL Copy' : 'Duty Payment Overdue'}
                            </div>
                          )}
                        </td>
                        <td>{job.assigned}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{job.date}</td>
                        <td>
                          <div className="table-action-menu"><MoreVertical size={18} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* DOCUMENTATION MODULE */}
        {activeTab === 'docs' && (
          <div className="dashboard-content">
            
            {/* Sub-Metrics */}
            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pending Verification</span><Eye size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>14</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Missing Documents</span><AlertCircle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>7</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Verified Today</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>42</div>
              </div>
            </div>

            <div className="docs-split-container">
              {/* Inbox Left Panel */}
              <div className="bento-item glass-card docs-inbox">
                 <div className="section-title" style={{ padding: '0.75rem', fontSize: '1rem', marginBottom: 0 }}>Review Queue</div>
                 {docJobs.map(job => (
                   <div 
                     key={job.id} 
                     className={`doc-job-card ${selectedDocJob === job.id ? 'active' : ''}`}
                     onClick={() => setSelectedDocJob(job.id)}
                   >
                     <div className="doc-job-header">
                       <span className="doc-job-id">#{job.id}</span>
                       <span className={`doc-status-badge doc-status-${job.status}`}>
                         {job.status === 'review' ? 'In Review' : job.status}
                       </span>
                     </div>
                     <span className="doc-job-client">{job.client} • {job.type}</span>
                   </div>
                 ))}
              </div>

              {/* Viewer Right Panel */}
              <div className="bento-item glass-card doc-viewer" style={{ padding: 0 }}>
                {activeDocJob ? (
                  <>
                    <div className="doc-viewer-header">
                      <div className="doc-viewer-title">
                        <h3>Job #{activeDocJob.id} Details</h3>
                        <p>{activeDocJob.client} - {activeDocJob.type}</p>
                      </div>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Request Missing</button>
                    </div>
                    <div className="doc-checklist">
                      {activeDocJob.docs.map((doc, idx) => (
                        <div key={idx} className="doc-item">
                          <div className="doc-item-info">
                            <div className="doc-icon"><FileText size={20} /></div>
                            <div>
                              <div className="doc-name">{doc.name}</div>
                              <div className="doc-meta">
                                <span style={{ 
                                  color: doc.status === 'verified' ? 'var(--success-text)' : 
                                         doc.status === 'missing' ? 'var(--danger-text)' : 'var(--warning-text)'
                                }}>
                                  ● {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </span>
                                {' '}• PDF Document
                              </div>
                            </div>
                          </div>
                          <div className="doc-actions">
                            <button className="btn-icon" title="View"><Eye size={16} /></button>
                            <button className="btn-icon verify" title="Verify"><Check size={16} /></button>
                            <button className="btn-icon reject" title="Reject"><X size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a job from the queue to review documents.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* LICENCES MODULE */}
        {activeTab === 'licences' && (
          <div className="dashboard-content">
            <div className="sub-header">
              <div className="filter-pills">
                {['All', 'Active', 'Expiring', 'Processing'].map(filter => (
                  <div 
                    key={filter} 
                    className={`filter-pill ${licenceFilter === filter ? 'active' : ''}`}
                    onClick={() => setLicenceFilter(filter)}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <button className="btn-primary">
                <Plus size={18} /> New Licence
              </button>
            </div>

            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Licences</span><FileCheck2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>84</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Expiring in 30 Days</span><AlertTriangle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>12</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pending Renewal</span><Clock size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>5</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Applications Processing</span><FileText size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>9</div>
              </div>
            </div>

            <div className="bento-item glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="section-title" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
                Licences & Certifications Register
              </div>
              <div className="data-table-container">
                <table className="data-table data-table-enhanced">
                  <thead>
                    <tr>
                      <th>Licence No.</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Expiry Date</th>
                      <th style={{ width: '150px' }}>Value Utilized</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicences.map(lic => (
                      <tr key={lic.id}>
                        <td><strong>{lic.id}</strong></td>
                        <td>{lic.client}</td>
                        <td>{lic.type}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: lic.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 
                                             lic.status === 'Processing' ? 'rgba(56, 189, 248, 0.1)' :
                                             'rgba(239, 68, 68, 0.1)',
                            color: lic.status === 'Active' ? 'var(--success-text)' : 
                                   lic.status === 'Processing' ? 'var(--info-text)' :
                                   'var(--danger-text)'
                          }}>
                            {lic.status}
                          </span>
                        </td>
                        <td style={{ color: lic.alert ? 'var(--danger-text)' : 'inherit', fontWeight: lic.alert ? 600 : 'normal' }}>
                          {lic.expiry}
                          {lic.alert && <AlertTriangle size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                        </td>
                        <td>
                          {lic.utilized !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${lic.utilized}%`, height: '100%', 
                                  background: lic.utilized > 90 ? 'var(--danger-text)' : 'var(--primary-color)',
                                  borderRadius: '3px'
                                }}></div>
                              </div>
                              <span style={{ fontSize: '0.75rem', width: '30px', textAlign: 'right' }}>{lic.utilized}%</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <div className="table-action-menu"><MoreVertical size={18} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DOMESTIC LOGISTICS MODULE */}
        {activeTab === 'logistics' && (
          <div className="dashboard-content">
            
            {/* Sub-Metrics */}
            <div className="metrics-grid" style={{ marginBottom: '0.5rem' }}>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Fleet</span><Truck size={16} color="var(--primary-color)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>45/60</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pending Dispatch</span><Clock size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>2</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Delayed En Route</span><AlertTriangle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--danger-text)' }}>1</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Deliveries Completed</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>18</div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
              
              {/* Column 1: Pending Dispatch */}
              <div className="kanban-column">
                <div className="kanban-header">
                  <div className="kanban-title"><Archive size={16} /> Pending Dispatch</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'dispatch').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'dispatch').map(trip => (
                    <div key={trip.id} className="trip-card">
                      <div className="trip-header">
                        <span className="trip-job-id">Job #{trip.job}</span>
                        <span className="trip-truck" style={{ backgroundColor: trip.truck === 'Pending Allocation' ? 'var(--warning-bg)' : 'var(--bg-color)' }}>
                           <Truck size={12} /> {trip.truck}
                        </span>
                      </div>
                      <div className="trip-route">
                        <MapPin size={14} color="var(--text-muted)" />
                        <span className="trip-location">{trip.from}</span>
                        <span className="trip-separator">➔</span>
                        <span className="trip-location">{trip.to}</span>
                      </div>
                      <div className="trip-meta">
                        <span className="trip-driver"><User size={12} /> {trip.driver}</span>
                        <span className="trip-eta"><Clock size={12} /> {trip.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: En Route */}
              <div className="kanban-column">
                <div className="kanban-header">
                  <div className="kanban-title"><Navigation size={16} color="var(--info-text)" /> En Route</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'enroute').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'enroute').map(trip => (
                    <div key={trip.id} className="trip-card" style={{ borderColor: trip.delayed ? 'var(--danger-text)' : 'var(--border-color)' }}>
                      <div className="trip-header">
                        <span className="trip-job-id">Job #{trip.job}</span>
                        <span className="trip-truck"><Truck size={12} /> {trip.truck}</span>
                      </div>
                      <div className="trip-route">
                        <Navigation size={14} color={trip.delayed ? 'var(--danger-text)' : 'var(--primary-color)'} />
                        <span className="trip-location">{trip.from}</span>
                        <span className="trip-separator">➔</span>
                        <span className="trip-location">{trip.to}</span>
                      </div>
                      <div className="trip-meta">
                        <span className="trip-driver"><User size={12} /> {trip.driver}</span>
                        <span className={`trip-eta ${trip.delayed ? 'delayed' : ''}`}>
                          {trip.delayed ? <AlertTriangle size={12} /> : <Clock size={12} />} {trip.eta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Arrived / Completed */}
              <div className="kanban-column">
                <div className="kanban-header">
                  <div className="kanban-title"><CheckCircle2 size={16} color="var(--success-text)" /> Arrived</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'arrived').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'arrived').map(trip => (
                    <div key={trip.id} className="trip-card" style={{ opacity: 0.7 }}>
                      <div className="trip-header">
                        <span className="trip-job-id">Job #{trip.job}</span>
                        <span className="trip-truck"><Truck size={12} /> {trip.truck}</span>
                      </div>
                      <div className="trip-route">
                        <MapPin size={14} color="var(--success-text)" />
                        <span className="trip-location" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{trip.from}</span>
                        <span className="trip-separator">➔</span>
                        <span className="trip-location">{trip.to}</span>
                      </div>
                      <div className="trip-meta">
                        <span className="trip-driver"><User size={12} /> {trip.driver}</span>
                        <span className="trip-eta" style={{ color: 'var(--success-text)' }}><Check size={12} /> {trip.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CLIENTS MODULE */}
        {activeTab === 'clients' && (
          <div className="dashboard-content">
            <div className="sub-header">
              <div className="page-title" style={{ fontSize: '1.25rem' }}>Client Management</div>
              <button className="btn-primary" onClick={() => setIsClientModalOpen(true)}>
                <Plus size={18} /> Add Client
              </button>
            </div>

            <div className="docs-split-container">
              {/* Client List (Left) */}
              <div className="bento-item glass-card docs-inbox">
                 <div className="section-title" style={{ padding: '0.75rem', fontSize: '1rem', marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> Directory</div>
                 </div>
                 {clientsData.map(client => (
                   <div 
                     key={client.id} 
                     className={`doc-job-card ${selectedClient === client.id ? 'active' : ''}`}
                     onClick={() => setSelectedClient(client.id)}
                   >
                     <div className="doc-job-header">
                       <span className="doc-job-id">{client.name}</span>
                     </div>
                     <span className="doc-job-client"><MapPin size={12} style={{display:'inline', marginRight:'4px'}}/>{client.address}</span>
                   </div>
                 ))}
              </div>

              {/* Client Details (Right) */}
              <div className="bento-item glass-card doc-viewer" style={{ padding: 0 }}>
                {activeClient ? (
                  <>
                    <div className="doc-viewer-header">
                      <div className="doc-viewer-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h3><Building2 size={20} style={{ display: 'inline', color: 'var(--primary-color)' }}/> {activeClient.name}</h3>
                          <span style={{ padding: '2px 6px', fontSize: '0.7rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600 }}>{activeClient.clientType}</span>
                          <span style={{ padding: '2px 6px', fontSize: '0.7rem', backgroundColor: activeClient.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: activeClient.status === 'Active' ? 'var(--success-text)' : 'var(--danger-text)', borderRadius: '4px', fontWeight: 600 }}>{activeClient.status}</span>
                        </div>
                        <p><MapPin size={14} style={{ display:'inline', marginRight: 4 }}/>{activeClient.address}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="Edit"><Edit size={16} /></button>
                        <button className="btn-icon reject" title="Delete" onClick={() => handleDeleteClient(activeClient.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
                      
                      {/* Identity & Contact Section */}
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>Business Identity & Contact</h4>
                        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Constitution</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.constitution}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client Since</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.clientSinceYear || 'N/A'}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Contact Person</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.contactPerson}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Mobile</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.mobile}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Email</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeClient.email}</div>
                           </div>
                        </div>
                      </div>

                      {/* Registration & Compliance Section */}
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>Registration & Compliance</h4>
                        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IEC Code</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.iec}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.gstin}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAN</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.pan}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TAN</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.tan}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CIN / LLPIN</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.cin_llpin}</div>
                           </div>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AD Code</div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeClient.adCode}</div>
                           </div>
                        </div>
                      </div>

                      {/* Bank Details Section */}
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>Bank Accounts (Primary)</h4>
                        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                           <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeClient.bankName} - {activeClient.branchName}</div>
                              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{activeClient.accountNumber} <span style={{ fontSize: '0.7rem', color: 'var(--info-text)' }}>({activeClient.accountType})</span></div>
                              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>IFSC: {activeClient.ifsc} | SWIFT: {activeClient.swift}</div>
                           </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Document Vault</h4>
                            <button className="btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                               <UploadCloud size={16} /> Upload Doc
                            </button>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {activeClient.docs.map((doc, idx) => (
                               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                     <FileText size={18} color="var(--primary-color)" />
                                     <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc}.pdf</span>
                                  </div>
                                  <button className="btn-icon" style={{ width: '28px', height: '28px' }}><Download size={14} /></button>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a client to view details.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* VENDORS MODULE */}
        {activeTab === 'vendors' && (
          <div className="dashboard-content">
            <div className="sub-header">
              <div className="filter-pills">
                {['All', 'Trucking', 'Freight', 'Terminal', 'Gov'].map(filter => (
                  <div 
                    key={filter} 
                    className={`filter-pill ${vendorFilter === filter ? 'active' : ''}`}
                    onClick={() => setVendorFilter(filter)}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <button className="btn-primary">
                <Plus size={18} /> Add Vendor
              </button>
            </div>

            <div className="docs-split-container">
              {/* Vendor List (Left) */}
              <div className="bento-item glass-card docs-inbox">
                 <div className="section-title" style={{ padding: '0.75rem', fontSize: '1rem', marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} /> Directory</div>
                 </div>
                 {filteredVendors.map(vendor => (
                   <div 
                     key={vendor.id} 
                     className={`doc-job-card ${selectedVendor === vendor.id ? 'active' : ''}`}
                     onClick={() => setSelectedVendor(vendor.id)}
                   >
                     <div className="doc-job-header">
                       <span className="doc-job-id">{vendor.name}</span>
                       <span className="doc-status-badge doc-status-pending" style={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>{vendor.type}</span>
                     </div>
                     <span className="doc-job-client"><User size={12} style={{display:'inline', marginRight:'4px'}}/>{vendor.contact}</span>
                   </div>
                 ))}
                 {filteredVendors.length === 0 && <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No vendors found for this category.</div>}
              </div>

              {/* Vendor Details (Right) */}
              <div className="bento-item glass-card doc-viewer" style={{ padding: 0 }}>
                {activeVendor ? (
                  <>
                    <div className="doc-viewer-header">
                      <div className="doc-viewer-title">
                        <h3><Building2 size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom', color: 'var(--primary-color)' }}/> {activeVendor.name}</h3>
                        <p>{activeVendor.type} Partner</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" title="Edit"><Edit size={16} /></button>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                      <div className="bento-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Contact</div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{activeVendor.contact}</div>
                         </div>
                         <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone / Email</div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{activeVendor.phone}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>{activeVendor.email}</div>
                         </div>
                      </div>

                      {/* Active Jobs Section */}
                      <div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <CheckCircle2 size={16} color="var(--success-text)"/> Connected Active Jobs
                            </h4>
                         </div>
                         <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activeVendor.activeJobs.length > 0 ? activeVendor.activeJobs.map(jobId => (
                               <div key={jobId} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-text)', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                  #{jobId}
                               </div>
                            )) : <span style={{ color: 'var(--text-muted)' }}>No active assignments.</span>}
                         </div>
                      </div>

                      {/* Past Jobs Section */}
                      <div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <History size={16} color="var(--text-muted)"/> Past Employed Jobs
                            </h4>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {activeVendor.pastJobs.length > 0 ? activeVendor.pastJobs.map(jobId => (
                               <div key={jobId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Job #{jobId}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                               </div>
                            )) : <span style={{ color: 'var(--text-muted)' }}>No past history.</span>}
                         </div>
                      </div>

                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a vendor to view details.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* FREIGHT FORWARDING MODULE */}
        {activeTab === 'freight' && (
          <div className="dashboard-content">
            <div className="sub-header">
              <div className="filter-pills">
                {['All', 'Sea Import', 'Air Import', 'Sea Export', 'Air Export'].map(filter => (
                  <div 
                    key={filter} 
                    className={`filter-pill ${freightFilter === filter ? 'active' : ''}`}
                    onClick={() => setFreightFilter(filter)}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <button className="btn-primary">
                <Plus size={18} /> New Shipment
              </button>
            </div>

            {/* Sub-Metrics */}
            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Voyages</span><Waves size={16} color="var(--primary-color)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>18</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">ETA This Week</span><Compass size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>6</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Delayed Transits</span><AlertTriangle size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem', color: "var(--danger-text)" }}>2</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pre-Alerts Missing</span><AlertCircle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>3</div>
              </div>
            </div>

            <div className="bento-item glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="section-title" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
                Freight Tracking Board
              </div>
              <div className="data-table-container">
                <table className="data-table data-table-enhanced">
                  <thead>
                    <tr>
                      <th>Job Ref / Carrier Ref</th>
                      <th>Mode / Status</th>
                      <th>Routing (POL ➔ POD)</th>
                      <th>Vessel / Flight Details</th>
                      <th>Departure (ETD)</th>
                      <th>Arrival (ETA)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFreight.map(job => (
                      <tr key={job.id}>
                        <td>
                          <strong>#{job.id}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.mbl || job.awb}</div>
                        </td>
                        <td>
                          <div>{job.type}</div>
                          <span style={{ 
                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                            backgroundColor: job.status === 'In Transit' ? 'rgba(56, 189, 248, 0.1)' : 
                                             job.status === 'Arrived' ? 'rgba(34, 197, 94, 0.1)' :
                                             job.status === 'Delayed' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-color)',
                            color: job.status === 'In Transit' ? 'var(--info-text)' : 
                                   job.status === 'Arrived' ? 'var(--success-text)' :
                                   job.status === 'Delayed' ? 'var(--danger-text)' : 'var(--text-muted)'
                          }}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <span style={{ fontWeight: 500 }}>{job.pol.split(',')[0]}</span>
                             <ArrowRightCircle size={12} color="var(--text-muted)"/>
                             <span style={{ fontWeight: 500 }}>{job.pod.split(',')[0]}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.pol.split(',')[1]} ➔ {job.pod.split(',')[1]}</div>
                        </td>
                        <td>
                          <div>{job.vessel}</div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{job.etd}</td>
                        <td style={{ color: job.alert ? 'var(--danger-text)' : 'inherit', fontWeight: job.alert ? 600 : 'normal' }}>
                          {job.eta}
                          {job.alert && <AlertTriangle size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                        </td>
                        <td>
                          <div className="table-action-menu"><MoreVertical size={18} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {!['dashboard', 'clients', 'vendors', 'clearance', 'docs', 'licences', 'logistics', 'freight'].includes(activeTab) && (
          <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <div style={{ textAlign: 'center' }}>
              <FolderOpenDot size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-color)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{navigation.find(n => n.id === activeTab)?.label} Module</h2>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>This sub-module will contain specific workflows for this service.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
