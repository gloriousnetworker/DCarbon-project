import React, { useState } from 'react';
import CustomerManagement from './CustomerManagement';
import CustomerDetails from './CustomerDetails';

export default function CustomerContainer() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Render the appropriate view based on state
  const renderView = () => {
    if (selectedCustomer) {
      return (
        <CustomerDetails
          customer={selectedCustomer}
          onBackToList={() => setSelectedCustomer(null)}
        />
      );
    }
    return <CustomerManagement onSelectCustomer={setSelectedCustomer} />;
  };

  return (
    <div className="bg-white p-6 rounded-md shadow w-full min-h-screen">
      {renderView()}
    </div>
  );
}
