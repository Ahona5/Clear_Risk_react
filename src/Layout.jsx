import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu, Bell, User, LogOut,
  LayoutDashboard, Folder, ShieldAlert, Users as UsersIcon, FileText, Clock
} from "lucide-react";

/* ─── NOTIFICATION DROPDOWN ─── */
function NotifPanel({ items, onRead, onReadAll }) {
  return (
    <div style={{
      position: "absolute", right: 0, top: "48px", zIndex: 9999,
      width: "320px", minWidth: "320px",
      background: "#fff", borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
      border: "1px solid #e2e8f0", overflow: "hidden",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px", borderBottom: "1px solid #f1f5f9",
        background: "#fff", flexShrink: 0
      }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Notifications</span>
        {items.some(n => !n.read) && (
          <button onClick={onReadAll}
            style={{
              fontSize: "12px", fontWeight: 600, color: "#3b82f6", background: "none",
              border: "none", cursor: "pointer", padding: 0
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Mark all read
          </button>
        )}
      </div>
      <div style={{ maxHeight: "320px", overflowY: "auto", overflowX: "hidden", background: "#fff" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "32px 0", margin: 0 }}>No new notifications</p>
        ) : items.map(n => (
          <div key={n.id} onClick={() => onRead(n.id)}
            style={{
              padding: "16px", cursor: "pointer", borderBottom: "1px solid #f8fafc",
              background: !n.read ? "#f0fbf8" : "#fff",
              display: "flex", gap: "12px", alignItems: "flex-start",
              width: "100%", boxSizing: "border-box", transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = !n.read ? "#e0f2fe" : "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = !n.read ? "#f0fbf8" : "#fff"}
          >
            {!n.read ? (
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: "6px" }} />
            ) : (
              <div style={{ width: "8px", height: "8px", flexShrink: 0 }} /> // Placeholder for alignment
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "13px", color: "#334155", margin: 0,
                lineHeight: "1.4", wordWrap: "break-word", whiteSpace: "normal"
              }}>
                {n.message}
              </p>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SIDEBAR NAV ITEM ─── */
function NavItem({ label, path, icon: Icon, active, badge, collapsed, onClick }) {
  return (
    <button onClick={() => onClick(path)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
        background: active ? "rgba(59, 130, 246, 0.12)" : "transparent",
        color: active ? "#2563eb" : "#64748b", border: "none", cursor: "pointer",
        transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start"
      }}
      onMouseEnter={e => { if(!active) { e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)"; e.currentTarget.style.color = "#1e293b"; } }}
      onMouseLeave={e => { if(!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
    >
      <Icon size={19} color={active ? "#2563eb" : "inherit"} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
      {!collapsed && badge > 0 && (
        <span style={{
          background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "2px 6px", borderRadius: 999, flexShrink: 0
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };
  const [profiles, setProfiles] = useState(JSON.parse(localStorage.getItem("riskProfiles")) || []);
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem("notifications")) || []);

  const loadData = () => {
    setProfiles(JSON.parse(localStorage.getItem("riskProfiles")) || []);
    setNotifications(JSON.parse(localStorage.getItem("notifications")) || []);
  };

  useEffect(() => {
    const onStorage = e => {
      if (e.key === "riskProfiles" || e.key === "notifications") loadData();
    };
    window.addEventListener("storage", onStorage);
    const poll = setInterval(loadData, 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(poll);
    };
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = id => {
    const upd = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(upd);
    localStorage.setItem("notifications", JSON.stringify(upd));
  };
  const markAllRead = () => {
    const upd = notifications.map(n => ({ ...n, read: true }));
    setNotifications(upd);
    localStorage.setItem("notifications", JSON.stringify(upd));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleNav = (path) => {
    if (path) navigate(path);
  };

  const SIDEBAR_W = collapsed ? 72 : 240;

  const isAdmin = user.role === "admin" || user.role === "moderator";

  const nav = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, active: location.pathname === "/dashboard" },
    { label: "Risk Profiles", path: "/risk-profile", icon: Folder, badge: profiles.length, active: location.pathname === "/risk-profile" },
    { label: "Risks", path: null, icon: ShieldAlert, badge: 0 },
    isAdmin && { label: "Users", path: "/users", icon: UsersIcon, badge: 0, active: location.pathname === "/users" },
    { label: "Report Incident", path: null, icon: FileText, badge: 0 },
    isAdmin && { label: "Activity", path: "/activity", icon: Clock, badge: 0, active: location.pathname === "/activity" },
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* ══════════ TOPBAR ══════════ */}
      <div style={{
        height: 60, minHeight: 60, background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", zIndex: 30, flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
              cursor: "pointer"
            }}
          >
            <Menu size={18} />
          </button>
          <img src="/images/logo.png" alt="Clear Risk" style={{ height: 32, width: "auto", objectFit: "contain" }} />
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          {/* Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); }}
              style={{
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
                cursor: "pointer", position: "relative"
              }}
            >
              <Bell size={16} />
              {unread > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4, minWidth: 16, height: 16,
                  background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700,
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px"
                }}>
                  {unread}
                </span>
              )}
            </button>
            {showNotifs && <NotifPanel items={notifications} onRead={markRead} onReadAll={markAllRead} />}
          </div>

          {/* User */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { navigate("/profile"); setShowNotifs(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                borderRadius: 12, background: "transparent", border: "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                fontSize: 13, fontWeight: 700, overflow: "hidden", flexShrink: 0
              }}>
                {user.profileImage
                  ? <img src={user.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : user.username.charAt(0).toUpperCase()
                }
              </div>
              <div style={{ textAlign: "left", display: "none" }} className="sm:block">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1 }}>{user.username}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginTop: 2, textTransform: "capitalize" }}>{user.role}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── SIDEBAR ── */}
        <div style={{
          width: SIDEBAR_W, minWidth: SIDEBAR_W, flexShrink: 0,
          background: "#f0f4ff",
          borderRight: "1px solid #e2e8f0",
          overflowY: "auto", overflowX: "hidden",
          transition: "width 0.25s ease",
          display: "flex", flexDirection: "column", gap: 4,
          padding: "16px 10px",
        }}>
          {nav.map(item => (
            <NavItem key={item.label} {...item} collapsed={collapsed} onClick={handleNav} />
          ))}
          <div style={{ flex: 1 }} />

          <button onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: "transparent", color: "#ef4444", border: "none", cursor: "pointer",
              transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start",
              marginTop: "auto"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <LogOut size={19} color="#ef4444" style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "28px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
