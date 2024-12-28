import "../../css/home.css";
import { toast } from "react-toastify";

export default function featureCard({ title, desc, imgSrc, navigate, user }) {
  const handleNavigate = () => {
    if (title === "OJT Companies" && !user) {
      toast.info("You must be logged in to access OJT Companies!");
      return; // Don't navigate if not logged in for OJT Companies
    }
    navigate(); // Proceed with navigation for other features or if logged in for OJT Companies
  };

  return (
    <div className="feature-content col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5 text-center">
      <div className="feature-img-container">
        <img src={imgSrc} />
      </div>

      {/* <div className="feature-title">
        <h5>{title}</h5>
      </div> */}

      <div className="feature-desc">
        <p>{desc}</p>
      </div>

      <div className="feature-explore-btn">
        <button className="explore-btn" onClick={handleNavigate}>
          View More{" "}
        </button>
      </div>
    </div>
  );
}
