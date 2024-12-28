import "../css/style.css";
import "../css/job-opportunities.css";
import "../css/ojt-opportunities.css";
import JobOjtSearch from "./components/job_ojt_search";
import JobNav from "./components/job_nav";
import Contact from "./components/contact";
import Footer from "./components/footer";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

export default function OjtCompanies() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState([]);
  const [studentNumber, setStudentNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [application, setApplication] = useState(false);
  const [selectedOjt, setSelectedOjt] = useState(null);
  const [userName, setUserName] = useState("");
  const [studentNumberFetch, setStudentNumberFetch] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);

  const formRef = useRef();
  const { reset } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  const handleViewForm = (ojt) => {
    setSelectedOjt(ojt);
    setApplication(true);
  };

  const handleCloseForm = () => setApplication(false);

  useEffect(() => {
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
    if (studentInfo) {
      setUserName(studentInfo.full_name || "User");
      setStudentNumberFetch(studentInfo.student_number || "");
      setCourse(studentInfo.course || "");
      setYearLevel(studentInfo.year_level || "");

      console.log(course);
    }
  }, []); // Empty array ensures useEffect runs only once

  useEffect(() => {
    const fetchOjtCompany = async () => {
      const userInfo = JSON.parse(localStorage.getItem("studentInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(
          `${APP_URL}/api/user-display-ojt-companies`,
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
        setCompany(data);
      } catch (error) {
        toast.error("Error fetching Job Opportunities");
        console.error("Error fetching Job Opportunities: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOjtCompany();
    const interval = setInterval(fetchOjtCompany, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("studentInfo"));
    if (userInfo) {
      setStudentNumber(userInfo.student_number); // populate the student_number from userInfo
      setStudentName(userInfo.full_name); // populate the student name from userInfo
    }
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const studentNumber = e.target[0].value;
    const studentName = e.target[1].value;
    const studentEmail = e.target[2].value;
    const companyName = e.target[3].value;
    const head = e.target[4].value;
    const address = e.target[5].value;
    const email = e.target[6].value;
    const info = e.target[7].value;

    setLoading(true);

    if (Number(yearLevel) !== 4) {
      toast.info("You should be in 4th year to refer a company for OJT");
      return; // Stop further execution
    } else {
      try {
        const response = await fetch(`${APP_URL}/api/save-company-referral`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_number: studentNumber, // include student_number in the payload
            student_name: studentName,
            studentEmail,
            company_name: companyName,
            head,
            address,
            email,
            info,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to save referral.");
        }

        formRef.current.reset();
        toast.success("Company referral saved successfully!");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while saving the referral.");
      } finally {
        setLoading(false); // Stop loading when done
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const response = await fetch(`${APP_URL}/api/apply-ojt`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // window.location.reload();
        toast.success("Form submitted successfully:", data);
        handleCloseForm();
        reset();
      } else {
        toast.error("Unable to send form. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const [searchTerm, setSearchTerm] = useState(""); // State for the search term

  // Filter companies based on the search term
  const filteredCompanies = company.filter((ojt) =>
    ojt.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [studentApplications, setStudentApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `${APP_URL}/api/get-student-applications`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_number: studentNumberFetch,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applications.");
        }

        const data = await response.json();
        setStudentApplications(data.applications);
        setIsAccepted(data.isAccepted); // Set the accepted status flag
        console.log(data.isAccepted);
        // console.log(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load applications.");
      }
    };

    fetchApplications();

    const interval = setInterval(fetchApplications, 1000);

    return () => clearInterval(interval);
  }, [studentNumberFetch]);

  const isButtonDisabled = () => {
    return studentApplications.some(
      (application) => application.status === "accepted"
    );
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <div>
        <section className="job-opportunities-section ojt-opportunities-section">
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
                    className="find-btn col-5 col-sm-3 col-md-3 col-lg-2 col-xl-2"
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
                    filteredCompanies.map((ojt) => (
                      <Card
                        key={ojt.id}
                        className="company-card"
                        style={{
                          display:
                            ojt.slots_available - ojt.accepted === 0
                              ? "none"
                              : "flex",
                        }}
                      >
                        <Card.Img
                          className="company-card-img"
                          variant="top"
                          src={`${APP_URL}/storage/${ojt.logo}`}
                        />
                        <Card.Body>
                          <Card.Title>{ojt.company_name}</Card.Title>
                          <Card.Text className="company-card-text">
                            <h5 className="card-desc-title">
                              Company President:
                            </h5>
                            <ul className="job-desc-ul">
                              <li style={{ textTransform: "capitalize" }}>
                                {ojt.company_president}
                              </li>
                            </ul>

                            <h5 className="card-desc-title">
                              Available Slots:
                            </h5>
                            <ul
                              className="job-desc-ul"
                              style={{ textTransform: "capitalize" }}
                            >
                              <li>{ojt.slots_available - ojt.accepted}</li>
                            </ul>

                            <h5 className="card-desc-title">
                              Deployment Location(s):
                            </h5>
                            <ul className="job-desc-ul">
                              {ojt.deployment_location
                                .split("/")
                                .map((location, index) => (
                                  <li
                                    key={index}
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    {location.trim()}
                                  </li>
                                ))}
                            </ul>

                            <h5 className="card-desc-title">Contacts:</h5>
                            <ul className="job-desc-ul">
                              <li style={{ textTransform: "capitalize" }}>
                                {ojt.address}
                              </li>
                              {ojt.email && <li>{ojt.email}</li>}
                              {ojt.phone && (
                                <li style={{ textTransform: "capitalize" }}>
                                  {ojt.phone}
                                </li>
                              )}
                            </ul>
                          </Card.Text>
                          <Button
                            // variant="primary"
                            className="card-btn company-card-btn ojt-apply-button"
                            onClick={() => {
                              if (Number(yearLevel) !== 4) {
                                toast.info(
                                  "You should be in 4th year to apply for OJT"
                                );
                              } else if (isAccepted) {
                                toast.info(
                                  "You have already sent an application to a company"
                                );
                              } else {
                                handleViewForm({
                                  ...ojt,
                                  userName,
                                  studentNumberFetch,
                                  course,
                                  yearLevel,
                                });
                              }
                            }}
                          >
                            Apply
                          </Button>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <p style={{ textAlign: "center" }}>
                      No companies available at the moment for OJT.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          <section className="contact-section">
            <div className="contact-content ojt-change-padding">
              <div className="row justify-content-between">
                <div className="contact-details col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5">
                  <div className="contact-overview ojt-refer-title">
                    <h1 className="fw-bold">
                      Can't Find the Company You're Looking For?
                    </h1>
                    <p>
                      Do you have a preferred company where you'd like to do
                      your On-the-Job Training (OJT)? We want to hear your
                      suggestions! Please fill out the form below to recommend a
                      company that aligns with your career goals and interests.
                      Your input is invaluable in helping us connect you with
                      the right opportunities. Thank you for sharing your
                      preferences with us!
                    </p>
                  </div>

                  <hr />
                </div>

                <div className="contact-input col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5">
                  <div className="contact-text">
                    <h4>Company Referral Form</h4>
                    <p>
                      Fill up the form about the company's details of your
                      choosing so we can contact them!
                    </p>
                  </div>

                  <form ref={formRef} onSubmit={handleFormSubmit}>
                    <div className="row justify-content-between">
                      <input
                        type="hidden"
                        name="student_number"
                        value={studentNumber}
                      />
                      <input
                        type="hidden"
                        name="student_name"
                        value={studentName}
                      />
                      <input
                        type="text"
                        placeholder="Your Email"
                        className="form-control mb-3"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="form-control mb-3"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Head of the Company"
                        className="form-control mb-3"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        className="form-control mb-3"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email of HR"
                        className="form-control mb-3"
                        required
                      />
                      <textarea
                        placeholder="Company Information"
                        className="form-control mb-3"
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <div className="submit-btn text-center">
                      <button type="submit" className="btn btn-primary">
                        Send Referral
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </section>
      </div>

      {/* Modal for the application form */}
      <Modal
        show={application}
        onHide={() => setApplication(false)}
        backdrop="static"
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedOjt?.company_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="company_display"
                value={selectedOjt?.company_name || ""}
                disabled // Makes the dropdown readonly and non-clickable
                // onChange={handleFormChange}
                required
              />

              {/* Hidden input to send the value */}
              <input
                type="hidden"
                name="company_name"
                value={selectedOjt?.company_id || ""}
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Company President</Form.Label>
              <Form.Control
                type="text"
                name="company_president"
                value={selectedOjt?.company_president}
                disabled // Makes the dropdown readonly and non-clickable
                // onChange={handleFormChange}
                required
              />

              {/* Hidden input to send the value */}
              <input
                type="hidden"
                name="company_president"
                value={selectedOjt?.company_president || ""}
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                type="text"
                name="student_name_display"
                value={selectedOjt?.userName}
                // onChange={handleFormChange}
                disabled
                required
              />

              {/* Hidden input to send the value */}
              <input
                type="hidden"
                name="student_name"
                value={selectedOjt?.userName || ""}
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Student Number</Form.Label>
              <Form.Control
                type="text"
                name="student_number_display"
                value={selectedOjt?.studentNumberFetch}
                // onChange={handleFormChange}
                disabled
                required
              />

              {/* Hidden input to send the value */}
              <input
                type="hidden"
                name="student_number"
                value={selectedOjt?.studentNumberFetch || ""}
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Control
                type="text"
                name="course_display"
                value={selectedOjt?.course}
                // onChange={handleFormChange}
                disabled
                required
              />

              {/* Hidden input to send the value */}
              <input
                type="hidden"
                name="course"
                value={selectedOjt?.course || ""}
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Student Email *</Form.Label>
              <Form.Control
                type="text"
                name="student_email"
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            {/* <Form.Group className="mb-3">
              <Form.Label>CV (optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf"
                name="cv"
                // {...register("file")}
                // required
              />
            </Form.Group> */}

            {/* <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Cover Letter (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                type="text"
                name="cover_letter"
                placeholder="Write Cover Letter here..."
              />
            </Form.Group> */}

            <Form.Control
              type="hidden"
              name="year_level"
              value={selectedOjt?.yearLevel}
            />

            <Form.Control
              type="hidden"
              name="company_address"
              value={selectedOjt?.address}
            />

            <Form.Control
              type="hidden"
              name="company_email"
              value={selectedOjt?.email}
            />

            <Form.Control
              type="hidden"
              name="company_phone"
              value={selectedOjt?.phone}
            />

            <Form.Control
              type="hidden"
              name="deployment_location"
              value={selectedOjt?.deployment_location}
            />

            <Button
              variant="primary"
              type="submit"
              className="mt-4 application-btn-submit ojt-apply-button"
              disabled={loading}
            >
              {loading ? "Submitting Application ..." : "Submit Application"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
