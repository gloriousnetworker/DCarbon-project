"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ContactInformation = () => {
  // Inline style classes
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass =
    "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  // Local state for collapsible section and fields
  const [isOpen, setIsOpen] = useState(true);
  const [ownerFullName, setOwnerFullName] = useState("");
  const [ownerWebsite, setOwnerWebsite] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [commercialRole, setCommercialRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch contact information from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const { commercialUser } = response.data.data;
        
        if (commercialUser) {
          setOwnerFullName(commercialUser.ownerFullName || "");
          setOwnerWebsite(commercialUser.ownerWebsite || "");
          
          // Handle phone number
          if (commercialUser.phoneNumber) {
            if (commercialUser.phoneNumber.startsWith("+")) {
              setPhonePrefix(commercialUser.phoneNumber.slice(0, 4));
              setPhoneNumber(commercialUser.phoneNumber.slice(4));
            } else {
              setPhoneNumber(commercialUser.phoneNumber);
            }
          }
          
          setOwnerAddress(commercialUser.ownerAddress || "");
          setCommercialRole(commercialUser.commercialRole || "");
          setEntityType(commercialUser.entityType || "");
        }
      } catch (error) {
        console.error("Error fetching contact information:", error);
        toast.error(
          error.response?.data?.message || 
          "Failed to fetch contact information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Handle update to send PUT request with the correct payload
  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("User not authenticated");
      return;
    }

    const payload = {
      entityType: "individual",
      commercialRole: "owner",
      ownerFullName: ownerFullName,
      phoneNumber: `${phonePrefix}${phoneNumber}`,
      ownerAddress: ownerAddress,
      ownerWebsite: ownerWebsite || undefined,
    };

    try {
      await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("Contact information updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Update failed";
      toast.error(errorMessage);
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={sectionTitle}>Contact Information</h2>
          {isOpen ? (
            <FaChevronUp className="text-[#039994]" size={20} />
          ) : (
            <FaChevronDown className="text-[#039994]" size={20} />
          )}
        </div>
        {isOpen && (
          <div className="mt-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <Toaster />
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Contact Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={ownerFullName}
              onChange={(e) => setOwnerFullName(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="Owner's Full Name"
            />
          </div>
          {/* Website */}
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="text"
              value={ownerWebsite}
              onChange={(e) => setOwnerWebsite(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. www.example.com"
            />
          </div>
          {/* Phone Number */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <input
                type="text"
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className={`${inputClass} w-20`}
                style={inputStyle}
                placeholder="+234"
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`${inputClass} flex-1`}
                style={inputStyle}
                placeholder="e.g. 1234567890"
              />
            </div>
          </div>
          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. Nigeria, Uyo"
            />
          </div>
          {/* Commercial Role (read-only) */}
          <div>
            <label className={labelClass}>Commercial Role</label>
            <input
              type="text"
              value={commercialRole}
              readOnly
              className={inputClass}
              style={inputStyle}
            />
          </div>
          {/* Entity Type (read-only) */}
          <div>
            <label className={labelClass}>Entity Type</label>
            <input
              type="text"
              value={entityType}
              readOnly
              className={inputClass}
              style={inputStyle}
            />
          </div>
          {/* Update Button */}
          <div>
            <button
              onClick={handleUpdate}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              Update Contact Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInformation;