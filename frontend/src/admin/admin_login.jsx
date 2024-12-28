import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import VideoBg from "../videos/bg_video.mp4";
import VideoBg from "../videos/ctc_vid.mp4";
import Logo from "../img/logo_final.png";
import "../css/admin/admin_login.css";
import { AuthContext } from "./components/backend/context/Auth";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const APP_URL = import.meta.env.VITE_APP_URL;

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await fetch(`${APP_URL}/api/authenticate`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.status === false) {
        toast.error(result.message);
      } else {
        const userInfo = {
          id: result.id,
          token: result.token,
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        login(userInfo);

        navigate("/admin/manage-basic-info");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-section">
      <div className="admin-bg-video-container">
        <video className="admin-bg-video" autoPlay loop muted>
          <source src={VideoBg} type="video/mp4" />
        </video>
      </div>

      <div className="admin-login-form">
        <div className="form-container">
          <div className="admin-logo-container">
            <img src={Logo} alt="" />
          </div>

          {/* <div className="admin-title-container">
                        <h3>Admin Login</h3>
                    </div> */}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-floating mb-3">
              <input
                {...register("email", {
                  required: "This field is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="text"
                className={`form-control ${errors.email && "is-invalid"}`}
                id="floatingInput"
                placeholder="name@example.com"
              />
              <label htmlFor="floatingInput">Admin Email</label>
              {errors.email && (
                <p className="invalid-feedback">{errors.email?.message}</p>
              )}
            </div>

            <div className="form-floating">
              <input
                {...register("password", {
                  required: "This field is required",
                })}
                type="password"
                className={`form-control ${errors.password && "is-invalid"}`}
                id="floatingPassword"
                placeholder="Password"
                required
              />
              <label htmlFor="floatingPassword">Password</label>
              {errors.password && (
                <p className="invalid-feedback">{errors.password?.message}</p>
              )}
            </div>

            <div className="admin-login-btn-container">
              <button type="submit" className="admin-login-btn">
                Login{" "}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
