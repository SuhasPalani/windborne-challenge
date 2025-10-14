const axios = require('axios');

const BASE_URL = 'https://a.windbornesystems.com/treasure';

class BalloonService {
  async fetchAllBalloonData() {
    const allData = [];
    const errors = [];

    // Fetch data from 00.json to 23.json (24 hours)
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      try {
        const response = await axios.get(`${BASE_URL}/${hour}.json`, {
          timeout: 5000,
          validateStatus: (status) => status === 200
        });

        if (Array.isArray(response.data)) {
          // Parse balloon data
          const balloons = response.data.map((item, index) => {
            try {
              // Handle different data formats
              if (Array.isArray(item) && item.length >= 3) {
                return {
                  id: `balloon-${hour}-${index}`,
                  lat: parseFloat(item[0]),
                  lon: parseFloat(item[1]),
                  altitude: parseFloat(item[2]),
                  hoursAgo: i,
                  timestamp: new Date(Date.now() - i * 3600000).toISOString()
                };
              }
              return null;
            } catch (err) {
              return null;
            }
          }).filter(b => b !== null && !isNaN(b.lat) && !isNaN(b.lon));

          allData.push({
            hour: hour,
            hoursAgo: i,
            balloons: balloons,
            count: balloons.length
          });
        }
      } catch (error) {
        errors.push({
          hour: hour,
          error: error.message
        });
      }
    }

    // Flatten all balloons
    const allBalloons = allData.flatMap(d => d.balloons);

    // Calculate statistics
    const stats = this.calculateStats(allBalloons);

    return {
      success: true,
      totalBalloons: allBalloons.length,
      byHour: allData,
      allBalloons: allBalloons,
      stats: stats,
      errors: errors,
      lastUpdated: new Date().toISOString()
    };
  }

  calculateStats(balloons) {
    if (balloons.length === 0) return null;

    const altitudes = balloons.map(b => b.altitude);
    const lats = balloons.map(b => b.lat);
    const lons = balloons.map(b => b.lon);

    return {
      avgAltitude: (altitudes.reduce((a, b) => a + b, 0) / altitudes.length).toFixed(2),
      maxAltitude: Math.max(...altitudes).toFixed(2),
      minAltitude: Math.min(...altitudes).toFixed(2),
      avgLat: (lats.reduce((a, b) => a + b, 0) / lats.length).toFixed(2),
      avgLon: (lons.reduce((a, b) => a + b, 0) / lons.length).toFixed(2),
      totalActive: balloons.filter(b => b.hoursAgo === 0).length,
      hemispheres: {
        northern: balloons.filter(b => b.lat > 0).length,
        southern: balloons.filter(b => b.lat < 0).length,
        eastern: balloons.filter(b => b.lon > 0).length,
        western: balloons.filter(b => b.lon < 0).length
      }
    };
  }

  // Get most recent balloons for map display
  getRecentBalloons(data, hours = 1) {
    return data.byHour
      .filter(h => h.hoursAgo < hours)
      .flatMap(h => h.balloons);
  }
}

module.exports = new BalloonService();