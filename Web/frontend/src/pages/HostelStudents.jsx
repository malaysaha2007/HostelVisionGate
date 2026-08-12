import { useLocation, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostelPortalHeader from "../components/HostelPortalHeader";
import API from "../services/api";
import "../styles/HostelStudents.css";
import { FaSyncAlt, FaFileCsv } from "react-icons/fa";

function HostelStudents() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);

const [showDeleteModal, setShowDeleteModal] = useState(false);

const [deleteConfirmText,
  setDeleteConfirmText] = useState("");


  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    setRefreshing(true);
    try {
      const response = await API.get(`/hostel/students/${user.hostel}`);

      console.log("Students API:", response.data);

      setStudents(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 300);
    }
  };


  const handleView = async (rollNo) => {
  try {

    const res = await API.get(
      `/student/profile/${rollNo}`
    );

    setSelectedStudent(
      res.data.student
    );

    setShowViewModal(true);

  } catch (error) {
    console.error(error);
  }
};

  const exportCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export");
      return;
    }

    const headers = ["Name", "Roll Number", "Room", "Status"];
    const rows = filteredStudents.map((student) => [
      student.name || "",
      student.roll_no || "",
      student.room || "",
      student.status || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${user.hostel}_students.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return <h2>No Hostel Staff Data Found</h2>;
  }

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.roll_no?.toLowerCase().includes(searchText) ||
      student.room?.toLowerCase().includes(searchText)
    );
  });

  /* =========================
     COUNTS
  ========================= */
  const totalStudents = students.length;
  const outsideStudents = students.filter((s) => s.status === "OUT");
  const outsideCount = outsideStudents.length;
  const curfewStudents = outsideStudents.filter((s) => s.afterCurfew === true);
  const curfewCount = curfewStudents.length;
  const leaveStudents = outsideStudents.filter(
    (s) =>
      s.purpose === "Hospital" ||
      s.purpose === "Medical" ||
      s.purpose === "Leave" ||
      s.purpose === "Special Leave"
  );
  const leaveCount = leaveStudents.length;

  return (
    <div className={`hostel-students-page ${refreshing ? "page-refresh" : ""}`}>
      {/* NAVBAR */}
      <Navbar showLogout={true} />
      <HostelPortalHeader />

      {/* =========================
          STATS CARDS
      ========================= */}
      <div className="stats-grid">
        {/* CARD 1 */}
    <div
  className="stat-card clickable-card"
  onClick={() =>
    navigate("/student-status/outside", {
      state: {
        title: "Students Outside Campus",
        students: outsideStudents,
        hostel: user.hostel,
      },
    })
  }
>

   <div className="stat-left">
    <p>Students Outside Campus</p>
    <span className="card-sub">View Full Details</span>
  </div>

  <h2>{outsideCount}</h2>

</div>



        {/* CARD 2 */}
        <div
          className="stat-card clickable-card danger-card"
          onClick={() =>
            navigate("/student-status/curfew", {
              state: {
                title: "Outside After Curfew",
                students: curfewStudents,
                hostel: user.hostel,
              },
            })
          }
        >
          <div className="stat-left">
    <p>Outside After Curfew</p>
    <span className="card-sub">
        View Full Details
    </span>
</div>

<h2>{curfewCount}</h2>
        </div>


        

        {/* CARD 3 */}
        <div
          className="stat-card clickable-card special-card"
          onClick={() =>
            navigate("/student-status/leave", {
              state: {
                title: "Leave / Special Purpose",
                students: leaveStudents,
                hostel: user.hostel,
              },
            })
          }
        >
         <div className="stat-left">
    <p>Leave / Special Purpose</p>
    <span className="card-sub">
        Hospital / Medical / Leave
    </span>
</div>

<h2>{leaveCount}</h2>
        </div>

        {/* CARD 4 */}
        <div
          className="stat-card clickable-card special-card"
          onClick={() =>
            navigate("/student-status/vacation", {
              state: {
                title: "Vacation Applications",
                students: leaveStudents,
                hostel: user.hostel,
              },
            })
          }
        >
        <div className="stat-left">
    <p>Vacation Applications</p>
    <span className="card-sub">
        View all Vacation Applications
    </span>
</div>

<h2>{leaveCount}</h2>
        </div>
      </div>

      {/* STATUS */}
      <div className="monitoring-box">
        <div className="monitoring-badge">
          <span className="dot"></span>
          Hostel Monitoring Active
        </div>
      </div>

      {/* MAIN */}
      <div className="container">
        <h1 className="page-title">Students – {user.hostel}</h1>
        <div className="card">
          {/* TOP ACTIONS */}
          <div className="top-actions">
            {(user.role === "Warden" || user.role === "Caretaker") && (
              <Link to="/add-students" className="add-btn">
                + Add Student
              </Link>
            )}
          </div>

          {/* SEARCH */}
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by Name, Roll Number or Room..."
              className="search-box"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="action-buttons">
              <button
                onClick={fetchStudents}
                title="Refresh"
                className="icon-btn"
              >
                <FaSyncAlt />
              </button>
              <button
                className="icon-btn"
                onClick={exportCSV}
                title="Export CSV"
              >
                <FaFileCsv />
              </button>
            </div>
          </div>

          <p className="student-count">
            Showing {filteredStudents.length} Students
          </p>



          {/* TABLE */}
          <div className="table-wrapper">
            <table>
             <thead>
  <tr>
    <th></th>
    <th>Name</th>
    <th>Roll No</th>
    <th>Room</th>
  </tr>
</thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4">No Students Found</td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                   <tr
  key={student._id}
  onClick={() => {
    handleView(student.roll_no);
  }}
>

<td>
  {student.face_images?.length > 0 ? (
    <img
      src={student.face_images[0]}
      alt={student.name}
      className="student-table-avatar"
    />
  ) : (
    <div className="student-table-avatar-fallback">
      {student.name?.charAt(0)}
    </div>
  )}
</td>

  <td>{student.name}</td>

  <td>{student.roll_no}</td>

  <td>{student.room}</td>

</tr>
                  ))
                )}
              </tbody>
            </table>




            {showViewModal && selectedStudent && (
  <div className="modal-overlay">
    <div className="view-modal">

    <div className="student-avatar">

  {selectedStudent.face_images?.length > 0 ? (

    <img
      src={selectedStudent.face_images[0]}
      alt={selectedStudent.name}
    />

  ) : (

    <div className="student-avatar-fallback">
      {selectedStudent.name?.charAt(0)}
    </div>

  )}

</div>

  
<div className="student-details-grid">

  <div className="detail-card">
    <label>Name</label>
    <span>{selectedStudent.name}</span>
  </div>

  <div className="detail-card">
    <label>Roll No</label>
    <span>{selectedStudent.roll}</span>
  </div>

  <div className="detail-card">
    <label>Branch</label>
    <span>{selectedStudent.branch}</span>
  </div>

  <div className="detail-card">
    <label>Hostel</label>
    <span>{selectedStudent.hostel}</span>
  </div>

  <div className="detail-card">
    <label>Room</label>
    <span>{selectedStudent.room}</span>
  </div>

  <div className="detail-card">
    <label>Student Contact</label>
    <span>{selectedStudent.contact?.student_no}</span>
  </div>

  <div className="detail-card">
    <label>Parent Contact</label>
    <span>{selectedStudent.contact?.parent_no}</span>
  </div>

<div className="detail-card">
  <label>Email</label>
  <span>{selectedStudent.contact?.email}</span>
</div>

<div
  className={`face-status ${
    selectedStudent.face_images?.length > 0
      ? "yes"
      : "no"
  }`}
>
  <label>Face Registration</label>

  <span>
    {selectedStudent.face_images?.length > 0
      ? "Registered"
      : "Not Registered"}
  </span>
</div>

</div>

<div className="modal-actions">

  {(user.role === "Warden" ||
    user.role === "Caretaker") && (
    <>
      <button
        className="modal-edit-btn"
        onClick={() =>
          navigate("/edit-student", {
            state: {
              student: selectedStudent,
            },
          })
        }
      >
        Edit Student
      </button>

      <button
        className="modal-delete-btn"
        onClick={() => {
  setDeleteConfirmText("");
  setShowDeleteModal(true);
}}
      >
        Delete Student
      </button>
    </>
  )}

  <button
    className="modal-close-btn"
    onClick={() =>
      setShowViewModal(false)
    }
  >
    Close
  </button>

</div>

    </div>
  </div>
)}


{showDeleteModal && selectedStudent && (
  <div className="modal-overlay">

    <div className="delete-modal">

      <h2 className="delete-modal-title">
        Delete Student
      </h2>

      <p className="delete-modal-text">
        This action cannot be undone.
      </p>

      <div className="delete-student-info">

        <div>
          <strong>Name:</strong>
          {" "}
          {selectedStudent.name}
        </div>

        <div>
          <strong>Roll No:</strong>
          {" "}
          {selectedStudent.roll}
        </div>

      </div>

      <label className="delete-label">
        Type the student's Roll Number to confirm
      </label>

      <input
        type="text"
        className="delete-input"
        placeholder={selectedStudent.roll}
        value={deleteConfirmText}
        onChange={(e) =>
          setDeleteConfirmText(
            e.target.value
          )
        }
      />

      <div className="delete-actions">

        <button
          className="delete-cancel-btn"
          onClick={() => {
            setDeleteConfirmText("");
            setShowDeleteModal(false);
          }}
        >
          Cancel
        </button>

        <button
          className="delete-confirm-btn"
          disabled={
            deleteConfirmText !==
            selectedStudent.roll
          }
          onClick={async () => {

            try {

              await API.delete(
                `/student/delete/${selectedStudent._id}`
              );

              alert(
                "Student Deleted Successfully"
              );

              setShowDeleteModal(false);

              setShowViewModal(false);

              setDeleteConfirmText("");

              fetchStudents();

            } catch (error) {

              console.error(error);

              alert(
                "Delete Failed"
              );

            }

          }}
        >
          Delete Student
        </button>

      </div>

    </div>

  </div>
)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HostelStudents;