import React, { useState } from "react";

const EXPORT_FORMATS = [
  { label: "Select format", value: "" },
  { label: "CSV", value: "csv" },
  { label: "PDF", value: "pdf" }
];

export default function ExportReportModal({
  onClose,
  initialFilters = {},
  yearFilter,
  monthFilter,
  tableData = []
}) {
  const [format, setFormat] = useState("");
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
    
    return csvContent;
  };

  const generatePDF = async (data) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Customer Report", 20, 20);
    
    if (includeFilters) {
      let filtersText = "Filters Applied: ";
      const appliedFilters = [];
      
      if (yearFilter && monthFilter) {
        appliedFilters.push(`Date: ${getMonthName(monthFilter)} ${yearFilter}`);
      } else if (yearFilter) {
        appliedFilters.push(`Year: ${yearFilter}`);
      }
      
      if (initialFilters.status) {
        appliedFilters.push(`Status: ${initialFilters.status}`);
      }
      
      if (initialFilters.customerType) {
        appliedFilters.push(`Customer Type: ${initialFilters.customerType}`);
      }
      
      if (initialFilters.time) {
        appliedFilters.push(`Sort: ${initialFilters.time} first`);
      }
      
      if (appliedFilters.length > 0) {
        filtersText += appliedFilters.join(", ");
        doc.setFontSize(10);
        doc.text(filtersText, 20, 35);
      }
    }
    
    const startY = includeFilters && (yearFilter || monthFilter || initialFilters.status || initialFilters.customerType) ? 50 : 35;
    
    const headers = [["S/N", "Name", "Email", "Customer Type", "Role", "Commissions", "Date Reg.", "Status"]];
    
    const rows = data.map((row, index) => [
      index + 1,
      row.name || "-",
      row.inviteeEmail || "-",
      row.customerType || "-",
      row.role || "-",
      `$${row.commissions || "0.00"}`,
      new Date(row.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      row.status
    ]);

    const { autoTable } = await import('jspdf-autotable');
    
    doc.autoTable({
      head: headers,
      body: rows,
      startY: startY,
      theme: 'grid',
      headStyles: {
        fillColor: [3, 153, 148],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      },
      margin: { top: 20, right: 15, bottom: 20, left: 15 },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
    });
    
    return doc.output('blob');
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[parseInt(monthNumber) - 1] || "";
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
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
    if (!format) {
      alert("Please select an export format");
      return;
    }

    if (tableData.length === 0) {
      alert("No data available to export");
      return;
    }

    setLoading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `customer-report-${dateStr}`;

      if (format === "csv") {
        const csvContent = generateCSV(tableData);
        downloadFile(csvContent, `${fileName}.csv`, "text/csv");
      } else if (format === "pdf") {
        const pdfBlob = await generatePDF(tableData);
        downloadFile(pdfBlob, `${fileName}.pdf`, "application/pdf");
      }
      
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent"
              disabled={loading}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
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
          
          {format && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm text-green-700">
                <strong>{format.toUpperCase()}</strong> file will be downloaded with {tableData.length} records.
              </p>
            </div>
          )}
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
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028c87] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !format}
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}