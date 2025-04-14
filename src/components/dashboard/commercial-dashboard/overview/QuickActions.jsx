// src/components/QuickActions.jsx

import React, { useState } from "react";
import AddCommercialFacilityModal from "./modals/AddCommercialFacilityModal";
import ResolvePendingActionsModal from "./modals/ResolvePendingActionsModal";
import CurrentStatementModal from "./modals/CurrentStatementModal";
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
      {/* Heading Section */}
      <div className="flex flex-col items-start mb-2">
        <h2 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-left">
          Quick Action
        </h2>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Add Commercial Facility */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
          onClick={() => openModal("add")}
        >
          <img
            src="/vectors/MapPinPlus.png"
            alt="Map Pin Plus"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white font-bold text-sm leading-tight">
            Add <br />
            Commercial Facility
          </p>
        </div>

        {/* Card 2: Resolve Pending Actions */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
          onClick={() => openModal("resolve")}
        >
          <img
            src="/vectors/Files.png"
            alt="Files"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-[1px] border-green-500 w-full mb-2" />
          <p className="text-black text-sm leading-tight">
            Resolve <br />
            <span className="font-bold">Pending Actions</span>
          </p>
        </div>

        {/* Card 3: Current Statement */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
          onClick={() => openModal("statement")}
        >
          <img
            src="/vectors/HandCoins.png"
            alt="Hand Coins"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm leading-tight">
            Current <br />
            Statement
          </p>
        </div>

        {/* Card 4: Invite Collaborator */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
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
          <p className="text-white text-sm leading-tight">
            Invite <br />
            <span className="font-bold">Collaborator</span>
          </p>
        </div>
      </div>

      {/* Render the modals */}
      <AddCommercialFacilityModal
        isOpen={modal === "add"}
        onClose={closeModal}
      />
      <ResolvePendingActionsModal
        isOpen={modal === "resolve"}
        onClose={closeModal}
      />
      <CurrentStatementModal
        isOpen={modal === "statement"}
        onClose={closeModal}
      />
      <InviteCollaboratorModal
        isOpen={modal === "invite"}
        onClose={closeModal}
      />
    </div>
  );
}
