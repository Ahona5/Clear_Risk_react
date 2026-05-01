import React, { useState, useEffect } from "react";
import { X, Pin, User, Users, Shield, Calendar, Clock, ChevronRight, Info } from "lucide-react";

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10003,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(8px)",
    padding: "20px",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  header: {
    padding: "24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  typeOption: (selected) => ({
    padding: "16px",
    borderRadius: "12px",
    border: selected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
    background: selected ? "#eff6ff" : "#fff",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  iconBox: (selected) => ({
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: selected ? "#3b82f6" : "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: selected ? "#fff" : "#64748b",
  }),
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
  },
  footer: {
    padding: "20px 24px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#f8fafc",
  }
};

export default function PinModal({ isOpen, onClose, onPin, riskTitle }) {
  const [pinType, setPinType] = useState("Personal");
  const [expiryDate, setExpiryDate] = useState("");

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Pin size={20} color="#3b82f6" fill="#3b82f6" />
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Pin Risk to Dashboard</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={styles.body}>
          <div>
            <label style={styles.label}>Select Visibility Level</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { type: "Personal", desc: "Visible only on your personal view", icon: User },
                { type: "Team", desc: "Visible to all team members", icon: Users },
                { type: "Executive", desc: "Promoted to Main Executive Dashboard", icon: Shield }
              ].map(opt => (
                <div 
                  key={opt.type} 
                  style={styles.typeOption(pinType === opt.type)}
                  onClick={() => setPinType(opt.type)}
                >
                  <div style={styles.iconBox(pinType === opt.type)}>
                    <opt.icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: pinType === opt.type ? "#1e40af" : "#1e293b" }}>{opt.type} Pin</div>
                    <div style={{ fontSize: "12px", color: pinType === opt.type ? "#3b82f6" : "#64748b" }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={styles.label}>Optional: Set Pin Expiry / Review Date</label>
            <div style={{ position: "relative" }}>
              <input 
                type="date" 
                style={styles.input} 
                value={expiryDate} 
                onChange={e => setExpiryDate(e.target.value)} 
              />
              <Calendar size={16} color="#94a3b8" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>Risk will be automatically unpinned on this date.</p>
          </div>

          <div style={{ padding: "16px", borderRadius: "10px", background: "#f0f9ff", border: "1px solid #e0f2fe", display: "flex", gap: "12px" }}>
            <Info size={18} color="#0ea5e9" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "#0c4a6e", margin: 0, lineHeight: 1.5 }}>
              Pinned risks are prioritized on the dashboard based on severity. Critical risks will always appear above {pinType.toLowerCase()} pins.
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }} onClick={onClose}>Cancel</button>
          <button 
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            onClick={() => {
              onPin({ type: pinType, expiry: expiryDate });
              onClose();
            }}
          >
            Confirm & Pin Risk
          </button>
        </div>
      </div>
    </div>
  );
}
