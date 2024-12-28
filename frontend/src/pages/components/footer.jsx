import { NavLink } from "react-router-dom";
import "../../css/footer.css";
import Logo from "../../img/logo_final.png";
import BU_Logo from "../../img/bu_logo.png";
import ContactDeets from "./contact_deets.jsx";
import Socials from "./socials.jsx";
import { useEffect, useState } from "react";

export default function Footer() {
  const [contactDetails, setContactDetails] = useState([]);
  const [socialMedias, setSocialMedias] = useState([]);
  const [loading, setLoading] = useState(true);

  const APP_URL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    // Fetch contact details
    fetch(`${APP_URL}/api/user-display-contacts`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setContactDetails(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching contact details:", error);
      });

    // Fetch social media details
    fetch(`${APP_URL}/api/user-display-socials`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch social media data");
        }
        return response.json();
      })
      .then((data) => {
        setSocialMedias(data);
      })
      .catch((error) => {
        console.error("Error fetching social media details:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="footer-section">
      <div className="footer-content">
        <div className="row justify-content-between">
          <div className="credit col-12 col-sm-12 col-md-12 col-lg-6 col-xl-4">
            <div className="logos">
              <img
                className="bu_logo"
                src={BU_Logo}
                alt="Bicol Univerity Logo"
              />
              <img
                className="ct_logo"
                src={Logo}
                alt="CivilTech Connect Logo"
              />
            </div>

            <div className="desc">
              <p>
                Learn, Develop, Work: Shaping Tomorrow's Civil Technology
                Experts.
              </p>
            </div>
          </div>

          <div className="footer-features col-12 col-sm-12 col-md-6 col-lg-5 col-xl-2">
            <div className="footer-list-title">Features</div>
            <ul className="list-unstyled">
              <li>
                <NavLink to="/">home</NavLink>
              </li>
              <li>
                <NavLink to="/learning-resources">learning resources</NavLink>
              </li>
              <li>
                <NavLink to="/tesda-courses">TESDA courses</NavLink>
              </li>
              <li>
                <NavLink to="/job-opportunities">job opportunities</NavLink>
              </li>
              <li>
                <NavLink to="/ojt-companies">ojt companies</NavLink>
              </li>
            </ul>
          </div>

          <div className="footer-contactInfo col-12 col-sm-12 col-md-6 col-lg-6 col-xl-2">
            <div className="footer-list-title">Contact Info</div>

            <ul className="list-unstyled">
              {contactDetails.map((contact, index) => (
                <ContactDeets
                  key={index}
                  media={contact.media}
                  value={contact.info}
                />
              ))}
            </ul>
          </div>

          <div className="footer-socials col-12 col-sm-12 col-md-6 col-lg-5 col-xl-2">
            <div className="footer-list-title">Socials</div>

            <ul className="list-unstyled">
              {socialMedias.map((social, index) => (
                <Socials
                  key={index}
                  fa_icon={`fa fa-${social.social_media}`}
                  link={social.link}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
