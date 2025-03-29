import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function AddFacilityModal({ onClose, onFacilityAdded }) {
  // States for the dropdowns
  const [commercialRole, setCommercialRole] = useState("");
  const [entityType, setEntityType] = useState("");

  // For the "Individual Owner" multiple owners logic
  const [multipleOwners, setMultipleOwners] = useState("no");
  const [owners, setOwners] = useState([]);
  const [newOwner, setNewOwner] = useState({
    fullName: "",
    ownership: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  });

  // Add or update owners array
  const handleAddOwner = () => {
    if (!newOwner.fullName) return;
    setOwners([...owners, newOwner]);
    setNewOwner({
      fullName: "",
      ownership: "",
      email: "",
      phone: "",
      address: "",
      website: "",
    });
  };

  // Remove an owner from the list
  const handleRemoveOwner = (index) => {
    const updated = [...owners];
    updated.splice(index, 1);
    setOwners(updated);
  };

  const handleSubmit = () => {
    // Submit logic here if needed
    // Then call onFacilityAdded
    onFacilityAdded();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-[#039994] mb-4">
          Add Commercial Facility
        </h2>

        {/* Commercial Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commercial Role
          </label>
          <select
            value={commercialRole}
            onChange={(e) => setCommercialRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">Choose role</option>
            <option value="Owner">Owner</option>
            <option value="Operator">Operator</option>
            <option value="Both">Both</option>
          </select>
        </div>

        {/* Entity Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity Type
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">Choose type</option>
            <option value="Individual Owner">Individual Owner</option>
            <option value="Company Owner">Company Owner</option>
          </select>
        </div>

        {/* If "Company Owner", show simpler fields, else if "Individual Owner", show multiple owners logic */}
        {entityType === "Individual Owner" ? (
          // MULTIPLE OWNERS LOGIC
          <div>
            <h3 className="text-md font-semibold text-[#039994] mb-2">
              Primary owner
            </h3>
            {/* For example: Company’s name / phone / address / website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Company’s name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  placeholder="Full name"
                />
              </div>
              {/* Phone Number */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  placeholder="e.g. 000-0000-000"
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  placeholder="E.g. Street, City, County, State."
                />
              </div>
              {/* Website details */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Website details
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  placeholder="http://"
                />
              </div>
            </div>

            {/* Multiple Owners toggle */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm text-gray-700 font-medium">
                Multiple Owners?
              </span>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="multipleOwners"
                  value="yes"
                  checked={multipleOwners === "yes"}
                  onChange={() => setMultipleOwners("yes")}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="multipleOwners"
                  value="no"
                  checked={multipleOwners === "no"}
                  onChange={() => setMultipleOwners("no")}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>

            {/* If multipleOwners === "yes", show the owners list and add form */}
            {multipleOwners === "yes" && (
              <div className="border border-gray-300 rounded-md p-4 mb-4">
                {/* Existing owners list */}
                {owners.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {owners.map((owner, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F5F5F5] rounded-md px-3 py-2 flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {owner.fullName}
                        </span>
                        <button
                          onClick={() => handleRemoveOwner(idx)}
                          className="text-red-500 text-sm font-semibold"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New owner form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Full name */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={newOwner.fullName}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, fullName: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  {/* Ownership */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      % ownership
                    </label>
                    <input
                      type="text"
                      value={newOwner.ownership}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, ownership: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  {/* Email address */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={newOwner.email}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={newOwner.phone}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  {/* Address */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newOwner.address}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, address: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                  {/* Website */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={newOwner.website}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, website: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddOwner}
                  className="mt-3 bg-[#039994] text-white px-3 py-1 rounded-md text-sm"
                >
                  + Add Owner
                </button>
              </div>
            )}
          </div>
        ) : (
          // COMPANY OWNER or not chosen
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner’s full name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="Full name"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="Phone Number"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Address
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="E.g. Street, City, County, State."
            />
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Website details
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="http://"
            />
          </div>
        )}

        {/* Add Facility button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-[#039994] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#028c8c]"
        >
          Add Facility
        </button>
      </div>
    </div>
  );
}
