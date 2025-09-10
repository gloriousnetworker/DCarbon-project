import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteInstallerModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
    installerId: ""
  });
  const [loading, setLoading] = useState(false);
  const [epcMode, setEpcMode] = useState(false);
  const [installers, setInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);

  useEffect(() => {
    if (isOpen && epcMode) {
      fetchInstallers();
    }
  }, [isOpen, epcMode]);

  const fetchInstallers = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setInstallersLoading(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-users-referrals/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        const filteredInstallers = response.data.data.referrals.filter(
          referral => 
            referral.customerType === "PARTNER" &&
            referral.role === "INSTALLER" &&
            referral.status === "ACCEPTED"
        );
        setInstallers(filteredInstallers);
      }
    } catch (error) {
      console.error("Error fetching installers:", error);
      toast.error("Failed to load installers");
    } finally {
      setInstallersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = value;

    if (value.length > 3 && value.length <= 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }

    setFormData(prev => ({
      ...prev,
      phoneNumber: formattedValue
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
      installerId: ""
    });
    setEpcMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    const { name, email, phoneNumber, message, installerId } = formData;

    if (!email) {
      toast.error("Please enter an email address");
      setLoading(false);
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    if (epcMode && !installerId) {
      toast.error("Please select an installer for EPC mode");
      setLoading(false);
      return;
    }

    const payload = {
      invitees: [
        {
          name,
          email,
          phoneNumber,
          customerType: "PARTNER",
          role: "INSTALLER",
          ...(message && { message }),
          ...(epcMode && installerId && { installerId })
        }
      ]
    };

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success(epcMode ? "Installer invitation with EPC mode sent successfully" : "Installer invitation sent successfully");
        resetForm();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 overflow-y-auto">
      <div className="relative bg-white p-5 rounded-lg w-full max-w-md text-sm max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Invite Installer"
              className="h-16 w-auto"
            />
          </div>

          <h2 className={`text-base font-semibold ${pageTitle} text-center ${epcMode ? "text-green-600" : ""}`}>
            {epcMode ? "EPC MODE ACTIVATED" : "Invite an Installer"}
          </h2>
          
          {epcMode && (
            <p className="text-gray-500 text-xs text-center mt-1">
              Select an installer to attach to your customer for registration assistance
            </p>
          )}
        </div>

        <div className="flex items-center justify-center my-4">
          <label className="flex items-center cursor-pointer">
            <div className="mr-3 text-xs font-medium text-gray-700">
              EPC Mode
            </div>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={epcMode}
                onChange={() => setEpcMode(!epcMode)}
              />
              <div className={`w-14 h-7 rounded-full ${epcMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${epcMode ? 'transform translate-x-7' : ''}`}></div>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 mt-3">
          <div>
            <label className={`${labelClass} text-xs`}>Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter installer's name"
              required
            />
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter installer's email"
              required
            />
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Phone Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className={`${inputClass} text-xs`}
              placeholder="(555) 555-5555"
              required
            />
          </div>

          {epcMode && (
            <div>
              <label className={`${labelClass} text-xs`}>Select Installer <span className="text-red-500">*</span></label>
              {installersLoading ? (
                <div className="flex justify-center">
                  <Loader size="small" />
                </div>
              ) : (
                <select
                  name="installerId"
                  value={formData.installerId}
                  onChange={handleChange}
                  className={`${selectClass} text-xs`}
                  required={epcMode}
                >
                  <option value="">Select an installer</option>
                  {installers.map((installer) => (
                    <option key={installer.id} value={installer.id}>
                      {installer.name || installer.inviteeEmail}
                    </option>
                  ))}
                </select>
              )}
              {installers.length === 0 && !installersLoading && (
                <p className="text-red-500 text-xs mt-1">No registered installers found</p>
              )}
            </div>
          )}

          <div>
            <label className={`${labelClass} text-xs`}>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} text-xs h-16 resize-none`}
              placeholder="Add a custom message (optional)"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} ${epcMode ? "bg-green-600 hover:bg-green-700" : ""} flex items-center justify-center py-1 text-xs`}
              disabled={loading || (epcMode && installers.length === 0)}
            >
              {epcMode ? "Invite Installer by EPC Mode" : "Invite Installer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}