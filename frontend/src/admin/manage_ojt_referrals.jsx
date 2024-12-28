import { useEffect, useState } from "react";
import Title from "../admin/components/title";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

export default function OjtReferrals() {
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState(null);
  const [selectedReferralDelete, setSelectedReferralDelete] = useState({
    student_number: "",
    company_name: "",
    head: "",
    address: "",
    email: "",
    info: "",
    status: "",
    submitted_at: "",
  });

  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const handleViewDetail = (r) => {
    setSelectedReferral(r);
    setShowDetails(true);
  };

  const handleCloseDetail = () => setShowDetails(false);

  const APP_URL = import.meta.env.VITE_APP_URL;

  const fetchOjtReferral = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    try {
      const response = await fetch(`${APP_URL}/api/ojt-referrals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setReferral(data);
      setFilteredReferrals(data); // Set initial data for filtered referrals
    } catch (error) {
      toast.error("Error fetching OJT Referrals");
      console.error("Error fetching OJT Referrals: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOjtReferral();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    try {
      const response = await fetch(`${APP_URL}/api/update-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Status updated successfully!");

        // Update the local state to reflect the change
        setReferral((prevReferral) =>
          prevReferral.map((ref) =>
            ref.id === id ? { ...ref, status: newStatus } : ref
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
        `${APP_URL}/api/delete-referral/${selectedReferralId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete referral."}`
        // );
        throw new Error("Failed to delete referral");
      }

      // Remove the deleted contact from the state
      setReferral((prevReferrals) =>
        prevReferrals.filter((referral) => referral.id !== selectedReferralId)
      );

      toast.success("Referral deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting referral:", error);
      toast.error("An error occurred while deleting the referral.");
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

    setFilteredReferrals(filtered);
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

    setFilteredReferrals(filtered);
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
        <Title title="OJT Company Referrals" />

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
                <th className="text-center col-lg-2 col-xl-2">Referred by</th>
                <th className="col-lg-3 col-xl-3">Company Name</th>
                <th className="col-lg-3 col-xl-3">HR Email</th>
                <th className="col-lg-2 col-xl-2">Submitted at</th>
                <th className="col-lg-1 col-xl-1">Status</th>
                <th className="text-center col-lg-1 col-xl-1">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="loading-text" colSpan="12">
                  <td>Loading OJT Company Referrals ...</td>
                </tr>
              ) : paginatedReferrals.length > 0 ? (
                paginatedReferrals.map((r) => (
                  <tr key={r.id}>
                    <td className="text-center">{r.student_name}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {r.company_name}
                    </td>
                    <td>{r.email}</td>
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
                      <i
                        className="fa fa-eye"
                        onClick={() => handleViewDetail(r)}
                      ></i>
                      <i
                        className="fa fa-trash"
                        onClick={() => {
                          setSelectedReferralDelete({
                            student_number: r.student_number,
                            company_name: r.company_name,
                            head: r.head,
                            address: r.address,
                            email: r.email,
                            info: r.info,
                            status: r.status,
                            submitted_at: r.submitted_at,
                          });
                          setSelectedReferralId(r.id);
                          handleShowDelete();
                        }}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No Referrals Found.</td>
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
          <Modal.Title>Referred Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Status:{""}
            <span style={{ textTransform: "capitalize" }}>
              {selectedReferral?.status}
            </span>
          </h6>
          <h6 className="view-label">
            Student Name: <span>{selectedReferral?.student_name}</span>
          </h6>
          <h6 className="view-label">
            Student Number: <span>{selectedReferral?.student_number}</span>
          </h6>
          <h6 className="view-label">
            Student's Email: <span>{selectedReferral?.student_email}</span>
          </h6>
          <h6 className="view-label">
            Submitted at:{""}
            <span>
              {selectedReferral?.submitted_at
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(selectedReferral.submitted_at))
                : "N/A"}
            </span>
          </h6>
          <h6 className="view-label">
            Company Name:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedReferral?.company_name}
            </span>
          </h6>
          <h6 className="view-label">
            Company Head:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedReferral?.head}
            </span>
          </h6>
          <h6 className="view-label">
            Address:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {selectedReferral?.address}
            </span>
          </h6>
          <h6 className="view-label">
            HR Email:{""}
            <span>{selectedReferral?.email}</span>
          </h6>
          <h6 className="view-label">
            Company Information:{""}
            <span>{selectedReferral?.info}</span>
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
          Are you sure you want to delete referral{""}
          <p style={{ marginTop: "10px", marginBottom: "0" }}>
            <strong style={{ textTransform: "capitalize" }}>
              {selectedReferralDelete.company_name}
            </strong>{" "}
            by Student Number:{" "}
            <strong>{selectedReferralDelete.student_number}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Company Referral ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
