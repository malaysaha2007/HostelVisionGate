import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/AllPortalHeader.css";
import PortalHeader from "./PortalHeader";

import { FaUserCircle } from "react-icons/fa";

function AdminPortalHeader({
  admin,
  showLogout,
  showProfile = true,
})

{
  return (
    <PortalHeader
      icon="🛡️"
      title="Administration Portal"
      subtitle="Manage Students, Logs & Curfew System"
      rightContent={


        
      <div className="portal-user-wrapper">
         <div className="portal-user">
          
       {showProfile && (
  <div className="profile-card">
    <div className="profile-details">

      <FaUserCircle className="profile-icon" />

      <div className="profile-name">
        {admin?.username || "Administrator"}
      </div>

    </div>
  </div>
)}
          </div>

         
        </div>
      }
    />
  );
}

export default AdminPortalHeader;