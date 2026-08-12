import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostelPortalHeader from "../components/HostelPortalHeader";

import API from "../services/api";

import "../styles/EditStudent.css";

function EditStudent() {

  const location = useLocation();

  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);

  const basicStudent = location.state?.student;


 const [formData, setFormData] = useState({
  name: "",
  roll_no: "",
  room: "",
  hostel: "",
  email: "",
  student_no: "",
  parent_no: ""
});

useEffect(() => {

  const fetchStudent = async () => {

    try {

      const res = await API.get(
        `/student/profile/${basicStudent.roll}`
      );

      const student = res.data.student;

      setStudentData(student);

      setFormData({
        name: student.name || "",
        roll_no: student.roll || "",
        room: student.room || "",
        hostel: student.hostel || "",

        email: student.contact?.email || "",
        student_no: student.contact?.student_no || "",
        parent_no: student.contact?.parent_no || ""
      });

    } catch (err) {

      console.error(err);

    }

  };

 if (basicStudent?.roll) {
  fetchStudent();
}

}, [basicStudent]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

    await API.put(
  `/student/edit/${studentData._id}`,
  formData
);

      alert("Student Updated Successfully");

      navigate(-1);

    } catch (error) {

      console.error(error);

      alert("Update Failed");

    }

  };




if (!studentData) {
  return (
    <div className="edit-student-page">
      <Navbar />
      <HostelPortalHeader />
      <div className="loading-container">
        Loading Student Details...
      </div>
      <Footer />
    </div>
  );
}

  return (

    <div className="edit-student-page">

      <Navbar />

       <HostelPortalHeader />
<div className="edit-container">

  <div className="edit-profile-card">

    <div className="student-avatar">

      {studentData?.face_images?.length > 0 ? (

        <img
          src={studentData?.face_images[0]}
          alt={studentData?.name}
        />

      ) : (

        <div className="student-avatar-fallback">
    {studentData?.name?.charAt(0)}
        </div>

      )}

    </div>

    <h2 className="edit-title">
      Edit Student Details
    </h2>

    <form onSubmit={handleSubmit}>

      <div className="edit-details-grid">

        <div className="edit-detail-card">
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            readOnly
          />
        </div>

        <div className="edit-detail-card">
          <label>Roll No</label>

          <input
            type="text"
            name="roll_no"
            value={formData.roll_no}
            readOnly
          />
        </div>

        <div className="edit-detail-card">
          <label>Hostel</label>

          <input
            type="text"
            name="hostel"
            value={formData.hostel}
            onChange={handleChange}
          />
        </div>

        <div className="edit-detail-card">
          <label>Room</label>

          <input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleChange}
          />
        </div>

        <div className="edit-detail-card">
          <label>Student Contact</label>

          <input
            type="text"
            name="student_no"
            value={formData.student_no}
            onChange={handleChange}
          />
        </div>

        <div className="edit-detail-card">
          <label>Parent Contact</label>

          <input
            type="text"
            name="parent_no"
            value={formData.parent_no}
            onChange={handleChange}
          />
        </div>

<div className="edit-detail-card">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
          />
        </div>

       <div
  className={`face-status ${
    studentData?.face_images?.length > 0
      ? "yes"
      : "no"
  }`}
>
  <label>Face Registration</label>

  <span>
    {studentData?.face_images?.length > 0
      ? "Registered"
      : "Not Registered"}
  </span>
</div>

      </div>

      <div className="edit-actions">

        <button
          type="button"
          className="cancel-btn"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="save-btn"
        >
          Save Changes
        </button>

      </div>

    </form>

  </div>

</div>
      <Footer />

    </div>

  );

}

export default EditStudent;