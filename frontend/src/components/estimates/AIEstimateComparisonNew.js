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
  ArcElement,
  DoughnutController
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AIEstimateComparisonNew = ({ 
  traditionalEstimate, 
  aiEstimate,
  onSave,
  onExport,
  onGeneratePDF 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    risks: false,
    sustainability: false,
    timeline: false,
    costBreakdown: false
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

  const calculateSavings = () => {
    const traditionalCost = traditionalEstimate?.calculations?.final_total_cost || 0;
    const aiCost = aiEstimate?.cost_analysis?.total_cost || 0;
    const savings = traditionalCost - aiCost;
    const percentage = traditionalCost ? (savings / traditionalCost) * 100 : 0;
    
    return {
      amount: savings,
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: savings > 0
    };
  };

  const savings = calculateSavings();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Traditional Estimate</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatKES(traditionalEstimate?.calculations?.final_total_cost || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">AI Estimate</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatKES(aiEstimate?.cost_analysis?.total_cost || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Potential Savings</p>
            <p className={`text-2xl font-bold ${savings.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {savings.isPositive ? '+' : '-'}{savings.percentage}%
              <span className="block text-sm font-normal">
                {formatKES(Math.abs(savings.amount))}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSections(prev => ({...prev, costBreakdown: !prev.costBreakdown}))}
          >
            <div className="flex items-center space-x-2">
              <PieChart className="text-indigo-500" size={20} />
              <h3 className="text-lg font-semibold">Cost Analysis</h3>
            </div>
            {expandedSections.costBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.costBreakdown && (
            <div className="mt-4">
              <div className="h-64">
                <Chart
                  type="doughnut"
                  data={{
                    labels: aiEstimate?.breakdown?.categories?.map(cat => cat.name) || [],
                    datasets: [{
                      data: aiEstimate?.breakdown?.categories?.map(cat => cat.amount) || [],
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)'
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.label}: ${formatKES(context.raw)}`
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {aiEstimate?.breakdown?.categories?.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{cat.name}</span>
                    <span className="text-sm font-medium">{formatKES(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSections(prev => ({...prev, risks: !prev.risks}))}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-amber-500" size={20} />
              <h3 className="text-lg font-semibold">Risk Analysis</h3>
            </div>
            {expandedSections.risks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.risks && (
            <div className="mt-4 space-y-3">
              {aiEstimate?.risk_factors?.map((risk, index) => (
                <div key={index} className="bg-amber-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-amber-900">{risk.factor}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                        risk.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-amber-800">{risk.impact}</p>
                  <div className="mt-2 p-2 bg-amber-100 rounded">
                    <p className="text-sm font-medium text-amber-900">Mitigation Strategy:</p>
                    <p className="text-sm text-amber-800">{risk.mitigation}</p>
                  </div>
                  {risk.costImpact && (
                    <p className="mt-2 text-sm font-medium text-amber-900">
                      Potential Cost Impact: {formatKES(risk.costImpact)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sustainability Impact */}
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSections(prev => ({...prev, sustainability: !prev.sustainability}))}
          >
            <div className="flex items-center space-x-2">
              <Leaf className="text-green-500" size={20} />
              <h3 className="text-lg font-semibold">Environmental Impact</h3>
            </div>
            {expandedSections.sustainability ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.sustainability && aiEstimate?.sustainability_metrics && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <span className="text-green-600 text-sm">Carbon Footprint</span>
                  <p className="text-lg font-semibold text-green-700 mt-1">
                    {aiEstimate.sustainability_metrics.carbon_footprint} CO₂e
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    vs. Industry Avg: {aiEstimate.sustainability_metrics.carbon_comparison}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <span className="text-blue-600 text-sm">Water Usage</span>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    {aiEstimate.sustainability_metrics.water_usage} m³
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Recycling: {aiEstimate.sustainability_metrics.water_recycling}%
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <span className="text-purple-600 text-sm">Renewable Materials</span>
                  <p className="text-lg font-semibold text-purple-700 mt-1">
                    {aiEstimate.sustainability_metrics.renewable_percentage}%
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Local Sourcing: {aiEstimate.sustainability_metrics.local_sourcing}%
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800">Eco-friendly Recommendations</h4>
                <div className="mt-2 space-y-2">
                  {aiEstimate.sustainability_metrics.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                      <p className="text-sm text-green-700 flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSections(prev => ({...prev, timeline: !prev.timeline}))}
          >
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-500" size={20} />
              <h3 className="text-lg font-semibold">Project Timeline</h3>
            </div>
            {expandedSections.timeline ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.timeline && aiEstimate?.timeline_impact && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <span className="text-blue-600 text-sm">Total Duration</span>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    {aiEstimate.timeline_impact.estimated_duration} months
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <span className="text-blue-600 text-sm">Recommended Start</span>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    {aiEstimate.timeline_impact.optimal_start_season}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Phase Timeline</h4>
                {aiEstimate.timeline_impact.phases.map((phase, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{phase.name}</span>
                      <span className="text-sm text-gray-500">{phase.duration} months</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            {phase.completion_percentage}% Complete
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {phase.start_date} - {phase.end_date}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${phase.completion_percentage}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={onSave}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Comparison</span>
        </Button>
        <Button 
          onClick={onGeneratePDF}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Generate Detailed Report</span>
        </Button>
      </div>
    </div>
  );
};

export default AIEstimateComparisonNew;