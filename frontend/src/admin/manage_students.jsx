import Title from "../admin/components/title";
import "../css/admin/form.css";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";

export default function ManageStudents() {
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [selectedFileId, setSelectedFileId] = useState("");
  const [searchInput, setSearchInput] = useState(""); // State for search input
  const [filteredStudents, setFilteredStudents] = useState([]); // State for filtered students
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const handleClose_add = () => setShowAdd(false);
  const handleShow_add = () => setShowAdd(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (student) => {
    setSelectedStudent(student); // Set selected student to view in modal
    setShowDetails(true); // Show details modal
  };

  const handleCloseDetails = () => setShowDetails(false);

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedFiles(new Set());
  };

  const handleShowDelete = () => setShowDeleteModal(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetch files function
  const fetchFiles = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    try {
      const response = await fetch(`${APP_URL}/api/fetch-files`, {
        headers: { Authorization: `Bearer ${yourToken}` },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      setFiles(await response.json());
    } catch (error) {
      toast.error("Error fetching files");
      console.error("Error fetching files:", error);
    }
  };

  // Fetch files on component load
  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file selection for deletion
  const handleFileSelection = (fileId) => {
    setSelectedFiles((prev) => {
      const newSelectedFiles = new Set(prev);
      if (newSelectedFiles.has(fileId)) {
        newSelectedFiles.delete(fileId);
      } else {
        newSelectedFiles.add(fileId);
      }
      return newSelectedFiles;
    });
  };

  // Delete selected files and corresponding database tables
  const handleDeleteFiles = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const yourToken = userInfo?.token;

    setLoading(true);

    try {
      // Fetch the selected files to get their database names
      const selectedFileDetails = files.filter((file) =>
        selectedFiles.has(file.id)
      );
      const databasesToDelete = selectedFileDetails.map(
        (file) => file.database
      );

      // Send the delete request
      const response = await fetch(`${APP_URL}/api/delete-files`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${yourToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileIds: Array.from(selectedFiles) }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to delete files.");
      }

      // Optionally, delete the tables using another API call
      await Promise.all(
        databasesToDelete.map((database) => {
          return fetch(`${APP_URL}/api/delete-table?name=${database}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${yourToken}`,
              "Content-Type": "application/json",
            },
          });
        })
      );

      // Refresh files after deletion
      fetchFiles();
      setSelectedFiles(new Set());
      toast.success("Files deleted successfully");
      handleCloseDelete();

      // If the deleted file was being viewed, reset the student list
      if (
        selectedFileId &&
        selectedFileDetails.some((file) => file.id === selectedFileId)
      ) {
        setSelectedFileId("");
        setStudentList([]);
      }
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student list based on selected file
  useEffect(() => {
    const fetchStudentList = async () => {
      if (!selectedFileId) return; // Exit if no file selected

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const yourToken = userInfo?.token;

      try {
        const response = await fetch(
          `${APP_URL}/api/fetch-students?file_id=${selectedFileId}`,
          {
            headers: {
              Authorization: `Bearer ${yourToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error fetching student data");

        const data = await response.json();
        setStudentList(data);
      } catch (error) {
        toast.error("Error fetching student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentList();
  }, [selectedFileId]);

  // Calculate displayed students for current page
  const indexOfLastStudent = currentPage * rowsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - rowsPerPage;
  const currentStudents = searchInput
    ? filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
    : studentList.slice(indexOfFirstStudent, indexOfLastStudent);

  // Handle search input change
  const handleSearchChange = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchInput(searchQuery);

    // Filter students based on search query and current selected file's data
    const results = studentList.filter((student) =>
      student.full_name.toLowerCase().includes(searchQuery)
    );
    setFilteredStudents(results);
  };

  // Handle pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(studentList.length / rowsPerPage); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  return (
    <>
      <ToastContainer position="top-center" />

      <section className="basic-info-section">
        <Title title="Manage Student List" />

        <div className="other-action-container">
          <h5 className="table-title">Action(s)</h5>

          <div className="btn-container">
            <button onClick={handleShow_add}>Add Student List</button>
            <button onClick={handleShowDelete}>Delete Student List</button>
          </div>
        </div>

        <div className="table-container">
          <div className="row align-items-end">
            <div className="table-title col-lg-6 col-xl-6">
              <h5 className="table-title">Student List Table</h5>
            </div>

            <div className="search-student col-lg-3 col-xl-3 justify-content-end">
              <label htmlFor="searchInput">Search Student</label>
              <input
                id="searchInput"
                placeholder="Search by Last Name"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>

            <div className="select-file-to-view col-lg-3 col-xl-3 justify-content-end">
              <label htmlFor="selectFile">Select File to View</label>
              <select
                id="selectFile"
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
              >
                <option value="">Show All List</option>
                {files.map((file, index) => (
                  <option key={index} value={file.id}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Full Name</th>
                <th>Year Level and Course</th>
                <th># of Enrolled Units</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading Student List ...</td>
                </tr>
              ) : selectedFileId ? (
                (searchInput
                  ? filteredStudents.slice(
                      indexOfFirstStudent,
                      indexOfLastStudent
                    )
                  : currentStudents
                ).length > 0 ? (
                  (searchInput
                    ? filteredStudents.slice(
                        indexOfFirstStudent,
                        indexOfLastStudent
                      )
                    : currentStudents
                  ).map((student, index) => (
                    <tr key={index}>
                      <td>{student.student_number}</td>
                      <td>{student.full_name}</td>
                      <td>{`${student.year_level} - ${student.course}`}</td>
                      <td>{student.enrolled_units}</td>
                      <td className="td-action text-center">
                        <i
                          className="fa fa-eye"
                          onClick={() => handleViewDetails(student)}
                        ></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      No students found for the selected file.
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="5">Please select a file.</td>
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
              { length: Math.ceil(studentList.length / rowsPerPage) },
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
                  Math.min(
                    prev + 1,
                    Math.ceil(studentList.length / rowsPerPage)
                  )
                )
              }
              disabled={
                currentPage === Math.ceil(studentList.length / rowsPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Upload File */}
      <Modal
        show={showAdd}
        onHide={handleClose_add}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Student File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmit(async (data) => {
              const userInfo = JSON.parse(localStorage.getItem("userInfo"));
              const yourToken = userInfo?.token;
              const formData = new FormData();
              const file = data.file[0];
              if (!file) return toast.error("Please upload an Excel file");

              formData.append("file", file);

              setLoading(true);

              try {
                const response = await fetch(`${APP_URL}/api/upload-file`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${yourToken}` },
                  body: formData,
                });
                if (!response.ok) throw new Error("Error uploading file");

                toast.success("File uploaded successfully");
                fetchFiles(); // Refresh file list
                handleClose_add();
                reset();
              } catch (error) {
                toast.error("Error uploading file");
              } finally {
                setLoading(false);
              }
            })}
          >
            <Form.Group className="mb-3">
              <Form.Label>Upload Student Excel File</Form.Label>
              <Form.Control
                type="file"
                accept=".xls,.xlsx"
                {...register("file")}
                required
              />
            </Form.Group>
            <Modal.Footer>
              <Button type="submit" className="add-btn" disabled={loading}>
                {loading ? "Uploading File ..." : "Upload File"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for Deleting Files */}
      <Modal
        show={showDeleteModal}
        onHide={handleCloseDelete}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Selected Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Are you sure you want to delete the selected files?</strong>
          </p>
          {files.map((file) => (
            <div key={file.id}>
              <input
                type="checkbox"
                checked={selectedFiles.has(file.id)}
                onChange={() => handleFileSelection(file.id)}
              />{" "}
              <label>{file.filename}</label>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer className="delete-noForm">
          <Button
            variant="danger"
            onClick={handleDeleteFiles}
            className="modal-btn"
            disabled={loading}
          >
            {loading ? "Deleting File ..." : "Delete File"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for viewing student details */}
      <Modal
        show={showDetails}
        onHide={handleCloseDetails}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="view-label">
            Full Name: <span>{selectedStudent?.full_name}</span>
          </h6>
          <h6 className="view-label">
            Student Number: <span>{selectedStudent?.student_number}</span>
          </h6>
          <h6 className="view-label">
            Year Level and Course:
            <span>
              {selectedStudent?.year_level} - {selectedStudent?.course}
            </span>
          </h6>
          <h6 className="view-label">
            Enrolled Units: <span>{selectedStudent?.enrolled_units}</span>
          </h6>
          <h6 className="view-label">
            Age: <span>{selectedStudent?.age}</span>
          </h6>
          <h6 className="view-label">
            Address:
            <span>{selectedStudent?.address}</span>
          </h6>
          <h6 className="view-label">
            Birthday: <span>{selectedStudent?.birthday}</span>
          </h6>
        </Modal.Body>
      </Modal>
    </>
  );
}
