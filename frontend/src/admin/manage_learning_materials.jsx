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

export default function ManageLearningMaterials() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMaterialTitle, setSelectedMaterialTitle] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTopicDisabled, setIsTopicDisabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // For search
  const [sortTopic, setSortTopic] = useState("");
  const [sortCategory, setSortCategory] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const [show, setShow] = useState(false);
  const handleClose_add = () => setShow(false);
  const handleShow_add = () => {
    reset({
      title: "",
      link: "",
      topic_id: "",
      category_id: "",
      description: "",
    });
    setShow(true);
  };

  const [showDelete, setShowDelete] = useState(false);
  const handleClose_delete = () => setShowDelete(false);
  const handleShow_delete = () => setShowDelete(true);

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [editMaterial, setEditMaterial] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleViewDetails = (material) => {
    setSelectedMaterial(material); // Set selected material to view in modal
    setShowDetails(true); // Show details modal
  };

  const handleCloseDetails = () => setShowDetails(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    // Fetch categories and topics from your API
    const fetchCategoriesAndTopics = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/topics`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error fetching categories:", errorResponse);
          toast.error(
            `Error: ${errorResponse.message || "Failed to fetch categories."}`
          );
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        console.log("Fetched categories data:", data);

        if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error(
            "Expected an array of categories, got:",
            data?.categories
          );
          toast.error("Unexpected data format for categories.");
        }

        // Assuming the topics array is also part of the response
        if (data && Array.isArray(data.topics)) {
          setTopics(data.topics); // Set the topics in the state
        } else {
          console.error("Expected an array of topics, got:", data?.topics);
          toast.error("Unexpected data format for topics.");
        }
      } catch (error) {
        toast.error("Error fetching data.");
      }
    };

    const fetchMaterials = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/learningMaterials`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error fetching learning materials:", errorResponse);
          toast.error(
            `Error: ${
              errorResponse.message || "Failed to fetch learning materials."
            }`
          );
          throw new Error("Failed to fetch learning materials");
        }

        const data = await response.json();
        console.log("Fetched learning materials data:", data);

        if (data && Array.isArray(data.learningMaterials)) {
          setLearningMaterials(data.learningMaterials);
        } else {
          console.error(
            "Expected an array of learning materials, got:",
            data?.learningMaterials
          );
          toast.error("Unexpected data format for learning materials.");
        }
      } catch (error) {
        console.error("Error fetching learning materials:", error);
        toast.error("Error fetching learning materials.");
      } finally {
        setLoading(false); // Ensure loading state is set here
      }
    };

    fetchCategoriesAndTopics();
    fetchMaterials();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/learningMaterials`, {
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
      console.log(result);

      toast.success(result.message);

      const newMaterial = {
        id: result.learningMaterial.id, // Ensure this matches the response structure
        title: result.learningMaterial.title,
        topic_id: result.learningMaterial.topic_id,
        topic: { topic: result.learningMaterial.topic }, // Ensure this matches the response structure
        category_id: result.learningMaterial.category_id,
        category: { category: result.learningMaterial.category }, // Ensure this matches the response structure
        link: result.learningMaterial.link, // Add the link
        description: result.learningMaterial.description, // Add the description
      };

      setLearningMaterials((prevMaterial) => [newMaterial, ...prevMaterial]);
      setSelectedMaterial(newMaterial); // Set the selected material for the details modal
      setShowDetails(true); // Show details modal immediately after adding

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
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/learningMaterials/${selectedMaterialId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete material."}`
        // );
        throw new Error("Failed to delete material");
      }

      // Remove the deleted item from the state
      setLearningMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material.id !== selectedMaterialId)
      );

      toast.success("Learning material deleted successfully.");
      handleClose_delete();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("An error occurred while deleting the material.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategoryId = Number(event.target.value); // Get the selected category ID
    setSelectedCategory(selectedCategoryId);

    if (selectedCategoryId) {
      const filtered = topics.filter(
        (topic) => topic.category_id === selectedCategoryId
      );
      setFilteredTopics(filtered);
      setIsTopicDisabled(false); // Enable topic input when a category is selected
    } else {
      setFilteredTopics([]);
      setIsTopicDisabled(true); // Disable if no category is selected
    }
  };

  const handleEditClick = (material) => {
    setEditMaterial(material);
    setValue("title", material.title);
    setValue("topic_id", material.topic_id); // Set topic_id here
    setValue("category_id", material.category_id);
    setValue("link", material.link);
    setValue("description", material.description);
    setShowEditModal(true);

    // Set selected category and filter topics
    const selectedCategoryId = material.category_id; // Use material's category_id
    setSelectedCategory(selectedCategoryId);

    // Filter topics based on the selected category
    const filtered = topics.filter(
      (topic) => topic.category_id === selectedCategoryId
    );
    setFilteredTopics(filtered);
  };

  const handleCloseEditModal = () => {
    reset({ category_id: "", topic_id: "" });
    setShowEditModal(false);
    setEditMaterial(null);
    setIsTopicDisabled(true); // Disable topic input when the modal is closed
  };

  const onEditSubmit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/learning-materials/${editMaterial.id}`,
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
        toast.error(
          `Error: ${errorResponse.message || "Failed to update material."}`
        );
        throw new Error("Failed to update material");
      }

      const result = await response.json();
      toast.success(result.message);

      // Find the category and topic from their respective states based on the IDs in `data`
      const matchedCategory = categories.find(
        (c) => c.category_id === Number(data.category_id)
      );
      const matchedTopic = topics.find(
        (t) => t.topic_id === Number(data.topic_id)
      );

      // Update the learning materials with the edited values and display category/topic names
      setLearningMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material.id === editMaterial.id
            ? {
                ...material,
                title: data.title,
                description: data.description,
                link: data.link,
                topic_id: data.topic_id,
                category_id: data.category_id,
                category: { category: matchedCategory?.category }, // Display category name
                topic: { topic: matchedTopic?.topic }, // Display topic name
              }
            : material
        )
      );

      // await fetchMaterials();

      handleCloseEditModal();
    } catch (error) {
      toast.error("An error occurred while updating the material.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLm = learningMaterials
    .filter((lm) => lm.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((lm) =>
      sortCategory ? lm.category_id === parseInt(sortCategory) : true
    )
    .filter((lm) => (sortTopic ? lm.topic_id === parseInt(sortTopic) : true));

  // Handle search change (reset to first page)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleSortChange = (e) => {
    setSortTopic(e.target.value);
    setCurrentPage(1); // Reset to the first page when sorting
  };

  // Pagination logic
  const paginatedLm = filteredLm.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredLm.length / rowsPerPage);

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
        <Title title="Manage Learning Materials" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Learning Material</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end justify-content-between">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">Learning Materials Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3">
              <label htmlFor="searchInput">Search Learning Material</label>
              <input
                id="searchInput"
                placeholder="Search by Title"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="select-file-to-view col-lg-3 col-xl-3">
              <label htmlFor="selectFile">Sort by Topic</label>
              <select
                id="selectFile"
                value={sortTopic}
                onChange={handleSortChange}
              >
                <option value="">Show All Topics</option>
                {topics
                  .slice()
                  .sort((a, b) => a.topic.localeCompare(b.topic))
                  .map((topic, index) => (
                    <option key={index} value={topic.topic_id}>
                      {topic.topic}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th className="col-lg-3 col-xl-3">Title</th>
                <th className="col-lg-3 col-xl-3">Topic</th>
                <th className="col-lg-4 col-xl-4">Category</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading Learning Materials ...
                  </td>
                </tr>
              ) : paginatedLm.length > 0 ? (
                paginatedLm.map((learningMaterial) => {
                  const topic = topics.find(
                    (t) => t.id === learningMaterial.topic_id
                  );
                  return (
                    <tr key={learningMaterial.id}>
                      <td>{learningMaterial.title}</td>
                      <td>
                        {learningMaterial.topic?.topic ||
                          "Unable to Fetch Topic"}
                      </td>
                      <td>
                        {learningMaterial.category?.category ||
                          "Unable to Fetch Category"}
                      </td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-eye"
                          onClick={() => handleViewDetails(learningMaterial)}
                        ></i>
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEditClick(learningMaterial)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedMaterialTitle(learningMaterial.title);
                            setSelectedMaterialId(learningMaterial.id);
                            handleShow_delete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12">No learning materials available</td>
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

      {/* Modal for editing learning materials */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Learning Material</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onEditSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Title"
                defaultValue={editMaterial?.title}
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-danger">{errors.title.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Link"
                defaultValue={editMaterial?.link}
                {...register("link", { required: "Link is required" })}
              />
              {errors.link && (
                <p className="text-danger">{errors.link.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Control
                as="select"
                defaultValue={editMaterial?.category_id}
                {...register("category_id", {
                  required: "Category is required",
                })}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories
                  ?.slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option key={category.id} value={category.category_id}>
                      {category.category}
                    </option>
                  ))}
              </Form.Control>
              {errors.category_id && (
                <p className="text-danger">{errors.category_id.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic *</Form.Label>
              <Form.Control
                as="select"
                defaultValue={editMaterial?.topic_id} // Set default value for topic
                {...register("topic_id", { required: "Topic is required" })}
                disabled={!selectedCategory} // Disable if no category is selected
              >
                <option value="">Select Topic</option>
                {filteredTopics
                  ?.slice()
                  .sort((a, b) => a.topic.localeCompare(b.topic))
                  .map((topic) => (
                    <option key={topic.id} value={topic.topic_id}>
                      {topic.topic}
                    </option>
                  ))}
              </Form.Control>
              {errors.topic_id && (
                <p className="text-danger">{errors.topic_id.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                type="text"
                rows={4}
                placeholder="Enter Description"
                defaultValue={editMaterial?.description}
                {...register("description")}
              />
              {errors.link && (
                <p className="text-danger">{errors.link.message}</p>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Updating Material ..." : "Update Material"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for viewing learning material details */}
      <Modal
        show={showDetails}
        onHide={handleCloseDetails}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Learning Material Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Title: <span>{selectedMaterial?.title}</span>
          </h6>
          <h6 className="view-label">
            Topic ID: <span>{selectedMaterial?.topic_id}</span>
          </h6>
          <h6 className="view-label">
            Topic:{" "}
            <span>
              {selectedMaterial?.topic?.topic || "Unable to Fetch Topic"}
            </span>
          </h6>
          <h6 className="view-label">
            Category ID: <span>{selectedMaterial?.category_id}</span>
          </h6>
          <h6 className="view-label">
            Category: <span>{selectedMaterial?.category?.category}</span>
          </h6>
          <h6 className="view-label">
            Link:{" "}
            <a
              href={`https://${selectedMaterial?.link}`} // Prepend with 'https://'
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault(); // Prevent the default anchor click behavior
                window.open(`https://${selectedMaterial?.link}`, "_blank"); // Open link in a new tab
              }}
            >
              <span>Open Url</span>
            </a>
          </h6>
          <h6 className="view-label">
            Description:{" "}
            <span>
              {selectedMaterial?.description?.description || (
                <span className="no-desc">N/A</span>
              )}
            </span>
          </h6>
        </Modal.Body>
      </Modal>

      {/* Modal for adding learning materials */}
      <Modal
        show={show}
        onHide={handleClose_add}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Learning Material</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-danger">{errors.title.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Link"
                {...register("link", { required: "Link is required" })}
              />
              {errors.link && (
                <p className="text-danger">{errors.link.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Control
                as="select"
                {...register("category_id", {
                  required: "Category is required",
                })} // Change to category_id
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories
                  ?.slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option key={category.id} value={category.category_id}>
                      {category.category}
                    </option>
                  ))}
              </Form.Control>
              {errors.category_id && (
                <p className="text-danger">{errors.category_id.message}</p> // Change to category_id
              )}
            </Form.Group>

            <Form.Group controlId="topic_id" className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Select
                {...register("topic_id", { required: true })}
                disabled={isTopicDisabled} // Control the disabled state here
              >
                <option value="">Select Topic</option>
                {filteredTopics
                  .slice()
                  .sort((a, b) => a.topic.localeCompare(b.topic))
                  .map((topic) => (
                    <option key={topic.id} value={topic.topic_id}>
                      {topic.topic}
                    </option>
                  ))}
              </Form.Select>
              {errors.topic_id && <span>This field is required</span>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                placeholder="Learning Material Description"
                {...register("description")}
              />
            </Form.Group>
            {errors.description && (
              <p className="text-danger">{errors.description.message}</p>
            )}

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="add-btn"
                disabled={loading}
              >
                {loading ? "Adding Material ..." : "Add Material"}
              </Button>
              {/* <Button variant="secondary" onClick={handleClose_add}>
            Close
          </Button> */}
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for deleting learning materials */}
      <Modal
        show={showDelete}
        onHide={handleClose_delete}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Material</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{selectedMaterialTitle}</strong>?
        </Modal.Body>

        <Modal.Footer className="delete-noForm">
          <Button
            variant="primary"
            className="modal-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting Material ..." : "Delete Material"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
