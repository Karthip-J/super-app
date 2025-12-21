import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight } from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';

// Import our food delivery service
import { 
  restaurantService, 
  formatImageUrl 
} from '../../services/foodDeliveryService';

// Category Item Component
const CategoryItem = ({ category, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onClick(category)}
    >
      <div className="relative h-40">
        {category.image ? (
          <img
            src={formatImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="hidden w-full h-full bg-gray-200 items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-gray-500 text-sm font-medium">{category.name}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg">{category.name}</h3>
          {category.description && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{category.description}</p>
          )}
        </div>
        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={16} className="text-white" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {category.restaurant_count || 0} restaurants
          </span>
          <span className="text-orange-600 text-sm font-medium">
            Explore →
          </span>
        </div>
      </div>
    </div>
  );
};

function CategoriesFood() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('🏷️ Fetching restaurant categories...');

        const response = await restaurantService.getRestaurantCategories();
        
        if (response.success) {
          setCategories(response.data);
          setFilteredCategories(response.data);
          console.log('✅ Categories loaded:', response.data.length);
        } else {
          console.error('❌ Failed to load categories:', response.message);
          setError(response.message);
        }
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  // Handle category click
  const handleCategoryClick = (category) => {
    console.log('🔍 Navigating to category:', category.name);
    navigate(`/home-food/restaurent-list-based-on-category/${encodeURIComponent(category.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading food categories...</p>
          </div>
        </div>
        <FooterFood />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading categories: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
        <FooterFood />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderF />
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Food Categories</h1>
                <p className="text-gray-600 mt-1">
                  Discover restaurants by cuisine type
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Categories Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <Filter size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {searchQuery ? 'No categories found' : 'No categories available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `Try searching for a different cuisine type`
                    : 'We\'re working on adding more food categories for you'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Popular Categories Section (if no search) */}
          {!searchQuery && categories.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Popular This Week</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <div
                    key={`popular-${category._id}`}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow text-center"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden">
                      {category.image ? (
                        <img
                          src={formatImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">{category.name.charAt(0)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {category.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/home-food')}
                className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🏠</span>
                <span>Back to Home</span>
              </button>
              <button
                onClick={() => navigate('/home-food/restaurant-details')}
                className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🍽️</span>
                <span>All Restaurants</span>
              </button>
              <button
                onClick={() => navigate('/home-food/cart')}
                className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>🛒</span>
                <span>View Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <FooterFood />
    </div>
  );
}

export default CategoriesFood;