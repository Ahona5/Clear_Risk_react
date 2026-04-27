import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/style.css";
import "./styles/login.css";
import ForgotPassword from "./ForgotPassword";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to trigger the transition
    const timer = setTimeout(() => setIsEntering(true), 100);

    /* INIT DEFAULT USER */
    let existingUsers = JSON.parse(localStorage.getItem("users"));
    if (!existingUsers || existingUsers.length === 0) {
      let defaultAdmin = [
        {
          id: 1,
          email: "admin@gmail.com",
          password: "123456",
          role: "admin",
          username: "admin",
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultAdmin));
    }

    return () => clearTimeout(timer);
  }, []);

  const loginUser = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      alert("Invalid email or password ❌");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    setAnimate(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <>
      <div className="navbar">
        <div className="logo-section">
          <img src="/images/logo.png" className="app-logo" alt="logo" />
        </div>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="#">Platform</a></li>
          <li><a href="#">Solutions</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Insights</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </div>

      <section className={`login-page ${animate ? "slide-out" : ""} ${isEntering ? "in-view" : ""}`}>
        <div className="login-image"></div>

        <div className="login-box">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>

          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>

          <button className="login-button" onClick={loginUser}>
            Login
          </button>

          <span className="forgot" onClick={() => setShowForgotModal(true)}>
            Forgot Password?
          </span>
        </div>
      </section>

      <ForgotPassword
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
}

export default Login;