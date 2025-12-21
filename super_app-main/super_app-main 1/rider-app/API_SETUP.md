# API Key Setup Guide

## LocationIQ API Configuration

Your captain app uses LocationIQ API for routing directions and polyline functionality. Here's how to ensure your API key is properly configured:

### Current Configuration

The API key is currently configured in `src/config/api.js`:

```javascript
LOCATIONIQ: {
  API_KEY: 'pk.09cd52f3a48c5eb0d4b23a3e43641a0e',
  BASE_URL: 'https://us1.locationiq.com/v1',
  // ...
}
```

### ✅ API Key Status

Your current API key is **WORKING** and has been tested successfully:
- ✅ Route directions: Working
- ✅ Polyline generation: Working
- ✅ Distance calculation: Working
- ✅ Duration estimation: Working

### Features Using the API

1. **Route Directions**: When a ride request is received, the app fetches the optimal route between pickup and dropoff locations
2. **Polyline Display**: The route is displayed as a blue line on the map
3. **Distance & Time**: Calculated automatically from the API response
4. **Fallback Handling**: If the API fails, a straight line is drawn as fallback

### Testing Your API Key

The app includes a built-in API key validator that appears in the top-right corner of the map. It shows:
- 🔄 Testing... (while validating)
- ✅ API Key Valid (if working)
- ❌ API Key Invalid (if there's an issue)

### Troubleshooting

If you encounter issues:

1. **Check API Key**: Verify the key in `src/config/api.js`
2. **Network Issues**: Ensure your app has internet access
3. **Rate Limits**: LocationIQ has usage limits - check your account
4. **CORS Issues**: The API should work from browser environments

### Production Considerations

For production deployment:

1. **Environment Variables**: Move the API key to environment variables:
   ```javascript
   // In .env file
   REACT_APP_LOCATIONIQ_API_KEY=your_api_key_here
   
   // In config/api.js
   API_KEY: process.env.REACT_APP_LOCATIONIQ_API_KEY
   ```

2. **Remove Validator**: Remove the `APIKeyValidator` component from the Map component

3. **Error Handling**: The app already includes robust error handling with fallbacks

### API Usage

The app makes API calls for:
- Route calculation when ride requests are received
- Automatic retry with fallback if API fails
- Visual indicators for loading and error states

### Alternative APIs

If you need to switch APIs, you can modify the configuration in `src/config/api.js`:
- Google Maps Directions API
- Mapbox Directions API
- OpenRouteService API

### Current Implementation Features

✅ **Working Features:**
- Route fetching with timeout (10 seconds)
- Automatic fallback to straight line if API fails
- Visual loading indicators
- Error state handling
- Polyline display with different styles for success/error
- Console logging for debugging

✅ **Enhanced Error Handling:**
- Network timeout protection
- Invalid coordinate handling
- API response validation
- Graceful degradation

### Testing the Implementation

1. Start the app: `npm start`
2. Login with demo credentials
3. Go to Dashboard and click "Go Online"
4. Click "🚗 Test Ride" to generate a ride request
5. Watch for the route line to appear on the map
6. Check the API key validator in the top-right corner

The route should appear as a blue line connecting pickup and dropoff locations. If there are any issues, the line will appear as a red dashed line with an error indicator. 