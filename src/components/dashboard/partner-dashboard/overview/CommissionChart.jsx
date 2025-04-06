import React, { useEffect, useState } from "react";

export default function CommissionChart() {
  const [points, setPoints] = useState([]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    // Generate random data for each month
    const generated = months.map(() => Math.floor(Math.random() * 70 + 30));
    setPoints(generated);
  }, []);

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-[#039994] text-lg font-semibold mb-2">Commission</h3>
      {/* Very basic line chart using an SVG (for illustration) */}
      <div className="relative w-full h-56">
        {/* Chart axes or background can be more elaborate if desired */}
        <svg viewBox="0 0 500 200" className="w-full h-full">
          {/* Horizontal lines for reference */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={(200 / 5) * i}
              x2="500"
              y2={(200 / 5) * i}
              stroke="#eee"
              strokeWidth="1"
            />
          ))}
          {/* Path for the line chart */}
          <path
            d={generatePath(points, 500, 200)}
            fill="none"
            stroke="#039994"
            strokeWidth="2"
          />
          {/* Plot each point */}
          {points.map((p, i) => {
            const x = (i / (points.length - 1)) * 500;
            const y = 200 - (p / 100) * 200; // scale 0–100 to 0–200
            return (
              <circle key={i} cx={x} cy={y} r={3} fill="#039994" />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {months.map((m, idx) => (
          <span key={idx}>{m}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Utility to convert array of numeric values into a smooth path for an <svg> <path />
 * This is just a simplistic approach. You can swap in any chart library (Recharts, Chart.js, etc.)
 */
function generatePath(data, width, height) {
  if (!data || data.length === 0) return "";
  const maxValue = 100; // we scaled random to 0–100
  const stepX = width / (data.length - 1);

  let d = "";
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = height - (val / maxValue) * height;
    d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
  });
  return d;
}
