import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="global-footer">

      <div className="footer-card">

        <div className="footer-top">

          <div className="footer-brand">

            <h2 className="footer-logo">
              VisionGate
            </h2>

            <p className="footer-description">
              AI-powered Student Entry–Exit Management System
              developed for secure hostel and campus monitoring.
              Designed to improve safety, transparency, and
              administrative efficiency.
            </p>

          </div>

          <div className="footer-links">

            <div className="footer-column">
              <h4>Institute</h4>
              <a href="/">PDPM IIITDM Jabalpur</a>
            </div>

            <div className="footer-column">
              <h4>Development Team</h4>
              <a href="/">Malay</a>
              <a href="/">Manvendra</a>
              <a href="/">Aditi</a>
            </div>

            <div className="footer-column">
              <h4>Project Guide</h4>
              <a href="/">Dr. Ashish Singh Parihar</a>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <a href="/">Home</a>
              <a href="/">About</a>
              <a href="/">Contact</a>
            </div>

          </div>

        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">

          <p>
            © 2026 VisionGate. All Rights Reserved.
          </p>

          <div className="footer-meta">
            <span>Version 1.0</span>
            <span>Campus Safety Initiative</span>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;