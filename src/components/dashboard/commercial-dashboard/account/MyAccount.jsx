"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileImage from "./ProfileImage";
import CompanyInformation from "./CompanyInformation";
import ContactInformation from "./ContactInformation";
import AccountPayableInformation from "./AccountPayableInformation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]" />
      </div>
    );
  }

  return (
    <>
      {/* Modal for Change Password */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      {/* Main container */}
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row">
            {/* Profile Image */}
            <ProfileImage onUploadSuccess={handleProfileUploadSuccess} />

            {/* Right content area */}
            <div className="w-full md:w-2/3 md:pl-8 space-y-6">
              {/* Company, Contact, and Payment Information */}
              <CompanyInformation userData={userData} />
              <ContactInformation userData={userData} />
              <AccountPayableInformation
                stripeEnabled={stripeEnabled}
                setStripeEnabled={setStripeEnabled}
              />

              {/* Preferences Section */}
              <div className="border-t border-gray-200 pt-6">
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
                      <label className="text-sm text-gray-700 font-sfpro">
                        Payment Frequency:
                      </label>
                      <div className="flex items-center mt-2 space-x-6">
                        <label className="flex items-center space-x-2 text-sm text-gray-700 font-sfpro">
                          <input
                            type="checkbox"
                            checked={monthlyFrequency}
                            onChange={() => setMonthlyFrequency(!monthlyFrequency)}
                          />
                          <span>Monthly</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 font-sfpro">
                          <input
                            type="checkbox"
                            checked={quarterlyFrequency}
                            onChange={() => setQuarterlyFrequency(!quarterlyFrequency)}
                          />
                          <span>Quarterly</span>
                        </label>
                      </div>
                    </div>

                    {/* 2FA Authentication */}
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block font-sfpro"
                      onClick={() => setViewTwoFA(true)}
                    >
                      2F Authentication
                    </button>

                    {/* Change Password */}
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block font-sfpro"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;