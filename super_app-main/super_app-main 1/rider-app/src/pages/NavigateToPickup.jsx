import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { API_CONFIG, buildLocationIQUrl } from '../config/api.js';
import { locationCoords, getLatLngForLocation } from '../components/Map.jsx';
// REMOVE: import BottomNav from '../components/BottomNav.jsx';
import polyline from '@mapbox/polyline';
// REMOVE: import TripStepper from '../components/TripStepper.jsx';

const iconPickup = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const iconPilot = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Auto-follow and zoom on the driver's marker
function MapAutoFollow({ position, follow }) {
  const map = useMap();
  useEffect(() => {
    if (follow && position) {
      map.setView(position, 17);
    }
  }, [position, follow, map]);
  return null;
}

// Only fit bounds on initial load (before navigation starts)
function InitialFitRouteBounds({ routeCoords }) {
  const map = useMap();
  const [initialFitDone, setInitialFitDone] = useState(false);
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1 && !initialFitDone) {
      map.fitBounds(routeCoords, { padding: [50, 50] });
      setInitialFitDone(true);
    }
  }, [routeCoords, map, initialFitDone]);
  return null;
}

// Add the PilotSOSButton component before NavigateToPickup
const PilotSOSButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#e53935',
          color: '#fff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(229,57,53,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 700,
          cursor: 'pointer',
          marginRight: 19,
        }}
        aria-label="SOS"
      >
        🆘
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 3px 16px rgba(0,0,0,0.16)',
            textAlign: 'center',
            minWidth: 260,
            maxWidth: '90vw',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🆘</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#e53935' }}>Emergency</div>
            <button style={{ width: '100%', background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginBottom: 12, cursor: 'pointer' }} onClick={() => alert('Call Police! (UI only)')}>Call Police</button>
            <button style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginBottom: 12, cursor: 'pointer' }} onClick={() => alert('Call Pilot Support! (UI only)')}>Call Pilot Support</button>
            <button style={{ width: '100%', background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

// Add ChatCallModal component before NavigateToPickup
const ChatCallModal = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'passenger', text: 'Hi, I am waiting at the pickup point.' },
    { from: 'driver', text: 'On my way!' }
  ]);
  const [input, setInput] = useState('');
  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'driver', text: input }]);
      setInput('');
    }
  };
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 0, minWidth: 320, maxWidth: '95vw', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', height: 400
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Chat with Passenger</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f7f7fa' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              textAlign: msg.from === 'driver' ? 'right' : 'left',
              marginBottom: 8
            }}>
              <span style={{
                display: 'inline-block',
                background: msg.from === 'driver' ? '#2563eb' : '#eee',
                color: msg.from === 'driver' ? '#fff' : '#333',
                borderRadius: 12,
                padding: '7px 14px',
                fontSize: 14,
                maxWidth: 200,
                wordBreak: 'break-word'
              }}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #eee', padding: 10, gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, borderRadius: 8, border: '1px solid #ddd', padding: 8, fontSize: 15 }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <button onClick={handleSend} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Send</button>
          <button onClick={() => alert('Calling passenger! (UI only)')} style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Call</button>
        </div>
      </div>
    </div>
  );
};

// Add RecenterButton component
const RecenterButton = ({ position }) => {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (position) map.setView(position, map.getZoom());
      }}
      style={{
        position: 'absolute',
        right: 24,
        bottom: 170,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#fff',
        color: '#2563eb',
        border: 'none',
        boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 700,
        cursor: 'pointer',
        zIndex: 1002,
        padding: 0,
      }}
      aria-label="Recenter map"
      title="Recenter map"
    >
      {/* Crosshair icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#2563eb" strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="6" stroke="#2563eb" strokeWidth="2"/><line x1="12" y1="18" x2="12" y2="22" stroke="#2563eb" strokeWidth="2"/><line x1="2" y1="12" x2="6" y2="12" stroke="#2563eb" strokeWidth="2"/><line x1="18" y1="12" x2="22" y2="12" stroke="#2563eb" strokeWidth="2"/></svg>
    </button>
  );
};

// Add a simple CSS spinner component
const Spinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  }}>
    <div style={{
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      width: 44,
      height: 44,
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Helper: Key for localStorage persistence (per trip)
function getNavPersistKey(tripId, pickup) {
  return tripId ? `navState_${tripId}` : `navState_${pickup}`;
}

// Add: DirectionBanner component for turn-by-turn instructions
const maneuverIcon = (type, modifier) => {
  // Simple icons for left/right/straight/uturn
  if (type === 'turn') {
    if (modifier === 'left') return '⬅️';
    if (modifier === 'right') return '➡️';
    if (modifier === 'sharp left') return '↙️';
    if (modifier === 'sharp right') return '↘️';
    if (modifier === 'slight left') return '↖️';
    if (modifier === 'slight right') return '↗️';
    if (modifier === 'straight') return '⬆️';
  }
  if (type === 'depart') return '🚦';
  if (type === 'arrive') return '🏁';
  if (type === 'merge') return '🔀';
  if (type === 'on ramp') return '🛣️';
  if (type === 'off ramp') return '↩️';
  if (type === 'roundabout') return '🌀';
  return '➡️'; // fallback
};
const DirectionBanner = ({ step, remainingDistance, stepsCount }) => {
  if (!step) return null;
  const icon = maneuverIcon(step.maneuver?.type, step.maneuver?.modifier);
  const instruction = step.maneuver?.instruction || step.instruction || 'Continue';
  let distStr = '';
  if (stepsCount === 1 && remainingDistance) {
    distStr = remainingDistance;
  } else if (typeof step.distance === 'number') {
    distStr = step.distance > 1000 ? (step.distance/1000).toFixed(2)+' km' : Math.round(step.distance)+' m';
  }
  return (
    <div style={{
      width: '100%',
      background: '#fff',
      color: '#222',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 17,
      fontWeight: 600,
      padding: '10px 18px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      borderBottom: '1px solid #f1f1f1',
      zIndex: 12,
      minHeight: 48,
      position: 'relative',
    }}>
      <span style={{ fontSize: 28, width: 36, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{instruction}</span>
      {distStr && (
        <span style={{ color: '#2563eb', fontWeight: 500, fontSize: 15, marginLeft: 8 }}>{distStr}</span>
      )}
    </div>
  );
};

const NavigateToPickup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Accept pickup, tripId, and optionally currentPosition from navigation state
  const { pickup = 'Chennai Central', tripId, currentPosition } = location.state || {};
  console.log('DEBUG: pickup value in NavigateToPickup:', pickup);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [routeError, setRouteError] = useState(null);
  const [locationWarning, setLocationWarning] = useState('');
  // Add this line for the modal state
  const [showPickupArrivedModal, setShowPickupArrivedModal] = useState(false);
  // Add state for geolocation error
  const [geoError, setGeoError] = useState('');

  // --- Smooth animation state ---
  const animationRef = useRef();
  const [animating, setAnimating] = useState(false);
  const animationState = useRef({
    currentIndex: 0,
    progress: 0,
  });
  // Add state for remaining distance and duration
  const [remainingDistance, setRemainingDistance] = useState('');
  const [remainingDuration, setRemainingDuration] = useState('');
  // Add state to store initial total distance in meters
  const [initialTotalDistance, setInitialTotalDistance] = useState(null);

  // Add state for route steps and current step index
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Helper: interpolate between two lat/lng points
  function interpolateLatLng(start, end, t) {
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ];
  }

  // Helper: Calculate distance between two lat/lng points (Haversine formula)
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const toRad = x => x * Math.PI / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in meters
  }
  // Helper: Calculate remaining distance along the route from current position
  function calculateRemainingDistance(currentPos, routeCoords) {
    if (!routeCoords || routeCoords.length < 2) return 0;
    // Find closest segment
    let minDist = Infinity;
    let closestIndex = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [lat1, lng1] = routeCoords[i];
      const [lat2, lng2] = routeCoords[i+1];
      // Approximate: use start of segment
      const dist = haversineDistance(currentPos[0], currentPos[1], lat1, lng1);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }
    // Sum remaining distances from closestIndex to end
    let remaining = haversineDistance(currentPos[0], currentPos[1], routeCoords[closestIndex+1][0], routeCoords[closestIndex+1][1]);
    for (let i = closestIndex+1; i < routeCoords.length - 1; i++) {
      remaining += haversineDistance(routeCoords[i][0], routeCoords[i][1], routeCoords[i+1][0], routeCoords[i+1][1]);
    }
    return remaining; // in meters
  }
  // Helper: Calculate remaining duration (estimate)
  function calculateRemainingDuration(remainingDistanceMeters, totalDistanceStr, totalDurationStr) {
    // Use original total distance and duration to estimate speed
    const totalDistance = parseFloat(totalDistanceStr);
    const totalDuration = parseFloat(totalDurationStr);
    if (!totalDistance || !totalDuration) return '';
    // totalDistanceStr is in 'xx.xx km', totalDurationStr is in 'xx min'
    const avgSpeed = totalDistance / totalDuration; // km per min
    const remainingDistanceKm = remainingDistanceMeters / 1000;
    const remainingDuration = remainingDistanceKm / avgSpeed;
    // Convert to minutes and seconds
    const min = Math.floor(remainingDuration);
    const sec = Math.round((remainingDuration - min) * 60);
    return `${min} min ${sec} sec`;
  }

  // Add separate state for initial user position (from geolocation)
  const [initialUserPosition, setInitialUserPosition] = useState(currentPosition || API_CONFIG.MAP.DEFAULT_CENTER);
  const [userPosition, setUserPosition] = useState(initialUserPosition);
  const [pickupCoords, setPickupCoords] = useState(null);

  // Resolve pickup coordinates on mount
  useEffect(() => {
    const resolvePickupCoords = async () => {
      const coords = await getLatLngForLocation(pickup);
      setPickupCoords(coords);
    };
    resolvePickupCoords();
  }, [pickup]);

  // Update geolocation effect to set both initialUserPosition and userPosition
  useEffect(() => {
    if (!currentPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setInitialUserPosition(coords);
          setUserPosition(coords); // Start marker at real position
          setGeoError('');
        },
        (err) => {
          setInitialUserPosition(API_CONFIG.MAP.DEFAULT_CENTER);
          setUserPosition(API_CONFIG.MAP.DEFAULT_CENTER);
          setGeoError('Unable to access your location. Using default location.');
        }
      );
    }
  }, [currentPosition]);

  // Only fetch route when initialUserPosition or pickup changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!initialUserPosition || !pickup) return;
      
      const start = initialUserPosition;
      const end = await getLatLngForLocation(pickup);
      let warning = '';
      if (!locationCoords[pickup]) warning += `Pickup location "${pickup}" not found.`;
      setLocationWarning(warning);
      
      setIsLoading(true);
      setRouteError(null);
      try {
        const [startLat, startLng] = start;
        const [endLat, endLng] = end;
        const coordinates = `${startLng},${startLat};${endLng},${endLat}`;
        const url = `https://us1.locationiq.com/v1/directions/driving/${coordinates}?key=${API_CONFIG.LOCATIONIQ.API_KEY}&overview=full&geometries=polyline&steps=true&alternatives=false&annotations=true`;
        const response = await axios.get(url);
        console.log('LocationIQ route response:', response.data); // Debug: log the response
        if (response.data && response.data.routes && response.data.routes[0]) {
          const route = response.data.routes[0];
          const coords = route.geometry ? require('@mapbox/polyline').decode(route.geometry).map(([lat, lng]) => [lat, lng]) : [];
          setRouteCoords(coords);
          // Robust extraction for distance and duration
          if (route.legs && route.legs.length > 0) {
            const leg = route.legs[0];
            // LocationIQ returns distance in meters, duration in seconds
            const distance =
              typeof leg.distance === 'number'
                ? (leg.distance / 1000).toFixed(2) + ' km'
                : '';
            const duration =
              typeof leg.duration === 'number'
                ? Math.round(leg.duration / 60) + ' min'
                : '';
            setDistance(distance);
            setDuration(duration);
            // Extract steps
            setRouteSteps(leg.steps || []);
            setCurrentStepIndex(0);
            // Debug: log steps
            if (leg.steps) {
              console.log('Route steps:', leg.steps.length, leg.steps.map((s, i) => ({i, dist: s.distance, instr: s.instruction, maneuver: s.maneuver})));
            }
          } else {
            setDistance('');
            setDuration('');
            setRouteSteps([]);
            setCurrentStepIndex(0);
          }
        } else {
          setRouteError('No route found');
          setRouteSteps([]);
          setCurrentStepIndex(0);
        }
      } catch (error) {
        setRouteError('Failed to fetch route');
        setRouteSteps([]);
        setCurrentStepIndex(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoute();
  }, [initialUserPosition, pickup]);

  // When route is fetched, set initial remaining distance/time and total distance
  useEffect(() => {
    if (routeCoords.length > 1 && distance && duration) {
      setRemainingDistance(distance);
      setRemainingDuration(duration);
      // Parse distance string (e.g., '11.18 km') to meters
      const distNum = parseFloat(distance);
      setInitialTotalDistance(isNaN(distNum) ? null : distNum * 1000);
    }
  }, [routeCoords, distance, duration]);

  // Track current step index as user moves (only during navigation)
  useEffect(() => {
    if (!animating || !routeSteps.length || !userPosition) return;
    // Find the first step whose maneuver location is ahead of the current position
    let foundIdx = routeSteps.length - 1;
    for (let i = 0; i < routeSteps.length; i++) {
      const step = routeSteps[i];
      if (step.maneuver && step.maneuver.location) {
        const [lng, lat] = step.maneuver.location;
        const dist = haversineDistance(userPosition[0], userPosition[1], lat, lng);
        if (dist > 30) { // 30 meters ahead
          foundIdx = i;
          break;
        }
      }
    }
    setCurrentStepIndex(foundIdx);
    // Debug: log current step index and user position
    console.log('Current step index:', foundIdx, 'User position:', userPosition, 'Step:', routeSteps[foundIdx]);
  }, [userPosition, routeSteps, animating]);

  // Start navigation animation (smooth)
  const handleStartNavigation = () => {
    if (routeCoords.length > 1) {
      setAnimating(true);
      animationState.current = { currentIndex: 0, progress: 0 };
      setUserPosition(routeCoords[0]); // Start animation from route start
      setCurrentStepIndex(0); // Reset step index on navigation start
      console.log('Navigation started.');
    }
  };

  // Smooth animation effect
  useEffect(() => {
    if (!animating || routeCoords.length < 2) return;
    let running = true;
    const speed = 0.12; // Adjust for speed (larger = faster)
    function animate() {
      if (!running) return;
      let { currentIndex, progress } = animationState.current;
      const start = routeCoords[currentIndex];
      const end = routeCoords[currentIndex + 1];
      if (!start || !end) {
        // Arrived at end
        setAnimating(false);
        const resolvePickupCoords = async () => {
          const coords = await getLatLngForLocation(pickup);
          setUserPosition(coords);
        };
        resolvePickupCoords();
        setShowPickupArrivedModal(true);
        // On arrival, set remaining distance/time to zero
        setRemainingDistance('0.00 km');
        setRemainingDuration('0 min 0 sec');
        clearNavPersist();
        console.log('Arrived at pickup.');
        return;
      }
      // Interpolate position
      const newPos = interpolateLatLng(start, end, progress);
      setUserPosition(newPos);
      // Live update remaining distance/time
      const remDist = calculateRemainingDistance(newPos, routeCoords);
      setRemainingDistance((remDist/1000).toFixed(2) + ' km');
      setRemainingDuration(calculateRemainingDuration(remDist, distance, duration));
      // Check if reached pickup (within ~20 meters)
      const checkPickupDistance = async () => {
        const pickupCoords = await getLatLngForLocation(pickup);
        const dist = Math.sqrt((newPos[0] - pickupCoords[0]) ** 2 + (newPos[1] - pickupCoords[1]) ** 2);
        if (dist < 0.0002) {
          setShowPickupArrivedModal(true);
          setAnimating(false);
          setUserPosition(pickupCoords);
          setRemainingDistance('0.00 km');
          setRemainingDuration('0 min 0 sec');
          clearNavPersist();
          console.log('Arrived at pickup (distance check).');
          return;
        }
      };
      checkPickupDistance();
      // Advance progress
      let nextProgress = progress + speed;
      if (nextProgress >= 1) {
        // Move to next segment
        animationState.current = { currentIndex: currentIndex + 1, progress: 0 };
      } else {
        animationState.current.progress = nextProgress;
      }
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating, routeCoords, pickup]);

  // On animation state/userPosition change, persist to localStorage if animating
  useEffect(() => {
    if (animating && (tripId || pickup) && routeCoords.length > 1) {
      const navState = {
        animationState: animationState.current,
        userPosition,
      };
      localStorage.setItem(getNavPersistKey(tripId, pickup), JSON.stringify(navState));
    }
  }, [animating, userPosition, tripId, pickup, routeCoords.length]);
  // On mount, if a saved state exists for this trip, resume from that state
  useEffect(() => {
    if ((tripId || pickup) && routeCoords.length > 1) {
      const saved = localStorage.getItem(getNavPersistKey(tripId, pickup));
      if (saved) {
        try {
          const navState = JSON.parse(saved);
          if (navState && navState.animationState && navState.userPosition) {
            animationState.current = navState.animationState;
            setUserPosition(navState.userPosition);
            setAnimating(true);
          }
        } catch {}
      }
    }
    // eslint-disable-next-line
  }, [tripId, pickup, routeCoords.length]);
  // Clear saved state when navigation is cancelled or completed
  function clearNavPersist() {
    if (tripId || pickup) localStorage.removeItem(getNavPersistKey(tripId, pickup));
  }

  // Improved back navigation handler
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/active-trip');
    }
  };

  // In NavigateToPickup, add floating Chat/Call button at bottom left and show ChatCallModal when open
  const [showChat, setShowChat] = useState(false);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(to bottom, #4285F4 0px, #4285F4 60px, #f5f5f5 60px, #f5f5f5 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      {/* Top location bar - always at the top */}
      <div className="flex flex-col gap-0 bg-blue-600 z-20 relative min-h-[40px] rounded-b-[14px] shadow-md px-2 pt-[calc(env(safe-area-inset-top,0px)+4px)] pb-1.5">
        <div className="flex items-center gap-2 w-full mb-0">
          <button
            onClick={handleBack}
            className="bg-none border-none p-0 m-0 cursor-pointer w-8 h-8 flex items-center justify-center flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 19L8.5 12L15.5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-col gap-0 flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <circle cx="12" cy="12" r="8" fill="#2563eb" />
                <circle cx="12" cy="12" r="4" fill="#fff" />
              </svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">
                Your location
              </div>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#22c55e"/>
                <circle cx="12" cy="9" r="2.5" fill="#fff"/>
              </svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">
                {pickup}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* START button - always visible above info bar */}
      <button
        onClick={handleStartNavigation}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 90,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#4285F4',
          border: 'none',
          boxShadow: '0 4px 16px rgba(66,133,244,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="Start navigation"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 22L12 19L9 22L12 2Z" fill="#fff"/></svg>
      </button>
      {/* In NavigateToPickup, add Cancel Navigation button when animating */}
      {animating && (
        <button
          onClick={() => {
            setAnimating(false);
            // Reset user position to initialUserPosition if available
            if (initialUserPosition) setUserPosition(initialUserPosition);
            clearNavPersist();
          }}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 160,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#e53935',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(229,57,53,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 101,
            padding: 0,
          }}
          aria-label="Cancel navigation"
          title="Cancel navigation"
        >
          {/* X icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#e53935"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </button>
      )}
      {/* Top search bar mimic */}
      {/* Direction banner under top bar */}
      {animating && <DirectionBanner step={routeSteps[currentStepIndex]} remainingDistance={remainingDistance} stepsCount={routeSteps.length} />}
      {/* Map */}
      <div style={{
        flex: '1 1 0',
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        zIndex: 1
      }}>
        {geoError && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            background: '#fffbe6',
            color: '#b91c1c',
            padding: 8,
            textAlign: 'center',
            fontSize: 14,
            zIndex: 2001,
            borderBottom: '1px solid #fde68a',
          }}>
            {geoError}
          </div>
        )}
        {(isLoading || !userPosition) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.65)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Spinner />
          </div>
        )}
        {locationWarning && (
          <div style={{ color: 'red', background: '#fffbe6', padding: 8, textAlign: 'center', fontSize: 13 }}>
            {locationWarning}
          </div>
        )}
        <MapContainer center={userPosition} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          {/* Only fit bounds on initial load, before navigation starts */}
          {!animating && routeCoords.length > 1 && <InitialFitRouteBounds routeCoords={routeCoords} />}
          {/* Auto-follow driver marker only during navigation */}
          {animating && <MapAutoFollow position={userPosition} follow={true} />}
          <TileLayer attribution={API_CONFIG.GOOGLE_MAPS.ATTRIBUTION} url={API_CONFIG.GOOGLE_MAPS.TILE_LAYER} tileSize={256} />
          {userPosition && Array.isArray(userPosition) && <Marker position={userPosition} icon={iconPilot} />}
          {pickupCoords && Array.isArray(pickupCoords) && <Marker position={pickupCoords} icon={iconPickup} />}
          {routeCoords.length > 0 && (
            <>
              {/* Shadow layer for depth */}
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: "#000",
                  weight: 9, // thinner shadow
                  opacity: 0.15,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* White border */}
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: "#fff",
                  weight: 6, // thinner border
                  opacity: 1,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Main vibrant blue line */}
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: "#2563eb", // Tailwind blue-600
                  weight: 3.5, // thinner main line
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}
          {/* Floating Chat/Call Button */}
          <button
            onClick={() => setShowChat(true)}
            style={{
              position: 'absolute',
              left: 24,
              bottom: 24,
              zIndex: 1001,
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(37,99,235,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            aria-label="Chat/Call"
          >
            💬
          </button>
          <ChatCallModal open={showChat} onClose={() => setShowChat(false)} />
          <RecenterButton position={userPosition} />
        </MapContainer>
      </div>
      {/* Popup/modal when reached pickup point */}
      {showPickupArrivedModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 18, minWidth: 220, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>You have reached the pickup point!</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  setShowPickupArrivedModal(false);
                  navigate('/head-to-pickup', { state: { pickup, tripId, picked: true } });
                }}
                style={{
                  background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 6
                }}
              >
                Customer Picked
              </button>
              <button
                onClick={() => {
                  setShowPickupArrivedModal(false);
                  navigate('/riding-to-destination');
                }}
                style={{
                  background: '#4285F4', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer'
                }}
              >
                Start Ride
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Info bar */}
      <div
        className="flex flex-row items-center justify-between min-h-[56px] h-[56px] z-10 min-w-0 gap-4 bg-white/95 rounded-t-[18px] shadow-lg backdrop-blur-md px-4 text-[15px] text-gray-800"
      >
        <div className="flex flex-col items-start gap-0 flex-1">
          <div className="flex flex-row items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span role="img" aria-label="distance">🛣️</span>
              <span className="font-bold text-[17px]">{remainingDistance}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span role="img" aria-label="duration">⏱️</span>
              <span className="font-bold text-[17px]">{remainingDuration}</span>
            </span>
          </div>
          {routeError && (
            <span className="text-red-600 text-[13px] mt-0.5">{routeError}</span>
          )}
        </div>
        <div className="ml-auto flex items-center">
          <PilotSOSButton />
        </div>
      </div>
      {/* Progress bar below info bar */}
      {initialTotalDistance && remainingDistance && (
        <div className="w-full h-1.5 bg-gray-200 rounded-b-lg overflow-hidden mb-0.5">
          <div
            className="h-full transition-all duration-400 ease-[cubic-bezier(.4,2,.6,1)]"
            style={{
              background: 'linear-gradient(90deg, #22c55e 0%, #2563eb 100%)',
              width: `${
                Math.max(
                  0,
                  100 - Math.round((parseFloat(remainingDistance) * 1000 / initialTotalDistance) * 100)
                )
              }%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NavigateToPickup;  