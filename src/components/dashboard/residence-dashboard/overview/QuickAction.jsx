import React from "react";
import {
  FaHome,
  FaFileUpload,
  FaMoneyCheckAlt,
  FaUserPlus
} from "react-icons/fa";

const QuickAction = () => {
  // Quick action items (with your exact gradients)
  const actions = [
    {
      title: "Add a Residence",
      icon: <FaHome size={24} />,
      gradient:
        "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
      textColor: "text-white"
    },
    {
      title: "Upload/Manage Documents",
      icon: <FaFileUpload size={24} />,
      gradient:
        "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
      textColor: "text-white"
    },
    {
      title: "Request Redemption",
      icon: <FaMoneyCheckAlt size={24} className="text-[#039994]" />,
      gradient:
        "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
      textColor: "text-gray-700"
    },
    {
      title: "Refer a Solar Panel Owner",
      icon: <FaUserPlus size={24} />,
      gradient:
        "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #58595B 100%)",
      textColor: "text-white"
    }
  ];

  // Example data for the Rewards card
  const currentPoints = 20;
  const redemptionCurrent = 250;
  const redemptionMax = 3000;
  const referralProgress = 40; // out of 100, for example

  // Calculate progress bar widths
  const redemptionWidth = `${(redemptionCurrent / redemptionMax) * 100}%`;
  const referralWidth = `${referralProgress}%`;

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN: Quick Action */}
        <div className="w-full lg:w-1/2">
          {/* Heading */}
          <h2 className="text-xl font-semibold text-[#039994] mb-4">
            Quick Action
          </h2>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <div
                key={index}
                className="rounded-md p-4 flex flex-col items-center"
                style={{ background: action.gradient }}
              >
                {/* Icon */}
                <div
                  className={`mb-2 ${
                    action.textColor ? action.textColor : "text-white"
                  }`}
                >
                  {action.icon}
                </div>
                {/* Separator */}
                <hr
                  className={`w-full mb-2 ${
                    action.textColor && action.textColor.includes("gray-700")
                      ? "border-gray-300"
                      : "border-white"
                  }`}
                />
                {/* Title */}
                <p
                  className={`text-center text-sm ${
                    action.textColor ? action.textColor : "text-white"
                  }`}
                >
                  {action.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Rewards */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Heading */}
          <h2 className="text-xl font-semibold text-[#039994] mb-4">Rewards</h2>

          {/* Rewards Card */}
          <div className="bg-white rounded-md shadow p-4 flex flex-col justify-between h-full">
            {/* Current Points */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">
                Current Points Balance
              </p>
              <p className="text-base font-semibold text-gray-800">
                {currentPoints}pts
              </p>
            </div>

            {/* Redemption Progress */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">Redemption Progress</p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-[#039994] h-2 rounded-full"
                  style={{ width: redemptionWidth }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {redemptionCurrent}/{redemptionMax}pts
              </p>
            </div>

            {/* Referral Bonus Progress */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">
                Referral Bonus Progress
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full relative">
                <div
                  className="bg-[#039994] h-2 rounded-full"
                  style={{ width: referralWidth }}
                />
              </div>
            </div>

            {/* Tiers to the right of Referral Progress */}
            <div className="flex justify-end items-center gap-3">
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#CD7F32" }} // Bronze
                />
                <span className="text-[10px] text-gray-700">Bronze Tier</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#C0C0C0" }} // Silver
                />
                <span className="text-[10px] text-gray-700">Silver Tier</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#FFD700" }} // Gold
                />
                <span className="text-[10px] text-gray-700">Gold Tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAction;
