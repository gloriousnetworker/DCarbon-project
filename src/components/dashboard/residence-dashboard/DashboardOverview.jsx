import React from "react";
import {
  FaSun,
  FaUserPlus,
  FaMoneyCheckAlt,
  FaFileUpload,
  FaHome,
  FaBolt,
  FaLeaf,
} from "react-icons/fa";

/**
 * DashboardOverviewResidence
 * A sample "Residence Overview" dashboard layout
 * featuring 5 Quick Action cards, 2 bar-chart sections,
 * and smaller stat cards on the right.
 */
const DashboardOverviewResidence = () => {
  return (
    <div className="w-full space-y-8">
      {/* Quick Action heading */}
      <h2 className="text-xl font-semibold text-[#039994]">Quick Action</h2>

      {/* Five Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1: Apply for DCarbon Solar Target Program */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
        >
          <FaSun size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Apply for DCarbon Solar Target Program</p>
        </div>

        {/* 2: Refer a Business Partner */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #58595B 100%)",
          }}
        >
          <FaUserPlus size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Refer a Business Partner</p>
        </div>

        {/* 3: Request Payment */}
        <div
          className="p-4 rounded-md flex flex-col items-center text-gray-700"
          style={{
            background:
              "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
        >
          <FaMoneyCheckAlt size={24} className="mb-2 text-[#039994]" />
          <hr className="border-gray-300 w-full mb-2" />
          <p className="text-center text-sm">Request Payment</p>
        </div>

        {/* 4: Upload/Manage Documents */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
        >
          <FaFileUpload size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Upload/Manage Documents</p>
        </div>

        {/* 5: Add Residence */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
        >
          <FaHome size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Add Residence</p>
        </div>
      </div>

      {/* Thin line separator */}
      <hr className="border-gray-300" />

      {/* Solar Production & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Solar Production (left, spanning 2 columns) */}
        <div className="bg-white rounded-md shadow p-4 lg:col-span-2">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#039994] font-semibold">Solar Production</h3>
            <div className="flex items-center space-x-2">
              {/* Yearly & 2025 placeholders */}
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

          {/* Bar Chart Placeholder */}
          <div className="flex items-end justify-between h-36">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, idx) => {
              // Just random bar heights for demonstration
              const randomHeight = Math.floor(Math.random() * 80) + 20;
              return (
                <div key={month} className="flex flex-col items-center">
                  <div
                    className="bg-[#039994] w-4 rounded-t-md"
                    style={{ height: `${randomHeight}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Net Energy Exported */}
        <div className="bg-white rounded-md shadow p-4 flex flex-col justify-center">
          <h4 className="text-sm font-semibold text-gray-600">
            Net energy exported to grid
          </h4>
          <hr className="my-2" />
          <p className="text-2xl font-bold text-[#039994]">2,000Kwh</p>
        </div>

        {/* RECs Created */}
        <div className="bg-white rounded-md shadow p-4 flex flex-col justify-center lg:col-span-1">
          <h4 className="text-sm font-semibold text-gray-600">RECs created</h4>
          <hr className="my-2" />
          <p className="text-2xl font-bold text-[#039994]">24</p>
        </div>
      </div>

      {/* Thin line separator */}
      <hr className="border-gray-300" />

      {/* Energy Consumed & Rewards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Energy Consumed (left, spanning 2 columns) */}
        <div className="bg-white rounded-md shadow p-4 lg:col-span-2">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#039994] font-semibold">Energy Consumed</h3>
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

          {/* Bar Chart Placeholder */}
          <div className="flex items-end justify-between h-36">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, idx) => {
              const randomHeight = Math.floor(Math.random() * 80) + 20;
              return (
                <div key={month} className="flex flex-col items-center">
                  <div
                    className="bg-[#039994] w-4 rounded-t-md"
                    style={{ height: `${randomHeight}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-md shadow p-4 flex flex-col justify-center">
          <h4 className="text-sm font-semibold text-gray-600">Rewards</h4>
          <hr className="my-2" />
          <div className="text-gray-700 space-y-2">
            <p>Referrals: 5</p>
            <p>$10 coupon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewResidence;
