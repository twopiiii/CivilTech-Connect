import { useState, useEffect } from "react";
import Title from "../admin/components/title";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";

export default function ManageFounders() {
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [founders, setFounders] = useState([]);
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchFounders = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(`${APP_URL}/api/founders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${yourToken}`,
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setFounders(data);
      } catch (error) {
        toast.error("Error fetching founders");
        console.error("Error fetching founders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFounders();
  }, []);

  const handleEditClick = (founder) => {
    setSelectedFounder(founder.id);
    setValue("name", founder.name);
    setImgPreview(`${APP_URL}/founder/${founder.img}`);
  };

  const handleSubmitEdit = async (data) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);

    if (data.img && data.img[0]) {
      formData.append("img", data.img[0]);
    }

    try {
      const response = await fetch(
        `${APP_URL}/api/founders/${selectedFounder}`,
        {
          method: "POST", // Use 'POST' if Laravel is not configured to handle 'PUT' with FormData
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

      const updatedFounder = await response.json();
      toast.success("Founder updated successfully");

      setFounders((prevFounders) =>
        prevFounders.map((founder) =>
          founder.id === selectedFounder ? updatedFounder : founder
        )
      );
      reset();
      setSelectedFounder(null);
      setImgPreview(null);
    } catch (error) {
      console.error("Error updating founder:", error);
      toast.error(`Error updating founder: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage Founder Information" />

        <div className="table-container">
          <h5 className="table-title">Founder's Information Table</h5>

          <table>
            <thead>
              <tr>
                <th className="col-lg-3 col-xl-3 text-center">Image</th>
                <th className="col-lg-7 col-xl-7">Full Name</th>
                <th className="col-lg-2 col-xl-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="loading-text" colSpan="3">
                    Loading Founders ...
                  </td>
                </tr>
              ) : founders.length > 0 ? (
                founders.map((founder) => (
                  <tr key={founder.id}>
                    <td className="fw-bold text-center">
                      <img
                        src={`${APP_URL}/storage/${founder.img}`}
                        alt={founder.img}
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>{founder.name}</td>
                    <td className="text-center td-action">
                      <i
                        className="fa fa-edit"
                        onClick={() => handleEditClick(founder)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No Founders ...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        show={selectedFounder !== null}
        onHide={() => {
          setSelectedFounder(null);
          reset();
        }}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Founder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmit(handleSubmitEdit)}
            encType="multipart/form-data"
          >
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                {...register("name", { required: true })}
              />
              {errors.name && <p className="text-danger">Name is required</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                {...register("img")}
                onChange={(e) => {
                  setImgPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              {imgPreview && (
                <div className="mt-2">
                  <img
                    src={imgPreview}
                    alt="Founder Preview"
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
    </>
  );
}
