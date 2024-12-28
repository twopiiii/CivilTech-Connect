import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Title from "../admin/components/title";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "../css/admin/form.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TesdaCategories() {
  const [show, setShow] = useState(false);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(""); // For search
  const [sortCenter, setSortCenter] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const [selectedTrainingCenter, setSelectedTrainingCenter] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [edit_selectedCenter, set_editSelectedCenter] = useState({
    title: "",
    description: "",
  });
  const [edit_selectedCenterId, set_editSelectedCenterId] = useState(null);

  const handleClose_add = () => setShow(false);
  const handleShow_add = () => {
    reset({ training_center: "", address: "", email: "", phone: "" });
    setShow(true);
  };

  const [showDelete, setShowDelete] = useState(false);
  const handleClose_delete = () => setShowDelete(false);
  const handleShow_delete = () => setShowDelete(true);

  const [showEdit, setShowEdit] = useState(false); // State for edit modal
  const handleClose_edit = () => setShowEdit(false); // Close edit modal
  const handleShow_edit = () => setShowEdit(true); // Open edit modal

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchCenter = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/training-centers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch Training Centers");

        const data = await response.json();
        setCenters(data);
      } catch (error) {
        console.error("Error fetching training centers:", error);
        toast.error("Failed to load Training Centers");
      } finally {
        setLoading(false);
      }
    };

    fetchCenter();
  }, []);

  const onSubmit = async (data) => {
    console.log(data); // Log the form data

    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Retrieve user info
    const yourToken = userInfo.token; // Get the token

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/tesda-training-center`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`, // Include the token here
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server responded with an error:", errorResponse);
        toast.error(
          `Error: ${errorResponse.message || "Something went wrong!"}`
        );
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      toast.success(result.message);

      const newCenter = {
        id: result.center.id,
        training_center: result.center.training_center,
        center_id: result.center.center_id,
        address: result.center.address,
        email: result.center.email,
        phone: result.center.phone,
      };

      setCenters((prevCenter) => {
        if (!Array.isArray(prevCenter)) {
          // console.error("prevCenter is not an array:", prevCenter);
          return [newCenter];
        }
        return [newCenter, ...prevCenter];
      });

      reset();
      handleClose_add();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/delete-training-center/${selectedCenterId}`,
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
        toast.error(
          `Error: ${
            errorResponse.message || "Failed to delete Training Center."
          }`
        );
        throw new Error("Failed to delete Training Center");
      }

      // Remove the deleted contact from the state
      setCenters((prevCenters) =>
        prevCenters.filter((center) => center.id !== selectedCenterId)
      );

      toast.success("Training Center deleted successfully.");
      handleClose_delete();
    } catch (error) {
      console.error("Error deleting Training Center:", error);
      toast.error("An error occurred while deleting the Training Center.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (center) => {
    set_editSelectedCenter(center.training_center);
    set_editSelectedCenterId(center.id);
    setValue("training_center", center.training_center || "");
    setValue("email", center.email || "");
    setValue("phone", center.phone || "");
    setValue("address", center.address);

    // Open the edit modal
    handleShow_edit();
  };

  const onSubmitEdit = async (data) => {
    // console.log(data);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/edit-training-center/${edit_selectedCenterId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server responded with an error:", errorResponse);
        toast.error(
          `Error: ${errorResponse.message || "Something went wrong!"}`
        );
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      // console.log(result); // Log the result
      toast.success(result.message);
      reset();
      handleClose_edit();

      // Optionally refresh categories
      setCenters((prevCenters) =>
        prevCenters.map((center) =>
          center.id === edit_selectedCenterId // Compare with edit_selectedCenterId
            ? { ...center, ...data }
            : center
        )
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers
    .filter((center) =>
      center.training_center.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((center) =>
      sortCenter ? String(center.category_id) === String(sortCenter) : true
    );

  // Ensure categories are valid strings for comparison
  const sortedCourses = filteredCenters.sort((a, b) => {
    if (sortCenter) {
      const centerA = a.center ? String(a.center) : ""; // Convert to string or fallback to empty string
      const centerB = b.center ? String(b.center) : ""; // Same here

      console.log("Category A:", centerA, "Category B:", centerB); // Debug logging
      return centerA.localeCompare(centerB);
    }
    return b.id - a.id; // Default sort by descending ID
  });

  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const displayedCourses = paginatedCourses;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleSortChange = (e) => {
    setSortCenter(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const totalPages = Math.ceil(sortedCourses.length / rowsPerPage);
  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage TESDA Training Centers" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Center</button>
            {/* <button>Sort Category</button> */}
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end justify-content-between">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">TESDA Training Center List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3">
              <label htmlFor="searchInput">Search Center</label>
              <input
                id="searchInput"
                placeholder="Search by Center"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="col-lg-3 col-xl-3">Center</th>
                <th className="col-lg-1 col-xl-1">Center ID</th>
                <th className="col-lg-3 col-xl-3">Address</th>
                <th className="col-lg-2 col-xl-2">Email</th>
                <th className="col-lg-2 col-xl-2">PhoneNo.</th>
                <th className="col-lg-1 col-xl-1 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading Training Centers ...
                  </td>
                </tr>
              ) : displayedCourses.length > 0 ? (
                displayedCourses
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((center) => (
                    <tr key={center.id}>
                      <td>{center.training_center}</td>
                      <td>{center.center_id}</td>
                      <td>{center.address}</td>
                      <td>
                        {center.email || (
                          <span className="no-desc">No email</span>
                        )}
                      </td>
                      <td>
                        {center.phone || (
                          <span className="no-desc">No email</span>
                        )}
                      </td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(center)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedTrainingCenter(center.training_center);
                            setSelectedCenterId(center.id);
                            handleShow_delete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="12">No training centers available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from(
              { length: Math.ceil(centers.length / rowsPerPage) },
              (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              )
            )}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(centers.length / rowsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(centers.length / rowsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Modal For Add Category */}
      <Modal
        show={show}
        onHide={handleClose_add}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">
            Add Trainig Center for TESDA Courses
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Training Center *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Traing Center Name"
                {...register("training_center", {
                  required: "Traing Center name is required",
                })}
              />
            </Form.Group>
            {errors.training_center && (
              <p className="text-danger">{errors.training_center.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Address"
                {...register("address", {
                  required: "Address is required",
                })}
              />
            </Form.Group>
            {errors.address && (
              <p className="text-danger">{errors.address.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Email"
                {...register("email")}
              />
            </Form.Group>
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Phone No. (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Phone Number"
                {...register("phone")}
              />
            </Form.Group>
            {errors.phone && (
              <p className="text-danger">{errors.phone.message}</p>
            )}

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="add-btn"
                disabled={loading}
              >
                {loading ? "Adding Training Center ..." : "Add Training Center"}
              </Button>
              {/* <Button variant="secondary" onClick={handleClose_add}>
            Close
          </Button> */}
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for deleting category */}
      <Modal
        show={showDelete}
        onHide={handleClose_delete}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Training Center</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete Training Center:{" "}
          <strong>{selectedTrainingCenter}</strong>?
        </Modal.Body>

        <Modal.Footer className="delete-noForm">
          <Button
            variant="primary"
            className="modal-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting Training Center ..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal For Edit Category */}
      <Modal
        show={showEdit}
        onHide={handleClose_edit}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Training Center</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitEdit)}>
            <Form.Group className="mb-3">
              <Form.Label>Training Center</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter training center"
                {...register("training_center")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                {...register("address")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter email"
                {...register("email")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone no."
                {...register("phone")}
              />
            </Form.Group>

            <Modal.Footer>
              <Button
                className="modal-btn"
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating Info ..." : "Update Training Center"}{" "}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
