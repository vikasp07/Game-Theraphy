import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h2>Welcome to User Authentication</h2>
      <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
    </div>
  );
};

export default Home;
