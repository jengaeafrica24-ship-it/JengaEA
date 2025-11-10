import React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Package2,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { estimatesAPI } from '../../utils/api';

const ProjectSummary = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalCost: null,
    materialCosts: null,
    laborCosts: null,
    timeToCompletion: null,
    costBreakdown: null,
    projectHealth: null,
    risks: [],
    recommendations: {
      costOptimization: [],
      timelineManagement: []
    },
    trends: {
      totalCost: null,
      materials: null,
      labor: null
    }
  });

  // Fetch data from Gemini AI
  // Memoize the fetch function to avoid recreating it on every render
  const fetchSummaryData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Get project summary data from the API
      const response = await estimatesAPI.getProjectSummary(timeframe);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]); // Include timeframe in dependencies

  // Fetch data when timeframe changes
  React.useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]); // Only depend on the memoized fetch function

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, className }) => {
    const formattedValue = typeof value === 'number' && !isNaN(value) 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      : value;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30 ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          {trend && trendValue !== null && (
            <div className={`flex items-center gap-1 text-sm ${
              trendValue >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trendValue >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-sm text-blue-300/80 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">
          {isLoading ? (
            <div className="animate-pulse bg-blue-400/20 h-8 w-32 rounded"></div>
          ) : (
            formattedValue || 'N/A'
          )}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Cost Summary</h1>
            <p className="text-blue-300/80">Comprehensive overview of your project's financial health</p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Project Cost"
            value={summaryData.totalCost}
            icon={DollarSign}
            trend
            trendValue={summaryData.trends?.totalCost}
          />
          <StatCard
            title="Material Costs"
            value={summaryData.materialCosts}
            icon={Package2}
            trend
            trendValue={summaryData.trends?.materials}
          />
          <StatCard
            title="Labor Costs"
            value={summaryData.laborCosts}
            icon={Users}
            trend
            trendValue={summaryData.trends?.labor}
          />
          <StatCard
            title="Time to Completion"
            value={summaryData.timeToCompletion}
            icon={Calendar}
          />
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Cost Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h2>
            <div className="space-y-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="bg-blue-400/20 h-4 w-24 rounded animate-pulse"></div>
                      <div className="bg-blue-400/20 h-4 w-12 rounded animate-pulse"></div>
                    </div>
                    <div className="h-2 bg-blue-900/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400/20 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                ))
              ) : summaryData.costBreakdown ? (
                Object.entries(summaryData.costBreakdown).map(([category, { percentage, color }]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-300">{category}</span>
                      <span className="text-white">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-blue-900/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-blue-300/60 text-center py-8">No cost breakdown data available</div>
              )}
            </div>
          </motion.div>

          {/* Project Health Indicators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Project Health</h2>
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <div className="bg-blue-400/20 h-4 w-24 rounded animate-pulse"></div>
                    <div className="bg-blue-400/20 h-4 w-16 rounded animate-pulse"></div>
                  </div>
                ))
              ) : summaryData.projectHealth ? (
                Object.entries(summaryData.projectHealth).map(([metric, { icon: MetricIcon, value, status }]) => (
                  <div key={metric} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MetricIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">{metric}</span>
                    </div>
                    <span className={
                      status === 'good' ? 'text-green-400' :
                      status === 'warning' ? 'text-yellow-400' :
                      'text-red-400'
                    }>{value}</span>
                  </div>
                ))
              ) : (
                <div className="text-blue-300/60 text-center py-4">No health data available</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Risk Assessment and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment</h2>
            <div className="space-y-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg">
                    <div className="bg-blue-400/20 h-16 w-full rounded animate-pulse"></div>
                  </div>
                ))
              ) : summaryData.risks?.length > 0 ? (
                summaryData.risks.map((risk, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 p-3 ${
                      risk.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                      risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                      'bg-green-500/10 border-green-500/20'
                    } rounded-lg border`}
                  >
                    <AlertTriangle className={`w-5 h-5 ${
                      risk.severity === 'high' ? 'text-red-500' :
                      risk.severity === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    } flex-shrink-0 mt-0.5`} />
                    <div>
                      <h3 className="text-white font-medium mb-1">{risk.title}</h3>
                      <p className={`${
                        risk.severity === 'high' ? 'text-red-300/80' :
                        risk.severity === 'medium' ? 'text-yellow-300/80' :
                        'text-green-300/80'
                      } text-sm`}>{risk.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-blue-300/60 text-center py-4">No risks identified</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">AI Recommendations</h2>
            <div className="space-y-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="p-3 bg-blue-900/20 rounded-lg">
                    <div className="bg-blue-400/20 h-24 w-full rounded animate-pulse"></div>
                  </div>
                ))
              ) : summaryData.recommendations ? (
                Object.entries(summaryData.recommendations).map(([category, items]) => (
                  <div key={category} className="p-3 bg-blue-900/20 rounded-lg">
                    <h3 className="text-white font-medium mb-2">
                      {category.split(/(?=[A-Z])/).join(' ')}
                    </h3>
                    <ul className="space-y-2 text-blue-300/80 text-sm">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-blue-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-blue-300/60 text-center py-4">No recommendations available</div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectSummary;