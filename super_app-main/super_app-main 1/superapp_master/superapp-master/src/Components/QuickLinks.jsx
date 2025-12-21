import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quickLinkService from '../services/quickLinkService';

const QuickLinks = () => {
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      setLoading(true);
      const response = await quickLinkService.getQuickLinksWithFallback();
      
      if (response.success && response.data) {
        setQuickLinks(response.data);
      } else {
        setQuickLinks([]);
      }
    } catch (err) {
      console.error('Error fetching quick links:', err);
      setError('Failed to load quick links');
      setQuickLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLinkClick = (quickLink) => {
    // Navigate to the specific product page
    navigate(`/product/${quickLink.product_id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!quickLinks || quickLinks.length === 0) {
    return null; // Don't show anything if no quick links
  }

  return (
    <div className="bg-white py-4 px-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {quickLinks.map((quickLink) => (
          <div
            key={quickLink.id}
            onClick={() => handleQuickLinkClick(quickLink)}
            className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group"
          >
            {/* Circular Product Image */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors duration-200">
                <img
                  src={quickLink.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNUMzRkZGIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+Cjwvc3ZnPgo='}
                  alt={quickLink.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjNUMzRkZGIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
              
              {/* Price Badge */}
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                ₹{quickLink.price || 0}
              </div>
            </div>
            
            {/* Product Name */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {quickLink.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
