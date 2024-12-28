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
  const [companies, setCompany] = useState([]);

  const [searchTerm, setSearchTerm] = useState(""); // For search
  // const [sortOption, setSortOption] = useState(""); // For sort
  const [sortCategory, setSortCategory] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const [selectedOjt, setSelectedOjt] = useState(null);
  const [selectedOjtEdit, setSelectedOjtEdit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose_add = () => {
    reset(), setShow(false);
  };
  const handleShow_add = () => setShow(true);

  const [showDelete, setShowDelete] = useState(false);
  const [selectedOjtId, setSelectedOjtId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState({
    name: "",
    president: "",
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
        const response = await fetch(`${APP_URL}/api/ojt-companies`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setCompany(data);
      } catch (error) {
        toast.error("Error fetching OJT Company");
        console.error("Error fetching OJT Company: ", error);
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

    setLoading(true);

    // Create a new FormData object
    const formData = new FormData();

    // Append fields one by one
    formData.append("company_name", data.company_name);
    formData.append("company_president", data.company_president);
    formData.append("slots_available", data.slots_available);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    formData.append("deployment_location", data.deployment_location);
    // formData.append("link", data.link);

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
      const response = await fetch(`${APP_URL}/api/ojt-companies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${yourToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData); // Log error data for debugging
        toast.error(errorData.message || "Failed to add ojt company.");
      }

      const result = await response.json();
      toast.success(result.message);

      const newCompany = {
        id: result.ojtCompany.id,
        logo: result.ojtCompany.logo,
        company_name: result.ojtCompany.company_name,
        company_president: result.ojtCompany.company_president,
        address: result.ojtCompany.address,
        slots_available: result.ojtCompany.slots_available,
        email: result.ojtCompany.email,
        phone: result.ojtCompany.phone,
        // link: result.ojtCompany.link,
        deployment_location: result.ojtCompany.deployment_location,
      };

      setCompany((prevCompanies) => [newCompany, ...prevCompanies]);

      handleClose_add();
      reset(); // Reset the form after submission
    } catch (error) {
      toast.error("An error occurred while adding the ojt company.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (company) => {
    setSelectedOjt(company);
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
        `${APP_URL}/api/ojt-companies/${selectedOjtId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete ojt company."}`
        // );
        throw new Error("Failed to delete ojt company");
      }

      // Remove the deleted contact from the state
      setCompany((prevCompanies) =>
        prevCompanies.filter((ojt) => ojt.id !== selectedOjtId)
      );

      toast.success("Ojt Company deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting ojt company:", error);
      toast.error("An error occurred while deleting the ojt company.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    const formData = new FormData();
    formData.append("company_name", data.company_name);
    formData.append("company_president", data.company_president);
    formData.append("address", data.address);
    formData.append("slots_available", data.slots_available);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    // formData.append("link", data.link);
    formData.append("deployment_location", data.deployment_location);

    if (data.logo && data.logo[0]) {
      formData.append("logo", data.logo[0]);
    }

    try {
      const response = await fetch(
        `${APP_URL}/api/update-ojt-companies/${selectedOjtId}`,
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

      const updatedOjt = await response.json();
      toast.success("OJT Company updated successfully");

      setCompany((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === selectedOjtId
            ? {
                ...company,
                company_name: data.company_name,
                company_president: data.company_president,
                address: data.address,
                slots_available: data.slots_available,
                email: data?.email || "No email",
                phone: data?.phone || "No phone",
                deployment_location: data.deployment_location,
                // link: data.link,
                logo: updatedOjt.logo || company.logo,
              }
            : company
        )
      );

      reset();
      setSelectedOjtId(null);
      setImgPreview(null);
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating job opportunity:", error);
      toast.error(`Error updating job opportunity: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (company) => {
    console.log("Editing Company ID:", company.id); // Debugging line
    setSelectedOjtEdit(company); // Set the selected OJT for editing
    setSelectedOjtId(company.id); // Keep track of the selected company ID
    setValue("company_name", company.company_name);
    setValue("company_president", company.company_president);
    setValue("address", company.address);
    setValue("slots_available", company.slots_available);
    setValue("email", company.email || "");
    setValue("phone", company.phone || "");
    setValue("deployment_location", company.deployment_location);
    // setValue("link", company.link);
    setImgPreview(`${APP_URL}/storage/${company.logo}`);
  };

  // Make sure to reset state variables in handleClose
  const handleCloseEditModal = () => {
    setSelectedOjtEdit(null);
    reset(); // Reset form to clear inputs
    setImgPreview(null); // Clear image preview
  };

  const filteredComp = companies
    .filter((comp) =>
      comp.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((comp) =>
      sortCategory ? comp.category_id === parseInt(sortCategory) : true
    );

  // Handle search change (reset to first page)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination logic
  const paginatedComp = filteredComp.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredComp.length / rowsPerPage);

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

  const [showSlotsModal, setShowSlotsModal] = useState(false);

  const handleShowSlotsModal = (company) => {
    setSelectedCompany(company);
    setShowSlotsModal(true);
  };

  const handleCloseSlotsModal = () => {
    // setSelectedCompany(null);
    setShowSlotsModal(false);
  };

  const handleSlotsSaveChanges = async (e) => {
    e.preventDefault();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    const updatedSlots = e.target.elements.slots_available.value;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/update-slots/${selectedCompany.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slots_available: updatedSlots }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update slots");
      }

      const data = await response.json();
      const updatedAvailableSlots = data.slots_available - data.accepted;
      toast.success("Slots updated successfully");

      setCompany((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === selectedCompany.id
            ? {
                ...company,
                slots_available: data.slots_available,
                accepted: data.accepted,
                availableSlots: updatedAvailableSlots,
              }
            : company
        )
      );

      handleCloseSlotsModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage OJT Companies" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add OJT Company</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end justify-content-between">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">OJT Companies List Table</h5>
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
                <th className="col-lg-4 col-xl-4">Address</th>
                <th className="col-lg-1 col-xl-1">Slots</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="loading-text" colSpan="12">
                  <td>Loading OJT Companies ...</td>
                </tr>
              ) : paginatedComp.length > 0 ? (
                paginatedComp
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((company) => (
                    <tr key={company.id}>
                      <td className="text-center">
                        <img
                          src={`${APP_URL}/storage/${company.logo}`}
                          alt={company.logo}
                          style={{ width: "50px" }}
                        />
                      </td>
                      <td>{company.company_name}</td>
                      <td>{company.address}</td>
                      <td className="td-has-button">
                        {" "}
                        <button
                          onClick={() => handleShowSlotsModal(company)}
                          className="btn btn-link p-0"
                        >
                          {company.slots_available - company.accepted}
                        </button>{" "}
                      </td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-eye"
                          onClick={() => handleViewDetail(company)}
                        ></i>
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEditClick(company)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedCompany({
                              name: company.company_name,
                              president: company.company_president,
                            });
                            setSelectedOjtId(company.id);
                            handleShowDelete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5">No OJT Companies Found.</td>
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
            Add OJT Company
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
              <Form.Label>Company President *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name of Company President"
                {...register("company_president", {
                  required: "Company President is required",
                })}
              />
            </Form.Group>
            {errors.company_president && (
              <p className="text-danger">{errors.company_president.message}</p>
            )}

            {/* <Form.Group className="mb-3">
              <Form.Label>Hyperlink *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Hyperlink to application"
                {...register("link", {
                  required: "Hyperlink is required",
                })}
              />
            </Form.Group>
            {errors.link && (
              <p className="text-danger">{errors.link.message}</p>
            )} */}

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
              <Form.Label>Slots Available *</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Number of Vacant Slots"
                {...register("slots_available", {
                  required: "Slots Available is required",
                })}
              />
            </Form.Group>
            {errors.slots_available && (
              <p className="text-danger">{errors.slots_available.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email (optional)</Form.Label>
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
              <Form.Label>Phone Number (optional)</Form.Label>
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
              <Form.Label>Locations for deployment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                placeholder="ex: Address 1 / Address 2 / Address 3"
                {...register("deployment_location")}
              />
            </Form.Group>
            {errors.deployment_location && (
              <p className="text-danger">
                {errors.deployment_location.message}
              </p>
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
                {loading ? "Adding Company ..." : "Add Company"}
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
          <Modal.Title>OJT Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Company Name: <span>{selectedOjt?.company_name}</span>
          </h6>
          <h6 className="view-label">
            Company_id: <span>{selectedOjt?.company_id}</span>
          </h6>
          <h6 className="view-label">
            Company President:{" "}
            <span>
              {selectedOjt?.company_president ? (
                selectedOjt?.company_president
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
          {/* <h6 className="view-label">
            Hyperlink:
            <a
              href={`https://${selectedOjt?.link}`} // Prepend with 'https://'
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault(); // Prevent the default anchor click behavior
                window.open(`https://${selectedOjt?.link}`, "_blank"); // Open link in a new tab
              }}
            >
              <span>Open Url</span>
            </a>
          </h6> */}
          <h6 className="view-label">
            Address: <span>{selectedOjt?.address}</span>
          </h6>
          <h6 className="view-label">
            Slots Available:{" "}
            <span>{selectedOjt?.slots_available - selectedOjt?.accepted}</span>
          </h6>
          <h6 className="view-label">
            Email:
            <span>
              {selectedOjt?.email ? (
                selectedOjt.email
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
          <h6 className="view-label">
            Phone Number:
            <span>
              {selectedOjt?.phone ? (
                selectedOjt.phone
              ) : (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
          <h6 className="view-label">
            Location(s) for deployment:
            <span>
              <ul style={{ marginTop: "10px" }}>
                {selectedOjt?.deployment_location
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
          Are you sure you want to delete?
          <p style={{ marginTop: "10px", marginBottom: "0" }}>
            <strong style={{ textTransform: "capitalize" }}>
              {selectedCompany.name}
            </strong>{" "}
            with Company President: <strong>{selectedCompany.president}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Company ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Job Opportunity */}
      <Modal
        show={selectedOjtEdit !== null}
        onHide={handleCloseEditModal}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Job Opportunity</Modal.Title>
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
              <Form.Label>Company President</Form.Label>
              <Form.Control
                type="text"
                {...register("company_president", { required: true })}
              />
              {errors.company_president && (
                <p className="text-danger">Company President is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="hidden"
                {...register("slots_available", { required: true })}
              />
              {errors.slots_available && (
                <p className="text-danger">Slots Available is required</p>
              )}
            </Form.Group>

            {/* <Form.Group className="mb-3">
              <Form.Label>Hyperlink</Form.Label>
              <Form.Control
                type="text"
                {...register("link", { required: true })}
              />
              {errors.link && (
                <p className="text-danger">Hyperlink is required</p>
              )}
            </Form.Group> */}

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
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" {...register("email")} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" {...register("phone")} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deployment Location(s)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                {...register("deployment_location", { required: true })}
              />
              {errors.deployment_location && (
                <p className="text-danger">Job Offer(s) is required</p>
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

      <Modal show={showSlotsModal} onHide={handleCloseSlotsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Slots</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSlotsSaveChanges}>
          <Modal.Body>
            <Form.Group controlId="slots_available">
              <Form.Label>Slots Available</Form.Label>
              <Form.Control
                type="number"
                name="slots_available"
                // defaultValue={selectedCompany?.slots_available}
                min="0"
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="delete-noForm">
            <Button
              variant="primary"
              type="submit"
              className="modal-btn"
              disabled={loading}
            >
              {loading ? "Updating Slots ..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
