import React from "react";

const Graphs = () => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const [leftGraph, setLeftGraph] = React.useState("solar");
  const [rightGraph, setRightGraph] = React.useState("recs");

  const graphConfig = {
    solar: {
      title: "Solar Production",
      yAxis: ["100k", "75k", "50k", "25k", "0k"],
      data: [80, 70, 85, 72, 90, 95, 88, 82, 78, 85, 90, 92],
      unit: "k",
    },
    recs: {
      title: "RECs Generated",
      yAxis: ["1000", "750", "500", "250", "0"],
      data: [800, 750, 600, 450, 300, 150, 400, 650, 700, 550, 300, 450],
      unit: "MWh",
    },
    net: {
      title: "Net Energy Exported",
      yAxis: ["1000", "750", "500", "250", "0"],
      data: [900, 800, 950, 820, 700, 600, 750, 880, 920, 850, 900, 950],
      unit: "MWh",
    },
  };

  const generateBars = (data) => {
    const maxValue = Math.max(...data);
    return months.map((month, idx) => (
      <div key={month} className="flex flex-col items-center h-36">
        <div
          className="bg-[#039994] w-4 rounded-t-md transition-all duration-300"
          style={{ 
            height: `${(data[idx] / maxValue) * 100}%`,
            minHeight: "4px"
          }}
        />
        <span className="text-xs text-gray-600 mt-1">{month}</span>
      </div>
    ));
  };

  const GraphPanel = ({ selectedGraph, setGraph }) => (
    <div className="bg-white rounded-md shadow p-4 flex-1 w-full">
      <div className="flex justify-between items-center mb-2">
        <select
          value={selectedGraph}
          onChange={(e) => setGraph(e.target.value)}
          className="text-[#039994] font-semibold bg-transparent border-none"
        >
          <option value="solar">Solar Production</option>
          <option value="recs">RECs Generated</option>
          <option value="net">Net Energy Exported</option>
        </select>
        <div className="flex items-center space-x-2">
          <select className="border rounded p-1 text-sm text-gray-600">
            <option>Yearly</option>
            <option>Monthly</option>
          </select>
          <select className="border rounded p-1 text-sm text-gray-600">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </div>
      <hr className="mb-4" />
      <div className="flex h-48">
        <div className="flex flex-col justify-between mr-2 pb-4 text-xs text-gray-600">
          {graphConfig[selectedGraph].yAxis.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="flex-1 flex items-end justify-between">
          {generateBars(graphConfig[selectedGraph].data)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex gap-4">
      <GraphPanel 
        selectedGraph={leftGraph}
        setGraph={setLeftGraph}
      />
      <GraphPanel 
        selectedGraph={rightGraph}
        setGraph={setRightGraph}
      />
    </div>
  );
};

export default Graphs;
