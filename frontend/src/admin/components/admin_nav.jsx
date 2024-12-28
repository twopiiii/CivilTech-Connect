import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "../../css/admin/sidebar.css";
import Logo from "../../img/logo_final.png";
import {
  General,
  LearningMaterials,
  Job,
  Ojt,
  Contact,
  TesdaCourses,
} from "./nav_data";
import { AuthContext } from "./backend/context/Auth";

export default function AdminSidebar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="admin-logo-container">
        <img src={Logo} alt="" />
      </div>

      <div className="text-nav">
        <h5>Hello, Admin!</h5>

        <div className="btn-container admin-btns">
          <button className="changePass-btn-admin">
            <NavLink
              to="admin/change-password"
              style={{ color: "white", textDecoration: "none" }}
            >
              Change Password
            </NavLink>
          </button>
          <button onClick={logout} className="logout-btn-admin">
            Logout
          </button>
        </div>
      </div>
      {/* <hr /> */}

      <div className="manageContents-title">
        <p>General</p>
      </div>

      <ul className="sidebar-ul">
        {General.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="manageContents-title">
        <p>Learning Materials</p>
      </div>

      <ul className="sidebar-ul">
        {LearningMaterials.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {" "}
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="manageContents-title">
        <p>TESDA Courses</p>
      </div>

      <ul className="sidebar-ul">
        {TesdaCourses.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {" "}
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="manageContents-title">
        <p>Job Opportunities</p>
      </div>

      <ul className="sidebar-ul">
        {Job.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {" "}
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="manageContents-title">
        <p>OJT Opportunities</p>
      </div>

      <ul className="sidebar-ul">
        {Ojt.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="manageContents-title">
        <p>Contacts & Socials</p>
      </div>

      <ul className="sidebar-ul">
        {Contact.map((val, key) => {
          return (
            <li key={key}>
              <NavLink
                to={val.link}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {val.title}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
