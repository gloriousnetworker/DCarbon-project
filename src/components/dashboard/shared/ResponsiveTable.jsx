import React from "react";

/**
 * ResponsiveTable — renders a standard table on md+ screens, stacked cards on mobile.
 *
 * @param {Array} columns - [{ key: string, label: string, render?: (value, row) => ReactNode }]
 * @param {Array} data - array of row objects
 * @param {boolean} loading - show loading skeleton
 * @param {string} emptyTitle - title when no data
 * @param {string} emptyDescription - description when no data
 * @param {Function} onRowClick - optional click handler per row (row) => void
 * @param {ReactNode} pagination - optional pagination component to render below
 */
export default function ResponsiveTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "No data available",
  emptyDescription = "",
  onRowClick,
  pagination,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="hidden md:flex space-x-4 py-3 px-4">
              {columns.map((_, j) => (
                <div key={j} className="flex-1 h-4 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="md:hidden bg-white border rounded-lg p-4 space-y-2">
              {columns.slice(0, 3).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-300 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="text-gray-500 text-sm max-w-sm">{emptyDescription}</p>
        )}
      </div>
    );
  }

  const getCellValue = (col, row) => {
    if (col.render) return col.render(row[col.key], row);
    return row[col.key] ?? "—";
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`border-b border-gray-200 hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-3 text-xs text-gray-700">
                    {getCellValue(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, i) => (
          <div
            key={row.id || i}
            className={`bg-white border border-gray-200 rounded-lg p-4 space-y-2 ${onRowClick ? "cursor-pointer active:bg-gray-50" : ""}`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-start text-sm">
                <span className="text-gray-500 text-xs font-medium">{col.label}</span>
                <span className="font-medium text-gray-800 text-right ml-4 text-xs">
                  {getCellValue(col, row)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          {pagination}
        </div>
      )}
    </>
  );
}
