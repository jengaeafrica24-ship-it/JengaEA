import React from 'react';
import { FaDownload, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CostSummary = ({ estimateData }) => {
  if (!estimateData) return null;

  // Handle potential nested data structure
  const data = estimateData.data || estimateData;
  const { materials = [], subtotal = 0, vat = 0, totalCost = 0, recommendations = [] } = data;

  const handleDownload = async () => {
    try {
      const element = document.getElementById('cost-summary');
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('material-cost-estimate.pdf');
      
      toast.success('Cost summary downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download cost summary');
      console.error('Download error:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Material Cost Estimate',
          text: `Total Cost Estimate: KES ${totalCost.toLocaleString()}\nSubtotal: KES ${subtotal.toLocaleString()}\nVAT: KES ${vat.toLocaleString()}`,
        });
        toast.success('Cost summary shared successfully!');
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `Material Cost Estimate\nTotal Cost: KES ${totalCost.toLocaleString()}\nSubtotal: KES ${subtotal.toLocaleString()}\nVAT: KES ${vat.toLocaleString()}`
        );
        toast.success('Cost summary copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share cost summary');
      console.error('Share error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 sm:p-5 md:p-6 mb-4 md:mb-6 overflow-x-hidden" id="cost-summary">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Cost Summary</h2>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base min-h-[44px] transition-colors flex-1 sm:flex-initial"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base min-h-[44px] transition-colors flex-1 sm:flex-initial"
          >
            <FaShare className="mr-2" />
            Share
          </button>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="border rounded-lg p-3 md:p-4 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold mb-3 md:mb-4">Materials Breakdown</h3>
          <div className="overflow-x-auto -mx-3 md:-mx-4 px-3 md:px-4">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Material</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Specification</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Qty</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Unit</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Cost (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials?.map((material, index) => (
                  <tr key={index}>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">{material.name}</td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{material.specification}</td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">{material.quantity}</td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 hidden md:table-cell">{material.unit}</td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 font-medium">{material.totalCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="border rounded-lg p-3 md:p-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3 md:mb-4">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">VAT (16%):</span>
                <span className="font-medium">KES {vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-semibold mt-3 md:mt-4 pt-2 border-t">
                <span>Total Cost:</span>
                <span className="text-blue-600">KES {totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 md:p-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3 md:mb-4">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {recommendations?.map((recommendation, index) => (
                <li key={index} className="text-xs sm:text-sm md:text-base text-gray-600">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;