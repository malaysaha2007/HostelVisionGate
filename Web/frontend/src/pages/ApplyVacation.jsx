import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import StudentPortalHeader from "../components/StudentPortalHeader";
import Footer from "../components/Footer";
import "../styles/ApplyVacation.css";

function ApplyVacation() {
  const navigate = useNavigate();
  const rollNo = localStorage.getItem("roll_no");

  const [student, setStudent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [loadError, setLoadError] = useState(false);

  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    leaveDate: "",
    leaveCampusTime: "",
    returnDate: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/student/profile/${rollNo}`);
        setStudent(res.data.student || null);
        setLogs(res.data.logs || []);

        const vacationRes = await API.get(`/vacation/student/${rollNo}`);
        setVacations(Array.isArray(vacationRes.data) ? vacationRes.data : []);
      } catch (error) {
        console.error(error);
        setLoadError(true);
      }
    };
    if (rollNo) fetchProfile();
  }, [rollNo]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "destination" || name === "reason") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    if (name === "reason") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 100) return;
    }

    const updated = { ...formData, [name]: value };

    if (name === "leaveDate" && updated.returnDate && updated.returnDate < value) {
      updated.returnDate = "";
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.returnDate < formData.leaveDate) {
      alert("Return date cannot be before the leave date.");
      return;
    }

    try {
      await API.post("/vacation/apply", {
        roll_no: student.roll,
        hostel: student.hostel,
        destination: formData.destination,
        leave_date: formData.leaveDate,
        leave_campus_time: formData.leaveCampusTime,
        return_date: formData.returnDate,
        reason: formData.reason,
      });
      alert("Vacation request submitted successfully!");
      navigate("/StudentProfile");
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  if (loadError) {
    return (
      <div className="apply-vacation-page">
        <h2>Something went wrong loading your profile.</h2>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="apply-vacation-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  const latestLog =
    [...logs].sort(
      (a, b) => new Date(a.outTime || a.inTime) - new Date(b.outTime || b.inTime)
    )[0] || null;
  const isInside = latestLog ? !!latestLog.inTime : true;
  const statusText = isInside ? "Inside Campus" : "Outside Campus";

  const localDate = new Date();
  const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

  const maxLeaveDate = new Date();
  maxLeaveDate.setDate(maxLeaveDate.getDate() + 7);
  const maxDate = maxLeaveDate.toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate =
    tomorrow.getFullYear() +
    "-" +
    String(tomorrow.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(tomorrow.getDate()).padStart(2, "0");


  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const pendingVacation = vacations.find(
    (vacation) => vacation.hostel_status === "Pending"
  );
  const isPending = !!pendingVacation;

  const activeVacation = vacations.find((vacation) => {
    if (vacation.hostel_status !== "Approved") return false;

    const leaveDate = new Date(vacation.leave_date);
    const returnDate = new Date(vacation.return_date);
    leaveDate.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);

    return todayDate >= leaveDate && todayDate <= returnDate;
  });
  const isOnVacation = !!activeVacation;

  return (
    <>
      <Navbar showLogout={true} />
      <StudentPortalHeader
        student={student}
        logs={logs}
        showProfile={true}
        showVacationButtons={false}
      />

      <div className="apply-vacation-page">
        <div className="vacation-container">
          <div className="vacation-header">
            <div className="header-text">
              <h1>Apply For Vacation</h1>
              <p>Submit your vacation details and await approval.</p>
            </div>
          </div>

          <div className="student-profile-card">
            <div className="profile-img-wrapper">
              <img
                src={
                  student.face_images?.length
                    ? student.face_images[0]
                    : "https://ui-avatars.com/api/?name=Aditi+Chouhan&background=0D8ABC&color=fff"
                }
                alt="Student"
              />
            </div>
            <div className="profile-details">
              <h2>{student.name}</h2>
              <p className="roll-number">{student.roll}</p>
              <p>
                {student.branch} • {student.hostel}
              </p>
              <span className={`campus-status-badge ${isInside ? "inside" : "outside"}`}>
                {statusText}
              </span>
            </div>
          </div>

          {isPending ? (
           <div className="vacation-locked-message pending">
              <div className="pending-icon">⏳</div>

              <div className="pending-content">
                <div className="pending-title">
                  <span>Vacation Approval Pending</span>
                  <span className="pending-badge">PENDING</span>
                </div>

                <p>
                  Your vacation request to <strong>{pendingVacation.destination}</strong> is
                  waiting for hostel approval.
                </p>

                <p className="pending-note">
                  You can't submit a new request until your current request has been reviewed.
                </p>
              </div>
            </div>
          ) : isOnVacation ? (
            <div className="vacation-locked-message approved">
              <div className="approved-icon">✓</div>

              <div className="approved-content">
                <div className="approved-title">
                  <span>Vacation Approved</span>
                  <span className="approved-badge">APPROVED</span>
                </div>

                <p>
                  You are currently on an approved vacation
                  {activeVacation?.return_date
                    ? ` until ${activeVacation.return_date}`
                    : ""}.
                </p>

                <p className="approved-note">
                  You can apply for a new vacation once you return to campus.
                </p>
              </div>
            </div>
          ) : (
            <div className="form-container">
              <form className="vacation-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Enter destination"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time of Leaving Campus</label>
                  <input
                    type="time"
                    name="leaveCampusTime"
                    value={formData.leaveCampusTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Leave Date</label>
                  <input
                    type="date"
                    name="leaveDate"
                    value={formData.leaveDate}
                    onChange={handleChange}
                    min={today}
                    max={maxDate}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    min={
                      formData.leaveDate
                        ? new Date(
                            new Date(formData.leaveDate).setDate(
                              new Date(formData.leaveDate).getDate() + 1
                            )
                          )
                            .toISOString()
                            .split("T")[0]
                        : tomorrowDate
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    rows="4"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for vacation"
                    required
                  />
                  <div className="word-count">
                    {formData.reason.trim().split(/\s+/).filter(Boolean).length} / 100 words
                  </div>
                </div>

                <div className="submit-area">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate("/StudentProfile")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ApplyVacation;