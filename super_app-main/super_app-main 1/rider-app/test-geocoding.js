// Simple test to verify geocoding functionality
import { buildLocationIQUrl } from './src/config/api.js';

// Test the buildLocationIQUrl function
const testUrl = buildLocationIQUrl('/search.php', {
  q: 'Vikram, OMR',
  format: 'json',
  limit: 1
});

console.log('Test URL:', testUrl);

// Test with axios (if available)
import axios from 'axios';

async function testGeocoding() {
  try {
    const response = await axios.get(testUrl);
    console.log('Geocoding response:', response.data);
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
}

testGeocoding(); 