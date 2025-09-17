// RedeemPoints.jsx
import React, { useState } from "react";
import { FiX, FiCheck, FiCreditCard, FiUser } from "react-icons/fi";
import * as styles from "./styles";

export default function RedeemPoints({ onClose, onComplete, redemptionData }) {
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (selectedMethod === "bank") {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
        setError("Please fill in all required bank details");
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the redemption
      onComplete({
        points: redemptionData.points,
        total: redemptionData.total,
        method: selectedMethod,
        details: selectedMethod === "bank" ? bankDetails : null
      });
    } catch (err) {
      setError("Failed to process redemption. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl rounded-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isProcessing}
        >
          <FiX size={24} />
        </button>

        {/* Title */}
        <h2 className={`${styles.pageTitle} text-left mb-6`}>Redeem Points</h2>

        {/* Redemption Summary */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center mb-3">
            <FiCheck className="text-green-600 mr-2" size={20} />
            <span className="font-sfpro font-semibold text-green-800">
              Redemption Request Approved
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm font-sfpro">
            <div>
              <span className="text-gray-600">Points to Redeem:</span>
              <div className="font-semibold text-[#039994]">
                {redemptionData.points.toLocaleString()} pts
              </div>
            </div>
            <div>
              <span className="text-gray-600">Amount to Receive:</span>
              <div className="font-semibold text-[#039994] text-lg">
                {formatCurrency(redemptionData.total)}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Equivalent RECs:</span>
              <div className="font-semibold text-[#039994]">
                {(redemptionData.points / 1000).toFixed(1)} RECs
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRedeem} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className={`${styles.labelClass} mb-4 block`}>
              Select Redemption Method
            </label>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Bank Transfer Option */}
              <div
                className={`border-2 rounded-md p-4 cursor-pointer transition-colors ${
                  selectedMethod === "bank"
                    ? "border-[#039994] bg-[#069B9621]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod("bank")}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="bank"
                    checked={selectedMethod === "bank"}
                    onChange={() => setSelectedMethod("bank")}
                    className="mr-3"
                  />
                  <FiCreditCard className="text-[#039994] mr-2" size={20} />
                  <div>
                    <div className="font-sfpro font-semibold text-[#1E1E1E]">
                      Bank Transfer
                    </div>
                    <div className="font-sfpro text-sm text-gray-600">
                      Direct deposit to your bank account
                    </div>
                  </div>
                </div>
              </div>

              {/* Future: Add more payment methods here */}
            </div>
          </div>

          {/* Bank Details Form */}
          {selectedMethod === "bank" && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-sfpro font-semibold text-[#1E1E1E] mb-4">
                Bank Account Details
              </h3>

              <div className={styles.rowWrapper}>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>Account Name *</label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => handleInputChange("accountName", e.target.value)}
                    placeholder="Full name on account"
                    className={styles.inputClass}
                    required
                  />
                </div>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Account number"
                    className={styles.inputClass}
                    required
                  />
                </div>
              </div>

              <div className={styles.rowWrapper}>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>Bank Name *</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Bank name"
                    className={styles.inputClass}
                    required
                  />
                </div>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>Routing Number</label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                    placeholder="Routing number (optional)"
                    className={styles.inputClass}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="text-sm font-sfpro text-blue-800">
                  <strong>Security Notice:</strong> Your banking information is encrypted and secure. 
                  Processing typically takes 1-3 business days.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 font-sfpro">{error}</p>
            </div>
          )}

          <hr className="border-gray-300" />

          {/* Terms and Submit */}
          <div className="space-y-4">
            <div className="text-sm font-sfpro text-gray-600">
              By clicking "Process Redemption", you confirm that the provided information is accurate 
              and agree to the processing terms.
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
                `Process Redemption - ${formatCurrency(redemptionData.total)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}