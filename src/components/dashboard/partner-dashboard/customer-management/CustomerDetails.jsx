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

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const email = customer.inviteeEmail || customer.email;
        if (!email) throw new Error('No email for customer');
        const { data } = await axios.get(
          `https://dcarbon-server.onrender.com/api/user/partner/details/${email}`,
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
        setError(err.message || 'Failed to load');
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
    const url = `https://dcarbon-server.onrender.com/api/user/documentation/${field.endpoint}/${userId}`;

    try {
      const res = await axios.put(url, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.status === 'success') {
        const data = res.data.data;

        const urlKeyMap = {
          nemAgreement: 'interconnectionAgreement',
          meterIdPhoto: 'meterIdPhoto',
          installerAgreement: 'installerAgreement',
          singleLineDiagram: 'singleLineDiagram',
          utilityPtoLetter: 'utilityPTOLetter',
        };
        const statusKeyMap = {
          nemAgreement: 'interconnectionStatus',
          meterIdPhoto: 'meterIdStatus',
          installerAgreement: 'installerAgreementStatus',
          singleLineDiagram: 'singleLineDiagramStatus',
          utilityPtoLetter: 'utilityPTOLetterStatus',
        };

        const newUrl = data[urlKeyMap[key]];
        const newStatus = data[statusKeyMap[key]];

        setDocs(prev => ({
          ...prev,
          [key]: {
            file: file.name,
            url: newUrl,
            status: newStatus.charAt(0) + newStatus.slice(1).toLowerCase(),
          }
        }));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleView = key => {
    const url = docs[key]?.url;
    if (url) window.open(url, '_blank');
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
  if (error || !customerDetails) {
    return (
      <div className={`${mainContainer} flex flex-col items-center justify-center`}>
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
                        onClick={() => handleView(f.key)} 
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