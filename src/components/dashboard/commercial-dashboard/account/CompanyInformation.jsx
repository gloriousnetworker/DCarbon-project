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
  const [commercialRole, setCommercialRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch company details from API
  useEffect(() => {
    const fetchCompanyDetails = async () => {
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
          setCompanyName(commercialUser.companyName || "");
          setCompanyAddress(commercialUser.companyAddress || "");
          setCompanyWebsite(commercialUser.companyWebsite || "");
          setCommercialRole(commercialUser.commercialRole || "");
          setEntityType(commercialUser.entityType || "");
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast.error(
          error.response?.data?.message || 
          "Failed to fetch company details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  // Handle update button click to send PUT request to update company details
  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    // Validation
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    const payload = {
      entityType: entityType || "individual",
      commercialRole: commercialRole || "owner",
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim(),
      companyWebsite: companyWebsite.trim(),
    };

    // Remove empty values
    Object.keys(payload).forEach(key => {
      if (payload[key] === "" && key !== "entityType" && key !== "commercialRole") {
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
        toast.success("Company details updated successfully");
        
        // Update local state with response data if available
        const updatedData = response.data.data;
        if (updatedData) {
          setCompanyName(updatedData.companyName || "");
          setCompanyAddress(updatedData.companyAddress || "");
          setCompanyWebsite(updatedData.companyWebsite || "");
          setCommercialRole(updatedData.commercialRole || "");
          setEntityType(updatedData.entityType || "");
        }
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

  if (loading) {
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
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

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
            <label className={labelClass}>Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. My Company"
              required
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
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="https://company.com"
            />
          </div>
          {/* Update Button */}
          <div>
            <button
              onClick={handleUpdate}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors duration-200"
              disabled={!companyName.trim()}
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