import { useEffect, useState } from "react";
import { addActivityLog } from "./logger";
import EscalateModal from "./EscalateModal";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";
import "./styles/profile.css";

import {
  LayoutDashboard,
  Folder,
  AlertCircle,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Trash2,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  ArrowUpRight,
  ChevronUp
} from "lucide-react";
import Layout from "./Layout";

/* 🔥 CHART IMPORTS */
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const KpiCardModern = ({ title, value, bgColor, iconColor, trend, subtext }) => {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: bgColor || "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "135px",
      color: "#1e293b",
      border: `1px solid ${iconColor}20` // Subtle tinted border
    }}>
      {/* Decorative Half-Circle Lines */}
      <div style={{
        position: "absolute",
        bottom: "-30px",
        right: "-30px",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        border: `2px solid ${iconColor}20`,
        background: "transparent",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-50px",
        right: "-50px",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        border: `2px solid ${iconColor}15`,
        background: "transparent",
        pointerEvents: "none"
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#475569" }}>{title}</h3>
      </div>
      
      <div style={{ fontSize: "32px", fontWeight: "700", margin: "10px 0 6px 0", lineHeight: "1", position: "relative", zIndex: 1 }}>
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", position: "relative", zIndex: 1 }}>
        {trend && (
          <div style={{
            display: "flex", alignItems: "center", gap: "2px",
            padding: "2px 6px", borderRadius: "6px",
            border: "1px solid #bbf7d0",
            background: "rgba(34, 197, 94, 0.05)",
            color: "#16a34a"
          }}>
            <span style={{ fontWeight: "600" }}>{trend}</span>
            <ChevronUp size={12} strokeWidth={3} />
          </div>
        )}
        <span style={{ color: "#64748b" }}>
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState("");
  const [risks, setRisks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState(1);
  const [likelihood, setLikelihood] = useState(1);
  
  const [modalOwner, setModalOwner] = useState("");
  const [modalSummary, setModalSummary] = useState("");
  const [modalRiskLevel, setModalRiskLevel] = useState("Low");
  const [modalControlEff, setModalControlEff] = useState("Effective");

  const [collapsed, setCollapsed] = useState(false);
  const [draggedRisk, setDraggedRisk] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [open, setOpen] = useState(false);

  // Filter States
  const [controlFilter, setControlFilter] = useState("All Controls");
  const [escalatedOnly, setEscalatedOnly] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser")) || { username: "Admin", role: "admin" };
  const adminUsers = JSON.parse(localStorage.getItem("adminUsersList")) || [
    { id: 1, name: "Admin User", role: "moderator" },
    { id: 2, name: "John Doe", role: "subscriber" }
  ];

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [riskToEscalate, setRiskToEscalate] = useState(null);

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(n);
  }, [risks]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const selected = localStorage.getItem("selectedProfile") || "Default";
    setProfileName(selected);

    let all = JSON.parse(localStorage.getItem("risks"));
    
    if (!all || all.length === 0) {
      all = [
        { id: "1", title: "Gross", impact: 4, likelihood: 3, score: 12, level: "Medium", profile: selected, date: new Date().toLocaleDateString(), controlEffectiveness: "Effective" },
        { id: "2", title: "Net", impact: 2, likelihood: 2, score: 4, level: "Low", profile: selected, date: new Date().toLocaleDateString(), controlEffectiveness: "Effective" },
        { id: "3", title: "Target", impact: 1, likelihood: 1, score: 1, level: "Low", profile: selected, date: new Date().toLocaleDateString(), controlEffectiveness: "Effective" }
      ];
      localStorage.setItem("risks", JSON.stringify(all));
    }
    
    setRisks(all.filter((r) => r.profile === selected));
  }, [profileName]);

  const filteredTableRisks = risks.filter((r) => {
    if (escalatedOnly && !r.isEscalated) return false;
    if (controlFilter !== "All Controls") {
      if (r.controlEffectiveness !== controlFilter) return false;
    }
    return true;
  });

  const handleEscalateClick = (id) => {
    setRiskToEscalate(id);
    setEscalateModalOpen(true);
  };

  const performEscalation = (data) => {
    const id = riskToEscalate;
    const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
    const targetRisk = allRisks.find(r => r.id === id);
    if (!targetRisk) return;

    // Perform side-effects outside of setState to prevent React StrictMode double-execution
    const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
    notifs.unshift({
      id: Date.now(),
      message: `Risk "${targetRisk.title}" escalated to ${data.taggedUser} by ${user.username}`,
      time: new Date().toLocaleTimeString(),
      read: false
    });
    localStorage.setItem("notifications", JSON.stringify(notifs));
    
    addActivityLog(user, "ESCALATE", `Escalated risk "${targetRisk.title}" to ${data.taggedUser} (${data.priority} Priority)`, "success", "critical");

    const newAllRisks = allRisks.map(r => r.id === id ? { ...r, isEscalated: true, escalatedTo: data.taggedUser } : r);
    localStorage.setItem("risks", JSON.stringify(newAllRisks));

    setRisks(prev => prev.map(r => r.id === id ? { ...r, isEscalated: true, escalatedTo: data.taggedUser } : r));
  };

  const removeEscalation = (id) => {
    if (!window.confirm("Are you sure you want to remove the escalation status for this risk?")) return;
    
    const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
    const targetRisk = allRisks.find(r => r.id === id);
    if (!targetRisk) return;

    addActivityLog(user, "UPDATE", `Removed escalation for risk "${targetRisk.title}"`, "success", "info");

    const newAllRisks = allRisks.map(r => r.id === id ? { ...r, isEscalated: false, escalatedTo: null } : r);
    localStorage.setItem("risks", JSON.stringify(newAllRisks));

    setRisks(prev => prev.map(r => r.id === id ? { ...r, isEscalated: false, escalatedTo: null } : r));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const deleteRisk = (id) => {
    if (!window.confirm("Delete this risk?")) return;
    const all = JSON.parse(localStorage.getItem("risks")) || [];
    const riskToDelete = all.find(r => r.id === id);
    const newAll = all.filter(r => r.id !== id);
    localStorage.setItem("risks", JSON.stringify(newAll));
    setRisks(newAll.filter((r) => r.profile === profileName));
    if (riskToDelete) addActivityLog(user, "DELETE", `Deleted risk "${riskToDelete.title}"`, "success", "warning");
  };

  const getLevel = (score) => {
    if (score >= 16) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  };

  const total = risks.length;
  const high = risks.filter((r) => r.level === "High").length;
  const medium = risks.filter((r) => r.level === "Medium").length;
  const low = risks.filter((r) => r.level === "Low").length;

  const pieData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [high, medium, low],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
    },
    cutout: "60%",
  };

  const impacts = [5, 4, 3, 2, 1];
  const likelihoods = [1, 2, 3, 4, 5];

  const getCellColorClass = (score) => {
    if (score >= 16) return "heat-critical";
    if (score >= 10) return "heat-medium-orange";
    if (score >= 5) return "heat-medium-yellow";
    return "heat-low";
  };

  const getMarkerSpecificClass = (title) => {
    const char = title.charAt(0).toUpperCase();
    if (char === 'G') return "marker-g";
    if (char === 'N') return "marker-n";
    if (char === 'T') return "marker-t";
    return "";
  };

  const onDragStart = (e, riskId) => {
    setDraggedRisk(riskId);
    e.dataTransfer.setData("text/plain", riskId.toString());
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, targetImpact, targetLikelihood) => {
    e.preventDefault();
    const riskId = e.dataTransfer.getData("text/plain");
    if (!riskId) return;

    if (riskId.startsWith("NEW-")) {
      const letter = riskId.split("-")[1];
      const newTitle = letter === 'G' ? "Gross" : letter === 'N' ? "Net" : "Target";
      const score = targetImpact * targetLikelihood;
      const newRisk = {
        id: Date.now(),
        title: newTitle,
        impact: targetImpact,
        likelihood: targetLikelihood,
        score,
        level: getLevel(score),
        profile: profileName,
        owner: user.username,
        isEscalated: false,
        date: new Date().toLocaleDateString(),
        controlEffectiveness: "Effective"
      };

      const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
      allRisks.push(newRisk);
      localStorage.setItem("risks", JSON.stringify(allRisks));
      setRisks(prev => [...prev, newRisk]);
    } else {
      setRisks((prev) => {
        const updated = prev.map((r) => {
          if (r.id.toString() === riskId) {
            const score = targetImpact * targetLikelihood;
            return { ...r, impact: targetImpact, likelihood: targetLikelihood, score, level: getLevel(score) };
          }
          return r;
        });
        const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
        const newAllRisks = allRisks.map(r => {
          const match = updated.find(u => u.id.toString() === r.id.toString());
          return match ? match : r;
        });
        localStorage.setItem("risks", JSON.stringify(newAllRisks));
        return updated;
      });
    }
    setDraggedRisk(null);
  };

  const saveRisk = () => {
    if (!title) return alert("Enter title");
    const score = impact * likelihood;
    const newRisk = {
      id: Date.now(),
      title,
      impact,
      likelihood,
      score,
      level: getLevel(score),
      profile: profileName,
      owner: user.username,
      isEscalated: false,
      date: new Date().toLocaleDateString(),
      controlEffectiveness: modalControlEff
    };
    const all = JSON.parse(localStorage.getItem("risks")) || [];
    all.push(newRisk);
    localStorage.setItem("risks", JSON.stringify(all));
    setRisks(all.filter((r) => r.profile === profileName));
    setShowModal(false);
    setTitle("");
    setImpact(1);
    setLikelihood(1);
    addActivityLog(user, "CREATE", `Created risk "${title}"`, "success", "info");
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
          <div className="dashboard-header">
            <h1>Risk Profile: {profileName}</h1>
            <button className="pill-btn" onClick={() => setShowModal(true)}>+ Add Risk</button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}>
            <KpiCardModern title="Total Risks" value={total} bgColor="#e0f2fe" iconColor="#0284c7" trend="5" subtext="Increased from last month" />
            <KpiCardModern title="High Risk" value={high} bgColor="#fee2e2" iconColor="#dc2626" trend="2" subtext="Increased from last month" />
            <KpiCardModern title="Medium Risk" value={medium} bgColor="#fef3c7" iconColor="#d97706" trend="1" subtext="Increased from last month" />
            <KpiCardModern title="Low Risk" value={low} bgColor="#dcfce3" iconColor="#16a34a" subtext={<span style={{ color: "#16a34a", fontWeight: "500" }}>Under control</span>} />
          </div>

          <div className="analytics-container">
            <div className="heatmap-section-wrapper">
              <div className="heatmap-box">
                <h3>Risk Heatmap</h3>
                <div className="heatmap-legend-top">
                  {['G', 'N', 'T'].map(id => (
                    <div key={id} className="legend-item-pill">
                      <div className={`legend-badge marker-${id.toLowerCase()}`} draggable onDragStart={(e) => onDragStart(e, `NEW-${id}`)}>{id}</div>
                      <span className="legend-text-label">{id === 'G' ? 'Gross' : id === 'N' ? 'Net' : 'Target'} Risk</span>
                    </div>
                  ))}
                </div>

                <div className="heatmap-layout-main">
                  <div className="heatmap-grid-wrapper">
                    <div className="y-axis-label">Impact</div>
                    <div className="heatmap-grid" onDragOver={onDragOver}>
                      {impacts.map(imp => likelihoods.map(lik => {
                        const score = imp * lik;
                        const cellRisks = risks.filter(r => r.impact === imp && r.likelihood === lik)
                          .sort((a, b) => b.score - a.score)
                          .map((r, i) => ({ ...r, rank: i + 1 }));

                        return (
                          <div key={`${imp}-${lik}`} className={`heat-cell ${getCellColorClass(score)}`} onDrop={(e) => onDrop(e, imp, lik)}>
                            <span className="cell-number">{score}</span>
                            <div className="marker-stack">
                              {cellRisks.slice(0, 3).map(r => (
                                <div key={r.id} className={`risk-marker ${getMarkerSpecificClass(r.title)}`} draggable onDragStart={(e) => onDragStart(e, r.id)}>
                                  {r.title.charAt(0).toUpperCase()}
                                  <div className="rank-badge">{r.rank}</div>
                                  <div className="risk-tooltip">
                                    <strong>{r.title}</strong><br/>Score: {r.score}<br/>Impact: {r.impact} | Likelihood: {r.likelihood}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                    <div className="x-axis-label">Likelihood</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-bottom-grid">
              <div className="chart-box">
                <h3>Risk Distribution</h3>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut data={pieData} options={pieOptions} />
                </div>
              </div>

              <div className="heatmap-ranking-panel">
                <h3>Top Risks (Ranked)</h3>
                <div className="ranking-list">
                  {[...risks].sort((a,b) => b.score - a.score).map((r, i) => (
                    <div key={r.id} className="ranking-card">
                      <div className="rank-main-info">
                        <span className="rank-idx">#{i+1}</span>
                        <span className={`legend-badge marker-${r.title.charAt(0).toLowerCase()}`}>{r.title.charAt(0).toUpperCase()}</span>
                        <span className="rank-card-name">{r.title}</span>
                      </div>
                      <span className="rank-card-score">Score: {r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="table-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Risk Register</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select value={controlFilter} onChange={(e) => setControlFilter(e.target.value)}>
                  <option value="All Controls">All Controls</option>
                  <option value="Effective">Effective</option>
                  <option value="Weak">Weak</option>
                  <option value="None">None</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <input type="checkbox" checked={escalatedOnly} onChange={(e) => setEscalatedOnly(e.target.checked)} /> Escalated Only
                </label>
              </div>
            </div>

            <table className="risk-table">
              <thead>
                <tr><th>ID</th><th>Risk Title</th><th>Owner</th><th>Impact</th><th>Likelihood</th><th>Score</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredTableRisks.map((r, i) => (
                  <tr key={r.id}>
                    <td>RISK-{i+1}</td>
                    <td>{r.title} {r.isEscalated && <span className="escalated-tag">ESCALATED</span>}</td>
                    <td>{r.owner || "Unassigned"}</td>
                    <td>{r.impact}</td>
                    <td>{r.likelihood}</td>
                    <td>{r.score}</td>
                    <td><span className={`badge-level level-${r.level?.toLowerCase()}`}>{r.level}</span></td>
                    <td>{r.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {r.isEscalated ? (
                          <button onClick={() => removeEscalation(r.id)} style={{ fontSize:"12px", fontWeight:600, color:"#64748b", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:"6px", padding:"5px 10px", cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}>
                            Remove Escalation
                          </button>
                        ) : (
                          <button onClick={() => handleEscalateClick(r.id)} style={{ fontSize:"12px", fontWeight:600, color:"#d97706", background:"#fef3c7", border:"1px solid #fde68a", borderRadius:"6px", padding:"5px 10px", cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"4px", transition:"all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fde68a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef3c7"; }}>
                            <AlertTriangle size={14} /> Escalate
                          </button>
                        )}
                        <Trash2 size={18} style={{ color: '#ef4444', cursor: 'pointer', transition:"opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"} onClick={() => deleteRisk(r.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add Risk</h2>
            <div className="form-group">
              <input placeholder="Risk Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input placeholder="Owner" value={modalOwner} onChange={(e) => setModalOwner(e.target.value)} />
              <textarea placeholder="Summary" value={modalSummary} onChange={(e) => setModalSummary(e.target.value)} />
              <select value={impact} onChange={(e) => setImpact(+e.target.value)}>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>Impact {v}</option>)}
              </select>
              <select value={likelihood} onChange={(e) => setLikelihood(+e.target.value)}>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>Likelihood {v}</option>)}
              </select>
              <select value={modalControlEff} onChange={(e) => setModalControlEff(e.target.value)}>
                <option value="Effective">Effective</option><option value="Weak">Weak</option><option value="None">None</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveRisk}>Save</button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <EscalateModal 
        isOpen={escalateModalOpen} 
        onClose={() => setEscalateModalOpen(false)} 
        onSubmit={performEscalation} 
        usersList={adminUsers}
      />
    </Layout>
  );
}