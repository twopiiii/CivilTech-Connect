import { useLocation } from "react-router-dom";
import Contact from "../components/contact";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Add this import if using toast
import Breadcrumb from "react-bootstrap/Breadcrumb";
import "../../css/job_details.css";
import Button from "react-bootstrap/Button";

export default function JobDetails() {
  //   const [loading, setLoading] = useState(true);

  const APP_URL = import.meta.env.VITE_APP_URL;

  const location = useLocation();
  const { job } = location.state || {}; // Retrieve the passed job data

  return (
    <div>
      <section className="job-opportunities-section job-details-section">
        <Breadcrumb className="breadcrumb-edit">
          <Breadcrumb.Item href="/job-opportunities">
            Job Opportunities
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Job Details</Breadcrumb.Item>
        </Breadcrumb>

        <section className="jobs-section details-section">
          <div className="details-container">
            <img
              src={`${APP_URL}/storage/${job.logo}`}
              alt={job.company_name}
              className="details-image"
            />
            <div className="details-text">
              <h3>{job.company_name}</h3>
              <p className="address-text">
                <span>Address: </span>
                {job.address}
              </p>

              <div className="company-description-container">
                <p className="company-desc-title">Company Description</p>
                <p className="desc-text">{job.company_description}</p>
              </div>

              <hr />

              <div className="other-details-text">
                {job.job_offers ? (
                  <>
                    <p>
                      <b>This company is hiring!</b> Check out other information
                      below!
                    </p>

                    <div className="hiring-details">
                      {job.email ? (
                        <p className="hiring-info">
                          Email: <span>{job.email}</span>
                        </p>
                      ) : (
                        ""
                      )}

                      {job.phone ? (
                        <p className="hiring-info">
                          Phone No: <span>{job.phone}</span>
                        </p>
                      ) : (
                        ""
                      )}

                      {job.job_offers ? (
                        <>
                          <p className="hiring-info" style={{ margin: "0" }}>
                            Job Offer(s)
                          </p>
                          <ul>
                            {job?.job_offers.split("/").map((offer, index) => (
                              <li key={index} style={{ marginTop: "5px" }}>
                                {offer.trim()}
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        ""
                      )}
                    </div>

                    <Button
                      variant="primary"
                      className="card-btn company-card-btn"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the default anchor behavior
                        const url = job.link.startsWith("http")
                          ? job.link
                          : `https://${job.link}`;
                        window.open(url, "_blank"); // Open the link in a new tab
                      }}
                    >
                      Apply Now
                    </Button>
                  </>
                ) : (
                  <>
                    <p>
                      <b>This company has no hiring opportunities available</b>.
                      You can check out their page for more information.
                    </p>

                    <Button
                      variant="primary"
                      className="card-btn company-card-btn"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the default anchor behavior
                        const url = job.link.startsWith("http")
                          ? job.link
                          : `https://${job.link}`;
                        window.open(url, "_blank"); // Open the link in a new tab
                      }}
                    >
                      View Page
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <Contact />
        <Footer />
      </section>
    </div>
  );
}
