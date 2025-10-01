import React, { useState, useEffect } from "react";
import InviteCollaboratorModal from "./modals/InviteCollaboratorModal";
import InviteInstallerModal from "./modals/InviteInstallerModal";

export default function QuickActions() {
  const [modal, setModal] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerType = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        const data = await response.json();
        if (data.data?.partnerType) {
          setPartnerType(data.data.partnerType);
        }
      } catch (error) {
        console.error("Error fetching partner type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerType();
  }, []);

  const openModal = (type) => {
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  if (loading) return null;

  return (
    <div className="w-full py-4 px-4">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${partnerType === "finance_company" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex items-center mb-2">
            <img
              src="/vectors/CashRegister.png"
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

        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center"
          style={{ background: "#FFFFFF" }}
        >
          <div className="flex items-center mb-2">
            <img
              src="/vectors/Percent.png"
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

        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center cursor-pointer"
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
          <p className="text-white text-sm font-bold leading-tight">
            Invite a Customer
          </p>
        </div>

        {partnerType === "finance_company" && (
          <div
            className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center cursor-pointer"
            style={{
              background: "radial-gradient(60% 119.12% at 114.01% -10%, #083281ff 0%, #024030ff 100%)",
            }}
            onClick={() => openModal("installer")}
          >
            <img
              src="/vectors/Share.png"
              alt="Share"
              className="mb-2 h-8 w-8 object-contain"
            />
            <hr className="border-white w-full mb-2" />
            <p className="text-white text-sm font-bold leading-tight">
              Invite an Installer
            </p>
          </div>
        )}
      </div>

      <InviteCollaboratorModal
        isOpen={modal === "invite"}
        onClose={closeModal}
      />
      <InviteInstallerModal
        isOpen={modal === "installer"}
        onClose={closeModal}
      />
    </div>
  );
}