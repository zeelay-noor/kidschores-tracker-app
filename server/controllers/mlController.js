const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:5002';

exports.predictTaskCompletion = async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('ML prediction error:', error);
    res.status(500).json({ error: 'ML service unavailable' });
  }
};

exports.getMLHealth = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'ML service down' });
  }
};