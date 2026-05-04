import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Paperclip, Link as LinkIcon, User, Clock, 
  MoreVertical, CornerDownRight, Zap, AlertCircle, CheckCircle2, 
  Info, Shield, History, Tag, Flag, Edit2, Calendar
} from "lucide-react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  inputCard: {
    background: "var(--bg-card)",
    borderRadius: "16px",
    border: "1px solid var(--border-primary)",
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
  },
  inputArea: {
    width: "100%",
    minHeight: "100px",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid var(--border-primary)",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    resize: "none",
    marginBottom: "16px",
    transition: "all 0.2s",
  },
  controlRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
  },
  select: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-primary)",
    fontSize: "13px",
    outline: "none",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    cursor: "pointer",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-primary)",
  },
  commentCard: {
    background: "var(--bg-card)",
    borderRadius: "16px",
    border: "1px solid var(--border-primary)",
    padding: "20px",
    position: "relative",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  badge: (bg, color) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    background: bg,
    color: color,
    textTransform: "uppercase",
  }),
  authorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  commentText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    margin: "0 0 16px 0",
  },
  actions: {
    display: "flex",
    gap: "16px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border-primary)",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-muted)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  replySection: {
    marginLeft: "48px",
    borderLeft: "2px solid var(--border-primary)",
    paddingLeft: "20px",
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }
};

export default function CommentSystem({ riskId, currentUser, onConvertToAction }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("Update");
  const [impactLevel, setImpactLevel] = useState("Low");
  const [relatedEvent, setRelatedEvent] = useState("None");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`comments_${riskId}`);
    if (saved) setComments(JSON.parse(saved));
  }, [riskId]);

  const saveComments = (newComments) => {
    setComments(newComments);
    localStorage.setItem(`comments_${riskId}`, JSON.stringify(newComments));
  };

  const handleSubmit = (parentId = null) => {
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      author: currentUser.username || "System User",
      role: currentUser.role || "Analyst",
      text: newComment,
      type: commentType,
      impact: impactLevel,
      event: relatedEvent,
      timestamp: new Date().toISOString(),
      parentId: parentId,
      replies: [],
      isEdited: false,
      editHistory: [],
      attachments: []
    };

    if (parentId) {
      const updatedComments = comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), commentObj] };
        }
        return c;
      });
      saveComments(updatedComments);
      setReplyingTo(null);
    } else {
      saveComments([commentObj, ...comments]);
    }

    setNewComment("");
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "Issue": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--status-critical)" };
      case "Decision": return { bg: "rgba(16, 185, 129, 0.1)", color: "var(--status-low)" };
      case "Escalation": return { bg: "rgba(245, 158, 11, 0.1)", color: "var(--status-high)" };
      case "Observation": return { bg: "rgba(59, 130, 246, 0.1)", color: "var(--accent-primary)" };
      default: return { bg: "var(--bg-app)", color: "var(--text-muted)" };
    }
  };

  const getImpactColor = (level) => {
    if (level === "High") return "var(--status-critical)";
    if (level === "Medium") return "var(--status-high)";
    return "var(--status-low)";
  };

  const CommentCard = ({ comment, isReply = false }) => (
    <div style={isReply ? {} : { marginBottom: "24px" }}>
      <div style={styles.commentCard}>
        <div style={styles.authorInfo}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", border: "1px solid var(--border-primary)" }}>
            <User size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{comment.author}</span>
              <span style={styles.badge(getTypeStyle(comment.type).bg, getTypeStyle(comment.type).color)}>{comment.type}</span>
              {comment.impact !== "Low" && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: getImpactColor(comment.impact), display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertCircle size={12} /> {comment.impact} Impact
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <Clock size={12} /> {new Date(comment.timestamp).toLocaleString()}
              {comment.isEdited && <span style={{ fontStyle: "italic" }}>• Edited</span>}
              {comment.event !== "None" && <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>• Linked Event: {comment.event}</span>}
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><MoreVertical size={18} /></button>
        </div>

        <p style={styles.commentText}>{comment.text}</p>

        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={() => setReplyingTo(comment.id)}>
            <CornerDownRight size={14} /> Reply
          </button>
          <button style={styles.actionBtn} onClick={() => onConvertToAction(comment)}>
            <Zap size={14} /> Convert to Action
          </button>
          <button style={styles.actionBtn}>
            <History size={14} /> History
          </button>
          <button style={{ ...styles.actionBtn, marginLeft: "auto" }}>
            <Flag size={14} /> Requires Follow-up
          </button>
        </div>

        {replyingTo === comment.id && (
          <div style={{ marginTop: "20px", borderTop: "1px dashed #e2e8f0", paddingTop: "20px" }}>
            <textarea 
              style={{ ...styles.inputArea, minHeight: "60px", marginBottom: "12px" }} 
              placeholder="Write a reply..."
              autoFocus
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button style={styles.secondaryBtn} onClick={() => setReplyingTo(null)}>Cancel</button>
              <button style={{ ...styles.primaryBtn, padding: "8px 20px" }} onClick={() => handleSubmit(comment.id)}>Post Reply</button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={styles.replySection}>
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* INPUT SECTION */}
      <div style={styles.inputCard}>
        <label style={styles.label}>Log New Audit Record / Update</label>
        <textarea 
          style={styles.inputArea} 
          placeholder="Type your structured comment or @mention a team member..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        
        <div style={styles.controlRow}>
          <div>
            <label style={styles.label}>Classification Type</label>
            <select style={styles.select} value={commentType} onChange={e => setCommentType(e.target.value)}>
              <option>Update</option>
              <option>Issue</option>
              <option>Observation</option>
              <option>Decision</option>
              <option>Escalation</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Criticality / Impact</label>
            <select style={styles.select} value={impactLevel} onChange={e => setImpactLevel(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Related Governance Event</label>
            <select style={styles.select} value={relatedEvent} onChange={e => setRelatedEvent(e.target.value)}>
              <option>None</option>
              <option>Threshold Breach</option>
              <option>Control Failure</option>
              <option>Audit Finding</option>
            </select>
          </div>
        </div>

        <div style={styles.actionRow}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={styles.actionBtn}><Paperclip size={18} /> Attach Evidence</button>
            <button style={styles.actionBtn}><LinkIcon size={18} /> Add Reference</button>
          </div>
          <button 
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "var(--accent-primary)", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            onClick={() => handleSubmit()}
          >
            <Send size={16} /> Post Audit Comment
          </button>
        </div>
      </div>

      {/* FEED SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Audit Trail ({comments.length})</h3>
          <div style={{ display: "flex", gap: "12px" }}>
             <button style={styles.actionBtn}><Tag size={16} /> Filter by Type</button>
             <button style={styles.actionBtn}><Edit2 size={16} /> Edit History</button>
          </div>
        </div>

        {comments.length === 0 ? (
          <div style={{ padding: "60px 40px", textAlign: "center", border: "2px dashed var(--border-primary)", borderRadius: "16px", background: "var(--bg-app)" }}>
            <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: "16px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 8px" }}>No activity recorded yet</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>Start the audit trail by posting your first observation or decision update.</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>

      <style>{`
        textarea:focus { border-color: var(--accent-primary) !important; background: var(--bg-card) !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        select:focus { border-color: var(--accent-primary) !important; }
      `}</style>
    </div>
  );
}
