import { useEffect, useState } from "react";
import Title from "./components/title";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

export default function OjtReferrals() {
  const [loading, setLoading] = useState(true);
  const [referral, setApplication] = useState([]);
  const [filteredReferrals, setFilteredApplication] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedApplicationDelete, setSelectedApplicationDelete] = useState({
    student_number: "",
    company_name: "",
    // head: "",
    // address: "",
    // email: "",
    // info: "",
    // status: "",
    // submitted_at: "",
  });

  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const handleViewDetail = (r) => {
    setSelectedApplication(r);
    setShowDetails(true);
  };

  const handleCloseDetail = () => setShowDetails(false);

  const APP_URL = import.meta.env.VITE_APP_URL;

  const fetchOjtApplication = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    try {
      const response = await fetch(`${APP_URL}/api/ojt-applications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setApplication(data);
      setFilteredApplication(data); // Set initial data for filtered referrals
    } catch (error) {
      toast.error("Error fetching OJT Applications");
      console.error("Error fetching OJT Applications: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOjtApplication();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    try {
      const response = await fetch(
        `${APP_URL}/api/update-application-status/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Status updated successfully!");

        // Update the local state to reflect the change
        setApplication((prevApplication) =>
          prevApplication.map((application) =>
            application.id === id
              ? { ...application, status: newStatus }
              : application
          )
        );
      } else {
        throw new Error(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating status.");
    }
  };

  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/delete-application/${selectedApplicationId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete application."}`
        // );
        throw new Error("Failed to delete application");
      }

      // Remove the deleted contact from the state
      setApplication((prevApplications) =>
        prevApplications.filter(
          (application) => application.id !== selectedApplicationId
        )
      );

      toast.success("Application deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting Application:", error);
      toast.error("An error occurred while deleting the Application.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase(); // Normalize search term
    setSearchTerm(term);

    // Filter referrals based on the company name
    const filtered = referral.filter((r) =>
      r.company_name.toLowerCase().includes(term)
    );

    setFilteredApplication(filtered);
  };

  useEffect(() => {
    let filtered = referral;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.company_name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredApplication(filtered);
  }, [statusFilter, searchTerm, referral]);

  // Pagination logic
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredReferrals.length / rowsPerPage);

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
        <Title title="OJT Applications" />

        <div className="table-container">
          <div className="row align-items-end">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">Student List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3 justify-content-end">
              <label htmlFor="searchInput">Search Company Name</label>
              <input
                type="text"
                placeholder="Search by Company Name"
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
              />
            </div>

            <div className="select-file-to-view col-lg-3 col-xl-3 justify-content-end">
              <label htmlFor="selectStatus">Sort by Status</label>
              <select
                id="selectStatus"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="referred">Referred</option>
                <option value="accepted">Accepted</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th className="text-center col-lg-3 col-xl-3">Student Name</th>
                <th className="col-lg-3 col-xl-3">Company Name</th>
                <th className="col-lg-2 col-xl-2">Submitted at</th>
                <th className="col-lg-1 col-xl-1">Status</th>
                <th className="text-center col-lg-2 col-xl-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="loading-text" colSpan="12">
                  <td>Loading OJT Company Applications ...</td>
                </tr>
              ) : paginatedReferrals.length > 0 ? (
                paginatedReferrals.map((r) => (
                  <tr key={r.id}>
                    <td className="text-center">{r.student_name}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {r.company_name}
                    </td>
                    <td>
                      {r.submitted_at
                        ? new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(r.submitted_at))
                        : "N/A"}
                    </td>
                    <td style={{ padding: "0" }}>
                      <select
                        style={{ width: "100%", padding: "8px" }}
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(r.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="referred">Referred</option>
                        <option value="accepted">Accepted</option>
                        <option value="denied">Denied</option>
                      </select>
                    </td>
                    <td className="text-center td-action">
                      {/* <a
                        href={`/storage/uploads/pdf/${encodeURIComponent(
                          r.cv
                        )}`} // The relative path from the public directory
                        download={r.cv || "file.pdf"} // Specify the filename for download
                        target="_blank" // Optional: Open in a new tab (not necessary for download)
                        rel="noopener noreferrer" // Optional: Security measure
                      >
                        <i
                          className="fa fa-file-pdf-o"
                          style={{ cursor: "pointer", color: "red" }}
                        ></i>
                      </a> */}

                      <i
                        className="fa fa-eye"
                        onClick={() => handleViewDetail(r)}
                      ></i>
                      <i
                        className="fa fa-trash"
                        onClick={() => {
                          setSelectedApplicationDelete({
                            student_number: r.student_number,
                            company_name: r.company_name,
                            student_name: r.student_name,
                            // head: r.head,
                            // address: r.address,
                            // email: r.email,
                            // info: r.info,
                            // status: r.status,
                            // submitted_at: r.submitted_at,
                          });
                          setSelectedApplicationId(r.id);
                          handleShowDelete();
                        }}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No Applications Found.</td>
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

      {/* Modal for viewing referral details */}
      <Modal
        show={showDetails}
        onHide={handleCloseDetail}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Status:{""}
            <span style={{ textTransform: "capitalize" }}>
              {selectedApplication?.status}
            </span>
          </h6>
          <h6 className="view-label">
            Student Name: <span>{selectedApplication?.student_name}</span>
          </h6>
          <h6 className="view-label">
            Student Number: <span>{selectedApplication?.student_number}</span>
          </h6>
          <h6 className="view-label">
            Student's Email: <span>{selectedApplication?.student_email}</span>
          </h6>
          <h6 className="view-label">
            Year Level: <span>{selectedApplication?.year_level}</span>
          </h6>
          <h6 className="view-label">
            Course: <span>{selectedApplication?.course}</span>
          </h6>
          <h6 className="view-label">
            Submitted at:{""}
            <span>
              {selectedApplication?.submitted_at
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(selectedApplication.submitted_at))
                : "N/A"}
            </span>
          </h6>
          <h6 className="view-label">
            Company Name:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedApplication?.company_name}
            </span>
          </h6>
          <h6 className="view-label">
            Company Head:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedApplication?.company_president}
            </span>
          </h6>
          <h6 className="view-label">
            Company Address:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedApplication?.company_address}
            </span>
          </h6>
          <h6 className="view-label">
            HR Email:{""}
            <span>
              {selectedApplication?.company_email ? (
                selectedApplication?.company_email
              ) : (
                <span className="no-desc">No Email</span>
              )}
            </span>
          </h6>
          <h6 className="view-label">
            Phone No.:{""}
            <span>
              {selectedApplication?.company_phone ? (
                selectedApplication?.company_phone
              ) : (
                <span className="no-desc">No Phone</span>
              )}
            </span>{" "}
          </h6>
          <h6 className="view-label">
            Location(s) for deployment:
            <span>
              <ul style={{ marginTop: "10px" }}>
                {selectedApplication?.deployment_location
                  .split("/")
                  .map((offer, index) => (
                    <li key={index} style={{ marginTop: "5px" }}>
                      {offer.trim()}
                    </li>
                  ))}
              </ul>
            </span>
          </h6>
        </Modal.Body>
      </Modal>

      {/* Delete Referral */}
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
          Are you sure you want to delete application for{""}
          <p style={{ marginTop: "10px", marginBottom: "0" }}>
            <strong style={{ textTransform: "capitalize" }}>
              {selectedApplicationDelete.company_name}
            </strong>{" "}
            by: <strong>{selectedApplicationDelete.student_name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Application ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
