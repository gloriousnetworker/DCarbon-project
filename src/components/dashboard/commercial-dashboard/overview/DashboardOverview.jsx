// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import CommercialRegistrationModal from "./modals/createfacility/CommercialRegistrationModal";

// const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
// const Graph = dynamic(() => import("./Graph"), { ssr: false });
// const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
// const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });

// const ProgressTracker = ({ currentStage, onStageClick }) => {
//   const stages = [
//     { id: 1, name: "App Registration", tooltip: "Account creation completed" },
//     { id: 2, name: "Solar Install Details", tooltip: "Owner details and address completed" },
//     { id: 3, name: "DCarbon Service Agreements", tooltip: "Terms and conditions signed" },
//     { id: 4, name: "Utility Authorization", tooltip: "Financial information submitted" },
//     { id: 5, name: "Utility Meter Selection", tooltip: "Utility meters connected" }
//   ];

//   const currentDisplayStage = currentStage > 5 ? 5 : currentStage;

//   const handleClick = (stageId) => {
//     if (stageId < currentDisplayStage) return;
//     onStageClick(stageId);
//   };

//   const isClickable = (stageId) => {
//     return stageId >= currentDisplayStage;
//   };

//   const isCompleted = (stageId) => {
//     return stageId < currentDisplayStage;
//   };

//   return (
//     <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
//         <span className="text-sm font-medium text-[#039994]">
//           Stage {currentDisplayStage} of {stages.length}
//         </span>
//       </div>
//       <div className="relative">
//         <div className="flex justify-between mb-2">
//           {stages.map((stage) => (
//             <div 
//               key={stage.id} 
//               className={`flex flex-col items-center group relative ${isClickable(stage.id) ? 'cursor-pointer' : 'cursor-default'}`}
//               onClick={() => handleClick(stage.id)}
//             >
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   isCompleted(stage.id) ? "bg-[#039994] text-white" : 
//                   stage.id === currentDisplayStage ? "border-2 border-[#039994] bg-white text-gray-600" : 
//                   "bg-gray-200 text-gray-600"
//                 } ${isClickable(stage.id) ? 'hover:bg-[#028a85] hover:text-white' : ''}`}
//               >
//                 {stage.id}
//               </div>
//               <span
//                 className={`text-xs mt-1 text-center ${
//                   isCompleted(stage.id) ? "text-[#039994] font-medium" : 
//                   "text-gray-500"
//                 }`}
//               >
//                 {stage.name}
//               </span>
//               <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
//                 {stage.tooltip}
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
//           {stages.slice(0, stages.length - 1).map((stage) => (
//             <div
//               key={stage.id}
//               className={`h-1 flex-1 mx-2 ${
//                 isCompleted(stage.id) ? "bg-[#039994]" : "bg-gray-200"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function DashboardOverview() {
//   const [showWelcomeModal, setShowWelcomeModal] = useState(false);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);
//   const [userData, setUserData] = useState({
//     userFirstName: "",
//     userId: ""
//   });
//   const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
//   const [currentStage, setCurrentStage] = useState(1);
//   const [clickedStage, setClickedStage] = useState(1);
//   const [showProgressTracker, setShowProgressTracker] = useState(true);
//   const [completedStages, setCompletedStages] = useState([1]);

//   const checkStage2Completion = async (userId, authToken) => {
//     try {
//       const response = await fetch(
//         `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${authToken}`
//           }
//         }
//       );
//       const result = await response.json();
//       return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
//     } catch (error) {
//       return false;
//     }
//   };

//   const checkStage3Completion = async (userId, authToken) => {
//     try {
//       const response = await fetch(
//         `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${authToken}`
//           }
//         }
//       );
//       const result = await response.json();
//       return result.status === 'success' && result.data?.termsAccepted;
//     } catch (error) {
//       return false;
//     }
//   };

//   const checkStage4Completion = async (userId, authToken) => {
//     try {
//       const response = await fetch(
//         `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${authToken}`
//           }
//         }
//       );
//       const result = await response.json();
//       return result.status === 'success' && result.data?.financialInfo;
//     } catch (error) {
//       return false;
//     }
//   };

//   const checkStage5Completion = async (userId, authToken) => {
//     try {
//       const response = await fetch(
//         `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${authToken}`
//           }
//         }
//       );
//       const result = await response.json();
      
//       const metersExist = result.status === 'success' && 
//                          Array.isArray(result.data) &&
//                          result.data.some(item => 
//                            Array.isArray(item.meters) &&
//                            item.meters.some(meter => 
//                              Array.isArray(meter.meterNumbers) && 
//                              meter.meterNumbers.length > 0
//                            )
//                          );
      
//       return metersExist;
//     } catch (error) {
//       return false;
//     }
//   };

//   const checkUserProgress = async () => {
//     try {
//       const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
//       const userId = loginResponse?.data?.user?.id;
//       const authToken = loginResponse?.data?.token;

//       if (!userId || !authToken) return;

//       const completed = [1];
      
//       if (await checkStage2Completion(userId, authToken)) completed.push(2);
//       else {
//         setCurrentStage(2);
//         setShowProgressTracker(true);
//         return;
//       }
      
//       if (await checkStage3Completion(userId, authToken)) completed.push(3);
//       else {
//         setCurrentStage(3);
//         setCompletedStages(completed);
//         setShowProgressTracker(true);
//         return;
//       }
      
//       if (await checkStage4Completion(userId, authToken)) completed.push(4);
//       else {
//         setCurrentStage(4);
//         setCompletedStages(completed);
//         setShowProgressTracker(true);
//         return;
//       }
      
//       if (await checkStage5Completion(userId, authToken)) completed.push(5);
//       else {
//         setCurrentStage(5);
//         setCompletedStages(completed);
//         setShowProgressTracker(true);
//         return;
//       }

//       setCompletedStages(completed);
//       setCurrentStage(6);
//       setShowProgressTracker(false);
//     } catch (error) {
//       console.error('Error checking user progress:', error);
//     }
//   };

//   const handleStageClick = (stageId) => {
//     if (stageId < currentStage) return;
//     setClickedStage(stageId);
//     setShowRegistrationModal(true);
//   };

//   const handleCloseRegistrationModal = () => {
//     setShowRegistrationModal(false);
//     checkUserProgress();
//   };

//   useEffect(() => {
//     const loadUserData = async () => {
//       if (typeof window === 'undefined') return;
      
//       const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
//       const firstName = loginResponse?.data?.user?.firstName || "User";
//       const userId = loginResponse?.data?.user?.id || "";
      
//       setUserData({
//         userFirstName: firstName,
//         userId: userId
//       });

//       const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
//       if (!hasVisitedBefore) {
//         localStorage.setItem("hasVisitedDashboard", "true");
//       }

//       await checkCommercialUserStatus(userId);
//       await checkUserProgress();
//     };

//     loadUserData();
//   }, []);

//   const checkCommercialUserStatus = async (userId) => {
//     if (!userId) return;
    
//     setIsCheckingCommercialStatus(true);
    
//     try {
//       const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
//       const authToken = loginResponse?.data?.token;

//       if (!authToken) {
//         throw new Error('Authentication data not found');
//       }

//       const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${authToken}`
//         }
//       });

//       const result = await response.json();

//       if (result.statusCode === 422 && result.status === 'fail') {
//         setShowWelcomeModal(true);
//       } else if (result.statusCode !== 200 || result.status !== 'success') {
//         setShowWelcomeModal(true);
//       }
//     } catch (error) {
//       console.error('Error checking commercial status:', error);
//       setShowWelcomeModal(true);
//     } finally {
//       setIsCheckingCommercialStatus(false);
//     }
//   };

//   const handleCloseWelcomeModal = () => {
//     setShowWelcomeModal(false);
//     checkUserProgress();
//   };

//   if (isCheckingCommercialStatus) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//         <div className="flex items-center justify-center">
//           <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen space-y-8 p-4 relative">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
//             Quick Action
//           </h1>
//         </div>
//       </div>

//       {showProgressTracker && (
//         <ProgressTracker 
//           currentStage={currentStage} 
//           onStageClick={handleStageClick}
//         />
//       )}
//       <QuickActions />

//       <hr className="border-gray-300" />

//       <Graph />

//       <hr className="border-gray-300" />

//       <RecentRecSales />

//       {showWelcomeModal && (
//         <div className="fixed inset-0 z-[100]">
//           <WelcomeModal 
//             isOpen 
//             onClose={handleCloseWelcomeModal}
//             userData={userData}
//           />
//         </div>
//       )}

//       {showRegistrationModal && (
//         <div className="fixed inset-0 z-[100]">
//           <CommercialRegistrationModal
//             isOpen={showRegistrationModal}
//             onClose={handleCloseRegistrationModal}
//             currentStep={clickedStage}
//           />
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CommercialRegistrationModal from "./modals/createfacility/CommercialRegistrationModal";
import axios from "axios";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-left',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/3 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  fileInputWrapper: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  rowWrapper: 'flex space-x-4',
  halfWidth: 'w-1/2',
  grayPlaceholder: 'bg-[#E8E8E8]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]',
  uploadHeading: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  uploadFieldWrapper: 'flex items-center space-x-3',
  uploadInputLabel: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  uploadIconContainer: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
  uploadButtonStyle: 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  uploadNoteStyle: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  meterStatusButton: 'px-3 py-1 rounded-md border text-xs font-semibold font-sfpro transition-colors duration-200',
  meterStatusButtonRed: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
  meterStatusButtonGreen: 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100',
  meterStatusButtonGray: 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100',
  meterStatusContainer: 'flex items-center gap-2'
};

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
  const [meterStatus, setMeterStatus] = useState({
    loading: false,
    hasMeter: null,
    lastChecked: null
  });

  const checkCommercialUserStatus = async (userId) => {
    if (!userId) return;
    
    setIsCheckingCommercialStatus(true);
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const authToken = loginResponse?.data?.token;

      if (!authToken) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.statusCode === 422 && result.status === 'fail') {
        setShowWelcomeModal(true);
      } else if (result.statusCode !== 200 || result.status !== 'success') {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      setShowWelcomeModal(true);
    } finally {
      setIsCheckingCommercialStatus(false);
    }
  };

  const checkMeterStatus = async () => {
    if (!userData.userId) return;
    
    setMeterStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const token = loginResponse?.data?.token;
      
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/utility-auth/${userData.userId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        const authData = response.data.data[0];
        setMeterStatus({
          loading: false,
          hasMeter: authData.hasMeter,
          lastChecked: new Date()
        });
      } else {
        setMeterStatus({
          loading: false,
          hasMeter: false,
          lastChecked: new Date()
        });
      }
    } catch (err) {
      setMeterStatus({
        loading: false,
        hasMeter: null,
        lastChecked: new Date()
      });
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window === 'undefined') return;
      
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const firstName = loginResponse?.data?.user?.firstName || "User";
      const userId = loginResponse?.data?.user?.id || "";
      
      setUserData({
        userFirstName: firstName,
        userId: userId
      });

      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      if (!hasVisitedBefore) {
        localStorage.setItem("hasVisitedDashboard", "true");
      }

      await checkCommercialUserStatus(userId);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (userData.userId) {
      checkMeterStatus();
      
      const interval = setInterval(() => {
        checkMeterStatus();
      }, 300000);
      
      return () => clearInterval(interval);
    }
  }, [userData.userId]);

  const getMeterStatusText = () => {
    if (meterStatus.loading) return "Checking meter status...";
    if (meterStatus.hasMeter === true) return "✓ Meters Fetched";
    if (meterStatus.hasMeter === false) return "⏳ Fetching Meters";
    return "Check Meter Status";
  };

  const getMeterStatusButtonClass = () => {
    if (meterStatus.loading) return `${styles.meterStatusButton} ${styles.meterStatusButtonGray}`;
    if (meterStatus.hasMeter === true) return `${styles.meterStatusButton} ${styles.meterStatusButtonGreen}`;
    if (meterStatus.hasMeter === false) return `${styles.meterStatusButton} ${styles.meterStatusButtonRed}`;
    return `${styles.meterStatusButton} ${styles.meterStatusButtonGray}`;
  };

  if (isCheckingCommercialStatus) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-8 p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Quick Action
          </h1>
        </div>
        
        <div className={styles.meterStatusContainer}>
          {meterStatus.hasMeter === false && (
            <span className="text-xs text-gray-500">
              Meters usually fetch in 3-5 mins
            </span>
          )}
          <button
            onClick={checkMeterStatus}
            disabled={meterStatus.loading}
            className={getMeterStatusButtonClass()}
          >
            {getMeterStatusText()}
          </button>
        </div>
      </div>

      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100]">
          <WelcomeModal 
            isOpen 
            onClose={handleCloseWelcomeModal}
            userData={userData}
          />
        </div>
      )}

      {showRegistrationModal && (
        <div className="fixed inset-0 z-[100]">
          <CommercialRegistrationModal
            isOpen={showRegistrationModal}
            onClose={handleCloseRegistrationModal}
            currentStep={1}
          />
        </div>
      )}
    </div>
  );
}