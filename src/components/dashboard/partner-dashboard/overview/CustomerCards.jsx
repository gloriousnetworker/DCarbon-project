import React, { useState, useEffect } from "react";
import axios from "axios";
import SendReminderModal from "../overview/modals/SendReminderModal";

export default function ThreeCardsDashboard({ onSectionChange }) {
  const [referralStats, setReferralStats] = useState({
    totalInvited: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState(null);

  const [workProgress, setWorkProgress] = useState({
    pendingRegistrations: 0,
    incompleteDocumentation: 0,
    documentRejections: 0,
    pendingApproval: 0,
    completeDocumentation: 0
  });
  const [loadingWorkProgress, setLoadingWorkProgress] = useState(true);
  const [errorWorkProgress, setErrorWorkProgress] = useState(null);

  const [selectedEmail, setSelectedEmail] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
    const authToken = localStorage.getItem("authToken") || "";

    const fetchData = async () => {
      try {
        setLoadingStats(true);
        setLoadingPending(true);
        setLoadingWorkProgress(true);
        
        const [statsResponse, pendingResponse, workProgressResponse] = await Promise.all([
          axios.get(
            `https://services.dcarbon.solutions/api/user/referral-statistics/${storedUserId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          ),
          axios.get(
            `https://services.dcarbon.solutions/api/user/pending-referrals/${storedUserId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          ),
          axios.get(
            `https://services.dcarbon.solutions/api/user/partner-working-progress/${storedUserId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          )
        ]);

        const backendData = statsResponse.data.data || {};
        const pendingData = pendingResponse.data.data?.pendingReferrals || [];
        const workProgressData = workProgressResponse.data.data || {};

        const trulyPending = pendingData.filter(item => item.status === "PENDING");

        setReferralStats({
          totalInvited: backendData.totalInvited || 0,
          totalPending: trulyPending.length,
          totalAccepted: backendData.totalAccepted || 0,
          totalExpired: backendData.totalExpired || 0
        });

        setPendingReferrals(trulyPending);

        setWorkProgress({
          pendingRegistrations: workProgressData.pendingRegistrations || 0,
          incompleteDocumentation: workProgressData.incompleteDocumentation || 0,
          documentRejections: workProgressData.documentRejections || 0,
          pendingApproval: workProgressData.pendingApproval || 0,
          completeDocumentation: workProgressData.completeDocumentation || 0
        });
      } catch (err) {
        setErrorStats(err.message || "Failed to load stats");
        setErrorPending(err.message || "Failed to load pending referrals");
        setErrorWorkProgress(err.message || "Failed to load work progress");
      } finally {
        setLoadingStats(false);
        setLoadingPending(false);
        setLoadingWorkProgress(false);
      }
    };

    fetchData();

    const refreshInterval = setInterval(fetchData, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const totalRefCount = referralStats.totalInvited || 1;

  const getProgress = (value) => {
    const maxValue = Math.max(10, totalRefCount);
    return Math.min(100, Math.round((value / maxValue) * 100));
  };

  const getStarCount = () => {
    if (referralStats.totalInvited >= 25) return 3;
    if (referralStats.totalInvited >= 15) return 2;
    if (referralStats.totalInvited >= 5) return 1;
    return 0;
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setShowReminderModal(true);
  };

  const handleViewMoreClick = () => {
    if (typeof onSectionChange === 'function') {
      onSectionChange("customerManagement");
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/UserList.png"
            alt="Range Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">
            Customer Range
          </h3>
          <div className="flex ml-auto space-x-1">
            {[...Array(getStarCount())].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
        </div>
        {loadingStats ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading stats...</p>
          </div>
        ) : errorStats ? (
          <p className="text-red-500 text-sm">Error: {errorStats}</p>
        ) : (
          <>
            <hr className="my-2 border-black" />
            <ProgressBarRow
              label="Invited Customers"
              color="#039994"
              value={referralStats.totalInvited}
              progress={getProgress(referralStats.totalInvited)}
              milestone={referralStats.totalInvited}
            />
            <ProgressBarRow
              label="Pending Customers"
              color="#FFB200"
              value={referralStats.totalPending}
              progress={getProgress(referralStats.totalPending)}
              milestone={referralStats.totalPending}
            />
            <ProgressBarRow
              label="Registered Customers"
              color="#1E1E1E"
              value={referralStats.totalAccepted}
              progress={getProgress(referralStats.totalAccepted)}
              milestone={referralStats.totalAccepted}
            />
            <ProgressBarRow
              label="Expired Invitations"
              color="#FF0000"
              value={referralStats.totalExpired}
              progress={getProgress(referralStats.totalExpired)}
              milestone={referralStats.totalExpired}
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/UserCircleDashed.png"
            alt="Registrations Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">
            Pending Customer Registrations ({pendingReferrals.length})
          </h3>
        </div>
        {loadingPending ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading pending...</p>
          </div>
        ) : errorPending ? (
          <p className="text-red-500 text-sm">Error: {errorPending}</p>
        ) : (
          <>
            <hr className="my-2 border-black" />
            <div className="overflow-y-auto max-h-52 pr-2">
              {pendingReferrals.length > 0 ? (
                pendingReferrals.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between mb-2 gap-2"
                  >
                    <button
                      onClick={() => handleEmailClick(item.inviteeEmail)}
                      className="text-[#1E1E1E] text-sm font-medium hover:underline truncate flex-1 text-left min-w-0"
                      title={item.inviteeEmail}
                    >
                      <span className="truncate block">{item.inviteeEmail || "Unknown User"}</span>
                    </button>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        border: "0.5px solid #FFB200",
                        backgroundColor: "#FFFAED",
                        color: "#FFB200",
                      }}
                    >
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No pending registrations.
                </div>
              )}
            </div>
            {pendingReferrals.length > 5 && (
              <>
                <hr className="my-2 border-black" />
                <div className="flex justify-end">
                  <button
                    onClick={handleViewMoreClick}
                    className="text-white text-xs px-3 py-1 rounded"
                    style={{ backgroundColor: "#039994" }}
                  >
                    View more
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/Files.png"
            alt="Work Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">Work Progress</h3>
        </div>
        {loadingWorkProgress ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading progress...</p>
          </div>
        ) : errorWorkProgress ? (
          <p className="text-red-500 text-sm">Error: {errorWorkProgress}</p>
        ) : (
          <>
            <hr className="my-2 border-black" />
            <WorkProgressItem
              label="Pending Registrations"
              color="#FFB200"
              value={workProgress.pendingRegistrations}
            />
            <WorkProgressItem
              label="Incomplete Documentation"
              color="#FFB200"
              value={workProgress.incompleteDocumentation}
            />
            <WorkProgressItem
              label="Document Rejections"
              color="#FF0000"
              value={workProgress.documentRejections}
            />
            <WorkProgressItem
              label="Pending Approval"
              color="#039994"
              value={workProgress.pendingApproval}
            />
            <WorkProgressItem 
              label="Complete Documentation" 
              color="#1E1E1E" 
              value={workProgress.completeDocumentation} 
            />
          </>
        )}
      </div>

      {showReminderModal && (
        <SendReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          initialEmail={selectedEmail}
        />
      )}
    </div>
  );
}

function ProgressBarRow({ label, color, value, progress, milestone }) {
  const showMilestone = milestone > 0 && (milestone % 5 === 0);
  
  return (
    <div className="mb-3 relative">
      <div className="flex items-center justify-between">
        <span className="text-[#1E1E1E] text-sm">{label}</span>
        <span className="text-[#1E1E1E] text-sm font-medium">{value}</span>
      </div>
      <div className="w-full h-2 mt-1 bg-[#EEEEEE] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        ></div>
        {showMilestone && (
          <div 
            className="absolute -top-1 text-yellow-400 text-xs"
            style={{ left: `${Math.min(100, progress + 5)}%` }}
          >
            ★
          </div>
        )}
      </div>
    </div>
  );
}

function WorkProgressItem({ label, color, value }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[#1E1E1E] text-sm">{label}</span>
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
        style={{ backgroundColor: color }}
      >
        {value}
      </div>
    </div>
  );
}