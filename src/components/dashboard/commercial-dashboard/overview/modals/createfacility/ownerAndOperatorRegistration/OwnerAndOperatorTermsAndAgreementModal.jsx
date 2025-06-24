import React, { useState, useRef, useEffect } from "react";

export default function OwnerAndOperatorTermsAndAgreementModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="border-b border-black"></div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
              Terms of Agreement For Owner and Operator
            </h2>
            <button className="text-[#039994] text-[12px] font-medium underline">
              Download
            </button>
          </div>

          <div className="border-b border-black mb-4"></div>

          <div className="flex items-start mb-4">
            <input
              type="checkbox"
              id="agreementCheckbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994]"
            />
            <label
              htmlFor="agreementCheckbox"
              className="ml-2 font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#039994]"
            >
              DCarbon Information Release Agreement
            </label>
          </div>

          <div
            ref={contentRef}
            className="h-[300px] overflow-y-auto mb-6 font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#1E1E1E]"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudentium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto betea vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequaturur magni dolores oes qui ridone voluptatem sequi nescjunt. Neque porro quiseuram est, qui dolorem ipsum quia dolor sit amet, consectetur, adipiscivent, sed quia non immquam eius mod tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut wisi enim ad minim veniam, quis nostrud exercitation ullamcorper suscipit lobortis nisi ut aliquip ex ea commodo consequat. Duis autem vel eum irure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et lusito odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue mihil imperdiet doming id quod maxim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam nonummy nibh euismod
          </div>

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="w-[48%] rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
            >
              Decline
            </button>
            <button
              onClick={onClose}
              disabled={!isChecked || !scrolledToBottom}
              className={`w-[48%] rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${
                isChecked && scrolledToBottom
                  ? "bg-[#039994] hover:bg-[#02857f]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}