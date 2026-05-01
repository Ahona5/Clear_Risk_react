import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Shield, User, Clock, FileText, Zap, Layout, HelpCircle, DollarSign, Target, Plus, CheckCircle2 } from "lucide-react";

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(8px)",
    padding: "40px",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "90vh",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
  },
  section: {
    marginBottom: "40px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "#fcfdfe",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "#fcfdfe",
    cursor: "pointer",
  },
  footer: {
    padding: "24px 32px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "#fff",
  },
  primaryBtn: {
    padding: "12px 32px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444", // High visibility for incident logging
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 32px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }
};

export default function IncidentModal({ isOpen, onClose, onSave, linkedRiskTitle }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Operational",
    occurrenceDate: new Date().toISOString().split('T')[0],
    reportedBy: "",
    severity: "Medium",
    impactType: "Operational",
    impactLevel: "Medium",
    estimatedLoss: "",
    affectedArea: "",
    rootCauseCategory: "Process",
    rootCauseDesc: "",
    containmentActions: "",
    owner: "",
    responseSla: "4h",
    resolutionSla: "48h",
    status: "Open"
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSave = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Required";
    if (!formData.description) newErrors.description = "Required";
    if (!formData.owner) newErrors.owner = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      reportDate: new Date().toISOString(),
      slaStatus: "On Time"
    });
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Log System Incident</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Incident will be linked to: <span style={{ fontWeight: 600 }}>{linkedRiskTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={styles.scrollArea}>
          {/* A. BASIC INFO */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Layout size={18} color="#3b82f6" />
              <span style={styles.sectionTitle}>A. Basic Information</span>
            </div>
            <div style={{ ...styles.field, marginBottom: "20px" }}>
              <label style={styles.label}>Incident Title (Required)</label>
              <input 
                style={{ ...styles.input, borderColor: errors.title ? "#ef4444" : "#e2e8f0" }}
                placeholder="Brief summary of the incident..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Incident Type</label>
                <select style={styles.select} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Security</option>
                  <option>Operational</option>
                  <option>Financial</option>
                  <option>Compliance</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Severity</label>
                <select style={styles.select} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Occurrence Date</label>
                <input type="date" style={styles.input} value={formData.occurrenceDate} onChange={e => setFormData({...formData, occurrenceDate: e.target.value})} />
              </div>
            </div>
            <div style={{ ...styles.field, marginTop: "20px" }}>
              <label style={styles.label}>Incident Description (Required)</label>
              <textarea 
                style={{ ...styles.input, height: "80px", resize: "none", paddingLeft: "14px", borderColor: errors.description ? "#ef4444" : "#e2e8f0" }}
                placeholder="Detailed description of what happened..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* C. IMPACT ASSESSMENT */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Target size={18} color="#f59e0b" />
              <span style={styles.sectionTitle}>C. Impact Assessment</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Impact Type</label>
                <select style={styles.select} value={formData.impactType} onChange={e => setFormData({...formData, impactType: e.target.value})}>
                  <option>Financial</option>
                  <option>Operational</option>
                  <option>Reputational</option>
                  <option>Regulatory</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Impact Level</label>
                <select style={styles.select} value={formData.impactLevel} onChange={e => setFormData({...formData, impactLevel: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Estimated Loss ($)</label>
                <input type="number" style={styles.input} placeholder="e.g. 5000" value={formData.estimatedLoss} onChange={e => setFormData({...formData, estimatedLoss: e.target.value})} />
              </div>
            </div>
          </div>

          {/* D. ROOT CAUSE */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <HelpCircle size={18} color="#8b5cf6" />
              <span style={styles.sectionTitle}>D. Root Cause Analysis</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Root Cause Category</label>
                <select style={styles.select} value={formData.rootCauseCategory} onChange={e => setFormData({...formData, rootCauseCategory: e.target.value})}>
                  <option>Human</option>
                  <option>Process</option>
                  <option>System</option>
                  <option>External</option>
                </select>
              </div>
              <div style={{ ...styles.field, gridColumn: "span 2" }}>
                <label style={styles.label}>Root Cause Description</label>
                <input style={styles.input} placeholder="Initial root cause findings..." value={formData.rootCauseDesc} onChange={e => setFormData({...formData, rootCauseDesc: e.target.value})} />
              </div>
            </div>
          </div>

          {/* F. OWNERSHIP & SLA */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={18} color="#10b981" />
              <span style={styles.sectionTitle}>F. Ownership & SLA</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Incident Owner (Required)</label>
                <input 
                  style={{ ...styles.input, borderColor: errors.owner ? "#ef4444" : "#e2e8f0" }}
                  placeholder="Assign responsible person..."
                  value={formData.owner}
                  onChange={e => setFormData({...formData, owner: e.target.value})}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Response SLA</label>
                <select style={styles.select} value={formData.responseSla} onChange={e => setFormData({...formData, responseSla: e.target.value})}>
                  <option>1h</option>
                  <option>4h</option>
                  <option>12h</option>
                  <option>24h</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Resolution SLA</label>
                <select style={styles.select} value={formData.resolutionSla} onChange={e => setFormData({...formData, resolutionSla: e.target.value})}>
                  <option>24h</option>
                  <option>48h</option>
                  <option>72h</option>
                  <option>1 Week</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={styles.primaryBtn} onClick={handleSave}>Log Incident & Start Investigation</button>
        </div>
      </div>
    </div>
  );
}
