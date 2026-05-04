import React, { useState, useEffect } from "react";
import { X, Search, Info, Bell, Activity, Shield, Target, Clock, User, Link as LinkIcon, AlertTriangle } from "lucide-react";

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
    animation: "fadeIn 0.2s ease-out",
  },
  modalContent: {
    background: "var(--bg-modal)",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    boxShadow: "var(--shadow-lg)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    border: "1px solid var(--border-primary)",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    background: "var(--bg-modal)",
    zIndex: 10,
  },
  section: {
    padding: "32px",
    borderBottom: "1px solid var(--border-primary)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionDesc: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "24px",
  },
  fieldGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
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
  helper: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "6px",
  },
  thresholdInput: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
    border: "1px solid var(--border-primary)",
  },
  footer: {
    padding: "24px 32px",
    borderTop: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "var(--bg-modal)",
    position: "sticky",
    bottom: 0,
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
    transition: "all 0.2s",
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

export default function KRIModal({ isOpen, onClose, onSave, initialData, risks = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkedRisk: "",
    metricType: "percentage",
    unit: "%",
    dataSource: "manual",
    calculationLogic: "",
    frequency: "monthly",
    thresholds: {
      green: { min: 0, max: 5 },
      amber: { min: 6, max: 15 },
      red: { min: 16, max: 100 }
    },
    owner: "",
    department: "",
    escalationContact: "",
    alertTrigger: "red",
    notificationMethod: ["email", "app"],
    playbook: "",
    chartType: "Line",
    timeRange: "30d"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ ...formData, ...initialData });
    } else if (isOpen) {
      setFormData({
        title: "",
        description: "",
        linkedRisk: "",
        metricType: "percentage",
        unit: "%",
        dataSource: "manual",
        calculationLogic: "",
        frequency: "monthly",
        thresholds: { green: { min: 0, max: 5 }, amber: { min: 6, max: 15 }, red: { min: 16, max: 100 } },
        owner: "",
        department: "",
        escalationContact: "",
        alertTrigger: "red",
        notificationMethod: ["email", "app"],
        playbook: "",
        chartType: "Line",
        timeRange: "30d"
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "KRI Name is required";
    if (!formData.linkedRisk) newErrors.linkedRisk = "Linked Risk is required";
    if (!formData.owner) newErrors.owner = "Owner is required";
    
    // Threshold validation
    if (Number(formData.thresholds.green.max) >= Number(formData.thresholds.amber.max)) {
      newErrors.thresholds = "Threshold ranges must be logical (Green < Amber < Red)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...formData,
        id: initialData?.id || Date.now(),
        date: new Date().toLocaleDateString()
      });
      onClose();
    }
  };

  const renderTooltip = (text) => (
    <div title={text} style={{ cursor: "help", display: "inline-flex", alignItems: "center" }}>
      <Info size={14} color="#94a3b8" />
    </div>
  );

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Activity size={24} color="#2563eb" />
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Define Key Risk Indicator (KRI)</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
        </div>

        {/* SECTION A: BASIC INFORMATION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}><Info size={18} color="#2563eb" /> Basic Information</div>
          <p style={styles.sectionDesc}>Establish the identity and context for this performance indicator.</p>
          
          <div style={{ ...styles.fieldGroup, gridTemplateColumns: "2fr 1.5fr" }}>
            <div>
              <label style={styles.label}>KRI Name (Required) {errors.title && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.title}</span>}</label>
              <input 
                style={{ ...styles.input, borderColor: errors.title ? "#ef4444" : "#e2e8f0" }} 
                placeholder="e.g. Critical System Downtime" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <div style={styles.helper}>A clear, concise name that describes what is being measured.</div>
            </div>
            <div>
              <label style={styles.label}>Linked Risk {errors.linkedRisk && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.linkedRisk}</span>}</label>
              <select 
                style={{ ...styles.select, borderColor: errors.linkedRisk ? "#ef4444" : "#e2e8f0" }}
                value={formData.linkedRisk}
                onChange={e => setFormData({ ...formData, linkedRisk: e.target.value })}
              >
                <option value="">Select a Risk Profile...</option>
                <option value="1">IT Infrastructure Failure</option>
                <option value="2">Cyber Security Breach</option>
                <option value="3">Regulatory Non-compliance</option>
              </select>
              <div style={styles.helper}>Assign this KRI to a specific risk category.</div>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <label style={styles.label}>KRI Description {renderTooltip("Define exactly what this KRI measures and why it is significant.")}</label>
            <textarea 
              style={{ ...styles.input, height: "80px", resize: "none" }} 
              placeholder="This KRI measures the cumulative downtime of Tier-1 systems over a rolling 30-day window..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION B: MEASUREMENT DEFINITION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}><Target size={18} color="#2563eb" /> Measurement Definition</div>
          <p style={styles.sectionDesc}>Define the quantitative logic and source for data collection.</p>
          
          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label}>Metric Type {renderTooltip("Percentage, Count, Currency, or Ratio based on data nature.")}</label>
              <select style={styles.select} value={formData.metricType} onChange={e => setFormData({ ...formData, metricType: e.target.value })}>
                <option value="percentage">Percentage (%)</option>
                <option value="count">Count (#)</option>
                <option value="currency">Currency ($)</option>
                <option value="ratio">Ratio (x:y)</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Reporting Frequency</label>
              <select style={styles.select} value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                <option value="real-time">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Data Source</label>
              <select style={styles.select} value={formData.dataSource} onChange={e => setFormData({ ...formData, dataSource: e.target.value })}>
                <option value="manual">Manual Entry</option>
                <option value="api">External API</option>
                <option value="system">System Integration (ERP/SIEM)</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Unit of Measurement</label>
              <input style={styles.input} placeholder="e.g. Hours, USD, %" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <label style={styles.label}>Calculation Logic (Optional)</label>
            <input 
              style={styles.input} 
              placeholder="e.g. (Total Downtime / 720 Hours) * 100" 
              value={formData.calculationLogic}
              onChange={e => setFormData({ ...formData, calculationLogic: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION C: THRESHOLDS */}
        <div style={styles.section}>
          <div style={{ ...styles.sectionTitle, color: "#b91c1c" }}><AlertTriangle size={18} color="#b91c1c" /> Thresholds (Mandatory)</div>
          <p style={styles.sectionDesc}>Define the numeric ranges that trigger status changes and alerts. {errors.thresholds && <span style={{ color: "#ef4444", fontWeight: 600 }}>{errors.thresholds}</span>}</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div style={{ ...styles.thresholdInput, background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--status-low)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--status-low)", marginBottom: "4px" }}>GREEN (STABLE)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input style={{ ...styles.input, padding: "6px" }} type="number" value={formData.thresholds.green.min} readOnly />
                  <span style={{ color: "var(--text-muted)" }}>to</span>
                  <input 
                    style={{ ...styles.input, padding: "6px" }} 
                    type="number" 
                    value={formData.thresholds.green.max} 
                    onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, green: { ...formData.thresholds.green, max: e.target.value }, amber: { ...formData.thresholds.amber, min: Number(e.target.value) + 1 } } })}
                  />
                </div>
              </div>
            </div>
            <div style={{ ...styles.thresholdInput, background: "rgba(234, 179, 8, 0.1)", borderColor: "rgba(234, 179, 8, 0.2)" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--status-medium)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--status-medium)", marginBottom: "4px" }}>AMBER (CAUTION)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input style={{ ...styles.input, padding: "6px" }} type="number" value={formData.thresholds.amber.min} readOnly />
                  <span style={{ color: "var(--text-muted)" }}>to</span>
                  <input 
                    style={{ ...styles.input, padding: "6px" }} 
                    type="number" 
                    value={formData.thresholds.amber.max}
                    onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, amber: { ...formData.thresholds.amber, max: e.target.value }, red: { ...formData.thresholds.red, min: Number(e.target.value) + 1 } } })}
                  />
                </div>
              </div>
            </div>
            <div style={{ ...styles.thresholdInput, background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--status-critical)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--status-critical)", marginBottom: "4px" }}>RED (CRITICAL)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input style={{ ...styles.input, padding: "6px" }} type="number" value={formData.thresholds.red.min} readOnly />
                  <span style={{ color: "var(--text-muted)" }}>to</span>
                  <input 
                    style={{ ...styles.input, padding: "6px" }} 
                    type="number" 
                    value={formData.thresholds.red.max}
                    onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, red: { ...formData.thresholds.red, max: e.target.value } } })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: OWNERSHIP */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}><User size={18} color="#2563eb" /> Ownership & Accountability</div>
          <p style={styles.sectionDesc}>Assign responsibility for monitoring and managing this indicator.</p>
          
          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label}>KRI Owner (Required)</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...styles.input, paddingLeft: "40px" }} placeholder="Search owner..." value={formData.owner} onChange={e => setFormData({ ...formData, owner: e.target.value })} />
                <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
            <div>
              <label style={styles.label}>Department</label>
              <select style={styles.select} value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option value="">Select Department...</option>
                <option value="IT">IT & Security</option>
                <option value="Finance">Finance</option>
                <option value="Ops">Operations</option>
                <option value="Compliance">Legal & Compliance</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Escalation Contact</label>
              <input style={styles.input} placeholder="e.g. Chief Risk Officer" value={formData.escalationContact} onChange={e => setFormData({ ...formData, escalationContact: e.target.value })} />
            </div>
          </div>
        </div>

        {/* SECTION E: ALERTS & ACTIONS */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}><Bell size={18} color="#2563eb" /> Alerts & Actions</div>
          <p style={styles.sectionDesc}>Define automated response protocols when thresholds are breached.</p>
          
          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label}>Alert Trigger Level</label>
              <select style={styles.select} value={formData.alertTrigger} onChange={e => setFormData({ ...formData, alertTrigger: e.target.value })}>
                <option value="amber">Amber (Caution) + Red</option>
                <option value="red">Red (Critical) Only</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Notification Method</label>
              <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
                {["email", "slack", "app"].map(m => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={formData.notificationMethod.includes(m)}
                      onChange={() => {
                        const next = formData.notificationMethod.includes(m) 
                          ? formData.notificationMethod.filter(x => x !== m)
                          : [...formData.notificationMethod, m];
                        setFormData({ ...formData, notificationMethod: next });
                      }}
                    />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <label style={styles.label}>Action Playbook {renderTooltip("Standard operating procedure when thresholds are breached.")}</label>
            <textarea 
              style={{ ...styles.input, height: "100px", resize: "none" }} 
              placeholder="1. Notify System Administrators. 2. Initiate Incident Management Protocol... "
              value={formData.playbook}
              onChange={e => setFormData({ ...formData, playbook: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION F: VISUALIZATION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}><Shield size={18} color="#2563eb" /> Visualization & Behavior</div>
          <p style={styles.sectionDesc}>Configure how the KRI will be presented on the dashboards.</p>
          
          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label}>Chart Type {renderTooltip("Line charts are recommended for time-series trend analysis.")}</label>
              <select style={styles.select} value={formData.chartType} onChange={e => setFormData({ ...formData, chartType: e.target.value })}>
                <option value="Line">Line Chart (Trend)</option>
                <option value="Bar">Column Chart (Categorical)</option>
                <option value="Area">Area Chart (Volume)</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Time Range</label>
              <select style={styles.select} value={formData.timeRange} onChange={e => setFormData({ ...formData, timeRange: e.target.value })}>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={styles.primaryBtn} onClick={handleSave}>Save KRI Definition</button>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          input:focus, select:focus, textarea:focus { border-color: var(--accent-primary) !important; background: var(--bg-surface) !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        `}</style>
      </div>
    </div>
  );
}

