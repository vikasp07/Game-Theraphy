import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./PatientGames.css"; // Use updated CSS (e.g., patientgraph.css)

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

const socket = io("http://localhost:5000"); // Connect to backend WebSocket server

const PatientGames = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State variables for game progress
  const [gamesData, setGamesData] = useState([]);
  const [progressSummary, setProgressSummary] = useState({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  // State variables for tasks
  const [tasks, setTasks] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Family form states
  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyImageUrl, setFamilyImageUrl] = useState("");
  const [familyMessage, setFamilyMessage] = useState("");

  // Dropdown options for family relations
  const relationOptions = [
    "Great-Grandfather",
    "Great-Grandmother",
    "Grandfather",
    "Grandmother",
    "Father",
    "Mother",
    "Paternal Uncle",
    "Maternal Aunt",
    "Child",
    "Sibling",
    "First-Cousin",
    "Baby-Cousin",
  ];

  // Function to fetch game progress for the patient
  const fetchPatientGames = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/guardian/patient/${patientId}`,
        { headers: { "x-auth-token": token } }
      );
      setGamesData(res.data);
      setErrorMessage("");
      calculateProgressSummary(res.data);
    } catch (error) {
      console.error(
        "Error fetching patient games:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load game data for this patient.");
    }
  };

  // Function to fetch tasks for the patient
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/${patientId}`,
        { headers: { "x-auth-token": token } }
      );
      setTasks(res.data);
    } catch (error) {
      console.error(
        "Error fetching tasks:",
        error.response?.data || error.message
      );
    }
  };

  // useEffect to load patient games and tasks on component mount
  useEffect(() => {
    fetchPatientGames();
    fetchTasks();

    // Listen for real-time task notifications
    socket.on(`taskNotification-${patientId}`, (message) => {
      setNotifications((prev) => [...prev, message]);
    });

    return () => {
      socket.off(`taskNotification-${patientId}`);
    };
  }, [patientId, token]);

  // Calculate overall progress summary from gamesData
  const calculateProgressSummary = (data) => {
    if (!data || data.length === 0) {
      setProgressSummary({
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
      });
      return;
    }
    const totalGames = data.length;
    let totalScore = 0;
    let bestScore = 0;
    let totalTime = 0;
    data.forEach((game) => {
      totalScore += game.score;
      if (game.score > bestScore) bestScore = game.score;
      totalTime += parseInt(game.totalTime);
    });
    const averageScore = totalScore / totalGames;
    setProgressSummary({
      totalGames,
      totalScore,
      averageScore,
      bestScore,
      totalTime,
    });
  };

  // Format seconds into hours, minutes, seconds
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + " hrs " : ""}${mins > 0 ? mins + " min " : ""}${secs} sec`;
  };

  // Chart Data Functions
  const getLineChartData = () => ({
    labels: gamesData.map((game) =>
      new Date(game.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Scores Over Time",
        data: gamesData.map((game) => game.score),
        borderColor: "#42a5f5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: "Time Taken (seconds)",
        data: gamesData.map((game) => parseInt(game.totalTime)),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        yAxisID: "y2",
        pointRadius: 4,
      },
    ],
  });

  const getBarChartData = () => ({
    labels: gamesData.map((game) => game.gameName),
    datasets: [
      {
        label: "Total Play Time (seconds)",
        data: gamesData.map((game) => parseInt(game.totalTime)),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  });

  const getPieChartData = () => {
    const completedCount = gamesData.filter((game) => game.completed).length;
    const notCompletedCount = gamesData.length - completedCount;
    return {
      labels: ["Completed", "Not Completed"],
      datasets: [
        {
          data: [completedCount, notCompletedCount],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    };
  };

  const getDoughnutChartData = () => {
    const gameCount = {};
    gamesData.forEach((game) => {
      gameCount[game.gameName] = (gameCount[game.gameName] || 0) + 1;
    });
    return {
      labels: Object.keys(gameCount),
      datasets: [
        {
          data: Object.values(gameCount),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8BC34A",
            "#FF9800",
            "#9C27B0",
            "#00BCD4",
          ],
        },
      ],
    };
  };

  // Tasks Status Chart Data Function
  const getTasksChartData = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const remainingTasks = tasks.length - completedTasks;
    return {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          label: "Tasks Status",
          data: [completedTasks, remainingTasks],
          backgroundColor: ["#4caf50", "#f44336"],
          borderColor: ["#4caf50", "#f44336"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Handle Task Assignment
  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { taskDescription, startTime, endTime };
      const res = await axios.post(
        `http://localhost:5000/api/tasks/${patientId}`,
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      setAssignMessage(res.data.msg);
      socket.emit("newTaskAssigned", { patientId, message: res.data.msg });
      await fetchTasks();
      // Send SMS notification
      const userRes = await axios.get(
        `http://localhost:5000/api/users/${patientId}`,
        { headers: { "x-auth-token": token } }
      );
      const userMobile = userRes.data.mobile;
      const smsPayload = {
        phone: userMobile,
        message: `New task assigned: ${taskDescription} from ${startTime} to ${endTime}`,
      };
      await axios.post(
        "http://localhost:5000/api/notifications/send-sms",
        smsPayload,
        {
          headers: { "x-auth-token": token },
        }
      );
      setTaskDescription("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error(
        "Error assigning task:",
        error.response?.data || error.message
      );
      setAssignMessage("Failed to assign task.");
    }
  };

  // Handle Family Member Addition
  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: familyName,
        relation: familyRelation,
        imageUrl: familyImageUrl,
      };
      const res = await axios.post(
        `http://localhost:5000/api/family/${patientId}`,
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      setFamilyMessage(res.data.msg);
      setFamilyName("");
      setFamilyRelation("");
      setFamilyImageUrl("");
    } catch (error) {
      console.error(
        "Error adding family record:",
        error.response?.data || error.message
      );
      setFamilyMessage("Failed to add family record.");
    }
  };

  return (
    <div className="patient-games">
      <h2>Game Details for Patient</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Overall Progress Summary */}
      <section className="progress-summary">
        <h2>Overall Progress Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Games</h3>
            <p>{progressSummary.totalGames}</p>
          </div>
          <div className="summary-card">
            <h3>Total Score</h3>
            <p>{progressSummary.totalScore}</p>
          </div>
          <div className="summary-card">
            <h3>Average Score</h3>
            <p>{progressSummary.averageScore.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Best Score</h3>
            <p>{progressSummary.bestScore}</p>
          </div>
          <div className="summary-card">
            <h3>Total Time</h3>
            <p>{formatTime(progressSummary.totalTime)}</p>
          </div>
        </div>
      </section>

      {/* Game Progress Cards */}
      {gamesData.length > 0 ? (
        <div className="games-list">
          {gamesData.map((game) => (
            <div key={game.sessionId} className="game-card">
              <p>
                <strong>Game:</strong> {game.gameName}
              </p>
              <p>
                <strong>Score:</strong> {game.score}
              </p>
              <p>
                <strong>Mistakes:</strong> {game.mistakes}
              </p>
              <p>
                <strong>Total Time:</strong> {game.totalTime} seconds
              </p>
              <p>
                <strong>Levels:</strong> {game.startLevel} to {game.endLevel}
              </p>
              <p>
                <strong>Completed:</strong> {game.completed ? "Yes" : "No"}
              </p>
              <p>
                <strong>Session ID:</strong> {game.sessionId}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(game.timestamp).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No game progress data found for this patient.</p>
      )}

      <hr />

      {/* Charts Section */}
      <section className="charts-section">
        <h3>Game Progress Charts</h3>
        <div className="charts-container">
          <div className="chart-card">
            <h4>Scores Over Time</h4>
            <Line
              data={getLineChartData()}
              options={{ maintainAspectRatio: false, responsive: true }}
            />
          </div>
          <div className="chart-card">
            <h4>Total Play Time by Game</h4>
            <Bar
              data={getBarChartData()}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 },
                    title: { display: true, text: "Seconds" },
                  },
                },
              }}
            />
          </div>
          <div className="chart-card">
            <h4>Game Completion Ratio</h4>
            <Pie
              data={getPieChartData()}
              options={{ maintainAspectRatio: false, responsive: true }}
            />
          </div>
          <div className="chart-card">
            <h4>Games Played Distribution</h4>
            <Doughnut
              data={getDoughnutChartData()}
              options={{ maintainAspectRatio: false, responsive: true }}
            />
          </div>
        </div>
      </section>

      {/* Tasks Status Section (Bar Graph) */}
      <section className="tasks-status-section">
        <h3>Tasks Status</h3>
        <div className="chart-card">
          <Bar
            data={getTasksChartData()}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                datalabels: {
                  color: "#fff",
                  anchor: "end",
                  align: "top",
                  formatter: (value) => value,
                  font: { weight: "bold" },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                  title: { display: true, text: "Number of Tasks" },
                },
              },
            }}
          />
        </div>
      </section>
      <hr />

      {/* Task Assignment Section */}
      <h3>Assign a New Task</h3>
      {assignMessage && <p>{assignMessage}</p>}
      <form onSubmit={handleAssignTask} className="task-form">
        <input
          type="text"
          placeholder="Task Description (e.g., Morning Walk)"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <button type="submit">Assign Task</button>
      </form>
      <hr />

      {/* Assigned Tasks List (Card Format) */}
      <section className="tasks-list-section">
        <h3>Assigned Tasks</h3>
        <div className="tasks-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div className="task-card" key={task.id || task._id}>
                <p>
                  <strong>Description:</strong> {task.taskDescription}
                </p>
                <p>
                  <strong>Time:</strong> {task.startTime} - {task.endTime}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {task.completed ? "Completed" : "Remaining"}
                </p>
              </div>
            ))
          ) : (
            <p>No tasks assigned yet.</p>
          )}
        </div>
      </section>
      <hr />

      {/* Family Member Assignment Section */}
      <h3>Add Family Member</h3>
      {familyMessage && <p>{familyMessage}</p>}
      <form onSubmit={handleAddFamilyMember} className="family-form">
        <p>
          <strong>Patient ID:</strong> {patientId}
        </p>
        <label>
          Relation:
          <select
            value={familyRelation}
            onChange={(e) => setFamilyRelation(e.target.value)}
            required
          >
            <option value="">Select Relation</option>
            {relationOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Name:
          <input
            type="text"
            placeholder="Family Member Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            placeholder="Image URL (Optional)"
            value={familyImageUrl}
            onChange={(e) => setFamilyImageUrl(e.target.value)}
          />
        </label>
        <button type="submit">Add Family Member</button>
      </form>
    </div>
  );
};

export default PatientGames;
