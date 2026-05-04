import React, { useState, useEffect } from "react";
import { X, Search, Zap, Clock, Shield, Bell, User, AlertTriangle, FileText, ChevronRight, CheckCircle, Trash2, Link as LinkIcon, Upload } from "lucide-react";

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
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
    maxWidth: "1000px",
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
    gridTemplateColumns: "1fr 1fr",
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
  },
  helper: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontStyle: "italic",
  }
};

export default function ActionModal({ isOpen, onClose, onSave, linkedRiskTitle }) {
  const [formData, setFormData] = useState({
    title: "",
    triggerType: "Manual Trigger",
    actionType: "Investigation",
    description: "",
    owner: "",
    backupOwner: "",
    sla: "48h",
    startCondition: "On trigger event",
    escalationTiming: "+24h",
    escalationRecipient: "",
    notificationChannels: ["Email", "In-app"],
    closureRequirements: ["Resolution notes"],
    status: "Open"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        triggerType: "Manual Trigger",
        actionType: "Investigation",
        description: "",
        owner: "",
        backupOwner: "",
        sla: "48h",
        startCondition: "On trigger event",
        escalationTiming: "+24h",
        escalationRecipient: "",
        notificationChannels: ["Email", "In-app"],
        closureRequirements: ["Resolution notes"],
        status: "Open"
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Action Title is required";
    if (!formData.owner) newErrors.owner = "Action Owner is required";
    if (!formData.description) newErrors.description = "Action Description is required";
    if (!formData.triggerType) newErrors.triggerType = "Trigger type is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        dueDate: calculateDueDate(formData.sla)
      });
      onClose();
    }
  };

  const calculateDueDate = (sla) => {
    const now = new Date();
    if (sla === "24h") now.setHours(now.getHours() + 24);
    else if (sla === "48h") now.setHours(now.getHours() + 48);
    else if (sla === "3 days") now.setDate(now.getDate() + 3);
    else now.setHours(now.getHours() + 72);
    return now.toISOString();
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Zap size={24} color="#f59e0b" />
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Configure Risk Response Action</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Target Risk: <span style={{ fontWeight: 600 }}>{linkedRiskTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={styles.scrollArea}>
          {/* A. TRIGGER CONFIGURATION */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Zap size={18} color="#f59e0b" />
              <span style={styles.sectionTitle}>A. Trigger Configuration</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Trigger Type (Required)</label>
                <select 
                  style={styles.select}
                  value={formData.triggerType}
                  onChange={e => setFormData({...formData, triggerType: e.target.value})}
                >
                  <option>Amber Threshold Breach</option>
                  <option>Red Threshold Breach</option>
                  <option>Trend Deterioration</option>
                  <option>Manual Trigger</option>
                </select>
                <span style={styles.helper}>Define the event that initiates this action.</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Trigger Linkage</label>
                <input style={styles.input} value={linkedRiskTitle} readOnly />
                <span style={styles.helper}>Action is automatically linked to parent risk.</span>
              </div>
            </div>
          </div>

          {/* B. ACTION DEFINITION */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FileText size={18} color="#3b82f6" />
              <span style={styles.sectionTitle}>B. Action Definition</span>
            </div>
            <div style={{ ...styles.field, marginBottom: "24px" }}>
              <label style={styles.label}>Action Title (Required)</label>
              <input 
                style={{ ...styles.input, borderColor: errors.title ? "#ef4444" : "#e2e8f0" }}
                placeholder="e.g. Conduct Root Cause Analysis for Server Downtime"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Action Type</label>
                <select 
                  style={styles.select}
                  value={formData.actionType}
                  onChange={e => setFormData({...formData, actionType: e.target.value})}
                >
                  <option>Immediate Fix</option>
                  <option>Investigation</option>
                  <option>Preventive</option>
                  <option>Escalation</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Detailed Description (Required)</label>
                <textarea 
                  style={{ ...styles.input, height: "80px", resize: "none", paddingLeft: "14px", borderColor: errors.description ? "#ef4444" : "#e2e8f0" }}
                  placeholder="Define specific steps and expected outcomes..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* C. OWNERSHIP & ACCOUNTABILITY */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={18} color="#8b5cf6" />
              <span style={styles.sectionTitle}>C. Ownership & Accountability</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Action Owner (Required)</label>
                <input 
                  style={{ ...styles.input, borderColor: errors.owner ? "#ef4444" : "#e2e8f0" }}
                  placeholder="Assign responsible person..."
                  value={formData.owner}
                  onChange={e => setFormData({...formData, owner: e.target.value})}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Backup / Escalation Owner</label>
                <input 
                  style={styles.input}
                  placeholder="Assign backup owner..."
                  value={formData.backupOwner}
                  onChange={e => setFormData({...formData, backupOwner: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* D. SLA & TIMING */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Clock size={18} color="#ef4444" />
              <span style={styles.sectionTitle}>D. SLA & Timing</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>SLA / Due Time</label>
                <select 
                  style={styles.select}
                  value={formData.sla}
                  onChange={e => setFormData({...formData, sla: e.target.value})}
                >
                  <option>24h</option>
                  <option>48h</option>
                  <option>3 days</option>
                  <option>7 days</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Start Condition</label>
                <select 
                  style={styles.select}
                  value={formData.startCondition}
                  onChange={e => setFormData({...formData, startCondition: e.target.value})}
                >
                  <option>On trigger event</option>
                  <option>Manual start</option>
                </select>
              </div>
            </div>
          </div>

          {/* E. ESCALATION LOGIC */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <AlertTriangle size={18} color="#ef4444" />
              <span style={styles.sectionTitle}>E. Escalation Logic</span>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Escalation Timing</label>
                <select 
                  style={styles.select}
                  value={formData.escalationTiming}
                  onChange={e => setFormData({...formData, escalationTiming: e.target.value})}
                >
                  <option>Immediately on breach</option>
                  <option>+12h after breach</option>
                  <option>+24h after breach</option>
                  <option>+48h after breach</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Escalation Recipient</label>
                <input 
                  style={styles.input}
                  placeholder="e.g. Risk Committee Head"
                  value={formData.escalationRecipient}
                  onChange={e => setFormData({...formData, escalationRecipient: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* F. NOTIFICATIONS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Bell size={18} color="#3b82f6" />
              <span style={styles.sectionTitle}>F. Notifications</span>
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              {["Email", "Slack / Teams", "In-app"].map(channel => (
                <label key={channel} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={formData.notificationChannels.includes(channel)}
                    onChange={() => setFormData({...formData, notificationChannels: toggleArrayItem(formData.notificationChannels, channel)})}
                  />
                  {channel}
                </label>
              ))}
            </div>
            <div style={{ marginTop: "12px", ...styles.helper }}>
              System will notify on: Creation, SLA Breach, and Status Changes.
            </div>
          </div>

          {/* G. CLOSURE REQUIREMENTS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <CheckCircle size={18} color="#10b981" />
              <span style={styles.sectionTitle}>G. Closure Requirements</span>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {["File upload", "System Link", "Resolution notes"].map(req => (
                <label key={req} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={formData.closureRequirements.includes(req)}
                    onChange={() => setFormData({...formData, closureRequirements: toggleArrayItem(formData.closureRequirements, req)})}
                  />
                  {req}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={styles.primaryBtn} onClick={handleSave}>Assign & Activate Action</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
