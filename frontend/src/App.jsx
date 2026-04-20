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
  Anchor,
  LogOut
} from 'lucide-react';
import Login from './Login';
import './App.css';
import './clearance.css';
import './docs.css';
import './logistics.css';
import './modal.css';
import ClientFormModal from './ClientFormModal';
import VendorFormModal from './VendorFormModal';
import ClearanceJobFormModal from './ClearanceJobFormModal';
import LicenceFormModal from './LicenceFormModal';
import FreightFormModal from './FreightFormModal';
import LogisticsFormModal from './LogisticsFormModal';
import SearchModal from './SearchModal';
import SettingsModal from './SettingsModal';
import ClearanceDetailModal from './ClearanceDetailModal';
import FreightDetailModal from './FreightDetailModal';
import LogisticsDetailModal from './LogisticsDetailModal';
import DispatchModal from './DispatchModal';
import MasterJobList from './MasterJobList';
import MasterJobFormModal from './MasterJobFormModal';
import MasterJobDetailModal from './MasterJobDetailModal';
import RulesManager from './RulesManager';
import { ShieldCheck } from 'lucide-react';


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [jobFilter, setJobFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [freightFilter, setFreightFilter] = useState('All');
  const [selectedDocJob, setSelectedDocJob] = useState(null);
  const [licenceFilter, setLicenceFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [masterJobs, setMasterJobs] = useState([]);
  const [isMasterJobModalOpen, setIsMasterJobModalOpen] = useState(false);
  const [selectedMasterJob, setSelectedMasterJob] = useState(null);


  /**
   * Helper to include JWT token in all API requests automatically
   */
  const authenticatedFetch = async (url, options = {}) => {
    const currentToken = token || localStorage.getItem('tf_token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${currentToken}`
    };
    
    // Only set JSON content-type if not sending FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      return null;
    }
    
    return res;
  };

  /**
   * Safe JSON extraction that gracefully handles non-JSON responses
   */
  const handleApiResponse = async (res, defaultMsg) => {
    if (res.ok) return true;
    try {
      const data = await res.json();
      alert(`Error: ${data.error || defaultMsg}`);
    } catch (e) {
      alert(`Error: ${defaultMsg} (Server returned non-JSON response)`);
    }
    return false;
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    fetchAllData(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
    setToken(null);
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Client Directory', icon: Users },
    { id: 'vendors', label: 'Vendor Management', icon: Briefcase },
    { id: 'clearance', label: 'Customs Clearance', icon: PackageCheck },
    { id: 'docs', label: 'Documentation', icon: FolderOpenDot },
    { id: 'licences', label: 'Licences & Cert', icon: FileCheck2 },
    { id: 'logistics', label: 'Domestic Logistics', icon: Truck },
    { id: 'freight', label: 'Freight Forwarding', icon: Ship },
    { id: 'master-jobs', label: 'Master Jobs', icon: Briefcase },
    { id: 'compliance-rules', label: 'Checklist Rules', icon: ShieldCheck },
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
  const [employees, setEmployees] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isClearanceJobModalOpen, setIsClearanceJobModalOpen] = useState(false);
  const [isLicenceModalOpen, setIsLicenceModalOpen] = useState(false);
  const [isFreightModalOpen, setIsFreightModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedDetailJob, setSelectedDetailJob] = useState(null);
  const [selectedFreightJob, setSelectedFreightJob] = useState(null);
  const [selectedLogisticsTrip, setSelectedLogisticsTrip] = useState(null);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [vendorToEdit, setVendorToEdit] = useState(null);
  const [licenceToEdit, setLicenceToEdit] = useState(null);
  const [clearanceToEdit, setClearanceToEdit] = useState(null);
  const [freightToEdit, setFreightToEdit] = useState(null);
  const [logisticsToEdit, setLogisticsToEdit] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [licenceUtilAmounts, setLicenceUtilAmounts] = useState({});
  const [newDocName, setNewDocName] = useState('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [tripToDispatch, setTripToDispatch] = useState(null);

  const handleUploadDoc = async (entityType, entityId, docName) => {
    if (!uploadFile) return alert('Please select a file first.');
    if (!docName) return alert('Please enter a document name.');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('documentName', docName);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    // Specific linking IDs
    if (entityType === 'client') formData.append('clientId', entityId);
    if (entityType === 'vendor') formData.append('vendorId', entityId);
    if (entityType === 'clearanceJob') formData.append('clearanceJobId', entityId);
    if (entityType === 'logisticsTrip') formData.append('logisticsTripId', entityId);

    try {
      const res = await authenticatedFetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (await handleApiResponse(res, 'File upload failed.')) {
        setUploadFile(null);
        setNewDocName('');
        fetchAllData();
      }
    } catch (e) {
      console.error('Upload Error:', e);
      alert('Network error during upload.');
    }
  };

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const currentToken = token || localStorage.getItem('tf_token');
      const response = await fetch(`http://localhost:3000/api/documents/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert('Could not download file.');
    }
  };

  const handleUpdateDocJob = async (jobId, updates) => {
    try {
      const res = await authenticatedFetch(`http://localhost:3000/api/doc-jobs/${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      if (res && res.ok) fetchAllData();
      else if (res) alert('Failed to update documentation details');
    } catch (e) { console.error(e); }
  };

  const fetchAllData = async (activeToken = null) => {
    setIsLoading(true);
    setError(null);
    
    // Use provided token or current state/localStorage
    const currentToken = activeToken || token || localStorage.getItem('tf_token');
    
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const fetchOptions = {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      };

      const [clients, vendors, freight, docJobsRes, logistics, clearance, licences, emps, masters] = await Promise.all([
        fetch('http://localhost:3000/api/clients', fetchOptions).then(r => { if (!r.ok) throw new Error('clients'); return r.json(); }),
        fetch('http://localhost:3000/api/vendors', fetchOptions).then(r => { if (!r.ok) throw new Error('vendors'); return r.json(); }),
        fetch('http://localhost:3000/api/freight-jobs', fetchOptions).then(r => { if (!r.ok) throw new Error('freight-jobs'); return r.json(); }),
        fetch('http://localhost:3000/api/doc-jobs', fetchOptions).then(r => { if (!r.ok) throw new Error('doc-jobs'); return r.json(); }),
        fetch('http://localhost:3000/api/logistics-trips', fetchOptions).then(r => { if (!r.ok) throw new Error('logistics-trips'); return r.json(); }),
        fetch('http://localhost:3000/api/clearance-jobs', fetchOptions).then(r => { if (!r.ok) throw new Error('clearance-jobs'); return r.json(); }),
        fetch('http://localhost:3000/api/licences', fetchOptions).then(r => { if (!r.ok) throw new Error('licences'); return r.json(); }),
        fetch('http://localhost:3000/api/users/employees', fetchOptions).then(r => { if (!r.ok) throw new Error('employees'); return r.json(); }),
        fetch('http://localhost:3000/api/master-jobs', fetchOptions).then(r => { if (!r.ok) throw new Error('master-jobs'); return r.json(); }),
      ]);




      const mappedClients = clients.map(d => ({ ...d, dbId: d.id, id: d.client_id }));
      const mappedVendors = vendors.map(d => ({ ...d, id: d.vendor_id }));
      const mappedFreight = freight.map(d => ({ ...d, id: d.job_id }));
      const mappedDocJobs = docJobsRes.map(d => ({ ...d, id: d.job_id }));
      const mappedLogistics = logistics.map(d => ({ ...d, id: d.trip_id }));
      const mappedClearance = clearance.map(d => ({ ...d, id: d.job_id }));
      const mappedLicences = licences.map(d => ({ ...d, id: d.licence_id }));

      setClientsData(mappedClients);
      setVendorsData(mappedVendors);
      setFreightJobs(mappedFreight);
      setDocJobs(mappedDocJobs);
      setLogisticsTrips(mappedLogistics);
      setClearanceJobs(mappedClearance);
      setLicencesData(mappedLicences);
      setEmployees(emps);
      setMasterJobs(masters || []);



      setSelectedClient(prev => prev || (mappedClients[0]?.id ?? null));
      setSelectedVendor(prev => prev || (mappedVendors[0]?.id ?? null));
      setSelectedDocJob(prev => prev || (mappedDocJobs[0]?.id ?? null));
    } catch (err) {
      console.error('API fetch failed:', err);
      if (err.message !== 'clients') { // Avoid multiple alerts if one fails
         setError('Failed to load data from the server. Your session may have expired.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('tf_token');
    const savedUser = localStorage.getItem('tf_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchAllData(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteClient = async (id) => {
    if(window.confirm('Are you sure you want to delete this client?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/clients/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          if (selectedClient === id) setSelectedClient(null);
          fetchAllData();
        }
      } catch (e) { alert('Failed to delete client'); }
    }
  };

  const handleDeleteVendor = async (id) => {
    if(window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/vendors/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          if (selectedVendor === id) setSelectedVendor(null);
          fetchAllData();
        }
      } catch (e) { alert('Failed to delete vendor'); }
    }
  };

  const handleDeleteLicence = async (id) => {
    if(window.confirm('Are you sure you want to delete this licence?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/licences/${id}`, { method: 'DELETE' });
        if (res && res.ok) fetchAllData();
      } catch (e) { alert('Failed to delete licence'); }
    }
  };

  const handleDeleteClearance = async (id) => {
    if(window.confirm('Are you sure you want to delete this clearance job?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/clearance-jobs/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          if(selectedDetailJob?.id === id) setSelectedDetailJob(null);
          fetchAllData();
        }
      } catch (e) { alert('Failed to delete job'); }
    }
  };

  const handleDeleteFreight = async (id) => {
    if(window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/freight-jobs/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          if(selectedFreightJob?.id === id) setSelectedFreightJob(null);
          fetchAllData();
        }
      } catch (e) { alert('Failed to delete shipment'); }
    }
  };

  const handleDeleteLogistics = async (id) => {
    if(window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const res = await authenticatedFetch(`http://localhost:3000/api/logistics-trips/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          if(selectedLogisticsTrip?.id === id) setSelectedLogisticsTrip(null);
          fetchAllData();
        }
      } catch (e) { alert('Failed to delete trip'); }
    }
  };

  const handleDeleteMasterJob = async (id) => {
    try {
      const res = await authenticatedFetch(`http://localhost:3000/api/master-jobs/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        setSelectedMasterJob(null);
        fetchAllData();
      }
    } catch (e) { alert('Failed to delete Master Job'); }
  };


  const advanceJobStage = async (jobId) => {
    const job = clearanceJobs.find(j => j.id === jobId);
    if (!job) return;
    const currentIdx = stages.indexOf(job.stage);
    if (currentIdx === -1) return;
    const isLastStage = currentIdx === stages.length - 1;

    // Optimistic update
    const optimisticNextStage = isLastStage ? job.stage : stages[currentIdx + 1];
    const optimisticStatus = isLastStage ? 'completed' : 'pending';
    setClearanceJobs(prev =>
      prev.map(j =>
        j.id === jobId
          ? { ...j, stage: optimisticNextStage, status: optimisticStatus, alert: false }
          : j
      )
    );

    try {
      const res = await authenticatedFetch(`http://localhost:3000/api/clearance-jobs/${jobId}/advance`, {
        method: 'PATCH',
      });
      if (!res || !res.ok) throw new Error('Server error');
      const updated = await res.json();

      setClearanceJobs(prev =>
        prev.map(j =>
          j.id === jobId
            ? { ...updated, id: updated.job_id }
            : j
        )
      );
    } catch (err) {
      console.error('Failed to advance stage:', err);
      // Rollback
      setClearanceJobs(prev =>
        prev.map(j =>
          j.id === jobId ? job : j
        )
      );
      if (err.message !== 'Session expired') alert(`Could not advance job ${jobId}. Please try again.`);
    }
  };

  const handleDragStart = (e, tripId) => { e.dataTransfer.setData('tripId', tripId); };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = async (e, newStatus) => {
    const tripId = e.dataTransfer.getData('tripId');
    if (!tripId) return;
    setLogisticsTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    try {
      await authenticatedFetch(`http://localhost:3000/api/logistics/${tripId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { fetchAllData(); }
  };

  const handleDispatchSubmit = async (tripId, data) => {
    try {
      const res = await authenticatedFetch(`http://localhost:3000/api/logistics-trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, status: 'enroute' })
      });
      if (res && res.ok) {
        fetchAllData();
        return true;
      }
      else {
        alert('Failed to dispatch trip');
        return false;
      }
    } catch (e) { console.error(e); return false; }
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

  // Live derived metrics
  const metrics = {
    activeClearances: clearanceJobs.filter(j => j.status === 'pending').length,
    enRouteLogistics: logisticsTrips.filter(t => t.status === 'enroute').length,
    pendingDocs: docJobs.filter(j => j.status === 'review' || j.status === 'missing').length,
    criticalDocs: docJobs.filter(j => j.status === 'missing').length,
    upcomingFreight: freightJobs.filter(f => f.status !== 'Arrived').length,
    assessmentPending: clearanceJobs.filter(j => j.stage === 'Assessment' && j.status === 'pending').length,
    dutyUnpaid: clearanceJobs.filter(j => j.stage === 'Duty' && j.status === 'pending').length,
    examScheduled: clearanceJobs.filter(j => j.stage === 'Exam').length,
    clearedToday: clearanceJobs.filter(j => j.status === 'completed').length,
    pendingDispatch: logisticsTrips.filter(t => t.status === 'dispatch').length,
    delayedEnRoute: logisticsTrips.filter(t => t.delayed).length,
    deliveriesCompleted: logisticsTrips.filter(t => t.status === 'arrived').length,
    activeLicences: licencesData.filter(l => l.status === 'Active').length,
    expiringLicences: licencesData.filter(l => l.status === 'Expiring' || l.status === 'Pending renewal').length,
    processingLicences: licencesData.filter(l => l.status === 'Processing').length,
    activeVoyages: freightJobs.filter(f => f.status === 'In Transit' || f.status === 'Origin' || f.status === 'Booked').length,
    delayedTransits: freightJobs.filter(f => f.alert).length,
    totalAlerts: clearanceJobs.filter(j => j.alert).length + freightJobs.filter(f => f.alert).length + licencesData.filter(l => l.alert).length,
  };

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

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg-color)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Connecting to TradeFlow API...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg-color)', padding: '2rem', textAlign: 'center' }}>
      <AlertTriangle size={48} color="var(--danger-text)" />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Connection Error</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>{error}</p>
      <button className="btn-primary" onClick={fetchAllData}>Retry Connection</button>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} />;

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
          <div className="avatar">{user ? user.name.split(' ').map(n => n[0]).join('') : '??'}</div>
          <div className="user-info">
            <span className="user-name">{user ? user.name : 'Unknown User'}</span>
            <span className="user-role">{user ? user.role : 'Authorized Staff'}</span>
          </div>
          <button className="logout-btn-sidebar" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="page-title">
            {navigation.find(n => n.id === activeTab)?.label}
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setIsSearchModalOpen(true)}><Search size={18} /></button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                {metrics.totalAlerts > 0 && (
                  <span style={{ 
                    position: 'absolute', top: 0, right: 0, width: 8, height: 8, 
                    backgroundColor: 'var(--danger-text)', borderRadius: '50%' 
                  }}></span>
                )}
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
            <button className="icon-btn" onClick={() => setIsSettingsModalOpen(true)}><Settings size={18} /></button>
          </div>
        </header>

        {/* Global Modals */}
        <MasterJobFormModal 
          isOpen={isMasterJobModalOpen} 
          onClose={() => setIsMasterJobModalOpen(false)} 
          onSuccess={fetchAllData}
          clients={clientsData}
          authFetch={authenticatedFetch}
        />
        <MasterJobDetailModal 
          isOpen={!!selectedMasterJob} 
          onClose={() => setSelectedMasterJob(null)} 
          job={selectedMasterJob}
          onDelete={handleDeleteMasterJob}
          authFetch={authenticatedFetch}
          onRefresh={fetchAllData}
        />

        <ClientFormModal 
          isOpen={isClientModalOpen || !!clientToEdit} 
          onClose={() => { setIsClientModalOpen(false); setClientToEdit(null); }} 
          initialData={clientToEdit}
          onSuccess={fetchAllData} 
          authFetch={authenticatedFetch}
        />
        <VendorFormModal 
          isOpen={isVendorModalOpen || !!vendorToEdit} 
          onClose={() => { setIsVendorModalOpen(false); setVendorToEdit(null); }} 
          initialData={vendorToEdit}
          onSuccess={fetchAllData} 
          authFetch={authenticatedFetch}
        />
        <ClearanceJobFormModal 
          isOpen={isClearanceJobModalOpen || !!clearanceToEdit} 
          onClose={() => { setIsClearanceJobModalOpen(false); setClearanceToEdit(null); }} 
          initialData={clearanceToEdit}
          onSuccess={fetchAllData} 
          clients={clientsData}
          vendors={vendorsData}
          employees={employees}
          authFetch={authenticatedFetch}
        />
        <LicenceFormModal 
          isOpen={isLicenceModalOpen || !!licenceToEdit} 
          onClose={() => { setIsLicenceModalOpen(false); setLicenceToEdit(null); }} 
          initialData={licenceToEdit}
          onSuccess={fetchAllData} 
          authFetch={authenticatedFetch}
        />
        <FreightFormModal 
          isOpen={isFreightModalOpen || !!freightToEdit} 
          onClose={() => { setIsFreightModalOpen(false); setFreightToEdit(null); }} 
          initialData={freightToEdit}
          onSuccess={fetchAllData} 
          vendors={vendorsData}
          authFetch={authenticatedFetch}
        />
        <LogisticsFormModal 
          isOpen={isLogisticsModalOpen || !!logisticsToEdit} 
          onClose={() => { setIsLogisticsModalOpen(false); setLogisticsToEdit(null); }} 
          initialData={logisticsToEdit}
          onSuccess={fetchAllData} 
          employees={employees}
          authFetch={authenticatedFetch}
        />
        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

        <ClearanceDetailModal 
          onUploadDoc={handleUploadDoc}
          onDownloadDoc={handleDownloadDoc}
          uploadFile={uploadFile}
          setUploadFile={setUploadFile}
          newDocName={newDocName}
          setNewDocName={setNewDocName}
          isOpen={!!selectedDetailJob} 
          onClose={() => setSelectedDetailJob(null)} 
          job={selectedDetailJob} 
          docJobs={docJobs}
          onEdit={() => setClearanceToEdit(selectedDetailJob)}
          onDelete={() => handleDeleteClearance(selectedDetailJob.id)}
          onAdvance={advanceJobStage}
          onRefresh={fetchAllData}
        />
        <FreightDetailModal 
          isOpen={!!selectedFreightJob} 
          onClose={() => setSelectedFreightJob(null)} 
          shipment={selectedFreightJob} 
          onEdit={() => setFreightToEdit(selectedFreightJob)}
          onDelete={() => handleDeleteFreight(selectedFreightJob.id)}
          onRefresh={fetchAllData}
        />
        <LogisticsDetailModal 
          onUploadDoc={handleUploadDoc}
          onDownloadDoc={handleDownloadDoc}
          uploadFile={uploadFile}
          setUploadFile={setUploadFile}
          newDocName={newDocName}
          setNewDocName={setNewDocName}
          isOpen={!!selectedLogisticsTrip} 
          onClose={() => setSelectedLogisticsTrip(null)} 
          trip={selectedLogisticsTrip} 
          onEdit={() => setLogisticsToEdit(selectedLogisticsTrip)}
          onDelete={() => handleDeleteLogistics(selectedLogisticsTrip.id)}
        />
        <DispatchModal 
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          trip={tripToDispatch}
          vendors={vendorsData}
          onDispatch={handleDispatchSubmit}
        />

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
             <div className="metrics-grid">
              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Active Clearances</span>
                  <div className="metric-icon"><PackageCheck size={20} /></div>
                </div>
                <div className="metric-value">{metrics.activeClearances}</div>
                <div className="metric-trend trend-up">
                  <TrendingUp size={14} /> {metrics.activeClearances} pending jobs
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Logistics (En Route)</span>
                  <div className="metric-icon"><Truck size={20} /></div>
                </div>
                <div className="metric-value">{metrics.enRouteLogistics}</div>
                <div className="metric-trend trend-up">
                  <TrendingUp size={14} /> {metrics.deliveriesCompleted} arrived today
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Pending Documents</span>
                  <div className="metric-icon"><FolderOpenDot size={20} /></div>
                </div>
                <div className="metric-value" style={{ color: metrics.criticalDocs > 0 ? 'var(--warning-text)' : 'inherit'}}>{metrics.pendingDocs}</div>
                <div className="metric-trend trend-down">
                  <AlertTriangle size={14} /> {metrics.criticalDocs} critical missing
                </div>
              </div>

              <div className="metric-card glass-card">
                <div className="metric-header">
                  <span className="metric-title">Active Freight</span>
                  <div className="metric-icon"><Ship size={20} /></div>
                </div>
                <div className="metric-value">{metrics.upcomingFreight}</div>
                <div className="metric-trend trend-up">
                  <Clock size={14} /> {metrics.delayedTransits} with active alerts
                </div>
              </div>
            </div>
            
            <div className="bento-grid">
               <div className="bento-item glass-card">
                 <div className="section-title" style={{ marginBottom: '1.5rem' }}>Operations at a Glance</div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Clients</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{clientsData.length}</div>
                   </div>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Vendors</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{vendorsData.length}</div>
                   </div>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', marginBottom: '0.25rem' }}>Total Alerts</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-text)' }}>{metrics.totalAlerts}</div>
                   </div>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Licences</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.activeLicences}</div>
                   </div>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--warning-text)', marginBottom: '0.25rem' }}>Expiring Licences</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-text)' }}>{metrics.expiringLicences}</div>
                   </div>
                   <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Voyages</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.activeVoyages}</div>
                   </div>
                 </div>
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
              <button className="btn-primary" onClick={() => setIsClearanceJobModalOpen(true)}>
                <Plus size={18} /> New Job
              </button>
            </div>

            {/* Sub-Metrics: live from API */}
            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Assessment Pending</span><AlertTriangle size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.assessmentPending}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Duty Unpaid</span><Clock size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.dutyUnpaid}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Exam Scheduled</span><Search size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.examScheduled}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Cleared (OOC)</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.clearedToday}</div>
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
                    {filteredJobs.map(job => {
                      const stageIdx = stages.indexOf(job.stage);
                      const isCompleted = job.status === 'completed';
                      const isLastStage = stageIdx === stages.length - 1;
                      return (
                        <tr 
                          key={job.id} 
                          style={{ opacity: isCompleted ? 0.65 : 1, transition: 'opacity 0.3s', cursor: 'pointer' }}
                          onClick={() => setSelectedDetailJob(job)}
                        >
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
                          <td>{job.assignedTo?.name || 'Unassigned'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{job.date}</td>
                          <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button 
                                  className="btn-icon" 
                                  title="View Details" 
                                  onClick={(e) => { e.stopPropagation(); setSelectedDetailJob(job); }}
                                  style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}
                                >
                                  <FileText size={16} />
                                </button>
                                {isCompleted ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-text)', padding: '4px 8px', background: 'rgba(34,197,94,0.08)', borderRadius: '4px' }}>
                                    <CheckCircle2 size={13} /> OOC
                                  </span>
                                ) : (
                                  <button
                                    title={isLastStage ? 'Mark as OOC (Cleared)' : `Advance to ${stages[stageIdx + 1] ?? 'OOC'}`}
                                    onClick={(e) => { e.stopPropagation(); advanceJobStage(job.id); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '4px',
                                      padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600,
                                      borderRadius: '4px', cursor: 'pointer', border: '1px solid',
                                      whiteSpace: 'nowrap',
                                      backgroundColor: job.alert ? 'rgba(239,68,68,0.08)' : 'rgba(56,189,248,0.08)',
                                      color: job.alert ? 'var(--danger-text)' : 'var(--info-text)',
                                      borderColor: job.alert ? 'rgba(239,68,68,0.25)' : 'rgba(56,189,248,0.25)',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    <ArrowRightCircle size={13} />
                                    {isLastStage ? 'Mark OOC' : `→ ${stages[stageIdx + 1]}`}
                                  </button>
                                )}
                                <div className="table-action-menu" onClick={(e) => { e.stopPropagation(); }}><MoreVertical size={18} /></div>
                              </div>
                          </td>
                        </tr>
                      );
                    })}
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
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{docJobs.filter(j => j.status === 'review').length}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Missing Documents</span><AlertCircle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{docJobs.filter(j => j.status === 'missing').length}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Verified / Complete</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{docJobs.filter(j => j.status === 'complete').length}</div>
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
                    <div className="doc-viewer-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                       <div className="doc-viewer-title">
                        <h3>Job #{activeDocJob.id} Details</h3>
                        <p>{activeDocJob.client} - {activeDocJob.type}</p>
                      </div>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => alert(`System Request: Missing documents requested from ${activeDocJob.client}`)}>Request Missing</button>
                    </div>

                    {/* Hard Copy Verification Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px dashed var(--info-text)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                         <input 
                            type="checkbox" 
                            checked={activeDocJob.hasHardCopyBOL} 
                            onChange={(e) => handleUpdateDocJob(activeDocJob.id, { hasHardCopyBOL: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                         />
                         Original BOL Received
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                         <input 
                            type="checkbox" 
                            checked={activeDocJob.hasHardCopyDO} 
                            onChange={(e) => handleUpdateDocJob(activeDocJob.id, { hasHardCopyDO: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                         />
                         Hard Copy DO Issued
                      </label>
                    </div>

                    <div className="doc-checklist">
                      {(activeDocJob.documents || []).map((doc, idx) => (
                        <div key={idx} className="doc-item" style={{ opacity: doc.status === 'verified' ? 0.7 : 1 }}>
                          <div className="doc-item-info">
                            <div className="doc-icon"><FileText size={20} /></div>
                            <div>
                              <div className="doc-name">{doc.name}</div>
                              <div className="doc-meta">
                                <span style={{ 
                                  color: (doc.status || 'verified') === 'verified' ? 'var(--success-text)' : 
                                         (doc.status || 'verified') === 'missing' ? 'var(--danger-text)' : 'var(--warning-text)',
                                  fontWeight: 600
                                }}>
                                  ● {(doc.status || 'Verified').charAt(0).toUpperCase() + (doc.status || 'Verified').slice(1)}
                                </span>
                                {' '}• PDF Document
                              </div>
                            </div>
                          </div>
                          <div className="doc-actions">
                            <button className="btn-icon" title="View"><Eye size={16} /></button>
                            {doc.status !== 'verified' && (
                              <>
                                <button className="btn-icon verify" title="Verify" onClick={() => alert(`Simulated: ${doc.name} Verified for Job #${activeDocJob.id}`)}><Check size={16} /></button>
                                <button className="btn-icon reject" title="Reject" onClick={() => {
                                  const reason = prompt("Enter rejection reason:");
                                  if(reason) alert(`Simulated: ${doc.name} Rejected. Reason: ${reason}`);
                                }}><X size={16} /></button>
                              </>
                            )}
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
              <button className="btn-primary" onClick={() => setIsLicenceModalOpen(true)}>
                <Plus size={18} /> New Licence
              </button>
            </div>

            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Licences</span><FileCheck2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.activeLicences}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Expiring / Renewing</span><AlertTriangle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.expiringLicences}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pending Renewal</span><Clock size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{licencesData.filter(l => l.status === 'Pending renewal').length}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Applications Processing</span><FileText size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.processingLicences}</div>
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
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <input 
                                type="number" 
                                placeholder="Amount" 
                                value={licenceUtilAmounts[lic.id] || ''} 
                                onChange={(e) => setLicenceUtilAmounts(prev => ({...prev, [lic.id]: e.target.value}))}
                                style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                             />
                             <button 
                                className="btn-primary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => {
                                   handleApplyLicence(lic.id, licenceUtilAmounts[lic.id]);
                                   setLicenceUtilAmounts(prev => ({...prev, [lic.id]: ''}));
                                }}
                             >
                                Apply
                             </button>
                             <button className="btn-icon" onClick={() => setLicenceToEdit(lic)}><Edit size={14}/></button>
                             <button className="btn-icon reject" onClick={() => handleDeleteLicence(lic.id)}><Trash2 size={14}/></button>
                          </div>
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
            <div className="sub-header" style={{ marginBottom: 0 }}>
              <div className="page-title" style={{ fontSize: '1.25rem' }}>Domestic Fleets</div>
              <button className="btn-primary" onClick={() => setIsLogisticsModalOpen(true)}>
                <Plus size={18} /> New Trip
              </button>
            </div>
            
            {/* Sub-Metrics: live from logistics state */}
            <div className="metrics-grid" style={{ marginBottom: '0.5rem' }}>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Fleet</span><Truck size={16} color="var(--primary-color)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{logisticsTrips.length}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pending Dispatch</span><Clock size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.pendingDispatch}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Delayed En Route</span><AlertTriangle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--danger-text)' }}>{metrics.delayedEnRoute}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Deliveries Completed</span><CheckCircle2 size={16} color="var(--success-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.deliveriesCompleted}</div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
              
              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'dispatch')}
              >
                <div className="kanban-header">
                  <div className="kanban-title"><Archive size={16} /> Pending Dispatch</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'dispatch').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'dispatch').map(trip => (
                    <div 
                      key={trip.id} 
                      className="trip-card" 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, trip.id)}
                      onClick={() => setSelectedLogisticsTrip(trip)} 
                      style={{ cursor: 'move' }}
                    >
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
                      <div className="trip-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="trip-driver"><User size={12} /> {trip.driver}</span>
                        <button 
                          className="btn-primary" 
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripToDispatch(trip);
                            setIsDispatchModalOpen(true);
                          }}
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'enroute')}
              >
                <div className="kanban-header">
                  <div className="kanban-title"><Navigation size={16} color="var(--info-text)" /> En Route</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'enroute').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'enroute').map(trip => (
                    <div 
                      key={trip.id} 
                      className="trip-card" 
                      draggable
                      onDragStart={(e) => handleDragStart(e, trip.id)}
                      onClick={() => setSelectedLogisticsTrip(trip)} 
                      style={{ borderColor: trip.delayed ? 'var(--danger-text)' : 'var(--border-color)', cursor: 'move' }}
                    >
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

              <div 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'arrived')}
              >
                <div className="kanban-header">
                  <div className="kanban-title"><CheckCircle2 size={16} color="var(--success-text)" /> Arrived</div>
                  <span className="kanban-count">{logisticsTrips.filter(t => t.status === 'arrived').length}</span>
                </div>
                <div className="kanban-cards-container">
                  {logisticsTrips.filter(t => t.status === 'arrived').map(trip => (
                    <div 
                      key={trip.id} 
                      className="trip-card" 
                      draggable
                      onDragStart={(e) => handleDragStart(e, trip.id)}
                      style={{ opacity: 0.7, cursor: 'move' }}
                    >
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

        {activeTab === 'master-jobs' && (
          <MasterJobList 
            jobs={masterJobs} 
            onCreateJob={() => setIsMasterJobModalOpen(true)}
            onSelectJob={(job) => setSelectedMasterJob(job)}
          />
        )}

        {activeTab === 'compliance-rules' && (
          <RulesManager authFetch={authenticatedFetch} />
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
                        <button className="btn-icon" title="Edit" onClick={() => setClientToEdit(activeClient)}><Edit size={16} /></button>
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
                            <div style={{ display: 'flex', gap: '8px' }}>
                               <input 
                                  placeholder="Document Name" 
                                  value={newDocName} 
                                  onChange={(e) => setNewDocName(e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                               />
                               <button 
                                 className="btn-primary" 
                                 style={{ padding: '0.5rem 1rem' }}
                                 onClick={() => handleUploadDoc('client', activeClient.id, newDocName)}
                               >
                                  <UploadCloud size={16} /> Upload Doc
                               </button>
                            </div>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {activeClient.documents?.map((doc, idx) => (
                               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                     <FileText size={18} color="var(--primary-color)" />
                                     <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(doc.status || 'Verified').toUpperCase()}</div>
                                     </div>
                                  </div>
                                  <button 
                                    className="btn-icon" 
                                    style={{ width: '28px', height: '28px' }}
                                    onClick={() => alert(`Simulation: Opening viewer for ${doc.name}...`)}
                                  >
                                    <Download size={14} />
                                  </button>
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
              <button className="btn-primary" onClick={() => setIsVendorModalOpen(true)}>
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
                        <button className="btn-icon" title="Edit" onClick={() => setVendorToEdit(activeVendor)}><Edit size={16} /></button>
                        <button className="btn-icon reject" title="Delete" onClick={() => handleDeleteVendor(activeVendor.id)}><Trash2 size={16} /></button>
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
                                 {/* Connected Active Jobs Section */}
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                           <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} color="var(--success-text)"/> Clearance Assignments
                           </h4>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {(activeVendor.clearanceJobs || []).length > 0 ? activeVendor.clearanceJobs.map(job => (
                              <div key={job.job_id} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-text)', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                 #{job.job_id}
                              </div>
                           )) : <span style={{ color: 'var(--text-muted)' }}>No active clearance assignments.</span>}
                        </div>
                     </div>

                     {/* Freight Assignments Section */}
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                           <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <History size={16} color="var(--text-muted)"/> Freight Forwarding History/Active
                           </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           {(activeVendor.freightJobs || []).length > 0 ? activeVendor.freightJobs.map(job => (
                              <div key={job.job_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                                 <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Job #{job.job_id}</span>
                                 <span className="doc-status-badge doc-status-pending" style={{ fontSize: '0.65rem' }}>{job.status}</span>
                              </div>
                           )) : <span style={{ color: 'var(--text-muted)' }}>No freight history found.</span>}
                        </div>
                     </div>

                     {/* Documents Section */}
                     <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                           <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Document Vault</h4>
                           <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                 placeholder="Document Name" 
                                 value={newDocName} 
                                 onChange={(e) => setNewDocName(e.target.value)}
                                 style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8rem', width: '150px' }}
                              />
                              <label className="btn-icon" style={{ cursor: 'pointer', backgroundColor: uploadFile ? 'var(--info-bg)' : 'var(--surface-color)', border: '1px solid var(--border-color)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={uploadFile ? uploadFile.name : 'Select File'}>
                                 <input 
                                    type="file" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                 />
                                 <Plus size={18} color={uploadFile ? 'var(--info-text)' : 'inherit'} />
                              </label>
                              <button 
                                className="btn-primary" 
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => handleUploadDoc('vendor', activeVendor.id, newDocName)}
                                disabled={!uploadFile || !newDocName}
                              >
                                 <UploadCloud size={16} /> {uploadFile ? 'Upload' : 'Ready'}
                              </button>
                           </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                           {(activeVendor.documents || []).length > 0 ? activeVendor.documents.map((doc, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-color)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FileText size={18} color="var(--primary-color)" />
                                    <div>
                                       <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.name}</div>
                                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SAVED ON DISK</div>
                                    </div>
                                 </div>
                                 <button 
                                   className="btn-icon" 
                                   style={{ width: '28px', height: '28px' }}
                                   onClick={() => handleDownloadDoc(doc.id, doc.name)}
                                 >
                                   <Download size={14} />
                                 </button>
                              </div>
                           )) : <div style={{ gridColumn: 'span 2', padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>No documents uploaded for this vendor.</div>}
                        </div>
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
              <button className="btn-primary" onClick={() => setIsFreightModalOpen(true)}>
                <Plus size={18} /> New Shipment
              </button>
            </div>

            {/* Sub-Metrics: live from freight state */}
            <div className="metrics-grid">
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Active Voyages</span><Waves size={16} color="var(--primary-color)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.activeVoyages}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">ETA This Week</span><Compass size={16} color="var(--info-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{freightJobs.filter(f => f.status === 'In Transit' || f.status === 'Arrived').length}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Delayed Transits</span><AlertTriangle size={16} color="var(--warning-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem', color: "var(--danger-text)" }}>{metrics.delayedTransits}</div>
              </div>
              <div className="metric-card glass-card" style={{ padding: '1rem', gap: '0.5rem' }}>
                <div className="metric-header"><span className="metric-title">Pre-Alerts Missing</span><AlertCircle size={16} color="var(--danger-text)"/></div>
                <div className="metric-value" style={{ fontSize: '1.5rem' }}>{freightJobs.filter(f => f.status === 'Booked').length}</div>
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
                      <tr key={job.id} onClick={() => setSelectedFreightJob(job)} style={{ cursor: 'pointer' }}>
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
        {!['dashboard', 'clients', 'vendors', 'clearance', 'docs', 'licences', 'logistics', 'freight', 'master-jobs', 'compliance-rules'].includes(activeTab) && (
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
