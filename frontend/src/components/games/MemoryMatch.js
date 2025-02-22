import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./MemoryMatch.css";

const cardImages = [
  { name: "🍎" },
  { name: "🍌" },
  { name: "🍉" },
  { name: "🍇" },
  { name: "🍓" },
  { name: "🍍" },
];

const shuffledCards = () => {
  return [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({ ...card, id: index, matched: false }));
};

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startLevel] = useState(1);
  const [endLevel, setEndLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showPreview, setShowPreview] = useState(true);
  const timerRef = useRef(null);
  const hasStartedSession = useRef(false);

  const token = localStorage.getItem("token");

  const startNewSession = useCallback(async () => {
    try {
      const response = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/start",
        { gameId: "memory_match", gameName: "Memory Match", startLevel },
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
    setCards(shuffledCards());
    setMistakes(0);
    setTimeElapsed(0);
    setEndLevel(startLevel);
    setShowPreview(true);
    setGameStarted(false);

    if (!sessionId && !hasStartedSession.current) {
      hasStartedSession.current = true;
      startNewSession();
    }

    // Countdown Timer (5 to 0)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setShowPreview(false);
          setGameStarted(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [startNewSession, sessionId, startLevel]);

  useEffect(() => {
    if (gameStarted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first.name === second.name) {
        setMatchedCards((prev) => [...prev, first.name]);
      } else {
        setMistakes((prev) => prev + 1);
      }
      setTimeout(() => setFlippedCards([]), 800);
    }
  }, [flippedCards]);

  const sendProgressToBackend = useCallback(async () => {
    if (matchedCards.length !== cardImages.length || !sessionId) return;

    const payload = {
      sessionId,
      gameId: "memory_match",
      score: matchedCards.length,
      completed: true,
      mistakes,
      endLevel,
      totalTime: `${timeElapsed}s`,
    };

    console.log("Sending progress data:", payload);

    try {
      const response = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/progress",
        payload,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Progress saved successfully:", response.data);
    } catch (error) {
      console.error(
        "Error saving progress:",
        error.response?.data || error.message
      );
    }
  }, [matchedCards, sessionId, token, mistakes, endLevel, timeElapsed]);

  useEffect(() => {
    if (matchedCards.length === cardImages.length && !gameOver) {
      setGameOver(true);
      clearInterval(timerRef.current);
      setEndLevel((prev) => prev + 1);
      sendProgressToBackend();
    }
  }, [matchedCards, sendProgressToBackend, gameOver]);

  const handleCardClick = (card) => {
    if (
      gameStarted &&
      flippedCards.length < 2 &&
      !flippedCards.includes(card) &&
      !matchedCards.includes(card.name)
    ) {
      setFlippedCards((prev) => [...prev, card]);
    }
  };

  const restartGame = () => {
    setCards(shuffledCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setGameOver(false);
    setMistakes(0);
    setSessionId(null);
    setTimeElapsed(0);
    setCountdown(5);
    setShowPreview(true);
    setGameStarted(false);
    hasStartedSession.current = false;
    startNewSession();

    // Restart countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setShowPreview(false);
          setGameStarted(true);
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="mm-memory-container">
      <h2>Memory Match Game</h2>
      <p id="time-memory">⏳ Time: {timeElapsed}s</p>
      <p id="mistake-memory">❌ Mistakes: {mistakes}</p>
      <p id="level-memory">🏆 Level: {endLevel}</p>

      {showPreview && (
        <h1 className="countdown">{countdown > 0 ? countdown : "START!"}</h1>
      )}

      {gameOver ? (
        <>
          <h3 className="mm-game-over">🎉 You won! Play again?</h3>
          <p>⏳ Total Time: {timeElapsed}s</p>
          <p>❌ Total Mistakes: {mistakes}</p>
          <button className="mm-restart-btn" onClick={restartGame}>
            Restart Game 🔄
          </button>
        </>
      ) : (
        <div className="mm-card-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`mm-card ${
                showPreview ||
                flippedCards.includes(card) ||
                matchedCards.includes(card.name)
                  ? "mm-flipped"
                  : ""
              }`}
              onClick={() => handleCardClick(card)}
            >
              {showPreview ||
              flippedCards.includes(card) ||
              matchedCards.includes(card.name)
                ? card.name
                : "❓"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
