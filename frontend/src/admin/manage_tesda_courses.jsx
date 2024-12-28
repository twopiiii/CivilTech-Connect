import Title from "../admin/components/title";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "../css/admin/form.css";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TesdaCourses() {
  const [show, setShow] = useState(false);

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trainingCenters, setTrainingCenters] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(""); // For search
  const [sortCategory, setSortCategory] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const handleClose_add = () => setShow(false);
  const handleShow_add = () => {
    setShow(true);
  };

  const [showDelete, setShowDelete] = useState(false);
  const handleClose_delete = () => setShowDelete(false);
  const handleShow_delete = () => setShowDelete(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/tesda-courses`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
          console.log("Fetched courses:", data.courses);
        } else {
          const errorResponse = await response.json();
          console.error("Error fetching courses:", errorResponse);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories for dropdown
    const fetchCategories = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(
          `${APP_URL}/api/tesda-categories`, // Assuming you have an API to fetch categories
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${yourToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories); // Set categories for the dropdown
          console.log("Fetched categories:", data.categories);
        } else {
          const errorResponse = await response.json();
          console.error("Error fetching categories:", errorResponse);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCourses();
    fetchCategories(); // Fetch categories on component mount
  }, []);

  // Fetch training centers on mount
  useEffect(() => {
    const fetchTrainingCenters = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      if (!yourToken) {
        console.error("No token found in localStorage");
        return;
      }

      try {
        const response = await fetch(`${APP_URL}/api/training-centers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch training centers");
        }

        const centers = await response.json();
        setTrainingCenters(centers);
      } catch (error) {
        console.error("Error fetching training centers:", error);
      }
    };

    fetchTrainingCenters();
  }, []);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/tesda-courses/${selectedCourseId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete course."}`
        // );
        throw new Error("Failed to delete course");
      }

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== selectedCourseId)
      );

      toast.success("Course deleted successfully.");
      handleClose_delete();
    } catch (error) {
      console.error("Error deleting the course:", error);
      toast.error("An error occurred while deleting the course.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/add-tesda-courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`,
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

      setCourses((prevCourses) => [...prevCourses, result.course]);

      reset();
      handleClose_add();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setSelectedCourseId(course.id);
    setSelectedCourseTitle(course.course);

    setValue("course", course.course);
    setValue("category_id", course.category_id);
    setValue("short_desc", course.short_desc);
    setValue("training_center", JSON.parse(course.training_center)); // Parse the JSON back to array

    // Show the modal
    setShowEdit(true);
  };

  const onSubmitEdit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/tesda-courses/${selectedCourseId}`,
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
        const errorResponse = await response.text(); // Get raw response text
        console.error("Error response:", errorResponse); // Log for debugging
        toast.error(`Error: ${errorResponse || "Something went wrong!"}`);
        throw new Error("Network response was not ok");
      }

      // Check if the response is JSON
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json(); // Parse JSON safely
        console.log("Parsed JSON:", result); // Log the parsed response

        toast.success(result.message);

        // Since `result.course` contains the updated course data
        if (result.course) {
          // Update the course list with the new data
          setCourses((prevCourses) =>
            prevCourses.map((course) =>
              course.id === selectedCourseId
                ? { ...course, ...result.course }
                : course
            )
          );
        }

        reset();
        setShowEdit(false); // Close the modal after update
      } else {
        const text = await response.text(); // Get raw response if it's not JSON
        console.error("Non-JSON response:", text); // Log the raw response
        toast.error("Unexpected response format. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting edit form:", error);
      toast.error("An error occurred while editing the course.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses
    .filter((course) =>
      course.course.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) =>
      sortCategory ? String(course.category_id) === String(sortCategory) : true
    );

  // Ensure categories are valid strings for comparison
  const sortedCourses = filteredCourses.sort((a, b) => {
    if (sortCategory) {
      const categoryA = a.category ? String(a.category) : ""; // Convert to string or fallback to empty string
      const categoryB = b.category ? String(b.category) : ""; // Same here

      console.log("Category A:", categoryA, "Category B:", categoryB); // Debug logging
      return categoryA.localeCompare(categoryB);
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
    setSortCategory(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const totalPages = Math.ceil(sortedCourses.length / rowsPerPage);

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage TESDA Courses" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Course</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">TESDA Courses List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3">
              <label htmlFor="searchInput">Search Course</label>
              <input
                id="searchInput"
                placeholder="Search by Course"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="select-file-to-view col-lg-3 col-xl-3">
              <label htmlFor="selectFile">Sort by Category</label>
              <select
                id="selectFile"
                value={sortCategory}
                onChange={handleSortChange}
              >
                <option value="">Show All Categories</option>
                {categories
                  .slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category, index) => (
                    <option key={index} value={category.category_id}>
                      {category.category}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="col-lg-3 col-xl-3">Course</th>
                <th className="col-lg-2 col-xl-2">Category</th>
                <th className="col-lg-3 col-xl-3">Description</th>
                <th className="col-lg-2 col-xl-2">Training Centers</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading TESDA Courses ...
                  </td>
                </tr>
              ) : displayedCourses?.length > 0 ? (
                displayedCourses
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((course) => {
                    const matchedCategory = categories.find(
                      (c) =>
                        Number(c.category_id) === Number(course.category_id)
                    );

                    return (
                      <tr key={course.id}>
                        <td style={{ textTransform: "capitalize" }}>
                          {course.course}
                        </td>
                        <td>
                          {matchedCategory?.category ||
                            "Unable to fetch category"}
                        </td>
                        <td>{course.short_desc}</td>
                        <td style={{ textTransform: "capitalize" }}>
                          {course.training_center
                            ? JSON.parse(course.training_center) // Convert string back to array
                                .filter((centerId) =>
                                  trainingCenters
                                    .map((center) => center.center_id)
                                    .includes(centerId)
                                )
                                .map((centerId) => {
                                  const center = trainingCenters.find(
                                    (center) => center.center_id === centerId
                                  );
                                  return center ? center.training_center : null;
                                })
                                .join(", ")
                            : "No training center found"}
                        </td>
                        <td className="text-center td-action">
                          <i
                            className="fa fa-edit"
                            onClick={() => handleEdit(course)}
                          ></i>
                          <i
                            className="fa fa-trash"
                            onClick={() => {
                              setSelectedCourseTitle(course.course);
                              setSelectedCourseId(course.id);
                              handleShow_delete();
                            }}
                          ></i>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="12">No TESDA courses available</td>
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
              { length: Math.ceil(courses.length / rowsPerPage) },
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
                  Math.min(prev + 1, Math.ceil(courses.length / rowsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(courses.length / rowsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Add Course Modal */}
      <Modal show={show} onHide={handleClose_add} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New TESDA Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Course *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                {...register("course", { required: "Course is required" })}
              />
              {errors.course && (
                <span className="text-danger">{errors.course.message}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                {...register("category_id", {
                  required: "Category is required",
                })}
              >
                <option value="">Select a category</option>
                {categories
                  .slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category}
                    </option>
                  ))}
              </Form.Select>
              {errors.category && (
                <span className="text-danger">{errors.category.message}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Training Center(s) *</Form.Label>
              <div>
                {trainingCenters
                  .slice()
                  .sort((a, b) =>
                    a.training_center.localeCompare(b.training_center)
                  )
                  .map((center) => (
                    <Form.Check
                      key={center.center_id}
                      type="checkbox"
                      label={center.training_center}
                      value={center.center_id}
                      {...register("training_center", {
                        required: "At least one training center is required",
                      })} // Use 'training_center' for array handling
                    />
                  ))}
              </div>
              {errors.training_centers && (
                <span className="text-danger">
                  {errors.training_centers.message}
                </span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter course description"
                {...register("short_desc", {
                  required: "Description is required",
                })}
              />
              {errors.courseDescription && (
                <span className="text-danger">
                  {errors.courseDescription.message}
                </span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                type="submit"
                variant="primary"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Adding Course ..." : "Add Course"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit TESDA Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitEdit)}>
            <Form.Group className="mb-3">
              <Form.Label>Course *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                {...register("course", { required: "Course is required" })}
              />
              {errors.course && (
                <span className="text-danger">{errors.course.message}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                {...register("category_id", {
                  required: "Category is required",
                })}
              >
                <option value="">Select a category</option>
                {categories
                  .slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category}
                    </option>
                  ))}
              </Form.Select>
              {errors.category_id && (
                <span className="text-danger">
                  {errors.category_id.message}
                </span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Training Center(s) *</Form.Label>
              <div>
                {trainingCenters
                  .slice()
                  .sort((a, b) =>
                    a.training_center.localeCompare(b.training_center)
                  )
                  .map((center) => (
                    <Form.Check
                      key={center.center_id}
                      type="checkbox"
                      label={center.training_center}
                      value={center.center_id}
                      {...register("training_center")}
                    />
                  ))}
              </div>
              {errors.training_center && (
                <span className="text-danger">
                  {errors.training_center.message}
                </span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter course description"
                {...register("short_desc", {
                  required: "Description is required",
                })}
              />
              {errors.short_desc && (
                <span className="text-danger">{errors.short_desc.message}</span>
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

      {/* Delete Course Modal */}
      <Modal
        show={showDelete}
        onHide={handleClose_delete}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Topic</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete the topic{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {selectedCourseTitle}
          </strong>
          ?
        </Modal.Body>

        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Course ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
