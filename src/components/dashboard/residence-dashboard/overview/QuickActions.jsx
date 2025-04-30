// src/components/QuickActions.jsx

import React, { useState } from "react";
import InviteCollaboratorModal from "./modals/InviteCollaboratorModal";

export default function QuickActions() {
  const [modal, setModal] = useState("");

  const openModal = (type) => {
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  return (
    <div className="w-full py-4 px-4">
      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Commission Earned */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex items-center mb-2">
            <img
              src="/vectors/CashRegister.png" // Your image source here
              alt="Total Commission"
              className="h-6 w-6 object-contain mr-2"
            />
            <p className="text-[#1E1E1E] font-[500] text-[14px] leading-[100%] tracking-[-0.05em] font-sfpro">
              Total Commission Earned
            </p>
          </div>
          <hr className="border-black w-full my-2" />
          <p className="text-[#056C69] text-[18px] font-bold leading-tight">
            $10,000
          </p>
        </div>

        {/* Card 2: Avg. Commission Rate */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex items-center mb-2">
            <img
              src="/vectors/Percent.png" // Your image source here
              alt="Avg. Commission Rate"
              className="h-6 w-6 object-contain mr-2"
            />
            <p className="text-[#1E1E1E] font-[500] text-[14px] leading-[100%] tracking-[-0.05em] font-sfpro">
              Avg. Commission Rate
            </p>
          </div>
          <hr className="border-black w-full my-2" />
          <p className="text-[#056C69] font-[600] text-[18px] leading-tight">
            15.2%
          </p>
        </div>

        {/* Card 3: Invite New Customer */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center cursor-pointer"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
          onClick={() => openModal("invite")}
        >
          <img
            src="/vectors/Share.png"
            alt="Share"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm font-bold leading-tight">
            Invite New Customer
          </p>
        </div>
      </div>

      {/* Render the Invite Collaborator Modal */}
      <InviteCollaboratorModal
        isOpen={modal === "invite"}
        onClose={closeModal}
      />
    </div>
  );
}
