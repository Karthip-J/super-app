import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createBikeIcon } from './BikeIcon';
import { useLocation } from 'react-router-dom';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng]);
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({
          latLng: {
            lat: () => e.latlng.lat,
            lng: () => e.latlng.lng,
          }
        });
      }
    }
  });
  return null;
}

function PolylineWithFitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = positions.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return <Polyline positions={positions} pathOptions={{ color: 'blue', weight: 4 }} />;
}

// Function to generate random points around a center (Rapido style)
const generateRandomPoints = (center, count = 12, radius = 0.001) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = radius * (0.7 + 0.6 * Math.random()); // Vary radius a bit
    points.push({
      position: {
        lat: center.lat + Math.sin(angle) * r,
        lng: center.lng + Math.cos(angle) * r
      },
      id: `bike-${i}`
    });
  }
  return points;
};

// Add subtle pulsing effect to bike markers
if (typeof document !== 'undefined' && !document.getElementById('bike-marker-style')) {
  const style = document.createElement('style');
  style.id = 'bike-marker-style';
  style.textContent = `
    .bike-marker {
      animation: bike-pulse 1.2s infinite alternate;
    }
    @keyframes bike-pulse {
      0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.2); }
      100% { box-shadow: 0 0 12px 6px rgba(37,99,235,0.12); }
    }
  `;
  document.head.appendChild(style);
}

const PulsingMarker = ({ position }) => {
  const markerRef = useRef(null);
  const icon = createBikeIcon();
  const [mounted, setMounted] = useState(false);

  // Only render the marker if we have a valid position
  if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    return null;
  }

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      ref={markerRef}
    >
      <Popup>Bike Available</Popup>
    </Marker>
  );
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

// Create a custom Google Maps-style blue pin icon for the user's pickup marker
const createLocationIcon = () => {
  return L.divIcon({
    className: 'pickup-marker',
    html: `
      <div style="width: 32px; height: 40px; display: flex; align-items: flex-end; justify-content: center;">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path d="M16 39C16 39 28 25.5 28 16C28 8.26801 22.0751 2 16 2C9.92487 2 4 8.26801 4 16C4 25.5 16 39 16 39Z" fill="#2563eb" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="5" fill="#fff" stroke="#2563eb" stroke-width="2"/>
          </g>
          <defs>
            <filter id="shadow" x="0" y="0" width="32" height="40" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.15"/>
            </filter>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40], // bottom point of the pin
    popupAnchor: [0, -40]
  });
};

const Map = ({ center = defaultCenter, markers = [], polyline = null, onMapClick, height = '100%', showZoomControl = true, bikeAnimationCenter, zoom = 15, showBikes = true, forceLocationIcon = false }) => {
  const [bikeMarkers, setBikeMarkers] = useState([]);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (showBikes && center && center.lat && center.lng) {
      const bikes = generateRandomPoints(center, 5, 0.02);
      setBikeMarkers(bikes);
    } else {
      setBikeMarkers([]);
    }
  }, [center, showBikes]);

  // Animate bikes only if bikeAnimationCenter is provided and not on select-pickup-point page
  useEffect(() => {
    let isMounted = true;
    const animationCenter = bikeAnimationCenter || center;
    const isPickupPointPage = location.pathname.includes('select-pickup-point');
    if (showBikes && bikeAnimationCenter && animationCenter && animationCenter.lat && animationCenter.lng && !isPickupPointPage) {
      setBikeMarkers(generateRandomPoints(animationCenter, 5, 0.02));
      // Animate bikes every 2 seconds
      const interval = setInterval(() => {
        if (isMounted) {
          setBikeMarkers(generateRandomPoints(animationCenter, 5, 0.02));
        }
      }, 2000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } else {
      // No animation, just clear bikes
      setBikeMarkers([]);
    }
  }, [bikeAnimationCenter, center, location.pathname, showBikes]);

  // Only render the map content when the map is ready
  const handleMapReady = () => {
    setMapReady(true);
  };

  // Ensure center has valid coordinates
  const mapCenter = center && typeof center.lat === 'number' && typeof center.lng === 'number' 
    ? [center.lat, center.lng] 
    : [defaultCenter.lat, defaultCenter.lng];

  return (
    <MapContainer 
      center={mapCenter}
      zoom={zoom} 
      style={{ width: '100%', height: height }} 
      scrollWheelZoom={true} 
      zoomControl={showZoomControl}
      ref={mapRef}
      whenReady={handleMapReady}
    >
      <MapCenterUpdater center={center} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler onMapClick={onMapClick} />
      
      {/* Bike markers - only render when map is ready and bikeAnimationCenter is provided */}
      {showBikes && mapReady && bikeAnimationCenter && bikeMarkers.map((bike) => (
        <PulsingMarker
          key={bike.id}
          position={bike.position}
        />
      ))}
      
      {/* Regular markers (pickup uses location icon, captain uses bike icon, or force all location icon) */}
      {markers.map((marker, index) => (
         <Marker
           key={`marker-${index}`}
           position={[marker.position.lat, marker.position.lng]}
           icon={forceLocationIcon ? createLocationIcon() : (marker.title === 'Pickup' ? createLocationIcon() : createBikeIcon())}
         >
           <Popup>{marker.title}</Popup>
         </Marker>
      ))}
      
      {/* Polylines */}
      {polyline && polyline.length > 1 && (
        <PolylineWithFitBounds positions={polyline} />
      )}
    </MapContainer>
  );
};

export default Map;