import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MathQuiz.css";

const MathQuiz = () => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [startLevel] = useState(1);
  const [endLevel, setEndLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const hasStartedSession = useRef(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Generate a random math question
  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ["+", "-", "*"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    setQuestion({ num1, num2, operation });
  };

  // Start a new game session
  const startNewSession = useCallback(async () => {
    try {
      const response = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/start",
        { gameId: "math_quiz", gameName: "Math Quiz", startLevel },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      setSessionId(response.data.sessionId);
      console.log("New session started:", response.data.sessionId);
    } catch (error) {
      console.error(
        "Error starting session:",
        error.response?.data || error.message
      );
    }
  }, [token, startLevel]);

  useEffect(() => {
    generateQuestion();
    setMistakes(0);
    setTimeElapsed(0);
    setEndLevel(startLevel);

    if (!sessionId && !hasStartedSession.current) {
      hasStartedSession.current = true;
      startNewSession();
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [startNewSession, sessionId, startLevel]);

  // Check answer and update score and mistakes.
  // If the updated score reaches 10, end the game.
  const checkAnswer = () => {
    if (!question) return;

    const correctAnswer = eval(
      `${question.num1} ${question.operation} ${question.num2}`
    );
    let updatedScore = score;

    if (parseInt(answer, 10) === correctAnswer) {
      updatedScore = score + 1;
      setScore(updatedScore);
      generateQuestion();
      setAnswer("");
    } else {
      setMistakes((prev) => prev + 1);
    }

    if (updatedScore >= 10) {
      setGameOver(true);
      clearInterval(timerRef.current);
    }
  };

  // Send progress to backend
  const sendProgressToBackend = async (redirect = false) => {
    if (!sessionId) return;

    const payload = {
      sessionId,
      gameId: "math_quiz",
      score,
      completed: gameOver,
      mistakes,
      endLevel,
      totalTime: `${timeElapsed}s`,
    };

    console.log("Sending progress data:", payload);

    try {
      await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/progress",
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Progress saved successfully.");
    } catch (error) {
      console.error(
        "Error saving progress:",
        error.response?.data || error.message
      );
    }

    if (redirect) {
      navigate("/dashboard"); // Redirect to dashboard after saving progress
    }
  };

  // Automatically send progress when the game is over (win condition)
  useEffect(() => {
    if (gameOver && sessionId) {
      sendProgressToBackend(false);
    }
  }, [gameOver, sessionId]); // runs when gameOver becomes true

  // Close game manually and send progress
  const closeGame = () => {
    clearInterval(timerRef.current);
    sendProgressToBackend(true); // Save progress and redirect to dashboard
  };

  return (
    <div className="math-quiz-container">
      <h2>Math Quiz Game</h2>
      <p>⏳ Time: {timeElapsed}s</p>
      <p>❌ Mistakes: {mistakes}</p>
      <p>🏆 Level: {endLevel}</p>

      {gameOver ? (
        <>
          <h3 className="game-over">🎉 You won! Play again?</h3>
          <p>⏳ Total Time: {timeElapsed}s</p>
          <p>❌ Total Mistakes: {mistakes}</p>
          <button
            className="restart-btn"
            onClick={() => window.location.reload()}
          >
            Restart Game 🔄
          </button>
        </>
      ) : (
        <>
          <p className="question">
            {question &&
              `${question.num1} ${question.operation} ${question.num2} = ?`}
          </p>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
          />
          <button onClick={checkAnswer}>Submit</button>
          <button className="close-btn" onClick={closeGame}>
            Go Back 🔙
          </button>
        </>
      )}
    </div>
  );
};

export default MathQuiz;
