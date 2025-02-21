import React from "react";

const GameCard = ({ game }) => {
  return (
    <div className="border p-4 rounded-md shadow-md bg-white">
      <h4 className="text-lg font-bold">{game.title}</h4>
      <p>{game.description}</p>
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Play Now
      </button>
    </div>
  );
};

export default GameCard;
