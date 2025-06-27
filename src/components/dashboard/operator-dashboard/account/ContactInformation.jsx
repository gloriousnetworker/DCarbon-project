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
          
          // Handle phone number - extract prefix and number
          if (commercialUser.phoneNumber) {
            const phoneStr = commercialUser.phoneNumber.toString();
            if (phoneStr.startsWith("+")) {
              // Find where the country code ends (typically after +234, +1, etc.)
              const match = phoneStr.match(/^(\+\d{1,4})(.*)$/);
              if (match) {
                setPhonePrefix(match[1]);
                setPhoneNumber(match[2]);
              } else {
                setPhoneNumber(phoneStr);
              }
            } else {
              setPhoneNumber(phoneStr);
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
      toast.error("Authentication required");
      return;
    }

    // Validation
    if (!ownerFullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    // Construct payload with current state values (not hardcoded)
    const payload = {
      entityType: entityType || "individual",
      commercialRole: commercialRole || "owner",
      ownerFullName: ownerFullName.trim(),
      phoneNumber: phoneNumber ? `${phonePrefix}${phoneNumber}` : undefined,
      ownerAddress: ownerAddress.trim(),
      ownerWebsite: ownerWebsite.trim() || undefined,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    try {
      const response = await axios.put(
        `https://services.dcarbon.solutions/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Contact information updated successfully");
        
        // Update local state with response data if available
        const updatedData = response.data.data;
        if (updatedData) {
          setOwnerFullName(updatedData.ownerFullName || "");
          setOwnerWebsite(updatedData.ownerWebsite || "");
          
          // Handle updated phone number
          if (updatedData.phoneNumber) {
            const phoneStr = updatedData.phoneNumber.toString();
            if (phoneStr.startsWith("+")) {
              const match = phoneStr.match(/^(\+\d{1,4})(.*)$/);
              if (match) {
                setPhonePrefix(match[1]);
                setPhoneNumber(match[2]);
              } else {
                setPhoneNumber(phoneStr);
              }
            } else {
              setPhoneNumber(phoneStr);
            }
          }
          
          setOwnerAddress(updatedData.ownerAddress || "");
          setCommercialRole(updatedData.commercialRole || "");
          setEntityType(updatedData.entityType || "");
        }
      }
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
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
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
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              value={ownerFullName}
              onChange={(e) => setOwnerFullName(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="Owner's Full Name"
              required
            />
          </div>
          {/* Website */}
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={ownerWebsite}
              onChange={(e) => setOwnerWebsite(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="https://www.example.com"
            />
          </div>
          {/* Phone Number */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <input
                type="text"
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="+234"
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="1234567890"
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
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors duration-200"
              disabled={!ownerFullName.trim()}
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