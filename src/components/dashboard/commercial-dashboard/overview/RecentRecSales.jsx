import React, { useState, useEffect } from "react";
import { mainContainer, pageTitle, selectClass } from "./styles";

export default function UserFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId and authToken from local storage
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    if (storedUserId) {
      fetchUserFacilities(storedUserId);
    }
  }, []);

  const fetchUserFacilities = async (userId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFacilities(data.data.facilities);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${mainContainer} bg-white rounded-md shadow p-4`}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-gray-500">Loading facilities...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${mainContainer} bg-white rounded-md shadow p-4`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow p-4 w-full">
      {/* Heading Section - Aligned left */}
      <div className="mb-4">
        <h3 className={`${pageTitle} text-[#039994] text-left`}>
          My Facilities
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-black">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-3 px-3 font-semibold">Facility Name</th>
              <th className="py-3 px-3 font-semibold">Address</th>
              <th className="py-3 px-3 font-semibold">Utility Provider</th>
              <th className="py-3 px-3 font-semibold">Meter ID</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">RECs Generated</th>
              <th className="py-3 px-3 font-semibold">Energy Produced (MWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {facilities.length > 0 ? (
              facilities.map((facility) => (
                <tr key={facility.id}>
                  <td className="py-3 px-3">{facility.facilityName || "-"}</td>
                  <td className="py-3 px-3">{facility.address || "-"}</td>
                  <td className="py-3 px-3">{facility.utilityProvider || "-"}</td>
                  <td className="py-3 px-3">{facility.meterId || "-"}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      facility.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {facility.status || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="py-3 px-3">{facility.recGenerated || "0"}</td>
                  <td className="py-3 px-3">{facility.energyProduced || "0"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No facilities found for this user
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}