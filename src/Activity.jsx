import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Users as UsersIcon,
  LogIn,
  Activity as ActivityIcon,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  Inbox
} from "lucide-react";
import "./styles/dashboard.css";
import "./styles/ActivityLog.css";
import Layout from "./Layout";

const Activity = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "Owner" };
  const username = currentUser.username || "Admin";
  const role = currentUser.role || "Owner";
  const email = currentUser.email || `${username.toLowerCase().replace(/\s/g, '')}@example.com`;
  const initials = username.substring(0, 2).toUpperCase();

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("activityLogs");
    if (saved) return JSON.parse(saved);

    // Initial mock data updated for the new table design
    const mockData = [
      { id: 1, user: 'Demo Admin 1', initials: 'DA', action: 'Team Updated', type: 'UPDATE', result: 'success', severity: 'info', time: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString() },
      { id: 2, user: 'Demo Admin 1', initials: 'DA', action: 'User Login Success', type: 'LOGIN', result: 'success', severity: 'info', time: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString() },
      { id: 3, user: 'Demo User 1', initials: 'DU', action: 'User Login Success', type: 'LOGIN', result: 'success', severity: 'info', time: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString() },
      { id: 4, user: 'Admin', initials: 'A', action: 'Data Escalation', type: 'ESCALATE', result: 'failed', severity: 'critical', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: 5, user: 'John Doe', initials: 'JD', action: 'Risk Created', type: 'CREATE', result: 'pending', severity: 'warning', time: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString() },
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

  const getActionIcon = (actionType) => {
    switch (actionType.toUpperCase()) {
      case 'CREATE': return <Plus size={16} />;
      case 'UPDATE': return <UsersIcon size={16} />;
      case 'DELETE': return <Trash2 size={16} />;
      case 'ESCALATE': return <AlertTriangle size={16} />;
      case 'LOGIN': return <LogIn size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'info': return <Info size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'critical': return <AlertTriangle size={14} color="#ef4444" />;
      default: return <Info size={14} />;
    }
  };

  const getAvatarColor = (initials) => {
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = currentFilter === 'all' || log.type.toUpperCase() === currentFilter.toUpperCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Layout>
      <div className="activity-log-page">
        <div className="audit-trail-card">
          
          {/* Header */}
          <div className="audit-header">
            <div className="audit-title-section">
              <h1>Audit Trail</h1>
            </div>
            <div className="audit-user-profile">
              <div className="audit-user-info">
                <span className="user-email">{email}</span>
                <span className="user-role">{role} • {email}</span>
              </div>
              <div className="user-avatar-circle">{initials}</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="audit-filters-bar">
            <div className="audit-filters-left">
              <div style={{ position: 'relative' }}>
                <button 
                  className="filter-dropdown-btn"
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                >
                  <ActivityIcon size={16} /> 
                  {currentFilter === 'all' ? 'Actions' : currentFilter} 
                  <ChevronDown size={14} />
                </button>
                {showActionDropdown && (
                  <div className="custom-dropdown-menu">
                    {["all", "CREATE", "UPDATE", "DELETE", "ESCALATE", "LOGIN"].map(f => (
                      <div 
                        key={f} 
                        className="custom-dropdown-item"
                        onClick={() => { setCurrentFilter(f); setShowActionDropdown(false); }}
                      >
                        {f === 'all' ? 'All Actions' : f}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="filter-dropdown-btn" onClick={() => alert("Actor filter coming soon!")}>
                <UsersIcon size={16} /> Actors <ChevronDown size={14} />
              </button>
              <button className="filter-dropdown-btn" onClick={() => alert("Time filter coming soon!")}>
                <Clock size={16} /> Time <ChevronDown size={14} />
              </button>
              <button className="filter-dropdown-btn" onClick={() => alert("Advanced filters coming soon!")}>
                <Filter size={16} /> Filters <ChevronDown size={14} />
              </button>
            </div>
            <div className="audit-filters-right">
              <button className="icon-btn" onClick={() => alert("More options")}><MoreHorizontal size={18} /></button>
            </div>
          </div>

          {/* Table */}
          <div className="audit-table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Result</th>
                  <th>Severity</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="td-action">
                        <span className="action-icon-wrapper">
                          {getActionIcon(log.type)}
                        </span>
                        <span className="action-name">{log.action}</span>
                      </div>
                    </td>
                    <td>
                      <div className="td-actor">
                        <div className="actor-badge" style={{ backgroundColor: getAvatarColor(log.initials) }}>
                          {log.initials}
                        </div>
                        <span className="actor-name">{log.user}</span>
                      </div>
                    </td>
                    <td>
                      <div className="td-result">
                        <span className={`result-badge badge-${log.result}`}>
                          {log.result}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="td-severity">
                        <div className={`severity-indicator sev-${log.severity}`}>
                          {getSeverityIcon(log.severity)}
                          <span>{log.severity}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="td-when">
                        {getRelativeTime(log.time)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="empty-state">
                <Inbox className="empty-icon" size={64} />
                <p>No activity found</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Activity;
