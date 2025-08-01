import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import axios from "axios";

export default function LatestJobs() {
  const { isOpen } = useApp();
  const [careerInfo, setCareerInfo] = useState([]);

  const fetchCareerInfo = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/career/developer-jobs`
      );
      // Try to access the actual array from the returned data structure
      if (Array.isArray(response.data.data)) {
        setCareerInfo(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCareerInfo(response.data);
      } else {
        setCareerInfo([]);
      }
    } catch (error) {
      console.error("Error fetching career info:", error);
      setCareerInfo([]);
    }
  };

  useEffect(() => {
    fetchCareerInfo();
  }, []);

  return (
    <div className="w-full h-screen flex flex-row">
      {isOpen ? (
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
          <div className="w-4/5 h-screen">
            <TopBar />
            <div className="w-full h-full flex flex-col px-8 py-4 space-y-6 overflow-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Latest Jobs
              </h1>
              {careerInfo && careerInfo.length > 0 ? (
                careerInfo.map((item) => (
                  <div
                    key={item.job_id}
                    className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg p-5 mb-4"
                  >
                    {item.employer_logo && (
                      <div className="flex-shrink-0 flex items-center justify-center w-full md:w-48 h-32 bg-purple-500 rounded-lg mb-4 md:mb-0 md:mr-6">
                        <img
                          src={item.employer_logo}
                          alt={item.employer_name}
                          className="object-contain h-24"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                          {item.job_title}
                        </h2>
                        <span className="text-gray-500 text-sm">
                          {item.job_employment_type}
                        </span>
                      </div>
                      <span className="text-md text-gray-600 mt-1">
                        {item.employer_name}
                        {item.job_city && ` | ${item.job_city}`}
                        {item.job_state && `, ${item.job_state}`}
                        {item.job_country && `, ${item.job_country}`}
                      </span>
                      <p className="line-clamp-5 text-gray-700 my-3">
                        {item.job_description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <a
                          href={item.job_apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition"
                        >
                          Apply Now
                        </a>
                        <span className="text-sm text-gray-500">
                          Posted {item.job_posted_at}
                        </span>
                        {item.job_is_remote && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-row">
          <div className="w-full h-screen">
            <TopBar />
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-800">
                Latest Jobs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
