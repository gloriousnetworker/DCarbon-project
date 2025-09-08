import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function ReminderModal({ isOpen, onClose }) {
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [formData, setFormData] = useState({
    reason: "Operator Registration Reminder",
    description: "Please complete your operator registration"
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOperatorData();
    }
  }, [isOpen]);

  const fetchOperatorData = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    setFetching(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-operators/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success" && response.data.data.length > 0) {
        setOperators(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching operator data:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleOperatorSelect = (email) => {
    setSelectedOperator(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      reason: "Operator Registration Reminder",
      description: "Please complete your operator registration"
    });
    setSelectedOperator("");
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

    if (!selectedOperator) {
      toast.error("Please select an operator");
      setLoading(false);
      return;
    }

    const payload = {
      emails: [selectedOperator],
      reason: formData.reason,
      description: formData.description
    };

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/operator-reminders/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Reminder sent successfully");
        resetForm();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send reminder"
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

        {(loading || fetching) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Pending Operator Utility Authorization</h3>
                <p className="text-xs text-yellow-700 mt-1">This facility is currently owner-only. Send a reminder to the operator to complete their authorization.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Send Reminder"
              className="h-16 w-auto"
            />
          </div>

          <h2 className={`text-base font-semibold ${pageTitle} text-center`}>Send Reminder to Operator</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 mt-3">
          <div>
            <label className={`${labelClass} text-xs`}>Select Operator</label>
            <select
              value={selectedOperator}
              onChange={(e) => handleOperatorSelect(e.target.value)}
              className={`${selectClass} text-xs`}
              required
            >
              <option value="">Select an operator</option>
              {operators.map((operator, index) => (
                <option key={index} value={operator.inviteeEmail}>
                  {operator.name} ({operator.inviteeEmail})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              required
            />
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass} text-xs h-16 resize-none`}
              required
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading || fetching}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} flex items-center justify-center py-1 text-xs`}
              disabled={loading || fetching || !selectedOperator}
            >
              Send Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}