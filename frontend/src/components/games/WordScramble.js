import React, { useState } from "react";
import axios from "axios";
import "./WordScramble.css";

const words = ["EXAMPLE", "REACT", "JAVASCRIPT", "COMPUTER", "DEVELOPER"];

const shuffleWord = (word) => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const WordScramble = () => {
  const [originalWord, setOriginalWord] = useState(words[0]);
  const [scrambledWord, setScrambledWord] = useState(shuffleWord(words[0]));
  const [userGuess, setUserGuess] = useState("");
  const [message, setMessage] = useState("Unscramble the word!");
  const [score, setScore] = useState(0);
  const token = localStorage.getItem("token");

  const checkAnswer = async () => {
    if (userGuess.toUpperCase() === originalWord) {
      setMessage("✅ Correct! Well done!");
      setScore(score + 1);

      // Send progress data to the backend
      try {
        await axios.post(
          "https://game-theraphy-backend.onrender.com/api/patient/progress",
          { gameId: "word_scramble", score: score + 1 },
          { headers: { "x-auth-token": token } }
        );
      } catch (error) {
        console.error("Failed to save progress", error);
      }

      setTimeout(() => {
        const newWord = words[Math.floor(Math.random() * words.length)];
        setOriginalWord(newWord);
        setScrambledWord(shuffleWord(newWord));
        setMessage("Unscramble the word!");
        setUserGuess("");
      }, 1000);
    } else {
      setMessage("❌ Incorrect! Try again.");
    }
  };

  return (
    <div className="scramble-container">
      <h2>Word Scramble Game</h2>
      <p className="score">Score: {score}</p>

      <div className="word-box">
        <h3>{scrambledWord}</h3>
      </div>

      <input
        type="text"
        value={userGuess}
        onChange={(e) => setUserGuess(e.target.value)}
        placeholder="Enter the word"
      />
      <button onClick={checkAnswer}>Submit</button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default WordScramble;
