import React from 'react';

const ExportSuccessModal = ({ onClose }) => {
  const handleReturnToDashboard = () => {
    // You can programmatically navigate to the dashboard
    // or just close the modal, depending on your app flow.
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Report Export Successful</h2>
        <p className="text-gray-700 mb-6">
          Your report has been exported successfully!
        </p>

        <button
          onClick={handleReturnToDashboard}
          className="px-4 py-2 rounded bg-[#039994] hover:bg-[#027671] text-white"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ExportSuccessModal;
