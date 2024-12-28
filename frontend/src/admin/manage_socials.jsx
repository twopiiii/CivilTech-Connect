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

export default function ManageSocials() {
  const [show, setShow] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socials, setSocials] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedSocialId, setSelectedSocialId] = useState(null);
  const [selectedSocialTitle, setSelectedSocialTitle] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);

  const handleClose = () => {
    reset();
    setShow(false);
  };

  const handleShow = () => {
    reset({ social_media: "", link: "" });
    setShow(true);
  };

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetch Social Media data from API
  useEffect(() => {
    const fetchSocials = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/socials`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch Social Media Links");

        const data = await response.json();
        setSocials(data);
      } catch (error) {
        console.error("Error fetching socials:", error);
        toast.error("Failed to load Social Media Link");
      } finally {
        setLoading(false);
      }
    };

    fetchSocials();
  }, []);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/socials/${selectedSocialId}`,
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
        //     errorResponse.message || "Failed to delete social media link."
        //   }`
        // );
        throw new Error("Failed to delete social media link");
      }

      // Remove the deleted contact from the state
      setSocials((prevSocials) =>
        prevSocials.filter((social) => social.id !== selectedSocialId)
      );

      toast.success("Social Media Link deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting social media link:", error);
      toast.error("An error occurred while deleting the social media link.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle edit action
  const handleEdit = (social) => {
    reset({ social_media: social.social_media, link: social.link }); // Reset form values
    setSelectedSocialId(social.id);
    setShowEditModal(true); // Show edit modal
  };

  const onEditSubmit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/socials/${selectedSocialId}`,
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
          `Error: ${errorResponse.message || "Something went wrong!"}`
        );
        throw new Error("Network response was not ok");
      }

      // Update the contacts state
      setSocials((prevSocials) =>
        prevSocials.map((social) =>
          social.id === selectedSocialId
            ? { ...social, social_media: data.social_media, link: data.link }
            : social
        )
      );

      toast.success("Social Media Link updated successfully.");
      reset();
      setShowEditModal(false); // Close the modal
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating the social media link.");
    } finally {
      setLoading(false);
    }
  };

  // onSubmit function for handling form submission
  const onSubmit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(`${APP_URL}/api/socials`, {
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

      const newSocial = {
        id: result.socials.id,
        social_media: result.socials.social_media,
        link: result.socials.link,
      };

      setSocials((prevSocials) => [newSocial, ...prevSocials]);

      reset();
      handleClose();
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
        <Title title="Manage Social Media" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow}>Add Socials</button>
          </div>
        </div>

        <div className="table-container">
          <h5 className="table-title">Social Media List Table</h5>

          <table>
            <thead>
              <tr>
                {/* <th className="col-lg-3 col-xl-3 text-center">Icon</th> */}
                <th className="col-lg-5 col-xl-5">Social Media</th>
                <th className="col-lg-5 col-xl-5">Hyperlink</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="4">
                    Loading Contents ...
                  </td>
                </tr>
              ) : socials.length > 0 ? (
                socials
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((social) => (
                    <tr key={social.id}>
                      {/* <td className="text-center">
                        {social.social_media === "facebook" ? (
                          <i
                            className="fa fa-facebook"
                            style={{ padding: "0" }}
                          ></i>
                        ) : social.social_media === "instagram" ? (
                          <i
                            className="fa fa-instagram"
                            style={{ padding: "0" }}
                          ></i>
                        ) : social.social_media === "twitter" ? (
                          <i
                            className="fa fa-twitter"
                            style={{ padding: "0" }}
                          ></i>
                        ) : social.social_media === "linkedin" ? (
                          <i
                            className="fa fa-linkedin"
                            style={{ padding: "0" }}
                          ></i>
                        ) : social.social_media === "pinterest" ? (
                          <i
                            className="fa fa-pinterest"
                            style={{ padding: "0" }}
                          ></i>
                        ) : (
                          ""
                        )}
                      </td> */}
                      <td style={{ textTransform: "capitalize" }}>
                        {social.social_media}
                      </td>
                      <td>{social.link}</td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(social)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedSocialTitle(social.social_media);
                            setSelectedSocialId(social.id);
                            handleShowDelete();
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="loading-text" colSpan="4">
                    No Records Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Social Media Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onEditSubmit)}>
            <Form.Group controlId="formMedia" className="mb-3">
              <Form.Label>Social Media</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Social Media"
                readOnly // Set the field to read-only
                {...register("social_media", {
                  required: "Social Media is required",
                })}
                style={{ textTransform: "capitalize" }}
              />
              {errors.social_media && (
                <span className="text-danger">
                  {errors.social_media.message}
                </span>
              )}
            </Form.Group>

            <Form.Group controlId="formInfo" className="mb-3">
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter info"
                {...register("link", { required: "Link is required" })}
              />
              {errors.link && (
                <span className="text-danger">{errors.link.message}</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Updating Link ..." : "Update Social Media Link"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Media Modal */}
      <Modal show={show} onHide={handleClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Social Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formMedia" className="mb-3">
              <Form.Label>Social Media</Form.Label>{" "}
              <Form.Control
                as="select"
                {...register("social_media", {
                  required: "Social Media is required",
                })} // Removed placeholder since it's not applicable to select
              >
                <option value="">Select Social Media</option>{" "}
                {/* Placeholder option */}
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="pinterest">Pinterest</option>
                {/* Add more options as needed */}
              </Form.Control>
              {errors.social_media && (
                <span className="text-danger">
                  {errors.social_media.message}
                </span>
              )}
            </Form.Group>

            <Form.Group controlId="formInfo" className="mb-3">
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Link"
                {...register("link", { required: "Link is required" })}
              />
              {errors.link && (
                <span className="text-danger">{errors.link.message}</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Adding Link ..." : "Add Social Media"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
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
          Are you sure you want to delete:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {selectedSocialTitle}
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
            {loading ? "Deleting Link ..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
