import "./styles/style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/images/logo.png" className="app-logo" alt="Clear Risk" />
        </div>

        <ul className="nav-links">
          <li className="nav-item active"><a href="#">Home</a></li>
          <li><a href="#">Platform</a></li>
          <li><a href="#">Solutions</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#">Insights</a></li>
          <li><a href="#">About</a></li>
        </ul>

        <div className="nav-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="demo-btn">Book Demo</button>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="content-wrapper">
        {/* HERO */}
        <section className="hero">
          <div className="hero-text">
            <h1>Smart Risk Management Made Simple</h1>
            <p>
              Clear Risk helps organizations identify, track and manage risks
              in one powerful platform designed for modern teams.
            </p>

            <div className="hero-buttons">
              <button className="primary">Start Free Trial</button>
              <button className="secondary">Request Demo</button>
            </div>
          </div>

          <div className="hero-image">
            <img src="/images/risk-analysis.gif" alt="Risk Analysis" />
          </div>
        </section>

        {/* REVIEWS */}
        <section className="reviews">
          <h2>Trusted by professionals worldwide</h2>

          <div className="review-container">
            <div className="card">
              <p>"Clear Risk made our risk reporting much easier and faster."</p>
              <h4>Sarah M.</h4>
            </div>

            <div className="card">
              <p>"We replaced spreadsheets and everything is now centralized."</p>
              <h4>David K.</h4>
            </div>

            <div className="card">
              <p>"The dashboard gives leadership clear visibility of risk."</p>
              <h4>Priya S.</h4>
            </div>

            <div className="card">
              <p>"Excellent reporting tools and collaboration features."</p>
              <h4>Michael R.</h4>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-dark">
          <h2>A Smarter Way To Manage Risk</h2>

          <div className="feature-grid">
            <div className="feature-box">
              <img src="/images/2620620.png" alt="Data Accessibility" />
              <h3>Easy data accessibility, regular & structured auditing</h3>
            </div>

            <div className="feature-box">
              <img src="/images/12143588.png" alt="Streamlining Workflows" />
              <h3>Streamlining workflows & mitigating risks</h3>
            </div>

            <div className="feature-box">
              <img src="/images/save.png" alt="Reduced Data Duplication" />
              <h3>Reduced data duplication and errors</h3>
            </div>

            <div className="feature-box">
              <img src="/images/userfr.png" alt="User Friendly Interface" />
              <h3>Automated, intuitive, & user-friendly interface</h3>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="pricing">
          <h2>Flexible Pricing</h2>

          <div className="pricing-container">
            {["Starter", "Professional", "Enterprise"].map((plan, index) => (
              <div
                key={index}
                className={`price-card ${selectedPlan === index ? "active" : ""
                  }`}
                onClick={() => setSelectedPlan(index)}
              >
                <h3>{plan}</h3>

                <h1>
                  {index === 0 && "$400"}
                  {index === 1 && "$1099"}
                  {index === 2 && "$4500"}
                </h1>

                <ul>
                  {index === 0 && (
                    <>
                      <li>1 Risk Profile</li>
                      <li>5 Users</li>
                      <li>Additional Users $80/ann/pp</li>
                    </>
                  )}

                  {index === 1 && (
                    <>
                      <li>Up to 5 Risk Profiles</li>
                      <li>10 Users</li>
                      <li>Additional Users $120/ann/pp</li>
                    </>
                  )}

                  {index === 2 && (
                    <>
                      <li>Up to 10 Risk Profiles</li>
                      <li>30 Users/Multi-admin</li>
                      <li>10 Additional Users $1,600/ann</li>
                    </>
                  )}
                </ul>

                <button>Choose Plan</button>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/images/logo.png" className="footer-logo-img" alt="Clear Risk Footer Logo" />
            <p>© 2026 CLEARRISK</p>
          </div>

          <div className="footer-social">
            <img src="/images/facebook.png" alt="Facebook" />
            <img src="/images/instagram.png" alt="Instagram" />
            <img src="/images/linkedin.png" alt="LinkedIn" />
            <img src="/images/phone.png" alt="Phone Contact" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;