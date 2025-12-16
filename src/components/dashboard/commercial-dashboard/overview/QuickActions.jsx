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
  const [hasMeters, setHasMeters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMeters = async () => {
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const result = await response.json();
        
        const metersExist = result.status === 'success' && 
                           Array.isArray(result.data) &&
                           result.data.some(item => 
                             Array.isArray(item.meters) &&
                             item.meters.some(meter => 
                               Array.isArray(meter.meterNumbers) && 
                               meter.meterNumbers.length > 0
                             )
                           );
        
        setHasMeters(metersExist);
      } catch (error) {
        console.error('Error checking meters:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMeters();
  }, []);

  const openModal = (type) => {
    if (loading) return;
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  if (loading) {
    return (
      <div className="w-full py-4 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start ${hasMeters ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
          onClick={() => hasMeters && openModal("add")}
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
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer hover:opacity-90`}
          style={{
            background: "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
          onClick={() => openModal("continue")}
        >
          <img
            src="/vectors/Files.png"
            alt="Files"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-[1px] border-green-500 w-full mb-2" />
          <p className="text-black text-sm leading-tight">
            Continue <br />
            <span className="font-bold">Registration</span>
          </p>
        </div>

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start ${hasMeters ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
          onClick={() => hasMeters && openModal("statement")}
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
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start ${hasMeters ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
          onClick={() => hasMeters && openModal("invite")}
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

      {modal === "add" && hasMeters && (
        <AddCommercialFacilityModal isOpen onClose={closeModal} />
      )}
      {modal === "continue" && !hasMeters && (
        <CommercialRegistrationModal isOpen onClose={closeModal} currentStep={5} />
      )}
      {modal === "continue" && hasMeters && (
        <AddCommercialFacilityModal isOpen onClose={closeModal} />
      )}
      {modal === "invite" && <InviteCollaboratorModal isOpen onClose={closeModal} />}
      {modal === "statement" && <CurrentStatementModal isOpen onClose={closeModal} />}
    </div>
  );
}