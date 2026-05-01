import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, Search, Filter, Shield, User, Clock, MoreVertical, 
  ChevronRight, ArrowRight, CheckCircle2, XCircle, Info, Activity,
  MessageSquare, History, Zap, ExternalLink, Calendar, Trash2
} from "lucide-react";
import IncidentModal from "./IncidentModal";

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  title: { fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 },
  table: { width: "100%", background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" },
  th: { padding: "16px 20px", background: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 20px", color: "#334155", fontSize: "14px", borderBottom: "1px solid #f1f5f9" },
  badge: (bg, color) => ({ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: bg, color: color, textTransform: "uppercase" }),
  searchBar: { display: "flex", gap: "12px", marginBottom: "20px" },
  input: { padding: "10px 16px 10px 40px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", width: "300px", outline: "none" },
  detailView: { background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", animation: "fadeIn 0.3s ease-out" },
  detailHeader: { padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  tabBar: { display: "flex", gap: "24px", padding: "0 32px", borderBottom: "1px solid #f1f5f9", background: "#fff" },
  tab: (active) => ({ padding: "16px 4px", fontSize: "14px", fontWeight: 700, color: active ? "#3b82f6" : "#64748b", borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent", cursor: "pointer", background: "none", border: "none" }),
  card: { padding: "24px 32px" }
};

export default function IncidentSystem({ riskId, riskTitle, currentUser }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`incidents_${riskId}`);
    if (saved) setIncidents(JSON.parse(saved));
  }, [riskId]);

  const saveIncidents = (newIncidents) => {
    setIncidents(newIncidents);
    localStorage.setItem(`incidents_${riskId}`, JSON.stringify(newIncidents));
  };

  const handleLogIncident = (incidentData) => {
    saveIncidents([incidentData, ...incidents]);
  };

  const handleDeleteIncident = (id) => {
    if (window.confirm("Are you sure you want to delete this incident record?")) {
      saveIncidents(incidents.filter(inc => inc.id !== id));
      if (selectedIncident?.id === id) setSelectedIncident(null);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical": return { bg: "#fee2e2", color: "#b91c1c" };
      case "High": return { bg: "#ffedd5", color: "#9a3412" };
      case "Medium": return { bg: "#fef9c3", color: "#854d0e" };
      default: return { bg: "#f0fdf4", color: "#166534" };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Open": return { bg: "#eff6ff", color: "#1e40af" };
      case "Investigating": return { bg: "#faf5ff", color: "#6b21a8" };
      case "Resolved": return { bg: "#f0fdf4", color: "#166534" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedIncident) {
    return (
      <div style={styles.detailView}>
        <div style={styles.detailHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setSelectedIncident(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{selectedIncident.id}</span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedIncident.title}</h2>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={styles.badge(getSeverityStyle(selectedIncident.severity).bg, getSeverityStyle(selectedIncident.severity).color)}>{selectedIncident.severity}</span>
                <span style={styles.badge(getStatusStyle(selectedIncident.status).bg, getStatusStyle(selectedIncident.status).color)}>{selectedIncident.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ ...styles.badge("#f1f5f9", "#475569"), cursor: "pointer" }}>Export Report</button>
            <button style={{ ...styles.badge("#ef4444", "#fff"), cursor: "pointer" }}>Resolve Incident</button>
          </div>
        </div>

        <div style={styles.tabBar}>
          {["Overview", "Actions", "Comments", "Timeline"].map(t => (
            <button key={t} style={styles.tab(activeDetailTab === t)} onClick={() => setActiveDetailTab(t)}>{t}</button>
          ))}
        </div>

        <div style={styles.card}>
          {activeDetailTab === "Overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Description</h4>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "32px" }}>{selectedIncident.description}</p>
                
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Root Cause Findings</h4>
                <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9", marginBottom: "32px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Category: {selectedIncident.rootCauseCategory}</span>
                  <p style={{ fontSize: "14px", color: "#334155", margin: "8px 0 0" }}>{selectedIncident.rootCauseDesc || "Investigation pending..."}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Incident Lifecycle</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>Reported:</span><span style={{ fontSize: "13px", fontWeight: 600 }}>{new Date(selectedIncident.reportDate).toLocaleDateString()}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>Occurrence:</span><span style={{ fontSize: "13px", fontWeight: 600 }}>{selectedIncident.occurrenceDate}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>Owner:</span><span style={{ fontSize: "13px", fontWeight: 600 }}>{selectedIncident.owner}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>SLA Status:</span><span style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>{selectedIncident.slaStatus}</span></div>
                  </div>
                </div>
                <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#fef2f2" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Financial Impact</label>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#991b1b" }}>${selectedIncident.estimatedLoss || "0.00"}</div>
                  <span style={{ fontSize: "12px", color: "#b91c1c" }}>Estimated Loss</span>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === "Actions" && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Zap size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
              <p style={{ color: "#64748b" }}>No corrective actions linked to this incident yet.</p>
              <button style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Create Action Plan</button>
            </div>
          )}

          {activeDetailTab === "Timeline" && (
             <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { time: "Just now", event: "Incident created and assigned to " + selectedIncident.owner, icon: CheckCircle2, color: "#10b981" },
                  { time: "2 hours ago", event: "Initial impact assessment completed", icon: Activity, color: "#3b82f6" },
                  { time: "Yesterday", event: "Root cause investigation initiated", icon: Search, color: "#f59e0b" }
                ].map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: log.color + "15", color: log.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <log.icon size={16} />
                      </div>
                      {i < 2 && <div style={{ flex: 1, width: "2px", background: "#f1f5f9", margin: "4px 0" }} />}
                    </div>
                    <div style={{ paddingBottom: "20px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{log.event}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{log.time}</div>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Incident Management</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Log and track incidents linked to {riskTitle}.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}
        >
          <AlertTriangle size={18} /> Log New Incident
        </button>
      </div>

      <div style={styles.searchBar}>
        <div style={{ position: "relative" }}>
          <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            style={styles.input} 
            placeholder="Search incident ID, title..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={{ ...styles.badge("#fff", "#64748b"), border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      <div style={styles.table}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Incident ID</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>SLA Status</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "60px", textAlign: "center" }}>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Shield size={48} color="#cbd5e1" />
                      <span style={{ fontSize: "14px", color: "#94a3b8" }}>No incidents recorded for this risk profile.</span>
                   </div>
                </td>
              </tr>
            ) : (
              filteredIncidents.map(inc => (
                <tr key={inc.id} style={{ cursor: "pointer", transition: "background 0.2s" }} onClick={() => setSelectedIncident(inc)} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={styles.td}><span style={{ fontWeight: 700, color: "#3b82f6" }}>{inc.id}</span></td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{inc.title}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(inc.reportDate).toLocaleDateString()}</div>
                  </td>
                  <td style={styles.td}><span style={styles.badge(getSeverityStyle(inc.severity).bg, getSeverityStyle(inc.severity).color)}>{inc.severity}</span></td>
                  <td style={styles.td}><span style={styles.badge(getStatusStyle(inc.status).bg, getStatusStyle(inc.status).color)}>{inc.status}</span></td>
                  <td style={styles.td}>{inc.owner}</td>
                  <td style={styles.td}><span style={{ color: "#10b981", fontWeight: 700, fontSize: "12px" }}>{inc.slaStatus}</span></td>
                  <td style={styles.td}>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteIncident(inc.id); }} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer" }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <IncidentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleLogIncident}
        linkedRiskTitle={riskTitle}
      />
    </div>
  );
}
