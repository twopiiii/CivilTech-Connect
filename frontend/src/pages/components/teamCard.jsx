import "../../css/home.css";

export default function teamCard({ img, name, position, desc }) {
  const APP_URL = import.meta.env.VITE_APP_URL;

  return (
    <div className="team-content col-12 col-sm-12 col-md-6 col-lg-5 col-xl-4 text-center">
      <div className="team-img-container">
        <img src={`${APP_URL}/storage/${img}`} />
      </div>

      <div className="team-name fw-bold">
        <h5>{name}</h5>
      </div>

      {/* <div className="team-position fw-bold">
                <h6>{position}</h6>
            </div> */}
      {/* 
            <div className="team-info">
                <p>{desc}</p>
            </div> */}
    </div>
  );
}
