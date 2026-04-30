import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import './styles/EscalateModal.css';

const EscalateModal = ({ isOpen, onClose, onSubmit, usersList }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [priority, setPriority] = useState("High");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUser("");
      setPriority("High");
      setComment("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Please select a user to tag.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    
    // Simulate API call delay for better UX
    await new Promise(res => setTimeout(res, 800));
    
    onSubmit({ taggedUser: selectedUser, priority, comment });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="escalate-modal-overlay" onClick={onClose}>
      <div className="escalate-modal-content" onClick={e => e.stopPropagation()}>
        <div className="escalate-modal-header">
          <h2>Escalate Risk</h2>
          <button className="escalate-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        {error && <div className="escalate-modal-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="escalate-modal-form">
          <div className="form-group">
            <label>Tag User: <span className="required">*</span></label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className={!selectedUser && error ? "select-error" : ""}
            >
              <option value="">Select a user...</option>
              {usersList.map(u => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "User"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority: <span className="required">*</span></label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Comment (Optional):</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Why are you escalating this?"
              maxLength={500}
              rows={3}
            />
            <div className="char-count">{comment.length}/500</div>
          </div>

          <div className="escalate-modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting || !selectedUser}
            >
              {isSubmitting ? <><Loader2 size={16} className="spinner" /> Escalating...</> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscalateModal;
