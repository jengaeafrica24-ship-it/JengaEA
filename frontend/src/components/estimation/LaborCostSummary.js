import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, AlertCircle, Download, Share2, ChevronDown } from 'lucide-react';

const LaborCostSummary = ({ estimateData }) => {
  if (!estimateData) return null;

  return (
    <div className="space-y-6">
      {/* Labor Roles Section */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Labor Cost Breakdown</h3>
        <div className="space-y-4">
          {estimateData.labor_roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-900/20 p-4 rounded-lg"
            >
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">{role.role}</span>
                <span className="text-blue-300">KES {role.totalCost.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-300/80">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Workers: {role.numberOfWorkers}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Duration: {role.durationDays} days
                </div>
                <div>Skill Level: {role.skillLevel}</div>
                <div>Daily Rate: KES {role.dailyRate.toLocaleString()}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cost Summary Section */}
      <div className="border-t border-blue-800/30 pt-4">
        <div className="space-y-2">
          {estimateData.subtotal && (
            <div className="flex justify-between text-blue-300">
              <span>Subtotal</span>
              <span>KES {estimateData.subtotal.toLocaleString()}</span>
            </div>
          )}
          {estimateData.statutoryDeductions && (
            <div className="flex justify-between text-blue-300">
              <span>Statutory Deductions</span>
              <span>KES {estimateData.statutoryDeductions.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-semibold text-lg pt-2">
            <span>Total Labor Cost</span>
            <span>KES {estimateData.totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {estimateData.recommendations && estimateData.recommendations.length > 0 && (
        <div className="border-t border-blue-800/30 pt-4">
          <h3 className="text-lg font-medium text-white mb-3">Labor Recommendations</h3>
          <ul className="space-y-2">
            {estimateData.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-blue-300/80"
              >
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions Section */}
      <div className="flex gap-4 pt-4 border-t border-blue-800/30">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors">
          <Download className="w-4 h-4" />
          Download Estimate
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors">
          <Share2 className="w-4 h-4" />
          Share Estimate
        </button>
      </div>
    </div>
  );
};

export default LaborCostSummary;