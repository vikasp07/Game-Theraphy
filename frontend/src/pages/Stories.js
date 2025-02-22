// frontend/src/pages/Stories.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Stories.css";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(
          "https://game-theraphy-backend.onrender.com/api/ediary",
          {
            headers: { "x-auth-token": token },
          }
        );
        console.log("Fetched stories:", res.data);
        setStories(res.data);
      } catch (err) {
        console.error("Error fetching stories:", err);
        if (err.response) {
          console.error("Error response data:", err.response.data);
        }
        setError("Failed to load stories.");
      }
    };
    fetchStories();
  }, [token]);

  const handleAudioError = (e, storyId) => {
    const audioElement = e.target;
    console.error(`Error playing audio for story ${storyId}:`, e);
    console.error("Audio source URL:", audioElement.src);
  };
  return (
    <div className="stories-container">
      <h2>Your Stories</h2>
      {error && <p className="error-message">{error}</p>}
      {stories.length > 0 ? (
        <div className="stories-grid">
          {stories.map((story) => {
            // Construct and encode the file URL
            const fileURL = encodeURI(
              `https://game-theraphy-backend.onrender.com/${story.voiceNote.replace(/\\/g, "/")}`
            );
            return (
              <div key={story._id} className="story-card">
                <h3>{story.title}</h3>
                <audio controls onError={(e) => handleAudioError(e, story._id)}>
                  <source src={fileURL} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="timestamp">
                  {new Date(story.timestamp).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No stories found.</p>
      )}
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default Stories;
