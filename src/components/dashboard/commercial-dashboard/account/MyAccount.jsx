"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileImage from "./ProfileImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToggleSwitch = ({ enabled, onChange }) => {
  return (
    <div
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
        enabled ? "bg-[#039994]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
};

const MyAccount = () => {
  const [showPersonal, setShowPersonal] = useState(true);
  const [showAccount, setShowAccount] = useState(true);
  const [showPreferences, setShowPreferences] = useState(true);
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
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
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
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
    setUserData(prev => ({ ...prev, ...updatedUserData }));
  };

  if (viewTwoFA) {
    return <TwoFactorAuth onBack={() => setViewTwoFA(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <>
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded shadow p-6 flex flex-col md:flex-row">
            <ProfileImage onUploadSuccess={handleProfileUploadSuccess} />

            <div className="w-full md:w-2/3 md:pl-8">
              {/* PERSONAL INFORMATION */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPersonal(!showPersonal)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Personal Information
                  </h2>
                  {showPersonal ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showPersonal && (
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="text-sm text-gray-700 mb-1 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={userData?.firstName || ""}
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="First name"
                          readOnly
                        />
                      </div>
                      <div className="w-full md:w-1/2">
                        <label className="text-sm text-gray-700 mb-1 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={userData?.lastName || ""}
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="Last name"
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userData?.email || ""}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                        placeholder="e.g. name@domain.com"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Address
                      </label>
                      <input
                        type="text"
                        value={userData?.address || ""}
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                        placeholder="e.g. Street, Country, State"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Phone number
                      </label>
                      <div className="flex flex-wrap md:flex-nowrap gap-2">
                        <input
                          type="text"
                          value={userData?.phone?.countryCode || "+234"}
                          className="border border-gray-300 rounded px-3 py-2 focus:outline-none w-full md:w-1/4"
                          readOnly
                        />
                        <input
                          type="tel"
                          value={userData?.phone?.number || ""}
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="000-0000-000"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCOUNT INFORMATION */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowAccount(!showAccount)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Account Information
                  </h2>
                  {showAccount ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showAccount && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">
                        Connect with Stripe (or Third party payment service)
                      </span>
                      <ToggleSwitch
                        enabled={stripeEnabled}
                        onChange={setStripeEnabled}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PREFERENCES */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPreferences(!showPreferences)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Preferences
                  </h2>
                  {showPreferences ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showPreferences && (
                  <div className="mt-4 space-y-2">
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block"
                      onClick={() => setViewTwoFA(true)}
                    >
                      2F Authentication
                    </button>
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block"
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