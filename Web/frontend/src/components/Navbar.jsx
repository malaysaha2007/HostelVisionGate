import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FaPowerOff } from "react-icons/fa";

function Navbar({
  admin,
  showLogin = false,
  showActivityLogs = false,
  showAdminDashboard = false,
  showLogout = false,
})

{
  const navigate = useNavigate();

 const handleLogout = () => {
  navigate("/", { replace: true });
};

  return (
    <div className="navbar-wrap">
      <div className="navbar">
        <Link to="/" className="brand-link">

  <div className="brand">

    <div className="brand-logo">
      <img
        src="/Iiitdmj_logo.jpg"
        alt="College Logo"
      />
    </div>

    <div className="brand-text">

      <div className="brand-title">
        VisionGate
      </div>

      <div className="brand-subtitle">
        Smart Entry–Exit Monitoring System
      </div>

    </div>

  </div>

</Link>

        <div className="nav-center">
          <nav className="nav-links">
            

            <Link to="/">
              Home
            </Link>
            
            <Link to="/Rules">
              Rules
            </Link>

            <Link to="/Contact">
              Contact
            </Link>

            <Link to="/AboutVisionGate">
              About Us
            </Link>

            {showActivityLogs && (
             <Link
  to="/activity-logs"
  state={{ admin }}
>
  Activity Logs
</Link>
            )}

            {showAdminDashboard && (
             <Link
  to="/admin-dashboard"
  state={{ admin }}
>
  Dashboard
</Link>
            )}
{showLogin && (
  <div className="dropdown">

    <a href="#">
      Login
      <span className="arrow"></span>
    </a>

    <div className="dropdown-menu">

    <Link to="/AdminLogin">
        Admin Login
      </Link>

       <Link to="/HostelLogin">
        Hostel Login
      </Link>

      <Link to="/StudentLogin">
        Student Login
      </Link>

      

    </div>

  </div>
)}
          </nav>
        </div>

        {showLogout && (
          <button
  className="nav-logout-btn"
  onClick={handleLogout}
  title="Logout"
>
  <FaPowerOff className="logout-icon" />
</button>
        )}
      </div>
    </div>
  );
}

export default Navbar;