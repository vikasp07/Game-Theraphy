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
      // Save token and role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      alert("✅ Login successful!");

      // Record login time by calling the visit login endpoint
      await axios.post(
        "https://game-theraphy-backend.onrender.com/api/visit/login",
        {},
        { headers: { "x-auth-token": res.data.token } }
      );

      // Redirect based on user role
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
    window.location.href = "https://game-theraphy-backend.onrender.com/api/auth/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Login</h2>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <hr className="my-4" />
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
