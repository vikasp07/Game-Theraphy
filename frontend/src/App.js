// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import MemoryMatch from "./components/games/MemoryMatch";
import MathQuiz from "./components/games/MathQuiz";
import WordScramble from "./components/games/WordScramble";
import FamilyTreeGame from "./components/games/FamilyTreeGame";
import FamilyMatch from "./components/games/FamilyMatch"; // <-- Imported FamilyMatch here
import PatientGames from "./components/PatientGames";
import GuardianDashboard from "./components/GuardianDashboard";
import Task from "./pages/Task";
import AstrayGame from "./components/games/AstrayGame"; // Astray Game
import TrafficRunGame from "./components/games/TrafficRunGame"; // Traffic Run Game
import Profile from "./pages/Profile";
import Chatroom from "./components/chatroom";
import EDiary from "./pages/Ediary";
import Stories from "./pages/Stories";
import StoryGame from "./components/games/StoryGame"; // Our Story Game component
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/games/1" element={<MemoryMatch />} />
        <Route path="/games/2" element={<MathQuiz />} />
        <Route path="/games/3" element={<WordScramble />} />
        <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
        <Route path="/games/4" element={<FamilyTreeGame />} />
        <Route path="/games/8" element={<FamilyMatch />} />  {/* New route for FamilyMatch */}
        <Route path="/patient-games/:patientId" element={<PatientGames />} />
        <Route path="/tasks" element={<Task />} />
        {/* Route for Astray Game */}
        <Route path="/games/5" element={<AstrayGame />} />
        {/* Route for Traffic Run Game */}
        <Route path="/games/6" element={<TrafficRunGame />} />
        <Route path="/pages/profile" element={<Profile />} />
        <Route path="/Chatroom" element={<Chatroom />} />
        <Route path="/pages/Ediary" element={<EDiary />} />
        <Route path="/pages/stories" element={<Stories />} />
        <Route path="/games/7" element={<StoryGame />} /> {/* Route for Story Game */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
