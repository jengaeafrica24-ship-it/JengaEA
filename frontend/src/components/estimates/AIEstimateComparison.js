import React, { useState } from 'react';
import { Download, Save, AlertTriangle, Leaf, Clock, ChevronDown, ChevronUp, PieChart } from 'lucide-react';
import Button from '../common/Button';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AIEstimateComparison = ({ 
  traditionalEstimate, 
  aiEstimate,
  onSave,
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    risks: false,
    sustainability: false,
    timeline: false
  });
  const formatKES = (value) => {
    try {
      const v = Number(value) || 0;
      return new Intl.NumberFormat('en-KE', { 
        style: 'currency', 
        currency: 'KES', 
        maximumFractionDigits: 2 
      }).format(v);
    } catch (e) {
      return `Ksh ${value}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traditional Estimate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Traditional Estimate</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Cost per sqm</span>
              <span className="font-medium">
                {formatKES(traditionalEstimate?.calculations?.base_cost_per_sqm || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Area</span>
              <span className="font-medium">
                {traditionalEstimate?.calculations?.total_area || 0} sqm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-medium">
                {formatKES(traditionalEstimate?.calculations?.final_total_cost || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Estimate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">AI Estimate</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Cost per sqm</span>
              <span className="font-medium">
                {formatKES(aiEstimate?.cost_analysis?.base_cost_per_sqm || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location Multiplier</span>
              <span className="font-medium">
                {aiEstimate?.cost_analysis?.location_multiplier || 1}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Adjusted Cost per sqm</span>
              <span className="font-medium">
                {formatKES(aiEstimate?.cost_analysis?.adjusted_cost_per_sqm || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Materials Breakdown (AI)</h3>
          <div className="space-y-3">
            {aiEstimate?.breakdown?.materials?.details?.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600 capitalize">{item.item}</span>
                <div className="text-right">
                  <span className="font-medium">{formatKES(item.cost)}</span>
                  <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Materials</span>
                <span>{formatKES(aiEstimate?.breakdown?.materials?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Labor Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Labor Breakdown (AI)</h3>
          <div className="space-y-3">
            {aiEstimate?.breakdown?.labor?.details?.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600 capitalize">{item.category}</span>
                <div className="text-right">
                  <span className="font-medium">{formatKES(item.cost)}</span>
                  <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Labor</span>
                <span>{formatKES(aiEstimate?.breakdown?.labor?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Equipment</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-medium">
                {formatKES(aiEstimate?.breakdown?.equipment?.total || 0)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {aiEstimate?.breakdown?.equipment?.description}
            </p>
          </div>
        </div>

        {/* Recommendations & Risk Factors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          {aiEstimate?.recommendations && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {aiEstimate.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {aiEstimate?.risk_factors && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Factors</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {aiEstimate.risk_factors.map((risk, index) => (
                  <li key={index} className="text-gray-600">{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="secondary"
          onClick={onSave}
          disabled={!aiEstimate}
        >
          <Save className="w-4 h-4 mr-2" />
          Save AI Estimate
        </Button>
        <Button 
          variant="secondary"
          onClick={onExport}
          disabled={!aiEstimate}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Comparison
        </Button>
      </div>
    </div>
  );
};

export default AIEstimateComparison;