import React from "react";

/**
 * EmptyState — consistent empty state component for tables and data views.
 *
 * @param {ReactNode} icon - optional custom icon (default: inbox icon)
 * @param {string} title - main heading
 * @param {string} description - supporting text
 * @param {ReactNode} action - optional CTA button
 */
export default function EmptyState({
  icon,
  title = "No data available",
  description = "",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="text-gray-300 mb-4">
        {icon || (
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm mb-4 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
