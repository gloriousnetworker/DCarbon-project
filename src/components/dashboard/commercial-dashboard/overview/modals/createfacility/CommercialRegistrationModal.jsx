import React, { useState } from "react";
import * as styles from '../styles';

export default function CommercialRegistrationModal({ isOpen, onClose, onBack }) {
  const [selectedRole, setSelectedRole] = useState('Owner');

  if (!isOpen) return null;

  const handleNext = () => {
    console.log("Selected role:", selectedRole);
  };

  const getHeaderTitle = () => {
    switch(selectedRole) {
      case 'Owner':
        return "Owner's Registration";
      case 'Operator':
        return "Operator's Registration";
      case 'Both':
        return "Both Registration";
      default:
        return "Owner's Registration";
    }
  };

  const getRoleDescription = (role) => {
    return "Lorem ipsum dolor sit amet consectetur. Gravida dictum eget turpis hendrerit ultricies faucibus egestas erat. Donec auctor orci orci sapien fermentum pharetra. Eget tempor odio ut lacinia dictum justo suspendisse amet tempor. Quis risus tellus commodo mauris dui. Est egestas netus.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <button
                onClick={onBack}
                className="text-[#039994] mr-4"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            
            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
              {getHeaderTitle()}
            </h2>

            <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
              <div className="h-1 bg-[#039994] rounded-full" style={{ width: '25%' }}></div>
            </div>
            <div className="text-right mb-6">
              <span className="text-[12px] font-medium text-gray-500 font-sfpro">01/04</span>
            </div>

            <div>
              <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Commercial Role
              </label>
              
              <div className="mb-3">
                <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRole === 'Owner' ? 'bg-white' : 'bg-[#F0F0F0]'}`}>
                  <div className="flex-1 pr-3">
                    <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                      Owner
                    </div>
                    {selectedRole === 'Owner' && (
                      <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                        {getRoleDescription('Owner')}
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="commercialRole"
                    value="Owner"
                    checked={selectedRole === 'Owner'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                  />
                </label>
              </div>

              <div className="mb-3">
                <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRole === 'Operator' ? 'bg-white' : 'bg-[#F0F0F0]'}`}>
                  <div className="flex-1 pr-3">
                    <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                      Operator
                    </div>
                    {selectedRole === 'Operator' && (
                      <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                        {getRoleDescription('Operator')}
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="commercialRole"
                    value="Operator"
                    checked={selectedRole === 'Operator'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                  />
                </label>
              </div>

              <div className="mb-6">
                <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRole === 'Both' ? 'bg-white' : 'bg-[#F0F0F0]'}`}>
                  <div className="flex-1 pr-3">
                    <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                      Both
                    </div>
                    {selectedRole === 'Both' && (
                      <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                        {getRoleDescription('Both')}
                      </div>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="commercialRole"
                    value="Both"
                    checked={selectedRole === 'Both'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                  />
                </label>
              </div>

              <button
                onClick={handleNext}
                className="w-full rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
              >
                Next
              </button>

              <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                <span>Terms and Conditions</span>
                <span className="mx-2">&</span>
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}