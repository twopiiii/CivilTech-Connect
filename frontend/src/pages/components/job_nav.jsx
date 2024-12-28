import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import JobFound from "./job_found";
import JobSaved from "./job_saved";
import JobApplied from "./job_applied";
import JobArchive from "./job_archive";

export default function JobNav({ what }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeButton, setActiveButton] = useState("");

    useEffect(() => {
        console.log("Active Button:", activeButton);

        const pathMapping = {
            "jobs-for-you": "forYou",
            "saved-jobs": "saved",
            "applied-jobs": "applied",
            "archived-jobs": "archived",
        };

        for (const [path, button] of Object.entries(pathMapping)) {
            if (location.pathname.includes(path)) {
                setActiveButton(button);
                break;
            }
        }

        if (location.pathname === "/job-opportunities") {
            setActiveButton("forYou");
        }
    }, [location.pathname]);

    const handleClick = (path) => {
        setActiveButton(path);
        navigate(`./${path}`);
    };
    return (
        <div>
            <div className="job-ojt-nav">
                <div className="job-ojt-nav-content d-flex justify-content-center">
                    <button
                        className={
                            activeButton === "forYou"
                                ? "nav-active"
                                : "nav-inactive"
                        }
                        onClick={() => handleClick("jobs-for-you")}
                        disabled={activeButton === "forYou"}
                    >
                        {what} For You
                    </button>

                    <button
                        className={
                            activeButton === "saved"
                                ? "nav-active"
                                : "nav-inactive"
                        }
                        onClick={() => handleClick("saved-jobs")}
                        disabled={activeButton === "saved"}
                    >
                        Saved {what}
                    </button>

                    <button
                        className={
                            activeButton === "applied"
                                ? "nav-active"
                                : "nav-inactive"
                        }
                        onClick={() => handleClick("applied-jobs")}
                        disabled={activeButton === "applied"}
                    >
                        Applied {what}
                    </button>

                    <button
                        className={
                            activeButton === "archived"
                                ? "nav-active"
                                : "nav-inactive"
                        }
                        onClick={() => handleClick("archived-jobs")}
                        disabled={activeButton === "archived"}
                    >
                        Archived {what}
                    </button>
                </div>
            </div>

            <section className="opportunities-content">
                {activeButton === "forYou" && <JobFound />}
                {activeButton === "saved" && <JobSaved />}
                {activeButton === "applied" && <JobApplied />}
                {activeButton === "archived" && <JobArchive />}
            </section>
        </div>
    );
}
