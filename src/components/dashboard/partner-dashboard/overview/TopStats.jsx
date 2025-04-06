import React from "react";
import { FaUserPlus } from "react-icons/fa";

export default function TopStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Commission Earned */}
      <div className="bg-white rounded-md shadow p-4 flex flex-col justify-center">
        <p className="text-gray-500 text-sm mb-1">Total Commission Earned</p>
        <p className="text-2xl font-bold">$10,000</p>
      </div>

      {/* Card 2: Avg. Commission Rate */}
      <div className="bg-white rounded-md shadow p-4 flex flex-col justify-center">
        <p className="text-gray-500 text-sm mb-1">Avg. Commission Rate</p>
        <p className="text-2xl font-bold">15.2%</p>
      </div>

      {/* Card 3: Invite New Customer (radial gradient) */}
      <div
        className="rounded-md shadow p-4 flex items-center justify-center cursor-pointer"
        style={{
          background:
            "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
        }}
      >
        <button className="flex items-center space-x-2 text-white font-semibold">
          <FaUserPlus size={18} />
          <span>Invite New Customer</span>
        </button>
      </div>
    </div>
  );
}
