import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserChangePass() {
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const APP_URL = import.meta.env.VITE_APP_URL;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
    const studentNumber = studentInfo?.student_number;

    if (!studentNumber) {
      toast.error("You must be logged in to change your password.");
      return;
    }

    try {
      const response = await fetch(`${APP_URL}/api/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_number: studentNumber,
          oldPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Old password is incorrect.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password doesn't match.");
        return;
      }

      const updateResponse = await fetch(`${APP_URL}/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_number: studentNumber, newPassword }),
      });

      const updatedData = await updateResponse.json();

      if (!updateResponse.ok || updatedData.success === false) {
        toast.error(updatedData.message || "Failed to change password.");
        return;
      }

      toast.success("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <div className="changePass-container">
        <div className="changePass-form-container">
          <h4>Change Password</h4>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="oldPassword">Old Password:</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="form-group-btn">
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
