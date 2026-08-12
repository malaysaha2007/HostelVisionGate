import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaSyncAlt } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostelPortalHeader from "../components/HostelPortalHeader";

import API from "../services/api";

import "../styles/StudentStatusPage.css";

function StudentStatusPage() {
  const { type } = useParams();
  const location = useLocation();

  const hostel = location.state?.hostel || "Hostel 1";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDenyBox, setShowDenyBox] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [vacationFilter, setVacationFilter] = useState("Pending");
  const [selectedRequest, setselectedRequest] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [type]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await API.get(`/hostel/logs/${hostel}`);
      const data = response.data;

      // =========================
      // OUTSIDE
      // =========================
      if (type === "outside") {
        const outsideData = data.outsideStudents.map((student) => ({
          ...student,
          status: "OUTSIDE",
        }));
        setStudents(outsideData);
      }
      // =========================
      // CURFEW
      // =========================
      else if (type === "curfew") {
        const curfewData = data.curfewStudents.map((student) => ({
          ...student,
          status: "CURFEW",
        }));
        setStudents(curfewData);
      }
      // =========================
      // LEAVE
      // =========================
      else if (type === "leave") {
        const leaveData = data.leaveStudents.map((student) => ({
          ...student,
          status: "LEAVE",
        }));
        setStudents(leaveData);
      }
      // =========================
      // VACATION
      // =========================
      else if (type === "vacation") {
        const response = await API.get(`/vacation/${hostel}`);
        const vacationData = response.data.map((request) => ({
          ...request,
          status: request.hostel_status,
        }));
        setStudents(vacationData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setRefreshing(false);
      }, 300);
    }
  };

  // =========================
  // PAGE TITLE
  // =========================
  const getTitle = () => {
    if (type === "outside") {
      return "Students Outside Campus";
    }
    if (type === "curfew") {
      return "Outside After Curfew";
    }
    if (type === "leave") {
      return "Leave / Special Purpose";
    }
    if (type === "vacation") {
      return "Vacation Applications";
    }
    return "Student Status";
  };

  const handleApprove = async (applicationId) => {
    try {
      await API.put(`/vacation/approve/${applicationId}`);
      setselectedRequest(null);
      setShowDenyBox(false);
      setDenyReason("");
      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeny = async (applicationId) => {
    if (!denyReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    try {
      await API.put(`/vacation/deny/${applicationId}`, {
        denialReason: denyReason,
      });
      setselectedRequest(null);
      setShowDenyBox(false);
      setDenyReason("");
      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents =
    type === "vacation"
      ? students
          .filter((request) => request.hostel_status === vacationFilter)
          .sort((a, b) => b._id.localeCompare(a._id))
      : students;

  return (
    <div className={`student-status-page ${refreshing ? "page-refresh" : ""}`}>
      {/* NAVBAR */}
      <Navbar showLogout={true} />
      <HostelPortalHeader />

      {/* TITLE */}
      <div className="status-title-section">
        <h1>{getTitle()}</h1>
        <p>{hostel}</p>
      </div>

      {/* CONTENT */}
      <div className="status-container">
        <div className="status-card">
          {/* SEARCH */}
          <div className="status-topbar">
            <input
              type="text"
              placeholder="Search by Name, Roll Number or Room..."
            />
            <button
              className="icon-btn"
              onClick={loadStudents}
              disabled={refreshing}
              title="Refresh"
            >
              <FaSyncAlt className={refreshing ? "spin-icon" : ""} />
            </button>
          </div>

          {/* COUNT */}
          <div className="status-count">
            Showing {type === "vacation" ? filteredStudents.length : students.length} Students
          </div>

          {type === "vacation" && (
            <div className="vacation-filters">
              <button
                className={vacationFilter === "Pending" ? "active-filter" : ""}
                onClick={() => setVacationFilter("Pending")}
              >
                Pending
              </button>
              <button
                className={vacationFilter === "Approved" ? "active-filter" : ""}
                onClick={() => setVacationFilter("Approved")}
              >
                Approved
              </button>
              <button
                className={vacationFilter === "Denied" ? "active-filter" : ""}
                onClick={() => setVacationFilter("Denied")}
              >
                Denied
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="table-wrapper">
            <table>
              <thead>
                {type === "vacation" ? (
                  <tr>
                    <th style={{ width: "16.66%" }}>Roll No</th>
                    <th style={{ width: "16.66%" }}>Destination</th>
                    <th style={{ width: "16.66%" }}>Leave Date</th>
                    <th style={{ width: "16.66%" }}>Return Date</th>
                    <th style={{ width: "16.66%" }}>Reason</th>
                    <th style={{ width: "16.66%" }}>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th style={{ width: "20%" }}>Roll No</th>
                    <th style={{ width: "20%" }}>Purpose</th>
                    <th style={{ width: "20%" }}>OUT Time</th>
                    <th style={{ width: "20%" }}>IN Time</th>
                    <th style={{ width: "20%" }}>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={type === "vacation" ? 6 : 5}>Loading...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={type === "vacation" ? 6 : 5}>No Data Found</td>
                  </tr>
                ) : type === "vacation" ? (
                  filteredStudents.map((request, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        setselectedRequest(request);
                        setShowDenyBox(false);
                        setDenyReason("");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{request.roll_no}</td>
                      <td>{request.destination}</td>
                      <td>{request.leave_date}</td>
                      <td>{request.return_date}</td>
                      <td>{request.reason}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            request.hostel_status === "Approved"
                              ? "status-approved"
                              : request.hostel_status === "Denied"
                              ? "status-denied"
                              : "status-pending"
                          }`}
                        >
                          {request.hostel_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  students.map((student, index) => (
                    <tr key={index}>
                      <td>{student.roll}</td>
                      <td>{student.purpose || "-"}</td>
                      <td>{student.outTime || "-"}</td>
                      <td>{student.inTime || "-"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            student.status === "OUTSIDE"
                              ? "status-out"
                              : student.status === "CURFEW"
                              ? "status-curfew"
                              : "status-leave"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="vacation-modal-overlay">
          <div className="vacation-modal">
            <h2>{selectedRequest.roll_no}</h2>
            <div className="vacation-modal-details">
              <div className="detail-card">
                <strong>Destination</strong>
                <span>{selectedRequest.destination}</span>
              </div>
              <div className="detail-card">
                <strong>Leave Date</strong>
                <span>{selectedRequest.leave_date}</span>
              </div>
              <div className="detail-card">
                <strong>Return Date</strong>
                <span>{selectedRequest.return_date}</span>
              </div>
              <div className="detail-card" style={{ gridColumn: "1 / -1" }}>
                <strong>Reason</strong>
                <span>{selectedRequest.reason}</span>
              </div>
            </div>

            {showDenyBox && (
              <div className="deny-section">
                <label>Reason for Rejection</label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  placeholder="Write reason..."
                />
                <button
                  className="confirm-deny-btn"
                  onClick={() => handleDeny(selectedRequest._id)}
                >
                  Confirm Rejection
                </button>
              </div>
            )}

            <div className="vacation-modal-actions">
              {selectedRequest.hostel_status !== "Approved" && (
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(selectedRequest._id)}
                >
                  Approve
                </button>
              )}
              {selectedRequest.hostel_status !== "Denied" && (
                <button
                  className="deny-btn"
                  onClick={() => setShowDenyBox(true)}
                >
                  Deny
                </button>
              )}
              <button
                className="close-btn"
                onClick={() => {
                  setselectedRequest(null);
                  setShowDenyBox(false);
                  setDenyReason("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default StudentStatusPage;