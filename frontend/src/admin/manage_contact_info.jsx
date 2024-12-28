import Title from "../admin/components/title";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "../css/admin/form.css";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function ManageContactInfo() {
  const [show, setShow] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactTitle, setSelectedContactTitle] = useState("");

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
    reset({ media: "", info: "" }); // Reset the form when opening the add modal
    setShow(true);
  };

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetch contacts data from the API
  useEffect(() => {
    const fetchContacts = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/contacts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch contacts");

        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contact information");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleDelete = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/contacts/${selectedContactId}`,
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
        //   `Error: ${errorResponse.message || "Failed to delete contact."}`
        // );
        throw new Error("Failed to delete contact");
      }

      // Remove the deleted contact from the state
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== selectedContactId)
      );

      toast.success("Contact deleted successfully.");
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("An error occurred while deleting the contact.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle edit action
  const handleEdit = (contact) => {
    reset({ media: contact.media, info: contact.info }); // Reset form values
    setSelectedContactId(contact.id);
    setShowEditModal(true); // Show edit modal
  };

  const onEditSubmit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/contacts/${selectedContactId}`,
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
        // toast.error(
        //   `Error: ${errorResponse.message || "Something went wrong!"}`
        // );
        throw new Error("Network response was not ok");
      }

      // Update the contacts state
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === selectedContactId
            ? { ...contact, media: data.media, info: data.info }
            : contact
        )
      );

      toast.success("Contact updated successfully.");
      reset();
      setShowEditModal(false); // Close the modal
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating the contact.");
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
      const response = await fetch(`${APP_URL}/api/contacts`, {
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
        // toast.error(
        //   `Error: ${errorResponse.message || "Something went wrong!"}`
        // );
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      toast.success(result.message);

      const newContact = {
        id: result.contact.id,
        media: result.contact.media,
        info: result.contact.info,
      };

      setContacts((prevContacts) => [newContact, ...prevContacts]);

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
        <Title title="Manage Contact Info" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>
          <div className="btn-container">
            <button onClick={handleShow}>Add Media</button>
          </div>
        </div>

        <div className="table-container">
          <h5 className="table-title">Contact Info List Table</h5>
          <table>
            <thead>
              <tr>
                {/* <th className="col-lg-3 col-xl-3 text-center">Icon</th> */}
                <th className="col-lg-5 col-xl-5">Media</th>
                <th className="col-lg-5 col-xl-5">Info</th>
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
              ) : contacts.length > 0 ? (
                contacts
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((contact) => (
                    <tr key={contact.id}>
                      {/* <td className="text-center">
                        {contact.media === "telephone" ||
                        contact.media === "phone no." ? (
                          <i
                            className="fa fa-phone"
                            style={{ padding: "0" }}
                          ></i>
                        ) : contact.media === "email" ? (
                          <i
                            className="fa fa-envelope"
                            style={{ padding: "0" }}
                          ></i>
                        ) : (
                          ""
                        )}
                      </td> */}
                      <td style={{ textTransform: "capitalize" }}>
                        {contact.media}
                      </td>
                      <td>{contact.info}</td>
                      <td className="text-center td-action">
                        <i
                          className="fa fa-edit"
                          onClick={() => handleEdit(contact)}
                        ></i>
                        <i
                          className="fa fa-trash"
                          onClick={() => {
                            setSelectedContactTitle(contact.media);
                            setSelectedContactId(contact.id);
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
          <Modal.Title>Edit Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onEditSubmit)}>
            <Form.Group controlId="formMedia" className="mb-3">
              <Form.Label>Media</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter media"
                readOnly // Set the field to read-only
                {...register("media", { required: "Media is required" })}
                style={{ textTransform: "capitalize" }}
              />
              {errors.media && (
                <span className="text-danger">{errors.media.message}</span>
              )}
            </Form.Group>

            <Form.Group controlId="formInfo" className="mb-3">
              <Form.Label>Info</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter info"
                {...register("info", { required: "Info is required" })}
              />
              {errors.info && (
                <span className="text-danger">{errors.info.message}</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Updating Info ..." : "Update Contact"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Media Modal */}
      <Modal show={show} onHide={handleClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formMedia" className="mb-3">
              <Form.Label>Media</Form.Label>{" "}
              <Form.Control
                as="select"
                {...register("media", { required: "Media is required" })} // Removed placeholder since it's not applicable to select
              >
                <option value="">Select media</option>{" "}
                {/* Placeholder option */}
                <option value="email">Email</option>
                <option value="phone no.">Phone No.</option>
                <option value="telephone">Telephone</option>
                {/* Add more options as needed */}
              </Form.Control>
              {errors.media && (
                <span className="text-danger">{errors.media.message}</span>
              )}
            </Form.Group>

            <Form.Group controlId="formInfo" className="mb-3">
              <Form.Label>Info</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter info"
                {...register("info", { required: "Info is required" })}
              />
              {errors.info && (
                <span className="text-danger">{errors.info.message}</span>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="modal-btn"
                disabled={loading}
              >
                {loading ? "Adding Contact ..." : "Add Contact"}
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
          Are you sure you want to delete the contact:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {selectedContactTitle}
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
            {loading ? "Deleting Contact ..." : "Delete Contact"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
