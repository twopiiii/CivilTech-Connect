import Sample2 from "../../img/sample2.jpg";
import JobItems from "./job_items";

export default function Saved() {
    return (
        <JobItems
            logo={Sample2}
            jobTitle="Job Title"
            companyName="Company name"
            companyAddress="Company Address"
            date="Sept 6"
        />
    );
}
