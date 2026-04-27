import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Folder, 
  Users as UsersIcon, 
  Clock,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  LogIn,
  LogOut as LogOutIcon,
  Search,
  Menu
} from "lucide-react";
import "./styles/dashboard.css";

const Activity = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("activityLogs");
    if (saved) return JSON.parse(saved);
    
    // Initial mock data
    return [
      { id: 1, user: 'Admin', action: 'CREATE', details: 'created new risk "Financial Leak"', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 2, user: 'John Doe', action: 'UPDATE', details: 'updated status of "Server Down"', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 3, user: 'Jane Smith', action: 'DELETE', details: 'deleted user "Mark Wilson"', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 4, user: 'Admin', action: 'ESCALATE', details: 'escalated risk "Data Breach"', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: 5, user: 'Admin', action: 'LOGIN', details: 'logged into the system', time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem("activityLogs", JSON.stringify(logs));
  }, [logs]);

  const getRelativeTime = (isoDate) => {
    const now = new Date();
    const then = new Date(isoDate);
    const diffInSeconds = Math.floor((now - then) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <Plus size={18} />;
      case 'UPDATE': return <Pencil size={18} />;
      case 'DELETE': return <Trash2 size={18} />;
      case 'ESCALATE': return <AlertTriangle size={18} />;
      case 'LOGIN': return <LogIn size={18} />;
      case 'LOGOUT': return <LogOutIcon size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = currentFilter === 'all' || log.action === currentFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleSidebarClick = (path) => {
    if (window.innerWidth <= 768) {
      setCollapsed(false);
      document.body.classList.remove("sidebar-collapsed");
    }
    if (path) navigate(path);
  };

  return (
    <div className="dashboard-app">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="top-left">
          <div className="sidebar-toggle" onClick={() => {
            setCollapsed(!collapsed);
            document.body.classList.toggle("sidebar-collapsed");
          }}>
            <Menu size={20} />
          </div>
          <img src="/images/logo.png" alt="Logo" className="nav-logo" style={{ height: '30px', marginLeft: '15px' }} />
        </div>

        <div className="top-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', paddingRight: '20px' }}>
          <div className="user-dropdown">
            <div className="profile-avatar" onClick={() => setOpen(!open)}>
              <div className="avatar-small">
                {currentUser.profileImage ? (
                  <img src={currentUser.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  currentUser.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-info-brief">
                <span className="username-label">{currentUser.username}</span>
                <span className="role-label">{currentUser.role}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {open && (
              <div className="dropdown-content show">
                <div className="dropdown-item" onClick={() => { navigate("/profile"); setOpen(false); }}>
                  <User size={16} /> <span>Profile</span>
                </div>
                <div className="dropdown-item" onClick={() => setOpen(false)}>
                  <Settings size={16} /> <span>Settings</span>
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} /> <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <ul className="menu">
            <li onClick={() => handleSidebarClick("/dashboard")}>
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </li>
            <li onClick={() => handleSidebarClick("/risk-profile")}>
              <Folder size={20} /> <span>Risk Profiles</span>
            </li>
            <li onClick={() => handleSidebarClick("/users")}>
              <UsersIcon size={20} /> <span>Users</span>
            </li>
            <li className="active" onClick={() => handleSidebarClick("/activity")}>
              <Clock size={20} /> <span>Activity</span>
            </li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="dashboard-header">
            <div>
              <h1>Activity Logs</h1>
              <p>Track all user and system actions</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by user name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {["all", "CREATE", "UPDATE", "DELETE", "ESCALATE"].map(type => (
                <button 
                  key={type}
                  className={`pill ${currentFilter === type ? 'active' : ''}`}
                  onClick={() => setCurrentFilter(type)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', 
                    background: currentFilter === type ? '#0f172a' : '#fff',
                    color: currentFilter === type ? '#fff' : '#64748b',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  {type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '50px', borderLeft: '2px solid #e2e8f0', marginLeft: '20px' }}>
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <div key={log.id} style={{ position: 'relative', marginBottom: '30px' }}>
                <div style={{ 
                  position: 'absolute', left: '-71px', width: '40px', height: '40px', borderRadius: '50%', background: '#fff', 
                  border: '2px solid', borderColor: getIconColor(log.action), display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getIconColor(log.action), zIndex: 2
                }}>
                  {getActionIcon(log.action)}
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{log.action}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{getRelativeTime(log.time)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{log.user}</span> {log.details}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                <Clock size={48} style={{ marginBottom: '15px' }} />
                <p>No activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getIconColor = (action) => {
  switch (action) {
    case 'CREATE': return '#22c55e';
    case 'UPDATE': return '#3b82f6';
    case 'DELETE': return '#ef4444';
    case 'ESCALATE': return '#f59e0b';
    case 'LOGIN': return '#6366f1';
    default: return '#94a3b8';
  }
};

export default Activity;
