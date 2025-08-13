import React, { useEffect, useState } from "react";
import Layout from "../Components/Layout";

export default function SkillsInformation() {
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading skills information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skills Information
          </h1>
          <p className="text-gray-600">
            Explore various skills and their requirements in the job market
          </p>
        </div>

        {/* Content */}
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
    </Layout>
  );
}
