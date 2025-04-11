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
  const [commercialRole, setCommercialRole] = useState("owner");
  const [entityType, setEntityType] = useState("individual");

  // Load owner details from updated local storage ("ownerDetails") if available,
  // otherwise fallback to data stored under "userData".
  useEffect(() => {
    const loadOwnerDetails = () => {
      const storedOwnerDetails = localStorage.getItem("ownerDetails");
      if (storedOwnerDetails) {
        try {
          const details = JSON.parse(storedOwnerDetails);
          setOwnerFullName(details.ownerFullName || "");
          setOwnerWebsite(details.ownerWebsite || "");
          // Assuming phoneNumber is stored with the prefix.
          // If you want to separate the prefix from the rest, you may need additional logic.
          if (details.phoneNumber) {
            // For simplicity, if the stored phone number starts with +, we'll use the default prefix and the rest.
            if (details.phoneNumber.startsWith("+")) {
              // Example: if stored phoneNumber is "+2341234567890", then:
              setPhonePrefix(details.phoneNumber.slice(0, 4)); // e.g., "+234"
              setPhoneNumber(details.phoneNumber.slice(4));
            } else {
              setPhoneNumber(details.phoneNumber);
            }
          }
          setOwnerAddress(details.ownerAddress || "");
          setCommercialRole(details.commercialRole || "owner");
          setEntityType(details.entityType || "individual");
        } catch (err) {
          console.error("Error parsing ownerDetails from localStorage", err);
        }
      } else {
        // Fallback to userData if ownerDetails does not exist
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const data = JSON.parse(storedUserData);
            setOwnerFullName(data.ownerFullName || "");
            setOwnerWebsite(data.ownerWebsite || "");
            setPhoneNumber(data.phoneNumber || "");
            setOwnerAddress(data.ownerAddress || "");
            setCommercialRole(data.commercialRole || "owner");
            setEntityType(data.entityType || "individual");
          } catch (err) {
            console.error("Error parsing userData from localStorage", err);
          }
        }
      }
    };

    loadOwnerDetails();
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

      // Save the updated owner details in local storage under "ownerDetails"
      localStorage.setItem("ownerDetails", JSON.stringify(payload));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Update failed";
      toast.error(errorMessage);
      console.error("Update error:", error);
    }
  };

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
            <div className="flex gap-2">
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
