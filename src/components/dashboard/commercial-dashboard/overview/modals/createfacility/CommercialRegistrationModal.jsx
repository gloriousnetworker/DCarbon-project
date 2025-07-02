import React, { useState, useEffect } from "react";
import OwnerDetailsModal from "./ownerRegistration/OwnerDetailsModal";
import OwnerAndOperatorDetailsModal from "./ownerAndOperatorRegistration/OwnerDetailsModal";
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";
import OwnerAndOperatorTermsAndAgreementModal from "./ownerAndOperatorRegistration/OwnerAndOperatorTermsAndAgreementModal";
import FinanceAndInstallerModal from "./ownerRegistration/FinanceAndInstallerModal";
import OperatorFinanceAndInstallerModal from "./ownerAndOperatorRegistration/FinanceAndInstallerModal";
import AddCommercialFacilityModal from "./ownerAndOperatorRegistration/AddCommercialFacilityModal";
import UtilityAuthorizationModal from "./ownerAndOperatorRegistration/UtilityAuthorizationModal";

export default function CommercialRegistrationModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState('Owner');
  const [currentModal, setCurrentModal] = useState(null);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [commercialData, setCommercialData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchCommercialData = async () => {
        setLoading(true);
        try {
          const userId = localStorage.getItem("userId");
          const authToken = localStorage.getItem("authToken");
          
          if (!userId || !authToken) {
            const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
            if (loginResponse?.data?.user?.id && loginResponse?.token) {
              const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${loginResponse.data.user.id}`, {
                headers: {
                  'Authorization': `Bearer ${loginResponse.token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                setCommercialData(data.data);
                setRegistrationStep(loginResponse?.data?.user?.registrationStep || 1);
                
                if (data.data?.commercialUser?.commercialRole === 'owner') {
                  setSelectedRole('Owner');
                } else if (data.data?.commercialUser?.commercialRole === 'both') {
                  setSelectedRole('Owner & Operator');
                }
              }
            }
          } else {
            const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setCommercialData(data.data);
              
              const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
              setRegistrationStep(loginResponse?.data?.user?.registrationStep || 1);
              
              if (data.data?.commercialUser?.commercialRole === 'owner') {
                setSelectedRole('Owner');
              } else if (data.data?.commercialUser?.commercialRole === 'both') {
                setSelectedRole('Owner & Operator');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching commercial data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCommercialData();
    }
  }, [isOpen]);

  const handleNext = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
    const step = loginResponse?.data?.user?.registrationStep || 1;

    if (selectedRole === 'Owner') {
      handleOwnerFlow(step);
    } else {
      handleOwnerOperatorFlow(step);
    }
  };

  const handleOwnerFlow = (step) => {
    switch(step) {
      case 1:
      case 2:
        setCurrentModal('ownerDetails');
        break;
      case 3:
        setCurrentModal('ownerTerms');
        break;
      case 4:
        setCurrentModal('utilityNotice');
        break;
      case 5:
        setCurrentModal('addFacility');
        break;
      default:
        setCurrentModal('ownerDetails');
    }
  };

  const handleOwnerOperatorFlow = (step) => {
    switch(step) {
      case 1:
      case 2:
        setCurrentModal('ownerOperatorDetails');
        break;
      case 3:
        setCurrentModal('ownerOperatorTerms');
        break;
      case 4:
        setCurrentModal('utilityAuthorization');
        break;
      case 5:
        setCurrentModal('addFacility');
        break;
      default:
        setCurrentModal('ownerOperatorDetails');
    }
  };

  const closeAllModals = () => {
    setCurrentModal(null);
    onClose();
  };

  const getHeaderTitle = () => {
    return selectedRole === 'Owner' ? "Owner's Registration" : "Owner & Operator Registration";
  };

  const getRoleDescription = (role) => {
    return role === 'Owner' 
      ? "Register as a facility owner only" 
      : "Register as both owner and operator";
  };

  const isRoleSelectionDisabled = () => {
    return commercialData?.commercialUser && (commercialData?.commercialUser?.ownerAddress || commercialData?.commercialUser?.commercialRole);
  };

  const isNextButtonDisabled = () => {
    return false;
  };

  const getCurrentRoleDisplay = () => {
    if (!commercialData?.commercialUser?.commercialRole) return '';
    
    const role = commercialData.commercialUser.commercialRole;
    if (role === 'both') return 'Owner & Operator';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleChangeRole = () => {
    if (commercialData?.commercialUser?.commercialRole === 'both') {
      setCurrentModal('ownerOperatorDetails');
    } else {
      setCurrentModal('ownerDetails');
    }
  };

  const renderCurrentModal = () => {
    switch(currentModal) {
      case 'ownerDetails':
        return <OwnerDetailsModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerOperatorDetails':
        return <OwnerAndOperatorDetailsModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerTerms':
        return <OwnerTermsAndAgreementModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerOperatorTerms':
        return <OwnerAndOperatorTermsAndAgreementModal isOpen={true} onClose={closeAllModals} />;
      case 'finance':
        return <FinanceAndInstallerModal isOpen={true} onClose={closeAllModals} />;
      case 'operatorFinance':
        return <OperatorFinanceAndInstallerModal isOpen={true} onClose={closeAllModals} />;
      case 'addFacility':
        return <AddCommercialFacilityModal isOpen={true} onClose={closeAllModals} />;
      case 'utilityAuthorization':
        return <UtilityAuthorizationModal isOpen={true} onClose={closeAllModals} />;
      case 'utilityNotice':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <button
                onClick={closeAllModals}
                className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="p-6">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-4">
                  Utility Authorization
                </h2>
                <p className="font-sfpro text-[14px] leading-[150%] text-gray-700 mb-6">
                  Your request for Utility Authorization by your Operator is in progress. You will be notified to continue once approved.
                </p>
                <button
                  onClick={closeAllModals}
                  className="w-full rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen && !currentModal) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
                  {getHeaderTitle()}
                </h2>

                <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                  <div className="h-1 bg-[#039994] rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="text-right mb-6">
                  <span className="text-[12px] font-medium text-gray-500 font-sfpro">01/04</span>
                </div>

                {loading && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                )}

                {!loading && commercialData?.commercialUser && (commercialData?.commercialUser?.commercialRole || commercialData?.commercialUser?.ownerAddress) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      {commercialData?.commercialUser?.commercialRole && (
                        <p className="font-sfpro font-[600] text-[14px] text-gray-700">
                          Current Role: <span className="capitalize">{getCurrentRoleDisplay()}</span>
                        </p>
                      )}
                      {commercialData?.commercialUser?.ownerAddress && (
                        <p className="font-sfpro text-[12px] text-gray-600 mt-1">
                          Owner Address: {commercialData?.commercialUser?.ownerAddress}
                        </p>
                      )}
                    </div>
                    {commercialData?.commercialUser?.commercialRole && (
                      <button
                        onClick={handleChangeRole}
                        className="mt-2 text-[#039994] text-xs font-medium underline hover:text-[#02857f]"
                      >
                        Change Role Details
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                    Commercial Role
                  </label>
                  
                  <div className="mb-3">
                    <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedRole === 'Owner' ? 'bg-white' : 'bg-[#F0F0F0]'
                    } ${
                      isRoleSelectionDisabled() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <div className="flex-1 pr-3">
                        <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                          Owner
                        </div>
                        {selectedRole === 'Owner' && (
                          <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                            {getRoleDescription('Owner')}
                          </div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="commercialRole"
                        value="Owner"
                        checked={selectedRole === 'Owner'}
                        onChange={(e) => !isRoleSelectionDisabled() && setSelectedRole(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                        disabled={isRoleSelectionDisabled()}
                      />
                    </label>
                  </div>

                  <div className="mb-6">
                    <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                      selectedRole === 'Owner & Operator' ? 'bg-white' : 'bg-[#F0F0F0]'
                    } ${
                      isRoleSelectionDisabled() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <div className="flex-1 pr-3">
                        <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                          Owner & Operator
                        </div>
                        {selectedRole === 'Owner & Operator' && (
                          <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                            {getRoleDescription('Owner & Operator')}
                          </div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="commercialRole"
                        value="Owner & Operator"
                        checked={selectedRole === 'Owner & Operator'}
                        onChange={(e) => !isRoleSelectionDisabled() && setSelectedRole(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                        disabled={isRoleSelectionDisabled()}
                      />
                    </label>
                  </div>

                  {!loading && isRoleSelectionDisabled() && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
                      Your commercial role is already set as {getCurrentRoleDisplay()} and cannot be changed.
                    </div>
                  )}

                  <button
                    onClick={handleNext}
                    disabled={loading || isNextButtonDisabled()}
                    className={`w-full rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${
                      loading || isNextButtonDisabled() 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#039994] hover:bg-[#02857f]'
                    }`}
                  >
                    {loading ? 'Loading...' : 'Next'}
                  </button>

                  <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                    <span>Terms and Conditions</span>
                    <span className="mx-2">&</span>
                    <span>Privacy Policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderCurrentModal()}
    </>
  );
}