// RequestRedemption.jsx
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import * as styles from "./styles";

export default function RequestRedemption({ onClose, onSubmit }) {
  const [points, setPoints] = useState("");
  const pricePerPoint = 0.02;
  const total = points ? (points * pricePerPoint).toFixed(2) : "0.00";

  const handleSubmit = (e) => {
    e.preventDefault();
    // pass points (or total) back to parent
    if (onSubmit) onSubmit({ points, total });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        {/* Title */}
        <h2 className={`${styles.pageTitle} text-left mb-6`}>Points Transactions</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Points to Redeem */}
          <div>
            <label className={styles.labelClass}>Points to Redeem</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Redemption Points"
                className={`${styles.inputClass} bg-[#F0F0F0] flex-1`}
                required
              />
              <div className="flex items-baseline space-x-1">
                <span className="font-sfpro font-semibold text-lg text-[#039994]">
                  ${pricePerPoint.toFixed(2)}
                </span>
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">
                  per point
                </span>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className={styles.labelClass}>Total Amount</label>
            <div
              className="p-4 rounded-md"
              style={{ backgroundColor: "#069B9621" }}
            >
              <span className="font-sfpro font-semibold text-[20px] text-[#039994]">
                ${total}
              </span>
            </div>
          </div>

          <hr className="border-gray-300" />

          {/* Submit */}
          <button type="submit" className={styles.buttonPrimary}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
