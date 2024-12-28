import { useState, useEffect, useRef } from "react";
import "../../css/contact.css";
import Socials from "./socials.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Contact() {
  const [contactDetails, setContactDetails] = useState([]);
  const [socialMedias, setSocialMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentNumber, setStudentNumber] = useState("");
  const [studentName, setStudentName] = useState("");

  const formRef = useRef();

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

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("studentInfo"));
    // console.log(userInfo);

    if (userInfo) {
      setStudentNumber(userInfo.student_number);
      setStudentName(userInfo.full_name);
    }
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const studentNumber = e.target[0].value;
    const studentName = e.target[1].value;
    const email = e.target[2].value; // Sender's email
    const subject = e.target[3].value; // Subject from the form
    const message = e.target[4].value;

    // Fixed email address to send to
    // const fixedEmail = "support@example.com"; // Replace with your fixed email address

    try {
      const response = await fetch(`${APP_URL}/api/emailed-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: studentNumber,
          studentName: studentName,
          email, // Sender's email
          // fixedEmail, // Hardcoded recipient email
          subject, // Subject passed from the form
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send the message.");
      }

      formRef.current.reset();
      toast.success("Your message has been sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending the message.");
    }
  };

  return (
    <>
      {/* <ToastContainer position="top-center" /> */}

      <section className="contact-section">
        <div className="contact-content">
          <div className="row justify-content-between align-items-center">
            <div className="contact-details col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5">
              <div className="contact-overview">
                <h1 className="fw-bold">Got any questions? Message us!</h1>
              </div>

              <hr />

              <div className="contact-details-section">
                <h4>Get in touch</h4>

                <ul className="list-unstyled">
                  {contactDetails.map((contact, index) => (
                    <li key={index} className="contact-item">
                      <i
                        className={`fa ${
                          contact.media === "phone no." ||
                          contact.media === "telephone"
                            ? "fa-phone"
                            : "fa-envelope"
                        }`}
                      ></i>
                      <div className="deets">
                        <h5>{contact.media}</h5>
                        <p>{contact.info}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <hr />

              <div className="socials-section">
                <h4>Follow us on social media</h4>

                <div className="socials">
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

                <p>We are looking forward to connecting with you!</p>
              </div>
            </div>

            <div className="contact-input col-12 col-sm-12 col-md-6 col-lg-5 col-xl-5">
              <div className="contact-text">
                <h4>Send Us a Message</h4>
                <p>
                  We're here to help! Your thoughts are important to us, and we
                  look forward to hearing from you. All messages will be sent
                  directly to our email for a prompt response.
                </p>
              </div>

              <form ref={formRef} onSubmit={handleFormSubmit}>
                <div className="row justify-content-between">
                  <input
                    type="hidden"
                    name="student_number"
                    value={studentNumber}
                  />
                  <input
                    type="hidden"
                    name="student_name"
                    value={studentName}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12"
                    required
                  />
                  <textarea
                    placeholder="Message"
                    className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12"
                    required
                  />
                </div>

                <div className="submit-btn">
                  <button type="submit">Send Email</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
