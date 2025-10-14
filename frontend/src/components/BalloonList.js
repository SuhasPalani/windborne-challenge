import { useState } from 'react';

const BalloonList = ({ balloons }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredBalloons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayBalloons = filteredBalloons.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getAltitudeClass = (altitude) => {
    if (altitude < 5) return 'altitude-low';
    if (altitude < 15) return 'altitude-medium';
    return 'altitude-high';
  };

  const getLocationName = (lat, lon) => {
    // Determine general region based on coordinates
    const latAbs = Math.abs(lat);
    
    // Ocean regions
    if (lat > 0 && lon > -180 && lon < -30) return 'North Atlantic';
    if (lat > 0 && lon > 30 && lon < 180) return 'North Pacific';
    if (lat < 0 && lon > -180 && lon < -30) return 'South Atlantic';
    if (lat < 0 && lon > 30 && lon < 180) return 'South Pacific';
    
    // Continents (rough approximations)
    if (lat > 15 && lat < 75 && lon > -15 && lon < 60) return 'Europe/Asia';
    if (lat > -35 && lat < 40 && lon > -20 && lon < 55) return 'Africa';
    if (lat > 15 && lat < 75 && lon > -170 && lon < -50) return 'North America';
    if (lat > -60 && lat < 15 && lon > -85 && lon < -30) return 'South America';
    if (lat > -45 && lat < -10 && lon > 110 && lon < 155) return 'Australia';
    
    // Polar regions
    if (latAbs > 66) return lat > 0 ? 'Arctic' : 'Antarctic';
    
    // Default oceans
    if (latAbs < 30) return 'Tropical Waters';
    return 'Ocean';
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filter} 
            onChange={(e) => handleFilterChange(e.target.value)}
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
          displayBalloons.map((balloon, index) => {
            const globalIndex = startIndex + index;
            return (
              <div key={balloon.id} className="balloon-item">
                <div className="balloon-item-header">
                  <span className="balloon-index">#{globalIndex + 1}</span>
                  <span className={`altitude-badge ${getAltitudeClass(balloon.altitude)}`}>
                    {balloon.altitude.toFixed(2)} km
                  </span>
                </div>
                <div className="balloon-item-body">
                  <div className="balloon-detail">
                    <span className="detail-label">Region:</span>
                    <span className="detail-value">
                      {getLocationName(balloon.lat, balloon.lon)}
                    </span>
                  </div>
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
            );
          })
        )}
      </div>

      {filteredBalloons.length > itemsPerPage && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBalloons.length)} of {filteredBalloons.length} balloons
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ⏮️ First
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ◀️ Prev
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show current page and 2 pages before/after
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next ▶️
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Last ⏭️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalloonList;