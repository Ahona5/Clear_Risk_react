import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle, Pin, User, ChevronDown, Save, X,
  Target, Zap, Shield, FileText, Activity, MessageSquare,
  History, PieChart, Info, Edit3, ArrowLeft, RefreshCw, Clock, Plus, Trash2, Edit, MoreVertical
} from "lucide-react";
import Layout from "./Layout";
import EscalateModal from "./EscalateModal";
import KRIModal from "./KRIModal";
import ControlModal from "./ControlModal";
import ActionModal from "./ActionModal";
import CommentSystem from "./CommentSystem";
import { addActivityLog } from "./logger";
import { Doughnut, Line, Bar, Pie } from "react-chartjs-2";
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

/* ─── STYLES ─── */
const styles = {
  card: { background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "relative" },
  badge: (bg, color) => ({ background: bg, color, padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }),
  input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "14px", outline: "none", transition: "all 0.2s" },
  label: { fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: "0",
    minWidth: "160px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
    zIndex: 99999,
    padding: "6px",
    marginTop: "8px",
    boxSizing: "border-box"
  },
  dropdownItem: {
    padding: "10px 12px",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "6px",
    marginBottom: "2px"
  }
};

/* ─── MATRIX LOGIC ─── */
const getMatrixColor = (score) => {
  if (score >= 12) return "#fca5a5"; // Critical (Pastel Rose)
  if (score >= 8) return "#fdba74";  // High (Pastel Orange)
  if (score >= 4) return "#fef08a";  // Medium (Pastel Sun)
  return "#86efac"; // Low (Pastel Mint)
};

const matrixValues = [
  [5, 10, 15, 20, 25], // Impact 5
  [4, 8, 12, 16, 20],  // Impact 4
  [3, 6, 9, 12, 15],  // Impact 3
  [2, 4, 6, 8, 10],   // Impact 2
  [1, 2, 3, 4, 5]     // Impact 1
];

export default function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Admin", role: "admin" });
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [tempSummary, setTempSummary] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [tempForm, setTempForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form State
  const [form, setForm] = useState({
    summary: "",
    riskEvent: "",
    rootCauses: "",
    consequences: "",
    appetite: "",
    status: "Open"
  });

  const [kris, setKris] = useState(() => {
    const saved = localStorage.getItem(`kris_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up legacy mock data if it exists
      const filtered = parsed.filter(k => k.title !== "Revenue" && k.title !== "Online revenue growth");
      if (filtered.length !== parsed.length) {
        localStorage.setItem(`kris_${id}`, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  });

  const [showKriModal, setShowKriModal] = useState(false);
  const [editingKri, setEditingKri] = useState(null);
  const [showControlModal, setShowControlModal] = useState(false);
  const [controls, setControls] = useState(() => {
    const saved = localStorage.getItem(`controls_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [actions, setActions] = useState(() => {
    const saved = localStorage.getItem(`actions_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`kris_${id}`, JSON.stringify(kris));

    // Update global pinned KRIs
    const allPinned = JSON.parse(localStorage.getItem("pinnedKris")) || [];
    const otherPinned = allPinned.filter(k => k.riskId !== id);
    const myPinned = kris.filter(k => k.isPinned).map(k => ({ ...k, riskId: id, riskTitle: risk?.title }));
    localStorage.setItem("pinnedKris", JSON.stringify([...otherPinned, ...myPinned]));
  }, [kris, id, risk]);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) setUser(savedUser);

      const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
      const found = allRisks.find(r => String(r.id) === String(id));

      if (found) {
        setRisk(found);
        const initialForm = {
          summary: found.summary || "",
          riskEvent: found.riskEvent || "",
          rootCauses: found.rootCauses || "",
          consequences: found.consequences || "",
          appetite: found.appetite || "",
          status: found.status || "Open"
        };
        setForm(initialForm);
        if (!found.riskEvent && !found.rootCauses) {
          setIsEditingDetails(true);
        }
      }
    } catch (err) {
      console.error("Error loading risk details:", err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!risk) return;
    setSaveStatus("saving");

    setTimeout(() => {
      const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
      const updated = allRisks.map(r => String(r.id) === String(id) ? { ...r, ...form } : r);
      localStorage.setItem("risks", JSON.stringify(updated));
      setRisk({ ...risk, ...form });
      addActivityLog(user, "UPDATE", `Updated details for risk "${risk.title}"`, "success", "info");

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 600);
  };

  const handleEscalate = (data) => {
    if (!risk) return;
    const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
    const updated = allRisks.map(r => String(r.id) === String(id) ? { ...r, isEscalated: true, escalatedTo: data.taggedUser } : r);
    localStorage.setItem("risks", JSON.stringify(updated));
    setRisk({ ...risk, isEscalated: true, escalatedTo: data.taggedUser });
    addActivityLog(user, "ESCALATE", `Escalated risk "${risk.title}" to ${data.taggedUser}`, "success", "critical");
    setEscalateModalOpen(false);
  };

  const handleDeleteKri = (kriId) => {
    if (window.confirm("Are you sure you want to delete this KRI?")) {
      const updatedKris = kris.filter(k => k.id !== kriId);
      setKris(updatedKris);
      addActivityLog(user, "DELETE", "Deleted a Key Risk Indicator", "warning", "info");
      setActiveMenu(null);
    }
  };

  const handleEditKri = (kri) => {
    setEditingKri(kri);
    setShowKriModal(true);
    setActiveMenu(null);
  };

  const handlePinKri = (kriId) => {
    const updatedKris = kris.map(k => k.id === kriId ? { ...k, isPinned: !k.isPinned } : k);
    setKris(updatedKris);
    const kri = updatedKris.find(k => k.id === kriId);
    addActivityLog(user, "UPDATE", `${kri.isPinned ? "Pinned" : "Unpinned"} KRI: ${kri.title}`, "success", "info");
    setActiveMenu(null);
  };

  const handleSaveKri = (newKriData) => {
    if (editingKri) {
      setKris(kris.map(k => k.id === newKriData.id ? newKriData : k));
      addActivityLog(user, "UPDATE", `Updated KRI: ${newKriData.title}`, "success", "info");
    } else {
      setKris([...kris, newKriData]);
      addActivityLog(user, "CREATE", `Added new KRI: ${newKriData.title}`, "success", "info");
    }
    setEditingKri(null);
  };

  const handleSaveControls = (newControls) => {
    const updatedControls = [...controls, ...newControls];
    setControls(updatedControls);
    localStorage.setItem(`controls_${id}`, JSON.stringify(updatedControls));
    addActivityLog(user, "UPDATE", `Assigned and evaluated ${newControls.length} controls for risk "${risk.title}"`, "success", "info");
  };

  const handleDeleteControl = (controlId) => {
    if (window.confirm("Are you sure you want to remove this control?")) {
      const updated = controls.filter(c => c.id !== controlId);
      setControls(updated);
      localStorage.setItem(`controls_${id}`, JSON.stringify(updated));
      addActivityLog(user, "DELETE", "Removed a control", "warning", "info");
    }
  };

  const handleSaveAction = (newAction) => {
    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    localStorage.setItem(`actions_${id}`, JSON.stringify(updatedActions));
    addActivityLog(user, "CREATE", `Created risk response action: ${newAction.title}`, "success", "critical");
  };

  const handleDeleteAction = (actionId) => {
    if (window.confirm("Are you sure you want to delete this action?")) {
      const updated = actions.filter(a => a.id !== actionId);
      setActions(updated);
      localStorage.setItem(`actions_${id}`, JSON.stringify(updated));
      addActivityLog(user, "DELETE", "Deleted an action", "warning", "info");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <p style={{ color: "#64748b", fontSize: "16px", fontWeight: 500 }}>Loading Risk Details...</p>
        </div>
      </Layout>
    );
  }

  if (!risk) {
    return (
      <Layout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Risk Not Found</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>The risk you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate("/risk-profile")} style={{ padding: "12px 24px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Return to Risk Register
          </button>
        </div>
      </Layout>
    );
  }

  const chartData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [{
      data: [5, 10, 15, 20],
      backgroundColor: ["#fca5a5", "#fdba74", "#fef08a", "#86efac"], // Applying pastel palette
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  return (
    <Layout>
      <div style={{ padding: "0 10px 40px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{risk.title}</h1>
              <span style={styles.badge(
                risk.level === "Critical" ? "#fca5a540" : risk.level === "High" ? "#fdba7440" : risk.level === "Medium" ? "#fef08a40" : "#86efac40",
                risk.level === "Critical" ? "#991b1b" : risk.level === "High" ? "#9a3412" : risk.level === "Medium" ? "#854d0e" : "#166534"
              )}>
                {risk.level || "MEDIUM"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Risk Status:</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ border: "none", background: "#f1f5f9", padding: "4px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#1e293b", cursor: "pointer", outline: "none" }}
                >
                  <option>Open</option>
                  <option>Mitigated</option>
                  <option>Closed</option>
                </select>
              </div>
              <span style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} /> Last updated: {risk.date || "Today"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button style={{ padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b" }}><Pin size={18} /></button>
            <button
              onClick={() => setEscalateModalOpen(true)}
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <AlertTriangle size={16} /> Escalate
            </button>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "6px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
                {risk.owner ? risk.owner.charAt(0).toUpperCase() : "A"}
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Primary Owner</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", margin: 0 }}>{risk.owner || "admin"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {[
            { label: "Impact", value: risk.impact || 0, icon: Target, color: "#3b82f6", bg: "#eff6ff", cardBg: "#f0f9ff" },
            { label: "Likelihood", value: risk.likelihood || 0, icon: Activity, color: "#8b5cf6", bg: "#f5f3ff", cardBg: "#f5f3ff" },
            { label: "Risk Score", value: risk.score || 0, icon: Zap, color: "#f59e0b", bg: "#fffbeb", cardBg: "#fffbeb" }
          ].map((m, i) => (
            <div key={i} style={{ 
              ...styles.card, 
              display: "flex", 
              alignItems: "center", 
              gap: "20px",
              background: m.cardBg,
              border: `1px solid ${m.color}20`
            }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fff", color: m.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <m.icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", margin: "0 0 4px" }}>{m.label}</p>
                <p style={{ fontSize: "28px", fontWeight: 500, color: "#0f172a", margin: 0 }}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div style={{ ...styles.card, marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#3b82f6" /> Executive Summary
            </h3>
            {!isEditingSummary && (
              <button
                onClick={() => {
                  setTempSummary(form.summary);
                  setIsEditingSummary(true);
                }}
                style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Edit3 size={14} /> Edit Summary
              </button>
            )}
          </div>

          {isEditingSummary ? (
            <div>
              <textarea
                placeholder="Write executive summary here..."
                value={tempSummary}
                onChange={(e) => setTempSummary(e.target.value)}
                style={{ ...styles.input, height: "120px", resize: "none", marginBottom: "16px" }}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setForm({ ...form, summary: tempSummary });
                    setIsEditingSummary(false);
                  }}
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingSummary(false)}
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ minHeight: "100px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "14px", padding: "20px" }}>
              {form.summary ? (
                <p style={{ margin: 0, width: "100%", color: "#334155", lineHeight: 1.6 }}>{form.summary}</p>
              ) : (
                <>
                  <FileText size={24} style={{ marginBottom: "8px", opacity: 0.5 }} />
                  No summary added yet. Click Edit to add one.
                </>
              )}
            </div>
          )}
        </div>

        {/* MATRIX */}
        <div style={{ ...styles.card, marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={18} color="#3b82f6" /> Risk Assessment Matrix
            </h3>
          </div>

          <div style={{ display: "flex", gap: "60px", alignItems: "center", justifyContent: "center", padding: "30px 10px", flexWrap: "wrap" }}>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Low", color: "#86efac" }, { label: "Medium", color: "#fef08a" },
                { label: "High", color: "#fdba74" }, { label: "Critical", color: "#fca5a5" }
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: l.color }} />
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Matrix with Labels */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Y-Axis Label: Impact */}
              <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Impact (1-5)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                  {matrixValues.map((row, rIdx) => row.map((val, cIdx) => {
                    const imp = 5 - rIdx;
                    const lik = cIdx + 1;
                    const isSelected = risk.impact === imp && risk.likelihood === lik;
                    return (
                      <div key={`${rIdx}-${cIdx}`}
                        style={{
                          width: "42px", height: "42px", borderRadius: "6px",
                          background: getMatrixColor(val), color: "#1e293b",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 500,
                          border: isSelected ? "2px solid #0f172a" : "none",
                          boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                          transform: isSelected ? "scale(1.15)" : "none",
                          position: "relative"
                        }}
                      >
                        {val}
                      </div>
                    );
                  }))}
                </div>
                {/* X-Axis Label: Likelihood */}
                <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>
                  Likelihood (1-5)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ marginBottom: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "24px", overflowX: "auto" }}>
          {["Details", "Controls", "Actions", "Comments", "Incidents", "Audits"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 2px", border: "none", background: "none", fontSize: "14px", fontWeight: 700,
                color: activeTab === tab ? "#3b82f6" : "#64748b", cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                whiteSpace: "nowrap"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Details" && (
          <div style={{ ...styles.card, marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Details</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Provide detailed information about the identified risk, including the event, root causes, and potential consequences.</p>
              </div>
              {!isEditingDetails && (
                <button
                  onClick={() => {
                    setTempForm({ ...form });
                    setIsEditingDetails(true);
                  }}
                  style={{ padding: "8px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#3b82f6", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Edit3 size={16} /> Edit Assessment
                </button>
              )}
            </div>

            {isEditingDetails ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
                  <div>
                    <label style={styles.label}><AlertTriangle size={14} color="#3b82f6" /> RISK EVENT</label>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Describe the risk event — what could happen and what are you concerned about.</p>
                    <textarea
                      placeholder="Describe the risk event..."
                      value={form.riskEvent}
                      onChange={(e) => setForm({ ...form, riskEvent: e.target.value })}
                      style={{ ...styles.input, height: "120px", resize: "none" }}
                    />
                  </div>
                  <div>
                    <label style={styles.label}><Zap size={14} color="#3b82f6" /> ROOT CAUSES</label>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Explain the root causes of the risk. Why could this event occur?</p>
                    <textarea
                      placeholder="Describe the root causes..."
                      value={form.rootCauses}
                      onChange={(e) => setForm({ ...form, rootCauses: e.target.value })}
                      style={{ ...styles.input, height: "120px", resize: "none" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={styles.label}><Target size={14} color="#3b82f6" /> POTENTIAL CONSEQUENCES</label>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Describe the potential impact if the risk occurs (financial, operational, reputational, etc.).</p>
                  <textarea
                    placeholder="Describe the consequences..."
                    value={form.consequences}
                    onChange={(e) => setForm({ ...form, consequences: e.target.value })}
                    style={{ ...styles.input, height: "100px", resize: "none" }}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{ ...styles.label, textTransform: "none" }}>Risk Appetite Statement</label>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Define the organization's willingness to accept this risk and how it should be managed.</p>
                  <textarea
                    placeholder="Example: The organization has a moderate appetite for this risk due to potential strategic benefits..."
                    value={form.appetite}
                    onChange={(e) => setForm({ ...form, appetite: e.target.value })}
                    style={{ ...styles.input, height: "80px", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <button
                    disabled={saveStatus === "saving"}
                    onClick={() => {
                      handleSave();
                      setIsEditingDetails(false);
                    }}
                    style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: saveStatus === "saving" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: saveStatus === "saving" ? 0.7 : 1 }}
                  >
                    {saveStatus === "saving" ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    {saveStatus === "saving" ? "Saving..." : "Save All Assessment Details"}
                  </button>
                  <button
                    disabled={saveStatus === "saving"}
                    onClick={() => {
                      setForm({ ...tempForm });
                      setIsEditingDetails(false);
                    }}
                    style={{ padding: "14px 24px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Discard Changes
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {saveStatus === "success" && (
                  <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#166534", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Shield size={16} /> Assessment details saved successfully!
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
                  <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <label style={{ ...styles.label, color: "#3b82f6" }}><AlertTriangle size={14} /> RISK EVENT</label>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {form.riskEvent || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No risk event described yet.</span>}
                    </p>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <label style={{ ...styles.label, color: "#3b82f6" }}><Zap size={14} /> ROOT CAUSES</label>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {form.rootCauses || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No root causes identified yet.</span>}
                    </p>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <label style={{ ...styles.label, color: "#3b82f6" }}><Target size={14} /> POTENTIAL CONSEQUENCES</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {form.consequences || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No consequences described yet.</span>}
                  </p>
                </div>

                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <label style={{ ...styles.label, textTransform: "none", color: "#3b82f6" }}>Risk Appetite Statement</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {form.appetite || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No appetite statement defined yet.</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Controls" && (
          <div style={{ ...styles.card, marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Assigned Controls</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Review and manage controls implemented to mitigate this risk.</p>
              </div>
              <button
                onClick={() => setShowControlModal(true)}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)" }}
              >
                <Plus size={18} /> Assign & Evaluate Controls
              </button>
            </div>

            {controls.length === 0 ? (
              <div style={{ padding: "60px 40px", textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
                <Shield size={48} color="#94a3b8" style={{ marginBottom: "16px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#475569", margin: "0 0 8px" }}>No Controls Assigned</h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 20px" }}>There are currently no internal controls linked to this risk. Start by assigning controls from the library.</p>
                <button
                  onClick={() => setShowControlModal(true)}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #3b82f6", background: "transparent", color: "#3b82f6", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Browse Controls Library
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {controls.map(c => (
                  <div key={c.id} style={{ padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                          <Shield size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 }}>{c.name}</h4>
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: c.type === "Preventive" ? "#10b981" : "#3b82f6", textTransform: "uppercase" }}>{c.type}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>•</span>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Owner: {c.owner}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{
                            padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                            background: c.effectiveness === "Effective" ? "#dcfce7" : c.effectiveness === "Partial" ? "#fef9c3" : "#fee2e2",
                            color: c.effectiveness === "Effective" ? "#166534" : c.effectiveness === "Partial" ? "#854d0e" : "#991b1b"
                          }}>
                            {c.effectiveness.toUpperCase()}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Frequency: {c.frequency}</div>
                        </div>
                        <button onClick={() => handleDeleteControl(c.id)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {c.notes && <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b", lineHeight: 1.5, fontStyle: "italic" }}>"{c.notes}"</p>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", paddingTop: "16px", borderTop: "1px solid #f8fafc" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Risk Impact</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{c.impact} Reduction</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Last Performed</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{c.lastPerformed || "Never"}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Evidence</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: c.evidence ? "#3b82f6" : "#cbd5e1", textDecoration: c.evidence ? "underline" : "none", cursor: c.evidence ? "pointer" : "default" }}>
                          {c.evidence ? "View Evidence" : "No file attached"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Actions" && (
          <div style={{ ...styles.card, marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Risk Response Actions</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Manage the execution and closure of actions triggered by risk breaches.</p>
              </div>
              <button
                onClick={() => setShowActionModal(true)}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#f59e0b", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.25)" }}
              >
                <Zap size={18} /> Configure New Action
              </button>
            </div>

            {actions.length === 0 ? (
              <div style={{ padding: "60px 40px", textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: "12px", background: "#fffbeb" }}>
                <Zap size={48} color="#f59e0b" style={{ marginBottom: "16px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#854d0e", margin: "0 0 8px" }}>No Response Actions Defined</h3>
                <p style={{ fontSize: "14px", color: "#92400e", margin: "0 0 20px" }}>Define how the system should respond when this risk or its KRIs breach defined thresholds.</p>
                <button
                  onClick={() => setShowActionModal(true)}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #f59e0b", background: "transparent", color: "#f59e0b", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Set Triggered Action
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {actions.map(action => (
                  <div key={action.id} style={{ padding: "24px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#fff", position: "relative", overflow: "hidden" }}>
                    {/* Status Indicator Bar */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: action.status === "Overdue" ? "#ef4444" : "#f59e0b" }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", border: "1px solid #fef3c7" }}>
                          <Zap size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>{action.title}</h4>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>{action.actionType}</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>•</span>
                            <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Zap size={12} /> Trigger: {action.triggerType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ 
                            fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "20px", 
                            background: action.status === "Overdue" ? "#fef2f2" : "#fffbeb", 
                            color: action.status === "Overdue" ? "#ef4444" : "#b45309"
                          }}>
                            {action.status.toUpperCase()}
                          </span>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                            <Clock size={12} /> Due: {new Date(action.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteAction(action.id)} style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#f8fafc", color: "#64748b", cursor: "pointer" }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>{action.description}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", paddingTop: "20px", borderTop: "1px solid #f8fafc" }}>
                      <div>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Owner</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#e2e8f0", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{action.owner.charAt(0)}</div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{action.owner}</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>SLA</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{action.sla}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Notification</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{action.notificationChannels[0]} (+{action.notificationChannels.length - 1})</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #3b82f6", background: "transparent", color: "#3b82f6", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Update Status</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Comments" && (
          <CommentSystem 
            riskId={id} 
            currentUser={user} 
            onConvertToAction={(comment) => {
              // Logic to open ActionModal with comment context
              setShowActionModal(true);
              // In a real app, we'd pass initialData to ActionModal
            }}
          />
        )}

        {activeTab === "Incidents" && (
          <div style={{ ...styles.card, padding: "80px 20px", textAlign: "center", marginBottom: "32px" }}>
            <AlertTriangle size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#64748b" }}>Related Incidents</h3>
            <p style={{ color: "#94a3b8" }}>No historical incidents mapped to this risk.</p>
          </div>
        )}

        {activeTab === "Audits" && (
          <div style={{ ...styles.card, padding: "80px 20px", textAlign: "center", marginBottom: "32px" }}>
            <History size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#64748b" }}>Audit History</h3>
            <p style={{ color: "#94a3b8" }}>No audit records found for this risk.</p>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <div style={styles.card}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Key Insights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: `Score: ${risk.score}`, bg: "#fef08a20", color: "#854d0e", icon: Shield },
                { label: `Level: ${risk.level}`, bg: risk.level === "Critical" ? "#fca5a520" : "#86efac20", color: risk.level === "Critical" ? "#991b1b" : "#166534", icon: Activity },
                { label: risk.impact >= 4 ? "High Impact" : "Stable Impact", bg: risk.impact >= 4 ? "#fdba7420" : "#f0f9ff", color: risk.impact >= 4 ? "#9a3412" : "#0c4a6e", icon: Target },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: "10px 14px", borderRadius: "8px", background: item.bg, color: item.color, display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
                  <item.icon size={14} /> {item.label}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Distribution</h3>
            <div style={{ height: "180px", display: "flex", justifyContent: "center" }}>
              <Doughnut data={chartData} options={{ plugins: { legend: { display: false } }, cutout: "70%" }} />
            </div>
          </div>
        </div>

        {/* KRI SECTION */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Key Risk Indicator</h2>
              <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{kris.length} KRI</span>
            </div>
            {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "moderator") && (
              <button
                onClick={() => {
                  setEditingKri(null);
                  setShowKriModal(true);
                }}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)" }}
              >
                <Plus size={18} /> Add KRI
              </button>
            )}
          </div>

          {kris.length === 0 ? (
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "60px 40px",
              textAlign: "center",
              border: "2px dashed #e2e8f0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <Activity size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>No KRI added yet</h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "moderator")
                    ? "Click 'Add KRI' to create your first indicator and start tracking performance."
                    : "There are currently no Key Risk Indicators defined for this profile."}
                </p>
              </div>
              {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "moderator") && (
                <button
                  onClick={() => setShowKriModal(true)}
                  style={{ marginTop: "8px", padding: "10px 20px", borderRadius: "10px", border: "1px solid #3b82f6", background: "transparent", color: "#3b82f6", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Plus size={18} /> Add First KRI
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
              {kris.map(kri => (
                <div key={kri.id} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                        {kri.owner.charAt(0)}
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>{kri.title}</span>
                    </div>

                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === kri.id ? null : kri.id)}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px", borderRadius: "50%", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenu === kri.id && (
                        <div ref={menuRef} style={styles.dropdown}>
                          <div
                            style={{ ...styles.dropdownItem, color: "#10b981" }}
                            onClick={() => handlePinKri(kri.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#ecfdf5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Pin size={16} color="#10b981" style={{ minWidth: "16px", flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", flex: 1 }}>{kri.isPinned ? "Unpin" : "Pin"}</span>
                          </div>

                          {(user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "moderator") && (
                            <>
                              <div
                                style={{ ...styles.dropdownItem, color: "#334155" }}
                                onClick={() => handleEditKri(kri)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f1f5f9";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <Edit size={16} color="#3b82f6" style={{ minWidth: "16px", flexShrink: 0 }} />
                                <span style={{ whiteSpace: "nowrap", flex: 1 }}>Edit</span>
                              </div>
                              <div
                                style={{ ...styles.dropdownItem, color: "#ef4444" }}
                                onClick={() => handleDeleteKri(kri.id)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#fef2f2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <Trash2 size={16} color="#ef4444" style={{ minWidth: "16px", flexShrink: 0 }} />
                                <span style={{ whiteSpace: "nowrap", flex: 1 }}>Delete</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ height: "240px", marginBottom: "24px", padding: "10px" }}>
                    {kri.type === "Line" && (
                      <Line
                        data={{
                          labels: kri.labels,
                          datasets: [{
                            label: kri.title,
                            data: kri.data,
                            borderColor: "#fca5a5",
                            backgroundColor: "rgba(252, 165, 165, 0.2)",
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: "#fff",
                            pointBorderColor: "#fca5a5",
                            pointBorderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
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
                            backgroundColor: "#fca5a5",
                            borderRadius: 4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                          }
                        }}
                      />
                    )}
                    {kri.type === "Pie" && (
                      <div style={{ height: "200px", display: "flex", justifyContent: "center" }}>
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
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>Latest Comment</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{kri.date}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>{kri.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <KRIModal
        isOpen={showKriModal}
        initialData={editingKri}
        onClose={() => {
          setShowKriModal(false);
          setEditingKri(null);
        }}
        onSave={handleSaveKri}
      />

      <ControlModal
        isOpen={showControlModal}
        onClose={() => setShowControlModal(false)}
        onSave={handleSaveControls}
        linkedRiskTitle={risk?.title}
      />

      <ActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onSave={handleSaveAction}
        linkedRiskTitle={risk?.title}
      />

      <EscalateModal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        onSubmit={handleEscalate}
        usersList={JSON.parse(localStorage.getItem("adminUsersList")) || []}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
}
