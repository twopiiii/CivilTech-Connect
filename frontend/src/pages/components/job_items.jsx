import React from "react";
import { useLocation } from "react-router-dom";

export default function JobItems({
    logo,
    jobTitle,
    companyName,
    companyAddress,
    date,
}) {
    const location = useLocation();

    return (
        <div className="job-container">
            <div className="job-content">
                <div className="job row">
                    <div className="job-logo-container col-lg-2 col-xl-2">
                        <img src={logo} alt="" />
                    </div>

                    <div className="job-details col-8 col-sm-8 col-md-8 col-lg-6 col-xl-6">
                        {(location.pathname ===
                            "/job-opportunities/applied-jobs" ||
                            location.pathname ===
                                "/job-opportunities/archived-jobs") && (
                            <span className="badge text-bg-primary update-status">
                                Applied
                            </span>
                        )}

                        <h5 className="job-title">{jobTitle}</h5>
                        <p className="job-company-name">{companyName}</p>
                        <p className="job-company-address">{companyAddress}</p>

                        <div className="applied-container">
                            {location.pathname ===
                                "/job-opportunities/saved-jobs" && (
                                <p className="applied-date">
                                    <b>Saved</b> on {date}
                                </p>
                            )}

                            {(location.pathname ===
                                "/job-opportunities/applied-jobs" ||
                                location.pathname ===
                                    "/job-opportunities/archived-jobs") && (
                                <p className="applied-date">
                                    <b>Applied</b> on {date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="job-buttons col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 d-flex flex-column align-items-end">
                        <div className="icons-container d-flex justify-content-end dropend">
                            {location.pathname ===
                                "/job-opportunities/saved-jobs" && (
                                <i className="fa fa-bookmark me-2"></i>
                            )}
                            <button
                                type="button"
                                className="dropend-edit"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="fa fa-info-circle"></i>
                            </button>

                            <ul className="dropdown-menu">
                                {location.pathname ===
                                    "/job-opportunities/saved-jobs" && (
                                    <ul>
                                        <li>Applied</li>
                                    </ul>
                                )}

                                {location.pathname ===
                                    "/job-opportunities/applied-jobs" && (
                                    <ul>
                                        <li>Archive</li>
                                        <li>Remove</li>
                                    </ul>
                                )}

                                {location.pathname ===
                                    "/job-opportunities/archived-jobs" && (
                                    <ul>
                                        <li>Unarchive</li>
                                        <li>Remove</li>
                                    </ul>
                                )}
                            </ul>
                        </div>

                        {location.pathname ===
                            "/job-opportunities/saved-jobs" && (
                            <div className="applyNow-btn-container mt-1">
                                <button className="applyNow-btn">
                                    Apply Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="job-content">
                <div className="job row">
                    <div className="job-logo-container col-lg-2 col-xl-2">
                        <img src={logo} alt="" />
                    </div>

                    <div className="job-details col-8 col-sm-8 col-md-8 col-lg-6 col-xl-6">
                        {(location.pathname ===
                            "/job-opportunities/applied-jobs" ||
                            location.pathname ===
                                "/job-opportunities/archived-jobs") && (
                            <span className="badge text-bg-primary update-status">
                                Applied
                            </span>
                        )}

                        <h5 className="job-title">{jobTitle}</h5>
                        <p className="job-company-name">{companyName}</p>
                        <p className="job-company-address">{companyAddress}</p>

                        <div className="applied-container">
                            {location.pathname ===
                                "/job-opportunities/saved-jobs" && (
                                <p className="applied-date">
                                    <b>Saved</b> on {date}
                                </p>
                            )}

                            {(location.pathname ===
                                "/job-opportunities/applied-jobs" ||
                                location.pathname ===
                                    "/job-opportunities/archived-jobs") && (
                                <p className="applied-date">
                                    <b>Applied</b> on {date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="job-buttons col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 d-flex flex-column align-items-end">
                        <div className="icons-container d-flex justify-content-end dropend">
                            {location.pathname ===
                                "/job-opportunities/saved-jobs" && (
                                <i className="fa fa-bookmark me-2"></i>
                            )}
                            <button
                                type="button"
                                className="dropend-edit"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="fa fa-info-circle"></i>
                            </button>

                            <ul className="dropdown-menu">
                                {location.pathname ===
                                    "/job-opportunities/saved-jobs" && (
                                    <ul>
                                        <li>Applied</li>
                                    </ul>
                                )}

                                {location.pathname ===
                                    "/job-opportunities/applied-jobs" && (
                                    <ul>
                                        <li>Archive</li>
                                        <li>Remove</li>
                                    </ul>
                                )}

                                {location.pathname ===
                                    "/job-opportunities/archived-jobs" && (
                                    <ul>
                                        <li>Unarchive</li>
                                        <li>Remove</li>
                                    </ul>
                                )}
                            </ul>
                        </div>

                        {location.pathname ===
                            "/job-opportunities/saved-jobs" && (
                            <div className="applyNow-btn-container mt-1">
                                <button className="applyNow-btn">
                                    Apply Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
