import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import {
  RiEyeLine,
  RiEyeCloseLine
} from "react-icons/ri";

import {
  FaArrowLeft,
  FaShieldAlt,
  FaKey,
  FaUserGraduate
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/ResetPassword.css";

function ResetPassword() {

  const navigate = useNavigate();

  const [rollNo, setRollNo] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sendOtp = async () => {

    if (!rollNo.trim()) {
      alert("Enter Roll Number");
      return;
    }

    try {

      setLoading(true);

     const response = await API.post(
  "/send-otp",
  {
    username: rollNo,
    role: "student"
  }
);

      alert(response.data.message);

      setOtpSent(true);

    } catch (error) {

      alert(
        error?.response?.data?.detail ||
        "Failed to send OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {

    if (!otp.trim()) {
      alert("Enter OTP");
      return;
    }

    try {

      setLoading(true);

      const response = await API.post(
  "/verify-otp",
  {
    username: rollNo,
    otp
  }
);

      alert(response.data.message);

      setOtpVerified(true);

    } catch (error) {

      alert(
        error?.response?.data?.detail ||
        "Invalid OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {

    if (!newPassword || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

     const response = await API.put(
  "/reset-password",
  {
    username: rollNo,
    otp,
    new_password: newPassword
  }
);

      alert(response.data.message);

      navigate("/student-login");

    } catch (error) {

      alert(
        error?.response?.data?.detail ||
        "Failed to reset password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="reset-password-page">

        <div className="reset-password-card">

         

          <div className="reset-icon">
            <FaShieldAlt />
          </div>

          <h1>Reset Password</h1>

          <p>
            Verify your identity and create
            a new password.
          </p>

          <div className="input-group">

            <FaUserGraduate className="input-icon" />

            <input
              type="text"
              placeholder="Enter Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              disabled={otpSent}
            />
          </div>

          {!otpSent && (
            <button
              className="primary-btn"
              onClick={sendOtp}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {otpSent && !otpVerified && (
            <>
              <div className="input-group">

                <FaKey className="input-icon" />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>

              <button
                className="primary-btn"
                onClick={verifyOtp}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {otpVerified && (
            <>
              <div className="input-group">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? <RiEyeCloseLine />
                    : <RiEyeLine />}
                </button>
              </div>

              <div className="input-group">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? <RiEyeCloseLine />
                    : <RiEyeLine />}
                </button>
              </div>

              <button
                className="primary-btn"
                onClick={resetPassword}
              >
                {loading
                  ? "Updating..."
                  : "Reset Password"}
              </button>
            </>
          )}

        </div>

      </div>

      <Footer />
    </>
  );
}

export default ResetPassword;