"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const ContactInformation = () => {
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass = "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  const [isOpen, setIsOpen] = useState(true);
  const [ownerFullName, setOwnerFullName] = useState("");
  const [ownerWebsite, setOwnerWebsite] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [commercialRole, setCommercialRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);

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
          
          if (commercialUser.phoneNumber) {
            const phoneStr = commercialUser.phoneNumber.toString();
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

  if (loading) {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={sectionTitle}>Commercial Facility Owner Information</h2>
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
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Your Owner's Facility Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={ownerFullName}
              readOnly
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={ownerWebsite}
              readOnly
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <input
                type="text"
                value={phonePrefix}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
              <input
                type="tel"
                value={phoneNumber}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              value={ownerAddress}
              readOnly
              className={inputClass}
              style={inputStyle}
            />
          </div>
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
        </div>
      )}
    </div>
  );
};

export default ContactInformation;