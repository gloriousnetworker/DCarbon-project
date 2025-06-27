import React, { useState } from 'react';
import { HiOutlineX, HiOutlineDownload } from 'react-icons/hi';

const GeneratorReportExportReport = ({ onClose, data, currentFilters }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || !data.reports || data.reports.length === 0) {
      return 'No data available';
    }

    const headers = [
      'Total Active Generators',
      'Total Pending Generators', 
      'Total Terminated Generators',
      'Total Active Capacity (MWh)',
      'Total Net Exports (MWh)',
      'Date'
    ];

    const csvContent = [
      headers.join(','),
      ...data.reports.map(report => [
        report.activeFacilities || 0,
        report.pendingFacilities || 0,
        report.terminatedFacilities || 0,
        report.totalActiveCapacity || 27,
        report.totalNetExports || 200,
        new Date(report.date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  // Helper function to download file
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to generate PDF content (basic HTML for PDF conversion)
  const generatePDFContent = (data) => {
    const filterInfo = includeFilters && (currentFilters.dateFrom || currentFilters.dateTo || currentFilters.status !== 'all') 
      ? `
        <div style="margin-bottom: 20px; padding: 10px; background-color: #f3f4f6; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Applied Filters:</h3>
          ${currentFilters.dateFrom ? `<p style="margin: 2px 0;">Date From: ${currentFilters.dateFrom}</p>` : ''}
          ${currentFilters.dateTo ? `<p style="margin: 2px 0;">Date To: ${currentFilters.dateTo}</p>` : ''}
          ${currentFilters.status !== 'all' ? `<p style="margin: 2px 0;">Status: ${currentFilters.status}</p>` : ''}
        </div>
      ` : '';

    const tableRows = data?.reports?.map(report => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${report.activeFacilities || 0}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${report.pendingFacilities || 0}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${report.terminatedFacilities || 0}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${report.totalActiveCapacity || 27}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${report.totalNetExports || 200}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(report.date).toLocaleDateString()}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align: center; padding: 20px;">No data available</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Generator Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #039994; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .generated-date { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Generator Report</h1>
        ${filterInfo}
        <table>
          <thead>
            <tr>
              <th>Total Active Generators</th>
              <th>Total Pending Generators</th>
              <th>Total Terminated Generators</th>
              <th>Total Active Capacity (MWh)</th>
              <th>Total Net Exports (MWh)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="generated-date">
          Generated on: ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (exportFormat === 'csv') {
        let csvContent = convertToCSV(data);
        
        // Add filter information if requested
        if (includeFilters && (currentFilters.dateFrom || currentFilters.dateTo || currentFilters.status !== 'all')) {
          const filterInfo = [
            'Applied Filters:',
            currentFilters.dateFrom ? `Date From: ${currentFilters.dateFrom}` : '',
            currentFilters.dateTo ? `Date To: ${currentFilters.dateTo}` : '',
            currentFilters.status !== 'all' ? `Status: ${currentFilters.status}` : '',
            '', // Empty line
            ''  // Another empty line before data
          ].filter(line => line !== null).join('\n');
          
          csvContent = filterInfo + csvContent;
        }
        
        downloadFile(csvContent, `generator-report-${timestamp}.csv`, 'text/csv');
        
      } else if (exportFormat === 'pdf') {
        const htmlContent = generatePDFContent(data);
        
        // For PDF, we'll download as HTML file that can be converted to PDF
        // In a real implementation, you might use libraries like jsPDF or Puppeteer
        downloadFile(htmlContent, `generator-report-${timestamp}.html`, 'text/html');
        
        // Show instruction to user
        alert('HTML file downloaded. You can open it in your browser and use "Print to PDF" to convert it to PDF format.');
      }
      
      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 font-sfpro">Export Generator Report</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#039994] rounded"
            disabled={isExporting}
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sfpro mb-2">Export Format</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                  disabled={isExporting}
                />
                <span className="ml-2 font-sfpro">PDF (HTML)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  disabled={isExporting}
                />
                <span className="ml-2 font-sfpro">CSV</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-[#039994] focus:ring-[#039994] rounded"
                checked={includeFilters}
                onChange={(e) => setIncludeFilters(e.target.checked)}
                disabled={isExporting}
              />
              <span className="ml-2 text-sm text-gray-700 font-sfpro">Include current filters in export</span>
            </label>
          </div>

          {/* Show current filters preview if includeFilters is true */}
          {includeFilters && (currentFilters.dateFrom || currentFilters.dateTo || currentFilters.status !== 'all') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800 mb-1">Filters to include:</p>
              <div className="text-xs text-blue-700 space-y-1">
                {currentFilters.dateFrom && <div>Date From: {currentFilters.dateFrom}</div>}
                {currentFilters.dateTo && <div>Date To: {currentFilters.dateTo}</div>}
                {currentFilters.status !== 'all' && <div>Status: {currentFilters.status}</div>}
              </div>
            </div>
          )}

          {/* Data summary */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-700 font-sfpro">
              <span className="font-medium">Records to export:</span> {data?.reports?.length || 0}
            </p>
            {data?.metadata?.total && (
              <p className="text-xs text-gray-600 font-sfpro">
                Total records available: {data.metadata.total}
              </p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !data?.reports?.length}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <HiOutlineDownload className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorReportExportReport;