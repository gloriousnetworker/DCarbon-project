import React from "react";
import { Download } from "lucide-react";

export default function CommercialDetailsGraph({ facilityId }) {
  const chartData = [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 }
  ];

  const stats = {
    recGenerated: 0,
    recSold: 0,
    revenueEarned: 0,
    energyProduced: 0
  };

  const downloadData = () => {
    const headers = ['Month', 'Solar Production (MWh)', 'RECs Generated'];
    const data = chartData.map(item => [item.month, 0, 0]);
    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `facility_${facilityId}_energy_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold text-[#039994]">Energy Performance</h3>
        <button 
          onClick={downloadData}
          className="flex items-center space-x-1 bg-[#039994] text-white px-3 py-1 rounded text-sm hover:bg-[#027a75] transition-colors"
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      </div>

      <div className="flex items-end">
        <div className="flex flex-col justify-between items-end mr-4 h-64 py-2">
          {[100, 75, 50, 25, 0].map((val, idx) => (
            <span key={idx} className="text-gray-400 text-xs font-medium">{val}</span>
          ))}
        </div>
        <div className="flex-1 flex items-end justify-between h-64 px-2">
          {chartData.map((data, idx) => (
            <div key={idx} className="flex flex-col items-center relative group">
              <div className="relative w-6 h-64 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden shadow-inner">
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">0</div>
                <div className="absolute left-1 top-2 bottom-2 w-1 bg-white opacity-20 rounded-full" />
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                0 RECs
              </div>
              <p className="text-xs text-gray-600 mt-3 font-medium">{data.month}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">RECs Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recGenerated}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">RECs Sold</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recSold}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-black rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Revenue Earned</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.revenueEarned}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Energy Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.energyProduced} MWh</p>
        </div>
      </div>
    </div>
  );
}