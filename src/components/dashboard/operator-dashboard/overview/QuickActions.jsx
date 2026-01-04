import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";

const CommercialRegistrationModal = dynamic(
  () => import("./modals/createfacility/CommercialRegistrationModal"),
  { ssr: false }
);
const AddCommercialFacilityModal = dynamic(
  () => import("./modals/createfacility/ownerRegistration/AddCommercialFacilityModal"),
  { ssr: false }
);
const ResolvePendingActionsModal = dynamic(
  () => import("./modals/ResolvePendingActionsModal"),
  { ssr: false }
);
const CurrentStatementModal = dynamic(
  () => import("./modals/CurrentStatementModal"),
  { ssr: false }
);
const InviteCollaboratorModal = dynamic(
  () => import("./modals/InviteCollaboratorModal"),
  { ssr: false }
);
const SignatureModal = dynamic(
  () => import("./modals/SignatureModal"),
  { ssr: false }
);

export default function QuickActions() {
  const [modal, setModal] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);
  const [hasAcceptedAgreement, setHasAcceptedAgreement] = useState(false);
  const [isCheckingAgreement, setIsCheckingAgreement] = useState(true);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementIsChecked1, setAgreementIsChecked1] = useState(false);
  const [agreementIsChecked2, setAgreementIsChecked2] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [agreementIsLoading, setAgreementIsLoading] = useState(false);
  const [agreementHasSigned, setAgreementHasSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const agreementContentRef = useRef(null);

  useEffect(() => {
    checkUserRegistration();
    checkUserAgreement();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (agreementContentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = agreementContentRef.current;
      }
    };

    if (agreementContentRef.current) {
      agreementContentRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (agreementContentRef.current) {
        agreementContentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const checkUserRegistration = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
    
    if (loginResponse?.data?.user?.agreements !== null &&
        loginResponse?.data?.user?.utilityAuth?.length > 0) {
      setHasCompletedRegistration(true);
    }

    if (loginResponse?.data?.user?.agreements === null &&
        loginResponse?.data?.user?.utilityAuth?.length === 0) {
      setIsDisabled(true);
    }
  };

  const checkUserAgreement = async () => {
    try {
      setIsCheckingAgreement(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      if (!userId || !authToken) {
        setHasAcceptedAgreement(false);
        setIsCheckingAgreement(false);
        return;
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

      if (response.ok && data.status === 'success' && data.data?.termsAccepted === true) {
        setHasAcceptedAgreement(true);
        setSignatureUrl(data.data?.signature);
      } else {
        setHasAcceptedAgreement(false);
      }
    } catch (error) {
      console.error('Error checking agreement:', error);
      setHasAcceptedAgreement(false);
    } finally {
      setIsCheckingAgreement(false);
    }
  };

  const fetchUserAgreement = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
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
      setAgreementIsLoading(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
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
      setAgreementIsLoading(false);
    }
  };

  const handleSignFirst = () => {
    if (!agreementIsChecked1 || !agreementIsChecked2) {
      toast.error('Please accept both agreement terms first');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureModal(false);
    setAgreementHasSigned(true);
    const agreementData = await fetchUserAgreement();
    if (agreementData && agreementData.signature) {
      setSignatureUrl(agreementData.signature);
    }
    const success = await acceptUserAgreementTerms();
    if (success) {
      setShowAgreementModal(false);
      checkUserAgreement();
      setModal("add");
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
    window.location.reload();
  };

  const handleAgreementModalClose = () => {
    setShowAgreementModal(false);
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
    
    doc.setFontSize(16);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMERCIAL OPERATOR REC AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const recText = [
      "This Commercial Operator Renewable Energy Certificate (REC) Agreement (the 'Agreement') is made between",
      "DCarbon Solutions ('Company') and the undersigned commercial operator ('Operator').",
      "",
      "1. REC Ownership: Operator agrees to transfer all rights, title, and interest in the RECs generated",
      "by their commercial renewable energy system to Company.",
      "",
      "2. Term: This Agreement shall commence on the date of execution and continue for a period of",
      "12 months, automatically renewing for successive 12-month terms unless terminated.",
      "",
      "3. Compensation: Company shall pay Operator $0.03 per kWh for all verified RECs generated by",
      "Operator's commercial system.",
      "",
      "4. Metering: Operator agrees to provide Company with access to energy production data from",
      "their commercial renewable energy system.",
      "",
      "5. Representations: Operator represents they have the authority to enter this Agreement and",
      "transfer RECs on behalf of the commercial property.",
      "",
      "6. Governing Law: This Agreement shall be governed by the laws of the state where the system",
      "is located."
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
    
    doc.setFontSize(16);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('COMMERCIAL OPERATOR INFORMATION RELEASE', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('AUTHORIZATION', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const releaseText = [
      "This Commercial Operator Information Release Authorization ('Authorization') permits DCarbon",
      "Solutions to access and use Operator's commercial utility data.",
      "",
      "1. Authorization: Operator authorizes Company to access their commercial utility account data for the",
      "purpose of REC verification and energy management services.",
      "",
      "2. Data Use: Company may use this data to calculate REC production, verify system performance,",
      "and provide energy reports for commercial operations.",
      "",
      "3. Third Parties: Operator authorizes their utility provider to release commercial consumption and",
      "generation data to Company.",
      "",
      "4. Duration: This Authorization remains in effect until revoked in writing by Operator.",
      "",
      "5. Security: Company agrees to maintain appropriate safeguards to protect Operator's commercial data."
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
    
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.text('ACKNOWLEDGEMENT AND SIGNATURE', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('By signing below, I acknowledge that I have read and agree to both the Commercial Operator', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('REC Agreement and the Commercial Operator Information Release Authorization', 105, yPosition, { align: 'center' });
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
        doc.text('Authorized Signature', 60, yPosition + 5, { align: 'center' });
        yPosition += 10;
      }
    } else {
      doc.line(40, yPosition, 80, yPosition);
      doc.text('Authorized Signature', 60, yPosition + 5, { align: 'center' });
      yPosition += 10;
    }
    
    doc.line(130, yPosition - 10, 170, yPosition - 10);
    doc.text('Date', 150, yPosition - 5, { align: 'center' });
    yPosition += 20;
    
    doc.text('Printed Name: ___________________________', 40, yPosition);
    yPosition += 10;
    doc.text('Business Name: _________________________', 40, yPosition);
    yPosition += 10;
    doc.text('Commercial Utility Account Number: _________________', 40, yPosition);
    
    doc.save("DCarbon_Commercial_Operator_Agreements.pdf");
  };

  const openModal = (type) => {
    if (isDisabled && type !== "add") return;
    if (type === "resolve" || type === "statement") return;
    
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail;
    
    if (type === "add" && userEmail) {
      if (hasAcceptedAgreement) {
        setModal("add");
      } else {
        setShowAgreementModal(true);
      }
    } else {
      setModal(type);
    }
  };

  const closeModal = () => {
    setModal("");
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
          onClick={() => openModal("add")}
        >
          <img
            src="/vectors/MapPinPlus.png"
            alt="Map Pin Plus"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white font-bold text-sm leading-tight">
            Authorize <br />
            Commercial Facility
          </p>
        </div>

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
        >
          <img
            src="/vectors/Files.png"
            alt="Files"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-[1px] border-green-500 w-full mb-2" />
          <p className="text-black text-sm leading-tight">
            Resolve <br />
            <span className="font-bold">Pending Actions</span>
          </p>
        </div>

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-not-allowed"}`}
          style={{
            background: "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
        >
          <img
            src="/vectors/HandCoins.png"
            alt="Hand Coins"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm leading-tight">
            Current <br />
            Statement
          </p>
        </div>

        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer hover:opacity-90 transition-opacity ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            background: "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
          onClick={() => openModal("invite")}
        >
          <img
            src="/vectors/Share.png"
            alt="Share"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm leading-tight">
            Invite <br />
            <span className="font-bold">Customer</span>
          </p>
        </div>
      </div>

      {modal === "add" && (
        <CommercialRegistrationModal isOpen onClose={closeModal} />
      )}
      {modal === "invite" && <InviteCollaboratorModal isOpen onClose={closeModal} />}

      {showAgreementModal && !showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={handleAgreementModalClose} className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="border-b border-gray-300 mt-4"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                  Terms of Agreement For Commercial Operator
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

              <div
                ref={agreementContentRef}
                className="agreement-content h-[300px] overflow-y-auto mb-6 font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-bold text-[#039994] mb-2">COMMERCIAL OPERATOR REC AGREEMENT</h3>
                  <p className="mb-4">
                    This Commercial Operator Renewable Energy Certificate (REC) Agreement (the "Agreement") is made between DCarbon Solutions ("Company") and the undersigned commercial operator ("Operator").
                  </p>
                  <p className="mb-2"><strong>1. REC Ownership:</strong> Operator agrees to transfer all rights, title, and interest in the RECs generated by their commercial renewable energy system to Company.</p>
                  <p className="mb-2"><strong>2. Term:</strong> This Agreement shall commence on the date of execution and continue for a period of 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
                  <p className="mb-2"><strong>3. Compensation:</strong> Company shall pay Operator $0.03 per kWh for all verified RECs generated by Operator's commercial system.</p>
                  <p className="mb-2"><strong>4. Metering:</strong> Operator agrees to provide Company with access to energy production data from their commercial renewable energy system.</p>
                  <p className="mb-2"><strong>5. Representations:</strong> Operator represents they have the authority to enter this Agreement and transfer RECs on behalf of the commercial property.</p>
                  <p className="mb-4"><strong>6. Governing Law:</strong> This Agreement shall be governed by the laws of the state where the system is located.</p>
                  
                  <div className="flex items-start mb-6">
                    <input
                      type="checkbox"
                      id="agreementCheckbox1"
                      checked={agreementIsChecked1}
                      onChange={(e) => setAgreementIsChecked1(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                    />
                    <label htmlFor="agreementCheckbox1" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                      I agree to the Commercial Operator REC Agreement
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-300 my-6 pt-6">
                  <h3 className="font-bold text-[#039994] mb-2">COMMERCIAL OPERATOR INFORMATION RELEASE AUTHORIZATION</h3>
                  <p className="mb-4">
                    This Commercial Operator Information Release Authorization ("Authorization") permits DCarbon Solutions to access and use Operator's commercial utility data.
                  </p>
                  <p className="mb-2"><strong>1. Authorization:</strong> Operator authorizes Company to access their commercial utility account data for the purpose of REC verification and energy management services.</p>
                  <p className="mb-2"><strong>2. Data Use:</strong> Company may use this data to calculate REC production, verify system performance, and provide energy reports for commercial operations.</p>
                  <p className="mb-2"><strong>3. Third Parties:</strong> Operator authorizes their utility provider to release commercial consumption and generation data to Company.</p>
                  <p className="mb-2"><strong>4. Duration:</strong> This Authorization remains in effect until revoked in writing by Operator.</p>
                  <p className="mb-4"><strong>5. Security:</strong> Company agrees to maintain appropriate safeguards to protect Operator's commercial data.</p>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreementCheckbox2"
                      checked={agreementIsChecked2}
                      onChange={(e) => setAgreementIsChecked2(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                    />
                    <label htmlFor="agreementCheckbox2" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                      I agree to the Information Release Authorization
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <button
                  onClick={handleSignFirst}
                  disabled={!agreementIsChecked1 || !agreementIsChecked2 || agreementIsLoading}
                  className={`flex-1 rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors ${
                    agreementIsChecked1 && agreementIsChecked2 && !agreementIsLoading
                      ? "bg-[#039994] hover:bg-[#02857f]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {agreementIsLoading ? "Processing..." : agreementHasSigned ? "Accept" : "Sign Agreement"}
                </button>
                <button
                  onClick={handleAgreementModalClose}
                  disabled={agreementIsLoading}
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
    </div>
  );
}