'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommercialRegistrationCard() {
  const [loading, setLoading] = useState(false);
  const [userCategory, setUserCategory] = useState('Owner'); // default category
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const router = useRouter();

  const handleCategorySelect = (category) => {
    setUserCategory(category);
    if (category === 'Owner') {
      router.push('/register/owner-registration');
    } else if (category === 'Operator') {
      router.push('/register/operator-registration');
    } else if (category === 'Both') {
      router.push('/register/both-registration');
    }
  };

  const handleTooltipShow = (category) => {
    setHoveredTooltip(category);
  };

  const handleTooltipHide = () => {
    setHoveredTooltip(null);
  };

  const categoryDescriptions = {
    Owner: {
      title: "Facility Owner",
      description: "I am a commercial solar system owner, but do not manage the utility account."
    },
    Operator: {
      title: "Facility Operator", 
      description: "I manage the utility account on a commercial facility with solar, but don't own the system."
    },
    Both: {
      title: "Owner & Operator",
      description: "I own a commercial solar system and pay the utility account."
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {/* Main Container */}
      <div className={mainContainer}>
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-12 object-contain"
          />
        </div>

        {/* Heading */}
        <div className={headingContainer}>
          <h1 className={pageTitle}>
            Select Your Commercial Registration Type
          </h1>
        </div>

        {/* Description */}
        <p className="text-center text-[#1E1E1E] mb-8 font-sfpro max-w-2xl mx-auto">
          Choose the category that best describes your role in the commercial registration process. 
          Hover over each option to learn more about what each role entails.
        </p>

        {/* User Category Buttons with Tooltips */}
        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0 justify-center items-stretch max-w-4xl mx-auto">
          {/* Owner Button */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => handleCategorySelect('Owner')}
              onMouseEnter={() => handleTooltipShow('Owner')}
              onMouseLeave={handleTooltipHide}
              className={`w-full px-6 py-4 rounded-lg text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${buttonPrimary} relative group`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-lg font-semibold">Owner</span>
                <span className="text-xs opacity-70 group-hover:opacity-100">Facility Owner Only</span>
              </div>
            </button>
            
            {/* Tooltip for Owner */}
            {hoveredTooltip === 'Owner' && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-80 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl">
                <div className="font-semibold mb-2 text-[#039994]">{categoryDescriptions.Owner.title}</div>
                <div className="text-gray-200 leading-relaxed">{categoryDescriptions.Owner.description}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Operator Button */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => handleCategorySelect('Operator')}
              onMouseEnter={() => handleTooltipShow('Operator')}
              onMouseLeave={handleTooltipHide}
              className={`w-full px-6 py-4 rounded-lg text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${buttonPrimary} relative group`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-lg font-semibold">Operator</span>
                <span className="text-xs opacity-70 group-hover:opacity-100">Facility Operator Only</span>
              </div>
            </button>
            
            {/* Tooltip for Operator */}
            {hoveredTooltip === 'Operator' && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-80 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl">
                <div className="font-semibold mb-2 text-[#039994]">{categoryDescriptions.Operator.title}</div>
                <div className="text-gray-200 leading-relaxed">{categoryDescriptions.Operator.description}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Both Button */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => handleCategorySelect('Both')}
              onMouseEnter={() => handleTooltipShow('Both')}
              onMouseLeave={handleTooltipHide}
              className={`w-full px-6 py-4 rounded-lg text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${buttonPrimary} relative group`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-lg font-semibold">Both</span>
                <span className="text-xs opacity-70 group-hover:opacity-100">Owner & Operator</span>
              </div>
            </button>
            
            {/* Tooltip for Both */}
            {hoveredTooltip === 'Both' && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-80 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl">
                <div className="font-semibold mb-2 text-[#039994]">{categoryDescriptions.Both.title}</div>
                <div className="text-gray-200 leading-relaxed">{categoryDescriptions.Both.description}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-10 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4 text-center">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="font-medium text-[#039994] mb-2">Owner Registration</div>
              <div>Facility ownership verification and basic information collection</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="font-medium text-[#039994] mb-2">Operator Registration</div>
              <div>API credentials setup and operational permissions configuration</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="font-medium text-[#039994] mb-2">Combined Registration</div>
              <div>Complete ownership and operational setup in one process</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Imported styles from styles.js
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
const buttonPrimary = 'font-[600] text-[14px] leading-[100%] tracking-[-0.05em]';