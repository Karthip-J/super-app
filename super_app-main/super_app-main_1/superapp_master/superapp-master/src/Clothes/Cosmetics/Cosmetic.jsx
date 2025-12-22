import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../../Utility/Footer';
import matteImage from '../Images/matee.webp';
import FoundationImage from '../Images/Foundation.jpg';
import ConditionerImage from '../Images/conditioner.png';
import shampooImage from '../Images/shampoo.png';
import cosbanner1 from '../Images/cosbanner1.jpg';
import cosbanner2 from '../Images/cosbanner2.jpg';
import simmatteImage from '../Images/simmatte.jpg';
import eyeshadowimage from '../Images/eyeshadow.jpg';
import mascaraimage from '../Images/mascara.jpg';
import compactpowderimage from '../Images/compactpowder.jpg';
import kajalimage from '../Images/kajal.webp';
// import perfumeimage from '../Images/perfume.webp';
import primerimage from '../Images/primer.png';
import sunscreenimage from '../Images/sunscreen.jpg';
import highlighterimage from '../Images/highlighter.jpg';
import settingsprayimage from '../Images/settingspray.jpg';
import { LocationDisplay } from '../../Grocery/SubPages/Header';


const cosmeticsSubCategories = [
  { id: 1, name: 'LIPSTICK', image: matteImage, route: '/cosmetics/lipstick' },
  { id: 2, name: 'FOUNDATION', image: FoundationImage, route: '/cosmetics/foundation' },
  { id: 3, name: 'PRIMER', image: primerimage, route: '/cosmetics/primer' },
  { id: 4, name: 'CONDITIONER', image: ConditionerImage, route: '/cosmetics/conditioner' },
  { id: 5, name: 'SHAMPOO', image: shampooImage, route: '/cosmetics/shampoo' },
  { id: 6, name: 'SUNSCREEN', image:sunscreenimage, route: '/cosmetics/sunscreen' },
  // { id: 7, name: 'PERFUME', image: perfumeimage, route: '/cosmetics/luxury' },
    { id: 8, name: 'EYESHADOW', image: eyeshadowimage, route: '/cosmetics/eyeshadow' },
    { id: 9, name: 'MASCARA', image: mascaraimage, route: '/cosmetics/mascara' },
 { id: 10, name: 'COMPACTPOWDER', image: compactpowderimage, route: '/cosmetics/compactpowder' },
   { id: 11, name: 'KAJAL', image: kajalimage, route: '/cosmetics/kajal' },
    { id: 12, name: 'SETTINGSPRAY', image: settingsprayimage, route: '/cosmetics/settingspray' },
 { id: 13, name: 'HIGHLIGHTER', image: highlighterimage, route: '/cosmetics/highlighter' },
];


const similarProducts = [
  {
    id: 1,
    name: 'Matte Lipstick',
    originalPrice: 800,
    discountedPrice: 640,
    image: simmatteImage,
    description: 'Long-lasting matte lipstick in vibrant shades.',
    rating: 4.5,
    isBestSeller: true,
    quantity: 1,
    category: 'Cosmetics - Lipstick',
    route: '/cosmetics/lipstick',
  },
  {
    id: 2,
    name: 'Hydrating Foundation',
    originalPrice: 1200,
    discountedPrice: 960,
    image: FoundationImage,
    description: 'Lightweight foundation with a dewy finish.',
    rating: 4.3,
    isBestSeller: false,
    quantity: 1,
    category: 'Cosmetics - Foundation',
    route: '/cosmetics/foundation',
  },
  {
    id: 3,
    name: 'Daily Shampoo',
    originalPrice: 500,
    discountedPrice: 425,
    image: shampooImage,
    description: 'Gentle shampoo for daily use, sulfate-free.',
    rating: 4.2,
    isBestSeller: false,
    quantity: 1,
    category: 'Cosmetics - Shampoo',
    route: '/cosmetics/shampoo',
  },
];


const bannerImages = [cosbanner1, cosbanner2];

const Header = () => (
  <header className="bg-white shadow-md fixed top-0 w-full z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Cosmetics Store</h1>
      <LocationDisplay />
    </div>
  </header>
);


const CategoryCard = React.memo(({ category, onClick }) => (
  <div
    className="relative rounded-md overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`Navigate to ${category.name} category`}
  >
    <div className="aspect-square relative">
      <img
        src={category.image || '/path/to/fallback-image.jpg'}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
    </div>
    <div className="absolute top-4 left-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wide">{category.name}</h3>
    </div>
  </div>
));


const ProductCard = React.memo(({ product, onClick }) => (
  <div
    className="relative rounded-md overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 p-4 bg-white"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`Navigate to ${product.name} in ${product.category}`}
  >
    <div className="aspect-square relative mb-4">
      <img
        src={product.image || '/path/to/fallback-image.jpg'}
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

function Cosmetics() {
  const navigate = useNavigate();


  const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 800, 
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000, 
    arrows: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    fade: true, 
  };

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
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

 
  const handleNavigation = (route) => {
    try {
      navigate(route);
    } catch (error) {
      console.error(`Navigation to ${route} failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <div className="pt-20 px-4 md:px-8 pb-32">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">Home</Link> /{' '}
          <Link to="/categories" className="hover:underline">Categories</Link> /{' '}
          <span className="font-semibold">Cosmetics</span>
        </div>

        {/* Main Categories Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
            COSMETICS CATEGORIES
          </h1>
          {/* Banner Slider */}
          <div className="mb-10 max-w-4xl mx-auto">
            <Slider {...bannerSliderSettings} aria-label="Cosmetics banners carousel">
              {bannerImages.map((image, index) => (
                <div key={index} className="outline-none">
                  <img
                    src={image}
                    alt={`Cosmetics promotional banner ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md"
                    loading="lazy"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {cosmeticsSubCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleNavigation(category.route)}
              />
            ))}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
            SIMILAR PRODUCTS
          </h2>
          <div className="max-w-5xl mx-auto">
            <Slider {...productSliderSettings} aria-label="Similar products carousel">
              {similarProducts.map((product) => (
                <div key={product.id} className="px-2">
                  <ProductCard
                    product={product}
                    onClick={() => handleNavigation(product.route)}
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

export default Cosmetics;
