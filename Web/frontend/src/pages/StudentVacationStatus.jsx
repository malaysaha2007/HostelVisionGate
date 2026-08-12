import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StudentPortalHeader from "../components/StudentPortalHeader";

import API from "../services/api";

import "../styles/StudentVacationStatus.css";

function StudentVacationStatus() {
  
  const [vacations, setVacations] = useState([]);
  const [logs, setLogs] = useState([]);
  const rollNo = localStorage.getItem("roll_no");
  const [student, setStudent] = useState(null);
  const [vacationFilter, setVacationFilter] = useState("Pending");

   useEffect(() => {

    const fetchProfile = async () => {

      try {

        const res = await API.get(`/student/profile/${rollNo}`);
        
        setStudent(res.data.student || null);
        
        setLogs(res.data.logs || []);
      
      } catch (error) {
        console.error(error);
      }
    };

    if (rollNo) fetchProfile();
    }, [rollNo]);


   useEffect(() => {

    if (!student?.roll) return;

    const fetchVacationStatus = async () => {
    
      try {
    
        const res = await API.get(`/vacation/student/${student.roll}`);

        const vacationData = res.data.map((request) => ({ ...request }));

        setVacations(vacationData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVacationStatus();
  }, [student]); 


const filteredVacations =

    vacations.filter(
        (request) =>
          request.status === vacationFilter
    )



  return (
    <div className="vacation-status-page">
      <Navbar showLogout />

      <StudentPortalHeader
        student={student}
        logs={logs}
        showProfile={true}
        showVacationButtons={false}
      />

      <div className="vacation-status-container">
        <h1 className="table-title">Vacation Status</h1>
        
        {/* COUNT */}
          <div className="status-count">
            Showing {filteredVacations.length
            } Records
          </div>
        
          <div className="vacation-filters">

          <button
            className={
              vacationFilter === "Pending"
                ? "active-filter"
                : ""
            }
            onClick={() =>
              setVacationFilter("Pending")
            }
          >
            Pending
          </button>

          <button
            className={
              vacationFilter === "Approved"
                ? "active-filter"
                : ""
            }
            onClick={() =>
              setVacationFilter("Approved")
            }
          >
            Approved
          </button>

          <button
            className={
              vacationFilter === "Denied"
                ? "active-filter"
                : ""
            }
            onClick={() =>
              setVacationFilter("Denied")
            }
          >
            Denied
          </button>

      </div>

        <div className="table-wrapper">
         <table>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Leave Date</th>
                  <th>Return Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  { vacationFilter ==="Denied" && <th>Denial Reason</th> } 
                </tr>
              </thead>
              <tbody>
                {filteredVacations.length === 0 ? (
                  <tr>
                    <td colSpan="5">No records found.</td>
                  </tr>
                ) : (
                  filteredVacations.map((request, index) => (
                    <tr key={index}>
                      <td>{request.destination}</td>
                      <td>{request.leave_date}</td>
                      <td>{request.return_date}</td>
                      <td>{request.reason}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            request.status === "Approved"
                              ? "status-approved"
                              : request.status === "Denied"
                              ? "status-denied"
                              : "status-pending"
                          }`}
                        >
                          {request.status}
                        </span>

                    </td>
                    <td>
                      {vacationFilter === "Denied" && (
                        <p>{request.denyReason || "No reason provided"}</p>
                      )}
                    </td>

                  </tr>


                  ))

              )}
              
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StudentVacationStatus;