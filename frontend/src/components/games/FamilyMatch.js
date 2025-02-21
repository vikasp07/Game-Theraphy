import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FamilyMatch.css";

const FamilyMatchGame = () => {
  const navigate = useNavigate();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [familyData, setFamilyData] = useState([]);
  const [targetIndex, setTargetIndex] = useState(0); // index of the target family member (photo card)
  const [targetFamilyMember, setTargetFamilyMember] = useState(null);
  const [candidates, setCandidates] = useState([]); // array of 5 candidate objects for the left card
  const [candidateIndex, setCandidateIndex] = useState(0); // which candidate is currently shown
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [answerResult, setAnswerResult] = useState(null); // "Correct!" or "Wrong!" or null

  // State for serial port connection
  const [serialPort, setSerialPort] = useState(null);

  // Countdown timer state (in seconds)
  const [countdown, setCountdown] = useState(5);
  const countdownIntervalRef = useRef(null);

  // Fetch family data (each member should have at least a "name" property)
  const fetchFamilyData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }
      const decodeToken = (token) => {
        try {
          return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          return null;
        }
      };
      const decoded = decodeToken(token);
      const patientIdFromToken = decoded ? decoded.id : null;
      const patientId =
        patientIdFromToken || localStorage.getItem("patientId") || "67adc06b470800e14d60b80";
      const response = await axios.get(`http://localhost:5000/api/family/${patientId}`, {
        headers: { "x-auth-token": token },
      });
      const data = Array.isArray(response.data) ? response.data : [response.data];
      // Process each member so that if imageUrl is provided, it fetches the image from the backend;
      // otherwise, it uses a placeholder image.
      const processedData = data.map((member) => ({
        ...member,
        photo: member.imageUrl
          ? `http://localhost:5000/uploads/family/${member.imageUrl}`
          : "https://via.placeholder.com/150"
      }));
      setFamilyData(processedData);
      // Note: We wait for the user to click "Start Game" before starting.
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  // Generate a candidate pool of 5 names for the current round.
  // The pool includes the target's name and 4 randomly chosen distractors.
  const generateCandidatePool = (targetMember, data) => {
    let pool = [targetMember];
    const others = data.filter((member) => member.name !== targetMember.name);
    const shuffled = others.sort(() => Math.random() - 0.5);
    pool = pool.concat(shuffled.slice(0, 4));
    pool.sort(() => Math.random() - 0.5);
    setCandidates(pool);
    setCandidateIndex(0);
    setCountdown(5); // reset countdown for the new candidate pool
  };

  // Countdown timer that ticks every second.
  // When the countdown reaches 0, it toggles the candidate and resets the countdown.
  useEffect(() => {
    if (!gameStarted) return; // only run during the game
    if (candidates.length === 0 || gameOver) return;

    // Clear any existing timer before starting a new one.
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          setCandidateIndex((prevIndex) => (prevIndex + 1) % candidates.length);
          return 5;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(countdownIntervalRef.current);
  }, [candidates, gameOver, gameStarted]);

  // Start the game when the user clicks "Start Game" (or via key press)
  const handleStartGame = () => {
    if (familyData.length > 0) {
      setTargetIndex(0);
      setTargetFamilyMember(familyData[0]);
      generateCandidatePool(familyData[0], familyData);
      setGameStarted(true);
    }
  };

  // Move to the next round (next target).
  const moveToNextRound = () => {
    setAnswerResult(null);
    if (targetIndex < familyData.length - 1) {
      const nextTargetIndex = targetIndex + 1;
      setTargetIndex(nextTargetIndex);
      const nextTarget = familyData[nextTargetIndex];
      setTargetFamilyMember(nextTarget);
      generateCandidatePool(nextTarget, familyData);
    } else {
      setGameOver(true);
      console.log(`Game Over! Final Score: ${score}, Mistakes: ${mistakes}`);
    }
  };

  // Handler for the Next button click.
  const handleNext = () => {
    moveToNextRound();
  };

  // Global keyboard events:
  // - Before the game starts: pressing Right Arrow or Enter starts the game.
  // - During the game:
  //    • If no answer has been given, pressing Right Arrow checks the candidate.
  //    • If an answer is shown, pressing Right Arrow or Enter moves to the next round.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          handleStartGame();
        }
        return;
      }
      if (answerResult !== null) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          handleNext();
        }
        return;
      }
      if (
        e.key === "ArrowRight" &&
        !gameOver &&
        targetFamilyMember &&
        candidates.length > 0
      ) {
        const currentCandidate = candidates[candidateIndex];
        if (currentCandidate.name === targetFamilyMember.name) {
          setScore((prevScore) => prevScore + 1);
          console.log("Correct!");
          setAnswerResult("Correct!");
        } else {
          setMistakes((prev) => prev + 1);
          console.log("Wrong!");
          setAnswerResult("Wrong!");
        }
        // Stop the countdown timer so candidates don't continue toggling.
        clearInterval(countdownIntervalRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, answerResult, candidateIndex, targetFamilyMember, candidates, gameOver]);

  // Initialize serial port connection and listen for incoming data.
  const initSerial = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API not supported in this browser.");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialPort(port);
      const reader = port.readable.getReader();
      console.log("Serial port connected.");
      const textDecoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Serial port reader done.");
          break;
        }
        if (value) {
          buffer += textDecoder.decode(value, { stream: true });
          if (buffer.includes("\n")) {
            const lines = buffer.split("\n");
            buffer = lines.pop();
            lines.forEach((line) => {
              const trimmed = line.trim();
              console.log("Received from COM port (string):", trimmed);
              // If the trimmed message is "0", simulate a Right Arrow key press.
              if (trimmed === "0") {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
                );
              }
            });
          }
        }
      }
      reader.releaseLock();
    } catch (error) {
      console.error("Error connecting to serial port:", error);
    }
  };

  // Calculate the degree of progress for the loader border.
  // When countdown = 5, progress = 0deg; when countdown = 0, progress = 360deg.
  const progressDeg = ((5 - countdown) / 5) * 360;

  // --- Pre-game Preview Screen ---
  if (!gameStarted) {
    return (
      <div className="family-match-game-container">
        <h1>Family Match Game - Preview</h1>
        <div className="preview-container">
          {familyData.map((member) => (
            <div key={member._id || member.name} className="preview-card">
              <img src={member.photo} alt={member.name} />
              <p>{member.name}</p>
            </div>
          ))}
        </div>
        <button onClick={handleStartGame} disabled={familyData.length === 0}>
          Start Game
        </button>
        {(!serialPort && "serial" in navigator) && (
          <button onClick={initSerial}>Connect COM Port</button>
        )}
        <button onClick={() => navigate("/dashboard")}>Exit</button>
      </div>
    );
  }

  // --- Main Game Screen ---
  return (
    <div className="family-match-game-container">
      <h1>Family Match Game</h1>
      <div className="cards-container">
        <div
          className="name-card"
          style={{ "--progress": `${progressDeg}deg` }}
        >
          <h2>{candidates[candidateIndex]?.name || "Loading..."}</h2>
          <div className="stopwatch">{countdown}</div>
          <p>
            Toggle through 5 names until one matches the photo. Then press the
            Right Arrow key.
          </p>
        </div>
        <div className="photo-card">
          {targetFamilyMember ? (
            <img
              src={targetFamilyMember.photo}
              alt={targetFamilyMember.name}
            />
          ) : (
            <p>Loading photo...</p>
          )}
        </div>
      </div>
      <div className="stats">
        <p>Score: {score}</p>
        <p>Mistakes: {mistakes}</p>
      </div>

      {answerResult && (
        <div className="result-message">
          <h2>{answerResult}</h2>
          {!gameOver && (
            <button onClick={handleNext}>Next</button>
          )}
        </div>
      )}

      {(!serialPort && "serial" in navigator) && (
        <button onClick={initSerial}>Connect COM Port</button>
      )}
      {gameOver && (
        <>
          <p>Game Over! Final Score: {score}, Mistakes: {mistakes}</p>
          <button onClick={() => window.location.reload()}>Restart Game</button>
        </>
      )}
      <button onClick={() => navigate("/dashboard")}>Exit</button>
    </div>
  );
};

export default FamilyMatchGame;
