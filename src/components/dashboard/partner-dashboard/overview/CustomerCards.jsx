import React, { useState, useEffect } from "react";

export default function ThreeCardsDashboard() {
  // --------------------------------------------
  // 1) CUSTOMER RANGE (Referral Statistics)
  // --------------------------------------------
  const [referralStats, setReferralStats] = useState({
    totalInvited: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // --------------------------------------------
  // 2) PENDING CUSTOMER REGISTRATIONS
  // --------------------------------------------
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState(null);

  // --------------------------------------------
  // 3) WORK PROGRESS (Static)
  // --------------------------------------------
  // No state or endpoint for this; purely static for now

  // --------------------------------------------
  // On mount, fetch data for both cards
  // --------------------------------------------
  useEffect(() => {
    // We can retrieve userId from localStorage; fallback to the one provided in the endpoint
    const storedUserId =
      localStorage.getItem("userId") ||
      "fd1fbb4e-c408-4c73-8b12-a33efc9b3a70";
    const authToken = localStorage.getItem("authToken") || "";

    // 1) Fetch referral statistics
    const fetchReferralStats = async () => {
      try {
        setLoadingStats(true);
        setErrorStats(null);

        const response = await fetch(
          `https://dcarbon-server.onrender.com/api/user/referral-statistics/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setReferralStats(result.data || {});
      } catch (err) {
        setErrorStats(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    // 2) Fetch pending referrals
    const fetchPendingReferrals = async () => {
      try {
        setLoadingPending(true);
        setErrorPending(null);

        const response = await fetch(
          `https://dcarbon-server.onrender.com/api/user/pending-referrals/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        // result.data.pendingReferrals => array of referrals
        setPendingReferrals(result.data?.pendingReferrals || []);
      } catch (err) {
        setErrorPending(err.message);
      } finally {
        setLoadingPending(false);
      }
    };

    // Call both
    fetchReferralStats();
    fetchPendingReferrals();
  }, []);

  // --------------------------------------------
  // Helper: compute the total + progress for the bars
  // We have four categories in the referralStats:
  // totalInvited, totalPending, totalAccepted, totalExpired
  // We'll map them to the four bars we want: 
  //   Invited Customers (#FFB200),
  //   Registered Customers (#1E1E1E),
  //   Active Customers (#039994),
  //   Active Resi. Groups (#039994)
  //
  // For demonstration, we’ll map:
  // Invited = totalInvited
  // Registered = totalPending
  // Active = totalAccepted
  // Active Resi. = totalExpired
  //
  // Adjust as needed if your business logic differs.
  // --------------------------------------------
  const totalRefCount =
    referralStats.totalInvited +
    referralStats.totalPending +
    referralStats.totalAccepted +
    referralStats.totalExpired ||
    0;

  const getProgress = (value) => {
    if (!totalRefCount) return 0;
    return Math.round((value / totalRefCount) * 100);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ---------------------------
          CARD 1: CUSTOMER RANGE
      ----------------------------*/}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        {/* Heading Row */}
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
        {/* Loading/Error state */}
        {loadingStats ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading stats...</p>
          </div>
        ) : errorStats ? (
          <p className="text-red-500 text-sm">Error: {errorStats}</p>
        ) : (
          <>
            {/* Black horizontal line */}
            <hr className="my-2 border-black" />
            {/* Four progress bars */}
            <ProgressBarRow
              label="Invited Customers"
              color="#FFB200"
              value={referralStats.totalInvited}
              progress={getProgress(referralStats.totalInvited)}
            />
            <ProgressBarRow
              label="Registered Customers"
              color="#1E1E1E"
              value={referralStats.totalPending}
              progress={getProgress(referralStats.totalPending)}
            />
            <ProgressBarRow
              label="Active Customers"
              color="#039994"
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

      {/* --------------------------------
          CARD 2: PENDING CUSTOMER REGISTRATIONS
      ---------------------------------*/}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        {/* Heading Row */}
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
        {/* Loading/Error state */}
        {loadingPending ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading pending...</p>
          </div>
        ) : errorPending ? (
          <p className="text-red-500 text-sm">Error: {errorPending}</p>
        ) : (
          <>
            {/* Black horizontal line */}
            <hr className="my-2 border-black" />
            {/* Scrollable list of up to 5 records */}
            <div className="overflow-y-auto max-h-52 pr-2">
              {pendingReferrals.length > 0 ? (
                pendingReferrals.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between mb-2"
                  >
                    <span className="text-[#1E1E1E] text-sm font-medium">
                      {item.name || item.fullName || "Unknown User"}
                    </span>
                    {/* Tag showing "Pending" */}
                    <span
                      className="text-xs px-2 py-1 rounded-full"
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
            {/* Black horizontal line */}
            <hr className="my-2 border-black" />
            {/* View more button */}
            <div className="flex justify-end">
              <button
                className="text-white text-xs px-3 py-1 rounded"
                style={{ backgroundColor: "#039994" }}
                onClick={() => alert("View more clicked!")}
              >
                View more
              </button>
            </div>
          </>
        )}
      </div>

      {/* --------------------------------
          CARD 3: WORK PROGRESS
      ---------------------------------*/}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        {/* Heading Row */}
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/Files.png"
            alt="Work Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">Work Progress</h3>
        </div>
        {/* Black horizontal line */}
        <hr className="my-2 border-black" />
        {/* Items (static) */}
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
    </div>
  );
}

/**
 * Progress Bar Row for the Customer Range card
 * @param {string} label - e.g. "Invited Customers"
 * @param {string} color - bar color, e.g. "#FFB200"
 * @param {number} value - numeric value, e.g. 10
 * @param {number} progress - the percentage (0-100)
 */
function ProgressBarRow({ label, color, value, progress }) {
  return (
    <div className="mb-3">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <span className="text-[#1E1E1E] text-sm">{label}</span>
        <span className="text-[#1E1E1E] text-sm font-medium">{value}</span>
      </div>
      {/* Progress Bar */}
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

/**
 * Single line item for Work Progress
 * @param {string} label - e.g. "Incomplete Registrations"
 * @param {string} color - circle color
 * @param {string|number} value - numeric text for the circle
 */
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
