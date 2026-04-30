import React, { useState, useEffect } from "react";
import { X, User, Plus } from "lucide-react";

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.2s ease-out",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    overflow: "hidden",
    transform: "scale(1)",
    animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    height: "80px",
    resize: "none",
    outline: "none",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#334155",
    fontWeight: 500,
  },
  footer: {
    padding: "20px 24px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#f8fafc",
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  cancelBtn: {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  }
};

export default function KRIModal({ isOpen, onClose, onSave, initialData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    yAxis: "",
    owner: "Admin",
    comment: "",
    type: "Line"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        yAxis: initialData.yAxis || "",
        owner: initialData.owner || "Admin",
        comment: initialData.comment || "",
        type: initialData.type || "Line"
      });
    } else {
      setFormData({ title: "", yAxis: "", owner: "Admin", comment: "", type: "Line" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.title) return alert("Title is required");
    
    setLoading(true);
    setTimeout(() => {
      onSave({
        ...initialData,
        ...formData,
        id: initialData?.id || Date.now(),
        date: initialData?.date || new Date().toLocaleDateString(),
        labels: initialData?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: initialData?.data || Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 5)
      });
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {initialData ? "Edit Key Risk Indicator" : "Add Key Risk Indicator"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={styles.body}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={styles.label}>KRI Title</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Revenue Growth"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label style={styles.label}>Y-axis Label</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Percentage (%)"
                value={formData.yAxis}
                onChange={e => setFormData({...formData, yAxis: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>KRI Owner</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...styles.input, paddingLeft: "40px" }} placeholder="Search owner..." value={formData.owner} readOnly />
              <User size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ ...styles.label, marginBottom: 0 }}>KRI Comments</label>
              <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Add Comment</button>
            </div>
            <textarea 
              style={styles.textarea} 
              placeholder="Brief description of the KRI..."
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
            />
          </div>

          <div>
            <label style={styles.label}>Chart Type Selection</label>
            <div style={styles.radioGroup}>
              {["Line", "Pie", "Column", "Stacked"].map(type => (
                <label key={type} style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="chartType" 
                    checked={formData.type === type}
                    onChange={() => setFormData({...formData, type})}
                  />
                  {type} Chart
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button 
            style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : initialData ? "Update KRI" : "Save KRI"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
