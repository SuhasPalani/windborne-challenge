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

        console.log(`Fetched ${hour}.json - Type: ${typeof response.data}, IsArray: ${Array.isArray(response.data)}`);

        let balloons = [];

        // Handle different response formats
        if (Array.isArray(response.data)) {
          balloons = response.data.map((item, index) => {
            try {
              // Format 1: Array [lat, lon, altitude]
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
              // Format 2: Object {lat, lon, altitude} or {latitude, longitude, altitude}
              else if (typeof item === 'object' && item !== null) {
                const lat = item.lat || item.latitude;
                const lon = item.lon || item.longitude || item.long || item.lng;
                const altitude = item.altitude || item.alt || item.height;

                if (lat !== undefined && lon !== undefined && altitude !== undefined) {
                  return {
                    id: `balloon-${hour}-${index}`,
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    altitude: parseFloat(altitude),
                    hoursAgo: i,
                    timestamp: new Date(Date.now() - i * 3600000).toISOString()
                  };
                }
              }
              return null;
            } catch (err) {
              console.error(`Error parsing balloon ${hour}-${index}:`, err.message);
              return null;
            }
          }).filter(b => b !== null && !isNaN(b.lat) && !isNaN(b.lon) && !isNaN(b.altitude));
        }
        // Handle if response.data is an object with a balloons array
        else if (typeof response.data === 'object' && response.data !== null) {
          if (response.data.balloons && Array.isArray(response.data.balloons)) {
            balloons = response.data.balloons.map((item, index) => {
              try {
                const lat = item.lat || item.latitude;
                const lon = item.lon || item.longitude || item.long || item.lng;
                const altitude = item.altitude || item.alt || item.height;

                if (lat !== undefined && lon !== undefined && altitude !== undefined) {
                  return {
                    id: `balloon-${hour}-${index}`,
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    altitude: parseFloat(altitude),
                    hoursAgo: i,
                    timestamp: new Date(Date.now() - i * 3600000).toISOString()
                  };
                }
                return null;
              } catch (err) {
                return null;
              }
            }).filter(b => b !== null && !isNaN(b.lat) && !isNaN(b.lon) && !isNaN(b.altitude));
          }
        }

        console.log(`Parsed ${balloons.length} balloons from ${hour}.json`);

        allData.push({
          hour: hour,
          hoursAgo: i,
          balloons: balloons,
          count: balloons.length
        });

      } catch (error) {
        console.error(`Error fetching ${hour}.json:`, error.message);
        errors.push({
          hour: hour,
          error: error.message
        });
      }
    }

    // Flatten all balloons
    const allBalloons = allData.flatMap(d => d.balloons);

    console.log(`Total balloons collected: ${allBalloons.length}`);

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
    if (balloons.length === 0) {
      return {
        avgAltitude: '0.00',
        maxAltitude: '0.00',
        minAltitude: '0.00',
        avgLat: '0.00',
        avgLon: '0.00',
        totalActive: 0,
        hemispheres: {
          northern: 0,
          southern: 0,
          eastern: 0,
          western: 0
        }
      };
    }

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
    if (!data.byHour) return [];
    
    return data.byHour
      .filter(h => h.hoursAgo < hours)
      .flatMap(h => h.balloons);
  }
}

module.exports = new BalloonService();