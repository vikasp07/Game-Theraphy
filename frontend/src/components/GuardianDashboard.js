import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GuardianDashboard = () => {
  const [playersData, setPlayersData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch players and their game details associated with this guardian
  const fetchPlayersGameDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/guardian/players/games", {
        headers: { "x-auth-token": token },
      });
      setPlayersData(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error(
        "Error fetching players' game details:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load players' game data.");
    }
  };

  useEffect(() => {
    fetchPlayersGameDetails();
  }, []);

  // Navigate to the patient games page with the patient's ID
  const handleViewGames = (patientId) => {
    navigate(`/patient-games/${patientId}`);
  };

  // Logout function: clear token and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="guardian-dashboard">
      <h2>Guardian Dashboard</h2>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {playersData.length > 0 ? (
        <div className="players-list">
          <h3>My Players</h3>
          {playersData.map(({ player, progress }) => (
            <div key={player._id} className="player-card">
              <p>
                <strong>Name:</strong> {player.name}
              </p>
              <p>
                <strong>Email:</strong> {player.email}
              </p>
              <button onClick={() => handleViewGames(player._id)}>
                View Games
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No players associated with this guardian.</p>
      )}
    </div>
  );
};

export default GuardianDashboard;
