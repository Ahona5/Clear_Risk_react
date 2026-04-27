import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Folder, 
  AlertCircle, 
  Users, 
  FileText, 
  Clock,
  ArrowLeft,
  Pencil,
  Check,
  X,
  Camera,
  Menu
} from "lucide-react";
import "./styles/dashboard.css";
import "./styles/user_profile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser")) || { username: "admin", role: "admin" };
  });

  const [formData, setFormData] = useState({
    displayName: user.username,
    email: user.email || `${user.username}@clearrisk.com`,
    role: user.role,
    title: user.title || "Security Administrator",
    company: user.company || "Clear Risk Solutions"
  });

  const [profileImage, setProfileImage] = useState(user.profileImage || null);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = { 
      ...user, 
      username: formData.displayName, 
      role: formData.role,
      email: formData.email,
      title: formData.title,
      company: formData.company,
      profileImage: profileImage
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.username,
      email: user.email || `${user.username}@clearrisk.com`,
      role: user.role,
      title: user.title || "Security Administrator",
      company: user.company || "Clear Risk Solutions"
    });
    setIsEditing(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfileImage(base64);
        const updatedUser = { ...user, profileImage: base64 };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
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
          <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={20} />
          </div>
          <button className="topbar-back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <img src="/images/logo.png" alt="Clear Risk Logo" className="nav-logo" />
        </div>

        <div className="top-right" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' }}>
          <div className="notification-bell" onClick={() => setShowNotifs(!showNotifs)} style={{ cursor: 'pointer', position: 'relative' }}>
            <Bell size={24} color="#64748b" />
            <span className="bell-badge">3</span>
          </div>

          {showNotifs && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button className="notification-mark-read">Mark all as read</button>
              </div>
              <div className="notification-body">
                <div className="notification-item unread">
                  <p className="notification-message">New risk detected in Cloud Infrastructure</p>
                  <p className="notification-time">2 mins ago</p>
                </div>
                <div className="notification-item unread">
                  <p className="notification-message">Admin updated the Security Policy</p>
                  <p className="notification-time">1 hour ago</p>
                </div>
                <div className="notification-item">
                  <p className="notification-message">Monthly report is ready for download</p>
                  <p className="notification-time">Yesterday</p>
                </div>
              </div>
            </div>
          )}

          <div className="user-dropdown">
            <div className="profile-avatar" onClick={() => setOpen(!open)}>
              <div className="avatar-small">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" />
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
                  <UserIcon size={16} />
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

      {/* DASHBOARD CONTAINER */}
      <div className="dashboard-container">
        
        {/* SIDEBAR */}
        <div className="sidebar">
          <ul>
            <li onClick={() => handleSidebarClick("/dashboard")}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </li>
            <li onClick={() => handleSidebarClick("/risk-profile")}>
              <Folder size={20} />
              <span>Risk Profiles</span>
            </li>
            <li onClick={() => handleSidebarClick()}>
              <AlertCircle size={20} />
              <span>Risks</span>
            </li>
            <li onClick={() => handleSidebarClick("/users")}>
              <UsersIcon size={20} />
              <span>Users</span>
            </li>
            <li onClick={() => handleSidebarClick()}>
              <FileText size={20} />
              <span>Report Incident</span>
            </li>
            <li onClick={() => handleSidebarClick()}>
              <Clock size={20} />
              <span>Activity</span>
            </li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="content-wrapper">
            <h1 style={{ marginBottom: '24px' }}>User Profile</h1>

            <div className="profile-page-container">
              {/* LEFT CARD */}
              <div className="profile-card">
                <div className="profile-left-content">
                  {/* Clickable avatar with hover overlay */}
                  <div className="avatar-large" onClick={triggerFileUpload}>
                    {profileImage ? (
                      <img src={profileImage} alt="Avatar" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                    <div className="avatar-overlay">
                      <Camera size={14} />
                      <span>Upload</span>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                  
                  <h2 className="profile-name">{user.username}</h2>
                  <span className="profile-role-tag">{user.role}</span>
                  
                  <div className="profile-stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Member since</span>
                      <span className="stat-value">Oct 2023</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Points</span>
                      <span className="stat-value">1,250</span>
                    </div>
                  </div>

                  <button className="btn-return" onClick={() => navigate("/dashboard")}>
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="profile-card">
                <div className="profile-right-header">
                  <h2>About Details</h2>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Check size={18} className="edit-btn-icon" onClick={handleSave} style={{ color: '#22c55e' }} />
                      <X size={18} className="edit-btn-icon" onClick={handleCancel} style={{ color: '#ef4444' }} />
                    </div>
                  ) : (
                    <Pencil size={18} className="edit-btn-icon" onClick={() => setIsEditing(true)} />
                  )}
                </div>

                <div className="profile-details-list">
                  <div className="detail-row">
                    <span className="detail-label">Display Name</span>
                    {isEditing ? (
                      <input 
                        name="displayName" 
                        value={formData.displayName} 
                        onChange={handleInputChange} 
                        style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px' }}
                      />
                    ) : (
                      <span className="detail-value">{user.username}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    {isEditing ? (
                      <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px' }}
                      />
                    ) : (
                      <span className="detail-value">{formData.email}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    {isEditing ? (
                      <input 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange} 
                        style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px' }}
                      />
                    ) : (
                      <span className="detail-value">{user.role}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Title</span>
                    {isEditing ? (
                      <input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px' }}
                      />
                    ) : (
                      <span className="detail-value">{formData.title}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Company</span>
                    {isEditing ? (
                      <input 
                        name="company" 
                        value={formData.company} 
                        onChange={handleInputChange} 
                        style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px' }}
                      />
                    ) : (
                      <span className="detail-value">{formData.company}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px' }}>
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
