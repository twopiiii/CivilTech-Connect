import { useLocation } from "react-router-dom";

export default function JobOjtSearch({
  search_company_placeholder,
  search_location_placeholder,
}) {
  const location = useLocation();

  return (
    <div className="search-section">
      <div className="search-content row d-flex justify-content-center">
        <input
          type="text"
          className="search-company col-7 col-sm-9 col-md-9 col-lg-5 col-xl-5"
          placeholder={search_company_placeholder}
        />
        {/* <input
                    type="text"
                    className='search-location col-7 col-sm-9 col-md-9 col-lg-5 col-xl-5
                    placeholder={search_location_placeholder}
                          /> */}
        <button className="find-btn col-5 col-sm-3 col-md-3 col-lg-2 col-xl-2">
          <i className="fa fa-search"></i>Find
        </button>
      </div>
    </div>
  );
}
