import React, { useState, useEffect } from "react";

export default function ResidentialFacilityModal({ isOpen, onClose, currentStep }) {
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
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.status === 'success' && data.data?.facilities) {
        const facilities = data.data.facilities;
        setUserFacilities(facilities);
        if (facilities.length > 0) {
          setSelectedFacility(facilities[0].id);
        }
      } else {
        setUserFacilities([]);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setUserFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueRegistration = () => {
    const facility = userFacilities.find(f => f.id === selectedFacility);
    if (facility) {
      onClose();
    }
  };

  const handleCreateNewFacility = () => {
    setCreatingNewFacility(true);
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

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your facilities...</p>
            </div>
          )}

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

              <div className="mb-6">
                <select 
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm font-sans focus:ring-2 focus:ring-[#039994] focus:border-[#039994] outline-none"
                >
                  {userFacilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.facilityName || 'Residential Facility'} - {facility.utilityProvider} ({facility.status})
                    </option>
                  ))}
                </select>

                {selectedFacility && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {userFacilities.map((facility) => {
                      if (facility.id === selectedFacility) {
                        return (
                          <div key={facility.id}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Facility Name</p>
                                <p className="text-sm font-medium text-gray-800">{facility.facilityName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Utility Provider</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-800">{facility.utilityProvider}</p>
                                  {getUtilityTypeBadge(facility.utilityProvider)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                  {getFacilityStatusBadge(facility.status)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Finance Type</p>
                                <p className="text-sm font-medium text-gray-800">{facility.financeType}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Address</p>
                                <p className="text-sm font-medium text-gray-800">{facility.address}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Installation Date</p>
                                <p className="text-sm font-medium text-gray-800">
                                  {new Date(facility.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Meter ID</p>
                                <p className="text-sm font-medium text-gray-800">{facility.meterId}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

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

          <div className={`${userFacilities.length > 0 ? 'mt-6' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="font-[600] text-[16px] text-gray-800 font-sans mb-2">
                {userFacilities.length > 0 ? 'Create Another Facility' : 'Create Your First Facility'}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                Start the registration process for a new residential solar facility
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#039994] hover:bg-[#039994]/5 transition-all group cursor-pointer"
                 onClick={handleCreateNewFacility}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#039994]/10 flex items-center justify-center mb-4 group-hover:bg-[#039994]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#039994]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                
                <h4 className="font-[600] text-[18px] text-gray-900 font-sans mb-2">
                  Create New Residential Facility
                </h4>
                <p className="text-sm text-gray-600 mb-4 max-w-xs font-sans">
                  Register a new solar installation for your home. You'll need facility details and utility information.
                </p>
                
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
