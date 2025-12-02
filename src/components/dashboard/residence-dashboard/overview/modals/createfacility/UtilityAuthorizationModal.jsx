import React, { useState, useEffect } from "react";

export default function ResidentialFacilityModal({ isOpen, onClose }) {
  const [userFacilities, setUserFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingNewFacility, setCreatingNewFacility] = useState(false);
  const [userId, setUserId] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      setUserId(userId);
      setAuthToken(authToken);
      
      if (userId && authToken) {
        fetchUserFacilities(userId, authToken);
      }
    }
  }, [isOpen]);

  const fetchUserFacilities = async (userId, authToken) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      const facilities = data.data?.facilities || [];
      setUserFacilities(facilities);
      
      if (facilities.length > 0) {
        setSelectedFacility(facilities[0].id);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueRegistration = () => {
    const facility = userFacilities.find(f => f.id === selectedFacility);
    if (facility) {
      // Here you would handle continuing registration for the selected facility
      console.log('Continuing registration for facility:', facility);
      // This could open another modal or navigate to a different step
      onClose();
    }
  };

  const handleCreateNewFacility = () => {
    setCreatingNewFacility(true);
    // Here you would open the facility creation modal
    console.log('Opening new facility creation modal');
    // For now, just close this modal
    setTimeout(() => {
      setCreatingNewFacility(false);
      onClose();
    }, 1000);
  };

  const getFacilityStatusBadge = (status) => {
    const statusMap = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      'draft': { color: 'bg-blue-100 text-blue-800', label: 'Draft' }
    };
    
    const statusConfig = statusMap[status?.toLowerCase()] || statusMap['draft'];
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getUtilityTypeBadge = (utilityProvider) => {
    const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison', 'PG&E', 'SCE', 'SDG&E'];
    const isGreenButton = greenButtonUtilities.includes(utilityProvider);
    
    return isGreenButton ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Green Button
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        Standard
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-[#039994]/10 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans mb-1">
                Residential Facility Management
              </h2>
              <p className="text-sm text-gray-600 font-sans">
                Manage your existing facilities or create a new one
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your facilities...</p>
            </div>
          )}

          {/* Existing Facilities Section */}
          {!loading && userFacilities.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[600] text-[16px] text-gray-800 font-sans">
                  Your Existing Facilities ({userFacilities.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Select one to continue registration
                </div>
              </div>

              {/* Facility Selector */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-700 font-sans">
                    Select Facility
                  </label>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {userFacilities.map((facility) => (
                    <div 
                      key={facility.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedFacility === facility.id ? 'bg-[#039994]/5' : ''
                      }`}
                      onClick={() => setSelectedFacility(facility.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedFacility === facility.id ? 'bg-[#039994]' : 'bg-gray-300'
                            }`}></div>
                            <h4 className="font-medium text-gray-900 font-sans">
                              {facility.nickname || facility.facilityName || 'Unnamed Facility'}
                            </h4>
                          </div>
                          
                          <div className="ml-6 space-y-2">
                            {/* Facility Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {facility.address && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="truncate max-w-[200px]">{facility.address}</span>
                                </div>
                              )}
                              
                              {facility.utilityProvider && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                  </svg>
                                  <span>{facility.utilityProvider}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Status and Type Badges */}
                            <div className="ml-6 flex items-center gap-3">
                              {facility.status && getFacilityStatusBadge(facility.status)}
                              {facility.utilityProvider && getUtilityTypeBadge(facility.utilityProvider)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="ml-4">
                          {selectedFacility === facility.id && (
                            <div className="w-6 h-6 rounded-full bg-[#039994] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Registration Button */}
              <button
                onClick={handleContinueRegistration}
                disabled={!selectedFacility || creatingNewFacility}
                className={`w-full rounded-lg py-3 px-4 font-medium font-sans transition-all ${
                  !selectedFacility || creatingNewFacility
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#039994] hover:bg-[#02857f] text-white shadow-sm hover:shadow'
                }`}
              >
                Continue Registration with Selected Facility
              </button>
            </div>
          )}

          {/* Divider */}
          {!loading && userFacilities.length > 0 && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-sans">
                  OR
                </span>
              </div>
            </div>
          )}

          {/* Create New Facility Section */}
          <div className={`${userFacilities.length > 0 ? 'mt-6' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="font-[600] text-[16px] text-gray-800 font-sans mb-2">
                {userFacilities.length > 0 ? 'Create Another Facility' : 'Create Your First Facility'}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                Start the registration process for a new residential solar facility
              </p>
            </div>

            {/* New Facility Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#039994] hover:bg-[#039994]/5 transition-all group cursor-pointer"
                 onClick={handleCreateNewFacility}>
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#039994]/10 flex items-center justify-center mb-4 group-hover:bg-[#039994]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#039994]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                
                {/* Text Content */}
                <h4 className="font-[600] text-[18px] text-gray-900 font-sans mb-2">
                  Create New Residential Facility
                </h4>
                <p className="text-sm text-gray-600 mb-4 max-w-xs font-sans">
                  Register a new solar installation for your home. You'll need facility details and utility information.
                </p>
                
                {/* Button */}
                <button
                  onClick={handleCreateNewFacility}
                  disabled={creatingNewFacility}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium font-sans transition-all ${
                    creatingNewFacility
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white hover:shadow'
                  }`}
                >
                  {creatingNewFacility ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Start New Registration
                    </>
                  )}
                </button>
                
                {/* Steps Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                  <p className="text-xs text-gray-500 font-sans mb-2">
                    Registration includes:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Facility Details
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Utility Setup
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Financial Info
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No Facilities State */}
          {!loading && userFacilities.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="font-[600] text-[16px] text-gray-800 font-sans mb-2">
                No Facilities Yet
              </h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 font-sans">
                You haven't registered any residential facilities yet. Create your first facility to get started with solar management.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-sans">
              Need help? Contact support@dcarbon.solutions
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-sans">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Help</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
