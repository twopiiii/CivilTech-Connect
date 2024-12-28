import { useEffect, useState } from "react";

export default function TesdaFlush({ categoryId }) {
  const [courses, setCourses] = useState([]); // Stores courses data
  const [centers, setCenters] = useState([]); // Stores centers data
  const [loading, setLoading] = useState(true); // Loading state for courses
  const [materials, setMaterials] = useState({}); // Stores materials by course_id
  const [materialsLoading, setMaterialsLoading] = useState({}); // Tracks loading state for materials

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetching courses based on categoryId
  useEffect(() => {
    fetch(`${APP_URL}/api/display-in-user-tesda-learning-courses/${categoryId}`)
      .then((response) => response.json())
      .then((topicsData) => {
        setCourses(topicsData);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId]);

  // Fetching materials for a specific course
  const fetchMaterials = async (courseId) => {
    if (materialsLoading[courseId] || materials[courseId]) return;

    setMaterialsLoading((prev) => ({ ...prev, [courseId]: true }));

    try {
      const response = await fetch(
        `${APP_URL}/api/display-in-user-tesda-learning-courses/${categoryId}`
      );
      const materialsData = await response.json();

      const filteredMaterials = materialsData.filter(
        (material) => material.course_id === courseId
      );

      setMaterials((prev) => ({
        ...prev,
        [courseId]: filteredMaterials,
      }));
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setMaterialsLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  // Fetching centers
  useEffect(() => {
    fetch(`${APP_URL}/api/user-training-center`)
      .then((response) => response.json())
      .then((centersData) => {
        setCenters(centersData);
        console.log(centersData); // Log the centers data for debugging
      })
      .catch((error) => {
        console.error("Error fetching centers:", error);
      });
  }, []);

  // Get center data for the specific course (handling an array of training center IDs)
  const getCentersForCourse = (trainingCenterIds) => {
    console.log("Training Center IDs:", trainingCenterIds);

    // Ensure trainingCenterIds is an array of strings
    if (typeof trainingCenterIds === "string") {
      trainingCenterIds = [trainingCenterIds]; // Convert a single ID to an array
    }

    const filteredCenters = centers.filter(
      (center) => trainingCenterIds.includes(String(center.center_id)) // Compare as strings
    );

    console.log("Filtered Centers:", filteredCenters); // Debugging line

    return filteredCenters;
  };

  return (
    <div
      className="accordion accordion-flush"
      id={`accordionFlush-${categoryId}`}
    >
      {loading ? (
        <p>Loading Courses...</p>
      ) : courses.length > 0 ? (
        courses
          .slice()
          .sort((a, b) => a.course.localeCompare(b.course))
          .map((course) => (
            <div
              className="accordion-item border"
              key={course.course_id}
              id={`accordionButton-${course.course_id}`}
            >
              <h2 className="accordion-header">
                <button
                  style={{ textTransform: "capitalize" }}
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#flush-collapse-${course.course_id}`}
                  aria-expanded="false"
                  aria-controls={`flush-collapse-${course.course_id}`}
                  onClick={() => fetchMaterials(course.course_id)}
                >
                  {course.course}
                </button>
              </h2>

              <div
                id={`flush-collapse-${course.course_id}`}
                className="accordion-collapse collapse"
                data-bs-parent={`#accordionFlush-${categoryId}`}
              >
                <div className="accordion-body">
                  {materialsLoading[course.course_id] ? (
                    <p>Loading Course Details...</p>
                  ) : materials[course.course_id] &&
                    materials[course.course_id].length > 0 ? (
                    materials[course.course_id].map((material) => (
                      <div key={material.id} className="reviewer-link">
                        <p style={{ marginBottom: "10px" }}>
                          <b>Description: </b>
                          {material.short_desc}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>There is no data for this course.</p>
                  )}

                  {/* Displaying training center information */}
                  <div>
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ fontSize: "14px" }}>
                        <b>Training Center(s):</b>
                      </p>
                    </div>

                    {course.training_center &&
                    course.training_center.length > 0 ? (
                      // Clean up the string before splitting
                      getCentersForCourse(
                        course.training_center
                          .replace(/[\[\]"\s]/g, "") // Remove any brackets, quotes, or spaces
                          .split(",")
                          .slice() // Create a shallow copy of the array
                          .sort((a, b) => a.localeCompare(b)) // Split by comma into an array of IDs
                      ).map((center, index) => (
                        <div key={center.center_id}>
                          <div style={{ marginBottom: "40px" }}>
                            <p
                              style={{ fontSize: "13px", marginBottom: "10px" }}
                            >
                              <b>Training Center {index + 1}</b>
                            </p>

                            <p
                              style={{ fontSize: "14px", marginBottom: "10px" }}
                            >
                              {center.training_center}
                            </p>

                            <p
                              style={{ fontSize: "14px", marginBottom: "10px" }}
                            >
                              {center.address}
                            </p>

                            <p
                              style={{ fontSize: "14px", marginBottom: "10px" }}
                            >
                              {center.phone}
                            </p>

                            <p
                              style={{ fontSize: "14px", marginBottom: "10px" }}
                            >
                              {center.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No training center assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
}
