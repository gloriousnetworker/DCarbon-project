import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import SignatureModal from "./SignatureModal";
import { jsPDF } from "jspdf";

export default function ResidenceTermsAndAgreementModal({ isOpen, onClose }) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [scrolledToBottom1, setScrolledToBottom1] = useState(false);
  const [scrolledToBottom2, setScrolledToBottom2] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scale, setScale] = useState(1);
  const contentRef1 = useRef(null);
  const contentRef2 = useRef(null);

  useEffect(() => {
    const handleScroll1 = () => {
      if (contentRef1.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef1.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setScrolledToBottom1(isBottom);
      }
    };

    const handleScroll2 = () => {
      if (contentRef2.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef2.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setScrolledToBottom2(isBottom);
      }
    };

    if (contentRef1.current) {
      contentRef1.current.addEventListener("scroll", handleScroll1);
    }
    if (contentRef2.current) {
      contentRef2.current.addEventListener("scroll", handleScroll2);
    }

    return () => {
      if (contentRef1.current) {
        contentRef1.current.removeEventListener("scroll", handleScroll1);
      }
      if (contentRef2.current) {
        contentRef2.current.removeEventListener("scroll", handleScroll2);
      }
    };
  }, []);

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

  const initiateUtilityAuth = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!userEmail || !authToken || !userId) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/initiate-utility-auth/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            utilityAuthEmail: userEmail
          })
        }
      );

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Utility authorization initiated successfully!');
        setIframeUrl('https://utilityapi.com/authorize/DCarbon_Solutions');
        setShowIframe(true);
        setScale(1);
        return true;
      } else {
        toast.error('Failed to initiate utility authorization');
        return false;
      }
    } catch (error) {
      toast.error('Failed to initiate utility authorization');
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
    const termsAccepted = await acceptUserAgreementTerms();
    if (termsAccepted) {
      await initiateUtilityAuth();
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
  };

  const handleIframeMessage = (event) => {
    if (event.data && event.data.type === 'utility-auth-complete') {
      setShowIframe(false);
      setShowSuccessModal(true);
    }
  };

  useEffect(() => {
    if (showIframe) {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [showIframe]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const handleIframeClose = () => {
    setShowIframe(false);
    setScale(1);
    onClose();
    window.location.reload();
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'normal');
  
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENTIAL REC AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const recText = [
      "This Residential Renewable Energy Certificate (REC) Agreement (the 'Agreement') is made",
      "between DCarbon Solutions ('Company') and the undersigned customer ('Customer').",
      "",
      "1. REC Ownership: Customer agrees to transfer all rights, title, and interest in the RECs",
      "generated by their renewable energy system to Company.",
      "",
      "2. Term: This Agreement shall commence on the date of execution and continue for 12 months,",
      "automatically renewing for successive 12-month terms unless terminated.",
      "",
      "3. Compensation: Company shall pay Customer $0.02 per kWh for all verified RECs generated",
      "by Customer's system.",
      "",
      "4. Metering: Customer agrees to provide Company with access to energy production data from",
      "their renewable energy system.",
      "",
      "5. Representations: Customer represents they have the authority to enter this Agreement and",
      "transfer RECs.",
      "",
      "6. Governing Law: This Agreement shall be governed by the laws of the state where the",
      "system is located."
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
    doc.text('RESIDENTIAL INFORMATION RELEASE', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('AUTHORIZATION', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const releaseText = [
      "This Residential Information Release Authorization ('Authorization') permits DCarbon",
      "Solutions to access and use Customer's utility data.",
      "",
      "1. Authorization: Customer authorizes Company to access their utility account data for the",
      "purpose of REC verification and energy management services.",
      "",
      "2. Data Use: Company may use this data to calculate REC production, verify system",
      "performance, and provide energy reports.",
      "",
      "3. Third Parties: Customer authorizes their utility provider to release consumption and",
      "generation data to Company.",
      "",
      "4. Duration: This Authorization remains in effect until revoked in writing by Customer.",
      "",
      "5. Security: Company agrees to maintain appropriate safeguards to protect Customer's data."
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
    doc.text('By signing below, I acknowledge that I have read and agree to both the Residential', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('REC Agreement and the Residential Information Release Authorization', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('presented in this document.', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    doc.line(40, yPosition, 80, yPosition);
    doc.text('Customer Signature', 60, yPosition + 5, { align: 'center' });
    
    doc.line(130, yPosition, 170, yPosition);
    doc.text('Date', 150, yPosition + 5, { align: 'center' });
    yPosition += 20;
    
    doc.text('Printed Name: ___________________________', 40, yPosition);
    yPosition += 10;
    doc.text('Address: _______________________________', 40, yPosition);
    yPosition += 10;
    doc.text('Utility Account Number: _________________', 40, yPosition);
    
    doc.save("DCarbon_Residential_Agreements.pdf");
  };

  const handleCloseModal = () => {
    onClose();
    window.location.reload();
  };

  const handleProceedToDashboard = () => {
    setShowSuccessModal(false);
    onClose();
    window.location.reload();
  };

  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">Utility Authorization Portal</h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={zoomOut}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale <= 0.5}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom Out
                </button>
                <button
                  onClick={resetZoom}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21V9M21 3L15 9M9 21H3V15M3 21L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset
                </button>
                <button
                  onClick={zoomIn}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale >= 3}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom In
                </button>
              </div>
              <button
                onClick={handleIframeClose}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Step 1:</strong> Enter the email of your DCarbon account you are authorizing for.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Step 2:</strong> Enter the credentials (username and password) you use to login to your utility billing portal. This data is secure and not stored on our servers per utility regulations.
            </p>
          </div>

          <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg overflow-auto">
              <div 
                className="w-full h-full origin-top-left"
                style={{ 
                  transform: `scale(${scale})`,
                  width: `${100/scale}%`,
                  height: `${100/scale}%`
                }}
              >
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title="Utility Authorization"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-sm text-gray-600">
              Use scroll to navigate when zoomed in
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="mt-3 text-lg font-medium text-gray-900">Authorization Successful</h2>
              <p className="mt-2 text-sm text-gray-500">Waiting for meters to be fetched. You can proceed to your dashboard.</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleProceedToDashboard}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
              >
                Proceed to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen && !showSignatureModal) return null;

  return (
    <>
      {isOpen && !showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                  Terms of Agreement
                </h2>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownload} className="text-[#039994] hover:text-[#02857f] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16L12 4M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={handleCloseModal} className="text-red-500 hover:text-red-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[16px] text-[#039994]">RESIDENTIAL REC AGREEMENT</h3>
                  <div
                    ref={contentRef1}
                    className="agreement-content h-[180px] overflow-y-auto font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="mb-4">
                      This Residential Renewable Energy Certificate (REC) Agreement (the "Agreement") is made between DCarbon Solutions ("Company") and the undersigned customer ("Customer").
                    </p>
                    <p className="mb-2"><strong>1. REC Ownership:</strong> Customer agrees to transfer all rights, title, and interest in the RECs generated by their renewable energy system to Company.</p>
                    <p className="mb-2"><strong>2. Term:</strong> This Agreement shall commence on the date of execution and continue for a period of 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
                    <p className="mb-2"><strong>3. Compensation:</strong> Company shall pay Customer $0.02 per kWh for all verified RECs generated by Customer's system.</p>
                    <p className="mb-2"><strong>4. Metering:</strong> Customer agrees to provide Company with access to energy production data from their renewable energy system.</p>
                    <p className="mb-2"><strong>5. Representations:</strong> Customer represents they have the authority to enter this Agreement and transfer RECs.</p>
                    <p className="mb-2"><strong>6. Governing Law:</strong> This Agreement shall be governed by the laws of the state where the system is located.</p>
                    <p className="mb-2"><strong>7. Termination:</strong> Either party may terminate this Agreement with 30 days written notice.</p>
                    <p className="mb-2"><strong>8. Confidentiality:</strong> Both parties agree to maintain the confidentiality of proprietary information.</p>
                    <p className="mb-2"><strong>9. Indemnification:</strong> Customer agrees to indemnify Company against any claims arising from system operation.</p>
                    <p className="mb-2"><strong>10. Entire Agreement:</strong> This document constitutes the entire agreement between the parties.</p>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreementCheckbox1"
                      checked={isChecked1}
                      onChange={(e) => setIsChecked1(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                    />
                    <label htmlFor="agreementCheckbox1" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                      I have read and understand the Residential REC Agreement
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[16px] text-[#039994]">RESIDENTIAL INFORMATION RELEASE AUTHORIZATION</h3>
                  <div
                    ref={contentRef2}
                    className="agreement-content h-[180px] overflow-y-auto font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="mb-4">
                      This Residential Information Release Authorization ("Authorization") permits DCarbon Solutions to access and use Customer's utility data.
                    </p>
                    <p className="mb-2"><strong>1. Authorization:</strong> Customer authorizes Company to access their utility account data for the purpose of REC verification and energy management services.</p>
                    <p className="mb-2"><strong>2. Data Use:</strong> Company may use this data to calculate REC production, verify system performance, and provide energy reports.</p>
                    <p className="mb-2"><strong>3. Third Parties:</strong> Customer authorizes their utility provider to release consumption and generation data to Company.</p>
                    <p className="mb-2"><strong>4. Duration:</strong> This Authorization remains in effect until revoked in writing by Customer.</p>
                    <p className="mb-2"><strong>5. Security:</strong> Company agrees to maintain appropriate safeguards to protect Customer's data.</p>
                    <p className="mb-2"><strong>6. Data Retention:</strong> Company will retain utility data only for as long as necessary to provide services.</p>
                    <p className="mb-2"><strong>7. Customer Rights:</strong> Customer has the right to request access to their data and request deletion.</p>
                    <p className="mb-2"><strong>8. Purpose Limitation:</strong> Data will only be used for the purposes outlined in this Authorization.</p>
                    <p className="mb-2"><strong>9. Revocation:</strong> Customer may revoke this Authorization at any time by providing written notice.</p>
                    <p className="mb-2"><strong>10. Compliance:</strong> Company agrees to comply with all applicable data protection laws and regulations.</p>
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
                      I have read and understand the Residential Information Release Authorization
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-8">
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
                  onClick={handleCloseModal}
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