import { useState } from "react";
import "./styles/forgotPassword.css";

function ForgotPassword({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: "Please enter your email", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    // Simulate API call and check localStorage
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find((user) => user.email === email);

        if (foundUser) {
          setMessage({
            text: "Password reset link has been sent to your email! ✅",
            type: "success",
          });
        } else {
          setMessage({
            text: "Email not found in our records. ❌",
            type: "error",
          });
        }
      } catch (err) {
        setMessage({ text: "Something went wrong. Please try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>Forgot Password</h3>
          <p>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="example@gmail.com"
            className="modal-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;