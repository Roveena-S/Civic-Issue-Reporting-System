const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

const ISSUE_TYPES = ['pothole', 'garbage', 'water_leakage', 'broken_streetlight', 'other'];
const STATUSES = ['reported', 'verified', 'in_progress', 'resolved'];
const PRIORITIES = ['low', 'medium', 'high'];

// Coimbatore area coordinates
const BASE_LAT = 11.0168, BASE_LON = 76.9558;
const rand = (min, max) => Math.random() * (max - min) + min;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Complaint.deleteMany(), Notification.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const [citizen, authority, admin] = await User.create([
    { name: 'Rahul Sharma', email: 'citizen@demo.com', password: 'password123', role: 'citizen' },
    { name: 'Priya Verma', email: 'authority@demo.com', password: 'password123', role: 'authority' },
    { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin' },
  ]);
  console.log('Created users');

  // Create 40 complaints
  const complaints = [];
  for (let i = 0; i < 40; i++) {
    const issueType = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const upvotes = Math.floor(Math.random() * 20);
    const lat = BASE_LAT + rand(-0.05, 0.05);
    const lon = BASE_LON + rand(-0.05, 0.05);
    const createdAt = new Date(Date.now() - rand(0, 90) * 24 * 60 * 60 * 1000);

    const timeline = [{ status: 'reported', note: 'Complaint submitted by citizen', updatedBy: citizen._id, timestamp: createdAt }];
    if (['verified', 'in_progress', 'resolved'].includes(status)) {
      timeline.push({ status: 'verified', note: 'Complaint verified by authority', updatedBy: authority._id, timestamp: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) });
    }
    if (['in_progress', 'resolved'].includes(status)) {
      timeline.push({ status: 'in_progress', note: 'Work order assigned to maintenance team', updatedBy: authority._id, timestamp: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) });
    }
    if (status === 'resolved') {
      timeline.push({ status: 'resolved', note: 'Issue has been resolved', updatedBy: authority._id, timestamp: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) });
    }

    complaints.push({
      user: citizen._id,
      issueType,
      description: `${issueType.replace('_', ' ')} reported near sector ${Math.floor(rand(1, 50))}. Needs immediate attention.`,
      latitude: lat,
      longitude: lon,
      address: `Zone ${Math.floor(rand(1, 10))}, Coimbatore`,
      status,
      priority,
      upvotes,
      voters: upvotes > 0 ? [citizen._id] : [],
      aiConfidence: rand(0.6, 0.99),
      isFlagged: Math.random() < 0.1,
      timeline,
      resolvedAt: status === 'resolved' ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
      createdAt,
    });
  }

  await Complaint.insertMany(complaints);
  console.log('Created 40 complaints');

  // Create notifications
  const savedComplaints = await Complaint.find().limit(5);
  const notifs = savedComplaints.map(c => ({
    user: citizen._id,
    complaint: c._id,
    message: `Your complaint about ${c.issueType.replace('_', ' ')} has been ${c.status}`,
    type: 'status_update',
    isRead: false,
  }));
  await Notification.insertMany(notifs);
  console.log('Created notifications');

  console.log('\n✅ Seed complete!');
  console.log('Demo accounts:');
  console.log('  Citizen:   citizen@demo.com   / password123');
  console.log('  Authority: authority@demo.com / password123');
  console.log('  Admin:     admin@demo.com     / password123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
