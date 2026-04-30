import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  AlertTriangle, Pin, User, ChevronDown, Save, X, 
  Target, Zap, Shield, FileText, Activity, MessageSquare, 
  History, PieChart, Info, Edit3, ArrowLeft, RefreshCw, Clock
} from "lucide-react";
import Layout from "./Layout";
import EscalateModal from "./EscalateModal";
import { addActivityLog } from "./logger";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ─── STYLES ─── */
const styles = {
  card: { background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  badge: (bg, color) => ({ background: bg, color, padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }),
  input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "14px", outline: "none", transition: "all 0.2s" },
  label: { fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" },
};

/* ─── MATRIX LOGIC ─── */
const getMatrixColor = (score) => {
  if (score >= 12) return "#ef4444"; // Critical/Red
  if (score >= 8)  return "#f97316"; // High/Orange
  if (score >= 4)  return "#eab308"; // Medium/Yellow
  return "#22c55e"; // Low/Green
};

const matrixValues = [
  [1, 2, 3, 4, 5],
  [2, 4, 6, 8, 10],
  [3, 6, 9, 12, 15],
  [4, 8, 12, 16, 20],
  [5, 10, 15, 20, 25]
];

export default function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Admin", role: "admin" });
  
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [tempSummary, setTempSummary] = useState("");
  
  // Form State
  const [form, setForm] = useState({
    summary: "",
    riskEvent: "",
    rootCauses: "",
    consequences: "",
    appetite: "",
    status: "Open"
  });

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (savedUser) setUser(savedUser);

      const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
      const found = allRisks.find(r => String(r.id) === String(id));
      
      if (found) {
        setRisk(found);
        setForm({
          summary: found.summary || "",
          riskEvent: found.riskEvent || "",
          rootCauses: found.rootCauses || "",
          consequences: found.consequences || "",
          appetite: found.appetite || "",
          status: found.status || "Open"
        });
      }
    } catch (err) {
      console.error("Error loading risk details:", err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [id]);

  const handleSave = () => {
    if (!risk) return;
    const allRisks = JSON.parse(localStorage.getItem("risks")) || [];
    const updated = allRisks.map(r => String(r.id) === String(id) ? { ...r, ...form } : r);
    localStorage.setItem("risks", JSON.stringify(updated));
    setRisk({ ...risk, ...form });
    addActivityLog(user, "UPDATE", `Updated details for risk "${risk.title}"`, "success", "info");
    alert("Changes saved successfully!");
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
      backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
      borderWidth: 0
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
              <span style={styles.badge(risk.level === "High" ? "#fee2e2" : "#fef3c7", risk.level === "High" ? "#dc2626" : "#d97706")}>
                {risk.level || "MEDIUM"}
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Risk Status:</span>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({...form, status: e.target.value})}
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
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
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
            { label: "Impact", value: risk.impact || 0, icon: Target, color: "#3b82f6", bg: "#eff6ff" },
            { label: "Likelihood", value: risk.likelihood || 0, icon: Activity, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Risk Score", value: risk.score || 0, icon: Zap, color: "#f59e0b", bg: "#fffbeb" }
          ].map((m, i) => (
            <div key={i} style={{ ...styles.card, display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>{m.label}</p>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{m.value}</p>
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
          
          <div style={{ display: "flex", gap: "40px", alignItems: "center", padding: "0 10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Low", color: "#22c55e" }, { label: "Medium", color: "#eab308" },
                { label: "High", color: "#f97316" }, { label: "Critical", color: "#ef4444" }
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: l.color }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{l.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {matrixValues.map((row, rIdx) => row.map((val, cIdx) => {
                const imp = 5 - rIdx;
                const lik = cIdx + 1;
                const isSelected = risk.impact === imp && risk.likelihood === lik;
                return (
                  <div key={`${rIdx}-${cIdx}`}
                    style={{ 
                      width: "42px", height: "42px", borderRadius: "6px", 
                      background: getMatrixColor(val), color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700,
                      border: isSelected ? "2px solid #000" : "none",
                      boxShadow: isSelected ? "0 0 8px rgba(0,0,0,0.2)" : "none",
                      transform: isSelected ? "scale(1.1)" : "none",
                    }}
                  >
                    {val}
                  </div>
                );
              }))}
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
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Details</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Provide detailed information about the identified risk, including the event, root causes, and potential consequences.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
              <div>
                <label style={styles.label}><AlertTriangle size={14} color="#3b82f6" /> RISK EVENT</label>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Describe the risk event — what could happen and what are you concerned about.</p>
                <textarea 
                  placeholder="Describe the risk event..."
                  value={form.riskEvent} 
                  onChange={(e) => setForm({...form, riskEvent: e.target.value})} 
                  style={{ ...styles.input, height: "120px", resize: "none" }} 
                />
              </div>
              <div>
                <label style={styles.label}><Zap size={14} color="#3b82f6" /> ROOT CAUSES</label>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Explain the root causes of the risk. Why could this event occur?</p>
                <textarea 
                  placeholder="Describe the root causes..."
                  value={form.rootCauses} 
                  onChange={(e) => setForm({...form, rootCauses: e.target.value})} 
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
                onChange={(e) => setForm({...form, consequences: e.target.value})} 
                style={{ ...styles.input, height: "100px", resize: "none" }} 
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ ...styles.label, textTransform: "none" }}>Risk Appetite Statement</label>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "-4px 0 12px" }}>Define the organization's willingness to accept this risk and how it should be managed.</p>
              <textarea 
                placeholder="Example: The organization has a moderate appetite for this risk due to potential strategic benefits..."
                value={form.appetite} 
                onChange={(e) => setForm({...form, appetite: e.target.value})} 
                style={{ ...styles.input, height: "80px", resize: "none" }} 
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={handleSave} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <Save size={18} /> Save All Assessment Details
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <div style={styles.card}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Key Insights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: `Score: ${risk.score}`, bg: "#f0fdf4", color: "#16a34a", icon: Shield },
                { label: `Level: ${risk.level}`, bg: "#fef2f2", color: "#991b1b", icon: Activity },
                { label: "High Impact", bg: "#fef2f2", color: "#991b1b", icon: Target },
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

      </div>

      <EscalateModal 
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        onSubmit={handleEscalate}
        usersList={JSON.parse(localStorage.getItem("adminUsersList")) || []}
      />
    </Layout>
  );
}
