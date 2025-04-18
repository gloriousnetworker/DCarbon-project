import React, { useState, useEffect } from "react";
import axios from "axios";
import SendReminderModal from "../overview/modals/SendReminderModal";

export default function ThreeCardsDashboard() {
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

  const [selectedEmail, setSelectedEmail] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
    const authToken = localStorage.getItem("authToken") || "";

    const fetchReferralStats = async () => {
      try {
        setLoadingStats(true);
        const response = await axios.get(
          `https://dcarbon-server.onrender.com/api/user/referral-statistics/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setReferralStats(response.data.data || {});
      } catch (err) {
        setErrorStats(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchPendingReferrals = async () => {
      try {
        setLoadingPending(true);
        const response = await axios.get(
          `https://dcarbon-server.onrender.com/api/user/pending-referrals/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setPendingReferrals(response.data.data?.pendingReferrals || []);
      } catch (err) {
        setErrorPending(err.message);
      } finally {
        setLoadingPending(false);
      }
    };

    fetchReferralStats();
    fetchPendingReferrals();
  }, []);

  const totalRefCount =
    referralStats.totalInvited +
    referralStats.totalPending +
    referralStats.totalAccepted +
    referralStats.totalExpired || 0;

  const getProgress = (value) => {
    if (!totalRefCount) return 0;
    return Math.round((value / totalRefCount) * 100);
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setShowReminderModal(true);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Customer Range Card */}
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
              color="#FFB200"
              value={referralStats.totalInvited}
              progress={getProgress(referralStats.totalInvited)}
            />
            <ProgressBarRow
              label="Active Customers"
              color="#039994"
              value={referralStats.totalPending}
              progress={getProgress(referralStats.totalPending)} 
            />
            <ProgressBarRow
              label="Registered Customers"
              color="#1E1E1E"
              value={referralStats.totalAccepted} 
              progress={getProgress(referralStats.totalAccepted)}
            />
            <ProgressBarRow
              label="Active Resi. Groups"
              color="#039994"
              value={referralStats.totalExpired}
              progress={getProgress(referralStats.totalExpired)}
            />
          </>
        )}
      </div>

      {/* Pending Customer Registrations Card */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/UserCircleDashed.png"
            alt="Registrations Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">
            Pending Customer Registrations
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
                    className="flex items-center justify-between mb-2"
                  >
                    <button
                      onClick={() => handleEmailClick(item.inviteeEmail)}
                      className="text-[#1E1E1E] text-sm font-medium hover:underline"
                    >
                      {item.inviteeEmail || "Unknown User"}
                    </button>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        border: "0.5px solid #FFB200",
                        backgroundColor: "#FFFAED",
                        color: "#FFB200",
                      }}
                    >
                      {item.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No pending registrations.
                </div>
              )}
            </div>
            <hr className="my-2 border-black" />
            <div className="flex justify-end">
              <button
                className="text-white text-xs px-3 py-1 rounded"
                style={{ backgroundColor: "#039994" }}
              >
                View more
              </button>
            </div>
          </>
        )}
      </div>

      {/* Work Progress Card */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/Files.png"
            alt="Work Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">Work Progress</h3>
        </div>
        <hr className="my-2 border-black" />
        <WorkProgressItem
          label="Incomplete Registrations"
          color="#FFB200"
          value="12"
        />
        <WorkProgressItem
          label="Incomplete Documentation"
          color="#FFB200"
          value="12"
        />
        <WorkProgressItem
          label="Document Rejections"
          color="#FF0000"
          value="12"
        />
        <WorkProgressItem
          label="Final Approval Review"
          color="#039994"
          value="12"
        />
        <WorkProgressItem label="Terminated" color="#FF0000" value="12" />
      </div>

      {/* Send Reminder Modal */}
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

function ProgressBarRow({ label, color, value, progress }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <span className="text-[#1E1E1E] text-sm">{label}</span>
        <span className="text-[#1E1E1E] text-sm font-medium">{value}</span>
      </div>
      <div className="w-full h-2 mt-1 bg-[#EEEEEE] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        ></div>
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