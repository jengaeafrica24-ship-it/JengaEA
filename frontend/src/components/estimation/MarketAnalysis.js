import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info,
  BarChart3,
  DollarSign,
  Users,
  Package2,
  Target,
} from 'lucide-react';
import { estimatesAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const MarketAnalysis = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarketAnalysis();
  }, [timeframe]);

  const fetchMarketAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await estimatesAPI.getMarketAnalysis(timeframe);
      setAnalysisData(response.data);
    } catch (err) {
      setError('Failed to load market analysis');
      console.error('Market analysis error:', err);
      toast.error('Failed to fetch market analysis data');
    } finally {
      setIsLoading(false);
    }
  };


  const getTrendIcon = (value) => {
    if (value > 5) return <TrendingUp className="w-5 h-5 text-red-400" />;
    if (value < -5) return <TrendingDown className="w-5 h-5 text-green-400" />;
    return <BarChart3 className="w-5 h-5 text-blue-400" />;
  };

  const getTrendColor = (value) => {
    if (value > 5) return 'text-red-400';
    if (value < -5) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getInsightBg = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
            <p className="text-blue-300/80">Cost insights and industry benchmarks for your projects</p>
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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-blue-300">Loading market analysis...</p>
          </div>
        ) : analysisData ? (
          <>
            {/* Cost Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-300/80 text-sm">Total Cost</p>
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  KES {(analysisData.summary.totalCost / 1_000_000).toFixed(1)}M
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-300/80 text-sm">Material Costs</p>
                  <Package2 className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {analysisData.breakdown.materials}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-300/80 text-sm">Labor Costs</p>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {analysisData.breakdown.labor}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-300/80 text-sm">Cost/m²</p>
                  <Target className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  KES {analysisData.benchmarks.avgCostPerSqm.toLocaleString()}
                </p>
              </motion.div>
            </div>

            {/* Insights Section */}
            {analysisData.insights && analysisData.insights.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Market Insights</h2>
                <div className="space-y-4">
                  {analysisData.insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-lg border p-4 flex items-start gap-4 ${getInsightBg(insight.type)}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                        <p className="text-blue-300/80 text-sm">{insight.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Cost Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Cost Trends</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package2 className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-blue-300 font-medium">Material vs Industry Avg</p>
                        <p className="text-blue-300/60 text-sm">
                          Your: {analysisData.breakdown.materials}% | Industry: {analysisData.trends.industryAvgMaterial}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analysisData.trends.materialTrend)}
                      <span className={`font-medium ${getTrendColor(analysisData.trends.materialTrend)}`}>
                        {analysisData.trends.materialTrend > 0 ? '+' : ''}{analysisData.trends.materialTrend}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-blue-300 font-medium">Labor vs Industry Avg</p>
                        <p className="text-blue-300/60 text-sm">
                          Your: {analysisData.breakdown.labor}% | Industry: {analysisData.trends.industryAvgLabor}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analysisData.trends.laborTrend)}
                      <span className={`font-medium ${getTrendColor(analysisData.trends.laborTrend)}`}>
                        {analysisData.trends.laborTrend > 0 ? '+' : ''}{analysisData.trends.laborTrend}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-blue-300 font-medium">Material to Labor Ratio</p>
                        <p className="text-blue-300/60 text-sm">
                          {analysisData.benchmarks.materialToLaborRatio.toFixed(2)}:1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Recommendations</h2>
                {analysisData.recommendations && analysisData.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {analysisData.recommendations.map((rec, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-300 text-sm">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-300/60 text-center py-4">No specific recommendations at this time.</p>
                )}
              </motion.div>
            </div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Analysis Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-blue-300/60 text-sm">Estimates Analyzed</p>
                  <p className="text-2xl font-bold text-white mt-2">{analysisData.trends.estimateCount}</p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-blue-300/60 text-sm">Total Project Cost</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    KES {(analysisData.summary.totalCost / 1_000_000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-blue-300/60 text-sm">Material Cost</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    KES {(analysisData.summary.materialCost / 1_000_000).toFixed(2)}M
                  </p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-blue-300/60 text-sm">Labor Cost</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    KES {(analysisData.summary.laborCost / 1_000_000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-blue-300">No data available. Create some estimates to see market analysis.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MarketAnalysis;