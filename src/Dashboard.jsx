import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Settings, LogOut, ChevronDown, Menu } from "lucide-react";
import "./styles/dashboard.css";
import "./styles/user_profile.css";

function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // ADD THIS: Dashboard level notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(n);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // ADD THIS: Mark all notifications as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Click outside logic removed as per request to remove addEventListener

  useEffect(() => {
  if (collapsed) {
    document.body.classList.add("sidebar-collapsed");
  } else {
    document.body.classList.remove("sidebar-collapsed");
  }
}, [collapsed]);

  const [profileName, setProfileName] = useState("");
  const [profileOwner, setProfileOwner] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      navigate("/login");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("riskProfiles")) || [];
    setProfiles(stored);
  }, [navigate]);

  /* ================= CALCULATIONS ================= */
  const total = profiles.length;
  const high = profiles.filter(p => p.risk === "High").length;
  const medium = profiles.filter(p => p.risk === "Medium").length;
  const low = profiles.filter(p => p.risk === "Low").length;

  /* ================= SAVE PROFILE ================= */
  const saveProfile = () => {
    if (!profileName) return alert("Enter profile name");

    const newProfile = {
      name: profileName,
      owner: profileOwner,
      trend: "→",
      risk: "High",
      date: new Date().toLocaleString(),
    };

    const updated = [...profiles, newProfile];
    localStorage.setItem("riskProfiles", JSON.stringify(updated));
    setProfiles(updated);

    setProfileName("");
    setProfileOwner("");
    setShowProfileModal(false);
  };

  const handleSidebarClick = (path) => {
    if (window.innerWidth <= 768) {
      setCollapsed(false);
      document.body.classList.remove("sidebar-collapsed");
    }
    if (path) navigate(path);
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="top-left">
          <div
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={20} />
          </div>
          <img src="/images/logo.png" alt="Clear Risk Logo" className="nav-logo" />
        </div>

        <div className="top-right" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' }}>
          
          {/* Notifications Dropdown */}
          <div className="notification-bell" onClick={() => setShowNotifs(!showNotifs)} style={{ cursor: 'pointer', position: 'relative' }}>
            <Bell size={24} color="#64748b" />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </div>

          {showNotifs && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="notification-mark-read" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="notification-body">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notification-item ${n.read ? 'read' : 'unread'}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <p className="notification-message">{n.message}</p>
                      <p className="notification-time">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="user-dropdown">
            <div className="profile-avatar" onClick={() => setOpen(!open)}>
              <div className="avatar-small">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-info-brief">
                <span className="username-label">{user.username}</span>
                <span className="role-label">{user.role}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {open && (
              <div className="dropdown-content show">
                <div className="dropdown-item" onClick={() => { navigate("/profile"); setOpen(false); }}>
                  <User size={16} />
                  <span>Profile</span>
                </div>
                <div className="dropdown-item" onClick={() => setOpen(false)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="dashboard-container">

        {/* SIDEBAR */}
        <div className="sidebar">
          <ul>
            <li className="active" onClick={() => handleSidebarClick("/dashboard")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Dashboard</span>
            </li>
            <li onClick={() => handleSidebarClick("/risk-profile")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>Risk Profiles</span>
              <div className="badge">{profiles.length}</div>
            </li>
            <li onClick={() => handleSidebarClick()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Risks</span>
            </li>
            <li onClick={() => handleSidebarClick("/users")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>Users</span>
            </li>
            <li onClick={() => handleSidebarClick()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>Report Incident</span>
            </li>
            <li onClick={() => handleSidebarClick("/activity")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Activity</span>
            </li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">

          {/* HEADER */}
          <div className="dashboard-header">
            <div>
              <h1>My Dashboard</h1>
              <p>Welcome back, Admin</p>
            </div>

            <button
              className="pill-btn add-profile-btn"
              onClick={() => setShowProfileModal(true)}
            >
              Add Risk Profile
            </button>
          </div>

          {/* CARDS */}
          <div className="cards">
            <div className="card total-card">
              <h3>Total Risks</h3>
              <p>{total}</p>
            </div>

            <div className="card high-card">
              <h3>High Risk</h3>
              <p>{high}</p>
            </div>

            <div className="card medium-card">
              <h3>Medium Risk</h3>
              <p>{medium}</p>
            </div>

            <div className="card low-card">
              <h3>Low Risk</h3>
              <p>{low}</p>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-box">
            <h3>Summary</h3>

            <table>
              <thead>
                <tr>
                  <th>Risk Profile</th>
                  <th>Owner</th>
                  <th>Trend</th>
                  <th>Last Updated</th>
                </tr>
              </thead>

              <tbody>
                {profiles.map((p, i) => (
                  <tr
  key={i}
  className="clickable-row"
  onClick={() => {
    localStorage.setItem("selectedProfile", p.name);
    navigate("/risk-profile");
  }}
>
                    <td>{p.name}</td>
                    <td>{p.owner}</td>
                    <td>{p.trend}</td>
                    <td>{p.date}</td>
                  </tr>
                ))}

                {profiles.length === 0 && (
                  <tr>
                    <td colSpan="4">No profiles yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create Risk Profile</h2>

            <div className="form-group">
              <input
                placeholder="Profile Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />

              <input
                placeholder="Owner"
                value={profileOwner}
                onChange={(e) => setProfileOwner(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={saveProfile}>
                Create Profile
              </button>
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;