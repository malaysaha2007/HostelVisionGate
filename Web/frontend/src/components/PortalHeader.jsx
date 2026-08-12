import { useRef, useState, useEffect } from "react";

import "../styles/AllPortalHeader.css";

function PortalHeader({
  icon,
  title,
  subtitle,
  rightContent,
}) {
  return (
    <div className="portal-hero">
      <div className="portal-header-layout">

        <div className="portal-left">

          <div className="portal-hero-icon">
            {icon}
          </div>

          <div className="portal-text">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

        </div>

        <div className="portal-right">
          {rightContent}
        </div>

      </div>
    </div>
  );
}

export default PortalHeader;