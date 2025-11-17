import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import SignatureModal from "./SignatureModal";
import { jsPDF } from "jspdf";

export default function GreenButtonTermsAndCondition({ isOpen, onClose, selectedUtilityProvider }) {
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [scale, setScale] = useState(1);
  const contentRef1 = useRef(null);
  const contentRef2 = useRef(null);
  const videoRef = useRef(null);

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

  const getUtilityUrl = (utilityName) => {
    const utilityUrls = {
      'PG&E': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'Pacific Gas and Electric': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'San Diego Gas and Electric': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SDG&E': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SCE': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US',
      'Southern California Edison': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US'
    };
    
    return utilityUrls[utilityName] || 'https://www.greenbuttondata.org/index.html';
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
      setShowVideoModal(true);
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
  };

  const handleVideoComplete = () => {
    setVideoWatched(true);
    setShowVideoModal(false);
    
    const utilityName = selectedUtilityProvider?.name;
    const url = getUtilityUrl(utilityName);
    setIframeUrl(url);
    setShowIframe(true);
    setScale(1);
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
    doc.text('GREEN BUTTON DATA AUTHORIZATION AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const recText = [
      "This Green Button Data Authorization Agreement (the 'Agreement') is made",
      "between DCarbon Solutions ('Company') and the undersigned customer ('Customer').",
      "",
      "1. Data Authorization: Customer authorizes Company to access their utility data through",
      "the Green Button standard for the purpose of REC verification and energy management.",
      "",
      "2. Green Button Standard: This authorization utilizes the Green Button Connect My Data",
      "standard to securely share utility data with authorized third parties.",
      "",
      "3. Data Scope: Customer authorizes access to electricity usage data, billing information,",
      "and other relevant utility data available through the Green Button standard.",
      "",
      "4. Security: All data transmission follows Green Button security protocols and industry",
      "best practices for data protection.",
      "",
      "5. Duration: This authorization remains in effect until revoked by Customer.",
      "",
      "6. Revocation: Customer may revoke this authorization at any time through their",
      "utility provider's portal or by contacting Company."
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
    doc.text('GREEN BUTTON DATA USAGE AUTHORIZATION', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const releaseText = [
      "This Green Button Data Usage Authorization ('Authorization') permits DCarbon",
      "Solutions to access and use Customer's utility data through the Green Button standard.",
      "",
      "1. Authorization: Customer authorizes Company to access their Green Button data for",
      "the purpose of REC verification, energy management, and sustainability reporting.",
      "",
      "2. Data Use: Company may use Green Button data to calculate REC production, verify",
      "system performance, provide energy reports, and support sustainability initiatives.",
      "",
      "3. Third Parties: Customer authorizes their utility provider to release Green Button",
      "data to Company through secure API connections.",
      "",
      "4. Data Security: Company agrees to maintain appropriate safeguards and follow",
      "Green Button security standards to protect Customer's data.",
      "",
      "5. Compliance: Company agrees to comply with all applicable data protection laws",
      "and Green Button implementation standards."
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
    doc.text('By signing below, I acknowledge that I have read and agree to both the Green Button', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('Data Authorization Agreement and the Green Button Data Usage Authorization', 105, yPosition, { align: 'center' });
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
    
    doc.save("DCarbon_GreenButton_Agreements.pdf");
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

  if (showVideoModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                {selectedUtilityProvider?.name} Authorization Instructions
              </h2>
              <button onClick={() => setShowVideoModal(false)} className="text-red-500 hover:text-red-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                <strong>Important:</strong> Please watch this instructional video to understand how to complete the {selectedUtilityProvider?.name} authorization process.
              </p>
              
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-lg font-semibold">Instructional Video</p>
                  <p className="text-sm opacity-75">Video demonstration for {selectedUtilityProvider?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated time: 2-3 minutes</span>
                <span>Mandatory viewing</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={() => setShowVideoModal(false)}
                className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVideoComplete}
                className="flex-1 rounded-md text-white font-semibold py-3 bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                I've Watched the Video - Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showIframe) {
    const utilityName = selectedUtilityProvider?.name;
    const url = getUtilityUrl(utilityName);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">
              {utilityName} Authorization
            </h3>
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
          
          <div className="p-4 bg-green-50 border-b border-green-200">
            <p className="text-sm text-green-700">
              <strong>{utilityName} Authorization:</strong> Follow the steps to securely share your utility data with DCarbon Solutions.
            </p>
            <p className="text-sm text-green-700 mt-1">
              <strong>Selected Utility:</strong> {utilityName}
            </p>
            <p className="text-sm text-green-700 mt-1">
              <strong>Authorization URL:</strong> {url}
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
                  src={url}
                  className="w-full h-full border-0"
                  title={`${utilityName} Authorization`}
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
                  Green Button Terms of Agreement
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
                  <h3 className="font-bold text-[16px] text-[#039994]">GREEN BUTTON DATA AUTHORIZATION AGREEMENT</h3>
                  <div
                    ref={contentRef1}
                    className="agreement-content h-[180px] overflow-y-auto font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="mb-4">
                      This Green Button Data Authorization Agreement (the "Agreement") is made between DCarbon Solutions ("Company") and the undersigned customer ("Customer").
                    </p>
                    <p className="mb-2"><strong>1. Data Authorization:</strong> Customer authorizes Company to access their utility data through the Green Button standard for the purpose of REC verification and energy management.</p>
                    <p className="mb-2"><strong>2. Green Button Standard:</strong> This authorization utilizes the Green Button Connect My Data standard to securely share utility data with authorized third parties.</p>
                    <p className="mb-2"><strong>3. Data Scope:</strong> Customer authorizes access to electricity usage data, billing information, and other relevant utility data available through the Green Button standard.</p>
                    <p className="mb-2"><strong>4. Security:</strong> All data transmission follows Green Button security protocols and industry best practices for data protection.</p>
                    <p className="mb-2"><strong>5. Duration:</strong> This authorization remains in effect until revoked by Customer.</p>
                    <p className="mb-2"><strong>6. Revocation:</strong> Customer may revoke this authorization at any time through their utility provider's portal or by contacting Company.</p>
                    <p className="mb-2"><strong>7. Data Usage:</strong> Company will use the data solely for REC verification, energy management, and sustainability reporting purposes.</p>
                    <p className="mb-2"><strong>8. Compliance:</strong> Company agrees to comply with all applicable data protection laws and regulations.</p>
                    <p className="mb-2"><strong>9. Customer Rights:</strong> Customer maintains the right to access, correct, and delete their data as permitted by law.</p>
                    <p className="mb-2"><strong>10. Agreement:</strong> This document constitutes the complete agreement between the parties regarding Green Button data authorization.</p>
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
                      I have read and understand the Green Button Data Authorization Agreement
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[16px] text-[#039994]">GREEN BUTTON DATA USAGE AUTHORIZATION</h3>
                  <div
                    ref={contentRef2}
                    className="agreement-content h-[180px] overflow-y-auto font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="mb-4">
                      This Green Button Data Usage Authorization ("Authorization") permits DCarbon Solutions to access and use Customer's utility data through the Green Button standard.
                    </p>
                    <p className="mb-2"><strong>1. Authorization:</strong> Customer authorizes Company to access their Green Button data for the purpose of REC verification, energy management, and sustainability reporting.</p>
                    <p className="mb-2"><strong>2. Data Use:</strong> Company may use Green Button data to calculate REC production, verify system performance, provide energy reports, and support sustainability initiatives.</p>
                    <p className="mb-2"><strong>3. Third Parties:</strong> Customer authorizes their utility provider to release Green Button data to Company through secure API connections.</p>
                    <p className="mb-2"><strong>4. Data Security:</strong> Company agrees to maintain appropriate safeguards and follow Green Button security standards to protect Customer's data.</p>
                    <p className="mb-2"><strong>5. Compliance:</strong> Company agrees to comply with all applicable data protection laws and Green Button implementation standards.</p>
                    <p className="mb-2"><strong>6. Data Retention:</strong> Company will retain utility data only for as long as necessary to provide the authorized services.</p>
                    <p className="mb-2"><strong>7. Purpose Limitation:</strong> Data will only be used for the purposes outlined in this Authorization and related agreements.</p>
                    <p className="mb-2"><strong>8. Transparency:</strong> Company will provide Customers with access to information about how their data is being used.</p>
                    <p className="mb-2"><strong>9. Data Quality:</strong> Company will take reasonable steps to ensure the accuracy and completeness of the data used.</p>
                    <p className="mb-2"><strong>10. Incident Response:</strong> Company will promptly notify Customers in the event of any data security incidents affecting their information.</p>
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
                      I have read and understand the Green Button Data Usage Authorization
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