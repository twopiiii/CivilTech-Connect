import Title from "../admin/components/title";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";

export default function ManageBasicInfo() {
  const [basicInfo, setBasicInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null); // For storing selected info for editing
  const { register, handleSubmit, reset } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetch basic info from the API
  useEffect(() => {
    const fetchBasicInfo = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/basic-info`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          toast.error(
            `Error: ${errorResponse.message || "Failed to fetch basic info."}`
          );
          throw new Error("Failed to fetch basic info");
        }

        const data = await response.json();
        setBasicInfo(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching basic info.");
        setLoading(false);
      }
    };

    fetchBasicInfo();
  }, []);

  // Handle the edit button click, open modal
  const handleEdit = (info) => {
    setSelectedInfo(info);
    reset({ description: info.description }); // Pre-fill the form with the current description
    setShowModal(true);
  };

  // Handle form submission for updating the description
  const onSubmit = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      const response = await fetch(
        `${APP_URL}/api/basic-info/${selectedInfo.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${yourToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: formData.description,
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        // toast.error(
        //   `Error: ${errorResponse.message || "Failed to update description."}`
        // );
        throw new Error("Failed to update description");
      }

      const updatedInfo = await response.json();

      // Update the basic info list with the updated description
      setBasicInfo((prevInfo) =>
        prevInfo.map((info) =>
          info.id === updatedInfo.basicInfo.id
            ? { ...info, description: updatedInfo.basicInfo.description }
            : info
        )
      );

      setShowModal(false); // Close the modal after success
      toast.success("Description updated successfully!");
    } catch (error) {
      toast.error("Error updating description.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage Basic Information" />

        <div className="table-container">
          <h5 className="table-title">Basic Information Table</h5>

          <table>
            <thead>
              <tr>
                <th className="col-lg-3 col-xl-3">Title</th>
                <th className="col-lg-8 col-xl-8">Description</th>
                <th className="col-lg-1 col-xl-1 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="12">
                    Loading Content ...
                  </td>
                </tr>
              ) : basicInfo.length > 0 ? (
                basicInfo.map((info) => (
                  <tr key={info.id}>
                    <td className="fw-bold">{info.title}</td>
                    <td>{info.description}</td>
                    <td className="text-center td-action">
                      <i
                        className="fa fa-edit"
                        onClick={() => handleEdit(info)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12">No information available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal for editing description */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={selectedInfo?.title} readOnly />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("description", { required: true })}
              />
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="primary"
                type="submit"
                className="add-btn"
                disabled={loading}
              >
                {loading ? "Updating Info ..." : "Save Changes"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
