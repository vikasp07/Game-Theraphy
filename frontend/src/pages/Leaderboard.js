// frontend/src/pages/Leaderboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./leaderboard.css";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://game-theraphy-backend.onrender.com/api/leaderboard",
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("API response:", res.data); // Debug: log the raw API data
        setLeaderboardData(res.data);
        setError("");
      } catch (err) {
        console.error(
          "Error fetching leaderboard:",
          err.response?.data || err.message
        );
        setError("Failed to load leaderboard data.");
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-header">
        <h1>Game Therapy Leaderboard</h1>
        <p>Track your progress and see how you rank against other players!</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player Name</th>
              <th>Total Score</th>
              <th>Average Score</th>
              <th>Best Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length > 0 ? (
              leaderboardData.map((player, index) => (
                <tr key={player._id || index}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.totalScore}</td>
                  <td>{Number(player.averageScore).toFixed(2)}</td>
                  <td>{player.bestScore}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No leaderboard data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="leaderboard-footer">
        <p>&copy; 2025 GameTherapy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Leaderboard;
