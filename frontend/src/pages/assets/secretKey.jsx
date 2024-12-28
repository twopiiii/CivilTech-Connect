import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectToAdmin() {
  const [keySequence, setKeySequence] = useState("");
  const secretKey = "adminctcportal";
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e) => {
      setKeySequence((prev) => (prev + e.key).slice(-secretKey.length));
    };

    window.addEventListener("keydown", handleKey);

    if (keySequence == secretKey) {
      navigate("/admin/login");
    }

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [keySequence, secretKey, navigate]);

  return null;
}
