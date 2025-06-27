import React, { useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import GeneratorReport from './GeneratorReport';
import MonthlyStatement from './MonthlyStatement';

const GeneratorMonthlyReport = () => {
  const [currentView, setCurrentView] = useState('generator');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center text-[#039994] font-[600] text-[24px] leading-[100%] tracking-[-0.05em] font-sfpro"
            >
              {currentView === 'generator' ? 'Generator Report' : 'Monthly Statement'}
              <HiOutlineChevronDown className={`ml-2 h-5 w-5 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentView('generator');
                      setShowDropdown(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${currentView === 'generator' ? 'bg-gray-100 text-[#039994]' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Generator Report
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('monthly');
                      setShowDropdown(false);
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${currentView === 'monthly' ? 'bg-gray-100 text-[#039994]' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Monthly Statement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render the appropriate component based on currentView */}
      {currentView === 'generator' ? <GeneratorReport /> : <MonthlyStatement />}
    </div>
  );
};

export default GeneratorMonthlyReport;