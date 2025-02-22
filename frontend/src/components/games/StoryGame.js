// src/components/games/StoryGame.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { gsap } from "gsap";
import Sortable from "sortablejs";
import "./story-game.css"; // Updated CSS

const StoryGame = () => {
  // States for levels, story scenes, session, etc.
  const [levelsData, setLevelsData] = useState(null);
  const [storyData, setStoryData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Session and score variables
  const [sessionId, setSessionId] = useState("");
  const [currentScore, setCurrentScore] = useState(100);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(30);
  const [accumulatedMistakes, setAccumulatedMistakes] = useState(0);

  // Refs for DOM elements and libraries
  const lottieContainerRef = useRef(null);
  const textAreaRef = useRef(null);
  const imageAreaRef = useRef(null);
  const cardsDivRef = useRef(null);
  const sortableInstanceRef = useRef(null);

  // Container refs
  const selectionContainerRef = useRef(null);
  const levelSelectionRef = useRef(null); // if needed later
  const storySelectionRef = useRef(null);
  const storyContainerRef = useRef(null);
  const cardContainerRef = useRef(null);
  const restartContainerRef = useRef(null);

  /* --- loadLevel Function --- */
  const loadLevel = async (level) => {
    if (!levelsData || !levelsData.levels) {
      console.error("Levels data not available.");
      return;
    }
    // End game if level exceeds available levels.
    if (level > levelsData.levels.length) {
      console.log("Game completed! You've won!");
      if (selectionContainerRef.current)
        selectionContainerRef.current.style.display = "none";
      if (storyContainerRef.current)
        storyContainerRef.current.style.display = "none";
      if (cardContainerRef.current)
        cardContainerRef.current.style.display = "none";
      if (restartContainerRef.current) {
        restartContainerRef.current.innerHTML =
          "<h2>Congratulations, you've won!</h2><button id='restart-btn'>Play Again</button>";
        restartContainerRef.current.style.display = "block";
        document.getElementById("restart-btn").onclick = handleRestart;
      }
      return;
    }
    console.log(`Loading level ${level}`);
    if (selectionContainerRef.current)
      selectionContainerRef.current.style.display = "block";
    if (storyContainerRef.current)
      storyContainerRef.current.style.display = "none";
    populateStorySelection(level);
  };

  /* --- Axios Session Functions --- */
  const startSession = async () => {
    if (sessionId) {
      console.log("Session already started:", sessionId);
      return;
    }
    console.log("Starting session for level:", selectedLevel);
    try {
      const response = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/start",
        {
          gameId: "story_game", // fixed gameId for Story Game
          gameName: "Story Game",
          startLevel: selectedLevel,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      setSessionId(response.data.sessionId);
      localStorage.setItem("storyGameSessionId", response.data.sessionId);
      console.log("New session started:", response.data.sessionId);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const updateProgressToBackend = async (completedLevel) => {
    console.log("Updating progress for level:", completedLevel);
    try {
      const totalTime = accumulatedTime + timeElapsed;
      const totalMistakes = accumulatedMistakes + mistakes;
      const payload = {
        sessionId,
        gameId: "story_game",
        score: currentScore,
        completed: true,
        mistakes: totalMistakes,
        endLevel: completedLevel,
        totalTime: `${totalTime}s`,
      };
      console.log("Posting progress data:", payload);
      const response = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/games/progress",
        payload,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Progress updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  /* --- Utility: Shuffle Function --- */
  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    console.log("Shuffled array:", array);
    return array;
  };

  /* --- Display Scene --- */
  const displayScene = (index) => {
    console.log(
      `Displaying scene ${index + 1} of ${storyData.length}.`,
      storyData
    );
    if (!storyData || storyData.length === 0) {
      console.error("storyData is empty. Cannot display scene.");
      return;
    }
    const scene = storyData[index];
    if (!scene) {
      console.warn("Scene not found at index:", index);
      return;
    }
    // Ensure the story container is visible
    if (storyContainerRef.current) {
      storyContainerRef.current.style.display = "block";
      storyContainerRef.current.style.opacity = "1";
    }
    const tl = gsap.timeline({
      onComplete: () => {
        console.log("Transition complete for scene:", index + 1);
      },
    });
    tl.to(
      [textAreaRef.current, imageAreaRef.current, lottieContainerRef.current],
      {
        duration: 0.5,
        opacity: 0,
        ease: "power2.inOut",
      }
    )
      .add(() => {
        if (textAreaRef.current) textAreaRef.current.innerText = scene.text;
        if (imageAreaRef.current) {
          // If the scene.image is an inline SVG, insert it directly.
          // Otherwise, assume it is a path and create an <img> tag.
          if (scene.image.trim().startsWith("<svg")) {
            imageAreaRef.current.innerHTML = scene.image;
          } else {
            imageAreaRef.current.innerHTML = `<img src="${process.env.PUBLIC_URL}${scene.image}" alt="${scene.caption}" />`;
          }
        }
      })
      .to(
        [textAreaRef.current, imageAreaRef.current, lottieContainerRef.current],
        {
          duration: 0.5,
          opacity: 1,
          ease: "power2.inOut",
        }
      );
  };

  /* --- Card Puzzle --- */
  const initCardPuzzle = () => {
    console.log("Initializing card puzzle.");
    if (!cardsDivRef.current) return;
    // Destroy previous Sortable instance if it exists
    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }
    cardsDivRef.current.innerHTML = "";
    const generatedIncidents = storyData.map((scene, index) => ({
      id: index + 1,
      caption: scene.caption,
      image: scene.image,
    }));
    const shuffled = shuffle([...generatedIncidents]);
    shuffled.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-id", item.id);
      const previewHTML = item.image
        .replace(/width="300"/, 'width="80"')
        .replace(/height="200"/, 'height="60"');
      card.innerHTML = `<div class="preview">${previewHTML}</div>
                        <div class="caption">${item.caption}</div>`;
      cardsDivRef.current.appendChild(card);
    });
    // Removed blue border styling
    if (cardContainerRef.current) {
      cardContainerRef.current.style.display = "block";
      cardContainerRef.current.style.opacity = "1";
    }
    sortableInstanceRef.current = Sortable.create(cardsDivRef.current, {
      animation: 150,
    });
    console.log("Card puzzle initialized.");
  };

  /* --- Button Handlers --- */
  const handleNextScene = async () => {
    console.log("Next scene button clicked.");
    if (currentScene < storyData.length - 1) {
      setCurrentScene((prev) => {
        const newScene = prev + 1;
        displayScene(newScene);
        return newScene;
      });
    } else {
      console.log("All scenes displayed. Transitioning to card puzzle.");
      gsap.to(storyContainerRef.current, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
          storyContainerRef.current.style.display = "none";
          initCardPuzzle();
          cardContainerRef.current.style.display = "block";
          gsap.from(cardContainerRef.current, { duration: 0.5, opacity: 0 });
          setTimer(0);
          setPuzzleStarted(true);
        },
      });
    }
  };

  const handleBackScene = () => {
    console.log("Back scene button clicked.");
    if (currentScene > 0) {
      setCurrentScene((prev) => {
        const newScene = prev - 1;
        displayScene(newScene);
        return newScene;
      });
    } else {
      console.log("Already at the first scene. Cannot go back further.");
    }
  };

  // Dummy handler for Toggle Voice (audio disabled)
  const handleToggleVoice = () => {
    console.log("Toggle voice button clicked. Audio is disabled.");
  };

  const handleCheckOrder = async () => {
    console.log("Checking order of puzzle cards.");
    const cards = Array.from(cardsDivRef.current.children);
    const currentOrder = cards.map((card) =>
      parseInt(card.getAttribute("data-id"))
    );
    const correctOrder = storyData.map((scene, index) => index + 1);
    console.log(
      "Current order:",
      currentOrder,
      "Expected order:",
      correctOrder
    );
    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
      console.log("Puzzle solved correctly!");
      await updateProgressToBackend(selectedLevel);
      gsap.to(cardContainerRef.current, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
          cardContainerRef.current.style.display = "none";
          // Advance to next level or show win message.
          setSelectedLevel((prevLevel) => {
            const nextLevel = prevLevel + 1;
            if (levelsData && nextLevel <= levelsData.levels.length) {
              // Reset state for new level
              setStoryData([]);
              setCurrentScene(0);
              setTimer(0);
              setPuzzleStarted(false);
              setMistakes(0);
              setSelectedStory(null);
              if (selectionContainerRef.current) {
                selectionContainerRef.current.style.display = "block";
              }
              loadLevel(nextLevel);
            } else {
              console.log("Game completed! You've won!");
              if (restartContainerRef.current) {
                restartContainerRef.current.innerHTML =
                  "<h2>Congratulations, you've won!</h2><button id='restart-btn'>Play Again</button>";
                restartContainerRef.current.style.display = "block";
                if (selectionContainerRef.current)
                  selectionContainerRef.current.style.display = "none";
                if (storyContainerRef.current)
                  storyContainerRef.current.style.display = "none";
                if (cardContainerRef.current)
                  cardContainerRef.current.style.display = "none";
                document.getElementById("restart-btn").onclick = handleRestart;
              }
            }
            return nextLevel;
          });
        },
      });
    } else {
      console.warn("Puzzle order incorrect.");
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      alert(`The order is not correct. Total mistakes: ${newMistakes}`);
    }
  };

  const handleRestart = () => {
    console.log("Restarting game to level 1.");
    localStorage.removeItem("storyGameSessionId");
    setSessionId("");
    if (restartContainerRef.current) {
      restartContainerRef.current.style.display = "none";
      restartContainerRef.current.innerHTML = "";
    }
    setSelectedStory(null);
    setStoryData([]);
    setCurrentScene(0);
    setTimer(0);
    setPuzzleStarted(false);
    setMistakes(0);
    setSelectedLevel(1);
    loadLevel(1);
  };

  // Start game by displaying scene 1
  const handleGameStart = () => {
    console.log(
      "handleGameStart called. Attempting to display scene 1 for level",
      selectedLevel
    );
    try {
      setCurrentScene(0);
      displayScene(0);
      console.log("Scene 1 displayed successfully.");
    } catch (error) {
      console.error("Error in handleGameStart:", error);
    }
  };

  /* --- Timer Effect for Puzzle Stage --- */
  useEffect(() => {
    let timerInterval;
    if (puzzleStarted) {
      timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [puzzleStarted]);

  /* --- Populate Story Selection --- */
  const populateStorySelection = (level) => {
    if (!levelsData || !levelsData.levels) {
      console.error("Levels data is not available in populateStorySelection.");
      return;
    }
    console.log("Populating story selection for level:", level);
    const levelObj = levelsData.levels.find((l) => l.level === level);
    if (!levelObj) {
      console.warn("Level object not found for level:", level);
      return;
    }
    if (storySelectionRef.current) {
      storySelectionRef.current.innerHTML = "";
      levelObj.stories.forEach((story, index) => {
        const card = document.createElement("div");
        card.className = "selection-card";
        card.setAttribute("data-story-index", index);
        card.innerHTML = `<h3>${story.title}</h3>`;
        card.addEventListener("click", async () => {
          console.log("Selected story:", story.title);
          setSelectedStory(story);
          const fullStory = await fetchStoryDetails(level, index);
          if (fullStory) {
            setStoryData(fullStory.scenes);
            console.log("Full story data set:", fullStory.scenes);
          } else {
            console.error("Failed to fetch full story details.");
          }
          if (selectionContainerRef.current) {
            selectionContainerRef.current.style.display = "none";
          }
          if (storyContainerRef.current) {
            storyContainerRef.current.style.display = "block";
          }
          await startSession();
          // The useEffect watching storyData will trigger displayScene(0)
        });
        storySelectionRef.current.appendChild(card);
      });
      if (storySelectionRef.current.parentElement) {
        storySelectionRef.current.parentElement.style.display = "block";
      }
    }
  };

  /* --- Fetch Full Story Data on Selection --- */
  const fetchStoryDetails = async (level, storyIndex) => {
    try {
      console.log(
        `Fetching story details for level ${level}, story index ${storyIndex}`
      );
      const response = await fetch("/story-game/stories.json");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const levelObj = data.levels.find((l) => l.level === level);
      if (!levelObj) {
        throw new Error(`Level ${level} not found`);
      }
      const storyObj = levelObj.stories[storyIndex];
      if (!storyObj) {
        throw new Error(
          `Story at index ${storyIndex} not found for level ${level}`
        );
      }
      console.log("Fetched story details:", storyObj);
      return storyObj;
    } catch (error) {
      console.error("Error fetching story details:", error);
      return null;
    }
  };

  /* --- Load stories.json --- */
  useEffect(() => {
    console.log("Fetching stories.json file...");
    fetch("/story-game/stories.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("stories.json loaded:", data);
        setLevelsData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading stories.json:", error);
        setLoading(false);
      });
  }, []);

  // When levelsData is available, load the current level's story selection.
  useEffect(() => {
    if (levelsData && levelsData.levels) {
      loadLevel(selectedLevel);
    }
  }, [levelsData, selectedLevel]);

  // When storyData is updated, display scene 1.
  useEffect(() => {
    if (storyData && storyData.length > 0) {
      console.log("storyData updated, now displaying scene 1:", storyData);
      setCurrentScene(0);
      displayScene(0);
    }
  }, [storyData]);

  return (
    <div id="game-container">
      {loading && <div id="loading-overlay">Loading Graphics...</div>}

      {/* Level & Story Selection Screen */}
      <div id="selection-container" ref={selectionContainerRef}>
        <div id="level-info">
          <h2>Level {selectedLevel}</h2>
        </div>
        <div id="story-selection">
          <h2>Select a Story</h2>
          <div className="selection-cards" ref={storySelectionRef}></div>
        </div>
      </div>

      {/* Story Section */}
      <div
        id="story-container"
        ref={storyContainerRef}
        style={{ display: "none" }}
      >
        <div id="text-area" ref={textAreaRef}></div>
        <div id="image-area" ref={imageAreaRef}></div>
        <div className="btn-group-story">
          <button id="back-story" onClick={handleBackScene}>
            Back Scene
          </button>
          <button id="next-story" onClick={handleNextScene}>
            Next Scene
          </button>
          <button id="toggle-voice" onClick={handleToggleVoice}>
            Toggle Voice
          </button>
        </div>
        <div id="progress">
          Scene {currentScene + 1} of {storyData.length}
        </div>
      </div>

      {/* Card Puzzle Section */}
      <div
        id="card-container"
        ref={cardContainerRef}
        style={{ display: "none" }}
      >
        <h3>Arrange the scenes in the correct order:</h3>
        <div id="cards" ref={cardsDivRef}></div>
        <button onClick={handleCheckOrder}>Check Order</button>
        <div id="puzzle-progress">
          Time: {timer}s | Mistakes: {mistakes}
        </div>
      </div>

      {/* Restart Container */}
      <div
        id="restart-container"
        ref={restartContainerRef}
        style={{ display: "none" }}
      >
        <button onClick={handleRestart}>Play Another Story</button>
      </div>
    </div>
  );
};

export default StoryGame;
