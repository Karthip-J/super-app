import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Function to convert remote URLs to local API endpoints (no hardcoded /api/)
export const convertToLocalEndpoint = (remoteUrl) => {
  // Extract the API path from the remote URL
  const apiPath = remoteUrl.split('/api/')[1];
  if (!apiPath) {
    console.error('Invalid API URL:', remoteUrl);
    return remoteUrl;
  }
  // Just append the path to BASE_URL (no /api/ prefix)
  return `${API_CONFIG.BASE_URL}/${apiPath}`;
};

// Function to get the API base URL
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

// Function to get the full API URL for a given endpoint (no /api/ prefix)
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

// Function to get headers with auth token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// Function to get multipart form headers with auth token
export const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'multipart/form-data'
    }
  };
};

// Generic API call functions
export const apiGet = async (endpoint) => {
  try {
    const response = await axios.get(getApiUrl(endpoint), getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPost = async (endpoint, data, isMultipart = false) => {
  try {
    const headers = isMultipart ? getMultipartHeaders() : getAuthHeaders();
    const response = await axios.post(getApiUrl(endpoint), data, headers);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPut = async (endpoint, data, isMultipart = false) => {
  try {
    const headers = isMultipart ? getMultipartHeaders() : getAuthHeaders();
    const response = await axios.put(getApiUrl(endpoint), data, headers);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await axios.delete(getApiUrl(endpoint), getAuthHeaders());
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Error handling function
export const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request error:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
}; 