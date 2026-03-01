import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  labelClass,
  selectClass,
  inputClass,
  buttonPrimary,
  pageTitle,
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";
import { axiosInstance } from "../../../../../lib/config";

export default function AddFacilityModal({ onClose, onFacilityAdded }) {
  const [formData, setFormData] = useState({
    facilityName: "",
    address: "",
    utilityProvider: "",
    meterId: "",
    commercialRole: "",
    entityType: "company",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error("User authentication required");
        return;
      }

      const requestBody = {
        facilityName: formData.facilityName,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterId: formData.meterId,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType,
      };

      const response = await axiosInstance({
        method: "POST",
        url: `/api/facility/create-new-facility/${userId}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: JSON.stringify(requestBody),
      });

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || "Failed to create facility");
      }

      const data = response.data;
      toast.success("Facility added successfully");
      onFacilityAdded(data.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create facility");
      console.error("Error creating facility:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
            <Loader />
          </div>
        )}
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        <h2 className={`${pageTitle} text-left mb-6`}>
          Add Commercial Facility
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClass}>
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility name"
              required
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street, City, County, State"
              required
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Utility Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              placeholder="Utility company name"
              required
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Meter identification number"
              required
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="">Choose role</option>
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          <button
            type="submit"
            className={`${buttonPrimary} mt-6 w-full`}
            disabled={loading}
          >
            Add Facility
          </button>
        </form>
      </div>
    </div>
  );
}