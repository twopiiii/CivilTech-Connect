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

export default function ManageLearningTopic() {
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicTitle, setSelectedTopicTitle] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [showEdit, setShowEdit] = useState(false); // State for edit modal
  const [edit_selectedTopic, set_editSelectedTopic] = useState({
    title: "",
    category: "",
  }); // State for selected topic
  const [edit_selectedTopicId, set_editSelectedTopicId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For search
  const [sortCategory, setSortCategory] = useState(""); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const rowsPerPage = 15; // Number of rows per page

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const handleClose_add = () => setShow(false);
  const handleShow_add = () => {
    reset({
      topic: "",
      category_id: "",
    });
    setShow(true);
  };

  const [showDelete, setShowDelete] = useState(false);
  const handleClose_delete = () => setShowDelete(false);
  const handleShow_delete = () => setShowDelete(true);

  const handleClose_edit = () => setShowEdit(false); // Close edit modal
  const handleShow_edit = () => setShowEdit(true); // Open edit modal

  const navigate = useNavigate();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/categories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
          console.log("Fetched categories:", data.categories);
          // Call fetchTopics after fetching categories
          fetchTopics(data.categories);
        } else {
          const errorResponse = await response.json();
          console.error("Error fetching categories:", errorResponse);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchTopics = async (categories) => {
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
          console.error("Error fetching topics:", errorResponse);
          return;
        }

        const data = await response.json();
        console.log("Fetched topics data:", data);

        if (data && Array.isArray(data.topics)) {
          const updatedTopics = data.topics.map((topic) => {
            const category = categories.find(
              (cat) => cat.category_id === topic.category_id
            );
            console.log(
              `Matching topic ${topic.topic} with category ID: ${topic.category_id}`
            );
            return {
              ...topic,
              category: category ? category.category : "No Category",
            };
          });
          setTopics(updatedTopics);
          console.log("Updated Topics with Categories:", updatedTopics);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        toast.error("Error fetching topics.");
      } finally {
        setLoading(false); // Set loading to false only after topics are fetched
      }
    };

    fetchCategories(); // Fetch categories on component mount
  }, []);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/topics/${selectedTopicId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${yourToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        // toast.error(
        //   `Error: ${errorResponse.message || "Failed to delete topic."}`
        // );
        throw new Error("Failed to delete topic");
      }

      setTopics((prevTopics) =>
        prevTopics.filter((topic) => topic.id !== selectedTopicId)
      );

      toast.success(
        "Topic and associated Learning Materials deleted successfully."
      );
      handleClose_delete();
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("An error occurred while deleting the topic.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("Submitted data:", data);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`,
        },
        body: JSON.stringify({ ...data, category_id: data.category }),
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
      console.log("API Response:", result);

      toast.success(result.message);

      const newTopic = {
        id: result.topic.id,
        topic: result.topic.topic,
        topic_id: result.topic.topic_id,
        category: result.topic.category,
        category_id: result.topic.category_id,
      };

      console.log("New Topic to Add:", newTopic);

      setTopics((prevTopics) => [newTopic, ...prevTopics]);
      console.log("Updated Topics State:", topics);

      handleClose_add();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    set_editSelectedTopicId(topic.id);
    set_editSelectedTopic({
      title: topic.topic,
      category: topic.category_id,
    });

    // Ensure form fields are populated
    setValue("topic", topic.topic);
    setValue("category", topic.category_id);

    handleShow_edit(); // Open edit modal
  };

  const onSubmitEdit = async (data) => {
    if (!edit_selectedTopicId) {
      console.error("No topic selected for editing.");
      return;
    }

    setLoading(true);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    // Log data.category and the category match
    console.log("Submitted category_id:", data.category);
    const matchedCategory = categories.find(
      (cat) => cat.category_id === Number(data.category)
    );
    console.log("Matched category:", matchedCategory);

    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === edit_selectedTopicId
          ? {
              ...topic,
              topic: data.topic,
              category_id: data.category,
              category: matchedCategory?.category || "No Category",
            }
          : topic
      )
    );

    try {
      const response = await fetch(
        `${APP_URL}/api/topics/${edit_selectedTopicId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`,
          },
          body: JSON.stringify({ ...data, category_id: data.category }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        toast.error(
          `Error: ${errorResponse.message || "Failed to update topic."}`
        );
        return;
      }

      const responseData = await response.json();
      toast.success(responseData.message);
      reset(); // Reset the form
      handleClose_edit(); // Close the modal
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("An error occurred while updating the topic.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics
    .filter((topic) =>
      topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((topic) =>
      sortCategory ? topic.category_id === parseInt(sortCategory) : true
    );

  const sortedTopics = filteredTopics.sort((a, b) => {
    if (sortCategory) {
      return a.category.localeCompare(b.category);
    }
    return b.id - a.id; // Default sort by descending ID
  });

  const paginatedTopics = sortedTopics.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const displayedTopics = paginatedTopics;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleSortChange = (e) => {
    setSortCategory(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const totalPages = Math.ceil(sortedTopics.length / rowsPerPage);

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage Learning Topics" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Topic</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">Topic List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3">
              <label htmlFor="searchInput">Search Topic</label>
              <input
                id="searchInput"
                placeholder="Search by Topic"
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
                <th className="col-lg-3 col-xl-3">Topic</th>
                <th className="col-lg-2 col-xl-2">Topic ID</th>
                <th className="col-lg-3 col-xl-3">Category</th>
                <th className="col-lg-2 col-xl-2">Category ID</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading Topics ...
                  </td>
                </tr>
              ) : displayedTopics?.length > 0 ? ( // Add the null-check using ?. before map
                displayedTopics
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((topic) => (
                    <tr key={topic.id}>
                      <td>{topic.topic}</td>
                      <td>{topic.topic_id}</td>
                      <td>{topic.category || "No Category"}</td>
                      <td>{topic.category_id}</td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(topic)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedTopicTitle(topic.topic);
                            setSelectedTopicId(topic.id);
                            handleShow_delete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="12">No topics available</td>
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
              { length: Math.ceil(topics.length / rowsPerPage) },
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
                  Math.min(prev + 1, Math.ceil(topics.length / rowsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(topics.length / rowsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Add Topic Modal */}
      <Modal show={show} onHide={handleClose_add} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Topic</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Topic Title</Form.Label>
              <Form.Control
                type="text"
                {...register("topic", { required: true })}
                placeholder="Enter Topic Title"
              />
              {errors.topic && (
                <span className="error-text">This field is required</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Select Category</Form.Label>
              <Form.Select {...register("category", { required: true })}>
                <option>Select Category</option>
                {categories
                  .slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option
                      value={category.category_id}
                      key={category.category_id}
                    >
                      {category.category}
                    </option>
                  ))}
              </Form.Select>
              {errors.category && (
                <span className="error-text">This field is required</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Adding Topic ..." : "Add Topic"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        show={showEdit}
        onHide={handleClose_edit}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Topic</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitEdit)}>
            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter topic"
                {...register("topic", { required: true })}
              />
              {errors.topic && (
                <span className="text-danger">This field is required</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Change Category</Form.Label>
              <Form.Select {...register("category", { required: true })}>
                <option>Select Category</option>
                {categories
                  .slice()
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((category) => (
                    <option
                      value={category.category_id}
                      key={category.category_id}
                    >
                      {category.category}
                    </option>
                  ))}
              </Form.Select>
              {errors.category && (
                <span className="error-text">This field is required</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                className="modal-btn"
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating Topic ..." : "Update Topic"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Topic Modal */}
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
          <strong>{selectedTopicTitle}</strong>?
        </Modal.Body>

        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting Topic ..." : "Delete Topic"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
