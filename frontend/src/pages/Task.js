// frontend/src/components/pages/Task.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Task.css";

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch logged-in user's details to get the id
  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(
        "https://game-theraphy-backend.onrender.com/api/auth/user",
        {
          headers: { "x-auth-token": token },
        }
      );
      setUserId(res.data._id);
    } catch (error) {
      console.error(
        "Error fetching user details:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load user details.");
    }
  };

  // Fetch tasks for the logged-in patient
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `https://game-theraphy-backend.onrender.com/api/tasks/${userId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setTasks(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error(
        "Error fetching tasks:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load tasks.");
    }
  };

  // Update task status to completed
  const handleMarkCompleted = async (taskId) => {
    try {
      const res = await axios.patch(
        `https://game-theraphy-backend.onrender.com/api/tasks/status/${taskId}`,
        { completed: true },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      // After update, re-fetch tasks
      fetchTasks();
    } catch (error) {
      console.error(
        "Error updating task status:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to update task status.");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [token]);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  return (
    <div className="task-page">
      <h2>My Tasks</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <p>
                <strong>Task:</strong> {task.taskDescription}
              </p>
              <p>
                <strong>Time:</strong> {task.startTime} - {task.endTime}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(task.taskDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {task.completed ? "Completed" : "Not Completed"}
              </p>
              {!task.completed && (
                <button onClick={() => handleMarkCompleted(task._id)}>
                  Mark as Completed
                </button>
              )}
              {task.completed && (
                <button
                  disabled
                  style={{ backgroundColor: "#4caf50", color: "#fff" }}
                >
                  Completed
                </button>
              )}
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No tasks assigned yet.</p>
      )}
      <button onClick={() => navigate("/dashboard")} className="back-btn">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Task;
