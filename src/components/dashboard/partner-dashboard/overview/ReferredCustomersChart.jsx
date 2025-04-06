import React, { useEffect, useState } from "react";

/**
 * Colors for each "segment" of the test tube bar
 *  1) #056C69
 *  2) #00B4AE
 *  3) #FFB200
 *  4) #1E1E1E
 *  5) #FF0000
 */
const segmentColors = ["#056C69", "#00B4AE", "#FFB200", "#1E1E1E", "#FF0000"];

export default function ReferredCustomersChart() {
  const [data, setData] = useState([]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Each month has 5 segments with random values
  useEffect(() => {
    const generatedData = months.map(() => {
      return segmentColors.map(() => Math.floor(Math.random() * 30 + 10));
    });
    setData(generatedData);
  }, []);

  // For stacking, we need total
  const getTotal = (segments) => segments.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-[#056C69] text-lg font-semibold mb-2">
        Referred Customers
      </h3>
      <div className="flex items-end justify-between h-56">
        {data.map((segments, monthIndex) => {
          const totalHeight = getTotal(segments);

          return (
            <div key={monthIndex} className="flex flex-col items-center">
              {/* Outer container simulating the “test tube” */}
              <div className="relative w-6 h-40 bg-gray-200 rounded-t-full overflow-hidden flex flex-col-reverse">
                {segments.map((value, i) => {
                  const heightPercent = (value / totalHeight) * 100 || 0;
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: segmentColors[i],
                        height: `${heightPercent}%`,
                      }}
                      className="w-full transition-all duration-300"
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">{months[monthIndex]}</p>
            </div>
          );
        })}
      </div>
      {/* Legend (optional) */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#056C69" }}
          />
          <span>Segment A</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#00B4AE" }}
          />
          <span>Segment B</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#FFB200" }}
          />
          <span>Segment C</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#1E1E1E" }}
          />
          <span>Segment D</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#FF0000" }}
          />
          <span>Segment E</span>
        </div>
      </div>
    </div>
  );
}
