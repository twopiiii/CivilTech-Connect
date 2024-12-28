import "../css/style.css";
import "../css/learning-resources.css";
import Flush from "./components/flush.jsx";
import ContactSection from "../pages/components/contact.jsx";
import Footer from "../pages/components/footer.jsx";
import { useEffect, useState } from "react";

export default function LearningResources() {
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [topicsWithMaterials, setTopicsWithMaterials] = useState({}); // Keyed by category_id
  const [loading, setLoading] = useState(true);

  const APP_URL = import.meta.env.VITE_APP_URL;

  // Fetch description
  useEffect(() => {
    fetch(`${APP_URL}/api/user-display-basic-info?title=Learning%20Resources`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setDescription(data.description);
        }
      })
      .catch((error) => {
        console.error("Error fetching the description:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch categories and topics
  useEffect(() => {
    fetch(`${APP_URL}/api/display-in-user-categories`)
      .then((response) => response.json())
      .then((categoriesData) => {
        console.log("Categories:", categoriesData);
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      })
      .catch((error) => {
        console.error("Error fetching the categories:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <section className="learning-resources-section">
          <div className="learning-resources-content">
            <div className="learning-resources-heading d-flex align-items-center">
              <div className="line"></div>
              <h3 className="title text-uppercase fw-bold">
                Learning Resources
              </h3>
            </div>

            <div className="learning-resources-overview">
              <p>{description}</p>
            </div>

            <hr />
          </div>

          {/* Display each category with topics and learning materials */}
          {categories.length > 0 ? (
            categories
              .sort((a, b) => a.category.localeCompare(b.category))
              .map((category, index) => (
                <div
                  className="resources-container"
                  key={category.category_id}
                  style={index === 0 ? { marginTop: "70px" } : {}}
                >
                  <div className="course-title">
                    <h3>{category.category}</h3>
                  </div>

                  {/* Pass only categoryId to Flush component */}
                  <Flush categoryId={category.category_id} />
                </div>
              ))
          ) : (
            <p></p>
          )}

          <ContactSection />
          <Footer />
        </section>
      )}
    </>
  );
}
