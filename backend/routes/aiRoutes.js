const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const aiController = require('../controllers/aiController');
// If auth is needed, you can require protect middleware
// const { protect } = require('../middleware/auth');

router.post('/predict', upload.single('image'), aiController.predictIssue);

module.exports = router;
