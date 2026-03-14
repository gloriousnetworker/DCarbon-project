import React from "react";

/**
 * TableSkeleton — loading placeholder that mimics table structure.
 *
 * @param {number} rows - number of skeleton rows (default: 5)
 * @param {number} columns - number of columns (default: 5)
 */
export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full">
      {/* Desktop skeleton */}
      <div className="hidden md:block">
        <div className="flex space-x-4 py-3 px-4 border-b border-gray-200">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex space-x-4 py-3 px-4 border-b border-gray-100">
            {[...Array(columns)].map((_, j) => (
              <div
                key={j}
                className="flex-1 h-3 bg-gray-100 rounded animate-pulse"
                style={{ animationDelay: `${(i * columns + j) * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {[...Array(Math.min(columns, 4))].map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div
                  className="h-3 w-24 bg-gray-100 rounded animate-pulse"
                  style={{ animationDelay: `${j * 100}ms` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
