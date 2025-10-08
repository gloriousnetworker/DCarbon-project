import React, { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import * as styles from "./styles";

export default function RedeemPoints({ onClose, onComplete, redemptionData, processingStatus, userId, authToken }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(processingStatus);

  useEffect(() => {
    if (processingStatus && !processingStatus.isProcessingComplete) {
      checkProcessingStatus();
    }
  }, [processingStatus]);

  const checkProcessingStatus = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/processing-status/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      if (result.status === "success") {
        setCurrentStatus(result.data);
      }
    } catch (error) {
      console.error("Error checking processing status:", error);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onComplete({
        points: redemptionData.points,
        amount: redemptionData.amount
      });
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 relative">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <FiCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-sfpro font-semibold text-gray-900 mb-2">
              Submission Received
            </h3>
            <p className="text-sm font-sfpro text-gray-600">
              Your payout request has been submitted successfully. You will receive a payment link from DCarbon shortly to complete your transaction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isProcessing}
        >
          <FiX size={24} />
        </button>

        <h2 className={`${styles.pageTitle} text-left mb-6`}>Redeem Points</h2>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center mb-3">
            <FiCheck className="text-green-600 mr-2" size={20} />
            <span className="font-sfpro font-semibold text-green-800">
              Payout Request Approved
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm font-sfpro">
            <div>
              <span className="text-gray-600">Points:</span>
              <div className="font-semibold text-[#039994]">
                {redemptionData.points.toLocaleString()} pts
              </div>
            </div>
            <div>
              <span className="text-gray-600">Amount You Receive:</span>
              <div className="font-semibold text-[#039994] text-lg">
                {formatCurrency(redemptionData.amount)}
              </div>
            </div>
          </div>

          {currentStatus && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <div className="text-sm font-sfpro text-blue-800">
                <strong>Processing Status:</strong> {currentStatus.message || "Processing your request..."}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleRedeem} className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="text-sm font-sfpro text-blue-800">
              <strong>Payment Process:</strong> After submission, you will receive a secure payment link from DCarbon to complete your payout. This ensures safe and verified transactions.
            </div>
          </div>

          <hr className="border-gray-300" />

          <div className="space-y-4">
            <div className="text-sm font-sfpro text-gray-600">
              By clicking "Submit Payout", you confirm your payout request and agree to receive a payment link from DCarbon.
            </div>

            <button
              type="submit"
              className={`${styles.buttonPrimary} ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Submit Payout - ${formatCurrency(redemptionData.amount)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}