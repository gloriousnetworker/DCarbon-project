import React, { useState } from 'react';

const DashboardNotifications = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [onScreenNotifications, setOnScreenNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Notifications List */}
      <div className="space-y-4">
        {/* 1) Enable Email Notifications */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Enable Email Notifications</span>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              emailNotifications ? 'bg-[#039994]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 2) Enable On-screen Notifications */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Enable On-screen Notifications</span>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setOnScreenNotifications(!onScreenNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              onScreenNotifications ? 'bg-[#039994]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                onScreenNotifications ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 3) Receive System Notifications */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Receive System Notifications</span>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setSystemNotifications(!systemNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              systemNotifications ? 'bg-[#039994]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                systemNotifications ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNotifications;
