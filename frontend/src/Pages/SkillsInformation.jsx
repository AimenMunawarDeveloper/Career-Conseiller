import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";

export default function SkillsInformation() {
  const { isOpen } = useApp();
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/career/skills`
        );
        if (!res.ok) throw new Error("Failed to fetch skills");
        const json = await res.json();
        // The skills are inside json.data
        setSkillsData(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  return (
    <div className="w-full h-screen flex flex-row">
      {isOpen ? (
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
          <div className="w-4/5 h-screen overflow-auto">
            <TopBar />
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Skills Information
              </h2>

              {loading && <div>Loading skills...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && skillsData.length === 0 && (
                <div>No skills found.</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skillsData.map((skill) => (
                  <div
                    key={skill.id || skill.uuid}
                    className="bg-white shadow-md rounded-md p-4 flex flex-col justify-between"
                  >
                    <h3 className="text-lg font-semibold mb-2">{skill.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Type:{" "}
                      <span className="font-medium">{skill.type?.name}</span>
                    </p>
                    {skill.infoUrl && (
                      <a
                        href={skill.infoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline text-sm mt-auto"
                      >
                        More info
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col items-center justify-center p-6">
          <TopBar />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skills Information
          </h1>

          {loading && <div>Loading skills...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && skillsData.length === 0 && (
            <div>No skills found.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {skillsData.map((skill) => (
              <div
                key={skill.id || skill.uuid}
                className="bg-white shadow-md rounded-md p-4 flex flex-col justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {skill.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Type: <span className="font-medium">{skill.type?.name}</span>
                </p>
                {skill.infoUrl && (
                  <a
                    href={skill.infoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-sm mt-auto"
                  >
                    More info
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
