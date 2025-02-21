const TrafficRunGame = () => {
  return (
    <div className="game-container">
      <iframe
        src="/traffic-run-game/dist/index.html"
        width="100%"
        height="600px"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default TrafficRunGame;
