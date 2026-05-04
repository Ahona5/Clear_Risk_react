import React, { useState, useEffect } from "react";
import { X, ClipboardCheck, User, Calendar, Target, Shield, Layout, FileText, Plus, HelpCircle } from "lucide-react";

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10002,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
    padding: "40px",
  },
  modalContent: {
    background: "var(--bg-modal)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "90vh",
    boxShadow: "var(--shadow-lg)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid var(--border-primary)",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--bg-modal)",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
    background: "var(--bg-modal)",
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
    borderBottom: "1px solid var(--border-primary)",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text-primary)",
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
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    fontSize: "14px",
    outline: "none",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    fontSize: "14px",
    outline: "none",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  footer: {
    padding: "24px 32px",
    borderTop: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "var(--bg-modal)",
  },
  primaryBtn: {
    padding: "12px 32px",
    borderRadius: "8px",
    border: "none",
    background: "var(--accent-primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 32px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    background: "var(--bg-app)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }
};

export default function AuditModal({ isOpen, onClose, onSave, linkedRiskTitle, linkedControls }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Internal",
    description: "",
    scope: `Audit of controls linked to ${linkedRiskTitle}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    auditor: "",
    objectives: "",
    procedures: "",
    status: "Planned",
    findings: { open: 0, closed: 0 },
    testResults: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Initialize test results for linked controls
      const initialTests = linkedControls.map(c => ({
        controlId: c.id,
        controlName: c.name,
        result: "Pending",
        effectiveness: "Pending",
        notes: "",
        evidence: ""
      }));
      setFormData(prev => ({ ...prev, testResults: initialTests }));
    }
  }, [isOpen, linkedControls]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.auditor) newErrors.auditor = "Required";
    if (!formData.endDate) newErrors.endDate = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ClipboardCheck size={24} color="#3b82f6" />
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Plan New Audit Engagement</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Linked Risk: <span style={{ fontWeight: 600 }}>{linkedRiskTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={styles.scrollArea}>
          {/* A. BASIC INFO */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Layout size={18} color="#3b82f6" />
              <span style={styles.sectionTitle}>A. Audit Planning & Scope</span>
            </div>
            <div style={{ ...styles.field, marginBottom: "20px" }}>
              <label style={styles.label}>Audit Engagement Name (Required)</label>
              <input 
                style={{ ...styles.input, borderColor: errors.name ? "#ef4444" : "#e2e8f0" }}
                placeholder="e.g. Q3 Financial Controls Operational Audit"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Audit Type</label>
                <select style={styles.select} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Internal</option>
                  <option>External</option>
                  <option>Compliance</option>
                  <option>Regulatory</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Lead Auditor (Required)</label>
                <input 
                  style={{ ...styles.input, borderColor: errors.auditor ? "#ef4444" : "#e2e8f0" }}
                  placeholder="Assign lead auditor..."
                  value={formData.auditor}
                  onChange={e => setFormData({...formData, auditor: e.target.value})}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Start Date</label>
                <input type="date" style={styles.input} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Estimated End Date (Required)</label>
                <input 
                  type="date" 
                  style={{ ...styles.input, borderColor: errors.endDate ? "#ef4444" : "#e2e8f0" }}
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
              <div style={{ ...styles.field, gridColumn: "span 2" }}>
                <label style={styles.label}>Engagement Scope</label>
                <input style={styles.input} value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} />
              </div>
            </div>
          </div>

          {/* B. OBJECTIVES & PROCEDURES */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Target size={18} color="#8b5cf6" />
              <span style={styles.sectionTitle}>B. Objectives & Procedures</span>
            </div>
            <div style={styles.grid}>
              <div style={{ ...styles.field, gridColumn: "span 2" }}>
                <label style={styles.label}>Audit Objectives</label>
                <textarea 
                  style={{ ...styles.input, height: "80px", resize: "none", paddingLeft: "14px" }}
                  placeholder="Define what this audit aims to verify..."
                  value={formData.objectives}
                  onChange={e => setFormData({...formData, objectives: e.target.value})}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Audit Procedures</label>
                <textarea 
                  style={{ ...styles.input, height: "80px", resize: "none", paddingLeft: "14px" }}
                  placeholder="Step-by-step testing methodology..."
                  value={formData.procedures}
                  onChange={e => setFormData({...formData, procedures: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* C. CONTROL LINKAGE */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Shield size={18} color="#10b981" />
              <span style={styles.sectionTitle}>C. Linked Controls for Testing ({linkedControls.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {linkedControls.map(c => (
                <div key={c.id} style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Shield size={16} color="var(--status-low)" />
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
                   </div>
                   <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{c.type}</span>
                </div>
              ))}
              {linkedControls.length === 0 && (
                <div style={{ padding: "12px", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "8px", color: "#94a3b8", fontSize: "13px" }}>
                  No controls linked to this risk. Please assign controls before planning an audit.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button 
            style={{ ...styles.primaryBtn, opacity: linkedControls.length === 0 ? 0.5 : 1 }} 
            onClick={handleSave}
            disabled={linkedControls.length === 0}
          >
            Create Audit Engagement
          </button>
        </div>
      </div>
    </div>
  );
}
