const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherForLocation(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      return {
        location: response.data.name || 'Unknown',
        country: response.data.sys?.country || 'Unknown',
        temp: response.data.main?.temp,
        feelsLike: response.data.main?.feels_like,
        humidity: response.data.main?.humidity,
        pressure: response.data.main?.pressure,
        windSpeed: response.data.wind?.speed,
        windDeg: response.data.wind?.deg,
        clouds: response.data.clouds?.all,
        weather: response.data.weather?.[0]?.main,
        description: response.data.weather?.[0]?.description,
        icon: response.data.weather?.[0]?.icon,
        lat: lat,
        lon: lon
      };
    } catch (error) {
      console.error(`Weather fetch error for ${lat},${lon}:`, error.message);
      return null;
    }
  }

  async getWeatherForBalloons(balloons, limit = 10) {
    // Get weather for up to 'limit' random balloons to avoid API rate limits
    const selectedBalloons = this.selectRepresentativeBalloons(balloons, limit);
    
    const weatherPromises = selectedBalloons.map(balloon => 
      this.getWeatherForLocation(balloon.lat, balloon.lon)
        .then(weather => ({
          balloon: balloon,
          weather: weather
        }))
    );

    const results = await Promise.all(weatherPromises);
    return results.filter(r => r.weather !== null);
  }

  selectRepresentativeBalloons(balloons, limit) {
    if (balloons.length <= limit) return balloons;

    // Select balloons from different regions
    const sorted = [...balloons].sort((a, b) => {
      // Sort by lat and lon to get geographic diversity
      const aKey = Math.floor(a.lat / 30) * 100 + Math.floor(a.lon / 60);
      const bKey = Math.floor(b.lat / 30) * 100 + Math.floor(b.lon / 60);
      return aKey - bKey;
    });

    const step = Math.floor(sorted.length / limit);
    const selected = [];
    for (let i = 0; i < limit && i * step < sorted.length; i++) {
      selected.push(sorted[i * step]);
    }
    return selected;
  }

  async getGlobalWeatherSummary(balloonWeatherData) {
    const weatherConditions = {};
    let totalTemp = 0;
    let totalHumidity = 0;
    let totalPressure = 0;
    let totalWindSpeed = 0;
    let count = 0;

    balloonWeatherData.forEach(({ weather }) => {
      if (weather) {
        const condition = weather.weather || 'Unknown';
        weatherConditions[condition] = (weatherConditions[condition] || 0) + 1;

        totalTemp += weather.temp || 0;
        totalHumidity += weather.humidity || 0;
        totalPressure += weather.pressure || 0;
        totalWindSpeed += weather.windSpeed || 0;
        count++;
      }
    });

    return {
      avgTemp: count > 0 ? (totalTemp / count).toFixed(1) : 0,
      avgHumidity: count > 0 ? (totalHumidity / count).toFixed(1) : 0,
      avgPressure: count > 0 ? (totalPressure / count).toFixed(1) : 0,
      avgWindSpeed: count > 0 ? (totalWindSpeed / count).toFixed(1) : 0,
      conditions: weatherConditions,
      dataPoints: count
    };
  }
}

module.exports = new WeatherService();