import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import SignatureModal from "./SignatureModal";
import { jsPDF } from "jspdf";

export default function OwnerTermsAndAgreementModal({ isOpen, onClose }) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
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

  const fetchUserAgreement = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) {
        return null;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
      return null;
    }
  };

  const acceptUserAgreementTerms = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) {
        toast.error('Authentication required. Please log in again.');
        return false;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Terms and conditions accepted successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to accept terms and conditions');
        return false;
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error('An error occurred while accepting terms. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignFirst = () => {
    if (!isChecked1 || !isChecked2) {
      toast.error('Please accept both agreement terms first');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureModal(false);
    setHasSigned(true);
    const agreementData = await fetchUserAgreement();
    if (agreementData && agreementData.signature) {
      setSignatureUrl(agreementData.signature);
    }
    const success = await acceptUserAgreementTerms();
    if (success) {
      onClose();
      window.location.reload();
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
    window.location.reload();
  };

  const handleModalClose = () => {
    onClose();
    window.location.reload();
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('OPERATOR OWNER REC AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const recText = [
      "This Operator Owner Renewable Energy Certificate (REC) Agreement (the 'Agreement') is made",
      "between DCarbon Solutions ('Company') and the undersigned operator property owner ('Owner').",
      "",
      "1. REC Ownership: Owner agrees to transfer all rights, title, and interest in the RECs generated",
      "by the operator renewable energy system to Company.",
      "",
      "2. Term: This Agreement shall commence on the date of execution and continue for 12 months,",
      "automatically renewing for successive 12-month terms unless terminated.",
      "",
      "3. Compensation: Company shall pay Owner $0.03 per kWh for all verified RECs generated by",
      "the operator system.",
      "",
      "4. Metering: Owner agrees to provide Company with access to energy production data from",
      "the operator renewable energy system.",
      "",
      "5. Representations: Owner represents they have authority to enter this Agreement and transfer",
      "RECs for the operator property.",
      "",
      "6. Governing Law: This Agreement shall be governed by the laws of the state where the",
      "operator property is located."
    ];
    
    let yPosition = 30;
    recText.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition, { maxWidth: 170 });
      yPosition += 7;
    });

    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('OPERATOR OWNER INFORMATION RELEASE', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('AUTHORIZATION', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const releaseText = [
      "This Operator Owner Information Release Authorization ('Authorization') permits DCarbon",
      "Solutions to access and use Owner's operator utility data.",
      "",
      "1. Authorization: Owner authorizes Company to access utility account data for the operator",
      "property for REC verification and energy management services.",
      "",
      "2. Data Use: Company may use this data to calculate REC production, verify system performance,",
      "and provide operator energy reports.",
      "",
      "3. Third Parties: Owner authorizes their utility provider to release consumption and",
      "generation data to Company for the operator property.",
      "",
      "4. Duration: This Authorization remains in effect until revoked in writing by Owner.",
      "",
      "5. Security: Company agrees to maintain appropriate safeguards to protect Owner's data."
    ];
    
    releaseText.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition, { maxWidth: 170 });
      yPosition += 7;
    });

    doc.addPage();
    yPosition = 30;
    
    doc.setFontSize(12);
    doc.setTextColor(3, 153, 148);
    doc.text('ACKNOWLEDGEMENT AND SIGNATURE', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('By signing below, I acknowledge that I have read and agree to both the Operator Owner', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('REC Agreement and the Operator Owner Information Release Authorization', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('presented in this document.', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    if (signatureUrl) {
      try {
        const img = await loadImage(signatureUrl);
        const imgWidth = 40;
        const imgHeight = 20;
        doc.addImage(img, 'PNG', 40, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 5;
      } catch (error) {
        console.error('Error loading signature image:', error);
        doc.line(40, yPosition, 80, yPosition);
        doc.text('Owner Signature', 60, yPosition + 5, { align: 'center' });
        yPosition += 10;
      }
    } else {
      doc.line(40, yPosition, 80, yPosition);
      doc.text('Owner Signature', 60, yPosition + 5, { align: 'center' });
      yPosition += 10;
    }
    
    doc.line(130, yPosition - 10, 170, yPosition - 10);
    doc.text('Date', 150, yPosition - 5, { align: 'center' });
    
    doc.text('Printed Name: ___________________________', 40, yPosition + 10);
    doc.text('Business Name: _________________________', 40, yPosition + 20);
    doc.text('Operator Utility Account Number: _______', 40, yPosition + 30);
    
    doc.save("DCarbon_Operator_Owner_Agreements.pdf");
  };

  if (!isOpen && !showSignatureModal) return null;

  return (
    <>
      {isOpen && !showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={handleModalClose} className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="border-b border-gray-300 mt-4"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                  Terms of Agreement for Operator Owner
                </h2>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownload} className="text-[#15104D] hover:opacity-80">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-300 mb-4"></div>

              <div className="space-y-4 mb-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreementCheckbox1"
                    checked={isChecked1}
                    onChange={(e) => setIsChecked1(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                  />
                  <label htmlFor="agreementCheckbox1" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                    Operator Owner REC Agreement
                  </label>
                </div>

                <div
                  ref={contentRef}
                  className="agreement-content h-[120px] overflow-y-auto mb-4 font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-bold text-[#039994] mb-2">OPERATOR OWNER REC AGREEMENT</h3>
                  <p className="mb-4">
                    This Operator Owner Renewable Energy Certificate (REC) Agreement (the "Agreement") is made between DCarbon Solutions ("Company") and the undersigned operator property owner ("Owner").
                  </p>
                  <p className="mb-2"><strong>1. REC Ownership:</strong> Owner agrees to transfer all rights, title, and interest in the RECs generated by the operator renewable energy system to Company.</p>
                  <p className="mb-2"><strong>2. Term:</strong> This Agreement shall commence on the date of execution and continue for 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
                  <p className="mb-2"><strong>3. Compensation:</strong> Company shall pay Owner $0.03 per kWh for all verified RECs generated by the operator system.</p>
                  <p className="mb-2"><strong>4. Metering:</strong> Owner agrees to provide Company with access to energy production data from the operator renewable energy system.</p>
                  <p className="mb-2"><strong>5. Representations:</strong> Owner represents they have authority to enter this Agreement and transfer RECs for the operator property.</p>
                  <p className="mb-4"><strong>6. Governing Law:</strong> This Agreement shall be governed by the laws of the state where the operator property is located.</p>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreementCheckbox2"
                    checked={isChecked2}
                    onChange={(e) => setIsChecked2(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                  />
                  <label htmlFor="agreementCheckbox2" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                    Information Release Authorization
                  </label>
                </div>

                <div
                  className="agreement-content h-[120px] overflow-y-auto mb-6 font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-bold text-[#039994] mb-2">OPERATOR OWNER INFORMATION RELEASE AUTHORIZATION</h3>
                  <p className="mb-4">
                    This Operator Owner Information Release Authorization ("Authorization") permits DCarbon Solutions to access and use Owner's operator utility data.
                  </p>
                  <p className="mb-2"><strong>1. Authorization:</strong> Owner authorizes Company to access utility account data for the operator property for REC verification and energy management services.</p>
                  <p className="mb-2"><strong>2. Data Use:</strong> Company may use this data to calculate REC production, verify system performance, and provide operator energy reports.</p>
                  <p className="mb-2"><strong>3. Third Parties:</strong> Owner authorizes their utility provider to release consumption and generation data to Company for the operator property.</p>
                  <p className="mb-2"><strong>4. Duration:</strong> This Authorization remains in effect until revoked in writing by Owner.</p>
                  <p className="mb-2"><strong>5. Security:</strong> Company agrees to maintain appropriate safeguards to protect Owner's data.</p>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <button
                  onClick={handleSignFirst}
                  disabled={!isChecked1 || !isChecked2 || isLoading}
                  className={`flex-1 rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors ${
                    isChecked1 && isChecked2 && !isLoading
                      ? "bg-[#039994] hover:bg-[#02857f]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Processing..." : hasSigned ? "Accept" : "Sign Agreement"}
                </button>
                <button
                  onClick={handleModalClose}
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={handleSignatureCancel}
        onComplete={handleSignatureComplete}
      />
    </>
  );
}