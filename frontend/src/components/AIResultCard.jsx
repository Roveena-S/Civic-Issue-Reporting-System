import React from 'react';
import { motion } from 'framer-motion';

// Local frontend version of calculatePriority
const HIGH_PRIORITY_TYPES = ['pothole', 'water_leakage'];
function calculatePriority(issueType, confidence = 0, upvotes = 0) {
  if (HIGH_PRIORITY_TYPES.includes(issueType) || confidence > 0.8 || upvotes > 10) return 'HIGH';
  if ((confidence >= 0.5 && confidence <= 0.8) || (upvotes >= 5 && upvotes <= 10)) return 'MEDIUM';
  return 'LOW';
}

export default function AIResultCard({ aiResult }) {
  if (!aiResult) return null;

  // Determine confidence badge color based on score
  let badgeColor = '#ef4444'; // Red (<50%)
  let badgeLabel = 'Low Confidence';
  if (aiResult.confidence >= 0.8) {
    badgeColor = '#22c55e'; // Green (>80%)
    badgeLabel = 'High Confidence';
  } else if (aiResult.confidence >= 0.5) {
    badgeColor = '#eab308'; // Yellow (50-80%)
    badgeLabel = 'Moderate Confidence';
  }

  const isVerified = aiResult.confidence > 0.75;
  const percentage = Math.round(aiResult.confidence * 100);

  const priority = calculatePriority(aiResult.detectedClass, aiResult.confidence, 0);
  const priorityColors = {
    HIGH: { bg: '#ef444420', text: '#ef4444', border: '#ef444450' },
    MEDIUM: { bg: '#eab30820', text: '#eab308', border: '#eab30850' },
    LOW: { bg: '#22c55e20', text: '#22c55e', border: '#22c55e50' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 p-4 rounded-xl border border-white/10 glass max-w-sm mx-auto flex flex-col gap-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm font-medium">Issue Detected:</span>
        <span className="text-white font-semibold capitalize bg-blue-500/20 px-2 py-1 rounded-md text-sm border border-blue-500/30">
          {aiResult.label || aiResult.detectedClass.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-400 text-sm font-medium">Confidence:</span>
        <div className="flex items-center gap-2">
          <span 
            style={{ backgroundColor: `${badgeColor}20`, color: badgeColor, borderColor: `${badgeColor}50` }} 
            className="px-2 py-1 rounded-md text-xs font-semibold border"
          >
            {percentage}%
          </span>
          {isVerified && (
            <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1">
              ✓ AI Verified
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-400 text-sm font-medium">Calculated Priority:</span>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{ backgroundColor: priorityColors[priority].bg, color: priorityColors[priority].text, borderColor: priorityColors[priority].border }} 
          className="px-3 py-1 rounded-md text-xs font-bold border tracking-wider"
        >
          {priority}
        </motion.span>
      </div>

      <p className="text-xs text-gray-500 mt-1 italic text-center">
        {badgeLabel} match from Roboflow model
      </p>
    </motion.div>
  );
}
