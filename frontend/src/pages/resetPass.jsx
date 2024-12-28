import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams(); // Get the token from the URL params
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Handle the password reset logic
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password don't match.");
      return;
    }

    try {
      const response = await fetch(`${APP_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token, password: newPassword }), // Pass token from URL directly here
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Failed to reset password.");
        return;
      }

      // toast.success("Password reset successful.");
      setIsSuccess(true);
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      {/* <ToastContainer position="top-center" /> */}

      {!isSuccess ? (
        <div className="forgotPass-container reset-password-container">
          <div className="changePass-form-container">
            <h4>Reset Your Password</h4>
            <p>Please enter your new password below.</p>

            <form onSubmit={handleResetPassword}>
              {/* Remove the hidden input for token */}
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-btn">
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="reset-link-success-container">
          <p className="reset-link-success">
            Password changed successfully! <a href="/">Click here</a> to
            navigate you to Home Page.
          </p>
        </div>
      )}
    </>
  );
}
