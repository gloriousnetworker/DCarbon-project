import React, { useState } from "react";
import {
  selectClass,
  buttonPrimary,
  labelClass,
  inputClass,
} from "./styles";

const EXPORT_FORMATS = [
  { label: "Select format", value: "" },
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "xlsx" },
  // PDF option removed due to jsPDF-autoTable compatibility issues
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
    const headers = ["S/N", "Name", "Email", "Customer Type", "Date", "Status"];
    
    let csvContent = headers.join(",") + "\n";
    
    data.forEach((row, index) => {
      const rowData = [
        index + 1,
        row.name || "-",
        row.inviteeEmail || "-",
        row.customerType || "-",
        new Date(row.createdAt).toLocaleDateString(),
        row.status
      ];
      
      const escapedRowData = rowData.map(field => {
        if (typeof field === 'string' && field.includes(',')) {
          return `"${field}"`;
        }
        return field;
      });
      
      csvContent += escapedRowData.join(",") + "\n";
    });
    
    return csvContent;
  };

  const generateExcel = async (data) => {
    // Dynamically import xlsx library only when needed
    const XLSX = await import('xlsx');
    
    const headers = ["S/N", "Name", "Email", "Customer Type", "Date", "Status"];
    const rows = data.map((row, index) => [
      index + 1,
      row.name || "-",
      row.inviteeEmail || "-",
      row.customerType || "-",
      new Date(row.createdAt).toLocaleDateString(),
      row.status
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Report");
    
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
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
    if (!format) {
      alert("Please select an export format");
      return;
    }

    setLoading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `customer-report-${dateStr}`;

      // Handle direct downloads for CSV and Excel formats
      if (format === "csv") {
        const csvContent = generateCSV(tableData);
        downloadFile(csvContent, `${fileName}.csv`, "text/csv");
      } else if (format === "xlsx") {
        const excelData = await generateExcel(tableData);
        downloadFile(excelData, `${fileName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
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
        <h2 className="text-xl font-bold mb-4 text-[#039994]">Export Report</h2>
       
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={selectClass}
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
              className="mr-2"
            />
            <label htmlFor="includeFilters" className={labelClass}>
              Include current filters in export
            </label>
          </div>
          
          {format && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm text-green-700">
                <strong>{format.toUpperCase()} format</strong> will be downloaded directly to your device.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className={`${buttonPrimary} px-4 py-2`}
            disabled={loading}
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}