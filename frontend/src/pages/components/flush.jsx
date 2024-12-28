import { useEffect, useState } from "react";

export default function Flush({ categoryId }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for topics
  const [materials, setMaterials] = useState({}); // To store materials for each topic
  const [materialsLoading, setMaterialsLoading] = useState({}); // To track loading state for each topic's materials

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    fetch(`${APP_URL}/api/display-in-user-topics/${categoryId}`)
      .then((response) => response.json())
      .then((topicsData) => {
        console.log("Fetched Topics:", topicsData);
        setTopics(topicsData);
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId]);

  // Function to fetch materials for a specific topic
  const fetchMaterials = async (topicId) => {
    setMaterialsLoading((prev) => ({ ...prev, [topicId]: true })); // Set loading for this topic's materials

    try {
      const response = await fetch(
        `${APP_URL}/api/display-in-user-learning-materials/${topicId}`
      );
      const materialsData = await response.json();
      setMaterials((prev) => ({ ...prev, [topicId]: materialsData }));
    } catch (error) {
      console.error("Error fetching learning materials:", error);
    } finally {
      setMaterialsLoading((prev) => ({ ...prev, [topicId]: false })); // Finished loading for this topic's materials
    }
  };

  return (
    <div
      className="accordion accordion-flush"
      id={`accordionFlush-${categoryId}`}
    >
      {loading ? (
        <p>Loading topics...</p>
      ) : topics.length > 0 ? (
        topics
          .slice()
          .sort((a, b) => a.topic.localeCompare(b.topic))
          .map((topic) => (
            <div className="accordion-item border" key={topic.topic_id}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#flush-collapse-${topic.topic_id}`}
                  aria-expanded="false"
                  aria-controls={`flush-collapse-${topic.topic_id}`}
                  onClick={() => fetchMaterials(topic.topic_id)}
                >
                  {topic.topic}
                </button>
              </h2>

              <div
                id={`flush-collapse-${topic.topic_id}`}
                className="accordion-collapse collapse"
                data-bs-parent={`#accordionFlush-${categoryId}`}
              >
                <div className="accordion-body">
                  {materialsLoading[topic.topic_id] ? (
                    <p>Loading Learning Materials...</p>
                  ) : materials[topic.topic_id] &&
                    materials[topic.topic_id].length > 0 ? (
                    materials[topic.topic_id]
                      .slice()
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((material) => (
                        <div key={material.id} className="reviewer-link">
                          <a
                            href={
                              material.link.startsWith("http")
                                ? material.link
                                : `https://${material.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault();
                              const url = material.link.startsWith("http")
                                ? material.link
                                : `https://${material.link}`;
                              window.open(url, "_blank");
                            }}
                          >
                            {material.title}
                          </a>

                          {/* <h5>{material.title}</h5> */}

                          {material.description !== null && (
                            <p>{material.description}</p>
                          )}

                          {/* <a
                        href={
                          material.link.startsWith("http")
                            ? material.link
                            : `https://${material.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          const url = material.link.startsWith("http")
                            ? material.link
                            : `https://${material.link}`;
                          window.open(url, "_blank");
                        }}
                      >
                        Click to Open URL
                      </a> */}
                        </div>
                      ))
                  ) : (
                    <p>No learning materials available for this topic.</p>
                  )}
                </div>
              </div>
            </div>
          ))
      ) : (
        <p>No topics available.</p>
      )}
    </div>
  );
}
