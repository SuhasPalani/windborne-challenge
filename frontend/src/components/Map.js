import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom balloon icon
const balloonIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmYwMDAwIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjYiLz48cGF0aCBkPSJNMTIgMTRsLTIgNmgyeiIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const Map = ({ balloons, weatherData }) => {
  // Get recent balloons (last hour)
  const recentBalloons = balloons.filter(b => b.hoursAgo === 0).slice(0, 100);

  const getAltitudeColor = (altitude) => {
    if (altitude < 5) return '#3498db'; // Low - blue
    if (altitude < 15) return '#2ecc71'; // Medium - green
    return '#e74c3c'; // High - red
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {recentBalloons.map((balloon, index) => (
          <React.Fragment key={balloon.id}>
            <Circle
              center={[balloon.lat, balloon.lon]}
              radius={50000}
              pathOptions={{
                color: getAltitudeColor(balloon.altitude),
                fillColor: getAltitudeColor(balloon.altitude),
                fillOpacity: 0.3
              }}
            />
            <Marker
              position={[balloon.lat, balloon.lon]}
              icon={balloonIcon}
            >
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong>Balloon {index + 1}</strong><br />
                  <strong>Position:</strong> {balloon.lat.toFixed(2)}°, {balloon.lon.toFixed(2)}°<br />
                  <strong>Altitude:</strong> {balloon.altitude.toFixed(2)} km<br />
                  <strong>Time:</strong> {new Date(balloon.timestamp).toLocaleString()}
                  {weatherData && weatherData.length > 0 && (() => {
                    const weather = weatherData.find(w => 
                      Math.abs(w.balloon.lat - balloon.lat) < 0.1 &&
                      Math.abs(w.balloon.lon - balloon.lon) < 0.1
                    );
                    if (weather && weather.weather) {
                      return (
                        <>
                          <br /><strong>Weather:</strong> {weather.weather.weather}<br />
                          <strong>Temp:</strong> {weather.weather.temp}°C<br />
                          <strong>Wind:</strong> {weather.weather.windSpeed} m/s
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;