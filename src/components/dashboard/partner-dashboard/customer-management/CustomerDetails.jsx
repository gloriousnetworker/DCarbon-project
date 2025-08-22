import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineArrowLeft, HiOutlineInformationCircle } from 'react-icons/hi';
import { FiChevronRight } from 'react-icons/fi';
import CommercialFacilityDetails from './commercial-details/CommercialFacilityDetails';
import ResidentialFacilityDetails from './residential-details/ResidentialFacilityDetails';

const mainContainer = "w-full min-h-screen bg-white p-4 md:p-8";
const headingContainer = "flex items-center mb-6";
const backArrow = "mr-4 cursor-pointer text-[#039994]";
const pageTitle = "text-2xl font-bold text-[#039994]";
const progressContainer = "w-full max-w-3xl mb-4";
const progressBarWrapper = "w-full h-2 bg-gray-200 rounded-full overflow-hidden";
const progressBarActive = "h-full bg-[#039994] rounded-full";
const progressStepText = "text-xs text-[#626060]";
const buttonPrimary = "bg-[#039994] text-white rounded-md hover:bg-[#02827D] transition-colors";

const progressSteps = [
  { label: 'Invitation sent', color: '#000000' },
  { label: 'Documents Pending', color: '#FFB200' },
  { label: 'Documents Rejected', color: '#7CABDE' },
  { label: 'Registration Complete', color: '#056C69' },
  { label: 'Active', color: '#00B4AE' },
  { label: 'Terminated', color: '#FF0000' },
];

export default function CustomerDetails({ customer, onBack }) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilityProgress, setFacilityProgress] = useState({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [commercialUserDetails, setCommercialUserDetails] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isCommercialUser, setIsCommercialUser] = useState(false);

  const fetchCommercialUserDetails = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setCommercialUserDetails(result.data.commercialUser);
      }
    } catch (error) {
      console.error('Error fetching commercial user details:', error);
    }
  };

  const checkStage2CompletionCommercial = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
    } catch (error) {
      return false;
    }
  };

  const checkStage3CompletionCommercial = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/agreement/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4CompletionCommercial = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/financial-info/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage5CompletionCommercial = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/auth/user-meters/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      return false;
    }
  };

  const checkStage6CompletionCommercial = (facility) => {
    return facility.status && facility.status.toLowerCase() === 'verified';
  };

  const checkStage2CompletionResidential = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage3CompletionResidential = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4CompletionResidential = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkStage5CompletionResidential = (facility) => {
    return facility.status && facility.status.toLowerCase() === 'verified';
  };

  const checkUserProgressCommercial = async () => {
    try {
      setIsLoadingProgress(true);
      const authToken = localStorage.getItem('authToken');
      const userId = customerDetails.id;
      if (!userId || !authToken) return;

      const newCompletedStages = [1];
      let highestCompletedStage = 1;

      const stage2Completed = await checkStage2CompletionCommercial(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        highestCompletedStage = 2;
      }

      const stage3Completed = await checkStage3CompletionCommercial(userId, authToken);
      if (stage3Completed) {
        newCompletedStages.push(3);
        highestCompletedStage = 3;
      }

      const stage4Completed = await checkStage4CompletionCommercial(userId, authToken);
      if (stage4Completed) {
        newCompletedStages.push(4);
        highestCompletedStage = 4;
      }

      const stage5Completed = await checkStage5CompletionCommercial(userId, authToken);
      if (stage5Completed) {
        newCompletedStages.push(5);
        highestCompletedStage = 5;
      }

      const progressData = {};
      facilities.forEach(facility => {
        const facilityCompletedStages = [...newCompletedStages];
        let facilityCurrentStage = highestCompletedStage;

        const stage6Completed = checkStage6CompletionCommercial(facility);
        if (stage6Completed) {
          facilityCompletedStages.push(6);
          facilityCurrentStage = 6;
        } else if (facilityCurrentStage === 5) {
          facilityCurrentStage = 6;
        }

        progressData[facility.id] = {
          completedStages: facilityCompletedStages,
          currentStage: facilityCurrentStage
        };
      });

      setFacilityProgress(progressData);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const checkUserProgressResidential = async () => {
    try {
      setIsLoadingProgress(true);
      const authToken = localStorage.getItem('authToken');
      const userId = customerDetails.id;

      if (!userId || !authToken) return;

      const newCompletedStages = [1];
      let highestCompletedStage = 1;

      const stage2Completed = await checkStage2CompletionResidential(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        highestCompletedStage = 2;
      }

      const stage3Completed = await checkStage3CompletionResidential(userId, authToken);
      if (stage3Completed) {
        newCompletedStages.push(3);
        highestCompletedStage = 3;
      }

      const stage4Completed = await checkStage4CompletionResidential(userId, authToken);
      if (stage4Completed) {
        newCompletedStages.push(4);
        highestCompletedStage = 4;
      }

      const progressData = {};
      facilities.forEach(facility => {
        const facilityCompletedStages = [...newCompletedStages];
        let facilityCurrentStage = highestCompletedStage;

        const stage5Completed = checkStage5CompletionResidential(facility);
        if (stage5Completed) {
          facilityCompletedStages.push(5);
          facilityCurrentStage = 5;
        } else if (facilityCurrentStage === 4) {
          facilityCurrentStage = 5;
        }

        progressData[facility.id] = {
          completedStages: facilityCompletedStages,
          currentStage: facilityCurrentStage < 5 ? facilityCurrentStage + 1 : 5
        };
      });

      setFacilityProgress(progressData);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const fetchCommercialFacilities = async (userId) => {
    const authToken = localStorage.getItem('authToken');
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.status === "success") {
        setFacilities(data.data.facilities);
      }
    } catch (err) {
      console.error('Failed to load commercial facilities');
    }
  };

  const fetchResidentialFacilities = async (userId) => {
    const authToken = localStorage.getItem('authToken');
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
      }
    } catch (err) {
      console.error('Failed to load residential facilities');
    }
  };

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const email = customer.inviteeEmail || customer.email;
        if (!email) throw new Error('No email for customer');
        
        const { data } = await axios.get(
          `https://services.dcarbon.solutions/api/user/partner/details/${email}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (data.status === 'success') {
          setCustomerDetails(data.data);
          setIsCommercialUser(data.data.userType.toLowerCase() === 'commercial');
          
          if (data.data.userType.toLowerCase() === 'commercial') {
            await fetchCommercialUserDetails(data.data.id);
            await fetchCommercialFacilities(data.data.id);
          } else if (data.data.userType.toLowerCase() === 'residential') {
            await fetchResidentialFacilities(data.data.id);
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setUserNotFound(true);
        } else {
          setError(err.message || 'Failed to load');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customer]);

  useEffect(() => {
    if (facilities.length > 0 && customerDetails) {
      if (customerDetails.userType.toLowerCase() === 'commercial') {
        checkUserProgressCommercial();
      } else if (customerDetails.userType.toLowerCase() === 'residential') {
        checkUserProgressResidential();
      }
    }
  }, [facilities, customerDetails]);

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMeterIds = meterIds => {
    if (!meterIds || meterIds.length === 0) return "N/A";
    return meterIds.map(id => id.split('_')[0] || id).join(', ');
  };

  const getCircleProgressSegmentsCommercial = (facilityId) => {
    const progress = facilityProgress[facilityId] || { completedStages: [1], currentStage: 2 };
    const segments = [];
    
    for (let i = 1; i <= 6; i++) {
      segments.push(
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            progress.completedStages.includes(i) ? "bg-[#039994] border-[#039994]" : 
            i === progress.currentStage ? "border-[#039994] bg-white" : "border-gray-300 bg-white"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              progress.completedStages.includes(i) ? "bg-white" : "bg-gray-300"
            }`}
          />
        </div>
      );
    }
    return segments;
  };

  const getProgressSegmentsResidential = (facilityId) => {
    const progress = facilityProgress[facilityId] || { completedStages: [1], currentStage: 2 };
    
    return [1, 2, 3, 4, 5].map((stage) => (
      <div key={stage} className="flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 text-xs ${
            progress.completedStages.includes(stage)
              ? "bg-[#039994] border-[#039994] text-white"
              : stage === progress.currentStage
              ? "border-[#039994] text-[#039994]"
              : "border-gray-300 text-gray-400"
          }`}
        >
          {stage}
        </div>
      </div>
    ));
  };

  const progressPercent = 40;

  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
  };

  const handleBackFromFacility = () => {
    setSelectedFacility(null);
  };

  if (loading) {
    return (
      <div className={`${mainContainer} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]" />
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className={`${mainContainer} flex flex-col items-center justify-center`}>
        <div className="bg-[#069B960D] border border-[#039994] rounded-lg p-8 max-w-lg text-center">
          <div className="text-4xl mb-4 text-[#039994]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">User Not Found</h2>
          <p className="text-[#626060] mb-6">
            This user has not been registered with DCarbon. You can send them a reminder to complete their registration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={onBack} 
              className="border border-[#039994] text-[#039994] px-6 py-2 rounded-md hover:bg-[#069B960D] transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customerDetails) {
    return (
      <div className={`${mainContainer} flex flex-col items-center justify-center`}>
        <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-6 max-w-lg text-center">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Failed to load customer details'}
          </div>
          <p className="text-gray-600 mb-4">
            There was a problem loading the customer information. Please try again or contact support.
          </p>
        </div>
        <button onClick={onBack} className={`${buttonPrimary} px-4 py-2`}>
          Back to List
        </button>
      </div>
    );
  }

  if (selectedFacility) {
    return isCommercialUser ? (
      <CommercialFacilityDetails 
        facility={selectedFacility} 
        onBack={handleBackFromFacility} 
      />
    ) : (
      <ResidentialFacilityDetails 
        facility={selectedFacility} 
        customerEmail={customerDetails.email}
        onBack={handleBackFromFacility} 
      />
    );
  }

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <div className={backArrow} onClick={onBack}>
          <HiOutlineArrowLeft size={24} />
        </div>
        <h1 className={pageTitle}>Customer Details</h1>
      </div>

      <div className={progressContainer}>
        <div className={progressBarWrapper}>
          <div
            className={progressBarActive}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center space-x-4 mb-8">
        {progressSteps.map(s => (
          <div key={s.label} className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className={progressStepText}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full border border-[#039994] bg-[#069B960D] rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          <div className="font-medium text-[#626060]">User ID</div>
          <div className="text-[#1E1E1E]">{customerDetails.id}</div>
          <div className="font-medium text-[#626060]">Name</div>
          <div className="text-[#1E1E1E]">{customerDetails.firstName} {customerDetails.lastName}</div>
          <div className="font-medium text-[#626060]">Email Address</div>
          <div className="text-[#1E1E1E]">{customerDetails.email}</div>
          <div className="font-medium text-[#626060]">Phone Number</div>
          <div className="text-[#1E1E1E]">{customerDetails.phoneNumber}</div>
          <div className="font-medium text-[#626060]">Customer Type</div>
          <div className="text-[#1E1E1E]">{customerDetails.userType}</div>
          
          {isCommercialUser && commercialUserDetails && (
            <>
              <div className="font-medium text-[#626060]">Commercial Role</div>
              <div className="text-[#1E1E1E] capitalize">{commercialUserDetails.commercialRole}</div>
              
              <div className="font-medium text-[#626060]">Entity Type</div>
              <div className="text-[#1E1E1E] capitalize">{commercialUserDetails.entityType}</div>
              
              <div className="font-medium text-[#626060]">Owner Full Name</div>
              <div className="text-[#1E1E1E]">{commercialUserDetails.ownerFullName}</div>
              
              <div className="font-medium text-[#626060]">Owner Address</div>
              <div className="text-[#1E1E1E]">{commercialUserDetails.ownerAddress}</div>
              
              <div className="font-medium text-[#626060]">Company Name</div>
              <div className="text-[#1E1E1E]">{commercialUserDetails.companyName || "N/A"}</div>
              
              <div className="font-medium text-[#626060]">Company Address</div>
              <div className="text-[#1E1E1E]">{commercialUserDetails.companyAddress || "N/A"}</div>
            </>
          )}
        </div>
      </div>

      <h2 className="mb-2 font-[600] text-[20px] text-[#039994]">
        {isCommercialUser ? 'My Facilities' : 'Solar System Management'}
      </h2>
      <hr className="w-full mb-6" />

      {isLoadingProgress ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]" />
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No facilities found
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {facilities.map(facility => {
            const progress = facilityProgress[facility.id] || { completedStages: [1], currentStage: 2 };
            
            return (
              <div
                key={facility.id}
                className="border border-[#039994] rounded-lg bg-white hover:shadow transition-shadow flex flex-col justify-between p-4 cursor-pointer"
                onClick={() => handleFacilityClick(facility)}
              >
                <div>
                  <h3 className="font-semibold text-base text-[#039994] mb-1">
                    {facility.facilityName}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span className="font-medium">Email:</span>
                    <span>{customerDetails.email}</span>
                    
                    {isCommercialUser ? (
                      <>
                        <span className="font-medium">Role:</span>
                        <span className="capitalize">{facility.commercialRole}</span>

                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{facility.entityType}</span>

                        <span className="font-medium">Utility:</span>
                        <span>{facility.utilityProvider}</span>

                        <span className="font-medium">Meter ID:</span>
                        <span>{formatMeterIds(facility.meterIds)}</span>

                        <span className="font-medium">Status:</span>
                        <span className="capitalize">{facility.status}</span>

                        <span className="font-medium">Created:</span>
                        <span>{formatDate(facility.createdAt)}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Address:</span>
                        <span>{facility.address || "N/A"}</span>

                        <span className="font-medium">Utility:</span>
                        <span>{facility.utilityProvider || "N/A"}</span>

                        <span className="font-medium">Installer:</span>
                        <span>{facility.installer || "N/A"}</span>

                        <span className="font-medium">Finance Type:</span>
                        <span className="capitalize">{facility.financeType || "N/A"}</span>

                        <span className="font-medium">Meter ID:</span>
                        <span>{facility.meterId || "N/A"}</span>

                        <span className="font-medium">Status:</span>
                        <span className="capitalize">{facility.status || "N/A"}</span>

                        <span className="font-medium">Created:</span>
                        <span>{formatDate(facility.createdAt)}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {isCommercialUser ? 'Progress' : 'Onboarding Progress'}
                      </span>
                      <span className="text-xs font-medium text-[#039994]">
                        {isCommercialUser ? `Step ${progress.currentStage} of 6` : `Stage ${progress.currentStage} of 5`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {isCommercialUser ? getCircleProgressSegmentsCommercial(facility.id) : getProgressSegmentsResidential(facility.id)}
                    </div>
                    {!isCommercialUser && (
                      <div className="flex justify-between px-1 mt-1">
                        {[1, 2, 3, 4].map((stage) => (
                          <div
                            key={stage}
                            className={`h-0.5 flex-1 mx-1 ${
                              progress.completedStages.includes(stage + 1) ? "bg-[#039994]" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center justify-between mt-2 px-1 py-1"
                  style={{ backgroundColor: "#069B9621" }}
                >
                  <span className="text-[#039994] text-xs font-medium">
                    View details
                  </span>
                  <FiChevronRight size={16} className="text-[#039994]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="w-full flex justify-end mt-8">
        <button onClick={onBack} className={`${buttonPrimary} w-auto px-6 py-2`}>
          Back to List
        </button>
      </div>
    </div>
  );
}