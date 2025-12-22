import React, { useState, useEffect } from 'react';
import { validateAPIKey, API_CONFIG } from '../config/api.js';

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState(null);

  const testAPIKey = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const isValidKey = await validateAPIKey();
      setIsValid(isValidKey);
      
      if (!isValidKey) {
        setError('API key validation failed. Please check your LocationIQ API key.');
      }
    } catch (err) {
      setIsValid(false);
      setError(`Validation error: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testAPIKey();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'white',
      borderRadius: 8,
      padding: 12,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontSize: 12,
      minWidth: 200
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
        API Key Status
      </div>
      
      {isValidating ? (
        <div style={{ color: '#FF9800' }}>🔄 Testing...</div>
      ) : isValid === true ? (
        <div style={{ color: '#4CAF50' }}>✅ API Key Valid</div>
      ) : isValid === false ? (
        <div style={{ color: '#f44336' }}>❌ API Key Invalid</div>
      ) : (
        <div style={{ color: '#666' }}>⏳ Not tested</div>
      )}
      
      {error && (
        <div style={{ 
          color: '#f44336', 
          fontSize: 10, 
          marginTop: 4,
          wordBreak: 'break-word'
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={testAPIKey}
        disabled={isValidating}
        style={{
          marginTop: 8,
          background: '#0074D9',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: 10,
          cursor: isValidating ? 'not-allowed' : 'pointer',
          opacity: isValidating ? 0.6 : 1
        }}
      >
        {isValidating ? 'Testing...' : 'Test Again'}
      </button>
      
      <div style={{ 
        fontSize: 10, 
        color: '#666', 
        marginTop: 4,
        wordBreak: 'break-all'
      }}>
        Key: {API_CONFIG.LOCATIONIQ.API_KEY.substring(0, 10)}...
      </div>
    </div>
  );
};

export default APIKeyValidator; 