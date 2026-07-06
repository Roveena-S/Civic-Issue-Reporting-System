const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Disaster = require('../models/Disaster');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, async (req, res) => {
  try {
    const [total, resolved, pending, flagged, byType, byStatus, monthly, byPriority, totalDisasters, disasterByPriority] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: { $in: ['reported', 'verified', 'in_progress'] } }),
      Complaint.countDocuments({ isFlagged: true }),
      Complaint.aggregate([{ $group: { _id: '$issueType', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Disaster.countDocuments(),
      Disaster.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
    ]);

    const highPriority = await Complaint.countDocuments({ priority: 'high' });

    res.json({ 
      total, resolved, pending, flagged, highPriority, byType, byStatus, monthly, byPriority,
      disasters: {
        total: totalDisasters,
        byPriority: disasterByPriority
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/resolution-time', protect, async (req, res) => {
  try {
    const resolved = await Complaint.find({ status: 'resolved', resolvedAt: { $ne: null } })
      .select('createdAt resolvedAt issueType');

    const data = resolved.map(c => ({
      issueType: c.issueType,
      days: Math.round((c.resolvedAt - c.createdAt) / (1000 * 60 * 60 * 24))
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
