import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProgressGraph from "./ProgressGraph";
import "./patient-dashboard.css";

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUserData = useCallback(async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("https://game-theraphy-backend.onrender.com/api/detail", {
        headers: { "x-auth-token": token },
      });
      console.log("User details fetched:", res.data);
      setUser(res.data);
    } catch (error) {
      console.error("Failed to load user details:", error);
      setError("Failed to load user details.");
    }
  }, [token, navigate]);

  const fetchGames = useCallback(async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("https://game-theraphy-backend.onrender.com/api/patient/games", {
        headers: { "x-auth-token": token },
      });
      console.log("Games fetched:", res.data);
      setGames(res.data.slice(0, 8));
    } catch (error) {
      console.error("Failed to load games:", error);
      setError("Failed to load games.");
    }
  }, [token, navigate]);

  const fetchProgress = useCallback(async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("https://game-theraphy-backend.onrender.com/api/patient/progress", {
        headers: { "x-auth-token": token },
      });
      console.log("Progress fetched:", res.data);
      setProgressData(res.data);
    } catch (error) {
      console.error("Failed to load progress:", error);
      setError("Failed to load progress.");
    }
  }, [token, navigate]);

  const fetchDailyStreak = useCallback(async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("https://game-theraphy-backend.onrender.com/api/visit/streak", {
        headers: { "x-auth-token": token },
      });
      console.log("Daily streak fetched:", res.data);
      setDailyStreak(res.data.dailyStreak);
    } catch (error) {
      console.error("Error fetching daily streak:", error.response ? error.response.data : error.message);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchUserData();
    fetchGames();
    fetchProgress();
    fetchDailyStreak();
  }, [fetchUserData, fetchGames, fetchProgress, fetchDailyStreak]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLookUpStories = () => {
    navigate("/pages/stories");
  };

  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">GameTherapy</a>
        <div className="menu">
          <Link to="/dashboard">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/pages/profile">Profile</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/pages/Ediary">e-Diary</Link>
        </div>
        <div className="profile-dropdown" ref={dropdownRef}>
          {user?.profilePic ? (
            <img
              src={`https://game-theraphy-backend.onrender.com/${user.profilePic.replace(/\\/g, "/")}`}
              alt="Profile"
              className="profile-pic"
              onClick={toggleDropdown}
            />
          ) : (
            <img
              src="/default-profile.png"
              alt="Default Profile"
              className="profile-pic"
              onClick={toggleDropdown}
            />
          )}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                {user?.profilePic ? (
                  <img
                    src={`https://game-theraphy-backend.onrender.com/${user.profilePic.replace(/\\/g, "/")}`}
                    alt="Profile"
                    className="dropdown-profile-pic"
                  />
                ) : (
                  <img
                    src="/default-profile.png"
                    alt="Default Profile"
                    className="dropdown-profile-pic"
                  />
                )}
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{user?.name || "User Name"}</p>
                  <p className="dropdown-email">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/pages/profile" className="dropdown-item">Profile</Link>
              <Link to="/leaderboard" className="dropdown-item">Leaderboard</Link>
              <Link to="/settings" className="dropdown-item">Settings</Link>
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item logout-btn">Sign out</button>
            </div>
          )}
        </div>
      </nav>
      <div className="dashboard-container">
        <main className="main-content">
          {error && <p className="error">{error}</p>}
          <section className="game-section">
            <h2>Play &amp; Enjoy</h2>
            <div className="game-grid">
              {games.length > 0 ? (
                games.map((game) => (
                  <div className="game-card" key={game.id}>
                    <img src={game.image || `/game_${game.id}.jpeg`} alt={game.title} />
                    <h4>{game.title}</h4>
                    <p>{game.description}</p>
                    <button onClick={() => navigate(`/games/${game.id}`)}>Play Now</button>
                  </div>
                ))
              ) : (
                <p className="no-games">No games available.</p>
              )}
            </div>
          </section>
          <div className="chatroom-card">
            <h2>Join the Chatroom</h2>
            <p>Connect with others and discuss freely.</p>
            <button onClick={() => navigate("/chatroom")}>Enter Chatroom</button>
          </div>
          <section className="progress-section">
            <h2>Your Progress</h2>
            {progressData.length > 0 ? (
              <ProgressGraph progress={progressData} />
            ) : (
              <p>No progress recorded yet.</p>
            )}
          </section>
          <section className="stories-section">
            <button onClick={handleLookUpStories} className="stories-btn">
              Look Up to Your Stories
            </button>
          </section>
          <section className="streak-section">
            <h3>Daily Streak</h3>
            <p>You have logged in for <strong>{dailyStreak}</strong> consecutive days.</p>
          </section>
        </main>
      </div>
      <footer className="footer">
        © 2025 GameTherapy. All Rights Reserved.
      </footer>
    </>
  );
};

export default PatientDashboard;
