import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Stats = ({ balloonData }) => {
  const { stats, byHour } = balloonData;

  if (!stats) return null;

  // Prepare chart data
  const hourlyData = byHour.map(h => ({
    hour: `${h.hoursAgo}h ago`,
    count: h.count,
    hoursAgo: h.hoursAgo
  })).reverse();

  const hemisphereData = [
    { name: 'Northern', value: stats.hemispheres.northern },
    { name: 'Southern', value: stats.hemispheres.southern },
    { name: 'Eastern', value: stats.hemispheres.eastern },
    { name: 'Western', value: stats.hemispheres.western }
  ];

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalActive}</div>
          <div className="stat-label">Active Balloons</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgAltitude} km</div>
          <div className="stat-label">Avg Altitude</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.maxAltitude} km</div>
          <div className="stat-label">Max Altitude</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{balloonData.totalBalloons}</div>
          <div className="stat-label">Total Data Points (24h)</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Balloon Count Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hemisphereData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2ecc71" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="altitude-info">
        <h3>Altitude Range</h3>
        <div className="altitude-bar">
          <div className="altitude-segment low">
            <span>Low (&lt;5km)</span>
          </div>
          <div className="altitude-segment medium">
            <span>Medium (5-15km)</span>
          </div>
          <div className="altitude-segment high">
            <span>High (&gt;15km)</span>
          </div>
        </div>
        <p className="altitude-note">
          Min: {stats.minAltitude} km | Max: {stats.maxAltitude} km | Avg: {stats.avgAltitude} km
        </p>
      </div>
    </div>
  );
};

export default Stats;