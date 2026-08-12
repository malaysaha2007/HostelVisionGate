import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import "../styles/VacationStatus.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StudentPortalHeader from "../components/StudentPortalHeader";

import {
  FaUser,
  FaIdCard,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUmbrellaBeach,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaPlaneDeparture,
  FaHome,
  FaUniversity,
  FaStickyNote,
  FaPlay
} from "react-icons/fa";


function VacationStatus() {
  const navigate = useNavigate();
  const rollNo = localStorage.getItem("roll_no");

  const [student, setStudent] = useState(null);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);


      const getVacationStatusClass = (vac) => {
  // Denied
  if (
    vac.hostel_status === "Denied" ||
    vac.gate_status === "Denied"
  ) {
    return "denied";
  }

  // Active (Student is currently on vacation)
  if (vac.vacation_status === "ACTIVE") {
    return "active";
  }

  // Completed
  if (vac.vacation_status === "COMPLETED") {
    return "completed";
  }

  // Pending
  return "pending";
};



const getHostelStatusClass = (status) => {
  switch (status) {
    case "Approved":
      return "approved";

    case "Denied":
      return "denied";

    case "Pending":
    default:
      return "pending";
  }
};

const getGateStatusClass = (status) => {
  switch (status) {
    case "Approved":
      return "approved";

    case "Denied":
      return "denied";

    case "Not Requested":
      return "not-requested";

    case "Pending":
      return "pending";

    default:
      return "pending";
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await API.get(`/student/profile/${rollNo}`);
        setStudent(studentRes.data.student || null);

        const vacationRes = await API.get(`/vacation/student/${rollNo}`);
        setVacations((vacationRes.data || []).reverse());
      } catch (error) {
        console.error("Error fetching vacation data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (rollNo) {
      fetchData();
    }
  }, [rollNo]);

  return (
    <div className="vacation-status-page">
      <Navbar showLogout={true} />

      {student && (
        <StudentPortalHeader
          student={student}
          logs={vacations}
          showVacationButtons={false}
        />
      )}

      <div className="vacation-container">
        
        {/* HERO SECTION - Picture Removed */}
        <div className="vacation-hero">
          <div className="hero-left">
            <div>
              <h1>Vacation Status</h1>
              <p>Track all your vacation requests and approval status.</p>
            </div>
          </div>
          <div className="button-area">
            <button onClick={() => navigate(-1)} className="back-btn">
              ← Back
            </button>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="student-profile-card">
          <div className="profile-image">
            {student?.face_images?.length > 0 ? (
              <img src={student.face_images[0]} alt={student.name} />
            ) : (
              <div className="profile-placeholder">
                {student?.name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2>{student?.name}</h2>
            <p className="roll-number">{student?.roll_no}</p>
            <p className="course-info">{student?.branch} • {student?.hostel}</p>
            <div className="campus-status">
              <span>Inside Campus</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="summary-icon briefcase">
              <FaBriefcase />
            </div>
            <div>
              <h2>{vacations.length}</h2>
              <p>Total Requests</p>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="summary-icon clock">
              <FaClock />
            </div>
            <div>
              <h2>
                {
                  vacations.filter(
                    (v) =>
                      v.hostel_status === "Pending" ||
                      v.gate_status === "Pending"
                  ).length
                }
              </h2>
              <p>Pending</p>
            </div>
          </div>

          <div className="summary-card approved">
            <div className="summary-icon check">
              <FaCheckCircle />
            </div>
            <div>
              <h2>
                {
                  vacations.filter(
                    (v) =>
                      v.hostel_status === "Approved" &&
                      v.gate_status === "Approved"
                  ).length
                }
              </h2>
              <p>Approved</p>
            </div>
          </div>

          <div className="summary-card rejected">
            <div className="summary-icon reject">
              <FaTimesCircle />
            </div>
            <div>
              <h2>
                {
                  vacations.filter(
                    (v) =>
                      v.hostel_status === "Denied" ||
                      v.gate_status === "Denied"
                  ).length
                }
              </h2>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="vacation-list">
          <div className="vacation-table-header">
            <span>Destination</span>
            <span>Leave Date</span>
            <span>Return Date</span>
          </div>

          {loading ? (
            <div className="empty-state">Loading requests...</div>
          ) : vacations.length === 0 ? (
            <div className="empty-state">No vacation requests found.</div>
          ) : (
            vacations.map((vac, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`vacation-item ${isOpen ? "open" : ""}`}
                >
                  <div
                    className="vacation-row"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <div className="destination">
                      {isOpen ? "" : <FaPlay className="play-icon" />}
                      <FaMapMarkerAlt className="row-icon" />
                      <span>{vac.destination || "-"}</span>
                    </div>

                    <div className="date-box">
                      <FaCalendarAlt />
                      <span>{vac.leave_date || vac.leaveDate || "-"}</span>
                    </div>

                    <div className="date-box">
                      <FaCalendarAlt />
                      <span>{vac.return_date || vac.returnDate || "-"}</span>
                    </div>

                    <div className="expand-icon">
                      {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="vacation-details">
                      <div className="submitted-date">
                        Submitted on <strong>{vac.created_at || "-"}</strong>
                      </div>

                      <div className="details-cards">
                        <div className="detail-card">
                          <div className="detail-icon reason-icon">
                            <FaStickyNote />
                          </div>
                          <div>
                            <h4>{vac.reason || "-"}</h4>
                            <p>Reason</p>
                          </div>
                        </div>

                        <div className="detail-card">
                          <div className="detail-icon time-icon">
                            <FaClock />
                          </div>
                          <div>
                            <h4>{vac.leave_campus_time || "-"}</h4>
                            <p>Campus Leaving Time</p>
                          </div>
                        </div>
                      </div>

                      <div className="status-cards">
                        <div
                          className={`status-card hostel ${getHostelStatusClass(
                            vac.hostel_status
                          )}`}
                        >
                          <div className="status-icon">
                            <FaHome />
                          </div>
                          <div>
                            <h3>{vac.hostel_status || "Pending"}</h3>
                            <p>Hostel Status</p>
                          </div>
                        </div>

                        <div
                          className={`status-card gate ${getGateStatusClass(
                            vac.gate_status
                          )}`}
                        >
                          <span className="gate-right-dot"></span>
                          <div className="status-icon">
                            <FaUniversity />
                          </div>
                          <div>
                            <h3>{vac.gate_status || "Not Requested"}</h3>
                            <p>Gate Status</p>
                          </div>
                        </div>

                        <div
                          className={`status-card vacation-status ${getVacationStatusClass(
                            vac
                          )}`}
                        >
                          <div className="status-icon">
                            <FaPlaneDeparture />
                          </div>
                          <div>
                            <h3>
                              {(vac.vacation_status || "NOT_STARTED")
                                .replaceAll("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </h3>
                            <p>Vacation Status</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default VacationStatus;