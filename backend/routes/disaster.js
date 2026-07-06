const express = require('express');
const router = express.Router();
const Disaster = require('../models/Disaster');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Priority assignment utility
const getInitialPriority = (type) => {
  const critical = ['fire', 'flood', 'accident', 'earthquake'];
  const high = ['landslide', 'building_collapse'];
  const medium = ['fallen_tree', 'power_outage'];

  if (critical.includes(type)) return 'critical';
  if (high.includes(type)) return 'high';
  if (medium.includes(type)) return 'medium';
  return 'low';
};

// Escalate priority based on upvotes
const escalatePriority = (currentPriority, upvotes) => {
  if (upvotes < 10) return currentPriority; // Only escalate if > 10
  
  if (upvotes > 20 && currentPriority === 'high') return 'critical';
  if (upvotes > 15 && currentPriority === 'medium') return 'high';
  if (upvotes > 10 && currentPriority === 'low') return 'medium';

  return currentPriority; 
};

// GET all disaster alerts (latest first)
// Open to public
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type && type !== 'all') filter.type = type;

    const disasters = await Disaster.find(filter)
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json(disasters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST report a disaster
// Publicly accessible, but if auth token exists we could save reporter. Handling as public route safely.
router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, location } = req.body;
    const priority = getInitialPriority(type);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newDisaster = await Disaster.create({
      title,
      description,
      type,
      location,
      image: imageUrl,
      priority,
      status: 'reported'
    });

    res.status(201).json(newDisaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT upvote a disaster
// Open to public (basic implementation, proper one would track IP or device ID to prevent spam, but we keep it simple)
router.put('/upvote/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) return res.status(404).json({ message: 'Disaster alert not found' });

    disaster.upvotes += 1;
    disaster.priority = escalatePriority(disaster.priority, disaster.upvotes);
    
    await disaster.save();
    
    res.json({ id: disaster._id, upvotes: disaster.upvotes, priority: disaster.priority });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update status (Admin only)
router.put('/status/:id', protect, authorize('authority', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) return res.status(404).json({ message: 'Disaster alert not found' });

    disaster.status = status;
    await disaster.save();

    res.json(disaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
