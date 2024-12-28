import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../css/style.css";
import "../css/nav.css";
// import logo from "../img/logo.png";
// import logo_noText from "../img/logo_noText.png";
import logo_final from "../img/logo_final.png";
import Burger from "./hamburgerBtn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { FaUser } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import Badge from "react-bootstrap/Badge";

export default function Navbar() {
  const [currentLogo, setCurrentLogo] = useState(logo_final);
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [studentNumberFetch, setStudentNumberFetch] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [courseFetch, setCourseFetch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyNames, setCompanyNames] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const handleShow = () => {
    reset({ studentNumber: "", password: "" }), setShow(true);
  };
  const handleClose = () => setShow(false);

  const { reset, handleSubmit } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) {
        setCurrentLogo(logo_final);
      } else {
        setCurrentLogo(logo_final);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    // Check if the user is logged in
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
    if (studentInfo) {
      setIsLoggedIn(true);
      setUserName(studentInfo.full_name || "User");
      setStudentNumberFetch(studentInfo.student_number || "");
      setCourseFetch(studentInfo.course || "");
      setYearLevel(studentInfo.year_level || "");
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogin = async (e) => {
    setError("");

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/user-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_number: studentNumber,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          `Error: ${data.message || "Login Failed. Invalid Credentials.."}`
        );
        throw new Error("Login Failed. Invalid Credentials.");
      }

      toast.success(data.message);
      localStorage.setItem("studentInfo", JSON.stringify(data.student));

      reset();
      handleClose();
      setIsLoggedIn(true);
      setUserName(data.student.full_name || "User");

      window.location.reload(); // navigate("/");
    } catch (err) {
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentInfo");
    setIsLoggedIn(false);
    toast.info("Logged Out Successfully.");

    if (
      location.pathname === "/job-opportunities" ||
      location.pathname === "/ojt-companies" ||
      location.pathname === "/change-password"
    ) {
      navigate("/"); // Redirect to the home page
    }
  };

  const handleNavigation = (event, title) => {
    if (!isLoggedIn) {
      toast.info(`You should log in first to access ${title}`);
      event.preventDefault();
    } else {
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
    setNotificationVisible(false);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  const toggleNotification = () => {
    setNotificationVisible((prev) => !prev);
    setDropdownVisible(false);
    setMenuOpen(false);

    if (!notificationVisible) {
      // Use fetch to send a POST request to mark notifications as read
      fetch(`${APP_URL}/api/notifications/mark-as-read`, {
        method: "POST", // Or PUT depending on your backend setup
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_number: studentNumberFetch, // Pass the user ID or any required data
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Assuming data contains updated notifications or a success status
          setNotification((prev) =>
            prev.map((notif) => ({ ...notif, read_status: "read" }))
          );
        })
        .catch((error) => {
          console.error("Error updating notifications:", error);
        });
    }
  };

  const closeNotification = () => {
    setNotificationVisible(false);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setNotificationVisible(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const fetchData = () => {
      fetch(`${APP_URL}/api/fetch-notifs?student_number=${studentNumberFetch}`) // Adjust API endpoint if necessary
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json();
        })
        .then((data) => {
          // console.log(data);
          // toast.info("New Notification!");
          setNotification(data); // Set the fetched data
        })
        .catch((error) => {
          toast.error("Error fetching data:", error);
        })
        .finally(() => {
          setLoading(false); // End loading
        });
    };

    // Fetch data initially and then every n seconds
    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [studentNumberFetch]);

  const [unreadCount, setUnreadCount] = useState(0);

  // Filter notifications by student_number and calculate unread count
  useEffect(() => {
    const filteredNotifications = notification.filter(
      (notif) => notif.student_number === studentNumberFetch
    );
    const unreadCount = filteredNotifications.filter(
      (notif) => notif.read_status === "unread"
    ).length;
    setUnreadCount(unreadCount);
  }, [notification, studentNumberFetch]);

  const isPasswordPage = location.pathname.includes("reset-password");

  return (
    <>
      {!isPasswordPage ? (
        <>
          <nav className="navigationBar">
            <div className="topNav">
              <div className="row">
                <div className="logo-container text-start col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                  <a href="/">
                    <img src={currentLogo} alt="CivilTech Connect Logo" />
                  </a>
                </div>

                <div className="login-btn-container d-flex align-items-center justify-content-end col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                  {isLoggedIn ? (
                    <div className="d-flex align-items-center">
                      {yearLevel === "4" ? (
                        <>
                          <div
                            className={`user-notification-dropdown ${
                              notificationVisible ? "icon-active" : ""
                            }`}
                            onBlur={closeNotification}
                            onClick={toggleNotification}
                          >
                            <FaBell size={19} />
                            {unreadCount > 0 && (
                              <Badge
                                bg="primary"
                                style={{
                                  position: "absolute",
                                  top: "-5px",
                                  right: "-5px",
                                  borderRadius: "50%",
                                  padding: "5px 7px",
                                  fontSize: "10px",
                                }}
                              >
                                {unreadCount}
                              </Badge>
                            )}
                            {notificationVisible && (
                              <div className="user-notification-dropdown-menu">
                                <div className="notif-title">
                                  <h5>Notifications</h5>
                                </div>

                                <hr style={{ color: "black" }} />

                                <div className="notif-container">
                                  {notification.length === 0 ? (
                                    <p style={{ padding: "0 20px" }}>
                                      No Notifications.{" "}
                                    </p>
                                  ) : (
                                    <>
                                      {loading ? (
                                        <p
                                          style={{
                                            padding: "0 20px",
                                          }}
                                        >
                                          Loading Notifications ...
                                        </p>
                                      ) : (
                                        <>
                                          <div className="new-notif">
                                            <div className="notif-title">
                                              <h6>Latest</h6>
                                            </div>

                                            {notification.length > 0 &&
                                              [...notification]
                                                .sort(
                                                  (a, b) =>
                                                    new Date(b.created_at) -
                                                    new Date(a.created_at)
                                                )
                                                .slice(0, 1) // Only take the most recent notification
                                                .map((notif) => (
                                                  <div
                                                    className={`notifications ${
                                                      notif.read_status ===
                                                      "unread"
                                                        ? "unread"
                                                        : "read"
                                                    }`}
                                                    key={notif.id}
                                                  >
                                                    {notif.type ===
                                                    "application" ? (
                                                      <p>
                                                        {notif.read_status ===
                                                          "unread" && (
                                                          <i className="fa fa-circle"></i>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "accepted" && (
                                                          <>
                                                            <b>
                                                              Congratulations!{" "}
                                                            </b>
                                                            Your{" "}
                                                            <b>application</b>{" "}
                                                            to apply as an
                                                            intern in{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            has been{" "}
                                                            <b>accepted</b>!
                                                          </>
                                                        )}
                                                        {notif.status ===
                                                          "referred" && (
                                                          <>
                                                            Your{" "}
                                                            <b>application</b>{" "}
                                                            to apply as an
                                                            intern in{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            has been{" "}
                                                            <b>referred</b>.
                                                          </>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "denied" && (
                                                          <>
                                                            <b>
                                                              We are so sorry to
                                                              tell you{" "}
                                                            </b>{" "}
                                                            that your{" "}
                                                            <b>application</b>{" "}
                                                            to{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            as an intern has
                                                            been <b>rejected</b>
                                                            .
                                                          </>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "pending" && (
                                                          <>
                                                            Your{" "}
                                                            <b>application</b>{" "}
                                                            to{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            as an intern is
                                                            still <b>pending</b>
                                                            . We will notify you
                                                            for further updates.
                                                          </>
                                                        )}{" "}
                                                      </p>
                                                    ) : (
                                                      <p>
                                                        {notif.read_status ===
                                                          "unread" && (
                                                          <i className="fa fa-circle"></i>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "accepted" && (
                                                          <>
                                                            <b>
                                                              Congratulations!{" "}
                                                            </b>
                                                            Your <b>referral</b>{" "}
                                                            to apply as an
                                                            intern in{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            has been{" "}
                                                            <b>accepted</b>!
                                                          </>
                                                        )}
                                                        {notif.status ===
                                                          "referred" && (
                                                          <>
                                                            Your <b>referral</b>{" "}
                                                            to apply as an
                                                            intern in{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            has been <b>sent</b>
                                                            . We will notify you
                                                            for further updates.
                                                          </>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "denied" && (
                                                          <>
                                                            <b>
                                                              We are so sorry to
                                                              tell you{" "}
                                                            </b>{" "}
                                                            that you have been{" "}
                                                            <b>rejected</b> to
                                                            apply on your{" "}
                                                            <b>referred</b>{" "}
                                                            company -{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>
                                                            .
                                                          </>
                                                        )}{" "}
                                                        {notif.status ===
                                                          "pending" && (
                                                          <>
                                                            Your <b>referral</b>{" "}
                                                            to apply as an
                                                            intern in{" "}
                                                            <b>
                                                              {
                                                                notif.company_name
                                                              }
                                                            </b>{" "}
                                                            is currently{" "}
                                                            <b>pending</b>. We
                                                            will notify you for
                                                            further updates.
                                                          </>
                                                        )}{" "}
                                                      </p>
                                                    )}
                                                    <div className="notif-time">
                                                      {/* Display time relative to now */}
                                                      <p className="notif-time-display">
                                                        {formatDistanceToNow(
                                                          new Date(
                                                            notif.created_at
                                                          ),
                                                          { addSuffix: true }
                                                        )}
                                                      </p>{" "}
                                                    </div>
                                                  </div>
                                                ))}
                                          </div>

                                          <div className="earlier-notif">
                                            <div className="notif-title">
                                              <h6>Others</h6>
                                            </div>

                                            {notification.length > 1 &&
                                              notification
                                                .sort(
                                                  (a, b) =>
                                                    new Date(b.created_at) -
                                                    new Date(a.created_at)
                                                )
                                                .slice(1) // Skip the most recent notification // Sort by latest first
                                                .map((notif) => (
                                                  <div
                                                    className={`notifications ${
                                                      notif.read_status ===
                                                      "unread"
                                                        ? "unread"
                                                        : "read"
                                                    }`}
                                                    key={notif.id}
                                                  >
                                                    <p>
                                                      {notif.read_status ===
                                                        "unread" && (
                                                        <i className="fa fa-circle"></i>
                                                      )}{" "}
                                                      {notif.type ===
                                                      "application" ? (
                                                        <>
                                                          {notif.status ===
                                                            "accepted" && (
                                                            <>
                                                              <b>
                                                                Congratulations!{" "}
                                                              </b>
                                                              Your{" "}
                                                              <b>application</b>{" "}
                                                              to apply as an
                                                              intern in{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              has been{" "}
                                                              <b>accepted</b>!
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "referred" && (
                                                            <>
                                                              Your{" "}
                                                              <b>application</b>{" "}
                                                              to apply as an
                                                              intern in{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              has been{" "}
                                                              <b>referred</b>.
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "denied" && (
                                                            <>
                                                              <b>
                                                                We are so sorry
                                                                to tell you{" "}
                                                              </b>
                                                              that your{" "}
                                                              <b>application</b>{" "}
                                                              to{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              as an intern has
                                                              been{" "}
                                                              <b>rejected</b>.
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "pending" && (
                                                            <>
                                                              Your{" "}
                                                              <b>application</b>{" "}
                                                              to{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              as an intern is
                                                              still{" "}
                                                              <b>pending</b>. We
                                                              will notify you
                                                              for further
                                                              updates.
                                                            </>
                                                          )}
                                                        </>
                                                      ) : (
                                                        <>
                                                          {notif.status ===
                                                            "accepted" && (
                                                            <>
                                                              <b>
                                                                Congratulations!{" "}
                                                              </b>
                                                              Your{" "}
                                                              <b>referral</b> to
                                                              apply as an intern
                                                              in{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              has been{" "}
                                                              <b>accepted</b>!
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "referred" && (
                                                            <>
                                                              Your{" "}
                                                              <b>referral</b> to
                                                              apply as an intern
                                                              in{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              has been{" "}
                                                              <b>sent</b>. We
                                                              will notify you
                                                              for further
                                                              updates.
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "denied" && (
                                                            <>
                                                              <b>
                                                                We are so sorry
                                                                to tell you{" "}
                                                              </b>
                                                              that you have been{" "}
                                                              <b>rejected</b> to
                                                              apply on your{" "}
                                                              <b>referred</b>{" "}
                                                              company -
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>
                                                              .
                                                            </>
                                                          )}
                                                          {notif.status ===
                                                            "pending" && (
                                                            <>
                                                              Your{" "}
                                                              <b>referral</b> to
                                                              apply as an intern
                                                              in{" "}
                                                              <b>
                                                                {
                                                                  notif.company_name
                                                                }
                                                              </b>{" "}
                                                              is currently{" "}
                                                              <b>pending</b>. We
                                                              will notify you
                                                              for further
                                                              updates.
                                                            </>
                                                          )}
                                                        </>
                                                      )}
                                                    </p>
                                                    <div className="notif-time">
                                                      {/* Display time relative to now */}
                                                      <p>
                                                        {formatDistanceToNow(
                                                          new Date(
                                                            notif.created_at
                                                          ),
                                                          { addSuffix: true }
                                                        )}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ))}
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}

                      <div
                        className={`user-icon-dropdown ${
                          dropdownVisible ? "icon-active" : ""
                        }`}
                        onBlur={closeDropdown}
                        onClick={toggleDropdown}
                      >
                        <FaUser size={20} className="user-icon-loggedIn" />
                        {dropdownVisible && (
                          <div className="user-icon-dropdown-menu">
                            <p className="user-icon-dropdown-header icon-studentName">
                              {userName}
                            </p>
                            <p className="user-icon-dropdown-header icon-studentNumber">
                              {studentNumberFetch}
                            </p>
                            <p className="user-icon-dropdown-header icon-studentCourse">
                              {courseFetch}
                            </p>

                            <hr style={{ color: "white" }} />

                            <ul>
                              <li className="change-pass-link">
                                <i className="fa fa-gear"></i>

                                <NavLink to="/change-password">
                                  Change Password
                                </NavLink>
                              </li>
                              <li
                                onClick={handleLogout}
                                style={{ cursor: "pointer" }}
                              >
                                <i className="fa fa-sign-out"></i>
                                Logout
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      className="login-btn"
                      onClick={handleShow}
                      disabled={loading}
                    >
                      {loading ? "Logging In ..." : "Login"}
                    </button>
                  )}

                  <Burger
                    isLoggedIn={isLoggedIn}
                    handleShowForm={handleShow}
                    userName={userName}
                    studentNumber={studentNumberFetch}
                    handleLogout={handleLogout}
                    handleNavigation={handleNavigation}
                    courseFetch={courseFetch}
                    toggleMenu={toggleMenu}
                    closeMenu={closeMenu}
                    menuOpen={menuOpen}
                  />
                </div>
              </div>
            </div>

            <div className="bottomNav">
              <ul className="list-unstyled">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? "active" : "navLink"
                    }
                  >
                    home
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/learning-resources"
                    className={({ isActive }) =>
                      isActive ? "active" : "navLink"
                    }
                  >
                    learning resources
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/tesda-courses"
                    className={({ isActive }) =>
                      isActive ? "active" : "navLink"
                    }
                  >
                    tesda courses
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/job-opportunities"
                    className={({ isActive }) =>
                      isActive ? "active" : "navLink"
                    }
                  >
                    job opportunities
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/ojt-companies"
                    className={({ isActive }) =>
                      isActive ? "active" : "navLink"
                    }
                    onClick={(event) =>
                      handleNavigation(event, "OJT Companies")
                    }
                  >
                    ojt companies
                  </NavLink>
                </li>
              </ul>
            </div>
          </nav>
        </>
      ) : (
        <nav className="navigationBar">
          <div className="topNav">
            <div className="row">
              <div className="logo-container text-start col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                <img src={currentLogo} alt="CivilTech Connect Logo" />
              </div>
            </div>
          </div>
        </nav>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">Login</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ paddingTop: "25px" }}>
          <Form onSubmit={handleSubmit(handleLogin)}>
            <Form.Group className="mb-3">
              <Form.Label>ID Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="202*-****-****"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div
                className="forgot-password-container"
                style={{
                  textAlign: "right",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                <a
                  href=""
                  className="forgot-password"
                  style={{ fontSize: "13px" }}
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </a>
              </div>
            </Form.Group>

            <Modal.Footer>
              {error && (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
              )}
              <Button
                type="submit"
                className="btn btn-primary proceed-login-btn"
                style={{ marginTop: "15px" }}
              >
                Login
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
