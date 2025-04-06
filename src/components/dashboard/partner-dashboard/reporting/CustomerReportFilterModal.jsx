import React from 'react';

const FilterModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-5">
        <h2 className="text-lg font-semibold mb-5">Filter</h2>

        <div className="space-y-6">
          {/* Customer Status Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">By Customer Status:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#039994] rounded border-gray-300"
                  defaultChecked
                />
                <span className="text-sm">Pending</span>
              </label>
            </div>
          </div>

          {/* Customer Type Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">By Customer Type:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#039994] rounded border-gray-300"
                  defaultChecked
                />
                <span className="text-sm">Residential</span>
              </label>
            </div>
          </div>

          {/* Date Registration Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">By Date of Registration:</h3>
            <button className="w-full text-left px-3 py-2 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50">
              Select date
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-[#039994] hover:bg-[#027671] text-white rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;