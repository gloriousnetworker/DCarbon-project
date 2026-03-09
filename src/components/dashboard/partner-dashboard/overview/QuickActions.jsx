import React, { useState, useEffect } from "react";
import InviteCollaboratorModal from "./modals/InviteCollaboratorModal";
import InviteInstallerModal from "./modals/InviteInstallerModal";
import { axiosInstance } from "../../../../../lib/config";

export default function QuickActions() {
  const [modal, setModal] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [loading, setLoading] = useState(true);
  const [commissionTotal, setCommissionTotal] = useState(null);
  const [loadingCommission, setLoadingCommission] = useState(true);

  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchPartnerType = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance({
          method: "GET",
          url: `/api/user/partner/user/${userId}`,
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = response.data;
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

  useEffect(() => {
    const fetchCommissionTotal = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setLoadingCommission(false);
        return;
      }

      try {
        setLoadingCommission(true);
        const response = await axiosInstance({
          method: "GET",
          url: `/api/payout/commission-total/${userId}`,
          params: { quarter: currentQuarter, year: currentYear },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = response.data;
        if (data.status === "success") {
          setCommissionTotal(data.data.total);
        }
      } catch (error) {
        console.error("Error fetching commission total:", error);
        setCommissionTotal(0);
      } finally {
        setLoadingCommission(false);
      }
    };

    fetchCommissionTotal();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal("");

  if (loading) return null;

  return (
    <div className="w-full py-4 px-4">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          partnerType === "finance_company" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        } gap-4`}
      >
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
          {loadingCommission ? (
            <p className="text-[#056C69] text-[18px] font-bold leading-tight animate-pulse">
              Loading...
            </p>
          ) : (
            <p className="text-[#056C69] text-[18px] font-bold leading-tight">
              {commissionTotal !== null ? formatCurrency(commissionTotal) : "$0"}
            </p>
          )}
        </div>

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
            Invite a Customer
          </p>
        </div>

        {partnerType === "finance_company" && (
          <div
            className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-center cursor-pointer"
            style={{
              background:
                "radial-gradient(60% 119.12% at 114.01% -10%, #083281ff 0%, #024030ff 100%)",
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

      <InviteCollaboratorModal isOpen={modal === "invite"} onClose={closeModal} />
      <InviteInstallerModal isOpen={modal === "installer"} onClose={closeModal} />
    </div>
  );
}