import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const { reset } = useForm();

  const handleStudentNumberChange = (e) => {
    setStudentNumber(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const APP_URL = import.meta.env.VITE_APP_URL;

  const VerifyStudentNumber = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${APP_URL}/api/verify-forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_number: studentNumber,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        toast.error(
          data.message ||
            "Student Number does not exist. Failed to send reset link."
        );
        return;
      }

      // toast.success("Reset link sent successfully.");
      setIsSuccess(true);
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      {!isSuccess ? (
        <div className="forgotPass-container">
          <div className="changePass-form-container">
            <h4>Forgot Password</h4>
            <p>
              Enter your <b>Student Number</b> and <b>Email</b> for
              verification, and we will send you a link for you to able to
              change your password.
            </p>

            <form onSubmit={VerifyStudentNumber}>
              <div className="form-group">
                <label htmlFor="studentNumber">Student Number:</label>
                <input
                  type="text"
                  id="studentNumber"
                  value={studentNumber}
                  onChange={handleStudentNumberChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="form-group-btn">
                <button type="submit">Verify</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="reset-link-success-container">
          <p className="reset-link-success">
            Password reset link sent successfully to your email! Please note
            that the link will expire in 5 minutes. You may now close this page.
          </p>
        </div>
      )}
    </>
  );
}
