import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Settings, LogOut, ChevronDown, Menu,
  LayoutDashboard, Folder, Users as UsersIcon, Clock,
  ShieldAlert, FileText, Plus, X, TrendingUp, TrendingDown,
  Minus, ExternalLink, Shield,
} from "lucide-react";

/* ─── KPI CARD ─── */
const THEMES = {
  blue:  { grad: ["#93c5fd","#3b82f6"], bar: "#3b82f6", light: "#eff6ff" },
  red:   { grad: ["#fca5a5","#ef4444"], bar: "#ef4444", light: "#fef2f2" },
  amber: { grad: ["#fcd34d","#f59e0b"], bar: "#f59e0b", light: "#fffbeb" },
  green: { grad: ["#6ee7b7","#10b981"], bar: "#10b981", light: "#f0fdf4" },
};

function KpiCard({ label, value, subtext, color, icon: Icon }) {
  const t = THEMES[color] || THEMES.blue;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 160,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
      position: "relative",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";   e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.07)";  }}
    >
      {/* Large gradient bubble — fills the right half */}
      <div style={{
        position: "absolute",
        width: 180, height: 180,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 40%, ${t.grad[0]}, ${t.grad[1]})`,
        top: -50, right: -50,
        opacity: 0.88,
        zIndex: 0,
      }} />

      {/* Icon box — floating on the bubble */}
      <div style={{
        position: "absolute",
        top: 20, right: 20,
        width: 46, height: 46,
        borderRadius: 14,
        background: "rgba(255,255,255,0.28)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      }}>
        <Icon size={24} color="#fff" strokeWidth={2.2} />
      </div>

      {/* Text content */}
      <div style={{ padding: "24px 24px 20px", flex: 1, position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#94a3b8", marginBottom: 12,
        }}>{label}</p>
        <p style={{
          fontSize: 46, fontWeight: 800, color: "#0f172a",
          lineHeight: 1, marginBottom: 10, letterSpacing: "-1px",
        }}>{value}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{subtext}</p>
      </div>

      {/* Accent bottom bar */}
      <div style={{ height: 5, background: t.bar, flexShrink: 0 }} />
    </div>
  );
}

/* ─── MODAL ─── */
function RiskModal({ onClose, onSave, profileName, setProfileName, profileOwner, setProfileOwner }) {
  return (
    /* Full-screen overlay — centered */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          padding: "32px",
          width: "100%",
          maxWidth: 460,
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4, borderRadius: "20px 20px 0 0",
          background: "linear-gradient(90deg, #3b82f6, #6366f1)",
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Create Risk Profile
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              Fill in the details below to add a new profile
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#f1f5f9", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: 12, marginTop: 2,
              color: "#64748b", fontSize: 16, fontWeight: 700,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
          {[
            { label: "Profile Name", val: profileName, set: setProfileName, ph: "e.g. Financial Risk Profile" },
            { label: "Owner",        val: profileOwner, set: setProfileOwner, ph: "e.g. John Smith"            },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#64748b", marginBottom: 8,
              }}>
                {label}
              </label>
              <input
                type="text"
                placeholder={ph}
                value={val}
                onChange={e => set(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "11px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 12,
                  background: "#f8fafc",
                  fontSize: 14, color: "#0f172a",
                  outline: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSave}
            style={{
              flex: 1, padding: "12px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              transition: "opacity 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Create Profile
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px",
              background: "#f1f5f9", color: "#475569",
              border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
            onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

import Layout from "./Layout";

/* ─── DASHBOARD ─── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [profiles,         setProfiles]         = useState([]);
  const [showModal,        setShowModal]         = useState(false);

  const [profileName,      setProfileName]       = useState("");
  const [profileOwner,     setProfileOwner]      = useState("");

  const user = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    if (!u) { navigate("/login"); return; }
    
    // Poll data for dashboard specific updates
    const poll = setInterval(() => {
      setProfiles(JSON.parse(localStorage.getItem("riskProfiles")) || []);
    }, 3000);
    return () => clearInterval(poll);
  }, [navigate]);

  const saveProfile = () => {
    if (!profileName.trim()) return alert("Enter a profile name");
    const p = { name: profileName, owner: profileOwner, trend: "→", risk: "High", date: new Date().toLocaleString() };
    const upd = [...profiles, p];
    localStorage.setItem("riskProfiles", JSON.stringify(upd));
    setProfiles(upd);
    setProfileName(""); setProfileOwner(""); setShowModal(false);
  };

  const total  = profiles.length;
  const high   = profiles.filter(p => p.risk === "High").length;
  const medium = profiles.filter(p => p.risk === "Medium").length;
  const low    = profiles.filter(p => p.risk === "Low").length;

  return (
    <Layout>


          {/* ── HEADER CARD ── */}
          <div style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            padding: "0",
            marginBottom: 28,
            overflow: "hidden",
          }}>
            {/* Top accent strip */}
            <div style={{
              height: 5,
              background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)",
            }} />

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px 22px",
              flexWrap: "wrap",
              gap: 16,
            }}>
              {/* Left text */}
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#eff6ff", borderRadius: 999,
                  padding: "3px 10px", marginBottom: 10,
                }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#3b82f6" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform:"uppercase", color:"#3b82f6" }}>
                    Admin Console
                  </span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin:0, lineHeight:1.2 }}>
                  My Dashboard
                </h1>
                <p style={{ fontSize: 13.5, color: "#94a3b8", marginTop: 6, fontWeight: 400 }}>
                  Welcome back,{" "}
                  <span style={{ fontWeight: 700, color: "#475569" }}>{user.username}</span>
                  {" "}👋&nbsp; Have a productive day!
                </p>
              </div>

              {/* Right button */}
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "11px 22px",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow="0 4px 14px rgba(99,102,241,0.35)"}
              >
                <Plus size={16} />
                Add Risk Profile
              </button>
            </div>
          </div>

          {/* ── KPI GRID ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 28,
          }}>
            <KpiCard label="Total Risks"  value={total}  subtext="All registered profiles"   color="blue"  icon={Shield}       />
            <KpiCard label="High Risk"    value={high}   subtext="Needs immediate attention" color="red"   icon={ShieldAlert}  />
            <KpiCard label="Medium Risk"  value={medium} subtext="Monitor closely"           color="amber" icon={TrendingUp}   />
            <KpiCard label="Low Risk"     value={low}    subtext="Under control"             color="green" icon={TrendingDown} />
          </div>

          {/* ── RISK PROFILE SUMMARY TABLE ── */}
          <div style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}>
            {/* Table header row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px 16px",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Risk Profile Summary
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                  {profiles.length} profile{profiles.length !== 1 ? "s" : ""} total
                </p>
              </div>
              <button
                onClick={() => navigate("/risk-profile")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 700, color: "#3b82f6",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 10px", borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                View all <ExternalLink size={12} />
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      { label: "Risk Profile", width: "28%" },
                      { label: "Owner",        width: "20%" },
                      { label: "Trend",        width: "12%" },
                      { label: "Risk Level",   width: "15%" },
                      { label: "Last Updated", width: "25%" },
                    ].map(({ label, width }) => (
                      <th key={label} style={{
                        width,
                        textAlign: "left",
                        padding: "11px 20px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        borderBottom: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "60px 24px", textAlign: "center" }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 10 }}>
                          <div style={{
                            width: 60, height: 60, borderRadius: "50%",
                            background: "#f1f5f9",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Folder size={28} color="#94a3b8" />
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b", margin: 0 }}>
                            No risk profiles yet
                          </p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                            Create your first profile to start tracking risks
                          </p>
                          <button
                            onClick={() => setShowModal(true)}
                            style={{
                              marginTop: 4,
                              display: "inline-flex", alignItems: "center", gap: 6,
                              background: "#eff6ff", color: "#3b82f6",
                              border: "none", borderRadius: 999,
                              padding: "8px 18px", fontSize: 13, fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={14} /> Create first profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    profiles.map((p, i) => {
                      const riskColors = {
                        High:   { bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" },
                        Medium: { bg: "#fffbeb", color: "#f59e0b", dot: "#f59e0b" },
                        Low:    { bg: "#f0fdf4", color: "#10b981", dot: "#10b981" },
                      };
                      const rc = riskColors[p.risk] || { bg:"#f1f5f9", color:"#64748b", dot:"#94a3b8" };
                      const trendMap = {
                        "↑": { icon: <TrendingUp  size={14} />, color: "#ef4444" },
                        "↓": { icon: <TrendingDown size={14} />, color: "#10b981" },
                        "→": { icon: <Minus        size={14} />, color: "#94a3b8" },
                      };
                      const tr = trendMap[p.trend] || trendMap["→"];

                      return (
                        <tr
                          key={i}
                          onClick={() => { localStorage.setItem("selectedProfile", p.name); navigate("/risk-profile"); }}
                          style={{ cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #f8fafc" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {/* Profile name */}
                          <td style={{ padding: "13px 20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                flexShrink: 0,
                              }}>
                                <Folder size={15} color="#6366f1" />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                {p.name}
                              </span>
                            </div>
                          </td>

                          {/* Owner */}
                          <td style={{ padding: "13px 20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}>
                                {(p.owner || "?").charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, color: "#475569" }}>{p.owner || "—"}</span>
                            </div>
                          </td>

                          {/* Trend */}
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{
                              display:"inline-flex", alignItems:"center", gap: 4,
                              color: tr.color, fontWeight: 600, fontSize: 13,
                            }}>
                              {tr.icon}
                            </span>
                          </td>

                          {/* Risk level pill */}
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{
                              display:"inline-flex", alignItems:"center", gap: 5,
                              background: rc.bg, color: rc.color,
                              borderRadius: 999, padding: "4px 10px",
                              fontSize: 11.5, fontWeight: 700,
                            }}>
                              <span style={{ width:6, height:6, borderRadius:"50%", background: rc.dot, flexShrink:0 }} />
                              {p.risk}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "13px 20px", fontSize: 12, color: "#94a3b8" }}>
                            {p.date}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* MODAL */}
      {showModal && (
        <RiskModal
          onClose={() => setShowModal(false)}
          onSave={saveProfile}
          profileName={profileName}   setProfileName={setProfileName}
          profileOwner={profileOwner} setProfileOwner={setProfileOwner}
        />
      )}
    </Layout>
  );
}