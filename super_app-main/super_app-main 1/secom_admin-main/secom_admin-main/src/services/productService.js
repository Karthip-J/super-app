import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: false,
  headers: {
    ...API_CONFIG.HEADERS,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const productService = {
  // Fetch all products
  getAllProducts: async () => {
    const response = await api.get('/api/products/get_all_product');
    // Accept both array and { data: [...] } response
    const productsData = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
        ? response.data.data
        : response.data;
    return { data: productsData };
  },

  // Fetch product by ID
  getProductById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Fetch products by category ID
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/api/products/category/${categoryId}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Fetch products by category slug
  getProductsByCategorySlug: async (categorySlug) => {
    const response = await api.get(`/api/products/category/name/${categorySlug}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  }
};
