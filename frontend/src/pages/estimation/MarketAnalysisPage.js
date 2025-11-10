import React from 'react';
import MarketAnalysis from '../../components/estimation/MarketAnalysis';
import { motion } from 'framer-motion';

const MarketAnalysisPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900"
    >
      <MarketAnalysis />
    </motion.div>
  );
};

export default MarketAnalysisPage;