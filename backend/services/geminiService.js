const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async generateInsights(balloonData, weatherData) {
    if (!this.model) {
      return {
        error: 'Gemini API key not configured',
        insights: []
      };
    }

    try {
      const prompt = this.buildPrompt(balloonData, weatherData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        insights: this.parseInsights(text),
        rawResponse: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API error:', error.message);
      return {
        error: error.message,
        insights: []
      };
    }
  }

  buildPrompt(balloonData, weatherData) {
    const stats = balloonData.stats;
    const weatherSummary = weatherData.summary;

    return `You are an expert meteorologist analyzing weather balloon data. Analyze the following data and provide 5 key insights:

BALLOON DATA:
- Total Active Balloons: ${stats.totalActive}
- Average Altitude: ${stats.avgAltitude} km
- Altitude Range: ${stats.minAltitude} - ${stats.maxAltitude} km
- Geographic Distribution: ${stats.hemispheres.northern} Northern, ${stats.hemispheres.southern} Southern
- Total Historical Points: ${balloonData.totalBalloons} (last 24 hours)

WEATHER CONDITIONS (at balloon locations):
- Average Temperature: ${weatherSummary.avgTemp}°C
- Average Humidity: ${weatherSummary.avgHumidity}%
- Average Pressure: ${weatherSummary.avgPressure} hPa
- Average Wind Speed: ${weatherSummary.avgWindSpeed} m/s
- Weather Conditions: ${JSON.stringify(weatherSummary.conditions)}

Please provide:
1. One insight about flight patterns
2. One insight about weather correlation
3. One insight about geographic coverage
4. One insight about altitude distribution
5. One operational recommendation

Format each insight as a bullet point starting with "•"`;
  }

  parseInsights(text) {
    // Extract bullet points or numbered items
    const lines = text.split('\n').filter(line => line.trim());
    const insights = [];

    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned.startsWith('•') || cleaned.startsWith('-') || 
          cleaned.startsWith('*') || /^\d+\./.test(cleaned)) {
        insights.push(cleaned.replace(/^[•\-*\d.]\s*/, ''));
      }
    }

    return insights.length > 0 ? insights : [text];
  }

  async answerQuestion(question, balloonData, weatherData) {
    if (!this.model) {
      return 'Gemini API key not configured';
    }

    try {
      const context = `
Context: You're analyzing real-time weather balloon data from WindBorne Systems.

Current Data Summary:
- ${balloonData.stats.totalActive} active balloons
- Average altitude: ${balloonData.stats.avgAltitude} km
- Weather conditions: ${JSON.stringify(weatherData.summary.conditions)}
- Average temperature: ${weatherData.summary.avgTemp}°C

Question: ${question}

Provide a concise, data-driven answer based on the context above.`;

      const result = await this.model.generateContent(context);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}

module.exports = new GeminiService();