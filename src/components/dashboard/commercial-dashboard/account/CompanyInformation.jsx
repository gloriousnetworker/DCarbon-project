"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const CompanyInformation = () => {
  // Inline style classes
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass =
    "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  // local state for collapsible section and fields
  const [isOpen, setIsOpen] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [commercialRole, setCommercialRole] = useState("owner"); // fixed, non-editable
  const [entityType, setEntityType] = useState("company");

  // Load company details from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("companyDetails");
    if (stored) {
      try {
        const details = JSON.parse(stored);
        setCompanyName(details.companyName || "");
        setCompanyAddress(details.companyAddress || "");
        setCompanyWebsite(details.companyWebsite || "");
        setCommercialRole(details.commercialRole || "owner");
        setEntityType(details.entityType || "company");
      } catch (err) {
        console.error("Error parsing companyDetails from localStorage", err);
      }
    }
  }, []);

  // Handle update button click to send PUT request to update company details
  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    // Build the payload; commercialRole is fixed and not editable
    const payload = {
      entityType,
      commercialRole, // always "owner"
      companyName,
      companyAddress,
      companyWebsite,
    };

    try {
      const response = await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success("Company details updated successfully");
      // Update local storage with the new company details
      localStorage.setItem("companyDetails", JSON.stringify(payload));
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
    <div className="border-b border-[#1E1E1E] pb-4 mb-4">
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Company Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Company Name */}
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. My Company"
            />
          </div>
          {/* Company Address */}
          <div>
            <label className={labelClass}>Company Address</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. 123 Main St, City, Country"
            />
          </div>
          {/* Company Website */}
          <div>
            <label className={labelClass}>Company Website</label>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="https://company.com"
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
              Update Company Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInformation;
