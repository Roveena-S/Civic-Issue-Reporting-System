const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

/**
 * @route   POST /api/ai/predict
 * @desc    Process uploaded image via Roboflow AI and return issue type
 * @access  Public (or Protected depending on requirements)
 */
exports.predictIssue = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const apiKey = process.env.ROBOFLOW_API_KEY;
    const modelId = "civic-issues-nq7sy-bh8t3/1";
    // user explicitly requested serverless.roboflow.com
    const apiUrl = `https://serverless.roboflow.com/${modelId}`;

    if (!apiKey || apiKey === 'YOUR_ROBOFLOW_API_KEY') {
      return res.status(500).json({ message: 'Roboflow API key is not configured. Key value: ' + apiKey });
    }

    // Read the image as base64 string
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

    // Send to Roboflow
    const response = await axios({
      method: 'POST',
      url: apiUrl,
      params: {
        api_key: apiKey,
      },
      data: imageBase64,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const predictions = response.data.predictions || [];

    // Fallback if no issues detected
    if (predictions.length === 0) {
      return res.json({
        detectedClass: 'other',
        confidence: 0,
        rawPredictions: []
      });
    }

    // Get the most confident prediction
    const topPrediction = predictions.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );

    // Some normalization on the class name (e.g., removing spaces or making lowercase)
    const normalizedClass = topPrediction.class.toLowerCase().replace(/ /g, '_');

    res.json({
      detectedClass: normalizedClass,
      confidence: topPrediction.confidence,
      rawPredictions: predictions
    });

  } catch (err) {
    console.error('AI Prediction error:', err.response?.data || err.message);
    res.status(500).json({ 
      message: 'Failed to process image with AI',
      error: err.message
    });
  }
};
