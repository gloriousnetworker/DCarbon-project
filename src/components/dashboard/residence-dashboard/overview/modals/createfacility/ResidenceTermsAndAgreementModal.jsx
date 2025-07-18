import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import SignatureModal from "./SignatureModal";
import { jsPDF } from "jspdf";

export default function ResidenceTermsAndAgreementModal({ isOpen, onClose }) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
      return;
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
        setIframeUrl('https://utilityapi.com/authorize/DCarbon_Solutions');
        setShowIframe(true);
      } else {
        toast.error('Failed to initiate utility authorization');
      }
    } catch (error) {
      toast.error('Failed to initiate utility authorization');
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
    const success = await acceptUserAgreementTerms();
    if (success) {
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

  const handleDownload = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENTIAL REC AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const recText = [
      "This Residential Renewable Energy Certificate (REC) Agreement (the 'Agreement') is made between DCarbon Solutions ('Company') and the undersigned customer ('Customer').",
      "",
      "1. REC Ownership: Customer agrees to transfer all rights, title, and interest in the RECs generated by their renewable energy system to Company.",
      "",
      "2. Term: This Agreement shall commence on the date of execution and continue for a period of 12 months, automatically renewing for successive 12-month terms unless terminated.",
      "",
      "3. Compensation: Company shall pay Customer $0.02 per kWh for all verified RECs generated by Customer's system.",
      "",
      "4. Metering: Customer agrees to provide Company with access to energy production data from their renewable energy system.",
      "",
      "5. Representations: Customer represents they have the authority to enter this Agreement and transfer RECs.",
      "",
      "6. Governing Law: This Agreement shall be governed by the laws of the state where the system is located."
    ];
    
    recText.forEach((line, index) => {
      doc.text(line, 15, 30 + (index * 5));
    });
    
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATION RELEASE AUTHORIZATION', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const releaseText = [
      "This Information Release Authorization ('Authorization') permits DCarbon Solutions to access and use Customer's utility data.",
      "",
      "1. Authorization: Customer authorizes Company to access their utility account data for the purpose of REC verification and energy management services.",
      "",
      "2. Data Use: Company may use this data to calculate REC production, verify system performance, and provide energy reports.",
      "",
      "3. Third Parties: Customer authorizes their utility provider to release consumption and generation data to Company.",
      "",
      "4. Duration: This Authorization remains in effect until revoked in writing by Customer.",
      "",
      "5. Security: Company agrees to maintain appropriate safeguards to protect Customer's data."
    ];
    
    releaseText.forEach((line, index) => {
      doc.text(line, 15, 30 + (index * 5));
    });
    
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.text('ACKNOWLEDGEMENT AND SIGNATURE', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('By signing below, I acknowledge that I have read and agree to both the Residential REC Agreement', 105, 50, { align: 'center' });
    doc.text('and the Information Release Authorization presented in this document.', 105, 55, { align: 'center' });
    
    doc.line(40, 100, 80, 100);
    doc.text('Customer Signature', 60, 105, { align: 'center' });
    
    doc.line(130, 100, 170, 100);
    doc.text('Date', 150, 105, { align: 'center' });
    
    doc.text('Printed Name: ___________________________', 40, 120);
    doc.text('Address: _______________________________', 40, 130);
    doc.text('Utility Account Number: _________________', 40, 140);
    
    doc.save("DCarbon_Agreements.pdf");
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
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">Utility Authorization Portal</h3>
            <button
              onClick={handleCloseModal}
              className="text-red-500 hover:text-red-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Step 1:</strong> Enter the email of your DCarbon account you are authorizing for, then choose your utility provider.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Step 2:</strong> Enter your Utility Account credentials and authorize access when prompted.
            </p>
          </div>
          <iframe
            src={iframeUrl}
            className="w-full h-full"
            title="Utility Authorization"
          />
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
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="border-b border-gray-300 mt-4"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                  Terms of Agreement
                </h2>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownload} className="text-[#15104D] hover:opacity-80">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 6V4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2H15C15.5304 2 16.0391 2.21071 16.4142 2.58579C16.7893 2.96086 17 3.46957 17 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    Residential REC Agreement
                  </label>
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
              </div>

              <div
                ref={contentRef}
                className="agreement-content h-[300px] overflow-y-auto mb-6 font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-bold text-[#039994] mb-2">RESIDENTIAL REC AGREEMENT</h3>
                <p className="mb-4">
                  This Residential Renewable Energy Certificate (REC) Agreement (the "Agreement") is made between DCarbon Solutions ("Company") and the undersigned customer ("Customer").
                </p>
                <p className="mb-2"><strong>1. REC Ownership:</strong> Customer agrees to transfer all rights, title, and interest in the RECs generated by their renewable energy system to Company.</p>
                <p className="mb-2"><strong>2. Term:</strong> This Agreement shall commence on the date of execution and continue for a period of 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
                <p className="mb-2"><strong>3. Compensation:</strong> Company shall pay Customer $0.02 per kWh for all verified RECs generated by Customer's system.</p>
                <p className="mb-2"><strong>4. Metering:</strong> Customer agrees to provide Company with access to energy production data from their renewable energy system.</p>
                <p className="mb-4"><strong>5. Representations:</strong> Customer represents they have the authority to enter this Agreement and transfer RECs.</p>

                <h3 className="font-bold text-[#039994] mb-2">INFORMATION RELEASE AUTHORIZATION</h3>
                <p className="mb-4">
                  This Information Release Authorization ("Authorization") permits DCarbon Solutions to access and use Customer's utility data.
                </p>
                <p className="mb-2"><strong>1. Authorization:</strong> Customer authorizes Company to access their utility account data for the purpose of REC verification and energy management services.</p>
                <p className="mb-2"><strong>2. Data Use:</strong> Company may use this data to calculate REC production, verify system performance, and provide energy reports.</p>
                <p className="mb-2"><strong>3. Third Parties:</strong> Customer authorizes their utility provider to release consumption and generation data to Company.</p>
                <p className="mb-2"><strong>4. Duration:</strong> This Authorization remains in effect until revoked in writing by Customer.</p>
                <p className="mb-2"><strong>5. Security:</strong> Company agrees to maintain appropriate safeguards to protect Customer's data.</p>
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