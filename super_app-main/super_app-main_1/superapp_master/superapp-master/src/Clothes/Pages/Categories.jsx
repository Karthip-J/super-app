import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../Utility/Footer';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import FlipkartClothesHeader from '../Header/FlipkartClothesHeader';
import shirt from '../Images/shirt.svg';
import cosmeticImage from '../Images/cosmetic.jpg';
import homeAppliances from '../Images/homeAppliance.jpg';
import MenWear from '../Images/MenWear.jpg';
import MensBlackSuit from '../Images/MensBlackSuit.jpg';

// Default images for categories (fallback)
const defaultImages = {
  'mens-wear': MensBlackSuit,
  'womens-wear': shirt,
  'women\'s-wear': shirt,
  'cosmetics': cosmeticImage,
  'home-appliances': homeAppliances,
  'sports-equipment': MenWear, // Use MenWear as fallback for sports
  'default': shirt
};

// Default background gradients
const defaultBgs = [
  'bg-gradient-to-t from-[#47FF9A00] to-[#47FF9A]',
  'bg-gradient-to-t from-[#47FFFF00] to-[#47FFFF]',
  'bg-gradient-to-t from-[#BC47FF00] to-[#BC47FF]',
  'bg-gradient-to-t from-[#E6F24200] to-[#E6F242]',
  'bg-gradient-to-t from-[#FF4747] to-[#FF4747]',
  'bg-gradient-to-t from-[#4747FF] to-[#4747FF]'
];

// Function to get default subcategories based on parent category
const getDefaultSubcategories = (parentSlug) => {
  const subcategories = {
    'cosmetics': [
      { name: 'Lipstick', image: cosmeticImage, bg: 'bg-gradient-to-t from-[#BC47FF00] to-[#BC47FF]', route: '/categories/cosmetics/lipstick' },
      { name: 'Foundation', image: cosmeticImage, bg: 'bg-gradient-to-t from-[#47FF9A00] to-[#47FF9A]', route: '/categories/cosmetics/foundation' },
      { name: 'Eyeshadow', image: cosmeticImage, bg: 'bg-gradient-to-t from-[#47FFFF00] to-[#47FFFF]', route: '/categories/cosmetics/eyeshadow' },
      { name: 'Mascara', image: cosmeticImage, bg: 'bg-gradient-to-t from-[#E6F24200] to-[#E6F242]', route: '/categories/cosmetics/mascara' }
    ],
    'mens-wear': [
      { name: 'Shirts', image: MensBlackSuit, bg: 'bg-gradient-to-t from-[#47FF9A00] to-[#47FF9A]', route: '/categories/mens-wear/shirts' },
      { name: 'Pants', image: MensBlackSuit, bg: 'bg-gradient-to-t from-[#47FFFF00] to-[#47FFFF]', route: '/categories/mens-wear/pants' },
      { name: 'Shoes', image: MensBlackSuit, bg: 'bg-gradient-to-t from-[#BC47FF00] to-[#BC47FF]', route: '/categories/mens-wear/shoes' }
    ],
    'womens-wear': [
      { name: 'Dresses', image: shirt, bg: 'bg-gradient-to-t from-[#47FF9A00] to-[#47FF9A]', route: '/categories/womens-wear/dresses' },
      { name: 'Tops', image: shirt, bg: 'bg-gradient-to-t from-[#47FFFF00] to-[#47FFFF]', route: '/categories/womens-wear/tops' },
      { name: 'Skirts', image: shirt, bg: 'bg-gradient-to-t from-[#BC47FF00] to-[#BC47FF]', route: '/categories/womens-wear/skirts' }
    ],
    'home-appliances': [
      { name: 'Kitchen', image: homeAppliances, bg: 'bg-gradient-to-t from-[#47FF9A00] to-[#47FF9A]', route: '/categories/home-appliances/kitchen' },
      { name: 'Electronics', image: homeAppliances, bg: 'bg-gradient-to-t from-[#47FFFF00] to-[#47FFFF]', route: '/categories/home-appliances/electronics' },
      { name: 'Furniture', image: homeAppliances, bg: 'bg-gradient-to-t from-[#BC47FF00] to-[#BC47FF]', route: '/categories/home-appliances/furniture' }
    ]
  };

  return subcategories[parentSlug] || [];
};

const CategoryCard = ({ name, image, bg, badge, onClick }) => {
  return (
    <div className="relative flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className={`relative rounded-2xl ${bg} flex flex-col justify-center items-center w-[100px] h-[110px] sm:w-36`}>
        {badge && (
          <span className="absolute top-0 left-0 right-0 mx-auto text-center bg-[#00BB1C] text-[black] text-[10px] font-medium px-3 h-[18px] py-0 rounded-b-full inline-block w-max">
            {badge}
          </span>
        )}
        <img src={image} alt={name} className="w-20 h-20 object-contain" />
      </div>
      <p className="text-center text-xs font-normal mt-2 text-[#000000]">{name}</p>
    </div>
  );
};

function Categories() {
  const navigate = useNavigate();
  const { categorySlug } = useParams(); // Get parent category from URL
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchSubcategories = async () => {
      try {
        setLoading(true);

        console.log('🔍 Categories.jsx: categorySlug from URL:', categorySlug);

        // Get authentication token
        const token = localStorage.getItem('token') || 'demo-token';

        // First, find the parent category by slug
        const parentsResponse = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PARENT_CATEGORIES), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!parentsResponse.ok) {
          throw new Error(`HTTP error! status: ${parentsResponse.status}`);
        }

        const parentsData = await parentsResponse.json();
        const parentCategories = parentsData.data || parentsData;

        console.log('📊 Categories.jsx: Available parent categories:', parentCategories.map(cat => cat.slug));
        console.log('🔍 Categories.jsx: Looking for slug:', categorySlug);

        // Find the parent category that matches the slug
        const parentCategory = parentCategories.find(cat => cat.slug === categorySlug);

        console.log('📂 Categories.jsx: Found parent category:', parentCategory);

        if (!parentCategory) {
          throw new Error(`Parent category with slug "${categorySlug}" not found`);
        }

        setParentCategory(parentCategory);

        console.log('🔍 Categories.jsx: Fetching subcategories for parent ID:', parentCategory.id);
        console.log('🔍 Categories.jsx: parentCategory object:', parentCategory);
        console.log('🔍 Categories.jsx: parentCategory.id type:', typeof parentCategory.id);

        // Now fetch subcategories for this parent
        const subcategoriesUrl = API_CONFIG.getUrl(`/api/categories/parent/${parentCategory.id}/children`);
        console.log('🔍 Categories.jsx: Subcategories URL:', subcategoriesUrl);

        const subcategoriesResponse = await fetch(subcategoriesUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!subcategoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${subcategoriesResponse.status}`);
        }

        const subcategoriesData = await subcategoriesResponse.json();
        console.log('📂 Categories.jsx: Subcategories API response:', subcategoriesData);

        // Extract subcategories data
        const subcategoriesArray = subcategoriesData.data || subcategoriesData;
        console.log('📂 Categories.jsx: Subcategories array:', subcategoriesArray);

        // Transform subcategories to frontend format
        const transformedSubcategories = subcategoriesArray.map((subcategory, index) => {
          const subcategoryName = subcategory.name || 'Unknown Subcategory';
          const subcategorySlug = subcategory.slug || subcategoryName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');

          return {
            name: subcategoryName,
            image: defaultImages[subcategorySlug] || defaultImages['default'],
            bg: defaultBgs[index % defaultBgs.length],
            route: `/categories/${categorySlug}/${subcategorySlug}` // Parent/child route
          };
        });

        // If no subcategories found, show default subcategories based on parent category
        if (transformedSubcategories.length === 0) {
          console.log('📂 No subcategories found, showing default subcategories for:', categorySlug);

          const defaultSubcategories = getDefaultSubcategories(categorySlug);
          setCategories(defaultSubcategories);
        } else {
          setCategories(transformedSubcategories);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);

        // Fallback to default subcategories if API fails
        const fallbackCategories = getDefaultSubcategories(categorySlug);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categorySlug]); // Re-fetch when category slug changes

  if (loading) {
    return (
      <div>
        <FlipkartClothesHeader />
        <div className="pt-24 px-4 max-w-[1248px] mx-auto">
          <div className="font-medium text-base">Loading Categories...</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl w-[100px] h-[110px] sm:w-36"></div>
                <div className="bg-gray-200 h-4 mt-2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white min-h-screen">
        <MyntraClothesHeader />
        <div className="pt-28 px-4 max-w-[1248px] mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {parentCategory ? `${parentCategory.name} Categories` : 'Categories'}
            </h1>
            {parentCategory && (
              <p className="text-gray-600 mt-2">{parentCategory.description}</p>
            )}
          </div>

          <div className="font-medium text-base">
            List of Categories
            {error && <span className="text-red-500 text-sm ml-2">(Using fallback - API Error: {error})</span>}
            {/* {!error && <span className="text-green-500 text-sm ml-2">✅ Dynamic from Backend</span>} */}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                {...category}
                onClick={() => {
                  console.log('🚀 Navigating to:', category.route);
                  navigate(category.route);
                }}
              />
            ))}
          </div>
          {categories.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-8">
              No categories found. Add categories via the admin panel.
            </div>
          )}

          {/* Debug Info */}
          {/* <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <strong>Debug Info:</strong><br/>
          Categories Found: {categories.length}<br/>
          API Error: {error || 'None'}<br/>
          Status: {loading ? 'Loading...' : error ? 'Using Fallback' : 'Success'}
        </div> */}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Categories;