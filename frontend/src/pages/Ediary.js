import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ediary.css";

const EDiary = () => {
  const [title, setTitle] = useState("");
  const [voiceNote, setVoiceNote] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setVoiceNote(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !voiceNote) {
      setMessage("Title and voice note are required.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("voiceNote", voiceNote);

    try {
      const res = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/ediary",
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(res.data.msg);
      // Optionally clear form fields
      setTitle("");
      setVoiceNote(null);
    } catch (error) {
      console.error(
        "Error creating e-diary entry:",
        error.response?.data || error.message
      );
      setMessage("Failed to create e-diary entry.");
    }
  };

  return (
    <div className="ediary-container">
      <h2>e-Diary</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="ediary-form">
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Voice Note (MP3):
          <input
            type="file"
            accept="audio/mpeg, audio/mp3, audio/*"
            onChange={handleFileChange}
            required
          />
        </label>
        <button type="submit">Create Entry</button>
      </form>
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default EDiary;
