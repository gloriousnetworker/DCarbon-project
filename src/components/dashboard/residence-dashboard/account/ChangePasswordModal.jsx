"use client";
import React, { useState } from "react";

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Insert your change password logic here.
    console.log("Old Password:", oldPassword);
    console.log("New Password:", newPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-[#039994] mb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">
              Old Password
            </label>
            <input
              type="password"
              className="border w-full px-3 py-2 rounded focus:outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-2">
              New Password
            </label>
            <input
              type="password"
              className="border w-full px-3 py-2 rounded focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
