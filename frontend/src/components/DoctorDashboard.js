import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [seminars, setSeminars] = useState([]);
  const [newSeminar, setNewSeminar] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Fetch seminars
  const fetchSeminars = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/doctor/seminars", {
        headers: { "x-auth-token": token },
      });

      setSeminars(res.data);
    } catch (error) {
      console.error("Error fetching seminars:", error);
      setError("Failed to load seminars. Please check your login status.");
    }
  }, [navigate]);

  useEffect(() => {
    fetchSeminars();
  }, [fetchSeminars]);

  // Handle seminar creation
  const handleCreateSeminar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to create a seminar.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/doctor/seminars",
        newSeminar,
        { headers: { "x-auth-token": token } },
      );

      setSeminars([...seminars, res.data.seminar]);
      setSuccess("Seminar scheduled successfully!");
      setNewSeminar({ title: "", description: "", startTime: "", endTime: "" });
    } catch (error) {
      setError("Error creating seminar. Please try again.");
      console.error("Error creating seminar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Doctor Dashboard</h2>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Schedule a Seminar</h3>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <form onSubmit={handleCreateSeminar} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Seminar Title"
            value={newSeminar.title}
            onChange={(e) =>
              setNewSeminar({ ...newSeminar, [e.target.name]: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newSeminar.description}
            onChange={(e) =>
              setNewSeminar({ ...newSeminar, [e.target.name]: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="datetime-local"
            name="startTime"
            value={newSeminar.startTime}
            onChange={(e) =>
              setNewSeminar({ ...newSeminar, [e.target.name]: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="datetime-local"
            name="endTime"
            value={newSeminar.endTime}
            onChange={(e) =>
              setNewSeminar({ ...newSeminar, [e.target.name]: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Scheduling..." : "Schedule Seminar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorDashboard;
