import React from "react";

export default function PendingCustomerRegCard() {
  const pendingCustomers = [
    { name: "Avale Francis", status: "Pending" },
    { name: "Kalab Shepherd", status: "Pending" },
    { name: "Document Rejections", status: "Pending" },
  ];

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h4 className="text-lg font-semibold text-[#039994] mb-3">
        Pending Customer Registrations
      </h4>
      <ul className="space-y-2 text-sm">
        {pendingCustomers.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-2 last:border-b-0"
          >
            <span>{item.name}</span>
            <span className="text-yellow-500 font-semibold">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
