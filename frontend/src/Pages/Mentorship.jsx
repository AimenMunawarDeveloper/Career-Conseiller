import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import { BsPlus, BsSearch, BsCalendar, BsPeople, BsStar } from "react-icons/bs";
import { MdLocationOn, MdWork, MdSchool } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Mentorship() {
  const { isOpen } = useApp();
  const [activeTab, setActiveTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    field: "",
    expertise: "",
    rating: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch mentors
      const mentorsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentorship/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMentors(mentorsResponse.data.mentors);

      // Fetch events
      const eventsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentorship/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(eventsResponse.data.events);

      // Fetch user mentorships
      const mentorshipsResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentorship/user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMentorships(mentorshipsResponse.data.mentorships);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMentorship = async (mentorId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentorship/request`,
        {
          mentorId,
          field: "General Career Guidance",
          message: "I would like to connect with you for career guidance.",
          goals: ["Career planning", "Skill development"],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Mentorship request sent successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to send mentorship request");
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/mentorship/events/${eventId}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Successfully registered for event!");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to register for event");
    }
  };

  const renderMentorCard = (mentor) => (
    <div key={mentor._id} className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {mentor.userId?.name?.charAt(0) || "M"}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {mentor.userId?.name || "Mentor Name"}
            </h3>
            <p className="text-gray-600">
              {mentor.currentRole?.title} at {mentor.currentRole?.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <BsStar className="text-yellow-400" />
          <span className="text-sm font-medium">
            {mentor.rating.average.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{mentor.bio}</p>

      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Expertise</h4>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise.map((exp, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {exp.field} ({exp.yearsOfExperience} years)
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">
            {mentor.availability.maxMentees - mentor.rating.totalReviews}
          </span>{" "}
          spots available
        </div>
        <button
          onClick={() => handleRequestMentorship(mentor.userId._id)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Request Mentorship
        </button>
      </div>
    </div>
  );

  const renderEventCard = (event) => (
    <div key={event._id} className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm">{event.organizer.name}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            event.price.isFree
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {event.price.isFree ? "Free" : `$${event.price.amount}`}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <BsCalendar className="text-gray-500" />
          <span>{new Date(event.date.start).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdLocationOn className="text-gray-500" />
          <span>{event.location.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <BsPeople className="text-gray-500" />
          <span>
            {event.capacity.registered}/{event.capacity.total || "∞"} registered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MdWork className="text-gray-500" />
          <span className="capitalize">{event.eventType}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => handleRegisterEvent(event._id)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  );

  const renderMentorshipCard = (mentorship) => (
    <div
      key={mentorship._id}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {mentorship.field} Mentorship
          </h3>
          <p className="text-gray-600">
            with {mentorship.mentorId?.name || "Mentor"}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            mentorship.status === "accepted"
              ? "bg-green-100 text-green-800"
              : mentorship.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {mentorship.status.charAt(0).toUpperCase() +
            mentorship.status.slice(1)}
        </span>
      </div>

      {mentorship.message && (
        <p className="text-gray-700 mb-4">{mentorship.message}</p>
      )}

      <div className="text-sm text-gray-600">
        <p>Started: {new Date(mentorship.createdAt).toLocaleDateString()}</p>
        {mentorship.sessions && mentorship.sessions.length > 0 && (
          <p>Sessions: {mentorship.sessions.length}</p>
        )}
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mentorship & Events
          </h1>
          <p className="text-gray-600">
            Connect with mentors and discover career opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-6 py-3 font-medium ${
              activeTab === "mentors"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BsPeople className="inline mr-2" />
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 font-medium ${
              activeTab === "events"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BsCalendar className="inline mr-2" />
            Career Events
          </button>
          <button
            onClick={() => setActiveTab("my-mentorships")}
            className={`px-6 py-3 font-medium ${
              activeTab === "my-mentorships"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdWork className="inline mr-2" />
            My Mentorships
          </button>
        </div>

        {/* Mentors Tab */}
        {activeTab === "mentors" && (
          <div>
            {/* Search Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Search Mentors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Field of expertise"
                  value={searchFilters.field}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      field: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={searchFilters.expertise}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      expertise: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                <select
                  value={searchFilters.rating}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      rating: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map(renderMentorCard)}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(renderEventCard)}
            </div>
          </div>
        )}

        {/* My Mentorships Tab */}
        {activeTab === "my-mentorships" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentorships.map(renderMentorshipCard)}
            </div>
            {mentorships.length === 0 && (
              <div className="text-center py-12">
                <BsPeople className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No mentorships yet
                </h3>
                <p className="text-gray-600">
                  Start by finding a mentor that matches your career goals.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-row">
      {isOpen ? (
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
          <div className="w-4/5 h-screen flex flex-col">
            <TopBar />
            {mainContent}
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col">
          <TopBar />
          {mainContent}
        </div>
      )}
    </div>
  );
}
