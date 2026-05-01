import React, { useState, useEffect } from "react";
import { X, User, Search } from "lucide-react";

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
    borderRadius: "8px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    overflow: "hidden",
    color: "#1e293b",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#1e293b",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "4px",
    border: "1px solid #94a3b8",
    fontSize: "14px",
    outline: "none",
    color: "#334155",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "4px",
    border: "1px solid #94a3b8",
    fontSize: "14px",
    height: "40px",
    resize: "none",
    outline: "none",
  },
  radioGroup: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    marginTop: "16px"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: 400,
  },
  footer: {
    padding: "24px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveBtn: {
    padding: "10px 32px",
    borderRadius: "4px",
    border: "none",
    background: "#0056d2",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 32px",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
    background: "#f1f5f9",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  }
};

export default function KRIModal({ isOpen, onClose, onSave, initialData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    yAxis: "",
    owner: "",
    comment: "",
    type: "Line"
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          yAxis: initialData.yAxis || "",
          owner: initialData.owner || "",
          comment: initialData.comment || "",
          type: initialData.type || "Line"
        });
      } else {
        setFormData({ title: "", yAxis: "", owner: "", comment: "", type: "Line" });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.title) return alert("Title is required");
    
    setLoading(true);
    // Directly call onSave to avoid confusion with simulated delay
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
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: 0 }}>
            Key Risk Indicator
          </h2>
        </div>

        <div style={styles.body}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div>
              <label style={styles.label}>Title</label>
              <input 
                style={styles.input} 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Enter title"
              />
            </div>
            <div>
              <label style={styles.label}>Y-axis Label</label>
              <input 
                style={styles.input} 
                value={formData.yAxis}
                onChange={e => setFormData({...formData, yAxis: e.target.value})}
                placeholder="Enter label"
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>KRI Owner</label>
            <div style={{ position: "relative" }}>
              <input 
                style={styles.input} 
                value={formData.owner} 
                onChange={e => setFormData({...formData, owner: e.target.value})}
                placeholder="Search" 
              />
              <Search size={18} color="#94a3b8" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <label style={{ ...styles.label, marginBottom: "4px" }}>KRI Comments</label>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>Brief description of how the KRI is performing</div>
              </div>
              <button 
                type="button"
                style={{ background: "#0056d2", color: "#fff", border: "none", borderRadius: "4px", padding: "8px 16px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
              >
                Add Comment
              </button>
            </div>
            <textarea 
              style={{ ...styles.textarea, height: '60px' }} 
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              placeholder="Add your comments here..."
            />
          </div>

          <div style={styles.radioGroup}>
            {["Line", "Pie", "Column", "Stacked"].map(type => (
              <label key={type} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="chartType" 
                  checked={formData.type === type}
                  onChange={() => setFormData({...formData, type})}
                  style={{ width: "16px", height: "16px" }}
                />
                {type} Chart
              </label>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Press enter to insert new row or right click for menu.
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }} 
              onClick={handleSubmit}
              disabled={loading}
            >
              Save
            </button>
            <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        input:focus, textarea:focus { border-color: #0056d2 !important; box-shadow: 0 0 0 2px rgba(0,86,210,0.1); }
      `}</style>
    </div>
  );
}

