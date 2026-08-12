import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostelPortalHeader from "../components/HostelPortalHeader";

import API from "../services/api";

import "../styles/HostelLogin.css";

function HostelLogin() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [hostel, setHostel] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post(
        "/hostel/login",
        {
          username,
          hostel,
          role,
          password,
        }
      );

localStorage.clear();

localStorage.setItem(
  "hostelUser",
  JSON.stringify({
    name: username,
    designation: role,
    hostel: hostel
  })
);

localStorage.setItem(
  "role",
  "hostel"
);
     



      alert("Login Successful");

      navigate("/HostelStudents", {
  state: {
    user: response.data.user,
    students: response.data.students
  }
});

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Invalid hostel credentials"
      );
    }
  };

  return (

    <div className="hostel-login-page">

<Navbar showLogin={true} />


       <HostelPortalHeader />

      

      {/* LOGIN BOX */}
      <div className="login-container">

        <h2>
          Hostel Login
        </h2>

        <form
          onSubmit={handleLogin}
          autoComplete="off"
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />

          <select
            value={hostel}
            onChange={(e) =>
              setHostel(e.target.value)
            }
            required
          >

            <option value="">
              Select Hostel
            </option>

            <option value="Hostel 1">
              Hostel 1
            </option>

            <option value="Hostel 2">
              Hostel 2
            </option>

            <option value="Hostel 3">
              Hostel 3
            </option>

            <option value="Hostel 4">
              Hostel 4
            </option>

            <option value="Hostel 5">
              Hostel 5
            </option>

            <option value="Hostel 6">
              Hostel 6
            </option>

          </select>

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            required
          >

            <option value="">
              Select Designation
            </option>

            <option value="Warden">
              Warden
            </option>

            <option value="Caretaker">
              Caretaker
            </option>

            <option value="Hostel Guard">
              Hostel Guard
            </option>

          </select>

          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <span
              className="eye-btn"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword
                ? <FaEyeSlash />
                : <FaEye />}
            </span>

          </div>

          <div className="forgot-password-hostel">
  <button
    type="button"
    onClick={() =>
      alert(
        "Password reset is restricted for hostel staff.\n\nPlease contact the system administrator to reset your password."
      )
    }
  >
    Forgot Password?
  </button>
</div>

          <button type="submit">
            Login
          </button>

        </form>

      </div>

      <Footer />

    </div>

  );

}

export default HostelLogin;