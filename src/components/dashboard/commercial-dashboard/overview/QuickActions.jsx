import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CommercialRegistrationModal = dynamic(
  () => import("./modals/createfacility/CommercialRegistrationModal"),
  { ssr: false }
);
const AddCommercialFacilityModal = dynamic(
  () => import("./modals/createfacility/ownerAndOperatorRegistration/AddCommercialFacilityModal"),
  { ssr: false }
);
const ResolvePendingActionsModal = dynamic(
  () => import("./modals/ResolvePendingActionsModal"),
  { ssr: false }
);
const CurrentStatementModal = dynamic(
  () => import("./modals/CurrentStatementModal"),
  { ssr: false }
);
const InviteCollaboratorModal = dynamic(
  () => import("./modals/InviteCollaboratorModal"),
  { ssr: false }
);

export default function QuickActions() {
  const [modal, setModal] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);

  useEffect(() => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));

    if (loginResponse?.data?.user?.agreements !== null &&
        loginResponse?.data?.user?.utilityAuth?.length > 0) {
      setHasCompletedRegistration(true);
    }

    if (loginResponse?.data?.user?.agreements === null &&
        loginResponse?.data?.user?.utilityAuth?.length === 0) {
      setIsDisabled(true);
    }
  }, []);

  const openModal = (type) => {
    if (isDisabled && type !== "add") return;
    if (type === "resolve" || type === "statement") return;
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
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

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
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

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
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

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer hover:opacity-90 transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            background: "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
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
            <span className="font-bold">Customer</span>
          </p>
        </div>
      </div>

      {modal === "add" && hasCompletedRegistration && (
        <AddCommercialFacilityModal isOpen onClose={closeModal} />
      )}
      {modal === "add" && !hasCompletedRegistration && (
        <CommercialRegistrationModal isOpen onClose={closeModal} />
      )}
      {modal === "invite" && <InviteCollaboratorModal isOpen onClose={closeModal} />}
    </div>
  );
}
