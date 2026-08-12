import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RulesPortalHeader from "../components/RulesPortalHeader";
import { FaShieldAlt, FaUserCheck, FaSignOutAlt, FaGavel, FaSuitcaseRolling, FaPhoneAlt } from "react-icons/fa";

import "../styles/Rules.css";

function Rules() {
  const hostelRules = [
    {
      id: "01",
      title: "Night Curfew Policy",
      icon: <FaShieldAlt />,
      description: (
        <>
          The hostel main gate closes strictly at <span className="highlight-time">10:30 PM</span>. Any student attempting to enter or exit after this time will be flagged by the automated system and reported to the warden.
        </>
      ),
    },
    {
      id: "02",
      title: "Face Recognition Entry",
      icon: <FaUserCheck />,
      description: "Entry and exit are permitted only via the Face Recognition System. Ensure your face is clearly visible while scanning. Do not wear masks or heavy accessories during the scan.",
    },
    {
      id: "03",
      title: "Access Protocol",
      icon: <FaSignOutAlt />,
      description: "All students must log exit and entry through the portal to maintain accurate campus movement records. Tailgating behind another student is strictly prohibited.",
    },
    {
      id: "04",
      title: "Vacation & Leave Policy",
      icon: <FaSuitcaseRolling />,
      description: "For overnight stays or vacations, an official leave request must be submitted and approved through the portal at least 24 hours prior to departure.",
    },
    {
      id: "05",
      title: "Integrity & Disciplinary Action",
      icon: <FaGavel />,
      description: "Providing false information, tampering with the face scanner, or bypassing security protocols will lead to immediate and strict disciplinary action.",
    },
  ];

  return (
    <div className="rules-page">
      <Navbar showLogin={true} />
      <RulesPortalHeader />

      {/* CONTENT */}
      <div className="rules-container">
        
        <div className="rules-intro">
          <h2>Code of Conduct</h2>
          <p>Please read and adhere to the following security guidelines to ensure a safe environment for everyone.</p>
        </div>

        <div className="rules-grid">
          {hostelRules.map((rule) => (
            <div className="rule-card" key={rule.id}>
              <div className="rule-card-header">
                <div className="rule-number">{rule.id}</div>
                <div className="rule-icon">{rule.icon}</div>
              </div>
              <div className="rule-content">
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* EMERGENCY CONTACT SECTION */}
        <div className="emergency-section">
          <div className="emergency-content">
            <FaPhoneAlt className="emergency-icon" />
            <div>
              <h3>Emergency Assistance</h3>
              <p>If you are locked out after curfew or facing a medical emergency, contact the chief security officer immediately.</p>
            </div>
          </div>
          <button className="emergency-btn">Contact Warden</button>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default Rules;