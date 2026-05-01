import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, Search, Filter, Shield, User, Clock, MoreVertical, 
  ChevronRight, ArrowRight, CheckCircle2, XCircle, Info, Activity,
  MessageSquare, History, Zap, ExternalLink, Calendar, Trash2,
  FileText, AlertTriangle, CheckSquare, List
} from "lucide-react";
import AuditModal from "./AuditModal";

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
  card: { padding: "24px 32px" },
  testRow: { padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "16px", background: "#fff" }
};

export default function AuditSystem({ riskId, riskTitle, currentUser, linkedControls }) {
  const [audits, setAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`audits_${riskId}`);
    if (saved) setAudits(JSON.parse(saved));
  }, [riskId]);

  const saveAudits = (newAudits) => {
    setAudits(newAudits);
    localStorage.setItem(`audits_${riskId}`, JSON.stringify(newAudits));
  };

  const handleCreateAudit = (auditData) => {
    saveAudits([auditData, ...audits]);
  };

  const handleDeleteAudit = (id) => {
    if (window.confirm("Are you sure you want to delete this audit record?")) {
      saveAudits(audits.filter(a => a.id !== id));
      if (selectedAudit?.id === id) setSelectedAudit(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Planned": return { bg: "#f1f5f9", color: "#475569" };
      case "In Progress": return { bg: "#eff6ff", color: "#1e40af" };
      case "Completed": return { bg: "#f0fdf4", color: "#166534" };
      case "Closed": return { bg: "#f8fafc", color: "#94a3b8" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const filteredAudits = audits.filter(aud => 
    aud.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aud.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedAudit) {
    return (
      <div style={styles.detailView}>
        <div style={styles.detailHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setSelectedAudit(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{selectedAudit.id}</span>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedAudit.name}</h2>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={styles.badge(getStatusStyle(selectedAudit.status).bg, getStatusStyle(selectedAudit.status).color)}>{selectedAudit.status}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Auditor: <span style={{ fontWeight: 600 }}>{selectedAudit.auditor}</span></span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ ...styles.badge("#f1f5f9", "#475569"), cursor: "pointer" }}>Generate Audit Report</button>
            {selectedAudit.status !== "Closed" && (
              <button style={{ ...styles.badge("#3b82f6", "#fff"), cursor: "pointer" }}>Complete Audit</button>
            )}
          </div>
        </div>

        <div style={styles.tabBar}>
          {["Overview", "Control Testing", "Findings", "Timeline"].map(t => (
            <button key={t} style={styles.tab(activeDetailTab === t)} onClick={() => setActiveDetailTab(t)}>{t}</button>
          ))}
        </div>

        <div style={styles.card}>
          {activeDetailTab === "Overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Engagement Objectives</h4>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "32px" }}>{selectedAudit.objectives || "No objectives defined."}</p>
                
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Engagement Scope</h4>
                <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9", marginBottom: "32px" }}>
                  <p style={{ fontSize: "14px", color: "#334155", margin: 0 }}>{selectedAudit.scope}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Key Milestones</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>Start Date:</span><span style={{ fontSize: "13px", fontWeight: 600 }}>{selectedAudit.startDate}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>End Date:</span><span style={{ fontSize: "13px", fontWeight: 600 }}>{selectedAudit.endDate}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "#64748b" }}>Status:</span><span style={{ fontSize: "13px", fontWeight: 700, color: "#3b82f6" }}>{selectedAudit.status}</span></div>
                  </div>
                </div>
                <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f0f9ff" }}>
                   <label style={{ fontSize: "11px", fontWeight: 700, color: "#0c4a6e", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Test Execution</label>
                   <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#0c4a6e" }}>{selectedAudit.testResults.length}</div>
                      <span style={{ fontSize: "12px", color: "#0c4a6e" }}>Controls in Scope</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === "Control Testing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
               {selectedAudit.testResults.map((test, idx) => (
                 <div key={idx} style={styles.testRow}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Shield size={20} color="#3b82f6" />
                          <h5 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 }}>{test.controlName}</h5>
                       </div>
                       <div style={{ display: "flex", gap: "12px" }}>
                          <select style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", border: "1px solid #e2e8f0" }}>
                             <option>Pending</option>
                             <option>Pass</option>
                             <option>Fail</option>
                             <option>Partial</option>
                          </select>
                          <select style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", border: "1px solid #e2e8f0" }}>
                             <option>Effective</option>
                             <option>Needs Improvement</option>
                             <option>Ineffective</option>
                          </select>
                       </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                       <div>
                          <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "6px" }}>Test Procedure Notes</label>
                          <textarea style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "13px", height: "60px", resize: "none" }} placeholder="Describe testing steps performed..." />
                       </div>
                       <div>
                          <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "6px" }}>Evidence / Documentation</label>
                          <div style={{ padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}>
                             <Plus size={16} color="#94a3b8" />
                             <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>Attach evidence</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeDetailTab === "Findings" && (
            <div style={{ textAlign: "center", padding: "60px" }}>
               <AlertTriangle size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
               <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#64748b", margin: "0 0 8px" }}>No findings recorded</h3>
               <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>Generate findings for any controls that failed testing or showed operational gaps.</p>
               <button style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Record Audit Finding</button>
            </div>
          )}

          {activeDetailTab === "Timeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
               {[
                 { time: "Today", event: "Audit engagement finalized and assigned to " + selectedAudit.auditor, icon: ClipboardCheck, color: "#3b82f6" },
                 { time: "Yesterday", event: "Control testing methodology updated", icon: List, color: "#f59e0b" },
                 { time: "2 days ago", event: "Audit scope confirmed and risks linked", icon: Shield, color: "#10b981" }
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
          <h2 style={styles.title}>Audit & Governance</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Review and execute audit engagements for {riskTitle}.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)" }}
        >
          <ClipboardCheck size={18} /> Plan New Audit
        </button>
      </div>

      <div style={styles.searchBar}>
        <div style={{ position: "relative" }}>
          <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            style={styles.input} 
            placeholder="Search audit ID, name..." 
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
              <th style={styles.th}>Audit ID</th>
              <th style={styles.th}>Engagement Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Lead Auditor</th>
              <th style={styles.th}>Timeline</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "60px", textAlign: "center" }}>
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <CheckSquare size={48} color="#cbd5e1" />
                      <span style={{ fontSize: "14px", color: "#94a3b8" }}>No audit engagements planned for this risk profile.</span>
                   </div>
                </td>
              </tr>
            ) : (
              filteredAudits.map(aud => (
                <tr key={aud.id} style={{ cursor: "pointer", transition: "background 0.2s" }} onClick={() => setSelectedAudit(aud)} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={styles.td}><span style={{ fontWeight: 700, color: "#3b82f6" }}>{aud.id}</span></td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{aud.name}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{aud.scope.substring(0, 30)}...</div>
                  </td>
                  <td style={styles.td}><span style={styles.badge("#f1f5f9", "#64748b")}>{aud.type}</span></td>
                  <td style={styles.td}><span style={styles.badge(getStatusStyle(aud.status).bg, getStatusStyle(aud.status).color)}>{aud.status}</span></td>
                  <td style={styles.td}>{aud.auditor}</td>
                  <td style={styles.td}><span style={{ fontSize: "12px", color: "#64748b" }}>{aud.startDate} to {aud.endDate}</span></td>
                  <td style={styles.td}>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAudit(aud.id); }} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer" }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AuditModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleCreateAudit}
        linkedRiskTitle={riskTitle}
        linkedControls={linkedControls}
      />
    </div>
  );
}
