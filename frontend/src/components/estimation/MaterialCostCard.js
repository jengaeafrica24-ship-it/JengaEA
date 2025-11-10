import React from 'react';
import { motion } from 'framer-motion';
import { Package2, DollarSign, TrendingUp, Scale } from 'lucide-react';

const MaterialCostCard = ({ material, quantity, unitPrice, totalCost, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Package2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{material}</h3>
            <p className="text-blue-300/80 text-sm">Building Material</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
          trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          <TrendingUp className="w-4 h-4" />
          <span>{trend > 0 ? '+' : ''}{trend}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-900/30 rounded-xl">
          <div className="flex items-center gap-2 text-blue-300 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-sm">Quantity</span>
          </div>
          <p className="text-white font-semibold">{quantity}</p>
        </div>
        
        <div className="p-3 bg-blue-900/30 rounded-xl">
          <div className="flex items-center gap-2 text-blue-300 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Unit Price</span>
          </div>
          <p className="text-white font-semibold">${unitPrice}</p>
        </div>

        <div className="p-3 bg-blue-900/30 rounded-xl">
          <div className="flex items-center gap-2 text-blue-300 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-white font-semibold">${totalCost}</p>
        </div>
      </div>

      <div className="w-full bg-blue-900/20 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
        />
      </div>
    </motion.div>
  );
};

export default MaterialCostCard;