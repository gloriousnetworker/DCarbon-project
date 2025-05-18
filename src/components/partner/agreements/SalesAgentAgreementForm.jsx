import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SalesAgentAgreement({
  onAllCheckedChange,
  signatureData,
  onOpenSignatureModal,
}) {
  // Local state for each checkbox
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);

  // Whenever any checkbox changes, notify parent whether all are checked
  useEffect(() => {
    if (onAllCheckedChange) {
      onAllCheckedChange(checked1 && checked2 && checked3);
    }
  }, [checked1, checked2, checked3, onAllCheckedChange]);

  const handleSignatureClick = () => {
    if (!(checked1 && checked2 && checked3)) {
      toast.error("Please accept all agreements first");
      return;
    }
    onOpenSignatureModal();
  };

  return (
    <div className="w-full max-w-3xl h-[50vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-[#039994] px-2">
      
      {/* Section 1 */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked1}
            onChange={() => setChecked1(!checked1)}
            className="form-checkbox h-5 w-5 text-[#039994] border-gray-400 rounded"
          />
          <span className="font-semibold text-[#039994] font-sfpro">
            DCarbon Information Release Agreement <span className="text-red-500">*</span>
          </span>
        </label>
        <p className={noteText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco...
        </p>
      </div>

      <hr className="my-4 border-gray-300" />

      {/* Section 2 */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked2}
            onChange={() => setChecked2(!checked2)}
            className="form-checkbox h-5 w-5 text-[#039994] border-gray-400 rounded"
          />
          <span className="font-semibold text-[#039994] font-sfpro">
            DCarbon Services Agreement <span className="text-red-500">*</span>
          </span>
        </label>
        <p className={noteText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tincidunt 
          nisl felis, vel interdum dui suscipit eu. Aliquam erat volutpat. Integer 
          vel ante sit amet urna auctor ultrices...
        </p>
      </div>

      <hr className="my-4 border-gray-300" />

      {/* Section 3 */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={checked3}
            onChange={() => setChecked3(!checked3)}
            className="form-checkbox h-5 w-5 text-[#039994] border-gray-400 rounded"
          />
          <span className="font-semibold text-[#039994] font-sfpro">
            WREGIS Assignment Agreement <span className="text-red-500">*</span>
          </span>
        </label>
        <p className={noteText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tincidunt 
          nisl felis, vel interdum dui suscipit eu. Aliquam erat volutpat. Integer 
          vel ante sit amet urna auctor ultrices...
        </p>
      </div>

      {/* Signature Placeholder Section */}
      <hr className="my-4 border-gray-300" />

      <div className="mb-4">
        <h3 className={uploadHeading}>Signature <span className="text-red-500">*</span></h3>
        {/* If there's signature data, display it; otherwise show placeholder */}
        {signatureData ? (
          <div className="border border-gray-300 rounded p-4 mb-2 text-gray-700">
            <img src={signatureData} alt="User signature" className="max-w-full h-auto" />
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded p-4 mb-2 text-gray-500 italic font-sfpro">
            No signature yet
          </div>
        )}

        {/* Button to open the Signature Modal */}
        <button
          onClick={handleSignatureClick}
          className={uploadButtonStyle}
        >
          {signatureData ? "Update Signature" : "Add Signature"}
        </button>
      </div>
    </div>
  );
}

// Apply styles from styles.js
const noteText =
  'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]';
const uploadHeading =
  'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const uploadButtonStyle =
  'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
