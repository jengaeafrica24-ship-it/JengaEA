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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" id="cost-summary">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Cost Summary</h2>
        <div className="space-x-4">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaShare className="mr-2" />
            Share
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Materials Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Material</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Specification</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cost (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials?.map((material, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{material.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{material.specification}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{material.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{material.totalCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (16%):</span>
                <span className="font-medium">KES {vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-4 pt-2 border-t">
                <span>Total Cost:</span>
                <span className="text-blue-600">KES {totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {recommendations?.map((recommendation, index) => (
                <li key={index} className="text-gray-600">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;