import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import deliveryService from '../services/deliveries.jsx';
import axios from 'axios';
import { API_CONFIG, buildLocationIQUrl } from '../config/api.js';
import { locationCoords, getLatLngForLocation, defaultPosition } from '../components/Map.jsx';
import DeliveryHeader from '../components/DeliveryHeader.jsx';

const iconPickup = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const iconDropoff = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: 'dropoff-marker'
});
const iconPilot = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function FitRouteBounds({ routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      map.fitBounds(routeCoords, { padding: [50, 50] });
    }
  }, [routeCoords, map]);
  return null;
}

// Helper to auto-follow the moving marker
function MapAutoFollow({ position, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (enabled && position) {
      map.setView(position, map.getZoom());
    }
  }, [position, enabled, map]);
  return null;
}

// Voice guidance: speak navigation instructions
function speakInstruction(text) {
  if ('speechSynthesis' in window && text) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.cancel(); // Stop any previous
    window.speechSynthesis.speak(utter);
  }
}

// Helper: Key for localStorage persistence (per route)
function getNavPersistKey(pickup, dropoff) {
  return `deliveryNavState_${pickup}_${dropoff}`;
}

const DeliveryNavigationMap = () => {
  const [routeSteps, setRouteSteps] = useState([]); // Array of step instructions
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Accept pickup, dropoff, and optionally currentPosition from navigation state
  let pickup = location.state?.pickup;
  let dropoff = location.state?.dropoff;
  let currentPosition = location.state?.currentPosition;
  
  // Fallback to defaults if not provided
  if (!pickup || !dropoff) {
    pickup = pickup || 'Chennai Central';
    dropoff = dropoff || 'T Nagar';
  }
  
  console.log('DEBUG: Delivery Navigation - pickup', pickup, 'dropoff', dropoff);
  
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [routeError, setRouteError] = useState(null);
  const [locationWarning, setLocationWarning] = useState('');
  const [showRouteError, setShowRouteError] = useState(true);
  const [showLocationWarning, setShowLocationWarning] = useState(true);

  // Animation state for navigation
  const [navigationActive, setNavigationActive] = useState(false);
  const [navIndex, setNavIndex] = useState(0);
  const navIntervalRef = useRef(null);

  // Helper to fetch route from A to B
  const fetchRoute = async (from, to) => {
    setIsLoading(true);
    setRouteError(null);
    try {
      const url = buildLocationIQUrl(`/directions/driving/${from[1]},${from[0]};${to[1]},${to[0]}`, {
        overview: 'full',
        geometries: 'geojson',
        steps: 'true',
      });
      const response = await axios.get(url, {
        timeout: API_CONFIG.TIMEOUTS.ROUTE_REQUEST
      });
      if (response.data && response.data.routes && response.data.routes[0]) {
        const route = response.data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(coords);
        setDistance((route.distance / 1000).toFixed(1) + ' km');
        setDuration(Math.round(route.duration / 60) + ' min');
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          setRouteSteps(route.legs[0].steps);
          setCurrentStepIndex(0);
        } else {
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

  // Remove navigation state from localStorage on cancel/complete
  const clearNavPersist = () => {
    const persistKey = getNavPersistKey(pickup, dropoff);
    localStorage.removeItem(persistKey);
  };

  // Fetch route only when both coords are valid and not defaultPosition
  useEffect(() => {
    if (
      pickupCoords && dropoffCoords &&
      Array.isArray(pickupCoords) && Array.isArray(dropoffCoords) &&
      pickupCoords !== defaultPosition && dropoffCoords !== defaultPosition
    ) {
      fetchRoute(pickupCoords, dropoffCoords);
    }
  }, [pickupCoords, dropoffCoords]);

  // Debug log for routeCoords
  useEffect(() => {
    console.log('routeCoords:', routeCoords);
  }, [routeCoords]);

  // Navigation animation effect
  useEffect(() => {
    if (navigationActive && routeCoords.length > 1) {
      navIntervalRef.current = setInterval(() => {
        setNavIndex((prev) => {
          if (prev < routeCoords.length - 1) {
            const nextPos = routeCoords[prev + 1];
            setUserPosition(nextPos);
            return prev + 1;
          } else {
            setNavigationActive(false);
            clearInterval(navIntervalRef.current);
            // Optionally show arrived modal here
            return prev;
          }
        });
      }, 100);
    }
    return () => clearInterval(navIntervalRef.current);
  }, [navigationActive, routeCoords]);

  // Start navigation handler
  const handleStartNavigation = () => {
    if (routeCoords.length > 1) {
      setNavigationActive(true);
      setNavIndex(0);
      setUserPosition(routeCoords[0]);
    }
  };

  // Animate marker along the route
  useEffect(() => {
    console.log('[DeliveryNavigationMap] Animation effect:', { navigationActive, routeCoordsLen: routeCoords.length });
    if (navigationActive && routeCoords.length > 1) {
      navIntervalRef.current = setInterval(() => {
        setNavIndex((prev) => {
          if (prev < routeCoords.length - 1) {
            const nextPos = routeCoords[prev + 1];
            setUserPosition(nextPos);
            return prev + 1;
          } else {
            setNavigationActive(false);
            clearInterval(navIntervalRef.current);
            setShowArrivedModal(true); // Show arrived modal
            return prev;
          }
        });
      }, 100); // Move every 100ms (faster)
    }
    return () => clearInterval(navIntervalRef.current);
  }, [navigationActive, routeCoords]);

  // Update currentStepIndex as user moves along the route
  useEffect(() => {
    if (!navigationActive || !routeSteps.length || !routeCoords.length) return;
    // Find the closest step to the current navIndex (userPosition)
    let closestStep = 0;
    let minDist = Infinity;
    for (let i = 0; i < routeSteps.length; i++) {
      const step = routeSteps[i];
      if (step.geometry && step.geometry.coordinates && step.geometry.coordinates.length > 0) {
        // Find the closest point in the step geometry to the current navIndex
        for (const [lng, lat] of step.geometry.coordinates) {
          const d = Math.abs(routeCoords[navIndex][0] - lat) + Math.abs(routeCoords[navIndex][1] - lng);
          if (d < minDist) {
            minDist = d;
            closestStep = i;
          }
        }
      }
    }
    setCurrentStepIndex(closestStep);
  }, [navIndex, navigationActive, routeSteps, routeCoords]);

  // Voice guidance: speak instruction when current step changes during navigation
  useEffect(() => {
    if (navigationActive && routeSteps[currentStepIndex]) {
      const step = routeSteps[currentStepIndex];
      const instruction = step.maneuver?.instruction || step.instruction;
      speakInstruction(instruction);
    }
    // eslint-disable-next-line
  }, [currentStepIndex, navigationActive]);

  // Helper to calculate remaining distance and time
  function getRemainingStats() {
    if (!routeCoords || routeCoords.length < 2 || navIndex >= routeCoords.length - 1) {
      return { remDistance: distance, remDuration: duration };
    }
    let remDist = 0;
    for (let i = navIndex; i < routeCoords.length - 1; i++) {
      const [lat1, lng1] = routeCoords[i];
      const [lat2, lng2] = routeCoords[i + 1];
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      remDist += R * c;
    }
    // Estimate remaining time based on total duration and distance
    const totalDist = parseFloat(distance);
    const totalDur = parseFloat(duration);
    const remDuration = totalDist && totalDur ? Math.round(remDist / totalDist * totalDur) : duration;
    return { remDistance: remDist.toFixed(1) + ' km', remDuration: remDuration + ' min' };
  }

  const [initialFitDone, setInitialFitDone] = useState(false);
  // Always auto-follow during navigation
  const autoFollow = navigationActive;
  const [showArrivedModal, setShowArrivedModal] = useState(false);

  // Only fit bounds on initial load
  function InitialFitRouteBounds({ routeCoords }) {
    const map = useMap();
    useEffect(() => {
      if (routeCoords && routeCoords.length > 1 && !initialFitDone) {
        map.fitBounds(routeCoords, { padding: [50, 50] });
        setInitialFitDone(true);
      }
    }, [routeCoords, map]);
    return null;
  }

  // Handler to disable auto-follow on user interaction (no-op, always enabled during navigation)
  const handleMapInteraction = () => {};

  // Helper to retry route fetch
  const retryRouteFetch = () => {
    const initializeRoute = async () => {
      const start = await getLatLngForLocation(pickup);
      const end = await getLatLngForLocation(dropoff);
      fetchRoute(start, end);
    };
    initializeRoute();
    setShowRouteError(true);
  };

  useEffect(() => {
    let isMounted = true;
    async function resolveCoords() {
      console.log('🔍 Starting coordinate resolution for:', { pickup, dropoff });
      setPickupCoords(null);
      setDropoffCoords(null);
      setUserPosition(null);
      setGeoError('');
      setIsLoading(true);
      setRouteError(null);
      try {
        const pickupResult = await getLatLngForLocation(pickup);
        const dropoffResult = await getLatLngForLocation(dropoff);
        console.log('📍 Resolved coordinates:', { pickupResult, dropoffResult });
        
        // Check if either is defaultPosition (geocoding failed)
        const isPickupValid = Array.isArray(pickupResult) && pickupResult !== defaultPosition;
        const isDropoffValid = Array.isArray(dropoffResult) && dropoffResult !== defaultPosition;
        
        console.log('✅ Coordinate validation:', { isPickupValid, isDropoffValid });
        
        if (!isPickupValid) {
          setGeoError(`Could not resolve pickup location: ${pickup}`);
        }
        if (!isDropoffValid) {
          setGeoError(`Could not resolve dropoff location: ${dropoff}`);
        }
        if (isPickupValid && isDropoffValid && isMounted) {
          setPickupCoords(pickupResult);
          setDropoffCoords(dropoffResult);
          setUserPosition(pickupResult); // Always start at pickup point
          console.log('✅ All coordinates set successfully');
        }
      } catch (e) {
        console.error('❌ Error resolving coordinates:', e);
        if (isMounted) setGeoError('Failed to resolve location coordinates');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    resolveCoords();
    return () => { isMounted = false; };
  }, [pickup, dropoff]);

  // Add debug log for map rendering condition
  useEffect(() => {
    console.log('🗺️ Map rendering condition check:', {
      pickupCoords,
      dropoffCoords,
      userPosition,
      geoError,
      shouldRender: pickupCoords && dropoffCoords && userPosition && !geoError
    });
  }, [pickupCoords, dropoffCoords, userPosition, geoError]);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(to bottom, #f59e0b 0px, #f59e0b 60px, #f5f5f5 60px, #f5f5f5 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
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
          background: '#f59e0b',
          border: 'none',
          boxShadow: '0 4px 16px rgba(245,158,11,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="Start delivery navigation"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 22L12 19L9 22L12 2Z" fill="#fff"/></svg>
      </button>
      {/* Cancel Navigation button - only visible when navigation is active */}
      {navigationActive && (
        <button
          onClick={() => {
            setNavigationActive(false);
            setNavIndex(0);
            const resetPosition = async () => {
          setUserPosition(await getLatLngForLocation(pickup));
        };
        resetPosition();
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
      <div className="flex flex-col gap-0 bg-yellow-600 z-10 relative min-h-[40px] rounded-b-[14px] shadow-md px-2 pt-[calc(env(safe-area-inset-top,0px)+4px)] pb-1.5">
        {/* Top row: back arrow, input fields, menu */}
        <div className="flex items-center gap-2 mb-0 w-full">
          {/* Back arrow */}
          <button
            onClick={() => {
              navigate('/delivery-in-progress', { 
                state: { 
                  pickup, 
                  dropoff, 
                  package: location.state?.package,
                  payment: location.state?.payment,
                  customer: location.state?.customer,
                  pickupType: location.state?.pickupType,
                  dropoffType: location.state?.dropoffType
                } 
              });
            }}
            className="bg-none border-none p-0 m-0 cursor-pointer w-8 h-8 flex items-center justify-center flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 19L8.5 12L15.5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Input fields with icons */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" fill="#fff"/></svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">{pickup}</div>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/></svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">{dropoff}</div>
            </div>
          </div>
          {/* Menu (three dots) */}
          <button className="bg-none border-none p-0 m-0 w-8 h-8 flex items-center justify-center flex-shrink-0" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="2" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#fff"/><circle cx="19" cy="12" r="2" fill="#fff"/></svg>
          </button>
        </div>
      </div>
      {/* Turn-by-turn direction banner */}
      {navigationActive && routeSteps.length > 0 && (
        <>
          <div style={{
            background: '#fff',
            color: '#222',
            fontWeight: 600,
            fontSize: 17,
            borderRadius: 10,
            margin: '8px auto 0 auto',
            padding: '10px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            maxWidth: 420,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 11,
            position: 'relative',
          }}>
            {/* Arrow icon based on maneuver type and modifier */}
            <span style={{ fontSize: 26, marginRight: 8 }}>
              {(() => {
                const step = routeSteps[currentStepIndex];
                const type = step?.maneuver?.type || step?.type || '';
                const modifier = step?.maneuver?.modifier || step?.modifier || '';
                if (type === 'turn') {
                  if (modifier === 'left') return '⬅️';
                  if (modifier === 'right') return '➡️';
                  if (modifier === 'straight') return '⬆️';
                  if (modifier === 'uturn') return '↩️';
                }
                if (type.includes('left')) return '⬅️';
                if (type.includes('right')) return '➡️';
                if (type.includes('straight')) return '⬆️';
                if (type.includes('uturn')) return '↩️';
                if (type === 'depart') return '🚦';
                if (type === 'arrive') return '🏁';
                return '⬆️';
              })()}
            </span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(() => {
                const step = routeSteps[currentStepIndex];
                const instruction = step?.maneuver?.instruction || step?.instruction;
                const type = step?.maneuver?.type || step?.type || '';
                const modifier = step?.maneuver?.modifier || step?.modifier || '';
                if (instruction) return instruction;
                // Fallback: build instruction from type/modifier
                if (type === 'turn') {
                  if (modifier === 'left') return 'Turn left';
                  if (modifier === 'right') return 'Turn right';
                  if (modifier === 'straight') return 'Go straight';
                  if (modifier === 'uturn') return 'Make a U-turn';
                  return 'Turn';
                }
                if (type === 'depart') return 'Start';
                if (type === 'arrive') return 'Arrive at destination';
                if (type.includes('left')) return 'Turn left';
                if (type.includes('right')) return 'Turn right';
                if (type.includes('straight')) return 'Go straight';
                if (type.includes('uturn')) return 'Make a U-turn';
                return 'Continue';
              })()}
            </span>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 15, marginLeft: 8 }}>
              {routeSteps[currentStepIndex]?.distance ? `${Math.round(routeSteps[currentStepIndex].distance)} m` : ''}
            </span>
          </div>
        </>
      )}
      {/* Add vertical gap between header and map */}
      <div style={{ height: 8 }} />
      {/* Map */}
      <div style={{
        flex: '1 1 0',
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Improved error/warning alerts */}
        {showLocationWarning && locationWarning && (
          <div style={{ color: '#b45309', background: '#fffbe6', padding: 10, textAlign: 'center', fontSize: 14, borderRadius: 6, margin: '8px 0', position: 'relative', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            <span>{locationWarning}</span>
            <button onClick={() => setShowLocationWarning(false)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#b45309', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} aria-label="Dismiss">×</button>
          </div>
        )}
        {showRouteError && routeError && (
          <div style={{ color: '#b91c1c', background: '#fee2e2', padding: 10, textAlign: 'center', fontSize: 14, borderRadius: 6, margin: '8px 0', position: 'relative', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            <span>{routeError} </span>
            <button onClick={retryRouteFetch} style={{ marginLeft: 8, background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Retry</button>
            <button onClick={() => setShowRouteError(false)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#b91c1c', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} aria-label="Dismiss">×</button>
          </div>
        )}
        {geoError && (
          <div style={{ color: 'red', background: '#fffbe6', padding: 10, textAlign: 'center', fontSize: 14, borderRadius: 6, margin: '8px 0', position: 'relative', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            {geoError}
          </div>
        )}
        {pickupCoords && dropoffCoords && userPosition && !geoError && (
          <MapContainer
            center={userPosition}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            whenCreated={mapInstance => {
              mapInstance.on('movestart', handleMapInteraction);
              mapInstance.on('zoomstart', handleMapInteraction);
            }}
          >
            {/* Only fit bounds on initial load */}
            {!initialFitDone && routeCoords.length > 1 && Array.isArray(routeCoords[0]) && <InitialFitRouteBounds routeCoords={routeCoords} />}
            {/* Auto-follow driver marker unless user interacts */}
            <MapAutoFollow position={userPosition} enabled={autoFollow} />
            <TileLayer attribution={API_CONFIG.GOOGLE_MAPS.ATTRIBUTION} url={API_CONFIG.GOOGLE_MAPS.TILE_LAYER} tileSize={256} />
            {userPosition && Array.isArray(userPosition) && <Marker position={userPosition} icon={iconPilot} />}
            {!navigationActive && pickupCoords && Array.isArray(pickupCoords) && <Marker position={pickupCoords} icon={iconPickup} />}
            {dropoffCoords && Array.isArray(dropoffCoords) && <Marker position={dropoffCoords} icon={iconDropoff} />}
            {routeCoords.length > 0 && routeCoords.every(coord => Array.isArray(coord)) && (
              <>
                {/* Shadow layer for depth */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: "#000",
                    weight: 9,
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
                    weight: 6,
                    opacity: 1,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                {/* Main vibrant yellow line for delivery */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: "#f59e0b",
                    weight: 3.5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                {/* Highlight current step/segment */}
                {navigationActive && routeSteps[currentStepIndex] && routeSteps[currentStepIndex].geometry && routeSteps[currentStepIndex].geometry.coordinates && (
                  <Polyline
                    positions={routeSteps[currentStepIndex].geometry.coordinates.map(([lng, lat]) => [lat, lng])}
                    pathOptions={{
                      color: "#f59e0b",
                      weight: 7,
                      opacity: 0.95,
                      lineCap: "round",
                      lineJoin: "round",
                      dashArray: '8 12',
                    }}
                  />
                )}
              </>
            )}
            {/* Recenter button inside the map, always visible */}
            <button
              onClick={() => {
                if (userPosition) setUserPosition(userPosition);
              }}
              style={{
                position: 'absolute',
                right: 24,
                bottom: 170,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fff',
                color: '#f59e0b',
                border: 'none',
                boxShadow: '0 2px 8px rgba(245,158,11,0.12)',
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#f59e0b" strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="6" stroke="#f59e0b" strokeWidth="2"/><line x1="12" y1="18" x2="12" y2="22" stroke="#f59e0b" strokeWidth="2"/><line x1="2" y1="12" x2="6" y2="12" stroke="#f59e0b" strokeWidth="2"/><line x1="18" y1="12" x2="22" y2="12" stroke="#f59e0b" strokeWidth="2"/></svg>
            </button>
          </MapContainer>
        )}
        {/* Compass/center button */}
        <button
          onClick={() => setUserPosition(userPosition)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Center map"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="2"/><circle cx="12" cy="12" r="2" fill="#888"/></svg>
        </button>
      </div>
      {/* Bottom info bar mimic */}
      <div style={{
        flex: '0 0 auto',
        background: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
        padding: '10px 10px 14px 10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100vw',
        position: 'relative',
        minHeight: 44,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Updated info bar content: bold time and distance with icons */}
          {(() => {
            const { remDistance, remDuration } = getRemainingStats();
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span role="img" aria-label="duration">⏱️</span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: '#222' }}>{isLoading ? '--' : remDuration}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span role="img" aria-label="distance">🛣️</span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: '#222' }}>{isLoading ? '--' : remDistance}</span>
                  </span>
                </div>
                <div style={{ color: '#888', fontSize: 12, fontWeight: 400, marginBottom: 2 }}>Fastest route</div>
                {routeError && <div style={{ color: 'red', marginTop: 8 }}>{routeError}</div>}
              </>
            );
          })()}
        </div>
      </div>
      {/* Arrived Modal */}
      {showArrivedModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'env(safe-area-inset-top, 12px) env(safe-area-inset-right, 12px) env(safe-area-inset-bottom, 12px) env(safe-area-inset-left, 12px)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: 18,
            boxShadow: '0 3px 16px rgba(0,0,0,0.16)',
            textAlign: 'center',
            maxWidth: 320,
            minWidth: 0,
            maxHeight: '85vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>You have arrived at your destination!</div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 18 }}>Delivery navigation is complete.</div>
            <button
              onClick={() => {
                setShowArrivedModal(false);
                clearNavPersist();

                // Find and update the delivery status to completed
                const allDeliveries = deliveryService.getDeliveries();
                const deliveryId = location.state?.id;
                let deliveryToComplete = allDeliveries.find(d => d.id === deliveryId);
                
                console.log('Completing delivery from navigation map:', deliveryId);
                console.log('Found delivery by ID:', deliveryToComplete);
                
                if (!deliveryToComplete) {
                  // fallback to old matching logic if id is not present
                  deliveryToComplete = allDeliveries.find(d => d.pickup === pickup && d.dropoff === dropoff && d.status === 'active');
                  console.log('Found delivery by pickup/dropoff:', deliveryToComplete);
                }
                
                if (deliveryToComplete) {
                  console.log('Completing delivery:', deliveryToComplete.id);
                  const result = deliveryService.completeDelivery(deliveryToComplete.id, {
                    endTime: new Date().toISOString(),
                    fare: location.state?.payment || deliveryToComplete.fare || deliveryToComplete.payment || 0
                  });
                  console.log('Completion result:', result);
                  window.dispatchEvent(new Event('deliveriesDataChanged'));
                } else {
                  console.log('No delivery found to complete');
                }

                navigate('/delivery-completed', { 
                  state: { 
                    id: deliveryToComplete?.id, // pass id
                    pickup, 
                    dropoff, 
                    package: location.state?.package,
                    payment: location.state?.payment,
                    customer: location.state?.customer,
                    pickupType: location.state?.pickupType,
                    dropoffType: location.state?.dropoffType
                  } 
                });
              }}
              style={{
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 1.5px 6px rgba(0,0,0,0.11)'
              }}
            >
              Complete Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNavigationMap; 