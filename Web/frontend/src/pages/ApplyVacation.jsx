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
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/student/profile/${rollNo}`);
        setStudent(res.data.student || null);
        setLogs(res.data.logs || []);
      } catch (error) { console.error(error); }
    };
    if (rollNo) fetchProfile();
  }, [rollNo]);

  const [formData, setFormData] = useState({
    reason: "", destination: "", leaveDate: "", leaveCampusTime: "", returnDate: ""
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "destination" || name === "reason") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    if (name === "reason") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 100) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/vacation/apply", {
        roll_no: student.roll, hostel: student.hostel, destination: formData.destination,
        leave_date: formData.leaveDate, leave_campus_time: formData.leaveCampusTime,
        return_date: formData.returnDate, reason: formData.reason
      });
      alert("Vacation request submitted successfully!");
      navigate("/StudentProfile");
    } catch (err) { alert("Failed to submit request"); }
  };

  if (!student) return <div className="apply-vacation-page"><h2>Loading...</h2></div>;

  const latestLog = [...logs].sort((a, b) => new Date(a.outTime || a.inTime) - new Date(b.outTime || b.inTime))[0] || null;
  const isInside = latestLog ? !!latestLog.inTime : true;
  const statusText = isInside ? "Inside Campus" : "Outside Campus";
  const today = new Date().toISOString().split("T")[0];
  const maxLeaveDate = new Date();
  maxLeaveDate.setDate(maxLeaveDate.getDate() + 5);
  const maxDate = maxLeaveDate.toISOString().split("T")[0];

  return (
    <>
      <Navbar showLogout={true} />
      <StudentPortalHeader student={student} logs={logs} showProfile={true} showVacationButtons={false} />
      
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
                src={student.face_images?.length ? student.face_images[0] : "https://ui-avatars.com/api/?name=Aditi+Chouhan&background=0D8ABC&color=fff"} 
                alt="Student" 
              />
            </div>
            <div className="profile-details">
              <h2>{student.name}</h2>
              <p className="roll-number">{student.roll}</p>
              <p>{student.branch} • {student.hostel}</p>
              <span className={`campus-status-badge ${isInside ? 'inside' : 'outside'}`}>
                {statusText}
              </span>
            </div>
          </div>

          <div className="form-container">
            <form className="vacation-form" onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Enter destination" required />
              </div>
              
              <div className="form-group">
                <label>Time of Leaving Campus</label>
                <input type="time" name="leaveCampusTime" value={formData.leaveCampusTime} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label>Leave Date</label>
                <input type="date" name="leaveDate" value={formData.leaveDate} onChange={handleChange} min={today} max={maxDate} required />
              </div>
              
              <div className="form-group">
                <label>Return Date</label>
                <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label>Reason</label>
                <textarea rows="4" name="reason" value={formData.reason} onChange={handleChange} placeholder="Enter reason for vacation" required />
                <div className="word-count">{formData.reason.trim().split(/\s+/).filter(Boolean).length} / 100 words</div>
              </div>
              
              <div className="submit-area">
                <button type="button" className="cancel-btn" onClick={() => navigate("/StudentProfile")}>Cancel</button>
                <button type="submit" className="submit-btn">Submit Request</button>
              </div>

            </form>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default ApplyVacation;