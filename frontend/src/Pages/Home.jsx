import React from "react";
import Layout from "../Components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="w-full h-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to Career Counselor
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Your AI-powered career development companion. Get personalized advice,
          build your roadmap, and advance your career.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              AI Chat
            </h3>
            <p className="text-gray-600">
              Get instant career advice and guidance from our AI counselor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Career Roadmap
            </h3>
            <p className="text-gray-600">
              Create personalized career development plans and track your
              progress.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Skill Analysis
            </h3>
            <p className="text-gray-600">
              Identify skill gaps and get recommendations for improvement.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
