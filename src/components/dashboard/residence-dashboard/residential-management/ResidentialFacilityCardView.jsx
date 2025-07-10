import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./ResidentialFacilityDetails";
import ConfirmationModal from "./ConfirmationModal";

export default function FacilityCardView() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    utility: "All",
    meterId: "",
    status: "All",
    createdDate: "",
    financeType: "All",
    installer: "All"
  });
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFacilities = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.status === "success") {
        const formattedFacilities = data.data.facilities.map(facility => ({
          ...facility,
          meterId: facility.meterId.split('_')[0] || facility.meterId
        }));
        setFacilities(formattedFacilities);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleApplyFilter = newFilters => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete) return;
    
    setIsDeleting(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const { data } = await axios.delete(
        `https://services.dcarbon.solutions/api/residential-facility/${facilityToDelete.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.status === "success") {
        toast.success("Facility deleted successfully");
        setFacilityToDelete(null);
        fetchFacilities();
        if (selectedFacility?.id === facilityToDelete.id) {
          setSelectedFacility(null);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete facility");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFacilities = facilities
    .filter(f => {
      if (filters.name && !f.address.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.utility !== "All" && f.utilityProvider !== filters.utility) return false;
      if (filters.meterId && !f.meterId.toLowerCase().includes(filters.meterId.toLowerCase())) return false;
      if (filters.status !== "All" && f.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters.createdDate) {
        const d = new Date(f.createdAt).toISOString().slice(0, 10);
        if (d !== filters.createdDate) return false;
      }
      if (filters.financeType !== "All" && f.financeType.toLowerCase() !== filters.financeType.toLowerCase()) return false;
      if (filters.installer !== "All" && f.installer.toLowerCase() !== filters.installer.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (selectedFacility) {
    return (
      <div className="p-2">
        <FacilityDetails
          facility={selectedFacility}
          onBack={() => setSelectedFacility(null)}
          onFacilityUpdated={(updatedFacility) => {
            setFacilities(prev => prev.map(f => 
              f.id === updatedFacility.id ? updatedFacility : f
            ));
            setSelectedFacility(updatedFacility);
          }}
          onDelete={async () => {
            try {
              const authToken = localStorage.getItem("authToken");
              await axios.delete(
                `https://services.dcarbon.solutions/api/residential-facility/${selectedFacility.id}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
              );
              toast.success("Facility deleted successfully");
              setSelectedFacility(null);
              fetchFacilities();
            } catch (err) {
              toast.error(err.message || "Failed to delete facility");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: "#039994" }}>
          Residential Facilities
        </h2>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-3 py-1 border border-[#039994] text-[#039994] text-sm rounded hover:bg-[#03999421]"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No facilities found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFacilities.map(facility => (
            <div
              key={facility.id}
              className="border border-[#039994] rounded-lg bg-white hover:shadow transition-shadow flex flex-col justify-between p-2"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base text-[#039994]">
                    {facility.address}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFacilityToDelete(facility);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="font-medium">Utility:</span>
                  <span>{facility.utilityProvider}</span>

                  <span className="font-medium">Installer:</span>
                  <span>{facility.installer}</span>

                  <span className="font-medium">Finance Type:</span>
                  <span className="capitalize">{facility.financeType}</span>

                  <span className="font-medium">Finance Company:</span>
                  <span>{facility.financeCompany}</span>

                  <span className="font-medium">Meter ID:</span>
                  <span>{facility.meterId}</span>

                  <span className="font-medium">Zip Code:</span>
                  <span>{facility.zipCode}</span>

                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{facility.status}</span>

                  <span className="font-medium">Created:</span>
                  <span>{formatDate(facility.createdAt)}</span>
                </div>
              </div>
              <div
                onClick={() => setSelectedFacility(facility)}
                className="flex items-center justify-between mt-2 px-1 py-1 cursor-pointer"
                style={{ backgroundColor: "#069B9621" }}
              >
                <span className="text-[#039994] text-xs font-medium">
                  View details
                </span>
                <FiChevronRight size={16} className="text-[#039994]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}

      {facilityToDelete && (
        <ConfirmationModal
          isOpen={!!facilityToDelete}
          onClose={() => setFacilityToDelete(null)}
          onConfirm={handleDeleteFacility}
          title="Confirm Delete"
          message={`Are you sure you want to delete the facility at ${facilityToDelete.address}?`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}