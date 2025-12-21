import API_CONFIG from '../config/api.config.js';

class AddressService {
  // Get all addresses for the current user
  static async getUserAddresses() {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        headers: API_CONFIG.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        // Fallback to localStorage if backend fails
        const storedAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
        return storedAddresses;
      }
    } catch (error) {
      console.error('Error fetching addresses from backend:', error);
      // Fallback to localStorage
      const storedAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      return storedAddresses;
    }
  }

  // Save a new address
  static async saveAddress(addressData) {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        // Fallback to localStorage if backend fails
        const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
        const updatedAddresses = [...existingAddresses, addressData];
        localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        return addressData;
      }
    } catch (error) {
      console.error('Error saving address to backend:', error);
      // Fallback to localStorage
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      const updatedAddresses = [...existingAddresses, addressData];
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      return addressData;
    }
  }

  // Update an existing address
  static async updateAddress(addressId, addressData) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.SAVED_ADDRESSES}/${addressId}`), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        // Fallback to localStorage if backend fails
        const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
        const updatedAddresses = existingAddresses.map((addr, index) => 
          index === addressId ? addressData : addr
        );
        localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        return addressData;
      }
    } catch (error) {
      console.error('Error updating address in backend:', error);
      // Fallback to localStorage
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      const updatedAddresses = existingAddresses.map((addr, index) => 
        index === addressId ? addressData : addr
      );
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      return addressData;
    }
  }

  // Delete an address
  static async deleteAddress(addressId) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.SAVED_ADDRESSES}/${addressId}`), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders()
      });

      if (response.ok) {
        return true;
      } else {
        // Fallback to localStorage if backend fails
        const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
        const updatedAddresses = existingAddresses.filter((_, index) => index !== addressId);
        localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
        return true;
      }
    } catch (error) {
      console.error('Error deleting address from backend:', error);
      // Fallback to localStorage
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      const updatedAddresses = existingAddresses.filter((_, index) => index !== addressId);
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
      return true;
    }
  }

  // Get current location using browser geolocation
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use Google Maps Geocoding API to get address from coordinates
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const address = data.results[0];
                resolve({
                  latitude,
                  longitude,
                  formattedAddress: address.formatted_address,
                  addressComponents: address.address_components
                });
              } else {
                reject(new Error('No address found for this location'));
              }
            } else {
              reject(new Error('Failed to geocode location'));
            }
          } catch (error) {
            reject(new Error('Failed to get address from coordinates'));
          }
        },
        (error) => {
          reject(new Error('Failed to get current location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // Search for places using Google Places API
  static async searchPlaces(query) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      } else {
        throw new Error('Failed to search places');
      }
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Format address for display
  static formatAddress(address) {
    if (!address) return '';
    
    const parts = [];
    if (address.fullName) parts.push(address.fullName);
    if (address.houseNo) parts.push(address.houseNo);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.roadName) parts.push(address.roadName);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    
    return parts.join(', ');
  }

  // Format full address with all details
  static formatFullAddress(address) {
    if (!address) return '';
    
    const parts = [];

    // Name and Contact
    if (address.fullName) parts.push(`Name: ${address.fullName}`);
    if (address.phoneNumber) parts.push(`Phone: ${address.phoneNumber}`);
    if (address.altPhoneNumber) parts.push(`Alt Phone: ${address.altPhoneNumber}`);

    // Address lines
    const addressLines = [];
    if (address.houseNo) addressLines.push(address.houseNo);
    if (address.addressLine2) addressLines.push(address.addressLine2);
    if (address.roadName) addressLines.push(address.roadName);
    if (address.landmark) addressLines.push(`Near ${address.landmark}`);
    if (addressLines.length > 0) parts.push(`Address: ${addressLines.join(', ')}`);

    // Location
    const locationParts = [];
    if (address.city) locationParts.push(address.city);
    if (address.state) locationParts.push(address.state);
    if (address.pincode) locationParts.push(address.pincode);
    if (address.country) locationParts.push(address.country);
    if (locationParts.length > 0) parts.push(locationParts.join(', '));

    // Additional info
    if (address.companyName) parts.push(`Company: ${address.companyName}`);
    if (address.deliveryInstructions) parts.push(`Instructions: ${address.deliveryInstructions}`);

    return parts.join('\n');
  }
}

export default AddressService;
