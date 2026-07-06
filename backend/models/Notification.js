const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  message: { type: String, required: true },
  type: { type: String, enum: ['status_update', 'upvote', 'duplicate', 'flagged'], default: 'status_update' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
