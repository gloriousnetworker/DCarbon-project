"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const validateForm = () => {
    if (!fullName.trim()) {
      toast.error("Owner's full name is required");
      return false;
    }
    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!address.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!/^\+?\d{7,}$/.test(phonePrefix + phoneNumber.replace(/-/g, ""))) {
      toast.error("Invalid phone number format");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");

      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const payload = {
        entityType: "individual",
        commercialRole: "owner",
        ownerFullName: fullName,
        phoneNumber: `${phonePrefix}${phoneNumber.replace(/-/g, "")}`,
        ownerAddress: address,
        ...(website && { ownerWebsite: website }) // Only include website if it exists
      };

      await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      localStorage.setItem("ownerDetails", JSON.stringify(payload));
      toast.success("Owner details updated successfully");
      router.push("/register/commercial-owner-registration/step-three");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Update failed";
      toast.error(errorMessage);
      console.error("Submission Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Apply formatting: 000-0000-000
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    if (cleaned.length > 6) {
      formatted = `${formatted.slice(0, 7)}-${formatted.slice(7)}`;
    }
    
    return formatted.slice(0, 13); // Limit to 12 characters (including hyphens)
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className={mainContainer}>
        <div className={headingContainer}>
          <button
            type="button"
            onClick={() => router.back()}
            className={backArrow}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className="w-full max-w-md">
          <h1 className={pageTitle}>Solar Owner's Details</h1>
        </div>

        {/* Progress Bar */}
        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            {/* Set width via inline style to reflect 3/5 progress */}
            <div className={progressBarActive} style={{ width: "60%" }} />
          </div>
          <span className={progressStepText}>03/05</span>
        </div>

        <div className="w-full max-w-md mb-4">
          <h2 className={uploadHeading}>Individual owner</h2>
        </div>

        <div className={formWrapper}>
          <div>
            <label className={labelClass}>
              Owner's full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            {/* Using grid with fixed width for the prefix */}
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <input
                type="text"
                value={phonePrefix}
                placeholder="+1"
                onChange={(e) => setPhonePrefix(e.target.value)}
                className={inputClass}
                maxLength={4}
              />
              <input
                type="text"
                placeholder="000-0000-000"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className={inputClass}
                maxLength={12}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="E.g. Street, City, County, State."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Website details <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter website (e.g. www.example.com)"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button onClick={handleSubmit} className={buttonPrimary}>
            Next
          </button>
        </div>

        <div className={termsTextContainer}>
          Terms and Conditions &amp;{" "}
          <a href="/privacy" className="text-[#039994] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}

// Style constants
const mainContainer =
  "min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white";
const headingContainer =
  "relative w-full flex flex-col items-center mb-2";
const backArrow =
  "absolute left-4 top-0 text-[#039994] cursor-pointer z-10";
const pageTitle =
  "mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center";
const progressContainer =
  "w-full max-w-md flex items-center justify-between mb-6";
const progressBarWrapper =
  "flex-1 h-1 bg-gray-200 rounded-full mr-4";
const progressBarActive =
  "h-1 bg-[#039994] rounded-full";
const progressStepText =
  "text-sm font-medium text-gray-500 font-sfpro";
const formWrapper =
  "w-full max-w-md space-y-6";
const labelClass =
  "block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]";
const inputClass =
  "w-full rounded-md border border-gray-300 px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]";
const buttonPrimary =
  "w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro";
const spinnerOverlay =
  "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20";
const spinner =
  "h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin";
const termsTextContainer =
  "mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]";
const uploadHeading =
  "block mb-2 font-sfpro text-[24px] leading-[100%] tracking-[-0.05em] font-[400] text-[#039994]";
