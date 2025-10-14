import React, { useState } from 'react';

const BalloonList = ({ balloons }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get recent balloons
  const recentBalloons = balloons.filter(b => b.hoursAgo === 0);

  // Apply filters
  let filteredBalloons = recentBalloons;

  if (filter === 'high') {
    filteredBalloons = recentBalloons.filter(b => b.altitude > 15);
  } else if (filter === 'medium') {
    filteredBalloons = recentBalloons.filter(b => b.altitude >= 5 && b.altitude <= 15);
  } else if (filter === 'low') {
    filteredBalloons = recentBalloons.filter(b => b.altitude < 5);
  }

  // Apply search
  if (searchTerm) {
    filteredBalloons = filteredBalloons.filter(b => 
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.lat.toFixed(2).includes(searchTerm) ||
      b.lon.toFixed(2).includes(searchTerm)
    );
  }

  // Limit to first 50 for performance
  const displayBalloons = filteredBalloons.slice(0, 50);

  const getAltitudeClass = (altitude) => {
    if (altitude < 5) return 'altitude-low';
    if (altitude < 15) return 'altitude-medium';
    return 'altitude-high';
  };

  return (
    <div className="balloon-list">
      <div className="list-header">
        <h3>Active Balloons ({recentBalloons.length})</h3>
        
        <div className="list-controls">
          <input
            type="text"
            placeholder="Search by ID or coordinates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Altitudes</option>
            <option value="low">Low (&lt;5km)</option>
            <option value="medium">Medium (5-15km)</option>
            <option value="high">High (&gt;15km)</option>
          </select>
        </div>
      </div>

      <div className="balloon-items">
        {displayBalloons.length === 0 ? (
          <p className="no-results">No balloons found matching your criteria.</p>
        ) : (
          displayBalloons.map((balloon, index) => (
            <div key={balloon.id} className="balloon-item">
              <div className="balloon-item-header">
                <span className="balloon-index">#{index + 1}</span>
                <span className={`altitude-badge ${getAltitudeClass(balloon.altitude)}`}>
                  {balloon.altitude.toFixed(2)} km
                </span>
              </div>
              <div className="balloon-item-body">
                <div className="balloon-detail">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">
                    {balloon.lat.toFixed(4)}°, {balloon.lon.toFixed(4)}°
                  </span>
                </div>
                <div className="balloon-detail">
                  <span className="detail-label">Hemisphere:</span>
                  <span className="detail-value">
                    {balloon.lat > 0 ? 'N' : 'S'}, {balloon.lon > 0 ? 'E' : 'W'}
                  </span>
                </div>
                <div className="balloon-detail">
                  <span className="detail-label">Last Update:</span>
                  <span className="detail-value">
                    {new Date(balloon.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredBalloons.length > 50 && (
        <p className="showing-note">
          Showing 50 of {filteredBalloons.length} balloons
        </p>
      )}
    </div>
  );
};

export default BalloonList;