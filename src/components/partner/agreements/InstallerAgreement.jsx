import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";

export default function InstallerAgreement({
  onAllCheckedChange,
  signatureData,
  onOpenSignatureModal,
  onDownload
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setScrolledToBottom(isBottom);
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (onAllCheckedChange) {
      onAllCheckedChange(isChecked);
    }
  }, [isChecked, onAllCheckedChange]);

  const handleSignatureClick = () => {
    if (!isChecked) {
      toast.error("Please accept the agreement first");
      return;
    }
    onOpenSignatureModal();
  };

  return (
    <div className="w-full max-w-3xl h-[50vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-[#039994] px-2">
      <div className="mb-4">
        <label className="flex items-center space-x-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="form-checkbox h-5 w-5 text-[#039994] border-gray-400 rounded"
          />
          <span className="font-semibold text-[#039994] font-sfpro">
            Program Partner Agreement <span className="text-red-500">*</span>
          </span>
        </label>
        
        <div
          ref={contentRef}
          className="h-[200px] overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4 font-sfpro text-[12px] leading-[150%] text-[#1E1E1E]"
        >
          <h3 className="font-bold text-[#039994] mb-2">PROGRAM PARTNER AGREEMENT</h3>
          <p className="mb-4">
            This Program Partner Agreement ("Agreement") is made between DCarbon Solutions ("Company") and the undersigned Partner ("Partner").
          </p>
          <p className="mb-2"><strong>1. Partner Responsibilities:</strong> Partner agrees to install, maintain, and service renewable energy systems in accordance with Company standards.</p>
          <p className="mb-2"><strong>2. Compensation:</strong> Company shall pay Partner according to the agreed-upon rate schedule for completed installations.</p>
          <p className="mb-2"><strong>3. Quality Standards:</strong> Partner agrees to maintain all installations to Company's quality standards.</p>
          <p className="mb-2"><strong>4. Training:</strong> Partner agrees to participate in Company-provided training programs.</p>
          <p className="mb-2"><strong>5. Insurance:</strong> Partner agrees to maintain adequate liability insurance coverage.</p>
          <p className="mb-2"><strong>6. Term:</strong> This Agreement shall commence on execution and continue for 12 months.</p>
          <p className="mb-2"><strong>7. Termination:</strong> Either party may terminate with 30 days written notice.</p>
          <p className="mb-4"><strong>8. Governing Law:</strong> This Agreement shall be governed by Texas law.</p>
        </div>

        <div className="mb-4">
          <h3 className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
            Signature <span className="text-red-500">*</span>
          </h3>
          {signatureData ? (
            <div className="border border-gray-300 rounded p-4 mb-2 text-gray-700">
              <img src={signatureData} alt="Partner signature" className="max-w-full h-auto" />
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded p-4 mb-2 text-gray-500 italic font-sfpro">
              No signature yet
            </div>
          )}

          <button
            onClick={handleSignatureClick}
            disabled={!isChecked}
            className={`px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro ${
              !isChecked ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {signatureData ? "Update Signature" : "Add Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}