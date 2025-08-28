import React, { useState } from "react";

export default function ExportReportModal({
  onClose,
  initialFilters = {},
  yearFilter,
  monthFilter,
  tableData = []
}) {
  const [includeFilters, setIncludeFilters] = useState(true);
  const [loading, setLoading] = useState(false);

  const generateCSV = (data) => {
    const headers = ["S/N", "Name", "Email", "Customer Type", "Role", "Commissions", "Date Registered", "Status"];
    
    let csvContent = headers.join(",") + "\n";
    
    data.forEach((row, index) => {
      const rowData = [
        index + 1,
        `"${row.name || "-"}"`,
        `"${row.inviteeEmail || "-"}"`,
        `"${row.customerType || "-"}"`,
        `"${row.role || "-"}"`,
        `"$${row.commissions || "0.00"}"`,
        `"${new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}"`,
        `"${row.status}"`
      ];
      
      csvContent += rowData.join(",") + "\n";
    });
    
    // Add filters information as comments at the end if includeFilters is true
    if (includeFilters) {
      csvContent += "\n";
      csvContent += "# Filters Applied:\n";
      
      if (yearFilter && monthFilter) {
        csvContent += `# Date: ${getMonthName(monthFilter)} ${yearFilter}\n`;
      } else if (yearFilter) {
        csvContent += `# Year: ${yearFilter}\n`;
      }
      
      if (initialFilters.status) {
        csvContent += `# Status: ${initialFilters.status}\n`;
      }
      
      if (initialFilters.customerType) {
        csvContent += `# Customer Type: ${initialFilters.customerType}\n`;
      }
      
      if (initialFilters.time) {
        csvContent += `# Sort: ${initialFilters.time} first\n`;
      }
      
      csvContent += `# Generated on: ${new Date().toLocaleDateString('en-GB')}\n`;
    }
    
    return csvContent;
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[parseInt(monthNumber) - 1] || "";
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (tableData.length === 0) {
      alert("No data available to export");
      return;
    }

    setLoading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `customer-report-${dateStr}.csv`;

      const csvContent = generateCSV(tableData);
      downloadFile(csvContent, fileName, "text/csv");
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#039994]">Export Report</h2>
          <button
            onClick={onClose}
            className="text-[#F04438] hover:text-red-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>
       
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">CSV Export</h3>
                <p className="text-xs text-gray-600">Download your data as a comma-separated values file</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeFilters"
              checked={includeFilters}
              onChange={(e) => setIncludeFilters(e.target.checked)}
              className="mr-2 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994]"
              disabled={loading}
            />
            <label htmlFor="includeFilters" className="text-sm text-gray-700">
              Include current filters in export
            </label>
          </div>

          {includeFilters && (yearFilter || monthFilter || initialFilters.status || initialFilters.customerType) && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Active Filters:</p>
              <div className="text-xs text-blue-600">
                {yearFilter && monthFilter && (
                  <span className="block">• Date: {getMonthName(monthFilter)} {yearFilter}</span>
                )}
                {yearFilter && !monthFilter && (
                  <span className="block">• Year: {yearFilter}</span>
                )}
                {initialFilters.status && (
                  <span className="block">• Status: {initialFilters.status}</span>
                )}
                {initialFilters.customerType && (
                  <span className="block">• Customer Type: {initialFilters.customerType}</span>
                )}
                {initialFilters.time && (
                  <span className="block">• Sort: {initialFilters.time} first</span>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <p className="text-sm text-green-700">
              <strong>CSV</strong> file will be downloaded with <strong>{tableData.length} records</strong>.
            </p>
            {tableData.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                File size: ~{Math.ceil(tableData.length * 0.1)}KB
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028c87] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}