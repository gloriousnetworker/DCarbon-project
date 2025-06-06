import React, { useState } from "react";
import FacilityTabs from "./FacilityTabs";
import FacilityCardView from "./ResidentialFacilityCardView";
import FacilityTableView from "./ResidentialFacilityTableView";
import FacilityDetails from "./ResidentialFacilityDetails";

// Modals
import AddResidentialFacilityModal from "./AddResidentialFacilityModal";
import FacilityCreatedModal from "./FacilityCreatedModal";
import FilterModal from "./FilterModal";

export default function FacilityManagement() {
  // Track which view is active: "cards" or "table"
  const [viewMode, setViewMode] = useState("cards");
  // Track which facility is selected to show details
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Sample data for facilities
  const facilitiesData = Array.from({ length: 12 }).map((_, i) => ({
    id: `FAC-${i + 1}`,
    ownerName: `Owner ${i + 1}`,
    operatorName: `User ${i + 1}`,
    utilityProvider: "Utility Provider",
    meterId: `Meter ${i + 1}`,
    address: "123 Street, City, State",
    dateCreated: "16-03-2025",
  }));

  // When a facility is clicked
  const handleSelectFacility = (facility) => {
    if (viewMode === "cards") {
      setViewMode("table");
    } else {
      setSelectedFacility(facility);
    }
  };

  // Track modals
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [showFacilityCreatedModal, setShowFacilityCreatedModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Called when "Add Residential Facility" is clicked in the tabs
  const handleOpenAddFacilityModal = () => {
    setShowAddFacilityModal(true);
  };

  // Called from the AddFacilityModal when facility is successfully added
  const handleFacilityAdded = () => {
    setShowAddFacilityModal(false);
    setShowFacilityCreatedModal(true);
  };

  // Called when user closes the "Facility Created" modal
  const handleCloseFacilityCreatedModal = () => {
    setShowFacilityCreatedModal(false);
  };

  // Called when the filter button is clicked
  const handleOpenFilterModal = () => {
    setShowFilterModal(true);
  };

  // Called when the user applies filters in the FilterModal
  const handleApplyFilter = (filters) => {
    console.log("Applied filters: ", filters);
    setShowFilterModal(false);
  };

  // If a facility is selected, only show the details view
  if (selectedFacility) {
    return (
      <div className="bg-white p-6 rounded-md shadow w-full min-h-screen">
        <FacilityDetails
          facility={selectedFacility}
          onBack={() => setSelectedFacility(null)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-md shadow w-full min-h-screen relative">
      {/* Main UI */}
      <FacilityTabs
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddFacility={handleOpenAddFacilityModal}
        onFilter={handleOpenFilterModal}
      />

      <hr className="my-4 border-gray-300" />

      {viewMode === "cards" ? (
        <FacilityCardView
          facilities={facilitiesData}
          onSelectFacility={handleSelectFacility}
        />
      ) : (
        <FacilityTableView
          facilities={facilitiesData}
          onSelectFacility={handleSelectFacility}
        />
      )}

      {/* Add Facility Modal */}
      {showAddFacilityModal && (
        <AddResidentialFacilityModal
          onClose={() => setShowAddFacilityModal(false)}
          onFacilityAdded={handleFacilityAdded}
        />
      )}

      {/* Facility Created Modal */}
      {showFacilityCreatedModal && (
        <FacilityCreatedModal onClose={handleCloseFacilityCreatedModal} />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}
    </div>
  );
}