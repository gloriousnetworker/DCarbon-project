import React from "react";

export default function WorkProgressCard() {
  const tasks = [
    { label: "Incomplete Documentation", count: 12, color: "#FF0000" },
    { label: "Document Rejections", count: 7, color: "#FFB200" },
    { label: "Final Approval Review", count: 5, color: "#039994" },
  ];

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h4 className="text-lg font-semibold text-[#039994] mb-3">Work Progress</h4>
      <ul className="space-y-2 text-sm">
        {tasks.map((task, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span>{task.label}</span>
            <span
              className="px-3 py-1 rounded-md text-white text-xs font-semibold"
              style={{ backgroundColor: task.color }}
            >
              {task.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
