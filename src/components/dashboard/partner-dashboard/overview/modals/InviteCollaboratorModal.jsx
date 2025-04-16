import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteCollaboratorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    inviteeEmail: "",
    role: "owner"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (!formData.inviteeEmail) {
      toast.error("Please enter an email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `https://dcarbon-server.onrender.com/api/user/invite-user/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Invitation sent successfully");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        {/* Modal Content */}
        <div className="flex flex-col items-center">
          {/* Vector Image */}
          <div className="flex justify-center mb-4">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Invite Collaborator"
              className="h-24 w-auto"
            />
          </div>

          <h2 className={`${pageTitle} text-center`}>Invite Collaborator</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Email Input */}
          <div>
            <label className={labelClass}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="inviteeEmail"
              value={formData.inviteeEmail}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter collaborator's email"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className={labelClass}>
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} flex items-center justify-center`}
              disabled={loading}
            >
              Invite Collaborator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
