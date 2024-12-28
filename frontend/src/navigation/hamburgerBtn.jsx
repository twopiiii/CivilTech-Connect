import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/nav.css";

export default function HamburgerBtn({
  isLoggedIn,
  handleShowForm,
  userName,
  studentNumber,
  handleLogout,
  handleNavigation,
  courseFetch,
  toggleMenu,
  closeMenu,
  menuOpen,
}) {
  return (
    <div className="burger-menu">
      <div
        className={`burger-btn ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>

      <nav className={`nav-menu ${menuOpen ? "show-menu" : ""}`}>
        <ul className="list-unstyled">
          {isLoggedIn ? (
            <>
              <p className="burger-studentNumber">{studentNumber}</p>
              <p className="burger-studentCourse">{courseFetch}</p>
              <p className="burger-studentName">{userName}</p>

              <hr />

              <li>
                <NavLink to="/" onClick={closeMenu}>
                  home
                </NavLink>
              </li>
              <li>
                <NavLink to="/learning-resources" onClick={closeMenu}>
                  learning resources
                </NavLink>
              </li>
              <li>
                <NavLink to="/tesda-courses" onClick={closeMenu}>
                  tesda courses
                </NavLink>
              </li>
              <li>
                <NavLink to="/job-opportunities" onClick={closeMenu}>
                  job opportunities
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ojt-companies"
                  onClick={(event) => {
                    handleNavigation(event, "OJT Companies");
                    closeMenu();
                  }}
                >
                  ojt companies
                </NavLink>
              </li>

              <hr />

              <li
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  fontSize: "12px",
                }}
              >
                <i className="fa fa-gear" style={{ fontSize: "15px" }}></i>
                <NavLink to="/change-password" onClick={closeMenu}>
                  Change Password
                </NavLink>
              </li>

              <li
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <i className="fa fa-sign-out" style={{ fontSize: "15px" }}></i>
                Logout
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/" onClick={closeMenu}>
                  home
                </NavLink>
              </li>
              <li>
                <NavLink to="/learning-resources" onClick={closeMenu}>
                  learning resources
                </NavLink>
              </li>
              <li>
                <NavLink to="/tesda-courses" onClick={closeMenu}>
                  tesda courses
                </NavLink>
              </li>
              <li>
                <NavLink to="/job-opportunities" onClick={closeMenu}>
                  job opportunities
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ojt-companies"
                  onClick={(event) => {
                    handleNavigation(event, "OJT Companies");
                    closeMenu();
                  }}
                >
                  ojt companies
                </NavLink>
              </li>

              <hr />

              <li
                onClick={() => {
                  handleShowForm();
                  closeMenu();
                }}
              >
                Login
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}
