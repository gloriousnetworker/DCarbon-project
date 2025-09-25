"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Inline ToggleSwitch (can be extracted if needed)
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

const AccountPayableInformation = ({ stripeEnabled, setStripeEnabled }) => {
  // Inline style classes
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass =
    "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  // Local state for collapsible section and user details
  const [isOpen, setIsOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [userType, setUserType] = useState("");

  // Load user details from the login response stored in local storage on mount
  useEffect(() => {
    const storedResponse = localStorage.getItem("loginResponse");
    if (storedResponse) {
      try {
        // Assumes loginResponse format matches your sample response.
        const response = JSON.parse(storedResponse);
        const user = response.data?.user;
        if (user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setPhoneNumber(user.phoneNumber || "");
          setReferralCode(user.referralCode || "");
          setUserType(user.userType || "");
        }
      } catch (err) {
        console.error("Error parsing loginResponse from localStorage", err);
      }
    }
  }, []);

  // Handle update: sends PUT request to update the user details.
  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("User not authenticated");
      return;
    }

    // Build the payload. In this example, we're updating firstName, lastName, and phoneNumber.
    const payload = {
      firstName,
      lastName,
      phoneNumber,
    };

    try {
      const response = await axios.put(
        `https://services.dcarbon.solutions/api/user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success(response.data.message || "User updated successfully");

      // Optionally update the loginResponse in local storage
      const storedResponse = localStorage.getItem("loginResponse");
      if (storedResponse) {
        const parsedResponse = JSON.parse(storedResponse);
        parsedResponse.data.user.firstName = firstName;
        parsedResponse.data.user.lastName = lastName;
        parsedResponse.data.user.phoneNumber = phoneNumber;
        localStorage.setItem("loginResponse", JSON.stringify(parsedResponse));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Update failed";
      toast.error(errorMessage);
      console.error("Update error:", error);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <Toaster />
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Commercial Operator's Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Stripe Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm font-sfpro">
              Connect with Stripe (or third-party payment service)
            </span>
            <ToggleSwitch enabled={stripeEnabled} onChange={setStripeEnabled} />
          </div>

          {/* Editable User Details */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="First Name"
                />
              </div>
              <div className="w-1/2">
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Email Address"
                />
              </div>
              <div className="w-1/2">
                <label className={labelClass}>Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Phone Number"
                />
              </div>
            </div>
          </div>

          {/* Non-editable Additional User Details */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className={labelClass}>Referral Code</label>
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Referral Code"
                />
              </div>
              <div className="w-1/2">
                <label className={labelClass}>User Type</label>
                <input
                  type="text"
                  value={userType}
                  readOnly
                  className={inputClass}
                  style={inputStyle}
                  placeholder="User Type"
                />
              </div>
            </div>
          </div>
          {/* Update Button */}
          <div>
            <button
              onClick={handleUpdate}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              Update Commercial Operator's Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPayableInformation;
