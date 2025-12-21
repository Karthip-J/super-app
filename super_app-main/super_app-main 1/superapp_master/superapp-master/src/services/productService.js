import API_CONFIG from '../config/api.config.js';

const getHeaders = () => {
  const token = localStorage.getItem('token') || 'demo-token';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const fetchAllProducts = async () => {
  try {
    const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch products' };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, message: error.message };
  }
};

export const fetchProductsByCategory = async (categorySlug) => {
  try {
            const res = await fetch(API_CONFIG.getUrl(`/api/products/category/name/${categorySlug}`), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch products' };
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { success: false, message: error.message };
  }
};

// ========== NEW SUBCATEGORY FUNCTIONS ==========

// Fetch parent categories only (for home page)
export const fetchParentCategories = async () => {
  try {
    const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PARENT_CATEGORIES), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, data: data.data || data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch parent categories' };
    }
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    return { success: false, message: error.message };
  }
};

// Fetch child categories by parent ID (for category pages)
export const fetchChildCategories = async (parentId) => {
  try {
            const res = await fetch(API_CONFIG.getUrl(`/api/categories/parent/${parentId}/children`), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, data: data.data || data, parent: data.parent };
    } else {
      return { success: false, message: data.message || 'Failed to fetch subcategories' };
    }
  } catch (error) {
    console.error('Error fetching child categories:', error);
    return { success: false, message: error.message };
  }
};

// Fetch products by subcategory ID (for subcategory product pages)
export const fetchProductsBySubcategory = async (subcategoryId) => {
  try {
            const res = await fetch(API_CONFIG.getUrl(`/api/products/subcategory/${subcategoryId}`), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { 
        success: true, 
        data: data.data || data, 
        subcategory: data.subcategory,
        count: data.count 
      };
    } else {
      return { success: false, message: data.message || 'Failed to fetch products by subcategory' };
    }
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return { success: false, message: error.message };
  }
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CATEGORIES), { 
      headers: getHeaders(), 
      credentials: 'include' 
    });
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch categories' };
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, message: error.message };
  }
};

// Transform product data for frontend display
export const transformProductForFrontend = (product) => {
  // Helper function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return API_CONFIG.getUrl(imagePath);
    return API_CONFIG.getUploadUrl(imagePath);
  };

  return {
    id: product._id || product.id,
    name: product.name || 'Product',
    description: product.description || '',
    price: product.price || 0,
    sale_price: product.sale_price || null,
    image: getImageUrl(product.photo || product.featured_image || product.image),
    photo: getImageUrl(product.photo), // Keep original photo field for compatibility
    category: product.category_id?.name || product.category || null,
    subcategory: product.sub_category_id?.name || product.sub_category || null,
    brand: product.brand_id?.name || product.brand || null,
    stock: product.stock || 0,
    sku: product.sku || '',
    slug: product.slug || '',
    status: product.status !== undefined ? product.status : true,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    isNew: product.isNew || false,
    isBestSeller: product.is_best_seller || false,
    originalPrice: product.price,
    discountedPrice: product.sale_price || product.price,
    sizes: product.sizes || ['S', 'M', 'L', 'XL'], // Default sizes for demo
    // Additional fields for compatibility
    _id: product._id || product.id
  };
};

// Filter products by keywords (client-side filtering)
export const filterProductsByKeywords = (products, keywords) => {
  if (!keywords || keywords.length === 0) return products;
  
  return products.filter(product => {
    const searchableText = `${product.name} ${product.description}`.toLowerCase();
    return keywords.some(keyword => 
      searchableText.includes(keyword.toLowerCase())
    );
  });
};