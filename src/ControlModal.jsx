import React, { useState, useEffect } from "react";
import { X, Search, Shield, Check, Info, User, Clock, AlertTriangle, FileText, ChevronRight, ChevronDown, Filter, Trash2 } from "lucide-react";

const CONTROL_LIBRARY = [
  { id: "C1", name: "Multi-Factor Authentication (MFA)", category: "IT Security", type: "Preventive", description: "Enforce MFA for all system access." },
  { id: "C2", name: "Data Backup & Recovery", category: "Operations", type: "Corrective", description: "Daily backups with off-site storage." },
  { id: "C3", name: "Monthly Financial Reconciliation", category: "Finance", type: "Detective", description: "Review and reconcile all bank statements." },
  { id: "C4", name: "Annual Security Awareness Training", category: "Compliance", type: "Preventive", description: "Mandatory training for all employees." },
  { id: "C5", name: "Incident Response Plan", category: "IT Security", type: "Corrective", description: "Structured plan for handling security incidents." },
  { id: "C6", name: "Access Rights Review", category: "IT Security", type: "Detective", description: "Quarterly review of user access privileges." },
];

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
    padding: "20px",
  },
  modalContent: {
    background: "var(--bg-modal)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "1100px",
    height: "90vh",
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
  layout: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  librarySection: {
    width: "350px",
    borderRight: "1px solid var(--border-primary)",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-surface)",
  },
  evaluationSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-modal)",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
  },
  searchBar: {
    padding: "16px 24px",
    borderBottom: "1px solid var(--border-primary)",
    background: "var(--bg-surface)",
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 40px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    fontSize: "14px",
    outline: "none",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    fontFamily: "inherit",
  },
  controlCard: {
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid var(--border-primary)",
    background: "var(--bg-card)",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  },
  selectedCard: {
    border: "1px solid var(--accent-primary)",
    background: "var(--bg-active)",
  },
  evaluationCard: {
    border: "1px solid var(--border-primary)",
    borderRadius: "12px",
    marginBottom: "24px",
    overflow: "hidden",
    background: "var(--bg-card)",
  },
  evaluationHeader: {
    padding: "16px 24px",
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  evaluationBody: {
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "8px",
    display: "block",
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
    fontFamily: "inherit",
  },
  tag: (color) => ({
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 700,
    background: `${color}15`,
    color: color,
    textTransform: "uppercase",
  }),
  footer: {
    padding: "20px 32px",
    borderTop: "1px solid var(--border-primary)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "var(--bg-modal)",
  },
  primaryBtn: {
    padding: "12px 28px",
    borderRadius: "8px",
    border: "none",
    background: "var(--accent-primary)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 28px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    background: "var(--bg-app)",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }
};

export default function ControlModal({ isOpen, onClose, onSave, linkedRiskTitle }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedControls, setSelectedControls] = useState([]);
  const [evaluations, setEvaluations] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedControls([]);
      setEvaluations({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleControl = (control) => {
    const isSelected = selectedControls.find(c => c.id === control.id);
    if (isSelected) {
      setSelectedControls(selectedControls.filter(c => c.id !== control.id));
      const newEvals = { ...evaluations };
      delete newEvals[control.id];
      setEvaluations(newEvals);
    } else {
      setSelectedControls([...selectedControls, control]);
      setEvaluations({
        ...evaluations,
        [control.id]: {
          id: control.id,
          name: control.name,
          type: control.type,
          owner: "",
          effectiveness: "Effective",
          frequency: "Monthly",
          impact: "Medium",
          lastPerformed: "",
          notes: ""
        }
      });
    }
  };

  const updateEvaluation = (id, field, value) => {
    setEvaluations({
      ...evaluations,
      [id]: { ...evaluations[id], [field]: value }
    });
  };

  const filteredLibrary = CONTROL_LIBRARY.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinalSubmit = () => {
    // Validation
    const incomplete = selectedControls.some(c => !evaluations[c.id].owner);
    if (incomplete) return alert("Please assign an owner to all selected controls.");

    onSave(Object.values(evaluations));
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Shield size={24} color="#3b82f6" />
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Assign & Evaluate Controls</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Linked Risk: <span style={{ fontWeight: 600, color: "#334155" }}>{linkedRiskTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={styles.layout}>
          {/* LEFT: LIBRARY */}
          <div style={styles.librarySection}>
            <div style={styles.searchBar}>
              <div style={{ position: "relative" }}>
                <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input 
                  style={styles.input} 
                  placeholder="Search controls library..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div style={{ ...styles.scrollArea, padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Available Controls ({filteredLibrary.length})</div>
              {filteredLibrary.map(control => {
                const isSelected = selectedControls.find(c => c.id === control.id);
                return (
                  <div 
                    key={control.id} 
                    style={{ ...styles.controlCard, ...(isSelected ? styles.selectedCard : {}) }}
                    onClick={() => toggleControl(control)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{control.name}</span>
                      {isSelected && <Check size={16} color="#3b82f6" />}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={styles.tag("#64748b")}>{control.category}</span>
                      <span style={styles.tag(control.type === "Preventive" ? "#10b981" : control.type === "Detective" ? "#3b82f6" : "#f59e0b")}>{control.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: EVALUATION */}
          <div style={styles.evaluationSection}>
            {selectedControls.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", padding: "40px" }}>
                <Shield size={64} style={{ marginBottom: "16px", opacity: 0.2 }} />
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#64748b", margin: "0 0 8px" }}>No Controls Selected</h3>
                <p style={{ fontSize: "14px", textAlign: "center", maxWidth: "300px" }}>Select controls from the library on the left to begin evaluation and assignment.</p>
              </div>
            ) : (
              <div style={styles.scrollArea}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Selected Controls ({selectedControls.length})</h3>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Please configure each control's effectiveness and ownership.</div>
                </div>

                {selectedControls.map(control => {
                  const evalData = evaluations[control.id];
                  return (
                    <div key={control.id} style={styles.evaluationCard}>
                      <div style={styles.evaluationHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Shield size={18} color="#3b82f6" />
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>{control.name}</span>
                        </div>
                        <button onClick={() => toggleControl(control)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                      <div style={styles.evaluationBody}>
                        <div>
                          <label style={styles.label}>Control Type</label>
                          <select style={styles.select} value={evalData.type} onChange={e => updateEvaluation(control.id, "type", e.target.value)}>
                            <option>Preventive</option>
                            <option>Detective</option>
                            <option>Corrective</option>
                          </select>
                        </div>
                        <div>
                          <label style={styles.label}>Control Owner (Required)</label>
                          <input 
                            style={styles.input} 
                            placeholder="Assign responsible person..." 
                            value={evalData.owner}
                            onChange={e => updateEvaluation(control.id, "owner", e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={styles.label}>Effectiveness Rating</label>
                          <select style={styles.select} value={evalData.effectiveness} onChange={e => updateEvaluation(control.id, "effectiveness", e.target.value)}>
                            <option>Effective</option>
                            <option>Partial</option>
                            <option>Ineffective</option>
                          </select>
                        </div>
                        <div>
                          <label style={styles.label}>Execution Frequency</label>
                          <select style={styles.select} value={evalData.frequency} onChange={e => updateEvaluation(control.id, "frequency", e.target.value)}>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Quarterly</option>
                            <option>Annual</option>
                          </select>
                        </div>
                        <div>
                          <label style={styles.label}>Risk Reduction Impact</label>
                          <select style={styles.select} value={evalData.impact} onChange={e => updateEvaluation(control.id, "impact", e.target.value)}>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </div>
                        <div>
                          <label style={styles.label}>Last Performed Date</label>
                          <input type="date" style={styles.input} value={evalData.lastPerformed} onChange={e => updateEvaluation(control.id, "lastPerformed", e.target.value)} />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={styles.label}>Evidence Link / Reference</label>
                          <input style={styles.input} placeholder="Link to documentation or evidence..." value={evalData.evidence} onChange={e => updateEvaluation(control.id, "evidence", e.target.value)} />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={styles.label}>Notes & Observations</label>
                          <textarea 
                            style={{ ...styles.input, height: "80px", resize: "none", paddingLeft: "14px" }} 
                            placeholder="Add any specific notes or observations about this control's performance..."
                            value={evalData.notes}
                            onChange={e => updateEvaluation(control.id, "notes", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          <button 
            style={{ ...styles.primaryBtn, opacity: selectedControls.length === 0 ? 0.5 : 1 }} 
            onClick={handleFinalSubmit}
            disabled={selectedControls.length === 0}
          >
            Assign & Evaluate Controls
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
