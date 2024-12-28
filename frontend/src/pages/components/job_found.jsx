import JobFoundItem from "./job_found_item.jsx";
import Sample from "../../img/sample2.jpg";

export default function JobsForYou() {
    return (
        <section className="job-search-section">
            <div className="row justify-content-between">
                <div className="available-jobs col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                    <JobFoundItem
                        logo={Sample}
                        jobTitle="Job Title"
                        companyName="Company Name"
                        companyAddress="Company Address"
                        salary="Salary"
                        jobType="Job Type"
                    />
                </div>

                <div className="job-content-fullDescription col-md-6 col-lg-6 col-xl-6"></div>
            </div>
        </section>
    );
}
