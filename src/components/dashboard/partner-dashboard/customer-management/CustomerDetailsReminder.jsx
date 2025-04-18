// SendReminderModal.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiX } from 'react-icons/fi'
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const SendReminderModal = ({ email: initialEmail, onClose }) => {
  const [rangeType, setRangeType] = useState('individual')
  const [singleEmail, setSingleEmail] = useState(initialEmail || '')
  const [bulkEmails, setBulkEmails]   = useState([''])
  const [reason, setReason]           = useState('')
  const [description, setDescription] = useState('')
  const [isSending, setIsSending]     = useState(false)
  const [results, setResults]         = useState([])

  useEffect(() => {
    setSingleEmail(initialEmail || '')
  }, [initialEmail])

  const resetForm = () => {
    setRangeType('individual')
    setSingleEmail(initialEmail || '')
    setBulkEmails([''])
    setReason('')
    setDescription('')
    setResults([])
  }

  const validateEmails = (emails) => {
    const re = /\S+@\S+\.\S+/
    return emails.every(e => re.test(e))
  }

  const handleSend = async () => {
    const emails = rangeType === 'individual'
      ? [singleEmail]
      : bulkEmails.filter(Boolean)

    if (emails.length === 0) {
      toast.error('Please enter at least one email')
      return
    }
    if (!validateEmails(emails)) {
      toast.error('Please enter valid email(s)')
      return
    }
    if (!reason) {
      toast.error('Select a reminder reason')
      return
    }

    setIsSending(true)
    try {
      const authToken = localStorage.getItem('authToken')
      const body = { emails, reason, description }

      const res = await axios.post(
        'https://dcarbon-server.onrender.com/api/user/referral-reminders',
        body,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      if (res.data.status === 'success') {
        const { emailStatuses, summary } = res.data.data
        setResults(emailStatuses)
        // show toasts per email
        emailStatuses.forEach(s => {
          s.canSendReminder
            ? toast.success(`Sent: ${s.email}`)
            : toast.error(`Failed: ${s.email}`)
        })
        // summary toast
        toast(
          summary.processedEmails > 0
            ? `${summary.processedEmails} reminder(s) sent`
            : 'No reminders sent',
          { icon: summary.processedEmails > 0 ? <FaCheck /> : <FaTimes /> }
        )
      } else {
        toast.error('Failed to send reminders')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Error sending reminders')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => { resetForm(); onClose() }}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-2 text-[#039994]">Send Reminder</h2>
        <hr className="border-black my-2" />

        {results.length === 0 ? (
          <>
            {/* Range selector */}
            <div className="flex items-center space-x-6 mb-4">
              {['individual','bulk'].map(rt => (
                <label key={rt} className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="range"
                    checked={rangeType === rt}
                    onChange={() => setRangeType(rt)}
                  />
                  <span className="text-sm">{rt === 'individual' ? 'Individual' : 'Bulk'}</span>
                </label>
              ))}
            </div>

            {/* Email inputs */}
            {rangeType === 'individual' ? (
              <div className="relative mb-4">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full px-10 py-2 rounded-md focus:outline-none text-sm bg-[#F1F1F1]"
                  value={singleEmail}
                  onChange={e => setSingleEmail(e.target.value)}
                />
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {bulkEmails.map((em, i) => (
                  <div key={i} className="relative">
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="w-full px-10 py-2 rounded-md focus:outline-none text-sm bg-[#F1F1F1]"
                      value={em}
                      onChange={e => {
                        const arr = [...bulkEmails]
                        arr[i] = e.target.value
                        setBulkEmails(arr)
                      }}
                    />
                    <FaSearch className="absolute top-3 left-3 text-gray-400" />
                    {i > 0 && (
                      <button
                        onClick={() => {
                          const arr = bulkEmails.filter((_, idx) => idx !== i)
                          setBulkEmails(arr)
                        }}
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setBulkEmails([...bulkEmails, ''])}
                  className="text-sm text-[#039994] hover:underline"
                >
                  + Add another email
                </button>
              </div>
            )}

            {/* Reason */}
            <label className="block text-sm mb-1">Reason</label>
            <select
              className="w-full px-3 py-2 rounded-md mb-4 text-sm bg-[#F1F1F1]"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="" disabled>Choose reason</option>
              <option>Registration</option>
              <option>Incorrect Customer Information</option>
              <option>Document Upload</option>
              <option>Document Verification</option>
              <option>Document Rejection</option>
              <option>Document Requirement</option>
            </select>

            {/* Description */}
            <label className="block text-sm mb-1">Description (optional)</label>
            <textarea
              className="w-full px-3 py-2 rounded-md mb-4 text-sm bg-[#F1F1F1]"
              rows={3}
              placeholder="Add details…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <hr className="my-4" />
            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                disabled={isSending}
                className="w-1/2 py-2 rounded-md text-sm bg-[#F2F2F2]"
              >
                Clear
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="w-1/2 py-2 rounded-md text-white text-sm bg-[#039994] hover:bg-[#02857f] disabled:opacity-50"
              >
                {isSending ? 'Sending…' : 'Send Reminder'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-2">Reminder Results</h3>
              <div className="space-y-2">
                {results.map((r,i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{r.email}</p>
                      <p className="text-sm text-gray-600">{r.status}</p>
                    </div>
                    {r.canSendReminder ? (
                      <FaCheck className="text-green-500"/>
                    ) : (
                      <FaTimes className="text-red-500"/>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => { resetForm(); onClose() }}
              className="w-full py-2 rounded-md text-white text-sm bg-[#039994] hover:bg-[#02857f]"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default SendReminderModal
