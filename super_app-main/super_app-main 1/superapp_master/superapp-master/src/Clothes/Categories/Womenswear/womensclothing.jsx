import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../../../Utility/Footer';
import ClothesHeader from '../../Header/ClothesHeader';
import kurtiImage from '../../Images/kurti.jpg';
import topsImage from '../../Images/tops.jpg';
import maxiImage from '../../Images/maxi.webp';
import legginImage from '../../Images/leggin.png';
import sareeImage from '../../Images/saree.webp';
import JeanImage from '../../Images/jean.jpg';
import TshirtImage from '../../Images/tshirt.jpg';
import TrackpantImage from '../../Images/trackpant.jpg';
import WomensFootwearImage from '../../Images/womenfootwear.jpg';
import banner1 from '../../Images/banner1.jpg';
import banner2 from '../../Images/banner2.jpg';
import banner3 from '../../Images/banner3.webp';
import seasonalImage from '../../Images/seasonal.jpg';
import rayonImage from '../../Images/rayon.webp';
import oversizedImage from '../../Images/oversizedtshirt.webp';




const womenClothingSubCategories = [
  {
    id: 1,
    name: 'KURTI',
    image: kurtiImage,
    route: '/categories/womens-wear/kurti',
  },
  {
    id: 2,
    name: 'TOPS',
    image: topsImage,
    route: '/categories/womens-wear/tops',
  },
  {
    id: 3,
    name: 'MAXI DRESS',
    image: maxiImage,
    route: '/categories/womens-wear/maxidress',
  },
  {
    id: 4,
    name: 'LEGGINGS',
    image: legginImage,
    route: '/categories/womens-wear/leggin',
  },
  {
    id: 5,
    name: 'JEANS',
    image: JeanImage,
    route: '/categories/womens-wear/jean',
  },
  {
    id: 6,
    name: 'SAREES',
    image: sareeImage,
    route: '/categories/womens-wear/saree',
  },
  {
    id: 7,
    name: 'T-SHIRTS',
    image: TshirtImage,
    route: '/categories/womens-wear/tshirt',
  },
  {
    id: 8,
    name: 'TRACKPANTS',
    image: TrackpantImage,
    route: '/categories/womens-wear/trackpantwomen',
  },
  {
    id: 9,
    name: 'FOOTWEAR',
    image: WomensFootwearImage,
    route: '/categories/womens-wear/womenfootwear',
  },
  {
    id: 10,
    name: 'SEASONAL DRESS',
    image: seasonalImage,
    route: '/categories/womens-wear/womenseasonaldress',
  },
   {
    id: 6,
    name: 'PALAZZOPANT',
    image: '',
    route: '/categories/womens-wear/palazzopant',
  },
];

// Similar products data - **KEY CHANGES HERE**
const similarProducts = [
  {
    id: 3,
    name: 'Oversized Crop T-Shirt',
    originalPrice: 1600,
    discountedPrice: 1280,
    image: oversizedImage, 
    description: 'Relaxed oversized crop t-shirt, great for casual outings or layering.',
    rating: 4.6,
    isBestSeller: true,
    quantity: 1,
    category: "Women's Wear - T-Shirts",
    sizes: ['S', 'M', 'L'],
    brand: 'Forever 21',
    fabrics: ['Cotton'],
    route: '/categories/womens-wear/tshirt', // **Added the route to the T-Shirts category**
  },
  {
    id: 5,
    name: 'Striped Long Sleeve Top',
    originalPrice: 1100,
    discountedPrice: 935,
    image: topsImage, // Using actual imported image
    description: 'Classic striped long-sleeve top, versatile for any wardrobe.',
    rating: 4.4,
    isBestSeller: false,
    quantity: 1,
    category: "Women's Wear - Tops",
    sizes: ['S', 'M', 'L', 'XL'],
    brand: 'ONLY',
    route: '/categories/womens-wear/tops', // **Added the route to the Tops category**
  },
  {
    id: 6,
    name: 'Printed Rayon Kurti',
    originalPrice: 1000,
    discountedPrice: 850,
    image: rayonImage, 
    description: 'Lightweight rayon kurti with colorful geometric prints.',
    rating: 4.2,
    isBestSeller: false,
    quantity: 1,
    category: "Women's Wear - Kurti",
    sizes: ['S', 'M', 'L'],
    brand: 'Aurelia',
    route: '/categories/womens-wear/kurti', 
  },
];

// Banner images (No changes needed)
const bannerImages = [
  banner1,
  banner2,
  banner3,
];

// CategoryCard component (No changes needed)
const CategoryCard = React.memo(({ category, onClick }) => (
  <div
    className="relative rounded-md overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`Maps to ${category.name}`}
  >
    <div className="aspect-square relative">
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
    </div>
    <div className="absolute top-4 left-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wide">
        {category.name}
      </h3>
    </div>
  </div>
));

// ProductCard component (No changes needed within the component definition itself)
const ProductCard = React.memo(({ product, onClick }) => (
  <div
    className="relative rounded-md overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 p-4 bg-white"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`View ${product.name}`}
  >
    <div className="aspect-square relative mb-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {product.isBestSeller && (
        <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
          Best Seller
        </span>
      )}
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
      <div className="flex justify-center items-center gap-2 mt-2">
        <span className="text-lg font-bold text-gray-800">₹{product.discountedPrice}</span>
        {product.originalPrice !== product.discountedPrice && (
          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
        )}
      </div>
      <div className="text-sm text-yellow-500 mt-1">
        {'★'.repeat(Math.round(product.rating))} ({product.rating})
      </div>
    </div>
  </div>
));

function WomenClothings() {
  const navigate = useNavigate();

 
  const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
  };

  // Slider settings for similar products (No changes needed)
  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ClothesHeader />
      <div className="pt-20 px-4 md:px-8 pb-32">
        {/* Breadcrumbs (No changes needed) */}
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">Home</Link> /{' '}
          <Link to="/categories" className="hover:underline">Categories</Link> /{' '}
          <span className="font-semibold">Women's Wear</span>
        </div>

        {/* Main Categories Section (No changes needed) */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
            WOMEN'S WEAR CATEGORIES
          </h1>
          {/* Banner Slider */}
          <div className="mb-10 max-w-4xl mx-auto">
            <Slider {...bannerSliderSettings}>
              {bannerImages.map((image, index) => (
                <div key={index} className="outline-none">
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md"
                    loading="lazy"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {womenClothingSubCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => navigate(category.route)}
              />
            ))}
          </div>
        </div>

        {/* Similar Products Section - **KEY CHANGE HERE** */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
            SIMILAR PRODUCTS
          </h2>
          <div className="max-w-5xl mx-auto">
            <Slider {...productSliderSettings}>
              {similarProducts.map((product) => (
                <div key={product.id} className="px-2">
                  <ProductCard
                    product={product}
                    // This is the line that needs to be updated to use product.route
                    onClick={() => navigate(product.route)}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default WomenClothings;