import React from 'react';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const boxStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '90vw',
  width: '350px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
  textAlign: 'center',
};

export default function LocationPrompt({ onAllow, onDeny }) {
  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h2 style={{marginBottom: '1rem'}}>Allow Location Access</h2>
        <p style={{marginBottom: '1.5rem'}}>
          We use your location to show you relevant products, services, and offers near you. Please allow location access for the best experience.<br/><br/>
          <b>Tip:</b> On mobile, you can choose <i>"Only while using the app"</i> in the next step for more privacy.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={onDeny}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#eee', color: '#333', fontWeight: 600 }}
          >
            Deny
          </button>
          <button
            onClick={onAllow}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#5C3FFF', color: 'white', fontWeight: 600 }}
          >
            Allow
          </button>
          <button
            onClick={onAllow}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#6C63FF', color: 'white', fontWeight: 600 }}
          >
            Only while using the app
          </button>
        </div>
      </div>
    </div>
  );
} 