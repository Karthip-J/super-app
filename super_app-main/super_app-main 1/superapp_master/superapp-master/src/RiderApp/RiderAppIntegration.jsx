import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Rider App Integration Component
const RiderAppIntegration = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if rider-app is available and start it
    startRiderApp();
  }, []);

  const startRiderApp = async () => {
    try {
      setIsLoading(true);
      
      // Check if rider-app is running on port 3002
      const response = await fetch('http://localhost:3002', {
        method: 'GET',
        timeout: 3000
      });
      
      if (response.ok) {
        // Rider app is running, redirect to it
        window.location.href = 'http://localhost:3002';
        return;
      }
    } catch (error) {
      console.log('Rider app not running on port 3002, starting it...');
    }

    // If rider app is not running, show instructions
    setIsLoading(false);
    setError('Rider App needs to be started separately');
  };

  const handleStartRiderApp = () => {
    // Instructions for starting rider app
         alert(`
🚀 To start the Rider App:

1. Open a new terminal/command prompt
2. Navigate to the rider-app directory:
   cd rider-app
3. Install dependencies (if not already done):
   npm install
4. Start the rider app:
   npm start
5. The rider app will open on http://localhost:3002

Once the rider app is running, refresh this page to access it.
     `);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Starting Rider App...</h2>
          <p className="mt-2 text-gray-500">Please wait while we connect to the rider application</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Rider App Not Running</h3>
            <p className="mt-2 text-sm text-gray-500">
              The Rider App needs to be started separately to provide delivery and driver services.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleStartRiderApp}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🚀 Start Rider App
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ← Back to Super App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RiderAppIntegration;
