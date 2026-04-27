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
  Menu,
  Inbox
} from "lucide-react";
import "./styles/dashboard.css";
import "./styles/ActivityLog.css";
import Layout from "./Layout";


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
    
    // Initial mock data if none exists
    const mockData = [
      { id: 1, user: 'Admin', action: 'CREATE', details: 'created new risk "Financial Leak"', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 2, user: 'John Doe', action: 'UPDATE', details: 'updated status of "Server Down"', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 3, user: 'Jane Smith', action: 'DELETE', details: 'deleted user "Mark Wilson"', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 4, user: 'Admin', action: 'ESCALATE', details: 'escalated risk "Data Breach"', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: 5, user: 'Admin', action: 'LOGIN', details: 'logged into the system', time: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString() },
      { id: 6, user: 'System', action: 'LOGOUT', details: 'session expired for Admin', time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() }
    ];
    localStorage.setItem("activityLogs", JSON.stringify(mockData));
    return mockData;
  });

  const getRelativeTime = (isoDate) => {
    const now = new Date();
    const then = new Date(isoDate);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActionIcon = (action) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return <Plus size={18} />;
      case 'UPDATE': return <Pencil size={18} />;
      case 'DELETE': return <Trash2 size={18} />;
      case 'ESCALATE': return <AlertTriangle size={18} />;
      case 'LOGIN': return <LogIn size={18} />;
      case 'LOGOUT': return <LogOutIcon size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getActionClass = (action) => {
    return `dot-${action.toLowerCase()}`;
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = currentFilter === 'all' || log.action.toUpperCase() === currentFilter.toUpperCase();
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
    <Layout>

          <div className="activity-log-page">
            <div className="activity-header">
              <h1>Activity Logs</h1>
              <p>Track all user and system actions</p>
            </div>

            <div className="activity-controls">
              <div className="search-wrapper">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search by user name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="filter-pills">
                {[
                  { label: "All", value: "all" },
                  { label: "Created", value: "CREATE" },
                  { label: "Updated", value: "UPDATE" },
                  { label: "Deleted", value: "DELETE" },
                  { label: "Escalated", value: "ESCALATE" },
                  { label: "Login", value: "LOGIN" }
                ].map(filter => (
                  <button 
                    key={filter.value}
                    className={`filter-pill ${currentFilter === filter.value ? 'active' : ''}`}
                    onClick={() => setCurrentFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="timeline-container">
              <div className="timeline-line"></div>
              
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div key={log.id} className="timeline-item">
                    <div className={`timeline-dot ${getActionClass(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="timeline-card">
                      <div className="card-header">
                        <span className="action-label">
                          {log.action.charAt(0) + log.action.slice(1).toLowerCase()}
                        </span>
                        <span className="time-stamp">
                          <Clock size={12} />
                          {getRelativeTime(log.time)}
                        </span>
                      </div>
                      <p className="log-details">
                        <span className="log-user">{log.user}</span> {log.details}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Inbox className="empty-icon" size={64} />
                  <p>No activity found</p>
                </div>
              )}
            </div>
          </div>
    </Layout>
  );
};

export default Activity;

