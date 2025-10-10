import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import * as styles from "./styles";

export default function RequestRedemption({ onClose, onSubmit, availablePoints, userId, authToken }) {
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const calculateActualAmount = (pts) => (pts * 0.001).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const pointsValue = parseInt(points);

    if (!pointsValue || pointsValue <= 0) {
      setError("Please enter a valid number of points");
      setIsSubmitting(false);
      return;
    }

    if (pointsValue < 3000) {
      setError("Minimum redemption is 3000 points");
      setIsSubmitting(false);
      return;
    }

    if (pointsValue > availablePoints) {
      setError("Insufficient points balance");
      setIsSubmitting(false);
      return;
    }

    try {
      const amount = parseFloat(calculateActualAmount(pointsValue));
      
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          amount: amount,
          userType: "RESIDENTIAL"
        })
      });

      const result = await response.json();
      
      if (result.status === "success") {
        setShowSuccessModal(true);
      } else {
        setError("Failed to submit payout request");
      }
    } catch (error) {
      console.error("Error submitting payout:", error);
      setError("Failed to submit payout request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePointsChange = (e) => {
    setPoints(e.target.value);
    setError("");
  };

  const actualAmount = points ? parseFloat(calculateActualAmount(points)) : 0;
  const remainingPoints = points ? availablePoints - parseInt(points) : availablePoints;

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 relative">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-sfpro font-semibold text-gray-900 mb-2">
              Payout Request Submitted Successfully!
            </h3>
            <p className="text-sm font-sfpro text-gray-600 mb-6">
              Your payout request has been received and is being processed. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded font-sfpro text-white bg-[#039994] text-sm hover:bg-[#02857f]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
        >
          <FiX size={24} />
        </button>

        <h2 className={`${styles.pageTitle} text-left mb-6`}>Request Payout</h2>

        <div className="mb-6 p-4 bg-[#069B9621] rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-sfpro text-[16px] text-[#1E1E1E]">
              Available Points:
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              {availablePoints} pts
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={styles.labelClass}>Points to Redeem</label>
            <div className="space-y-3">
              <input
                type="number"
                min="3000"
                max={availablePoints}
                value={points}
                onChange={handlePointsChange}
                placeholder="Enter points (minimum 3000)"
                className={`${styles.inputClass} bg-[#F0F0F0] w-full`}
                required
                disabled={isSubmitting}
              />
              
              {points && (
                <div className="flex justify-between text-sm font-sfpro">
                  <span className="text-[#626060]">
                    Remaining: {remainingPoints} pts
                  </span>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 font-sfpro">{error}</p>
            )}
          </div>

          {points && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-sfpro font-semibold text-[16px] mb-2">Payout Summary</h3>
              <div className="space-y-2 text-sm font-sfpro">
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span>{parseInt(points).toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Amount You Receive:</span>
                  <span className="font-semibold text-[#039994]">${actualAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <hr className="border-gray-300" />

          <button 
            type="submit" 
            className={`${styles.buttonPrimary} ${(!points || parseInt(points) < 3000 || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!points || parseInt(points) < 3000 || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Request Payout"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}