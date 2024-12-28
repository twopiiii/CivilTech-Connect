import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./css/style.css";
import Navbar from "./navigation/navbar.jsx";
import Home from "./pages/home.jsx";
import LearningResources from "./pages/learningResources.jsx";
import JobOpportunities from "./pages/job_opportunities.jsx";
import JobDetails from "./pages/components/job_details.jsx";
import OjtCompanies from "./pages/ojt_companies.jsx";
import TesdaCoursesUser from "./pages/tesda_courses.jsx";
import SecretKeyRedirect from "./pages/assets/secretKey.jsx";
import AdminLogin from "./admin/admin_login.jsx";
import AdminNavbar from "./admin/components/admin_nav.jsx";
import "./css/admin/admin_style.css";
import BasicInfo from "./admin/manage_basic_info.jsx";
import Founder from "./admin/manage_founder.jsx";
import LearningMaterials from "./admin/manage_learning_materials.jsx";
import JobOpps from "./admin/manage_job_opportunities.jsx";
import OjtOpps from "./admin/manage_ojt_companies.jsx";
import Categories from "./admin/manage_learning_category.jsx";
import Topics from "./admin/manage_learning_topic.jsx";
import Students from "./admin/manage_students.jsx";
import ContactInfo from "./admin/manage_contact_info.jsx";
import Socials from "./admin/manage_socials.jsx";
import TesdaCategories from "./admin/manage_tesda_category.jsx";
import TesdaTrainingCenters from "./admin/manage_tesda_training_centers.jsx";
import AdminTesdaCourses from "./admin/manage_tesda_courses.jsx";
import RequireAuth from "./admin/RequireAuth.jsx";
import AdminChangePass from "./admin/components/changePass.jsx";
import ChangePass from "./pages/changePass.jsx";
import ForgotPassword from "./pages/forgotPassword.jsx";
import ResetPass from "./pages/resetPass.jsx";
import OjtReferrals from "./admin/manage_ojt_referrals.jsx";
import ScrollToTop from "./scrollToTop.jsx";
import OjtApplications from "./admin/manage_ojt_applications.jsx";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      {/* Check if the pathname doesn't include 'admin', 'forgot-password', or 'reset-password' */}
      {!location.pathname.includes("admin") && (
        <>
          <Navbar />

          <div className="appContainer">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/learning-resources"
                element={<LearningResources />}
              />
              <Route
                path="/job-opportunities/*"
                element={<JobOpportunities />}
              />
              <Route path="/job-details/*" element={<JobDetails />} />
              <Route path="/ojt-companies/*" element={<OjtCompanies />} />
              <Route path="/tesda-courses/*" element={<TesdaCoursesUser />} />
              <Route path="/change-password/*" element={<ChangePass />} />
              <Route path="/forgot-password/*" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPass />} />

              {/* Catch-all route to redirect to "/" */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </>
      )}

      {location.pathname.includes("admin") && (
        <div className="admin-layout">
          {!location.pathname.includes("admin/login") ? <AdminNavbar /> : ""}
          <div className="admin-content-container">
            <Routes>
              <Route path="admin/login" element={<AdminLogin />} />
              <Route
                path="admin/change-password"
                element={
                  <RequireAuth>
                    <AdminChangePass />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-students"
                element={
                  <RequireAuth>
                    <Students />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-basic-info"
                element={
                  <RequireAuth>
                    <BasicInfo />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-founder-info"
                element={
                  <RequireAuth>
                    <Founder />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-learning-materials"
                element={
                  <RequireAuth>
                    <LearningMaterials />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-learning-materials-categories"
                element={
                  <RequireAuth>
                    <Categories />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-learning-materials-topics"
                element={
                  <RequireAuth>
                    <Topics />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-job-opportunities"
                element={
                  <RequireAuth>
                    <JobOpps />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-ojt-companies"
                element={
                  <RequireAuth>
                    <OjtOpps />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-contact-info"
                element={
                  <RequireAuth>
                    <ContactInfo />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-socials"
                element={
                  <RequireAuth>
                    <Socials />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-tesda-categories"
                element={
                  <RequireAuth>
                    <TesdaCategories />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-tesda-courses"
                element={
                  <RequireAuth>
                    <AdminTesdaCourses />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-tesda-training-centers"
                element={
                  <RequireAuth>
                    <TesdaTrainingCenters />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-ojt-referrals"
                element={
                  <RequireAuth>
                    <OjtReferrals />
                  </RequireAuth>
                }
              />
              <Route
                path="admin/manage-ojt-applications"
                element={
                  <RequireAuth>
                    <OjtApplications />
                  </RequireAuth>
                }
              />
              {/* Catch-all route to redirect to admin login */}
              <Route path="*" element={<Navigate to="/admin/login" />} />
            </Routes>
          </div>
        </div>
      )}
    </>
  );
}

function AppWrapper() {
  return (
    <>
      <Router>
        <SecretKeyRedirect />
        <App />
      </Router>
      {/* <ToastContainer position="top-center" /> */}
    </>
  );
}

export default AppWrapper;
