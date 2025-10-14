import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Stats from './components/Stats';
import WeatherPanel from './components/WeatherPanel';
import AIInsights from './components/AIInsights';
import BalloonList from './components/BalloonList';
import apiService from './services/api';
import './styles/App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAllData();
      setData(response);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await fetchData();
  };

  if (loading && !data) {
    return (
      <div className="App">
        <div className="header">
          <h1>🎈 WindBorne Constellation Tracker</h1>
          <p className="header-subtitle">Real-time Weather Balloon Monitoring with AI Insights</p>
        </div>
        <div className="loading">
          <div>Loading balloon constellation data...</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="App">
        <div className="header">
          <h1>🎈 WindBorne Constellation Tracker</h1>
          <p className="header-subtitle">Real-time Weather Balloon Monitoring with AI Insights</p>
        </div>
        <div className="error">
          <div>⚠️ Error loading data: {error}</div>
          <button onClick={handleRefresh} className="refresh-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const recentBalloons = data?.balloon?.allBalloons || [];

  return (
    <div className="App">
      <div className="header">
        <h1>🎈 WindBorne Constellation Tracker</h1>
        <p className="header-subtitle">Real-time Weather Balloon Monitoring with AI-Powered Insights</p>
      </div>

      <div className="controls">
        <button 
          onClick={handleRefresh} 
          className="refresh-button"
          disabled={loading}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
        
        {lastUpdate && (
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()} 
            {data?.cached && ' (cached)'}
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="map-section">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              🗺️ Live Map
            </button>
            <button 
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              📋 Balloon List
            </button>
            <button 
              className={`tab-button ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              🌤️ Weather Data
            </button>
          </div>

          {activeTab === 'map' && (
            <div className="map-container">
              <Map 
                balloons={recentBalloons} 
                weatherData={data?.weather?.data || []}
              />
            </div>
          )}

          {activeTab === 'list' && (
            <BalloonList balloons={recentBalloons} />
          )}

          {activeTab === 'weather' && data?.weather && (
            <WeatherPanel weatherData={data.weather} />
          )}
        </div>

        <div className="sidebar">
          {data?.balloon && (
            <Stats balloonData={data.balloon} />
          )}

          {data?.ai && (
            <AIInsights aiData={data.ai} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;