import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPortalHeader from "../components/AdminPortalHeader";

import "../styles/AdminLogin.css";

function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [level, setLevel] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    if (loading) return;

    try {

      setLoading(true);

      const response = await API.post(
        "/admin/login",
        {
          username,
          password,
          level
        }
      );

      localStorage.clear();

localStorage.setItem(
  "username",
  response.data.admin.username
);

localStorage.setItem(
  "role",
  "admin"
);

      alert(
        response.data.message
      );

    

      navigate(
        "/admin-dashboard",
        {
          state: {
            admin:
              response.data.admin
          }
        }
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <>
    
<Navbar showLogin={true} />

     <AdminPortalHeader showProfile={false}/>

        <div className="login-container">

          <h2>
            Administration Login
          </h2>

          <form
            onSubmit={handleLogin}
          >

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              required
            />

            <div className="password-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

            <span
              className="eye-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? <FaEyeSlash />
                : <FaEye />}
            </span>

          </div>

            <select
              value={level}
              onChange={(e) =>
                setLevel(
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Select Access Level
              </option>

              <option value="Director">
                Director
              </option>

              <option value="Dean Academic">
                Dean Academic
              </option>

              <option value="Guard">
                Guard
              </option>

            </select>

            <div className="forgot-password-admin">
  <button
    type="button"
    onClick={() =>
      alert(
        "Password reset is restricted for administrators.\n\nPlease contact the system administrator to reset your password."
      )
    }
  >
    Forgot Password?
  </button>
</div>

            <button
              type="submit"
              disabled={loading}
            >

              {
                loading
                  ? "Logging In..."
                  : "Login"
              }

            </button>

          </form>

        </div>

      
      <Footer />

    </>

  );

}

export default AdminLogin;