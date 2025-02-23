// login.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "unregistered") {
      setErrorMessage("Google login is only allowed for registered users.");
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://game-theraphy-backend.onrender.com/api/auth/login",
        user
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role); // Store user role

      alert("✅ Login successful!");

      // Redirect user based on role
      if (res.data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (res.data.user.role === "player") {
        navigate("/dashboard");
      } else if (res.data.user.role === "guardian") {
        navigate("/guardian-dashboard");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "❌ Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://game-theraphy-backend.onrender.com/api/auth/google";
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      <hr />

      <button
        onClick={handleGoogleLogin}
        style={{ backgroundColor: "#db4437", color: "white" }}
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
