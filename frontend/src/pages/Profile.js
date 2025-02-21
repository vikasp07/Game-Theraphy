// frontend/src/pages/Profile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fields for text-based details
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");

  // For profile photo file
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  // Helper function for error logging
  const logError = (error, customMessage) => {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error(customMessage, errorDetails);
    // Optional: Send error logs to your backend logging endpoint
    // axios.post("http://localhost:5000/api/log", {
    //   message: customMessage,
    //   error: errorDetails,
    // });
  };

  // Fetch profile details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/detail", {
          headers: { "x-auth-token": token },
        });
        setProfile(res.data);
        // Pre-fill edit form values; convert null values to empty strings
        setEditName(res.data.name || "");
        setEditEmail(res.data.email || "");
        setEditAge(res.data.age != null ? res.data.age : "");
        setEditGender(res.data.gender || "");
        setEditBirthdate(
          res.data.birthdate ? res.data.birthdate.substring(0, 10) : ""
        );
      } catch (error) {
        logError(error, "Error fetching profile:");
        setErrorMessage("Failed to load profile.");
      }
    };
    fetchProfile();
  }, [token]);

  // Handle file input change for profile photo
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle update submission (includes photo upload if file selected)
  const handleUpdate = async (e) => {
    e.preventDefault();

    // If a new file is selected, upload it first
    if (selectedFile) {
      const formData = new FormData();
      formData.append("profilePic", selectedFile);
      try {
        const photoRes = await axios.post(
          "http://localhost:5000/api/detail/photo",
          formData,
          {
            headers: {
              "x-auth-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Update local profile state with new photo
        setProfile(photoRes.data.detail);
      } catch (error) {
        logError(error, "Error uploading photo:");
        setErrorMessage("Failed to update profile photo.");
        return; // Stop the update if photo upload fails
      }
    }

    // Now update the rest of the profile details
    const payload = {
      name: editName,
      email: editEmail,
      age: editAge,
      gender: editGender,
      birthdate: editBirthdate,
    };
    console.log("Updating profile with payload:", payload);
    try {
      const res = await axios.patch(
        "http://localhost:5000/api/detail",
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Update response:", res.data);
      setProfile(res.data.detail);
      setUpdateMessage(res.data.msg);
      setIsEditing(false);
      setSelectedFile(null); // Clear the file selection
    } catch (error) {
      logError(error, "Error updating profile:");
      setErrorMessage("Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      
      {profile ? (
        <div className="profile-detail">
          {profile.profilePic ? (
            <img
              src={`http://localhost:5000/${profile.profilePic.replace(/\\/g, "/")}`}
              alt="Profile"
              className="profile-photo"
            />
          ) : (
            <img
              src="/default-profile.png"
              alt="Default Profile"
              className="profile-photo"
            />
          )}
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Age:</strong> {profile.age || "Not specified"}
          </p>
          <p>
            <strong>Gender:</strong> {profile.gender || "Not specified"}
          </p>
          <p>
            <strong>Birthdate:</strong>{" "}
            {profile.birthdate
              ? new Date(profile.birthdate).toLocaleDateString()
              : "Not specified"}
          </p>
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Edit Profile
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      {/* Sliding Edit Form */}
      <div className={`edit-form-container ${isEditing ? "open" : ""}`}>
        <form onSubmit={handleUpdate} className="edit-form">
          <h3>Edit Profile</h3>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={editAge || ""}
              onChange={(e) => setEditAge(e.target.value)}
            />
          </label>
          <label>
            Gender:
            <input
              type="text"
              name="gender"
              value={editGender || ""}
              onChange={(e) => setEditGender(e.target.value)}
            />
          </label>
          <label>
            Birthdate:
            <input
              type="date"
              name="birthdate"
              value={editBirthdate || ""}
              onChange={(e) => setEditBirthdate(e.target.value)}
            />
          </label>
          <label>
            Profile Photo:
            <input
              type="file"
              name="profilePic"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
          <div className="form-buttons">
            <button type="submit">Update Profile</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
          {updateMessage && <p className="update-message">{updateMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
