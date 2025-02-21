import React, { useEffect, useRef } from "react";
import axios from "axios";

const AstrayGame = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Optionally check event.origin for security.
      if (event.data) {
        if (event.data.type === "sessionStarted") {
          console.log("Session started from game:", event.data.sessionId);
          localStorage.setItem("astraySessionId", event.data.sessionId);
        }
        if (event.data.type === "progressUpdate") {
          console.log(
            "Received progress update from game:",
            event.data.progress
          );
          axios
            .post(
              "http://localhost:5000/api/games/progress",
              event.data.progress,
              {
                headers: {
                  "x-auth-token": localStorage.getItem("token"),
                  "Content-Type": "application/json",
                },
              }
            )
            .then((response) => {
              console.log("Progress updated on backend:", response.data);
            })
            .catch((error) => {
              console.error("Error updating progress on backend:", error);
            });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/astray/index.html" // Adjust the path if necessary.
        title="Astray Game"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          objectFit: "contain", // Maintains the game's aspect ratio
          filter: "brightness(1.2)",
        }}
      ></iframe>
    </div>
  );
};

export default AstrayGame;
