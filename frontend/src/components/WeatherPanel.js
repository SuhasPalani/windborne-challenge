import React from 'react';

const WeatherPanel = ({ weatherData }) => {
  const { data, summary } = weatherData;

  if (!data || !summary) return null;

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="weather-panel">
      <h2>Weather Conditions at Balloon Locations</h2>
      
      <div className="weather-summary">
        <h3>Global Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-icon">🌡️</span>
            <div>
              <div className="summary-value">{summary.avgTemp}°C</div>
              <div className="summary-label">Avg Temperature</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">💧</span>
            <div>
              <div className="summary-value">{summary.avgHumidity}%</div>
              <div className="summary-label">Avg Humidity</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">🌪️</span>
            <div>
              <div className="summary-value">{summary.avgWindSpeed} m/s</div>
              <div className="summary-label">Avg Wind Speed</div>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">📊</span>
            <div>
              <div className="summary-value">{summary.avgPressure} hPa</div>
              <div className="summary-label">Avg Pressure</div>
            </div>
          </div>
        </div>

        <div className="conditions-breakdown">
          <h4>Weather Conditions Distribution</h4>
          <div className="conditions-list">
            {Object.entries(summary.conditions).map(([condition, count]) => (
              <div key={condition} className="condition-item">
                <span className="condition-name">{condition}</span>
                <span className="condition-count">{count} location{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="weather-locations">
        <h3>Sample Locations ({data.length} data points)</h3>
        <div className="locations-grid">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="weather-card">
              <div className="weather-card-header">
                <div>
                  <strong>{item.weather.location || 'Unknown'}</strong>
                  <span className="coordinates">
                    {item.balloon.lat.toFixed(2)}°, {item.balloon.lon.toFixed(2)}°
                  </span>
                </div>
                {item.weather.icon && (
                  <img 
                    src={getWeatherIcon(item.weather.icon)} 
                    alt={item.weather.weather}
                    className="weather-icon"
                  />
                )}
              </div>
              <div className="weather-details">
                <div className="weather-detail">
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">{item.weather.description}</span>
                </div>
                <div className="weather-detail">
                  <span className="detail-label">Temperature:</span>
                  <span className="detail-value">{item.weather.temp}°C</span>
                </div>
                <div className="weather-detail">
                  <span className="detail-label">Wind:</span>
                  <span className="detail-value">{item.weather.windSpeed} m/s</span>
                </div>
                <div className="weather-detail">
                  <span className="detail-label">Humidity:</span>
                  <span className="detail-value">{item.weather.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherPanel;