"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileImage from "./ProfileImage";
import CompanyInformation from "./CompanyInformation";
import ContactInformation from "./ContactInformation";
import AccountPayableInformation from "./AccountPayableInformation";
import { toast } from "react-hot-toast";
import Loader from "@/components/loader/Loader";

const MyAccount = () => {
  // States for toggling Preferences and modals
  const [showPreferences, setShowPreferences] = useState(true);
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Payment toggles & frequency
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [monthlyFrequency, setMonthlyFrequency] = useState(false);
  const [quarterlyFrequency, setQuarterlyFrequency] = useState(false);

  // User data and loading state
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          `https://dcarbon-server.onrender.com/api/user/get-one-user/${userId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user data");
        }

        setUserData(data.data);
        localStorage.setItem("userProfile", JSON.stringify(data.data));
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUploadSuccess = (updatedUserData) => {
    toast.success("Profile picture updated successfully!");
    setUserData((prev) => ({ ...prev, ...updatedUserData }));
  };

  // Render 2FA view if active
  if (viewTwoFA) {
    return <TwoFactorAuth onBack={() => setViewTwoFA(false)} />;
  }

  return (
    <>
      {/* Modal for Change Password */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      {/* Main container */}
      <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row border border-[#E8E8E8] relative">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl z-10">
                <Loader />
              </div>
            )}

            {/* Profile Image */}
            <ProfileImage onUploadSuccess={handleProfileUploadSuccess} />

            {/* Right content area */}
            <div className="w-full md:w-2/3 md:pl-8 space-y-6">
              {/* Company, Contact, and Payment Information */}
              {!loading && (
                <>
                  <CompanyInformation userData={userData} />
                  <ContactInformation userData={userData} />
                  <AccountPayableInformation
                    stripeEnabled={stripeEnabled}
                    setStripeEnabled={setStripeEnabled}
                  />

                  {/* Preferences Section */}
                  <div className="border-t border-[#E8E8E8] pt-6">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setShowPreferences(!showPreferences)}
                    >
                      <h2 className="text-lg font-semibold text-[#039994] font-sfpro">
                        Preferences
                      </h2>
                      {showPreferences ? (
                        <FaChevronUp className="text-[#039994]" size={20} />
                      ) : (
                        <FaChevronDown className="text-[#039994]" size={20} />
                      )}
                    </div>
                    {showPreferences && (
                      <div className="mt-4 space-y-4">
                        {/* Payment Frequency Checkboxes */}
                        <div>
                          <label className="text-sm text-[#1E1E1E] font-sfpro">
                            Payment Frequency:
                          </label>
                          <div className="flex items-center mt-2 space-x-6">
                            <label className="flex items-center space-x-2 text-sm text-[#1E1E1E] font-sfpro">
                              <input
                                type="checkbox"
                                checked={monthlyFrequency}
                                onChange={() => setMonthlyFrequency(!monthlyFrequency)}
                                className="rounded border-[#E8E8E8] text-[#039994] focus:ring-[#039994]"
                              />
                              <span>Monthly</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-[#1E1E1E] font-sfpro">
                              <input
                                type="checkbox"
                                checked={quarterlyFrequency}
                                onChange={() => setQuarterlyFrequency(!quarterlyFrequency)}
                                className="rounded border-[#E8E8E8] text-[#039994] focus:ring-[#039994]"
                              />
                              <span>Quarterly</span>
                            </label>
                          </div>
                        </div>

                        {/* 2FA Authentication */}
                        <button
                          className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block font-sfpro transition-colors"
                          onClick={() => setViewTwoFA(true)}
                        >
                          2FA Authentication
                        </button>

                        {/* Change Password */}
                        <button
                          className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block font-sfpro transition-colors"
                          onClick={() => setShowChangePasswordModal(true)}
                        >
                          Change Password
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;