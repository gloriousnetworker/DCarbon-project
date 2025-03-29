import React from "react";
import { FaUserPlus, FaMoneyCheckAlt, FaFileUpload, FaIndustry } from "react-icons/fa";

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-[#039994] text-xl font-semibold mb-4">Quick Action</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center cursor-pointer"
          style={{
            background:
              "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
        >
          <FaUserPlus size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Add Commercial Facility</p>
        </div>

        {/* Card 2 */}
        <div
          className="p-4 rounded-md text-black flex flex-col items-center cursor-pointer"
          style={{
            background:
              "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
        >
          <FaFileUpload size={24} className="mb-2 text-[#039994]" />
          <hr className="border-gray-300 w-full mb-2" />
          <p className="text-center text-sm font-medium">Upload/Manage Documents</p>
        </div>

        {/* Card 3 */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center cursor-pointer"
          style={{
            background:
              "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
        >
          <FaMoneyCheckAlt size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Request Payment</p>
        </div>

        {/* Card 4 */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center cursor-pointer"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
        >
          <FaIndustry size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Refer a Business Partner</p>
        </div>
      </div>
    </div>
  );
}
