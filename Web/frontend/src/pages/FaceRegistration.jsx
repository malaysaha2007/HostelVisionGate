import { useLocation, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

import API from "../services/api";

import "../styles/faceRegistration.css";

function FaceRegistration() {

  const location = useLocation();

  const navigate = useNavigate();

  const student = location.state?.student;

  // =========================
  // STATES
  // =========================

  const [studentNo, setStudentNo] =
    useState("");

  const [parentNo, setParentNo] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [p1, setP1] =
    useState(null);

  const [p2, setP2] =
    useState(null);

  const [p3, setP3] =
    useState(null);

  // =========================
  // PREVENT REFRESH / CLOSE
  // =========================

  useEffect(() => {

    const handleBeforeUnload = (e) => {

      if (loading) {

        e.preventDefault();

        e.returnValue = "";

      }

    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

    };

  }, [loading]);

  // =========================
  // PREVENT BACK BUTTON
  // =========================

  useEffect(() => {

    window.history.pushState(
      null,
      "",
      window.location.href
    );

    const handleBack = () => {

      if (loading) {

        window.history.pushState(
          null,
          "",
          window.location.href
        );

      }

    };

    window.addEventListener(
      "popstate",
      handleBack
    );

    return () => {

      window.removeEventListener(
        "popstate",
        handleBack
      );

    };

  }, [loading]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // =========================
    // STOP DOUBLE CLICK
    // =========================

    if (loading) {
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append(
        "roll_no",
        student.roll_no
      );

      formData.append(
        "name",
        student.name
      );

      formData.append(
        "branch",
        student.branch
      );

      formData.append(
        "hostel",
        student.hostel
      );

      formData.append(
        "room",
        student.room
      );

      formData.append(
        "email",
        student.email
      );

      formData.append(
        "studentNo",
        studentNo
      );

      formData.append(
        "parentNo",
        parentNo
      );

      formData.append(
        "password",
        password
      );

      formData.append("p1", p1);

      formData.append("p2", p2);

      formData.append("p3", p3);

      const response = await API.post(

        "/student/register",

        formData,

        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }

      );

      alert(response.data.message);

      setLoading(false);

      navigate("/student-login");

    } catch (error) {

      console.error(error);

      setLoading(false);

      alert(

        error.response?.data?.detail ||

        "Registration Failed"

      );

    }

  };

  // =========================
  // NO STUDENT
  // =========================

  if (!student) {

    return <h2>No Student Data Found</h2>;

  }

  return (

    <div className="face-registration-page">

      <div className="registration-container">

        <h1>

          Student Registration

        </h1>

        <p className="subtitle">

          Complete Your Profile

        </p>

        <div className="registration-card">

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <input
                value={student.name}
                readOnly
              />

              <input
                value={student.roll_no}
                readOnly
              />

              <input
                value={student.branch}
                readOnly
              />

              <input
                value={student.hostel}
                readOnly
              />

              <input
                value={student.room}
                readOnly
              />

              <input
                value={student.email}
                readOnly
              />

              <input
                type="text"
                placeholder="Student Contact Number"
                value={studentNo}
                onChange={(e) =>
                  setStudentNo(
                    e.target.value
                  )
                }
                required
              />

              <input
                type="text"
                placeholder="Parent Contact Number"
                value={parentNo}
                onChange={(e) =>
                  setParentNo(
                    e.target.value
                  )
                }
                required
              />

              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </div>

            {/* =========================
                PHOTO UPLOADS
            ========================= */}

            <div className="upload-grid">

              <div className="upload-box">

                <p>Photo 1</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setP1(
                      e.target.files[0]
                    )
                  }
                  required
                />

              </div>

              <div className="upload-box">

                <p>Photo 2</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setP2(
                      e.target.files[0]
                    )
                  }
                  required
                />

              </div>

              <div className="upload-box">

                <p>Photo 3</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setP3(
                      e.target.files[0]
                    )
                  }
                  required
                />

              </div>

            </div>

            {/* =========================
                BUTTON
            ========================= */}

            <div className="button-row">

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >

                {
                  loading
                    ? "Registering..."
                    : "Register"
                }

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

export default FaceRegistration;