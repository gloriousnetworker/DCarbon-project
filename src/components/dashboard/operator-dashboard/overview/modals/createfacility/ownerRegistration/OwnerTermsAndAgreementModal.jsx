import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import SignatureModal from "./SignatureModal.jsx";
import UtilityAuthorizationModal from "./UtilityAuthorizationModal.jsx";
import OwnerDetailsModal from "./OwnerDetailsModal.jsx";

export default function OwnerTermsAndAgreementModal({ isOpen, onClose }) {
  const [isChecked, setIsChecked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showOwnerDetailsModal, setShowOwnerDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
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
        const referralResponse = localStorage.getItem('referralResponse');
        if (referralResponse) {
          const referralData = JSON.parse(referralResponse);
          if (referralData.data && referralData.data.inviterId) {
            const operatorId = localStorage.getItem('userId');
            localStorage.setItem('operatorId', operatorId);
            localStorage.setItem('userId', referralData.data.inviterId);
          }
        }
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
    if (!isChecked) {
      toast.error('Please accept the agreement terms first');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureModal(false);
    setHasSigned(true);
    const success = await acceptUserAgreementTerms();
    if (success) {
      setShowUtilityModal(true);
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
  };

  const handleUtilityModalClose = () => {
    setShowUtilityModal(false);
    onClose();
  };

  const handleUtilityModalBack = () => {
    setShowUtilityModal(false);
  };

  const handleDecline = () => {
    setShowOwnerDetailsModal(true);
    onClose();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const text = document.querySelector(".agreement-content").innerText;
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "DCarbon_Agreement.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (showUtilityModal) {
    return (
      <UtilityAuthorizationModal
        isOpen={showUtilityModal}
        onClose={handleUtilityModalClose}
        onBack={handleUtilityModalBack}
      />
    );
  }

  if (showOwnerDetailsModal) {
    return <OwnerDetailsModal isOpen={showOwnerDetailsModal} onClose={() => setShowOwnerDetailsModal(false)} />;
  }

  if (!isOpen && !showSignatureModal) return null;

  return (
    <>
      {isOpen && !showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700">
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
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-300 mb-4"></div>

              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="agreementCheckbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
                />
                <label htmlFor="agreementCheckbox" className="ml-3 font-sans font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                  DCarbon Information Release Agreement
                </label>
              </div>

              <div
                ref={contentRef}
                className="agreement-content h-[300px] overflow-y-auto mb-6 font-sans text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
                <br /><br />
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. 
                <br /><br />
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minim veniam, quis nostrud exercitation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
                <br /><br />
                Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
                <br /><br />
                Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, cons ectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              </div>

              <div className="flex justify-between gap-4">
                <button
                  onClick={handleSignFirst}
                  disabled={!isChecked || isLoading}
                  className={`flex-1 rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors ${
                    isChecked && !isLoading
                      ? "bg-[#039994] hover:bg-[#02857f]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Processing..." : hasSigned ? "Accept" : "Sign Agreement"}
                </button>
                <button
                  onClick={handleDecline}
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