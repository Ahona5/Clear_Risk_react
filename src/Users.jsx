import React, { useState, useEffect, useRef } from "react";
import { addActivityLog } from "./logger";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Camera, X } from "lucide-react";
import Layout from "./Layout";

const s = {
  pill: (bg, color) => ({ background: bg, color, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" }),
};

const RoleBadge = ({ role }) => {
  const r = role?.toLowerCase();
  if (r === "subscriber") return <span style={s.pill("#dcfce7","#15803d")}>Subscriber</span>;
  if (r === "moderator")  return <span style={s.pill("#dbeafe","#1d4ed8")}>Moderator</span>;
  if (r === "suspended")  return <span style={s.pill("#fee2e2","#dc2626")}>Suspended</span>;
  return <span style={s.pill("#f1f5f9","#475569")}>{role}</span>;
};



/* ── FILTER DROPDOWN ── */
const FilterPanel = ({ filters, setFilters, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const roles = ["All", "subscriber", "moderator", "suspended"];

  return (
    <div ref={ref} style={{
      position: "absolute", top: "44px", right: 0, zIndex: 200,
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: "18px 22px", width: "260px", minWidth: "260px",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
        <span style={{ fontWeight:700, fontSize:"13px", color:"#0f172a" }}>Filters</span>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}><X size={15} color="#94a3b8"/></button>
      </div>

      <p style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 8px" }}>Role</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {roles.map(r => (
          <label key={r} style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", fontSize:"13px", color: filters.role === r ? "#2563eb" : "#374151", fontWeight: filters.role === r ? 600 : 400, whiteSpace: "nowrap" }}>
            <input type="radio" name="role" value={r} checked={filters.role === r} onChange={() => setFilters(f => ({ ...f, role: r }))} style={{ accentColor:"#2563eb" }} />
            {r === "All" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
          </label>
        ))}
      </div>

      <button onClick={() => { setFilters({ role:"All" }); onClose(); }}
        style={{ marginTop:"14px", width:"100%", padding:"7px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:"12px", fontWeight:600, color:"#64748b", cursor:"pointer" }}>
        Clear Filters
      </button>
    </div>
  );
};

/* ── HEADER ── */
const Header = ({ onAddClick, onExport }) => (
  <div style={{
    background: "linear-gradient(135deg,#eff6ff 0%,#eef2ff 50%,#f0f9ff 100%)",
    border: "1px solid #bfdbfe", borderRadius: "14px",
    padding: "18px 24px", marginBottom: "20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#2563eb", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(37,99,235,0.35)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div>
        <h1 style={{ fontSize:"17px", fontWeight:700, color:"#0f172a", margin:0 }}>User Management</h1>
        <p style={{ fontSize:"13px", color:"#64748b", margin:"2px 0 0" }}>Manage registered users and their permissions</p>
      </div>
    </div>
    <div style={{ display:"flex", gap:"10px" }}>
      <button onClick={onExport} style={{ background:"#fff", border:"1px solid #d1d5db", borderRadius:"9px", padding:"8px 16px", fontSize:"13px", fontWeight:500, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:"7px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
        Export CSV
      </button>
      <button onClick={onAddClick} style={{ background:"#2563eb", border:"none", borderRadius:"9px", padding:"8px 16px", fontSize:"13px", fontWeight:600, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:"7px", boxShadow:"0 2px 6px rgba(37,99,235,0.4)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add User
      </button>
    </div>
  </div>
);

/* ── FILTERS BAR ── */
const FiltersBar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, counts, panelFilters, setPanelFilters }) => {
  const [showPanel, setShowPanel] = useState(false);
  const tabs = [
    { id:"All Users",    label:`All (${counts.all})` },
    { id:"Subscribers", label:`Subscribers (${counts.subscribers})` },
    { id:"Suspended",   label:`Suspended (${counts.suspended})` },
  ];
  const hasActiveFilter = panelFilters.role !== "All";

  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px", flexWrap:"wrap", gap:"10px" }}>
      <div style={{ display:"flex", gap:"6px" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:"6px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:500,
            border:"none", cursor:"pointer", transition:"all 0.15s",
            background: activeTab === tab.id ? "#dbeafe" : "#f1f5f9",
            color: activeTab === tab.id ? "#1d4ed8" : "#64748b",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
        <div style={{ position:"relative" }}>
          <Search size={15} style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none" }}/>
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft:"32px", paddingRight:"14px", paddingTop:"8px", paddingBottom:"8px", border:"1px solid #d1d5db", borderRadius:"9px", fontSize:"13px", width:"230px", outline:"none", background:"#fff", color:"#374151" }}
          />
        </div>
        <div style={{ position:"relative" }}>
          <button onClick={() => setShowPanel(p => !p)} style={{
            padding:"8px 12px", border:`1px solid ${hasActiveFilter ? "#2563eb" : "#d1d5db"}`,
            borderRadius:"9px", background: hasActiveFilter ? "#eff6ff" : "#fff",
            color: hasActiveFilter ? "#2563eb" : "#6b7280", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", fontSize:"13px", fontWeight:500,
          }}>
            <Filter size={15}/>
            {hasActiveFilter ? "Filtered" : "Filter"}
          </button>
          {showPanel && <FilterPanel filters={panelFilters} setFilters={setPanelFilters} onClose={() => setShowPanel(false)}/>}
        </div>
      </div>
    </div>
  );
};

/* ── USER ROW ── */
const UserRow = ({ user, onEdit, onSuspend, onRestore }) => {
  const isSuspended = user.role?.toLowerCase() === "suspended";
  return (
    <tr style={{ borderBottom:"1px solid #f1f5f9", transition:"background 0.1s" }}
      onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
      <td style={{ padding:"14px 20px" }}><input type="checkbox" style={{ width:"15px", height:"15px", cursor:"pointer" }}/></td>
      <td style={{ padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"#dbeafe", color:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"13px", flexShrink:0, border:"1px solid #bfdbfe", overflow:"hidden" }}>
            {user.avatar ? <img src={user.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight:600, fontSize:"14px", color:"#0f172a" }}>{user.name}</span>
        </div>
      </td>
      <td style={{ padding:"14px 20px", fontSize:"13px", color:"#475569" }}>{user.email}</td>
      <td style={{ padding:"14px 20px" }}><RoleBadge role={user.role}/></td>
      <td style={{ padding:"14px 20px", fontSize:"13px", color:"#64748b" }}>{user.joinedDate}</td>
      <td style={{ padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={() => onEdit(user)} style={{ fontSize:"13px", fontWeight:600, color:"#2563eb", background:"none", border:"none", cursor:"pointer", padding:0 }}>Edit</button>
          {isSuspended
            ? <button onClick={() => onRestore(user.id)} style={{ fontSize:"12px", fontWeight:600, color:"#16a34a", background:"#dcfce7", border:"none", borderRadius:"7px", padding:"4px 12px", cursor:"pointer" }}>Restore</button>
            : <button onClick={() => onSuspend(user.id)} style={{ fontSize:"12px", fontWeight:600, color:"#ea580c", background:"#fff7ed", border:"none", borderRadius:"7px", padding:"4px 12px", cursor:"pointer" }}>Suspend</button>
          }
        </div>
      </td>
    </tr>
  );
};

/* ── TABLE ── */
const UserTable = ({ users, onEdit, onSuspend, onRestore }) => (
  <div style={{ border:"1px solid #e2e8f0", borderRadius:"12px", overflow:"hidden", background:"#fff" }}>
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
          {["", "Name","Email","Role","Joined","Actions"].map((col, i) => (
            <th key={i} style={{ padding:"13px 20px", textAlign:"left", fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", width: i===0?"48px":"auto" }}>
              {i === 0 ? <input type="checkbox" style={{ width:"15px", height:"15px" }}/> : col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.length > 0
          ? users.map(u => <UserRow key={u.id} user={u} onEdit={onEdit} onSuspend={onSuspend} onRestore={onRestore}/>)
          : <tr><td colSpan="7" style={{ padding:"48px", textAlign:"center", color:"#94a3b8", fontSize:"14px" }}>No users found.</td></tr>
        }
      </tbody>
    </table>
  </div>
);

/* ── MODAL ── */
const Modal = ({ title, form, onChange, onImgUpload, onSave, onClose, fileRef, saveLabel }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.45)", padding:"16px" }}>
    <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"440px", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ padding:"18px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0, fontSize:"16px", fontWeight:700, color:"#0f172a" }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18} color="#64748b"/></button>
      </div>
      <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"11px" }}>
        {/* Avatar */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:"4px" }}>
          <div onClick={() => fileRef.current.click()} style={{ width:"68px", height:"68px", borderRadius:"50%", background: form.avatar?"transparent":"#dbeafe", color:"#1d4ed8", fontWeight:700, fontSize:"22px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", border:"2px solid #bfdbfe" }}>
            {form.avatar ? <img src={form.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (form.name ? form.name.charAt(0).toUpperCase() : <Camera size={22}/>)}
          </div>
          <input type="file" ref={fileRef} onChange={onImgUpload} accept="image/*" style={{ display:"none" }}/>
        </div>
        {[
          { name:"name", placeholder:"Full Name" },
          { name:"email", placeholder:"Email Address" },
          { name:"password", placeholder: saveLabel==="Save Changes"?"Password (leave blank to keep)":"Password", type:"password" },
        ].map(f => (
          <input key={f.name} name={f.name} type={f.type||"text"} placeholder={f.placeholder} value={form[f.name]} onChange={onChange}
            style={{ width:"100%", padding:"9px 13px", border:"1px solid #d1d5db", borderRadius:"8px", fontSize:"13px", outline:"none", color:"#374151", boxSizing:"border-box" }}
          />
        ))}
        <div style={{ display:"flex", gap:"10px" }}>
          {[
            { name:"role", opts:[["moderator","Moderator"],["subscriber","Subscriber"],["suspended","Suspended"]] },
          ].map(sel => (
            <select key={sel.name} name={sel.name} value={form[sel.name]} onChange={onChange}
              style={{ width:"100%", padding:"9px 13px", border:"1px solid #d1d5db", borderRadius:"8px", fontSize:"13px", color:"#374151", outline:"none" }}>
              {sel.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      </div>
      <div style={{ padding:"14px 24px", borderTop:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", justifyContent:"flex-end", gap:"10px" }}>
        <button onClick={onClose} style={{ padding:"8px 18px", borderRadius:"8px", border:"1px solid #d1d5db", background:"#fff", fontSize:"13px", fontWeight:500, color:"#374151", cursor:"pointer" }}>Cancel</button>
        <button onClick={onSave} style={{ padding:"8px 18px", borderRadius:"8px", border:"none", background:"#2563eb", fontSize:"13px", fontWeight:600, color:"#fff", cursor:"pointer" }}>{saveLabel}</button>
      </div>
    </div>
  </div>
);

/* ── MAIN ── */
const Users = () => {
  const navigate    = useNavigate();
  const fileRef     = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin" };

  const [activeTab,    setActiveTab]    = useState("All Users");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [panelFilters, setPanelFilters] = useState({ role:"All" });
  const [showAdd,      setShowAdd]      = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [selUser,      setSelUser]      = useState(null);

  const blank = { name:"", email:"", password:"", role:"subscriber", tier:"Free", avatar:null };
  const [form, setForm] = useState(blank);

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem("adminUsersList");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Normalise legacy shapes:
      //  - old records stored 'username' instead of 'name'
      //  - old roles were 'admin' / 'user'
      const normalised = parsed.map(u => {
        const name = u.name || u.username || "Unknown User";
        let role = u.role?.toLowerCase() || "subscriber";
        if (role === "admin") role = "moderator";
        if (role === "user")  role = "subscriber";
        const tier       = u.tier || "Free";
        const joinedDate = u.joinedDate || new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
        return { ...u, name, role, tier, joinedDate };
      }).filter(u => u.name && u.email); // drop any completely broken records

      // If after normalisation the list is empty, fall back to defaults
      if (normalised.length === 0) {
        localStorage.removeItem("adminUsersList");
        return [
          { id:1, name:"Admin User",  email:"admin@clearrisk.com", role:"moderator",  tier:"Premium", joinedDate:"Oct 24, 2023", avatar:null },
          { id:2, name:"John Doe",    email:"john@example.com",    role:"subscriber", tier:"Pro",     joinedDate:"Nov 12, 2023", avatar:null },
          { id:3, name:"Jane Smith",  email:"jane@example.com",    role:"suspended",  tier:"Free",    joinedDate:"Jan 05, 2024", avatar:null },
        ];
      }
      return normalised;
    }
    return [
      { id:1, name:"Admin User",  email:"admin@clearrisk.com", role:"moderator",  tier:"Premium", joinedDate:"Oct 24, 2023", avatar:null },
      { id:2, name:"John Doe",    email:"john@example.com",    role:"subscriber", tier:"Pro",     joinedDate:"Nov 12, 2023", avatar:null },
      { id:3, name:"Jane Smith",  email:"jane@example.com",    role:"suspended",  tier:"Free",    joinedDate:"Jan 05, 2024", avatar:null },
    ];
  });

  useEffect(() => { localStorage.setItem("adminUsersList", JSON.stringify(usersList)); }, [usersList]);

  /* ── CSV EXPORT ── */
  const handleExport = () => {
    const headers = ["Name","Email","Role","Tier","Joined Date"];
    const rows = usersList.map(u => [u.name, u.email, u.role, u.tier, u.joinedDate].map(v => `"${v}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const onImg    = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setForm(p => ({ ...p, avatar: r.result }));
    r.readAsDataURL(f);
  };

  const handleAdd = () => {
    if (!form.name || !form.email) return alert("Name and Email are required");
    setUsersList(p => [...p, { ...form, id:Date.now(), joinedDate:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) }]);
    setShowAdd(false); setForm(blank);
    addActivityLog(currentUser, "CREATE", `Created user "${form.name}"`, "success", "info");
  };

  const handleEdit = u => { setSelUser(u); setForm({ name:u.name, email:u.email, password:"", role:u.role, tier:u.tier, avatar:u.avatar }); setShowEdit(true); };
  const handleSave = () => {
    setUsersList(p => p.map(u => u.id===selUser.id ? { ...form, id:u.id, joinedDate:u.joinedDate, avatar:form.avatar||u.avatar } : u));
    setShowEdit(false); setForm(blank);
    addActivityLog(currentUser, "UPDATE", `Updated user "${form.name}"`, "success", "info");
  };

  const suspend = id => {
    const userToSuspend = usersList.find(u => u.id === id);
    if(userToSuspend) addActivityLog(currentUser, "UPDATE", `Suspended user "${userToSuspend.name}"`, "success", "warning");
    setUsersList(p => p.map(u => u.id===id ? { ...u, role:"suspended"  } : u));
  };
  
  const restore = id => {
    const userToRestore = usersList.find(u => u.id === id);
    if(userToRestore) addActivityLog(currentUser, "UPDATE", `Restored user "${userToRestore.name}"`, "success", "info");
    setUsersList(p => p.map(u => u.id===id ? { ...u, role:"subscriber" } : u));
  };

  /* ── FILTERING ── */
  const filtered = usersList.filter(u => {
    if (activeTab === "Subscribers" && u.role !== "subscriber") return false;
    if (activeTab === "Suspended"   && u.role !== "suspended") return false;
    if (panelFilters.role !== "All" && u.role !== panelFilters.role) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all:         usersList.length,
    subscribers: usersList.filter(u => u.role === "subscriber").length,
    suspended:   usersList.filter(u => u.role === "suspended").length,
  };

  return (
    <Layout>
      <div style={{ padding:"24px 28px", background:"#f1f5f9", minHeight:"100%", width:"100%" }}>
        <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 1px 8px rgba(0,0,0,0.07)", padding:"24px", border:"1px solid #e2e8f0" }}>

          <Header onAddClick={() => { setForm(blank); setShowAdd(true); }} onExport={handleExport}/>

          <FiltersBar
            activeTab={activeTab} setActiveTab={setActiveTab}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            counts={counts}
            panelFilters={panelFilters} setPanelFilters={setPanelFilters}
          />

          <UserTable users={filtered} onEdit={handleEdit} onSuspend={suspend} onRestore={restore}/>

        </div>
      </div>

      {showAdd  && <Modal title="Add New User"  form={form} onChange={onChange} onImgUpload={onImg} onSave={handleAdd}  onClose={() => setShowAdd(false)}  fileRef={fileRef} saveLabel="Save User"/>}
      {showEdit && <Modal title="Edit User"     form={form} onChange={onChange} onImgUpload={onImg} onSave={handleSave} onClose={() => setShowEdit(false)} fileRef={fileRef} saveLabel="Save Changes"/>}
    </Layout>
  );
};

export default Users;
