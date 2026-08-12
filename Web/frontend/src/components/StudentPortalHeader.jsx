import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/AllPortalHeader.css";
import PortalHeader from "./PortalHeader";


function StudentPortalHeader({
  student,
  logs = [],
  showProfile = true,
  showVacationButtons = true
}) {
  const navigate = useNavigate();

  const handleLogout = () => {

  localStorage.clear();

  sessionStorage.clear();

  navigate("/");

};


  const [showMenu, setShowMenu] =
    useState(false);

  const menuRef = useRef(null);

  const studentImage =
    student?.face_images?.length > 0
      ? student.face_images[0]
      : null;

  let isInsideCampus = true;

  if (logs.length > 0) {
    const latestLog = [...logs].sort((a, b) => {
      const aTime = new Date(
        a.outTime || a.inTime || 0
      );

      const bTime = new Date(
        b.outTime || b.inTime || 0
      );

      return bTime - aTime;
    })[0];

    isInsideCampus =
      latestLog.inTime &&
      latestLog.inTime.trim() !== "-";
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleChangePassword = () => {
    alert("Navigate to Change Password Page");
    setShowMenu(false);
  };

  return (
    <PortalHeader
      icon="🎓"
      title="Student Portal"
      subtitle="View Profile & Monitor Status"
      rightContent={
        showProfile && (
          <div
            className="student-avatar-wrapper"
            ref={menuRef}
          >
            <div className="vacation-avatar">

              {showVacationButtons && (
                <div className="vacation-bothButtons">

                  <button
                    className="vacation"
                    onClick={() =>
                      navigate("/student/apply-vacation")
                    }
                  >
                    Apply for Vacation
                  </button>

                  <button
                    className="vacation"
                    onClick={() =>
                      navigate("/student/vacation-status")
                    }
                  >
                    Vacation Status
                  </button>

                </div>
              )}

              <div
                className="student-header-avatar"
                onClick={() =>
                  setShowMenu(!showMenu)
                }
              >
                {studentImage ? (
                  <img
                    src={studentImage}
                    alt="Student"
                    className="student-header-image"
                  />
                ) : (
                  <div className="student-header-fallback">
                    
                  </div>
                )}

                <span
                  className={`status-dot ${
                    isInsideCampus
                      ? "status-green"
                      : "status-red"
                  }`}
                />
              </div>
            </div>

            
          </div>
        )
      }
    />
  );
}

export default StudentPortalHeader;