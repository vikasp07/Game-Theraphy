import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// Register chart components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const ProgressGraph = ({ progressData = [] }) => {
  // Handle empty or undefined data
  if (!Array.isArray(progressData) || progressData.length === 0) {
    return (
      <p className="text-center text-gray-500">No progress data available.</p>
    );
  }

  // Define chart data
  const data = {
    labels: progressData.map((p) =>
      p.date ? new Date(p.date).toLocaleDateString() : "Unknown Date",
    ),
    datasets: [
      {
        label: "Score",
        data: progressData.map((p) => p.score || 0),
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  return (
    <div className="w-full h-64">
      <Line data={data} />
    </div>
  );
};

export default ProgressGraph;
