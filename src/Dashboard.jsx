import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Settings, LogOut, ChevronDown, Menu,
  LayoutDashboard, Folder, Users as UsersIcon, Clock,
  ShieldAlert, FileText, Plus, X, TrendingUp, TrendingDown,
  Minus, ExternalLink, Shield, Pin, Trash2, MoreVertical, AlertCircle, Edit2
} from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";
import Layout from "./Layout";
import ErrorBoundary from "./ErrorBoundary";
import { useTheme } from "./context/ThemeContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

/* ─── KPI CARD ─── */
const THEMES = {
  blue: { grad: ["rgba(59, 130, 246, 0.4)", "rgba(37, 99, 235, 0.6)"], bar: "var(--accent-primary)", light: "rgba(59, 130, 246, 0.1)" },
  red: { grad: ["rgba(239, 68, 68, 0.4)", "rgba(220, 38, 38, 0.6)"], bar: "var(--status-critical)", light: "rgba(239, 68, 68, 0.1)" },
  amber: { grad: ["rgba(245, 158, 11, 0.4)", "rgba(217, 119, 6, 0.6)"], bar: "var(--status-high)", light: "rgba(245, 158, 11, 0.1)" },
  green: { grad: ["rgba(16, 185, 129, 0.4)", "rgba(5, 150, 105, 0.6)"], bar: "var(--status-low)", light: "rgba(16, 185, 129, 0.1)" },
};

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}</>;
}

/* ─── KPI CARD ─── */
function KpiCard({ label, value, subtext, color, icon: Icon, isLoading }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const t = THEMES[color] || THEMES.blue;

  if (isLoading) {
    return (
      <div style={{
        background: "var(--bg-card)", borderRadius: 20, boxShadow: "var(--shadow-sm)",
        overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 160,
      }}>
        <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton-box" style={{ width: "40%", height: 14 }} />
          <div className="skeleton-box" style={{ width: "30%", height: 46 }} />
          <div className="skeleton-box" style={{ width: "70%", height: 14 }} />
        </div>
        <div className="skeleton-box" style={{ height: 5, borderRadius: 0 }} />
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: 20,
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 160,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
      position: "relative",
      border: "1px solid var(--border-primary)"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <div style={{
        position: "absolute",
        width: 180, height: 180,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 40%, ${t.grad[0]}, ${t.grad[1]})`,
        top: -50, right: -50,
        opacity: 0.88,
        zIndex: 0,
      }} />

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

      <div style={{ padding: "24px 24px 20px", flex: 1, position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12,
        }}>{label}</p>
        <p style={{
          fontSize: 46, fontWeight: 800, color: "var(--text-primary)",
          lineHeight: 1, marginBottom: 10, letterSpacing: "-1px",
        }}>
          <AnimatedCounter value={value} />
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{subtext}</p>
      </div>

      <div style={{ height: 4, background: t.bar, flexShrink: 0, opacity: 0.8 }} />
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
          background: "var(--bg-modal)",
          borderRadius: 20,
          boxShadow: "var(--shadow-md)",
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Create Risk Profile
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Fill in the details below to add a new profile
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--bg-input)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: 12, marginTop: 2,
              color: "var(--text-muted)", fontSize: 16, fontWeight: 700,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
          {[
            { label: "Profile Name", val: profileName, set: setProfileName, ph: "e.g. Financial Risk Profile" },
            { label: "Owner", val: profileOwner, set: setProfileOwner, ph: "e.g. John Smith" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--text-muted)", marginBottom: 8,
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
                  border: "1px solid var(--border-primary)",
                  borderRadius: 12,
                  background: "var(--bg-app)",
                  fontSize: 14, color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
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
              background: "var(--bg-input)", color: "var(--text-secondary)",
              border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--border-subtle)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-app)"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pinnedKris, setPinnedKris] = useState([]);
  const [pinnedRisks, setPinnedRisks] = useState([]);

  const [profileName, setProfileName] = useState("");
  const [profileOwner, setProfileOwner] = useState("");
  const [editingProfile, setEditingProfile] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    if (!u) { navigate("/login"); return; }

    // Simulate API fetch delay
    setTimeout(() => {
      setProfiles(JSON.parse(localStorage.getItem("riskProfiles")) || []);
      const savedPinned = JSON.parse(localStorage.getItem("pinnedKris")) || [];
      // Clean up legacy mock data
      const filteredPinned = savedPinned.filter(k => k.title !== "Revenue" && k.title !== "Online revenue growth");
      setPinnedKris(filteredPinned);
      setIsLoading(false);
    }, 1200);

    // Poll data
    const poll = setInterval(() => {
      const savedProfiles = JSON.parse(localStorage.getItem("riskProfiles") || "[]");
      setProfiles(savedProfiles.filter(p => !p.isDeleted));
      setPinnedKris(JSON.parse(localStorage.getItem("pinnedKris")) || []);
      setPinnedRisks(JSON.parse(localStorage.getItem("pinnedRisks") || "[]"));
    }, 3000);
    return () => clearInterval(poll);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkDependencies = (name) => {
    const allRisks = JSON.parse(localStorage.getItem("risks") || "[]");
    const profileRisks = allRisks.filter(r => r.profile === name);

    let krisCount = 0;
    let controlsCount = 0;
    let incidentsCount = 0;

    profileRisks.forEach(r => {
      krisCount += (JSON.parse(localStorage.getItem(`kris_${r.id}`)) || []).length;
      controlsCount += (JSON.parse(localStorage.getItem(`controls_${r.id}`)) || []).length;
      incidentsCount += (JSON.parse(localStorage.getItem(`incidents_${r.id}`)) || []).length;
    });

    return {
      risks: profileRisks.length,
      kris: krisCount,
      controls: controlsCount,
      incidents: incidentsCount,
      total: profileRisks.length + krisCount + controlsCount + incidentsCount
    };
  };

  const initiateDelete = (e, profile) => {
    e.stopPropagation();
    const deps = checkDependencies(profile.name);
    setProfileToDelete(profile);
    setDeleteDependencies(deps);
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const handleSoftDelete = () => {
    if (!profileToDelete) return;
    setIsDeleting(true);

    // Simulate API delay
    setTimeout(() => {
      const allProfiles = JSON.parse(localStorage.getItem("riskProfiles") || "[]");
      const updatedProfiles = allProfiles.map(p =>
        p.name === profileToDelete.name ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p
      );

      localStorage.setItem("riskProfiles", JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles.filter(p => !p.isDeleted));

      setIsDeleting(false);
      setShowDeleteModal(false);
      setProfileToDelete(null);
    }, 800);
  };

  const saveProfile = () => {
    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'moderator';
    if (!isAdmin) {
      console.error("403 Unauthorized: Only administrators can create risk profiles.");
      alert("403 Unauthorized");
      return;
    }
    if (!profileName.trim()) return alert("Enter a profile name");

    if (editingProfile) {
      const allProfiles = JSON.parse(localStorage.getItem("riskProfiles") || "[]");
      const upd = allProfiles.map(p =>
        p.name === editingProfile.name ? { ...p, name: profileName, owner: profileOwner } : p
      );
      localStorage.setItem("riskProfiles", JSON.stringify(upd));
      setProfiles(upd.filter(p => !p.isDeleted));
    } else {
      const p = { name: profileName, owner: profileOwner, trend: "→", risk: "High", date: new Date().toLocaleString() };
      const upd = [...profiles, p];
      localStorage.setItem("riskProfiles", JSON.stringify(upd));
      setProfiles(upd);
    }

    setProfileName(""); setProfileOwner(""); setShowModal(false); setEditingProfile(null);
  };

  const initiateEdit = (e, p) => {
    e.stopPropagation();
    setEditingProfile(p);
    setProfileName(p.name);
    setProfileOwner(p.owner);
    setShowModal(true);
    setActiveMenu(null);
  };

  const total = profiles.length;
  const high = profiles.filter(p => p.risk === "High").length;
  const medium = profiles.filter(p => p.risk === "Medium").length;
  const low = profiles.filter(p => p.risk === "Low").length;

  const getLevel = (score) => {
    if (!score || score === 0) return "Not Assessed";
    if (score >= 17) return "Critical";
    if (score >= 10) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "Critical": return { bg: "rgba(248, 113, 113, 0.1)", color: "var(--status-critical)", dot: "var(--status-critical)" };
      case "High": return { bg: "rgba(251, 146, 60, 0.1)", color: "var(--status-high)", dot: "var(--status-high)" };
      case "Medium": return { bg: "rgba(251, 191, 36, 0.1)", color: "var(--status-medium)", dot: "var(--status-medium)" };
      case "Low": return { bg: "rgba(52, 211, 153, 0.1)", color: "var(--status-low)", dot: "var(--status-low)" };
      default: return { bg: "var(--border-subtle)", color: "var(--text-muted)", dot: "var(--text-muted)" };
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-box {
            background: var(--bg-input);
            border-radius: 8px;
            animation: pulse 1.5s infinite ease-in-out;
          }
        `}
        </style>
        {/* ── HEADER CARD ── */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-sm)",
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
                background: "var(--bg-active)", borderRadius: 999,
                padding: "3px 10px", marginBottom: 10,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-accent)" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)" }}>
                  Admin Console
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
                My Dashboard
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 6, fontWeight: 400 }}>
                Welcome back,{" "}
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{user.username}</span>
                {" "}👋&nbsp; Have a productive day!
              </p>
            </div>

            {/* Right button */}
            {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "moderator") && (
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
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)"}
              >
                <Plus size={16} />
                Add Risk Profile
              </button>
            )}
          </div>
        </div>

        {/* ── KPI GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}>
          <KpiCard label="Total Risks" value={total} subtext="All registered profiles" color="blue" icon={Shield} isLoading={isLoading} />
          <KpiCard label="High Risk" value={high} subtext="Needs immediate attention" color="red" icon={ShieldAlert} isLoading={isLoading} />
          <KpiCard label="Medium Risk" value={medium} subtext="Monitor closely" color="amber" icon={TrendingUp} isLoading={isLoading} />
          <KpiCard label="Low Risk" value={low} subtext="Under control" color="green" icon={TrendingDown} isLoading={isLoading} />
        </div>

        {/* ── PRIORITY RISKS SECTION ── */}
        {pinnedRisks.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Pin size={18} color="var(--text-accent)" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Priority Risks</h2>
              <span style={{ fontSize: 11, background: "var(--bg-active)", color: "var(--text-accent)", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>TOP {Math.min(pinnedRisks.length, 5)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {pinnedRisks
                .sort((a, b) => {
                  const sevMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
                  const bSev = sevMap[b.severity] || 0;
                  const aSev = sevMap[a.severity] || 0;
                  if (bSev !== aSev) return bSev - aSev;
                  return (b.score || 0) - (a.score || 0);
                })
                .slice(0, 5)
                .map(risk => (
                  <div key={risk.riskId}
                    onClick={() => navigate(`/risk-profile/${risk.riskId}`)}
                    style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-primary)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "var(--shadow-sm)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{risk.title}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: risk.severity === "Critical" ? "#ef4444" : "#f59e0b" }}>{risk.severity.toUpperCase()}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>•</span>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Owner: {risk.owner}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{risk.score}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-accent)", textTransform: "uppercase" }}>{risk.type}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── RISK PROFILE SUMMARY TABLE ── */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          {/* Table header row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px 16px",
            borderBottom: "1px solid var(--border-primary)",
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Risk Profile Summary
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                {profiles.length} profile{profiles.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-app)" }}>
                  {[
                    { label: "Risk Profile", width: "28%" },
                    { label: "Owner", width: "20%" },
                    { label: "Trend", width: "12%" },
                    { label: "Risk Level", width: "15%" },
                    { label: "Last Updated", width: "20%" },
                    { label: "", width: "5%" },
                  ].map(({ label, width }) => (
                    <th key={label} style={{
                      width,
                      textAlign: "left",
                      padding: "11px 20px",
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border-primary)",
                      whiteSpace: "nowrap",
                    }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Skeleton rows
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                      <td style={{ padding: "13px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="skeleton-box" style={{ width: 34, height: 34, borderRadius: 10 }} />
                          <div className="skeleton-box" style={{ width: 120, height: 16 }} />
                        </div>
                      </td>
                      <td style={{ padding: "13px 20px" }}><div className="skeleton-box" style={{ width: 80, height: 16 }} /></td>
                      <td style={{ padding: "13px 20px" }}><div className="skeleton-box" style={{ width: 24, height: 16 }} /></td>
                      <td style={{ padding: "13px 20px" }}><div className="skeleton-box" style={{ width: 60, height: 22, borderRadius: 999 }} /></td>
                      <td style={{ padding: "13px 20px" }}><div className="skeleton-box" style={{ width: 140, height: 14 }} /></td>
                    </tr>
                  ))
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "60px 24px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 60, height: 60, borderRadius: "50%",
                          background: "var(--bg-hover)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Folder size={28} color="var(--text-muted)" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
                          No risk profiles yet
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                          Create your first profile to start tracking risks
                        </p>
                        <button
                          onClick={() => setShowModal(true)}
                          style={{
                            marginTop: 4,
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "var(--bg-active)", color: "var(--text-accent)",
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
                  (() => {
                    const allRisks = JSON.parse(localStorage.getItem("risks") || "[]");
                    return profiles.map((p, i) => {
                      const profileRisks = allRisks.filter(r => r.profile === p.name);
                      const isEscalated = profileRisks.some(r => r.isEscalated);

                      let maxScore = 0;
                      if (profileRisks.length > 0) {
                        maxScore = Math.max(...profileRisks.map(r => (r.impact || 0) * (r.likelihood || 0)));
                      }
                      const computedLevel = profileRisks.length > 0 ? getLevel(maxScore) : "Not Assessed";
                      const rc = getLevelStyle(computedLevel);

                      const trendMap = {
                        "↑": { icon: <TrendingUp size={14} />, color: "#ef4444" },
                        "↓": { icon: <TrendingDown size={14} />, color: "#10b981" },
                        "→": { icon: <Minus size={14} />, color: "var(--text-muted)" },
                      };

                      const tr = isEscalated ? trendMap["↑"] : (trendMap[p.trend] || trendMap["→"]);

                      return (
                        <tr
                          key={i}
                          onClick={() => { localStorage.setItem("selectedProfile", p.name); navigate("/risk-profile"); }}
                          style={{ cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid var(--border-primary)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-app)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "13px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: isEscalated ? "rgba(239, 68, 68, 0.1)" : "var(--bg-active)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}>
                                <Folder size={15} color={isEscalated ? "#ef4444" : "var(--text-accent)"} />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                  {p.name}
                                </span>
                                {isEscalated && (
                                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#ef4444", textTransform: "uppercase", marginTop: "2px" }}>
                                    ● Escalated
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: "var(--bg-active)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--text-accent)", fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}>
                                {(p.owner || "?").charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p.owner || "—"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: tr.color, fontWeight: 600, fontSize: 13 }}>
                              {tr.icon}
                            </span>
                          </td>
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              background: rc.bg, color: rc.color,
                              borderRadius: 999, padding: "4px 10px",
                              fontSize: 11.5, fontWeight: 700,
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: rc.dot, flexShrink: 0 }} />
                              {computedLevel}
                            </span>
                          </td>
                          <td style={{ padding: "13px 20px", fontSize: 12, color: "var(--text-muted)" }}>
                            {p.date}
                          </td>
                          <td style={{ padding: "13px 20px", textAlign: "right", position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {activeMenu === i && (
                                <div
                                  ref={menuRef}
                                  style={{ position: "absolute", right: 24, top: 40, background: "var(--bg-card)", borderRadius: 12, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-primary)", zIndex: 100, minWidth: 160, padding: 6, overflow: "hidden" }}
                                >
                                  <button
                                    onClick={() => { localStorage.setItem("selectedProfile", p.name); navigate("/risk-profile"); }}
                                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-app)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <ExternalLink size={14} /> View Details
                                  </button>

                                  <button
                                    onClick={(e) => initiateEdit(e, p)}
                                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-app)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <Edit2 size={14} /> Edit Profile
                                  </button>

                                  {user?.role?.toLowerCase() === "admin" && (
                                    <div style={{ borderTop: "1px solid var(--border-primary)", marginTop: 4, paddingTop: 4 }}>
                                      <button
                                        onClick={(e) => initiateDelete(e, p)}
                                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", borderRadius: 8, color: "var(--status-critical)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                      >
                                        <Trash2 size={14} /> Delete Profile
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* ── PINNED KRIs ── */}
        {pinnedKris.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Pin size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Pinned Key Risk Indicators
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
              {pinnedKris.map(kri => (
                <div key={`${kri.riskId}-${kri.id}`} style={{
                  background: "var(--bg-card)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-primary)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{kri.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-primary)", background: "var(--bg-app)", padding: "2px 8px", borderRadius: 999 }}>{kri.riskTitle || "Risk Profile"}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Owner: {kri.owner}</span>
                    </div>
                  </div>

                  <div style={{ height: "200px", padding: "10px 0" }}>
                    {kri.type === "Line" && (
                      <Line
                        data={{
                          labels: kri.labels,
                          datasets: [{
                            label: kri.title,
                            data: kri.data,
                            borderColor: "var(--status-critical)",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: "var(--bg-card)",
                            pointBorderColor: "var(--status-critical)",
                            pointBorderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { 
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: "var(--bg-modal)",
                              titleColor: "var(--text-primary)",
                              bodyColor: "var(--text-secondary)",
                              borderColor: "var(--border-primary)",
                              borderWidth: 1
                            }
                          },
                          scales: {
                            y: { beginAtZero: true, grid: { color: "var(--border-primary)" }, ticks: { color: "var(--text-muted)", font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { color: "var(--text-muted)", font: { size: 10 } } }
                          }
                        }}
                      />
                    )}
                    {(kri.type === "Column" || kri.type === "Stacked") && (
                      <Bar
                        data={{
                          labels: kri.labels,
                          datasets: [{
                            label: kri.title,
                            data: kri.data,
                            backgroundColor: "var(--status-critical)",
                            borderRadius: 4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { 
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: "var(--bg-modal)",
                              titleColor: "var(--text-primary)",
                              bodyColor: "var(--text-secondary)",
                              borderColor: "var(--border-primary)",
                              borderWidth: 1
                            }
                          },
                          scales: {
                            y: { beginAtZero: true, grid: { color: "var(--border-primary)" }, ticks: { color: "var(--text-muted)", font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { color: "var(--text-muted)", font: { size: 10 } } }
                          }
                        }}
                      />
                    )}
                    {kri.type === "Pie" && (
                      <Pie
                        data={{
                          labels: kri.labels || ["No Data"],
                          datasets: [{
                            data: kri.data || [100],
                            backgroundColor: ["#22C55E", "#F59E0B", "#EF4444", "#3b82f6", "#8b5cf6"],
                            borderWidth: 0
                          }]
                        }}
                        options={{ responsive: true, maintainAspectRatio: false }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {showDeleteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10005, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => !isDeleting && setShowDeleteModal(false)}>
            <div style={{ background: "var(--bg-modal)", borderRadius: 24, width: "100%", maxWidth: 440, padding: "32px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-primary)", position: "relative" }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-critical)", marginBottom: 24 }}>
                <AlertCircle size={28} />
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px 0" }}>Delete Risk Profile?</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px 0", lineHeight: 1.6 }}>
                You are about to delete <strong style={{ color: "var(--text-primary)" }}>{profileToDelete?.name}</strong>. This action will mark the profile as deleted and hide it from all dashboards.
              </p>

              {deleteDependencies?.total > 0 && (
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: "16px", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <ShieldAlert size={16} color="var(--status-high)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--status-high)" }}>Linked Dependencies Found</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>• Risks: <strong style={{ color: "var(--text-primary)" }}>{deleteDependencies.risks}</strong></div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>• KRIs: <strong style={{ color: "var(--text-primary)" }}>{deleteDependencies.kris}</strong></div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>• Controls: <strong style={{ color: "var(--text-primary)" }}>{deleteDependencies.controls}</strong></div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>• Incidents: <strong style={{ color: "var(--text-primary)" }}>{deleteDependencies.incidents}</strong></div>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--status-high)", opacity: 0.8, marginTop: 12, fontWeight: 600 }}>Deleting this profile will also hide these linked records.</p>
                </div>
              )}

              <div style={{ background: "rgba(239, 68, 68, 0.05)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(239, 68, 68, 0.1)", marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--status-critical)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Warning: This action cannot be undone.</p>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-primary)", background: "var(--bg-app)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, cursor: isDeleting ? "not-allowed" : "pointer" }}
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleSoftDelete}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: isDeleting ? "var(--text-muted)" : "var(--status-critical)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: isDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <RiskModal
            onClose={() => setShowModal(false)}
            onSave={saveProfile}
            profileName={profileName} setProfileName={setProfileName}
            profileOwner={profileOwner} setProfileOwner={setProfileOwner}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}