import axios from "axios";

const API_URL = "https://game-theraphy-backend.onrender.com/api/auth";

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (userData) => {
  return axios.post(`${API_URL}/login`, userData);
};
