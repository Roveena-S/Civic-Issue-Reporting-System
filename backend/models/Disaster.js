const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['flood', 'fire', 'accident', 'landslide', 'fallen_tree', 'earthquake', 'power_outage', 'road_blockage', 'building_collapse', 'other'],
    required: true
  },
  location: { type: String, required: true },
  image: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  upvotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Keep track so users only vote once, even if anonymous we might track IP or pass null (for public issues, we'll allow an open upvote endpoint with a simple ID array if auth is sent)
  status: {
    type: String,
    enum: ['reported', 'verified', 'in_progress', 'resolved'],
    default: 'reported'
  },
  // If user is authenticated, we log them. If public, this is null.
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Optional: Automatically set priority during validation or in the controller
module.exports = mongoose.model('Disaster', disasterSchema);
