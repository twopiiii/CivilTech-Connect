import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const APP_URL = import.meta.env.VITE_APP_URL;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;
    const id = userInfo?.id;

    setLoading(true);

    if (!yourToken) {
      toast.error("User is not authenticated. Please log in again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${APP_URL}/api/admin-change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`,
        },
        body: JSON.stringify({ id: id, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success(data.message || "Password changed successfully.");
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.log(id, newPassword);
      console.error("Error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changePass-admin-container">
      <ToastContainer position="top-center" autoClose={3000} />

      <form onSubmit={handleChangePassword}>
        <div className="changePass-title">
          <h3>Change Password</h3>
        </div>

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
          <button type="submit">Change Password </button>
        </div>
      </form>
    </div>
  );
}
