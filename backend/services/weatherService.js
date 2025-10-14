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

      // Get better location name
      const locationName = this.getLocationName(
        response.data.name,
        response.data.sys?.country,
        lat,
        lon
      );

      return {
        location: locationName,
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

  getLocationName(name, country, lat, lon) {
    // If we have a valid city name, use it
    if (name && name !== '' && name !== 'Unknown') {
      return country && country !== 'Unknown' ? `${name}, ${country}` : name;
    }

    // Otherwise, determine region from coordinates
    const latAbs = Math.abs(lat);
    const region = this.getRegionFromCoordinates(lat, lon);
    
    return country && country !== 'Unknown' ? `${region}, ${country}` : region;
  }

  getRegionFromCoordinates(lat, lon) {
    // Polar regions
    if (lat > 66) return 'Arctic Ocean';
    if (lat < -66) return 'Antarctic Ocean';

    // Pacific Ocean regions
    if (lon >= -180 && lon < -70) {
      if (lat > 0) return 'North Pacific Ocean';
      return 'South Pacific Ocean';
    }

    // Atlantic Ocean regions
    if (lon >= -70 && lon < -20) {
      if (lat > 0) return 'North Atlantic Ocean';
      return 'South Atlantic Ocean';
    }

    // Indian Ocean
    if (lon >= 20 && lon < 120 && lat < 0) {
      return 'Indian Ocean';
    }

    // Continents (rough approximations)
    // North America
    if (lat >= 15 && lat < 72 && lon >= -168 && lon < -52) {
      if (lat > 55) return 'Northern Canada/Alaska';
      if (lon < -100) return 'Western North America';
      return 'Eastern North America';
    }

    // South America
    if (lat >= -56 && lat < 15 && lon >= -82 && lon < -34) {
      if (lat < -20) return 'Southern South America';
      if (lon > -60) return 'Eastern South America';
      return 'Western South America';
    }

    // Europe
    if (lat >= 36 && lat < 72 && lon >= -10 && lon < 40) {
      if (lat > 60) return 'Northern Europe';
      if (lon < 15) return 'Western Europe';
      return 'Eastern Europe';
    }

    // Africa
    if (lat >= -35 && lat < 38 && lon >= -18 && lon < 52) {
      if (lat > 15) return 'Northern Africa';
      if (lat < -10) return 'Southern Africa';
      return 'Central Africa';
    }

    // Asia
    if (lat >= -10 && lat < 72 && lon >= 26 && lon < 180) {
      if (lat > 50) return 'Northern Asia';
      if (lon < 75) return 'Middle East/Central Asia';
      if (lon > 135) return 'East Asia';
      return 'South Asia';
    }

    // Australia/Oceania
    if (lat >= -45 && lat < -10 && lon >= 110 && lon < 180) {
      if (lon > 160) return 'South Pacific Islands';
      return 'Australia/Oceania';
    }

    // Default for any uncategorized regions
    if (lat > 0) return 'Northern Hemisphere Waters';
    return 'Southern Hemisphere Waters';
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

    // Select balloons from different regions for geographic diversity
    const sorted = [...balloons].sort((a, b) => {
      // Create a grid system: divide world into 30° lat and 60° lon blocks
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