export default function JobFoundItem({
    logo,
    jobTitle,
    companyName,
    companyAddress,
    salary,
    jobType,
}) {
    return (
        <>
            <div className="job-item-container">
                <div className="row justify-content-between">
                    <div className="job-found-logo-container col-md-4 col-lg4 col-xl-4">
                        <img src={logo} alt="" />
                    </div>

                    <div className="save-bookmark md-7 col-lg7 col-xl-7">
                        <i className="fa fa-bookmark-o"></i>
                    </div>
                </div>

                <h5 className="forYou-jobTitle">{jobTitle}</h5>
                <p className="forYou-companyName">{companyName}</p>
                <p className="forYou-companyAddress">{companyAddress}</p>

                <div className="salary-jobType-container d-flex">
                    <p className="forYou-salary">{salary}</p>
                    <p className="forYou-jobType">{jobType}</p>
                </div>
            </div>

            <div className="job-item-container">
                <div className="row justify-content-between">
                    <div className="job-found-logo-container col-md-4 col-lg4 col-xl-4">
                        <img src={logo} alt="" />
                    </div>

                    <div className="save-bookmark md-7 col-lg7 col-xl-7">
                        <i className="fa fa-bookmark-o"></i>
                    </div>
                </div>

                <h5 className="forYou-jobTitle">{jobTitle}</h5>
                <p className="forYou-companyName">{companyName}</p>
                <p className="forYou-companyAddress">{companyAddress}</p>

                <div className="salary-jobType-container d-flex">
                    <p className="forYou-salary">{salary}</p>
                    <p className="forYou-jobType">{jobType}</p>
                </div>
            </div>
        </>
    );
}
