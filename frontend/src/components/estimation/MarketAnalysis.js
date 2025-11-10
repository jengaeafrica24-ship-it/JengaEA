import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Globe,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCcw,
  Building2,
  Truck,
  HardHat,
  Package
} from 'lucide-react';
import { estimatesAPI } from '../../utils/api';

const MarketAnalysis = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    trends: null,
    priceIndices: null,
    regionalData: null,
    forecasts: null,
    supplyChain: null,
    laborMarket: null
  });

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await estimatesAPI.getMarketAnalysis({
        timeframe,
        region,
        category
      });
      setMarketData(response.data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, region, category]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const TrendCard = ({ title, value, change, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        {change !== null && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-blue-300/80 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">
        {isLoading ? (
          <div className="animate-pulse bg-blue-400/20 h-8 w-32 rounded"></div>
        ) : (
          value
        )}
      </p>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Construction Market Analysis</h1>
            <p className="text-blue-300/80">Real-time market insights and price trends</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
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
            
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Regions</option>
              <option value="nairobi">Nairobi</option>
              <option value="mombasa">Mombasa</option>
              <option value="kisumu">Kisumu</option>
              <option value="nakuru">Nakuru</option>
            </select>

            <button
              onClick={fetchMarketData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TrendCard
            title="Construction Cost Index"
            value={marketData?.priceIndices?.constructionIndex}
            change={marketData?.trends?.constructionIndex}
            icon={Building2}
          />
          <TrendCard
            title="Material Price Index"
            value={marketData?.priceIndices?.materialIndex}
            change={marketData?.trends?.materialIndex}
            icon={Package}
          />
          <TrendCard
            title="Labor Cost Index"
            value={marketData?.priceIndices?.laborIndex}
            change={marketData?.trends?.laborIndex}
            icon={HardHat}
          />
          <TrendCard
            title="Supply Chain Status"
            value={marketData?.supplyChain?.status}
            change={marketData?.supplyChain?.efficiency}
            icon={Truck}
          />
        </div>

        {/* Price Trends and Regional Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Price Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Price Trends</h2>
            <div className="h-[300px] flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse bg-blue-400/20 w-full h-full rounded"></div>
              ) : (
                <div className="text-blue-300/60">Chart will be integrated here</div>
              )}
            </div>
          </motion.div>

          {/* Regional Analysis Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Regional Analysis</h2>
            <div className="h-[300px] flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse bg-blue-400/20 w-full h-full rounded"></div>
              ) : (
                <div className="text-blue-300/60">Map visualization will be integrated here</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Market Insights and Forecasts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supply Chain Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Supply Chain Analysis</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-blue-400/20 h-12 rounded"></div>
                ))}
              </div>
            ) : marketData?.supplyChain?.insights?.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg mb-3"
              >
                <Truck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                  <p className="text-blue-300/80 text-sm">{insight.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Market Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Market Forecast</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-blue-400/20 h-12 rounded"></div>
                ))}
              </div>
            ) : marketData?.forecasts?.predictions?.map((prediction, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg mb-3"
              >
                <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-1">{prediction.title}</h3>
                  <p className="text-blue-300/80 text-sm">{prediction.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Labor Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-800/30"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Labor Market Trends</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-blue-400/20 h-12 rounded"></div>
                ))}
              </div>
            ) : marketData?.laborMarket?.trends?.map((trend, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg mb-3"
              >
                <HardHat className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-1">{trend.title}</h3>
                  <p className="text-blue-300/80 text-sm">{trend.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketAnalysis;