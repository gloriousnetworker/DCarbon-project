"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const DashboardContactSupport = () => {
  // Dummy tickets data
  const initialDummyTickets = [
    {
      id: '1',
      ticketNumber: 'TKT-001',
      subject: 'Authorization Failed for Facility',
      category: 'AUTHORIZATION',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessage: 'I tried to authorize the facility but it keeps showing an error message...',
      conversations: [
        {
          id: '1-1',
          senderType: 'USER',
          senderName: 'You',
          message: 'I tried to authorize the facility but it keeps showing an error message. The system says "Connection timed out" when trying to connect to the utility provider.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          attachment: null
        },
        {
          id: '1-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'Thank you for reaching out. We\'re looking into this authorization issue. Can you please provide the facility name and utility provider?',
          createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          attachment: null
        }
      ],
      user: {
        id: 'user-1',
        name: 'John Operator',
        email: 'john.operator@example.com'
      }
    },
    {
      id: '2',
      ticketNumber: 'TKT-002',
      subject: 'Meter Data Not Syncing',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessage: 'My meter data hasn\'t been syncing for the past 3 days...',
      conversations: [
        {
          id: '2-1',
          senderType: 'USER',
          senderName: 'You',
          message: 'My meter data hasn\'t been syncing for the past 3 days. The dashboard shows "Last updated: 3 days ago".',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          attachment: null
        },
        {
          id: '2-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'We\'ve identified an issue with the data sync service. Our team is working on a fix. We\'ll update you once resolved.',
          createdAt: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
          attachment: null
        },
        {
          id: '2-3',
          senderType: 'USER',
          senderName: 'You',
          message: 'Thank you for the update. Please let me know when it\'s fixed.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-1',
        name: 'John Operator',
        email: 'john.operator@example.com'
      }
    },
    {
      id: '3',
      ticketNumber: 'TKT-003',
      subject: 'Billing Invoice Question',
      category: 'BILLING',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
      updatedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      lastMessage: 'I have a question about the invoice charges...',
      conversations: [
        {
          id: '3-1',
          senderType: 'USER',
          senderName: 'You',
          message: 'I have a question about the invoice charges from last month. There\'s a $50 service fee that I don\'t understand.',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          attachment: 'invoice.pdf'
        },
        {
          id: '3-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'The $50 service fee is for premium support and monitoring services. You can downgrade to the basic plan if you prefer.',
          createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
          attachment: null
        },
        {
          id: '3-3',
          senderType: 'USER',
          senderName: 'You',
          message: 'Thanks for explaining. I\'ll keep the premium plan.',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          attachment: null
        },
        {
          id: '3-4',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'Great! Let us know if you have any other questions.',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-1',
        name: 'John Operator',
        email: 'john.operator@example.com'
      }
    }
  ];

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const router = useRouter();

  // Initialize with dummy data
  useEffect(() => {
    setTickets(initialDummyTickets);
  }, []);

  const generateTicketNumber = () => {
    const nextNumber = tickets.length + 1;
    return `TKT-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading('Creating support ticket...');

    // Simulate API delay
    setTimeout(() => {
      const newTicket = {
        id: Date.now().toString(),
        ticketNumber: generateTicketNumber(),
        subject,
        category,
        priority,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: message.substring(0, 100) + '...',
        conversations: [
          {
            id: `${Date.now()}-1`,
            senderType: 'USER',
            senderName: 'You',
            message,
            createdAt: new Date().toISOString(),
            attachment: null
          }
        ],
        user: {
          id: 'user-1',
          name: 'John Operator',
          email: 'john.operator@example.com'
        }
      };

      setTickets(prev => [newTicket, ...prev]);
      toast.success('Support ticket created successfully!', { id: loadingToast });
      
      setSubject('');
      setCategory('');
      setPriority('MEDIUM');
      setMessage('');
      setShowNewTicket(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSendReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingReply(true);
    const loadingToast = toast.loading('Sending reply...');

    // Simulate API delay
    setTimeout(() => {
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === ticketId) {
          const newConversation = {
            id: `${Date.now()}-${ticket.conversations.length + 1}`,
            senderType: 'USER',
            senderName: 'You',
            message: replyMessage,
            createdAt: new Date().toISOString(),
            attachment: null
          };

          const updatedTicket = {
            ...ticket,
            status: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'OPEN' : ticket.status,
            updatedAt: new Date().toISOString(),
            lastMessage: replyMessage.substring(0, 100) + '...',
            conversations: [...ticket.conversations, newConversation]
          };

          setSelectedTicket(updatedTicket);
          return updatedTicket;
        }
        return ticket;
      });

      setTickets(updatedTickets);
      setReplyMessage('');
      toast.success('Reply sent successfully!', { id: loadingToast });
      setSendingReply(false);
    }, 800);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'OPEN': { color: 'bg-yellow-100 text-yellow-800', icon: <FiAlertCircle className="w-4 h-4" /> },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', icon: <FiClock className="w-4 h-4" /> },
      'RESOLVED': { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="w-4 h-4" /> },
      'CLOSED': { color: 'bg-gray-100 text-gray-800', icon: <FiCheckCircle className="w-4 h-4" /> }
    };
    
    const config = statusConfig[status] || statusConfig.OPEN;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'LOW': 'bg-gray-100 text-gray-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  const styles = {
    mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
    headingContainer: 'relative w-full flex flex-col items-center mb-6',
    backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10 hover:text-[#02857f]',
    pageTitle: 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center',
    ticketCard: 'w-full bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:border-[#039994] transition-all cursor-pointer',
    ticketHeader: 'flex justify-between items-start mb-3',
    ticketSubject: 'text-lg font-semibold text-gray-800 mb-1',
    ticketMeta: 'flex items-center gap-4 text-sm text-gray-600 mb-2',
    ticketPreview: 'text-gray-600 text-sm line-clamp-2',
    newTicketBtn: 'px-6 py-3 bg-[#039994] text-white font-medium rounded-lg hover:bg-[#02857f] transition-all',
    modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    modalContent: 'bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden',
    modalHeader: 'px-6 py-4 border-b border-gray-200 flex justify-between items-center',
    modalTitle: 'text-xl font-semibold text-gray-800',
    closeBtn: 'text-gray-500 hover:text-gray-700 text-2xl',
    formContainer: 'px-6 py-4',
    labelClass: 'block mb-2 font-medium text-gray-700',
    inputClass: 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]',
    selectClass: 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] bg-white',
    textareaClass: 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] min-h-[120px]',
    submitBtn: 'w-full py-3 bg-[#039994] text-white font-medium rounded-lg hover:bg-[#02857f] disabled:opacity-50 disabled:cursor-not-allowed',
    conversationContainer: 'space-y-4 max-h-[400px] overflow-y-auto p-4',
    messageBubble: 'max-w-[80%] rounded-lg p-3',
    userMessage: 'bg-blue-50 border border-blue-100 ml-auto',
    adminMessage: 'bg-gray-50 border border-gray-200',
    replySection: 'border-t border-gray-200 p-4',
    replyInput: 'w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#039994]',
    sendBtn: 'ml-2 px-4 py-2.5 bg-[#039994] text-white rounded-lg hover:bg-[#02857f] disabled:opacity-50',
    emptyState: 'text-center py-12 text-gray-500',
    loadingSpinner: 'flex justify-center items-center h-48',
    ticketStatus: 'flex items-center gap-2 mt-2'
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headingContainer}>
        <button onClick={() => router.back()} className={styles.backArrow}>
          <FiArrowLeft size={24} />
        </button>
        <h1 className={styles.pageTitle}>Support Center</h1>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">My Support Tickets</h2>
          <button 
            onClick={() => setShowNewTicket(true)}
            className={styles.newTicketBtn}
          >
            <FiMessageSquare className="inline mr-2" />
            New Support Ticket
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <FiMessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg mb-2">No support tickets yet</p>
            <p className="text-gray-600">Create your first support ticket to get help</p>
          </div>
        ) : (
          <div>
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={styles.ticketCard}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className={styles.ticketHeader}>
                  <div>
                    <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
                    <div className={styles.ticketMeta}>
                      <span className="font-medium text-[#039994]">#{ticket.ticketNumber}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                      <span className="capitalize">{ticket.category.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
                {ticket.lastMessage && (
                  <p className={styles.ticketPreview}>
                    {ticket.lastMessage}
                  </p>
                )}
                <div className={styles.ticketStatus}>
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Last updated: {formatDate(ticket.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create Support Ticket</h3>
              <button 
                onClick={() => setShowNewTicket(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleCreateTicket}>
                <div className="space-y-4">
                  <div>
                    <label className={styles.labelClass}>Subject *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className={styles.inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={styles.labelClass}>Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={styles.selectClass}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="AUTHORIZATION">Authorization Issues</option>
                        <option value="TECHNICAL">Technical Support</option>
                        <option value="BILLING">Billing & Payments</option>
                        <option value="ACCOUNT">Account Issues</option>
                        <option value="FEATURE">Feature Request</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.labelClass}>Priority *</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={styles.selectClass}
                        required
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.labelClass}>Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      className={styles.textareaClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.labelClass}>
                      Attachment (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#039994] transition-colors">
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">Max file size: 5MB</p>
                      <input
                        type="file"
                        id="supportFile"
                        className="hidden"
                      />
                      <label htmlFor="supportFile" className="mt-2 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm cursor-pointer hover:bg-gray-200">
                        Choose File
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitBtn}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Creating Ticket...
                      </div>
                    ) : 'Create Support Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-sm text-gray-600">#{selectedTicket.ticketNumber}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{selectedTicket.user.name}</div>
                    <div className="text-gray-600 text-xs">{selectedTicket.user.email}</div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Created: {formatDate(selectedTicket.createdAt)}</div>
                  <div className="text-gray-600">Last Updated: {formatDate(selectedTicket.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className={styles.conversationContainer}>
              {selectedTicket.conversations && selectedTicket.conversations.map((msg, index) => (
                <div 
                  key={msg.id || index}
                  className={`${styles.messageBubble} ${
                    msg.senderType === 'USER' ? styles.userMessage : styles.adminMessage
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {msg.senderType === 'USER' ? 'You' : 'Support Team'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{msg.message}</p>
                  {msg.attachment && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-200">
                        <FiUpload className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-700">{msg.attachment}</span>
                        <button className="ml-auto text-xs text-[#039994] hover:text-[#02857f]">
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'CLOSED' && (
              <div className={styles.replySection}>
                <div className="flex">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className={styles.replyInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply(selectedTicket.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSendReply(selectedTicket.id)}
                    disabled={sendingReply || !replyMessage.trim()}
                    className={styles.sendBtn}
                  >
                    {sendingReply ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContactSupport;