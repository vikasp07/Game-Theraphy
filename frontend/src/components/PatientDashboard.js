// // frontend/src/components/PatientDashboard.js
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import ProgressGraph from "./ProgressGraph";
// import "./patient-dashboard.css";

// const PatientDashboard = () => {
//   const [user, setUser] = useState(null);
//   const [games, setGames] = useState([]);
//   const [progressData, setProgressData] = useState([]);
//   const [error, setError] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchUserData();
//     fetchGames();
//     fetchProgress();
//   }, []);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Fetch user details from the details endpoint (which includes profilePic)
//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found, redirecting to login");
//         navigate("/login");
//         return;
//       }
//       // NOTE: Changed endpoint from /api/auth/user to /api/detail
//       const res = await axios.get("http://localhost:5000/api/detail", {
//         headers: { "x-auth-token": token },
//       });
//       console.log("User details fetched:", res.data);
//       setUser(res.data);
//     } catch (error) {
//       console.error("Failed to load user details:", error);
//       setError("Failed to load user details.");
//     }
//   };

//   const fetchGames = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found in fetchGames, redirecting to login");
//         navigate("/login");
//         return;
//       }
//       const res = await axios.get("http://localhost:5000/api/patient/games", {
//         headers: { "x-auth-token": token },
//       });
//       console.log("Games fetched:", res.data);
//       setGames(res.data);
//     } catch (error) {
//       console.error("Failed to load games:", error);
//       setError("Failed to load games.");
//     }
//   };

//   const fetchProgress = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.log("No token found in fetchProgress, redirecting to login");
//         navigate("/login");
//         return;
//       }
//       const res = await axios.get("http://localhost:5000/api/patient/progress", {
//         headers: { "x-auth-token": token },
//       });
//       console.log("Progress fetched:", res.data);
//       setProgressData(res.data);
//     } catch (error) {
//       console.error("Failed to load progress:", error);
//       setError("Failed to load progress.");
//     }
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen((prev) => !prev);
//   };

//   // Logout function: clear token and navigate to login page
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//    // Navigate to the Stories page
//    const handleLookUpStories = () => {
//     navigate("/pages/stories");
//   };

//   return (
//     <>
//       {/* Navbar */}
//       <nav className="navbar">
//         <a href="/" className="logo">
//           GameTherapy
//         </a>
//         <div className="menu">
//           <Link to="/dashboard">Home</Link>
//           <Link to="/games">Games</Link>
//           <Link to="/tasks">Tasks</Link>
//           <Link to="/pages/Ediary">e-Diary</Link>
//         </div>
//         <div className="profile-dropdown" ref={dropdownRef}>
//           {user?.profilePic ? (
//             <img
//               src={`http://localhost:5000/${user.profilePic.replace(/\\/g, "/")}`}
//               alt="Profile"
//               className="profile-pic"
//               onClick={toggleDropdown}
//             />
//           ) : (
//             <img
//               src="/default-profile.png"
//               alt="Default Profile"
//               className="profile-pic"
//               onClick={toggleDropdown}
//             />
//           )}
//           {isDropdownOpen && (
//             <div className="dropdown-menu">
//               <div className="dropdown-header">
//                 {user?.profilePic ? (
//                   <img
//                     src={`http://localhost:5000/${user.profilePic.replace(/\\/g, "/")}`}
//                     alt="Profile"
//                     className="dropdown-profile-pic"
//                   />
//                 ) : (
//                   <img
//                     src="/default-profile.png"
//                     alt="Default Profile"
//                     className="dropdown-profile-pic"
//                   />
//                 )}
//                 <div className="dropdown-user-info">
//                   <p className="dropdown-name">{user?.name || "User Name"}</p>
//                   <p className="dropdown-email">
//                     {user?.email || "user@example.com"}
//                   </p>
//                 </div>
//               </div>
//               <div className="dropdown-divider" />
//               <Link to="/pages/profile" className="dropdown-item">
//                 Profile
//               </Link>
//               <Link to="/settings" className="dropdown-item">
//                 Settings
//               </Link>
//               <div className="dropdown-divider" />
//               <button onClick={handleLogout} className="dropdown-item logout-btn">
//                 Sign out
//               </button>
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* Dashboard Container */}
//       <div className="dashboard-container">
//         <main className="main-content">
//           {error && <p className="error">{error}</p>}
//           <section className="game-section">
//             <h2>Play & Enjoy</h2>
//             {games.length > 0 ? (
//               <div className="game-grid">
//                 {games.map((game) => (
//                   <div className="game-card" key={game.id}>
//                     <img
//                       src={game.image || `/game_${game.id}.jpeg`}
//                       alt={game.title}
//                     />
//                     <h4>{game.title}</h4>
//                     <p>{game.description}</p>
//                     <button onClick={() => navigate(`/games/${game.id}`)}>
//                       Play Now
//                     </button>
//                   </div>
//                 ))}
//                 <div className="bot-card small" key="therapeutic-bot">
//                   <img
//                     src="/therapeutic_bot.png" // Placeholder, replace with your actual image
//                     alt="Therapeutic Bot"
//                     className="bot-image" // Add a class for styling
//                   />
//                   <h4>Therapeutic Bot</h4>
//                   <p>
//                     Need a listening ear? Chat with our AI-powered bot for a
//                     safe space to share your thoughts.
//                   </p>
//                   <button
//                     onClick={() =>
//                       (window.location.href =
//                         "https://96bd02286bf4975648.gradio.live/")
//                     }
//                   >
//                     Share Your Thoughts
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <p className="no-games">No games available.</p>
//             )}
//           </section>
//           <div className="chatroom-card">
//             <h2>Join the Chatroom</h2>
//             <p>Connect with others and discuss freely.</p>
//             <button onClick={() => navigate("/chatroom")}>
//               Enter Chatroom
//             </button>
//           </div>
//           <section className="progress-section">
//             <h2>Your Progress</h2>
//             {progressData.length > 0 ? (
//               <ProgressGraph progress={progressData} />
//             ) : (
//               <p>No progress recorded yet.</p>
//             )}
//           </section>
//           <section className="stories-section">
//             <button onClick={handleLookUpStories} className="stories-btn">
//               Look Up to Your Stories
//             </button>
//           </section>
//         </main>
//       </div>

//       {/* Footer */}
//       <footer className="footer">
//         © 2025 GameTherapy. All Rights Reserved.
//       </footer>
//     </>
//   );
// };

// export default PatientDashboard;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProgressGraph from "./ProgressGraph";
import "./patient-dashboard.css";

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchGames();
    fetchProgress();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/detail", {
        headers: { "x-auth-token": token },
      });
      setUser(res.data);
    } catch (error) {
      setError("Failed to load user details.");
    }
  };

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/patient/games", {
        headers: { "x-auth-token": token },
      });
      setGames(res.data.slice(0, 8)); // Show only 7 games
    } catch (error) {
      setError("Failed to load games.");
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get(
        "http://localhost:5000/api/patient/progress",
        {
          headers: { "x-auth-token": token },
        }
      );
      setProgressData(res.data);
    } catch (error) {
      setError("Failed to load progress.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">
          GameTherapy
        </a>
        <div className="menu">
          <Link to="/dashboard">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/pages/Ediary">e-Diary</Link>
        </div>
        <div className="profile-dropdown" ref={dropdownRef}>
           {user?.profilePic ? (
            <img
              src={`http://localhost:5000/${user.profilePic.replace(/\\/g, "/")}`}
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
                    src={`http://localhost:5000/${user.profilePic.replace(/\\/g, "/")}`}
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
                  <p className="dropdown-email">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/pages/profile" className="dropdown-item">
                Profile
              </Link>
              <Link to="/leaderboard" className="dropdown-item">
              Leaderboard
              </Link>
              <Link to="/settings" className="dropdown-item">
                Settings
              </Link>
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-container">
        <main className="main-content">
          {error && <p className="error">{error}</p>}

          {/* Play & Enjoy Section */}
          <section className="game-section">
            <h2>Play & Enjoy</h2>
            <div className="game-grid">
              {games.length > 0 ? (
                games.map((game) => (
                  <div className="game-card" key={game.id}>
                    <img
                      src={game.image || `/game_${game.id}.jpeg`}
                      alt={game.title}
                    />
                    <h4>{game.title}</h4>
                    <p>{game.description}</p>
                    <button onClick={() => navigate(`/games/${game.id}`)}>
                      Play Now
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-games">No games available.</p>
              )}
            </div>
          </section>

          {/* Share & Communicate Section */}
          <section className="communication-section">
            <h2>Share & Communicate</h2>
            <div className="card-grid">
              {/* Therapeutic Bot */}
              <div className="feature-card">
                <img
                  src="/therapeutic_bot.png"
                  alt="Therapeutic Bot"
                  className="card-image"
                />
                <h4>Therapeutic Bot</h4>
                <p>
                  Need a listening ear? Chat with our AI-powered bot for a safe
                  space to share your thoughts.
                </p>
                <button
                  onClick={() =>
                    (window.location.href =
                      "https://96bd02286bf4975648.gradio.live/")
                  }
                >
                  Share Your Thoughts
                </button>
              </div>

              {/* Chatroom */}
              <div className="feature-card">
                <img
                  src="/chatroom.jpg"
                  alt="Chatroom"
                  className="card-image"
                />
                <h4>Join the Chatroom</h4>
                <p>
                  Connect with others and discuss freely in our supportive
                  community.
                </p>
                <button onClick={() => navigate("/chatroom")}>
                  Enter Chatroom
                </button>
              </div>

              {/* Stories Card */}
              <div className="feature-card">
                <img
                  src="/stories.png"
                  alt="Voice Stories"
                  className="card-image"
                />
                <h4>Your Voice Stories</h4>
                <p>
                  Listen to your recorded voice entries from the e-Diary and
                  track your journey.
                </p>
                <button onClick={() => navigate("/pages/stories")}>
                  View Your Voice Entries
                </button>
              </div>
            </div>
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
