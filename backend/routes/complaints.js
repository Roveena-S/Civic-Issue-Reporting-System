const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { calculatePriority } = require('../utils/priorityUtils');

// Haversine distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Simulate AI classification
const classifyImage = (filename) => {
  const types = ['pothole', 'garbage', 'water_leakage', 'broken_streetlight', 'other'];
  const confidence = Math.random() * 0.3 + 0.7;
  return { issueType: types[Math.floor(Math.random() * types.length)], confidence };
};

// GET all complaints (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { status, issueType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);
    res.json({ complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET map data (all complaints with coords)
router.get('/map', async (req, res) => {
  try {
    const complaints = await Complaint.find({ isDuplicate: false })
      .select('issueType latitude longitude status upvotes priority createdAt')
      .lean();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single complaint
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('timeline.updatedBy', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create complaint
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { issueType, description, latitude, longitude, address } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // AI classification simulation
    let aiResult = { issueType: issueType, confidence: 0.85 };
    if (req.file) aiResult = classifyImage(req.file.filename);

    // Fake report detection
    let isFlagged = false, flagReason = '';
    if (aiResult.confidence < 0.4) {
      isFlagged = true;
      flagReason = 'Low AI confidence - possible unrelated image';
    }

    // Duplicate detection (within 100m, same type)
    const nearby = await Complaint.find({
      issueType: issueType,
      latitude: { $gte: Number(latitude) - 0.001, $lte: Number(latitude) + 0.001 },
      longitude: { $gte: Number(longitude) - 0.001, $lte: Number(longitude) + 0.001 },
      status: { $ne: 'resolved' }
    });

    let isDuplicate = false, duplicateOf = null;
    for (const c of nearby) {
      if (getDistance(Number(latitude), Number(longitude), c.latitude, c.longitude) < 0.1) {
        isDuplicate = true;
        duplicateOf = c._id;
        await Complaint.findByIdAndUpdate(c._id, { $inc: { upvotes: 1 } });
        break;
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      issueType,
      description,
      imageUrl,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
      aiConfidence: aiResult.confidence,
      isFlagged,
      flagReason,
      isDuplicate,
      duplicateOf,
      timeline: [{ status: 'reported', note: 'Complaint submitted', updatedBy: req.user._id }],
      priority: calculatePriority(issueType, aiResult.confidence, 0)
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT upvote
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    if (complaint.voters.includes(req.user._id))
      return res.status(400).json({ message: 'Already voted' });

    complaint.voters.push(req.user._id);
    complaint.upvotes += 1;
    complaint.priority = calculatePriority(complaint.issueType, complaint.aiConfidence || 0, complaint.upvotes);
    await complaint.save();

    res.json({ upvotes: complaint.upvotes, priority: complaint.priority });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update status (authority)
router.put('/:id/status', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    complaint.status = status;
    complaint.timeline.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });
    if (status === 'resolved') complaint.resolvedAt = new Date();
    await complaint.save();

    // Create notification
    await Notification.create({
      user: complaint.user,
      complaint: complaint._id,
      message: `Your complaint status updated to: ${status}`,
      type: 'status_update'
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my complaints
router.get('/user/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
