import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Scissors,
  Shovel,
  Wrench,
  Tv,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  CreditCard,
  User
} from 'lucide-react';
import CityBellLogo from '../../Images/Logo/CityBellLogo.png';

const UrbanServicesHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Delhi NCR');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Base URL for API and images
  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchCategories();
    detectLocation();
  }, []);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.suburb || 'Delhi NCR';
            setLocation(city);
          } catch (error) {
            console.error("Error detecting location:", error);
          }
        },
        (error) => {
          console.error("Location access denied:", error);
        }
      );
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from: /api/urban-services/categories?active=true');
      const response = await axios.get('/api/urban-services/categories?active=true');
      console.log('Categories API response:', response);
      console.log('Categories data:', response.data.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const mainCategories = [
    { name: 'Women\'s Salon & Spa', icon: <Scissors className="w-8 h-8" />, color: 'bg-rose-50 text-rose-600', slug: 'salon-for-women' },
    { name: 'Men\'s Salon & Massage', icon: <Scissors className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600', slug: 'salon-for-men' },
    { name: 'AC & Appliance Repair', icon: <Tv className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600', slug: 'appliance-repair' },
    { name: 'Cleaning & Pest Control', icon: <Sparkles className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600', slug: 'cleaning' },
    { name: 'Electrician, Plumber & Painter', icon: <Wrench className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-600', slug: 'home-repairs' },
    { name: 'Wall Panels & Painting', icon: <Shovel className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600', slug: 'painting' },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    // Create a plain object for state to avoid "Symbol(react.element) could not be cloned" error
    const serializedCategory = {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      pricingType: category.pricingType,
      minPrice: category.minPrice,
      estimatedDuration: category.estimatedDuration,
      description: category.description,
      image: category.image
    };
    navigate(`/urban-services/category/${category.slug}`, { state: { category: serializedCategory } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium tracking-wide">City Bell</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div
              className="cursor-pointer"
              onClick={() => navigate('/urban-services')}
            >
              <img src={CityBellLogo} alt="City Bell" className="h-12 object-contain" />
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer text-sm font-medium">
              <MapPin size={16} className="text-gray-500" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search for 'Salon at home'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Removed Register and Help buttons */}
            <div
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => navigate('/urban-services/settings')}
            >
              <User size={18} />
            </div>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Home services at your doorstep
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg mb-12"
          >
            Highest rated professionals for every household task
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-6"
          >
            {mainCategories.map((item, idx) => (
              <div
                key={idx}
                className="group cursor-pointer"
                onClick={() => {
                  const categoryData = categories.find(c => c.slug === item.slug);
                  if (categoryData) {
                    handleCategoryClick(categoryData);
                  } else {
                    // Fallback to direct navigation if data not yet loaded, 
                    // though BookService might redirect back
                    handleCategoryClick(item);
                  }
                }}
              >
                <div className={`${item.color} aspect-square rounded-2xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                  {item.icon}
                </div>
                <p className="text-[12px] font-semibold tracking-tight text-gray-800 leading-tight">
                  {item.name}
                </p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Promotional Banner Section */}
        <section className="max-w-7xl mx-auto px-4 mb-16 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-4">
            <div className="min-w-[300px] md:min-w-[400px] aspect-[16/9] rounded-3xl bg-blue-600 relative overflow-hidden flex-shrink-0 snap-start">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="cleaning" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-blue-400 font-bold mb-1">BEST OFFER</p>
                <h3 className="text-white text-2xl font-bold mb-2">Deep Home Cleaning</h3>
                <p className="text-gray-300 text-sm">Professional equipment & eco-friendly chemicals</p>
              </div>
            </div>
            <div className="min-w-[300px] md:min-w-[400px] aspect-[16/9] rounded-3xl bg-rose-600 relative overflow-hidden flex-shrink-0 snap-start">
              <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="salon" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-rose-400 font-bold mb-1">LUXURY CARE</p>
                <h3 className="text-white text-2xl font-bold mb-2">Salon at Home</h3>
                <p className="text-gray-300 text-sm">Packages starting from ₹599 onwards</p>
              </div>
            </div>
            <div className="min-w-[300px] md:min-w-[400px] aspect-[16/9] rounded-3xl bg-orange-600 relative overflow-hidden flex-shrink-0 snap-start">
              <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="ac repair" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-orange-400 font-bold mb-1">SEASONAL SAVE</p>
                <h3 className="text-white text-2xl font-bold mb-2">AC Repair & Service</h3>
                <p className="text-gray-300 text-sm">Fix your cooling before summer hits</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Categories Section */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">New and noteworthy</h2>
            <button className="text-sm font-bold text-gray-500 hover:text-black underline underline-offset-4 decoration-gray-200 hover:decoration-black transition-all">View all</button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCategories.slice(0, 4).map((category) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-2xl bg-gray-100 mb-3 overflow-hidden">
                  {category.image ? (
                    <img 
                      src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', e.target.src);
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-50" style={{display: category.image ? 'none' : 'flex'}}>
                      <span className="text-4xl opacity-40">{category.icon || '🏠'}</span>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="fill-blue-600 text-blue-600" />
                  <span className="text-xs font-bold text-gray-900">4.8</span>
                  <span className="text-xs text-gray-400 ml-1">(120k bookings)</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UC Promise Section */}
        <section className="bg-gray-50 py-20 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-6">The City Bell <br /><span className="text-blue-600">Promise</span></h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Verified Professionals</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">Every professional goes through a rigorous 4-step background verification.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Standardized Pricing</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">No hidden costs. Pay exactly what you see on the app.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Clock className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">On-time Guarantee</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">Professional will reach within 60 minutes of booking slot.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] bg-gray-200 rounded-[40px] overflow-hidden rotate-3">
                  <img src="https://images.unsplash.com/photo-1521791136064-7986c295944b?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transform -rotate-3 scale-110" alt="promise" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Categories Section */}
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8">All Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <motion.div
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.01 }}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-black/10 hover:shadow-xl transition-all cursor-pointer flex items-center gap-5"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  {category.icon || '🛠️'}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-0.5">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      ₹{category.minPrice}+
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-widest font-bold">
                      <Clock size={12} /> {category.estimatedDuration} mins
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="ml-auto text-gray-300" />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-black text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 border-b border-white/10 pb-20">
            <div className="col-span-2">
              <div className="mb-6">
                <img src={CityBellLogo} alt="City Bell" className="h-10 object-contain brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm max-w-sm mb-8">
                The world's largest home services platform, dedicated to providing high-quality, professional services right at your doorstep.
              </p>
              <div className="flex gap-4">
                <button className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_logo_black.svg" className="h-5 invert" alt="apple" />
                  <span className="text-xs font-bold">App Store</span>
                </button>
                <button className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_EN.svg" className="h-5" alt="google" />
                  <span className="text-xs font-bold">Play Store</span>
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest">Company</h5>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">City Bell Foundation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest">For Customers</h5>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Our Reviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-sm uppercase tracking-widest">For Partners</h5>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Register as Partner</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Service Quality</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Standard</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
            <div>© 2024 City Bell. All rights reserved.</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Outfit', sans-serif !important;
        }
      `}} />
    </div>
  );
};

export default UrbanServicesHome;

