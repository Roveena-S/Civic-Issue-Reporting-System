const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: {
    type: String,
    enum: ['pothole', 'garbage', 'water_leakage', 'broken_streetlight', 'other'],
    required: true
  },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, default: '' },
  status: {
    type: String,
    enum: ['reported', 'verified', 'in_progress', 'resolved', 'rejected'],
    default: 'reported'
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  upvotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  aiConfidence: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  isDuplicate: { type: Boolean, default: false },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  timeline: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

complaintSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
