import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FaSyncAlt,
  FaEnvelope,
  FaFileCsv,
  FaUsers,
  FaClipboard,
  FaUser,
  FaCalendarAlt,
  FaMugHot,
  FaPaperPlane,
  FaPlaneDeparture,
  FaHospital,
  FaBriefcase,
  FaHome,
  FaQuestionCircle,
  FaCartArrowDown
} from "react-icons/fa";

import "../styles/AdminDashboard.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPortalHeader from "../components/AdminPortalHeader";

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const admin = location.state?.admin;

  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [studentsOutside, setStudentsOutside] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);
  const [leaveFilter, setLeaveFilter] = useState("Pending");
  
  const getPurposeIcon = (purpose) => {
  switch (purpose) {
    case "Hospital":
    case "Medical":
      return <FaHospital />;

    case "Vacation":
      return <FaPlaneDeparture />;

    case "Official Work":
      return <FaBriefcase />;

    case "Market":
      return <FaCartArrowDown />;

    case "Home":
      return <FaHome />;

    case "Tea Break":
      return <FaMugHot />;

    default:
      return <FaQuestionCircle />;
  }
};

  const hostels = [
    "All",
    "Hostel 1",
    "Hostel 2",
    "Hostel 3",
    "Hostel 4",
    "Hostel 5",
  ];

  const fetchDashboard = async () => {
  setRefreshing(true);

  try {
    const response = await API.get("/admin/dashboard");

    const dashboardLogs = response.data.logs || [];

    setLogs(dashboardLogs);

    setTotalRecords(
      response.data.total_records || 0
    );

   

    setStudentsOutside(
      response.data.students_outside || 0
    );

    const leaveStudents = dashboardLogs.filter(
      (log) =>
        log.purpose === "Hospital" ||
        log.purpose === "Medical" ||
        log.purpose === "Leave" ||
        log.purpose === "Special Leave"
    );

    setLeaveCount(leaveStudents.length);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);

    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  }
};

  const exportCSV = () => {
    const headers = [
      "Name",
      "Roll",
      "Room",
      "Purpose",
      "Out Time",
      "In Time",
      "Status"
    ];

    const rows = filteredLogs.map((log) => [
      log.name,
      log.roll,
      log.room,
      log.purpose,
      log.outTime,
      log.inTime || "-",
      log.inTime ? "IN" : "OUT"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student_records.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesHostel =
      selectedHostel === "All" ||
      log.hostel === selectedHostel;

    const query = search.toLowerCase();

    const matchesSearch =
      (log.roll || "").toLowerCase().includes(query) ||
      (log.purpose || "").toLowerCase().includes(query);

    return matchesHostel && matchesSearch;
  });

  if (!admin) {
    return (
      <>
        <Navbar />
        <AdminPortalHeader />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar
        admin={admin}
        showActivityLogs={true}
        showLogout={true}
      />

      <AdminPortalHeader admin={admin} />

      <div
        className={`admin-dashboard-page ${
          refreshing ? "page-refresh" : ""
        }`}
      >
        <div className="stats-grid">
          <div className="stat-card">
  <div className="icon-box clipboard">
    <FaClipboard />
  </div>

  <div className="stat-info">
    <p>Total Records</p>
    <h2>{totalRecords}</h2>
  </div>

  <div className="graph blue">
    <svg
      width="80"
      height="40"
      viewBox="0 0 90 40"
      fill="none"
    >
      <path
        d="M2 28
           C12 28,12 10,22 18
           S35 36,45 25
           S58 8,68 20
           S80 18,88 8"
        stroke="#2d7fff"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="88" cy="8" r="3" fill="#2d7fff"/>
    </svg>
  </div>
</div>

        
          <div className="stat-card">
  <div className="icon-box users">
    <FaUsers />
  </div>

  <div className="stat-info">
    <p>Students Outside</p>
    <h2 className="outside">
      {studentsOutside}
    </h2>
  </div>

  <div className="graph red">
    <svg
      width="80"
      height="40"
      viewBox="0 0 90 40"
      fill="none"
    >
      <path
        d="M2 28
           C12 28,12 10,22 18
           S35 36,45 25
           S58 8,68 20
           S80 18,88 8"
        stroke="#a13735"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="88" cy="8" r="3" fill="#a13735"/>
    </svg>
  </div>
</div>
          
          <div
  className="stat-card"
  onClick={() =>
   navigate("/admin-vacations")
  }
  style={{ cursor: "pointer" }}
>
    <div className="icon-box airplane">
    <FaPlaneDeparture />
  </div>
   <div className="stat-info">
  <p>Vacation Applications</p>

  <h2 className="leave-count">
    {leaveCount}
  </h2>
</div>
  <div className="graph blue">
    <svg
      width="80"
      height="40"
      viewBox="0 0 90 40"
      fill="none"
    >
      <path
        d="M2 28
           C12 28,12 10,22 18
           S35 36,45 25
           S58 8,68 20
           S80 18,88 8"
        stroke="#2d7fff"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="88" cy="8" r="3" fill="#2d7fff"/>
    </svg>
  </div>
</div>



        </div>

        <div className="filter-card">
          <div className="filter-top">
            <div>
              <h3>Filter by Hostel</h3>
              <div className="hostel-buttons">
                {hostels.map((hostel) => (
                  <button
                    key={hostel}
                    className={
                      selectedHostel === hostel
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedHostel(hostel)
                    }
                  >
                    {hostel}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={fetchDashboard}
                title="Refresh"
                className="icon-btn refresh"
              >
                <FaSyncAlt />
              </button>

              <button
                onClick={() =>
                  navigate("/curfew-mail", {
                    state: { admin }
                  })
                }
                title="Send Mail"
                className="icon-btn"
              >
                <FaEnvelope />
              </button>

              <button
                onClick={exportCSV}
                title="Export CSV"
                className="icon-btn csv"
              >
                <FaFileCsv />
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by Roll Number, or Purpose..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="search-box"
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Purpose</th>
                <th>Out Time</th>
                <th>In Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-row"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-row"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                filteredLogs.map(
                  (log, index) => (
                    <tr key={index}>

                      <td>
                        <span className="icon-log">
                         <span className="user-icon"> <FaUser/></span>
                        {log.roll}
                        </span>
                        
                        </td>

                      <td>
                        <span className="icon-log">
                          <span className="purpose-icon">
                            {getPurposeIcon(log.purpose)}
                          </span>
                          {log.purpose}
                        </span>
                      </td>

                      <td>
                         <span className="icon-log">
                          <span>
                            <FaCalendarAlt/>
                          </span>
                          {log.outTime}
                        </span>
                        </td>
                      <td>
                        <span className="icon-log">
                          <span>
                            <FaCalendarAlt/>
                          </span>
                          {log.inTime || "-"}
                        </span>
                        
                      </td>
<td>
  <span
    className={
      log.inTime
        ? "status-in"
        : "status-out"
    }
  >
    
    {log.inTime ? "IN" : "OUT"}
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

      <Footer />
    </>
  );
}

export default AdminDashboard;