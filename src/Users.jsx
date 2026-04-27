import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle, 
  FileText, 
  Clock,
  Camera,
  Pencil,
  Trash2,
  X,
  Check,
  Menu
} from "lucide-react";
import "./styles/dashboard.css";
import "./styles/user_profile.css";

const Users = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  // --- STATE MANAGEMENT ---
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem("adminUsersList");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Admin User", email: "admin@clearrisk.com", role: "admin", avatar: null },
      { id: 2, name: "John Doe", email: "john@example.com", role: "user", avatar: null },
      { id: 3, name: "Jane Smith", email: "jane@example.com", role: "user", avatar: null },
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "user",
    avatar: null
  };
  const [formData, setFormData] = useState(initialForm);

  // Persistence
  useEffect(() => {
    localStorage.setItem("adminUsersList", JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email) return alert("Name and Email are required");
    const newUser = {
      ...formData,
      id: Date.now()
    };
    setUsersList(prev => [...prev, newUser]);
    setShowAddModal(false);
    setFormData(initialForm);
  };

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: "", // optional
      role: u.role,
      avatar: u.avatar
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    setUsersList(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...formData, id: u.id, avatar: formData.avatar || u.avatar } : u
    ));
    setShowEditModal(false);
    setFormData(initialForm);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsersList(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="top-left">
          <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={20} />
          </div>
          <img src="/images/logo.png" alt="Clear Risk Logo" className="nav-logo" />
        </div>

        <div className="top-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="notification-bell">
            <Bell size={24} color="#64748b" />
          </div>

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

      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <ul>
            <li onClick={() => navigate("/dashboard")}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </li>
            <li onClick={() => navigate("/risk-profile")}>
              <Folder size={20} />
              <span>Risk Profiles</span>
            </li>
            <li>
              <AlertCircle size={20} />
              <span>Risks</span>
            </li>
            <li className="active" onClick={() => navigate("/users")}>
              <UsersIcon size={20} />
              <span>Users</span>
            </li>
            <li onClick={() => navigate("/activity")}>
              <Clock size={20} />
              <span>Activity</span>
            </li>
            <li>
              <FileText size={20} />
              <span>Report Incident</span>
            </li>
            <li>
              <Clock size={20} />
              <span>Activity</span>
            </li>
          </ul>
        </div>

        <div className="main">
          <div className="dashboard-header">
            <div>
              <h1>User Management</h1>
              <p>Add, edit and manage application users</p>
            </div>
            <button className="pill-btn" onClick={() => { setFormData(initialForm); setShowAddModal(true); }}>
              + Add User
            </button>
          </div>

          {/* USERS TABLE */}
          <div className="table-box card" style={{ height: 'auto', minHeight: '400px', padding: '24px', width: '100%', display: 'block' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '20px' }}>
              All Users
            </h3>
            <div className="table-wrapper" style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
              <table className="risk-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '35%' }}>Email</th>
                    <th style={{ width: '20%' }}>Role</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList?.length > 0 ? (
                    usersList.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="avatar-small" style={{ background: '#3b82f6', color: 'white' }}>
                            {u.avatar ? (
                              <img src={u.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{u.name}</td>
                        <td style={{ color: '#64748b' }}>{u.email}</td>
                        <td>
                          <span className="profile-role-tag" style={{ margin: 0, padding: '4px 10px', fontSize: '11px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', textTransform: 'capitalize', fontWeight: '600' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <Pencil size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => handleEditClick(u)} />
                            <Trash2 size={18} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDeleteUser(u.id)} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="ui-overlay modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="risk-form modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            
            <div className="form-group" style={{ alignItems: 'center' }}>
              <div 
                className="avatar-large" 
                onClick={() => fileInputRef.current.click()}
                style={{ marginBottom: '10px' }}
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" />
                ) : (
                  <div style={{ fontSize: '14px', textAlign: 'center' }}>No Image</div>
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
            </div>

            <div className="form-group">
              <input 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
              <input 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleInputChange} 
              />
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAddUser}>Save User</button>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="ui-overlay modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="risk-form modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            
            <div className="form-group" style={{ alignItems: 'center' }}>
              <div 
                className="avatar-large" 
                onClick={() => fileInputRef.current.click()}
                style={{ marginBottom: '10px' }}
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" />
                ) : (
                  <div style={{ fontSize: '14px', textAlign: 'center' }}>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "A"}
                  </div>
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
            </div>

            <div className="form-group">
              <input 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
              <input 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password (leave blank to keep current)" 
                value={formData.password} 
                onChange={handleInputChange} 
              />
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleUpdateUser}>Save Changes</button>
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
