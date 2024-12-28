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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [edit_selectedCategory, set_editSelectedCategory] = useState({
    title: "",
    description: "",
  });
  const [edit_selectedCategoryId, set_editSelectedCategoryId] = useState(null);

  const handleClose_add = () => setShow(false);
  const handleShow_add = () => {
    reset({ category: "", description: "" });
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

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token; // Retrieve token safely

      try {
        const response = await fetch(`${APP_URL}/api/tesda-categories`, {
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
        console.log("Fetched categories data:", data); // Log the entire response data

        // Check if 'categories' exists and is an array
        if (data && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error(
            "Expected an array of categories, got:",
            data?.categories
          );
          toast.error("Unexpected data format for categories.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error fetching categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/tesda-categories/${selectedCategoryId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete category."}`
        // );
        throw new Error("Failed to delete category");
      }

      // Remove the deleted category from the state
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== selectedCategoryId)
      );

      toast.success("Category and associated Course deleted successfully.");
      handleClose_delete();
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("An error occurred while deleting the category.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    console.log(data); // Log the form data

    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Retrieve user info
    const yourToken = userInfo.token; // Get the token

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/tesda-categories`, {
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

      // Use response.json() to parse the JSON if the response is okay
      const result = await response.json();
      toast.success(result.message);

      const newCategory = {
        id: result.category.id,
        category: result.category.category,
        category_id: result.category.category_id,
        description: result.category.description,
      };

      setCategories((prevCategory) => [newCategory, ...prevCategory]);
      reset();
      handleClose_add();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    set_editSelectedCategoryId(category.id); // Set the category ID for the edit
    set_editSelectedCategory({
      title: category.category,
      description: category.description,
    });
    setValue("category", category.category); // Set value for editing
    setValue("description", category.description); // Set value for editing
    handleShow_edit(); // Open the edit modal
  };

  const onSubmitEdit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Retrieve user info
    const yourToken = userInfo.token; // Get the token

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/tesda-categories/${edit_selectedCategoryId}`, // Use edit_selectedCategoryId
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`,
          },
          body: JSON.stringify({
            category: data.category, // Send the updated category name
            description: data.description, // Send the updated description
          }),
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
      console.log(result); // Log the result
      toast.success(result.message);

      // Update the local state to reflect the changes
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === edit_selectedCategoryId // Compare with edit_selectedCategoryId
            ? { ...category, ...data } // Update the category with new data
            : category
        )
      );

      reset(); // Reset form values
      handleClose_edit(); // Close the edit modal
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage TESDA Categories" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Category</button>
            {/* <button>Sort Category</button> */}
          </div>
        </div>

        <div className="table-container">
          <h5 className="table-title">Category List Table</h5>

          <table>
            <thead>
              <tr>
                <th className="col-lg-4 col-xl-4">Category</th>
                <th className="col-lg-2 col-xl-2">Category ID</th>
                <th className="col-lg-5 col-xl-5">Description</th>

                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading Categories ...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((category) => (
                    <tr key={category.id}>
                      <td>{category.category}</td>
                      <td>{category.category_id}</td>
                      <td>
                        {category.description || (
                          <span className="no-desc">No description</span>
                        )}
                      </td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(category)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedCategoryTitle(category.category);
                            setSelectedCategoryId(category.id);
                            handleShow_delete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="12">No categories available</td>
                </tr>
              )}
            </tbody>
          </table>
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
            Add Category for TESDA Courses
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category"
                {...register("category", {
                  required: "Category name is required",
                })}
              />
            </Form.Group>
            {errors.name && (
              <p className="text-danger">{errors.name.message}</p>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                type="text"
                placeholder="Category Description"
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
                {loading ? "Adding Category ..." : "Add Category"}
              </Button>
              {/* <Button variant="secondary" onClick={handleClose_add}>
            Close
          </Button> */}
            </Modal.Footer>
          </Form>
        </Modal.Body>
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
          <Modal.Title>Edit Learning Category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitEdit)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                {...register("category", { required: true })}
              />
              {errors.category && (
                <span className="text-danger">This field is required</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                {...register("description")}
              />
            </Form.Group>

            <Modal.Footer>
              <Button
                className="modal-btn"
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating Info ..." : "Update Category"}
              </Button>
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
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to category{" "}
          <strong>{selectedCategoryTitle}</strong>?
        </Modal.Body>

        <Modal.Footer className="delete-noForm">
          <Button
            variant="primary"
            className="modal-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting Category ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
