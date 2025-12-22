import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { API_CONFIG, buildLocationIQUrl } from '../config/api.js';
import { getLatLngForLocation, defaultPosition } from '../components/Map.jsx';
import deliveryService from '../services/deliveries.jsx';

const iconPickup = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const iconUser = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
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

function speakInstruction(text) {
  if ('speechSynthesis' in window && text) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
}

const DeliveryPickupNavigationMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pickup = location.state?.pickup;
  const [pickupCoords, setPickupCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null); // real user location
  const [animatedCoords, setAnimatedCoords] = useState(null); // for animation
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [geoError, setGeoError] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [navigating, setNavigating] = useState(false);
  const [showArrived, setShowArrived] = useState(false);
  const navIndex = useRef(0);
  const navIntervalRef = useRef(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  // Get OTP from location state, fallback to '1234' for demo
  const correctOtp = location.state?.otp || '1234';

  // Reset OTP state when component mounts
  useEffect(() => {
    setOtp('');
    setOtpError('');
    setOtpVerified(false);
    setShowOtpSuccess(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function resolveCoords() {
      if (!pickup) return;
      const pickupResult = await getLatLngForLocation(pickup);
      if (isMounted && Array.isArray(pickupResult) && pickupResult !== defaultPosition) {
        setPickupCoords(pickupResult);
      }
    }
    resolveCoords();
    return () => { isMounted = false; };
  }, [pickup]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
        () => setGeoError('Unable to access your location')
      );
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
        () => setGeoError('Unable to track your location'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGeoError('Geolocation not supported');
    }
  }, []);

  // Initialize animatedCoords when userCoords or pickupCoords become available
  useEffect(() => {
    if (userCoords && !animatedCoords) {
      setAnimatedCoords(userCoords);
    } else if (pickupCoords && !animatedCoords && !userCoords) {
      setAnimatedCoords(pickupCoords);
    }
  }, [userCoords, pickupCoords, animatedCoords]);

  // Only fetch route when real userCoords or pickupCoords changes
  useEffect(() => {
    async function fetchRoute() {
      if (!userCoords || !pickupCoords) return;
      const url = buildLocationIQUrl(`/directions/driving/${userCoords[1]},${userCoords[0]};${pickupCoords[1]},${pickupCoords[0]}`, {
        overview: 'full',
        geometries: 'geojson',
        steps: 'true',
      });
      try {
        const res = await axios.get(url);
        const coords = res.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(coords);
        // Set distance and duration
        const route = res.data.routes[0];
        setDistance((route.distance / 1000).toFixed(2));
        setDuration(Math.round(route.duration / 60));
        setRouteSteps(route.legs[0]?.steps || []);
        setCurrentStepIndex(0);
        setAnimatedCoords([userCoords[0], userCoords[1]]); // reset animated marker to real user location
      } catch {
        setRouteCoords([]);
        setDistance('');
        setDuration('');
        setRouteSteps([]);
        setCurrentStepIndex(0);
      }
    }
    fetchRoute();
    // eslint-disable-next-line
  }, [userCoords, pickupCoords]);

  // Navigation animation: only update animatedCoords, not userCoords
  useEffect(() => {
    if (navigating && routeCoords.length > 1) {
      navIntervalRef.current = setInterval(() => {
        navIndex.current = Math.min(navIndex.current + 1, routeCoords.length - 1);
        setAnimatedCoords(routeCoords[navIndex.current]);
        // Step index update for turn-by-turn
        if (routeSteps.length > 0) {
          let closestStep = 0;
          let minDist = Infinity;
          for (let i = 0; i < routeSteps.length; i++) {
            const step = routeSteps[i];
            if (step.geometry && step.geometry.coordinates && step.geometry.coordinates.length > 0) {
              for (const [lng, lat] of step.geometry.coordinates) {
                const d = Math.abs(routeCoords[navIndex.current][0] - lat) + Math.abs(routeCoords[navIndex.current][1] - lng);
                if (d < minDist) {
                  minDist = d;
                  closestStep = i;
                }
              }
            }
          }
          setCurrentStepIndex(closestStep);
        }
        // Arrival
        if (navIndex.current >= routeCoords.length - 1) {
          setNavigating(false);
          setShowArrived(true);
          clearInterval(navIntervalRef.current);
        }
      }, 100);
    }
    return () => clearInterval(navIntervalRef.current);
  }, [navigating, routeCoords, routeSteps]);

  // Voice guidance: speak instruction when current step changes during navigation
  useEffect(() => {
    if (navigating && routeSteps[currentStepIndex]) {
      const step = routeSteps[currentStepIndex];
      const instruction = step.maneuver?.instruction || step.instruction;
      speakInstruction(instruction);
    }
    // eslint-disable-next-line
  }, [currentStepIndex, navigating]);

  // Helper to calculate remaining distance and time
  function getRemainingStats() {
    if (!routeCoords || routeCoords.length < 2 || navIndex.current >= routeCoords.length - 1) {
      return { remDistance: distance, remDuration: duration };
    }
    let remDist = 0;
    for (let i = navIndex.current; i < routeCoords.length - 1; i++) {
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
    return { remDistance: remDist.toFixed(2), remDuration: remDuration };
  }

  // --- UI ---
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
      {/* Top search bar mimic */}
      <div className="flex flex-col gap-0 bg-yellow-600 z-10 relative min-h-[40px] rounded-b-[14px] shadow-md px-2 pt-[calc(env(safe-area-inset-top,0px)+4px)] pb-1.5">
        <div className="flex items-center gap-2 mb-0 w-full">
          {/* Back arrow */}
          <button
            onClick={() => navigate(-1)}
            className="bg-none border-none p-0 m-0 cursor-pointer w-8 h-8 flex items-center justify-center flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 19L8.5 12L15.5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" fill="#fff"/></svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">Your Location</div>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fff"/></svg>
              <div className="bg-white/25 text-white rounded-[12px] px-2 py-1 font-medium text-[13px] flex-1 min-w-0 overflow-hidden text-ellipsis h-[26px] whitespace-nowrap">{pickup}</div>
            </div>
          </div>
          {/* Menu (three dots) */}
          <button className="bg-none border-none p-0 m-0 w-8 h-8 flex items-center justify-center flex-shrink-0" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="2" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#fff"/><circle cx="19" cy="12" r="2" fill="#fff"/></svg>
          </button>
        </div>
      </div>
      {/* Turn-by-turn direction banner */}
      {navigating && routeSteps.length > 0 && (
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
              if (type === 'turn') {
                if (modifier === 'left') return 'Turn left';
                if (modifier === 'right') return 'Turn right';
                if (modifier === 'straight') return 'Go straight';
                if (modifier === 'uturn') return 'Make a U-turn';
                return 'Turn';
              }
              if (type === 'depart') return 'Start';
              if (type === 'arrive') return 'Arrive at pickup';
              if (type.includes('left')) return 'Turn left';
              if (type.includes('right')) return 'Turn right';
              if (type.includes('straight')) return 'Go straight';
              if (type.includes('uturn')) return 'Make a U-turn';
              return 'Continue';
            })()}
          </span>
          <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 15, marginLeft: 8 }}>
            {routeSteps[currentStepIndex]?.distance ? `${Math.round(routeSteps[currentStepIndex].distance)} m` : ''}
          </span>
        </div>
      )}
      {/* Map */}
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative', zIndex: 1 }}>
        {geoError && <div style={{ color: 'red', padding: 8 }}>{geoError}</div>}
        {(pickupCoords || animatedCoords) && (
          <MapContainer 
            center={animatedCoords || pickupCoords || defaultPosition} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <FitRouteBounds routeCoords={routeCoords} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {animatedCoords && <Marker position={animatedCoords} icon={iconUser} />}
            {pickupCoords && <Marker position={pickupCoords} icon={iconPickup} />}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#1976d2" weight={5} opacity={0.95} />}
          </MapContainer>
        )}
        {/* Start Navigation Button */}
        {!navigating && routeCoords.length > 1 && (
          <button
            onClick={() => { navIndex.current = 0; setNavigating(true); }}
            style={{
              position: 'fixed',
              right: 28,
              bottom: 110,
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: '#1976d2',
              color: '#fff',
              border: '4px solid #fff',
              fontSize: 20,
              fontWeight: 700,
              zIndex: 2000,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(25,118,210,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'box-shadow 0.2s',
            }}
            aria-label="Start Navigation"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 22L12 19L9 22L12 2Z" fill="#fff"/></svg>
          </button>
        )}
        {/* Cancel Navigation button - only visible when navigation is active */}
        {navigating && (
          <button
            onClick={() => {
              setNavigating(false);
              navIndex.current = 0;
              setAnimatedCoords(userCoords);
            }}
            style={{
              position: 'fixed',
              right: 28,
              bottom: 190,
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
              zIndex: 2001,
              padding: 0,
            }}
            aria-label="Cancel navigation"
            title="Cancel navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#e53935"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        )}
        {/* Floating SOS Button */}
        <button
          onClick={() => alert('SOS! Emergency call triggered.')}
          style={{
            position: 'fixed',
            left: 24,
            bottom: 110,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#e53935',
            color: '#fff',
            border: 'none',
            fontSize: 24,
            fontWeight: 700,
            zIndex: 2001,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(229,57,53,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="SOS"
        >
          SOS
        </button>
        {/* Compass/center button */}
        <button
          onClick={() => setAnimatedCoords(userCoords)}
          style={{
            position: 'fixed',
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
            zIndex: 2001,
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
        {(() => {
          const { remDistance, remDuration } = getRemainingStats();
          return <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="distance">🛣️</span> {remDistance ? `${remDistance} km` : '--'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="duration">⏱️</span> {remDuration ? `${remDuration} min` : '--'}
            </span>
            <span style={{ color: '#888', fontSize: 12, fontWeight: 400, marginLeft: 12 }}>Fastest route</span>
          </>;
        })()}
      </div>
      {/* Time calculation under bottom bar */}
      <div style={{
        position: 'fixed',
        left: 0,
        bottom: 0 - 36,
        width: '100vw',
        background: 'rgba(255,255,255,0.95)',
        color: '#1976d2',
        fontWeight: 600,
        fontSize: 16,
        textAlign: 'center',
        zIndex: 2003,
        padding: '8px 0',
        boxShadow: '0 -1px 6px rgba(25,118,210,0.08)'
      }}>
        {(() => {
          // Show current time and ETA if available
          const now = new Date();
          const eta = duration ? new Date(now.getTime() + duration * 60000) : null;
          return (
            <>
              <span>Current: {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {eta && <span style={{ marginLeft: 18 }}>ETA: {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </>
          );
        })()}
      </div>
      {/* Arrived Modal with OTP verification and professional success feedback */}
      {showArrived && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 3px 16px rgba(0,0,0,0.16)', textAlign: 'center', maxWidth: 320, minWidth: 0, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>You have arrived at the pickup location!</div>
            {!otpVerified && !showOtpSuccess ? (
              <>
                <div style={{ margin: '18px 0 8px 0', fontWeight: 500, color: '#1976d2' }}>Verify Customer OTP</div>
                <input
                  type="text"
                  value={otp}
                  onChange={e => { setOtp(e.target.value); setOtpError(''); }}
                  maxLength={6}
                  placeholder="Enter OTP"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: 18,
                    borderRadius: 7,
                    border: '1.5px solid #1976d2',
                    marginBottom: 8,
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: 2
                  }}
                  autoFocus
                />
                {otpError && <div style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>{otpError}</div>}
                <button
                  onClick={() => {
                    if (otp === correctOtp) {
                      setShowOtpSuccess(true);
                      setOtpError('');
                      setTimeout(() => {
                        setOtpVerified(true);
                        setShowOtpSuccess(false);
                      }, 1200);
                    } else {
                      setOtpError('Invalid OTP. Please try again.');
                    }
                  }}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '10px 22px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                    width: '100%'
                  }}
                >
                  Verify OTP
                </button>
              </>
            ) : showOtpSuccess ? (
              <div style={{ margin: '24px 0 12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 8, animation: 'pop 0.5s' }}>
                  <circle cx="24" cy="24" r="22" fill="#e6f9ed" stroke="#22c55e" strokeWidth="3" />
                  <path d="M16 25.5L22 31L33 19" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 18, marginBottom: 2, animation: 'fadein 0.5s' }}>Customer Verified!</div>
                <div style={{ color: '#1976d2', fontSize: 15, fontWeight: 500 }}>OTP matched successfully</div>
                <style>{`@keyframes pop { 0% { transform: scale(0.7); opacity: 0.2; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } } @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }`}</style>
              </div>
            ) : (
              <button
                onClick={() => {
                  // Ensure delivery is activated before continuing
                  const allDeliveries = deliveryService.getDeliveries();
                  const deliveryId = location.state?.id;
                  let deliveryToActivate = null;
                  
                  if (deliveryId) {
                    // Find delivery by ID first (most reliable)
                    deliveryToActivate = allDeliveries.find(d => d.id === deliveryId);
                  }
                  
                  if (!deliveryToActivate) {
                    // Fallback: find by pickup/dropoff
                    deliveryToActivate = allDeliveries.find(d => 
                      d.pickup === location.state?.pickup && d.dropoff === location.state?.dropoff
                    );
                  }
                  
                  if (deliveryToActivate && deliveryToActivate.status !== 'active') {
                    console.log('Activating delivery before continuing:', deliveryToActivate.id);
                    const result = deliveryService.startDelivery(deliveryToActivate.id);
                    console.log('Delivery activation result:', result);
                    // Dispatch event to notify other components
                    window.dispatchEvent(new Event('deliveriesDataChanged'));
                  }
                  
                  navigate('/delivery-in-progress', { 
                    state: { 
                      id: deliveryToActivate?.id,
                      pickup: location.state?.pickup,
                      dropoff: location.state?.dropoff,
                      package: location.state?.package,
                      payment: location.state?.payment,
                      customer: location.state?.customer,
                      customerPhone: location.state?.customerPhone,
                      pickupType: location.state?.pickupType,
                      dropoffType: location.state?.dropoffType,
                      otp: location.state?.otp
                    } 
                  });
                }}
                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 12, width: '100%' }}
              >
                Continue to Delivery
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPickupNavigationMap; 