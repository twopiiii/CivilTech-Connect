import "../css/style.css";
import "../css/job-opportunities.css";
import JobOjtSearch from "./components/job_ojt_search";
import JobNav from "./components/job_nav";
import Contact from "./components/contact";
import Footer from "./components/footer";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Add this import if using toast
import Figure from "react-bootstrap/Figure";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useNavigate } from "react-router-dom";

export default function JobOpportunities() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const navigate = useNavigate();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchJobOpportunities = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(
          `${APP_URL}/api/user-display-job-opportunities`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${yourToken}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setJobs(data);
      } catch (error) {
        toast.error("Error fetching Job Opportunities");
        console.error("Error fetching Job Opportunities: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobOpportunities();
  }, []);

  const [searchTerm, setSearchTerm] = useState(""); // State for the search term

  // Filter companies based on the search term
  const filteredCompanies = jobs.filter((ojt) =>
    ojt.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Click to learn more about the company
    </Tooltip>
  );

  return (
    <div>
      <section className="job-opportunities-section">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div className="search-section">
              <div className="search-content row d-flex justify-content-center">
                <input
                  type="text"
                  className="search-company col-11 col-sm-11 col-md-11 col-lg-7 col-xl-7"
                  placeholder="Search for Company"
                  value={searchTerm} // Controlled input
                  onChange={(e) => setSearchTerm(e.target.value)} // Update state on input
                />
                {/* <button
                  className="find-btn col-5 col-sm-3 col-md-3 col-lg-1 col-xl-1"
                  onClick={() => console.log("Search Term:", searchTerm)} // Optional for debugging
                >
                  <i className="fa fa-search"></i>Find
                </button> */}
              </div>
            </div>

            <section className="jobs-section">
              <hr style={{ marginBottom: "50px" }} />

              <div className="row justify-content-center">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((job) => (
                    // <Card key={job.id} className="company-card">
                    //   <Card.Img
                    //     className="company-card-img"
                    //     variant="top"
                    //     src={`${APP_URL}/storage/${job.logo}`}
                    //   />
                    //   <Card.Body>
                    //     <Card.Title>{job.company_name}</Card.Title>
                    //     <Card.Text className="company-card-text">
                    //       <h5 className="card-desc-title">Job Offers:</h5>
                    //       <ul className="job-desc-ul">
                    //         {job.job_offers.split("/").map((offer, index) => (
                    //           <li
                    //             key={index}
                    //             style={{ textTransform: "capitalize" }}
                    //           >
                    //             {offer.trim()}
                    //           </li>
                    //         ))}
                    //       </ul>

                    //       <h5 className="card-desc-title">Contacts</h5>
                    //       <ul className="job-desc-ul">
                    //         <li style={{ textTransform: "capitalize" }}>
                    //           {job.address}
                    //         </li>
                    //         {job.email && <li>{job.email}</li>}
                    //         {job.phone && <li>{job.phone}</li>}
                    //       </ul>
                    //     </Card.Text>
                    //     <Button
                    //       variant="primary"
                    //       className="card-btn company-card-btn"
                    //       onClick={(e) => {
                    //         e.preventDefault(); // Prevent the default anchor behavior
                    //         const url = job.link.startsWith("http")
                    //           ? job.link
                    //           : `https://${job.link}`;
                    //         window.open(url, "_blank"); // Open the link in a new tab
                    //       }}
                    //     >
                    //       Apply
                    //     </Button>
                    //   </Card.Body>
                    // </Card>
                    <OverlayTrigger
                      placement="right"
                      delay={{ show: 100, hide: 100 }}
                      overlay={renderTooltip}
                    >
                      <Figure
                        className="job-company-container"
                        onClick={() =>
                          navigate("/job-details", { state: { job } })
                        }
                      >
                        <Figure.Image
                          alt="171x180"
                          src={`${APP_URL}/storage/${job.logo}`}
                          className="company-img"
                        />
                        <Figure.Caption className="company-name">
                          {job.company_name}
                        </Figure.Caption>

                        {/* <Button
                        variant="primary"
                        className="card-btn company-learnMore-btn"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent the default anchor behavior
                          const url = job.link.startsWith("http")
                            ? job.link
                            : `https://${job.link}`;
                          window.open(url, "_blank"); // Open the link in a new tab
                        }}
                      >
                        Learn More
                      </Button> */}
                      </Figure>
                    </OverlayTrigger>
                  ))
                ) : (
                  <p style={{ textAlign: "center" }}>
                    No companies available at the moment for Job Opportunity.
                  </p>
                )}
              </div>
            </section>

            <Contact />
            <Footer />
          </>
        )}
      </section>
    </div>
  );
}
