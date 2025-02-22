// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://game-theraphy-backend.onrender.com");

// const Chatroom = () => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     fetchUserData();

//     const handleMessage = (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     };

//     socket.on("receiveMessage", handleMessage);

//     return () => {
//       socket.off("receiveMessage", handleMessage); // Cleanup on unmount
//     };
//   }, []);

//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("https://game-theraphy-backend.onrender.com/api/auth/user", {
//         headers: { "x-auth-token": token },
//       });
//       setUser(res.data);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

// const sendMessage = () => {
//   if (message.trim() && user) {
//     const mentions = message.match(/@\w+/g) || []; // Extract mentions (@username)
//     const msgData = { sender: user.name, message, mentions };

//     socket.emit("sendMessage", msgData); // Send to server
//     setMessage(""); // Clear input field
//   }
// };

//   return (
//     <div>
//       <h2>Chatroom</h2>
//       <div className="chat-box">
//         {messages.map((msg, index) => (
//           <div key={index}>
//             <strong>{msg.sender}</strong>: {msg.message}
//             <strong>{msg.sender}</strong>:{" "}
//             {msg.message.split(" ").map((word, i) =>
//               word.startsWith("@") ? (
//                 <span key={i} className="mention">
//                   {word}
//                 </span>
//               ) : (
//                 word + " "
//               )
//             )}
//           </div>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type a message..."
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// };

// export default Chatroom;

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://game-theraphy-backend.onrender.com");

const Chatroom = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit("register", user.name);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://game-theraphy-backend.onrender.com/api/auth/user",
        {
          headers: { "x-auth-token": token },
        }
      );
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = { sender: user.name, message };
    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  return (
    <div>
      <h2>Chatroom</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatroom;
