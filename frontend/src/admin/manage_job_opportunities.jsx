import Title from "../admin/components/title";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "../css/admin/form.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ManageFounders from "./manage_founder";

export default function ManageJobOpportunities() {
  const [loading, setLoading] = useState(true);
  const [imgPreview, setImgPreview] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState(""); // For search
  // const [sortOption, setSortOption] = useState(""); // For sort
  const [sortCategory, setSortCategory] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobEdit, setSelectedJobEdit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose_add = () => {
    reset(), setShow(false);
  };
  const handleShow_add = () => setShow(true);

  const [showDelete, setShowDelete] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState({
    name: "",
    offers: "",
  });

  // reset({ logo: "", company: "", job_offer: "", contact: "", address: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchJobOpportunities = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/job-opportunities`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
          },
        });

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

  const handleAddJob = async (data) => {
    // console.log("Received Form Data:", data); // Log the entire form data

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    // Create a new FormData object
    const formData = new FormData();

    setLoading(true);

    // Append fields one by one
    formData.append("company_name", data.company_name);
    formData.append("link", data.link);
    formData.append("company_description", data.company_description);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    formData.append("job_offers", data.job_offers);

    // Check and append logo if available
    if (data.logo && data.logo[0]) {
      formData.append("logo", data.logo[0]);
      console.log("Appended logo:", data.logo[0]);
    } else {
      console.log("No logo selected.");
    }

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Make the POST request with FormData
    try {
      const response = await fetch(`${APP_URL}/api/job-opportunities`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData); // Log error data for debugging
        // toast.error(errorData.message || "Failed to add job opportunity.");
      }

      const result = await response.json();
      toast.success(result.message);

      const newJob = {
        id: result.jobOpportunity.id,
        logo: result.jobOpportunity.logo,
        company_name: result.jobOpportunity.company_name,
        address: result.jobOpportunity.address,
        email: result.jobOpportunity.email,
        phone: result.jobOpportunity.phone,
        link: result.jobOpportunity.link,
        company_description: result.jobOpportunity.company_description,
        job_offers: result.jobOpportunity.job_offers,
      };

      setJobs((prevJobs) => [newJob, ...prevJobs]);

      handleClose_add();
      reset(); // Reset the form after submission
    } catch (error) {
      toast.error("Failed to add job opportunity..");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (job) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const handleCloseDetail = () => setShowDetails(false);

  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/job-opportunities/${selectedJobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();

        // toast.error(
        //   `Error: ${
        //     errorResponse.message || "Failed to delete job opportunity."
        //   }`
        // );
        throw new Error("Failed to delete job opportunity");
      }

      // Remove the deleted contact from the state
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== selectedJobId));

      toast.success("Job Opportunity deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting job opportunity:", error);
      toast.error("An error occurred while deleting the job opportunity.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    const formData = new FormData();

    setLoading(true);

    formData.append("company_name", data.company_name);
    formData.append("link", data.link);
    formData.append("company_description", data.company_description);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    formData.append("job_offers", data.job_offers);

    if (data.logo && data.logo[0]) {
      formData.append("logo", data.logo[0]);
    }

    try {
      const response = await fetch(
        `${APP_URL}/api/update-job-opportunities/${selectedJobEdit}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${yourToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, ${JSON.stringify(
            errorData.errors
          )}`
        );
      }

      const updatedJob = await response.json();
      toast.success("Job Opportunity updated successfully");

      setJobs((prevJobs) =>
        prevJobs.map((jobOpportunity) =>
          jobOpportunity.id === selectedJobEdit
            ? {
                ...jobOpportunity,
                company_name: data.company_name, // Fix the field name here
                link: data?.link || "No link",
                company_description: data.company_description,
                email: data?.email || "No email",
                phone: data?.phone || "No phone",
                address: data.address,
                job_offers: data.job_offers,
                logo: updatedJob.logo || data.logo,
              }
            : jobOpportunity
        )
      );

      reset();
      setSelectedJobEdit(null);
      setImgPreview(null);
    } catch (error) {
      console.error("Error updating job opportunity:", error);
      toast.error(`Error updating job opportunity: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (jobOpportunity) => {
    setSelectedJobEdit(jobOpportunity.id);
    setValue("company_name", jobOpportunity.company_name);
    setValue("link", jobOpportunity.link || "");
    setValue("company_description", jobOpportunity.company_description);
    setValue("email", jobOpportunity.email || "");
    setValue("phone", jobOpportunity.phone || "");
    setValue("address", jobOpportunity.address);
    setValue("job_offers", jobOpportunity.job_offers || "");
    setImgPreview(`${APP_URL}/storage/${jobOpportunity.logo}`);
  };

  const filteredJobs = jobs
    .filter((jo) =>
      jo.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((jo) =>
      sortCategory ? jo.category_id === parseInt(sortCategory) : true
    );

  // Handle search change (reset to first page)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination logic
  const paginatedJo = filteredJobs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage Job Opportunities" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Job</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end justify-content-between">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">Job List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3">
              <label htmlFor="searchInput">Search Company Name</label>
              <input
                id="searchInput"
                placeholder="Search by Company Name"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th className="col-lg-2 col-xl-2">Logo</th>
                <th className="col-lg-3 col-xl-3">Company</th>
                <th className="col-lg-5 col-xl-5">Job Offers</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="loading-text" colSpan="12">
                  <td>Loading Job Opportunities ...</td>
                </tr>
              ) : paginatedJo.length > 0 ? (
                paginatedJo
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((job) => (
                    <tr key={job.id}>
                      <td className="text-center">
                        <img
                          src={`${APP_URL}/storage/${job.logo}`}
                          alt={job.logo}
                          style={{ width: "50px" }}
                        />
                      </td>
                      <td style={{ textTransform: "capitalize" }}>
                        {job.company_name}
                      </td>
                      <td>
                        {job.job_offers ? (
                          <>
                            {" "}
                            {job.job_offers
                              .split("/")
                              .map((offer, index) => offer.trim())
                              .join(", ")}
                          </>
                        ) : (
                          <span className="no-desc">N/A</span>
                        )}
                      </td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-eye"
                          onClick={() => handleViewDetail(job)}
                        ></i>
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEditClick(job)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedCompany({
                              name: job.company_name,
                              offers: job.job_offers,
                            });
                            setSelectedJobId(job.id);
                            handleShowDelete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5">No Jobs Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>

          {/* Render page numbers dynamically */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageClick(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </section>

      {/* Modal For Add Job Opportunity */}
      <Modal
        show={show}
        onHide={handleClose_add}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">
            Add Job Opportunities
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form
            onSubmit={handleSubmit(handleAddJob)}
            encType="multipart/form-data"
          >
            <Form.Group className="mb-3">
              <Form.Label>Comapany Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Company Name"
                {...register("company_name", {
                  required: "Company name is required",
                })}
              />
            </Form.Group>
            {errors.company_name && (
              <p className="text-danger">{errors.company_name.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter complete address"
                {...register("address")}
              />
            </Form.Group>
            {errors.address && (
              <p className="text-danger">{errors.address.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Company Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                placeholder="Enter description here"
                {...register("company_description")}
              />
            </Form.Group>
            {errors.company_description && (
              <p className="text-danger">
                {errors.company_description.message}
              </p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Hiring / Socmed Link *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter hyperlink"
                {...register("link", { required: true })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email </Form.Label>
              <Form.Control
                type="text"
                placeholder="ex: johndoe@gmail.com / janedoe@gmail.com"
                {...register("email")}
              />
            </Form.Group>
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Phone Number </Form.Label>
              <Form.Control
                type="text"
                placeholder="ex: 0995001112 / 0926777565"
                {...register("phone")}
              />
            </Form.Group>
            {errors.phone && (
              <p className="text-danger">{errors.phone.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Job Offers </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                placeholder="ex: Backhoe Operator / Site Checker / Auto Painter"
                {...register("job_offers", { required: false })}
              />
            </Form.Group>
            {errors.job_offers && (
              <p className="text-danger">{errors.job_offers.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Company Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                {...register("logo")}
                onChange={(e) => {
                  setImgPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              {imgPreview && (
                <div className="mt-2">
                  <img
                    src={imgPreview}
                    alt="Company Logo Preview"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </div>
              )}
            </Form.Group>
            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="add-btn"
                disabled={loading}
              >
                {loading ? "Adding Job ..." : "Add Job"}
              </Button>
              {/* <Button variant="secondary" onClick={handleClose_add}>
            Close
          </Button> */}
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for viewing job opportunity details */}
      <Modal
        show={showDetails}
        onHide={handleCloseDetail}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Job Opportunity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Company Name:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedJob?.company_name}
            </span>
          </h6>
          <h6 className="view-label">
            Address: <span>{selectedJob?.address}</span>
          </h6>
          <h6 className="view-label">
            Company Description: <span>{selectedJob?.company_description}</span>
          </h6>
          <h6 className="view-label">
            Hiring / Socmed Link:{" "}
            {selectedJob?.link ? (
              <a
                href={`https://${selectedJob?.link}`} // Prepend with 'https://'
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault(); // Prevent the default anchor click behavior
                  window.open(`https://${selectedJob?.link}`, "_blank"); // Open link in a new tab
                }}
              >
                <span>Open Url</span>
              </a>
            ) : (
              <span className="no-desc">N/A</span>
            )}
          </h6>
          <h6 className="view-label">
            Email:
            <span>
              {selectedJob?.email ? (
                <ul style={{ marginTop: "10px" }}>
                  {selectedJob?.email.split("/").map((e, index) => (
                    <li key={index} style={{ marginTop: "5px" }}>
                      {e.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
          <h6 className="view-label">
            Phone Number:
            <span>
              {selectedJob?.phone ? (
                <ul style={{ marginTop: "10px" }}>
                  {selectedJob?.phone.split("/").map((p, index) => (
                    <li key={index} style={{ marginTop: "5px" }}>
                      {p.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>

          <h6 className="view-label">
            Job Offers:
            <span>
              {selectedJob?.job_offers ? (
                <ul style={{ marginTop: "10px" }}>
                  {selectedJob?.job_offers.split("/").map((offer, index) => (
                    <li key={index} style={{ marginTop: "5px" }}>
                      {offer.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
        </Modal.Body>
      </Modal>

      {/* Delete Job Opportunity */}
      <Modal
        show={showDelete}
        onHide={handleCloseDelete}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {selectedCompany.name}
          </strong>
          ?{" "}
        </Modal.Body>
        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Job ..." : "Delete Job"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Job Opportunity */}
      <Modal
        show={selectedJobEdit !== null}
        onHide={() => {
          setSelectedJobEdit(null);
          reset();
        }}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit OJT Company</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmit(handleSubmitEdit)}
            encType="multipart/form-data"
          >
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                {...register("company_name", { required: true })}
              />
              {errors.company_name && (
                <p className="text-danger">Company Name is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                {...register("address", { required: true })}
              />
              {errors.address && (
                <p className="text-danger">Address is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company Description</Form.Label>
              <Form.Control
                type="text"
                {...register("company_description", { required: true })}
              />
              {errors.company_description && (
                <p className="text-danger">Company Description is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hiring / Socmed Link</Form.Label>
              <Form.Control type="text" {...register("link")} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" {...register("email")} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" {...register("phone")} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job Offers</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                {...register("job_offers", { required: false })}
              />
              {errors.job_offers && (
                <p className="text-danger">Job Offers is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                {...register("logo")}
                onChange={(e) => {
                  setImgPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              {imgPreview && (
                <div className="mt-2">
                  <img
                    src={imgPreview}
                    alt="Logo Preview"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </div>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                type="submit"
                variant="primary"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Updating Info ..." : "Save Changes"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
