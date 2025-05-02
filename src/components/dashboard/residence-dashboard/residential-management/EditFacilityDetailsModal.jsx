import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  const [formData, setFormData] = useState({
    address: facility.address,
    utilityProvider: facility.utilityProvider,
    meterId: facility.meterId,
    status: facility.status,
    financeType: facility.financeType,
    financeCompany: facility.financeCompany,
    installer: facility.installer,
    zipCode: facility.zipCode,
    facilityName: facility.facilityName,
    commercialRole: facility.commercialRole,
    entityType: facility.entityType
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const { data } = await axios.put(
        `https://services.dcarbon.solutions/api/residential-facility/update-facility/${facility.id}`,
        formData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.status === "success") {
        toast.success("Facility updated successfully");
        onSave(data.data.facility);
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update facility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Facility Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Role</label>
              <select
                name="commercialRole"
                value={formData.commercialRole}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="producer">Residential</option>
                <option value="consumer">Owner</option>
                <option value="prosumer">Operator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="government">Government</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utility Provider</label>
              <input
                type="text"
                name="utilityProvider"
                value={formData.utilityProvider}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meter ID</label>
              <input
                type="text"
                name="meterId"
                value={formData.meterId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finance Type</label>
              <select
                name="financeType"
                value={formData.financeType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="owned">Owned</option>
                <option value="leased">Leased</option>
                <option value="ppa">PPA</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finance Company</label>
              <input
                type="text"
                name="financeCompany"
                value={formData.financeCompany}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installer</label>
              <input
                type="text"
                name="installer"
                value={formData.installer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#027a76] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}