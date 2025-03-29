import React, { useState, useEffect } from "react";

export default function Graph() {
  const [chartType, setChartType] = useState("Solar Production");
  const [selectedFacility, setSelectedFacility] = useState("All facilities");
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [heights, setHeights] = useState([]);

  // Helper to pick fill color based on chartType
  const getFillColor = () => {
    switch (chartType) {
      case "Energy Consumed":
        return "#000000"; // black
      case "RECs Created":
        return "#039994"; // teal
      default:
        return "#FBBF24"; // yellow (Solar Production)
    }
  };

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // Generate random heights only once on mount.
  useEffect(() => {
    const generatedHeights = months.map(() => Math.floor(Math.random() * 80 + 20));
    setHeights(generatedHeights);
  }, []); // empty dependency array

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Card */}
      <div className="col-span-2 bg-white rounded-md shadow p-4">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-[#039994] font-semibold bg-transparent focus:outline-none"
            >
              <option value="Solar Production">Solar Production</option>
              <option value="Energy Consumed">Energy Consumed</option>
              <option value="RECs Created">RECs Created</option>
            </select>
            <span className="text-sm text-gray-400">kWh</span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option>All facilities</option>
              <option>Facility 1</option>
              <option>Facility 2</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        <div className="flex items-end justify-between h-48">
          {months.map((month, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-gray-200 w-4 rounded-t-md overflow-hidden h-32 relative flex flex-col-reverse">
                <div
                  className="w-full"
                  style={{
                    backgroundColor: getFillColor(),
                    height: heights[index] ? `${heights[index]}%` : "0%",
                    transition: "height 0.3s ease",
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 small stat cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-md shadow p-4 flex flex-col">
          <p className="text-gray-500 text-sm">RECs Generated</p>
          <p className="text-2xl font-bold text-[#039994]">100</p>
        </div>
        <div className="bg-white rounded-md shadow p-4 flex flex-col">
          <p className="text-gray-500 text-sm">Total RECs sold</p>
          <p className="text-2xl font-bold text-[#039994]">20</p>
        </div>
        <div className="bg-white rounded-md shadow p-4 flex flex-col">
          <p className="text-gray-500 text-sm">Total Rev. Earned</p>
          <p className="text-2xl font-bold text-[#039994]">$10,000</p>
        </div>
        <div className="bg-white rounded-md shadow p-4 flex flex-col">
          <p className="text-gray-500 text-sm">Avg. price/REC</p>
          <p className="text-2xl font-bold text-[#039994]">$24</p>
        </div>
      </div>
    </div>
  );
}
