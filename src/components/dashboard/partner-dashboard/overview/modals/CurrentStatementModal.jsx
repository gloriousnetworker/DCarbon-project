import React from "react";
import { FiX } from "react-icons/fi";

export default function CurrentStatementModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#039994]">Current Statement</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>
        <hr className="mb-4 border-gray-200" />
        <div className="text-center py-8">
          <div className="text-gray-300 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your current statement will be available here at the end of the billing period.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Check back at the end of the quarter for your latest statement.
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#039994] text-white text-sm font-medium rounded-lg hover:bg-[#028580] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
