import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { HiOutlineArrowLeft, HiOutlineEye, HiOutlinePaperClip } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  buttonPrimary,
} from './styles';

const SendReminderModal = lazy(() => import('./CustomerDetailsReminder'));

const documentationFields = [
  { key: 'nemAgreement',       label: 'NEM Agreement (NEM)',        endpoint: 'interconnection' },
  { key: 'meterIdPhoto',       label: 'Meter ID Photo',             endpoint: 'meter-id' },
  { key: 'installerAgreement', label: 'Installer Agreement',        endpoint: 'installer' },
  { key: 'singleLineDiagram',  label: 'Single Line Diagram',        endpoint: 'single-line' },
  { key: 'utilityPtoLetter',   label: 'Utility PTO Letter',         endpoint: 'utility-pto' },
];

const statusStyles = {
  Required:  { bg: 'bg-[#FFB20017]', text: 'text-[#FFB200]' },
  Submitted: { bg: 'bg-[#93939321]', text: 'text-[#939393]' },
  Approved:  { bg: 'bg-[#069B9621]', text: 'text-[#056C69]' },
  Rejected:  { bg: 'bg-[#FF000017]', text: 'text-[#FF0000]' },
};

const progressSteps = [
  { label: 'Invitation sent',       color: '#000000' },
  { label: 'Documents Pending',     color: '#FFB200' },
  { label: 'Documents Rejected',    color: '#7CABDE' },
  { label: 'Registration Complete', color: '#056C69' },
  { label: 'Active',                color: '#00B4AE' },
  { label: 'Terminated',            color: '#FF0000' },
];

export default function CustomerDetails({ customer, onBack }) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docs, setDocs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const email = customer.inviteeEmail || customer.email;
        if (!email) throw new Error('No email for customer');
        const { data } = await axios.get(
          `https://services.dcarbon.solutions/api/user/partner/details/${email}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (data.status === 'success') {
          setCustomerDetails(data.data);
          // initialize docs state
          const initial = {};
          documentationFields.forEach(f => {
            const docObj = data.data.documentation?.[f.key] || null;
            initial[f.key] = {
              file: docObj?.fileName || null,
              url: docObj?.url || null,
              status: docObj
                ? docObj.approved
                  ? 'Approved'
                  : docObj.rejected
                    ? 'Rejected'
                    : 'Submitted'
                : 'Required'
            };
          });
          setDocs(initial);
        }
      } catch (err) {
        console.error(err);
        // Check specifically for 404 status to handle user not found scenario
        if (err.response && err.response.status === 404) {
          setUserNotFound(true);
        } else {
          setError(err.message || 'Failed to load');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [customer]);

  const handleFileChange = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const userId = customerDetails.id;
    const authToken = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);
  
    const field = documentationFields.find(f => f.key === key);
    const url = `https://services.dcarbon.solutions/api/user/documentation/${field.endpoint}/${userId}`;
  
    try {
      const res = await axios.put(url, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (res.data.status === 'success') {
        const data = res.data.data;
        
        // Create a mapping between our keys and the API response keys
        const statusKeyMap = {
          nemAgreement: 'interconnectionStatus',
          meterIdPhoto: 'meterIdStatus',
          installerAgreement: 'installerAgreementStatus',
          singleLineDiagram: 'singleLineDiagramStatus',
          utilityPtoLetter: 'utilityPTOLetterStatus',
        };
        
        // Get the status from the response
        const statusFromApi = data[statusKeyMap[key]]?.toLowerCase() || 'submitted';
        
        // Determine the display status
        let displayStatus;
        switch(statusFromApi) {
          case 'approved':
            displayStatus = 'Approved';
            break;
          case 'rejected':
            displayStatus = 'Rejected';
            break;
          case 'required':
            displayStatus = 'Required';
            break;
          default:
            displayStatus = 'Submitted';
        }
        
        // Get the URL from the response
        const urlKeyMap = {
          nemAgreement: 'interconnectionAgreement',
          meterIdPhoto: 'meterIdPhoto',
          installerAgreement: 'installerAgreement',
          singleLineDiagram: 'singleLineDiagram',
          utilityPtoLetter: 'utilityPTOLetter',
        };
        
        const newUrl = data[urlKeyMap[key]] || null;

        // Update the state with the new document info
        setDocs(prev => ({
          ...prev,
          [key]: {
            file: file.name,
            url: newUrl,
            status: displayStatus,
          }
        }));
        
        // Also update the customerDetails state to ensure persistence
        if (customerDetails && customerDetails.documentation) {
          setCustomerDetails(prev => ({
            ...prev,
            documentation: {
              ...prev.documentation,
              [key]: {
                fileName: file.name,
                url: newUrl,
                approved: displayStatus === 'Approved',
                rejected: displayStatus === 'Rejected',
              }
            }
          }));
        }
        
        toast.success(res.data.message || 'Document uploaded successfully');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleView = key => {
    const url = docs[key]?.url;
    if (url) window.open(url, '_blank');
  };

  const handleSendReminder = () => {
    setShowModal(true);
  };

  // static 40% for mock alignment
  const progressPercent = 40;

  if (loading) {
    return (
      <div className={`${mainContainer} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]" />
      </div>
    );
  }
  
  if (userNotFound) {
    return (
      <div className={`${mainContainer} flex flex-col items-center justify-center`}>
        <div className="bg-[#069B960D] border border-[#039994] rounded-lg p-8 max-w-lg text-center">
          <div className="text-4xl mb-4 text-[#039994]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">User Not Found</h2>
          <p className="text-[#626060] mb-6">
            This user has not been registered with DCarbon. You can send them a reminder to complete their registration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleSendReminder} 
              className="bg-[#039994] text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Send Registration Reminder
            </button>
            <button 
              onClick={onBack} 
              className="border border-[#039994] text-[#039994] px-6 py-2 rounded-md hover:bg-[#069B960D] transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
        
        {/* Send Reminder Modal */}
        {showModal && (
          <Suspense fallback={<div>Loading…</div>}>
            <SendReminderModal
              email={customer.inviteeEmail || customer.email}
              onClose={() => setShowModal(false)}
            />
          </Suspense>
        )}
      </div>
    );
  }
  
  if (error || !customerDetails) {
    return (
      <div className={`${mainContainer} flex flex-col items-center justify-center`}>
        <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-6 max-w-lg text-center">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Failed to load customer details'}
          </div>
          <p className="text-gray-600 mb-4">
            There was a problem loading the customer information. Please try again or contact support.
          </p>
        </div>
        <button onClick={onBack} className={`${buttonPrimary} px-4 py-2`}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className={mainContainer}>
      {/* Header */}
      <div className={headingContainer}>
        <div className={backArrow} onClick={onBack}>
          <HiOutlineArrowLeft size={24} />
        </div>
        <h1 className={pageTitle}>Customer Details</h1>
        <button
          onClick={() => setShowModal(true)}
          className="absolute right-4 top-0 bg-black text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Send Reminder
        </button>
      </div>

      {/* Send Reminder Modal */}
      {showModal && (
        <Suspense fallback={<div>Loading…</div>}>
          <SendReminderModal
            email={customerDetails.email}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}

      {/* Progress Bar */}
      <div className={progressContainer}>
        <div className={progressBarWrapper}>
          <div
            className={progressBarActive}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center space-x-4 mb-8">
        {progressSteps.map(s => (
          <div key={s.label} className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className={progressStepText}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Customer Card */}
      <div className="w-full max-w-3xl border border-[#039994] bg-[#069B960D] rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-y-4 gap-x-12">
          <div className="font-medium text-[#626060]">Name</div>
          <div className="text-[#1E1E1E]">
            {customerDetails.firstName} {customerDetails.lastName}
          </div>
          <div className="font-medium text-[#626060]">Email Address</div>
          <div className="text-[#1E1E1E]">{customerDetails.email}</div>
          <div className="font-medium text-[#626060]">Phone Number</div>
          <div className="text-[#1E1E1E]">{customerDetails.phoneNumber}</div>
          <div className="font-medium text-[#626060]">Customer Type</div>
          <div className="text-[#1E1E1E]">{customerDetails.userType}</div>
          <div className="font-medium text-[#626060]">Utility Provider</div>
          <div className="text-[#1E1E1E]">{customerDetails.utilityProvider || 'N/A'}</div>
          <div className="font-medium text-[#626060]">Meter ID</div>
          <div className="text-[#1E1E1E]">{customerDetails.meterId || 'N/A'}</div>
          <div className="font-medium text-[#626060]">Address</div>
          <div className="text-[#1E1E1E]">{customerDetails.address || 'N/A'}</div>
          <div className="font-medium text-[#626060]">Date Registered</div>
          <div className="text-[#1E1E1E]">
            {new Date(customerDetails.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Documentation */}
      <h2 className="mb-2 font-[600] text-[20px] text-[#039994]">Documentation</h2>
      <hr className="w-full max-w-3xl mb-6" />

      <div className="w-full max-w-3xl grid grid-cols-3 gap-x-4 gap-y-4">
        {documentationFields.map(f => {
          const { file, status } = docs[f.key] || {};
          const st = statusStyles[status] || statusStyles.Required;

          return (
            <React.Fragment key={f.key}>
              {/* 1) Label */}
              <div className="font-medium text-[#1E1E1E]">
                {f.label}
              </div>

              {/* 2) Upload box */}
              <div className={uploadFieldWrapper}>
                <label className={`${uploadInputLabel} flex items-center justify-between border border-gray-300`}>
                  <span className="truncate max-w-[180px]">
                    {file || 'Upload Document'}
                  </span>
                  <div className={uploadIconContainer}>
                    {file ? (
                      <HiOutlineEye 
                        size={18} 
                        onClick={(e) => {
                          e.preventDefault();
                          handleView(f.key);
                        }} 
                        className="text-gray-600 hover:text-[#039994] cursor-pointer"
                      />
                    ) : (
                      <HiOutlinePaperClip 
                        size={18} 
                        className="text-gray-600"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => handleFileChange(f.key, e)}
                  />
                </label>
              </div>

              {/* 3) Status pill */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}
                >
                  {status}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Back button */}
      <div className="w-full max-w-3xl flex justify-end mt-8">
        <button onClick={onBack} className={`${buttonPrimary} w-auto px-6`}>
          Back to List
        </button>
      </div>
    </div>
  );
}