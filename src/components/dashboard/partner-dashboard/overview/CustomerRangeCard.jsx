import React from "react";

export default function CustomerRangeCard() {
  return (
    <div className="bg-white rounded-md shadow p-4">
      <h4 className="text-lg font-semibold text-[#039994] mb-3">
        Customer Range
      </h4>
      <ul className="space-y-1 text-sm">
        <li className="flex justify-between">
          <span>Individual Customers</span>
          <span className="font-semibold">50</span>
        </li>
        <li className="flex justify-between">
          <span>Registered Customers</span>
          <span className="font-semibold">50</span>
        </li>
        <li className="flex justify-between">
          <span>Commercial Customers</span>
          <span className="font-semibold">20</span>
        </li>
        <li className="flex justify-between">
          <span>Large-scale Groups</span>
          <span className="font-semibold">50</span>
        </li>
        <li className="flex justify-between">
          <span>Active Resi. Groups</span>
          <span className="font-semibold">50</span>
        </li>
      </ul>
    </div>
  );
}
