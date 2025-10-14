require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');

const balloonService = require('./services/balloonService');
const weatherService = require('./services/weatherService');
const geminiService = require('./services/geminiService');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all balloon data with weather
app.get('/api/data', async (req, res) => {
  try {
    // Check cache first
    const cachedData = cache.get('fullData');
    if (cachedData) {
      return res.json({ ...cachedData, cached: true });
    }

    console.log('Fetching fresh balloon data...');
    const balloonData = await balloonService.fetchAllBalloonData();

    console.log('Fetching weather data...');
    const recentBalloons = balloonService.getRecentBalloons(balloonData, 1);
    const balloonWeather = await weatherService.getWeatherForBalloons(recentBalloons, 10);
    const weatherSummary = await weatherService.getGlobalWeatherSummary(balloonWeather);

    console.log('Generating AI insights...');
    const aiInsights = await geminiService.generateInsights(
      balloonData,
      { data: balloonWeather, summary: weatherSummary }
    );

    const response = {
      balloon: balloonData,
      weather: {
        data: balloonWeather,
        summary: weatherSummary
      },
      ai: aiInsights,
      cached: false
    };

    // Cache the result
    cache.set('fullData', response);

    res.json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get only balloon data (faster)
app.get('/api/balloons', async (req, res) => {
  try {
    const cachedData = cache.get('balloonData');
    if (cachedData) {
      return res.json({ ...cachedData, cached: true });
    }

    const balloonData = await balloonService.fetchAllBalloonData();
    cache.set('balloonData', balloonData);

    res.json({ ...balloonData, cached: false });
  } catch (error) {
    console.error('Balloon API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ask AI a question
app.post('/api/ai/question', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get current data
    let fullData = cache.get('fullData');
    if (!fullData) {
      const balloonData = await balloonService.fetchAllBalloonData();
      const recentBalloons = balloonService.getRecentBalloons(balloonData, 1);
      const balloonWeather = await weatherService.getWeatherForBalloons(recentBalloons, 10);
      const weatherSummary = await weatherService.getGlobalWeatherSummary(balloonWeather);
      
      fullData = {
        balloon: balloonData,
        weather: { data: balloonWeather, summary: weatherSummary }
      };
    }

    const answer = await geminiService.answerQuestion(
      question,
      fullData.balloon,
      fullData.weather
    );

    res.json({ question, answer, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('AI Question Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cache endpoint (useful for testing)
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/data`);
});