import "../css/style.css";
import "../css/home.css";
// import VideoBg from "../videos/bg_video.mp4";
import VideoBg from "../videos/ctc_vid.mp4";
import FeatureCard from "./components/featureCard";
import TeamCard from "./components/teamCard";
// import sample from "../img/sample.jpg";
import LM_FT from "../img/lm_ft.png";
import JO_FT from "../img/jo_ft.png";
import OJT_FT from "../img/ojt_ft.png";
import TESDA_FT from "../img/tesda_ft.png";
import ContactSection from "./components/contact";
import FooterSection from "./components/footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [description, setDescription] = useState("");
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true); // Spinner state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));

  const navigateToJobOpportunities = () => {
    navigate("/job-opportunities");
  };

  const navigateToTesdaCourses = () => {
    navigate("/tesda-courses");
  };

  const navigateToOJT = () => {
    navigate("/ojt-companies");
  };

  const navigateToLearningMaterials = () => {
    navigate("/learning-resources");
  };

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    fetch(
      `${APP_URL}/api/user-display-basic-info?title=What%20is%20CivilTech%20Connect`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setDescription(data.description); // Set the fetched description
        }
      })
      .catch((error) => {
        console.error("Error fetching the description:", error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false once data is fetched
      });

    fetch(`${APP_URL}/api/user-display-founder`) // Adjust API endpoint if necessary
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch founders data");
        }
        return response.json();
      })
      .then((data) => {
        setFounders(data); // Set the fetched founders' data
      })
      .catch((error) => {
        console.error("Error fetching founders:", error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false once data is fetched
      });
  }, []);

  return (
    <>
      <ToastContainer position="top-center" />

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="homeSection">
          <section className="heroSection">
            <div className="vid-bg-container">
              <video className="bg-video" autoPlay loop muted>
                <source src={VideoBg} type="video/mp4" />
              </video>
            </div>

            <div className="overlay-text-hero">
              <h1 className="welcome">Welcome To</h1>
              <h1 className="web-title">CivilTech Connect</h1>
            </div>
          </section>

          <section className="overview">
            <div className="overview-text">
              <h2>
                What is{" "}
                <span className="highlighted-text">CivilTech Connect?</span>
              </h2>

              <p>{description}</p>
            </div>
          </section>

          <section className="features">
            <div className="feature-card">
              <div className="feature-heading d-flex flex-column align-items-center">
                <h1 className="title text-capitalize fw-bold">what we offer</h1>
                <div className="feature-line"></div>
              </div>

              <div className="row justify-content-center">
                <FeatureCard
                  imgSrc={LM_FT}
                  // title="Learning Materials"
                  desc="A curated collection of resources designed to support Civil Technology students in mastering key concepts."
                  navigate={navigateToLearningMaterials}
                />

                <FeatureCard
                  imgSrc={TESDA_FT}
                  // title="TESDA Courses"
                  desc="Specialized technical programs to enhance skills in Civil Technology, equipping students for certification and careers in the construction industry."
                  navigate={navigateToTesdaCourses}
                />

                <FeatureCard
                  imgSrc={JO_FT}
                  // title="Job Opportunities"
                  desc="A platform connecting Civil Technology graduates to employment options that align with your academic training and skills."
                  navigate={navigateToJobOpportunities}
                />

                <FeatureCard
                  imgSrc={OJT_FT}
                  title="OJT Companies"
                  desc="On-the-Job Training (OJT) placements that immerse Civil Technology students in real-world construction projects."
                  navigate={navigateToOJT}
                  user={studentInfo}
                />
              </div>
            </div>
          </section>

          <section className="team">
            <div className="team-card">
              <div className="team-title">
                <div className="team-heading d-flex align-items-center justify-content-center">
                  <h1 className="title text-capitalize fw-bold">
                    the founders
                  </h1>
                  <div className="line team-line"></div>
                </div>

                <div className="team-desc">
                  <p>Meet the visionaries behind CivilTech Connect!</p>
                </div>
              </div>

              <div className="row justify-content-evenly">
                {founders.map((founder) => (
                  <TeamCard
                    key={founder.id}
                    img={founder.img}
                    name={founder.name}
                  />
                ))}
              </div>
            </div>
          </section>

          <ContactSection />
          <FooterSection />
        </div>
      )}
    </>
  );
}
