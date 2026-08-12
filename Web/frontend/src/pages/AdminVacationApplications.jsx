import { useEffect, useState } from "react";
import {
  FaSyncAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPortalHeader from "../components/AdminPortalHeader";

import API from "../services/api";

import "../styles/StudentStatusPage.css";

function AdminVacationApplications() {

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

   const [vacationFilter, setVacationFilter] =
  useState("Pending");

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    loadApplications();

  }, []);

  const [selectedRequest,
  setSelectedRequest] =
  useState(null);

const [showDenyBox,
  setShowDenyBox] =
  useState(false);

const [denyReason,
  setDenyReason] =
  useState("");

  const loadApplications = async () => {

    try {

      setLoading(true);
      setRefreshing(true);

      const response =
  await API.get("/vacation");

      console.log("Vacation API Response:", response.data);

      setApplications(
        response.data || []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

      setTimeout(() => {

        setRefreshing(false);

      }, 300);
    }
  };


  


const handleGateApprove = async (applicationId) => {

  try {

    await API.put(
      `/vacation/gate-approve/${applicationId}`
    );

    await loadApplications();

    setSelectedRequest(null);

  } catch (error) {

    console.error(error);

  }
};




const handleGateDeny = async (applicationId) => {

  try {

    await API.put(
      `/vacation/gate-deny/${applicationId}`
    );

    await loadApplications();

    setSelectedRequest(null);

  } catch (error) {

    console.error(error);

  }
};




    const filteredApplications =
  applications
    .filter(
      (app) =>
        app.gate_status === vacationFilter
    )
    .filter((app) => {
      const query =
        search.toLowerCase();

      return (
        (app.roll_no || "")
          .toLowerCase()
          .includes(query) ||
        (app.destination || "")
          .toLowerCase()
          .includes(query) ||
        (app.reason || "")
          .toLowerCase()
          .includes(query)
      );
    });

  return (

    <div
      className={`student-status-page ${
        refreshing
          ? "page-refresh"
          : ""
      }`}
    >

      <Navbar showLogout={true} />

      <AdminPortalHeader />

      <div className="status-title-section">

        <h1>
          All Vacation Applications
        </h1>

        <p>
          Admin Portal
        </p>

      </div>

      <div className="status-container">

        <div className="status-card">

          <div className="status-topbar">

            <div className="status-search">

              <input
                type="text"
                placeholder="Search by Roll Number, Destination or Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                className="icon-btn"
                onClick={loadApplications}
                disabled={refreshing}
              >
                <FaSyncAlt
                  className={refreshing ? "spin-icon" : ""}
                />
              </button>

            </div>

          </div>

          <div className="vacation-toolbar">

            <div className="status-count">

              Showing
              <strong>
                {filteredApplications.length}
              </strong>
              Vacation Applications

            </div>

            <div className="vacation-filters">

              <button
                className={
                  vacationFilter === "Pending"
                    ? "active-filter"
                    : ""
                }
                onClick={() => setVacationFilter("Pending")}
              >
                <FaClock />
                Pending
              </button>

              <button
                className={
                  vacationFilter === "Approved"
                    ? "active-filter"
                    : ""
                }
                onClick={() => setVacationFilter("Approved")}
              >
                <FaCheckCircle />
                Approved
              </button>

              <button
                className={
                  vacationFilter === "Denied"
                    ? "active-filter"
                    : ""
                }
                onClick={() => setVacationFilter("Denied")}
              >
                <FaTimesCircle />
                Denied
              </button>

            </div>

          </div>
          <div className="toolbar-divider"></div>
          <div className="table-wrapper">

            <table className="vacation-table">

              <thead>

              <tr>

              <th>Roll No</th>

              <th>Destination</th>

              <th>Leave Date</th>

              <th>Return Date</th>

              <th>Reason</th>

              <th>Hostel Status</th>

              <th>Gate Status</th>

              </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                    >
                      Loading...
                    </td>

                  </tr>

                ) : filteredApplications.length === 0 ? (

                  <tr>

                    <td colSpan="7" className="empty-row">
                    <div className="empty-state">
                    📄
                    <h3>No Vacation Applications</h3>
                    <p>
                    No applications match the current filter.
                    </p>
                    </div>
                    </td>
                  </tr>

                ) : (

                  filteredApplications.map(
                    (
                      application,
                      index
                    ) => (

                     <tr
  key={index}
  onClick={() => {
    setSelectedRequest(
      application
    );
    setShowDenyBox(false);
  }}
  style={{
    cursor: "pointer"
  }}
>

                        <td>
                          {
                            application.roll_no
                          }
                        </td>

                        <td>
                          {
                            application.destination
                          }
                        </td>

                        <td>
                          {
                            application.leave_date
                          }
                        </td>

                        <td>
                          {
                            application.return_date
                          }
                        </td>

                        <td>
                          {
                            application.reason
                          }
                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              application.hostel_status ===
                              "Approved"
                                ? "status-approved"
                                : application.hostel_status ===
                                  "Denied"
                                ? "status-denied"
                                : "status-pending"
                            }`}
                          >
                            {
                              application.hostel_status
                            }
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              application.gate_status ===
                              "Approved"
                                ? "status-approved"
                                : application.gate_status ===
                                  "Denied"
                                ? "status-denied"
                                : "status-pending"
                            }`}
                          >
                            {
                              application.gate_status
                            }
                          </span>

                        </td>

                      </tr>
                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {selectedRequest && (

  <div className="vacation-modal-overlay">

    <div className="vacation-modal">

      <h2>
          Vacation Request
      </h2>

      <p className="request-id">
          {selectedRequest.roll_no}
      </p>

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

        <div className="detail-card">
          <strong>Hostel Status</strong>
          <span>{selectedRequest.hostel_status}</span>
        </div>

        <div className="detail-card">
          <strong>Gate Status</strong>
          <span>{selectedRequest.gate_status}</span>
        </div>

        <div
          className="detail-card"
          style={{ gridColumn: "1 / -1" }}
        >
          <strong>Reason</strong>
          <span>{selectedRequest.reason}</span>
        </div>

      </div>

      <div className="vacation-modal-actions">

        {selectedRequest.gate_status !== "Approved" && (
          <button
            className="approve-btn"
            onClick={() =>
              handleGateApprove(
                selectedRequest._id
              )
            }
          >
            Approve Gate Pass
          </button>
        )}

        {selectedRequest.gate_status !== "Denied" && (
          <button
            className="deny-btn"
            onClick={() =>
              handleGateDeny(
                  selectedRequest._id
              )
            }
          >
            Deny Gate Pass
          </button>
        )}

        <button
          className="close-btn"
          onClick={() =>
            setSelectedRequest(null)
          }
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

export default AdminVacationApplications;