import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import * as styles from "./styles";

export default function RequestRedemption({ onClose, onSubmit, availablePoints }) {
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");
  
  const pricePerPoint = 0.01;
  const commissionRate = 0.5;
  const userAmount = points ? (points * pricePerPoint * commissionRate).toFixed(2) : "0.00";
  const remainingPoints = points ? availablePoints - parseInt(points) : availablePoints;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const pointsValue = parseInt(points);

    if (!pointsValue || pointsValue <= 0) {
      setError("Please enter a valid number of points");
      return;
    }

    if (pointsValue < 3000) {
      setError("Minimum redemption is 3000 points");
      return;
    }

    if (pointsValue > availablePoints) {
      setError("Insufficient points balance");
      return;
    }

    if (onSubmit) {
      onSubmit({ points: pointsValue, total: parseFloat(userAmount) });
    }
  };

  const handlePointsChange = (e) => {
    setPoints(e.target.value);
    setError("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        <h2 className={`${styles.pageTitle} text-left mb-6`}>Request Points Redemption</h2>

        <div className="mb-6 p-4 bg-[#069B9621] rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-sfpro text-[16px] text-[#1E1E1E]">
              Available Points:
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              {availablePoints} pts
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">
              Worth:
            </span>
            <span className="font-sfpro font-semibold text-[16px] text-[#039994]">
              ${(availablePoints * pricePerPoint).toFixed(2)}
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
            <div>
              <label className={styles.labelClass}>Amount You Will Receive</label>
              <div
                className="p-4 rounded-md text-center"
                style={{ backgroundColor: "#069B9621" }}
              >
                <span className="font-sfpro font-semibold text-[24px] text-[#039994]">
                  ${userAmount}
                </span>
              </div>
            </div>
          )}

          <hr className="border-gray-300" />

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="text-sm font-sfpro text-yellow-800">
              <strong>Notice:</strong> Your redemption request will be reviewed and approved by an admin. 
              Once approved, you'll receive a payment link from DCarbon to complete your redemption.
            </div>
          </div>

          <button 
            type="submit" 
            className={`${styles.buttonPrimary} ${(!points || parseInt(points) < 3000) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!points || parseInt(points) < 3000}
          >
            Submit Redemption Request
          </button>
        </form>
      </div>
    </div>
  );
}