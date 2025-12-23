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
  User,
  Home,
  Hammer,
  Droplets,
  Zap
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
    { name: 'Women\'s Salon & Spa', icon: <Scissors className="w-8 h-8" />, color: 'bg-rose-50 text-rose-600', slug: 'salon-for-women', description: 'Beauty & wellness services' },
    { name: 'Men\'s Salon & Massage', icon: <Scissors className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600', slug: 'salon-for-men', description: 'Grooming & relaxation' },
    { name: 'AC & Appliance Repair', icon: <Tv className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600', slug: 'appliance-repair', description: 'Expert repair services' },
    { name: 'Cleaning & Pest Control', icon: <Sparkles className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600', slug: 'cleaning', description: 'Deep cleaning & pest control' },
    { name: 'Electrician, Plumber & Carpenter', icon: <Wrench className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-600', slug: 'home-repairs', description: 'Home repair experts' },
    { name: 'Painting & Wall Treatment', icon: <Droplets className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600', slug: 'painting', description: 'Professional painting services' },
    { name: 'Water Purifier & RO Service', icon: <Droplets className="w-8 h-8" />, color: 'bg-cyan-50 text-cyan-600', slug: 'water-purifier', description: 'Water purification services' },
    { name: 'General Home Maintenance', icon: <Home className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600', slug: 'home-maintenance', description: 'Complete home care' },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category) => {
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
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div
              className="cursor-pointer"
              onClick={() => navigate('/urban-services')}
            >
              <img src={CityBellLogo} alt="City Bell" className="h-8 md:h-12 object-contain" />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer text-xs md:text-sm font-semibold">
              <MapPin size={16} className="text-blue-600" />
              <span className="truncate max-w-[100px] md:max-w-none">{location}</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search for 'Salon', 'Plumber', 'AC Repair'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all text-[15px] font-medium placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">2,401 Pros Online</span>
              </div>
            </div>
            <div
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
              onClick={() => navigate('/urban-services/settings')}
            >
              <User size={18} className="text-gray-600 md:size-[20px] group-hover:text-black" />
            </div>
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-100 transition-all text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-sm font-semibold">{location}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-24 md:pt-32 pb-24">
        {/* Statistics & Trust Bar */}
        <div className="max-w-7xl mx-auto px-4 mb-12 md:mb-20 hidden sm:block">
          <div className="flex justify-center items-center gap-8 md:gap-16 py-6 md:py-8 border-y border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Star size={20} className="md:size-[24px] fill-blue-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">4.8</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Service Rating</p>
              </div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-100"></div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <User size={20} className="md:size-[24px] fill-purple-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">12M+</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Customers</p>
              </div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-100"></div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <ShieldCheck size={20} className="md:size-[24px]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">Verified</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Professionals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 text-center mb-16 md:mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 leading-[1.1]"
          >
            Home services,<br />on <span className="text-blue-600">demand.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-base md:text-xl mb-12 md:text-xl mb-16 max-w-2xl mx-auto font-medium px-4"
          >
            Experience premium household services with City Bell's trusted and verified professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-1"
          >
            {mainCategories.map((item, idx) => {
              const apiCategory = categories.find(c => c.slug === item.slug);
              return (
                <div
                  key={idx}
                  className="group cursor-pointer p-3 md:p-4 hover:bg-gray-50 rounded-2xl md:rounded-3xl transition-all duration-300"
                  onClick={() => {
                    if (apiCategory) {
                      handleCategoryClick(apiCategory);
                    } else {
                      handleCategoryClick(item);
                    }
                  }}
                >
                  <div className={`${item.color} aspect-square rounded-[1.5rem] md:rounded-[2rem] mb-3 md:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-transparent overflow-hidden`}>
                    {apiCategory?.image ? (
                      <img
                        src={apiCategory.image.startsWith('http') ? apiCategory.image : `${API_BASE_URL}${apiCategory.image}`}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    ) : (
                      React.cloneElement(item.icon, { className: 'w-8 h-8 md:w-10 md:h-10' })
                    )}
                  </div>
                  <p className="text-[11px] md:text-[13px] font-bold tracking-tight text-gray-900 leading-tight text-center">
                    {item.name}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* Promotional Banner Section - Premium */}
        <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32 overflow-hidden">
          <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x pb-8 px-2">
            {[
              {
                bg: 'from-blue-600 to-indigo-700',
                label: 'BEST OFFER',
                title: 'Deep Cleaning',
                desc: 'Professional equipment & chemicals',
                img: 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&w=800&q=80',
                price: '₹419',
                slug: 'cleaning'
              },
              {
                bg: 'from-rose-500 to-pink-600',
                label: 'LUXURY CARE',
                title: 'Salon at Home',
                desc: 'Packages starting from ₹599 onwards',
                img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
                price: '₹599',
                slug: 'salon-for-women'
              },
              {
                bg: 'from-orange-500 to-amber-600',
                label: 'SEASONAL SAVE',
                title: 'AC Repair',
                desc: 'Fix your cooling before summer hits',
                img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                price: '₹249',
                slug: 'appliance-repair'
              }
            ].map((banner, i) => (
              <div key={i} className={`min-w-[280px] sm:min-w-[340px] md:min-w-[500px] aspect-[16/10] md:aspect-[16/8.5] rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden flex-shrink-0 snap-start shadow-xl md:shadow-2xl shadow-gray-200 group`}>
                <img src={banner.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.7]" alt={banner.title} />
                <div className={`absolute inset-0 p-6 md:p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent`}>
                  <p className="text-white/80 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3">{banner.label}</p>
                  <h3 className="text-white text-xl md:text-3xl font-black mb-1 md:mb-2 tracking-tight">{banner.title}</h3>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white/70 text-[11px] md:text-sm max-w-[180px] md:max-w-[240px] leading-relaxed line-clamp-2 md:line-clamp-none">{banner.desc}</p>
                    <div
                      onClick={() => {
                        const categoryData = categories.find(c => c.slug === banner.slug);
                        if (categoryData) {
                          handleCategoryClick(categoryData);
                        } else {
                          // Fallback to mainCategories mapping if API data hasn't loaded or doesn't match
                          const mainCat = mainCategories.find(c => c.slug === banner.slug);
                          if (mainCat) handleCategoryClick(mainCat);
                        }
                      }}
                      className="bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Book at {banner.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Categories Section */}
        <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4">
            <div>
              <p className="text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 md:mb-3">Trending Now</p>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter">New and noteworthy</h2>
            </div>
            <button
              onClick={() => document.getElementById('all-services')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto h-11 md:h-12 px-5 md:px-6 rounded-xl md:rounded-2xl border border-gray-100 text-xs md:text-sm font-bold hover:bg-black hover:text-white hover:border-black transition-all group flex items-center justify-center"
            >
              View all services <ChevronRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredCategories.slice(0, 12).map((category) => (
              <motion.div
                whileHover={{ y: -10 }}
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50 mb-4 md:mb-6 overflow-hidden relative shadow-sm border border-gray-50">
                  {category.image ? (
                    <img
                      src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl md:text-6xl opacity-30 transform group-hover:scale-125 transition-transform duration-500">{category.icon || '🏠'}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 md:top-6 md:left-6">
                    <div className="bg-white/90 backdrop-blur-md px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Starting ₹{category.minPrice}
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-black text-white rounded-xl md:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <ChevronRight size={18} className="md:size-[24px]" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm md:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-1 md:mb-2 leading-tight">{category.name}</h4>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-lg">
                    <Star size={10} className="md:size-[12px] fill-blue-600 text-blue-600" />
                    <span className="text-[9px] md:text-[11px] font-black text-blue-600">4.8</span>
                  </div>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">(120k+)</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UC Promise Section - Modernized */}
        <section className="bg-black py-20 md:py-32 mb-20 md:mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-purple-600/10 blur-[120px] rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
              <div>
                <p className="text-blue-500 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 md:mb-6">Our Commitment</p>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-8 md:mb-12 text-white leading-tight">
                  The City Bell<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Promise.</span>
                </h2>
                <div className="space-y-8 md:space-y-10">
                  {[
                    {
                      icon: <ShieldCheck className="text-blue-500" />,
                      title: 'Verified Professionals',
                      desc: 'Every pro undergoes a 4-step background verification and identity check.'
                    },
                    {
                      icon: <CheckCircle2 className="text-blue-500" />,
                      title: 'Standardized Pricing',
                      desc: 'Experience pricing transparency with no hidden costs or surprise surcharges.'
                    },
                    {
                      icon: <Clock className="text-blue-500" />,
                      title: 'On-time Guarantee',
                      desc: 'If our professional is late by 30+ minutes, get 10% off on your service.'
                    }
                  ].map((promise, key) => (
                    <div key={key} className="flex gap-5 md:gap-8 group">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 group-hover:border-blue-600/30 transition-all duration-500">
                        {React.cloneElement(promise.icon, {
                          size: 28,
                          className: 'text-blue-500',
                          strokeWidth: 2.5
                        })}
                      </div>
                      <div>
                        <h4 className="font-black text-lg md:text-xl text-white mb-1 md:mb-2">{promise.title}</h4>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">{promise.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="aspect-[4/5] bg-neutral-900 rounded-[3rem] lg:rounded-[4rem] overflow-hidden relative p-4 border border-white/5">
                  <div className="absolute inset-4 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80"
                      className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                      alt="City Bell Professional Services"
                    />
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 bg-blue-600 p-8 lg:p-12 rounded-full border-[8px] lg:border-[12px] border-black text-white shadow-2xl">
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-black">100%</p>
                      <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Categories Section */}
        <section id="all-services" className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-3 md:mb-4">Explore all services</h2>
            <div className="h-1 w-16 md:w-20 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCategories.map((category) => (
              <motion.div
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex items-center gap-4 md:gap-6 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl shrink-0 group-hover:bg-blue-50 transition-colors duration-500 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
                      className="w-full h-full object-cover"
                      alt={category.name}
                    />
                  ) : (
                    category.icon || '🛠️'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg md:text-xl mb-1 group-hover:text-blue-600 transition-colors truncate">{category.name}</h3>
                  <p className="text-[13px] text-gray-400 font-medium line-clamp-1 mb-3 md:mb-4">{category.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Starting ₹{category.minPrice}
                    </div>
                    <div className="text-[9px] text-gray-300 flex items-center gap-1.5 uppercase tracking-widest font-black">
                      <Clock size={10} strokeWidth={3} /> {category.estimatedDuration}m
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight size={18} className="md:size-[20px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-20 md:pt-32 pb-12 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 mb-20 md:mb-32">
            <div className="lg:col-span-5">
              <div className="mb-8 md:mb-10 text-center lg:text-left">
                <img src={CityBellLogo} alt="City Bell" className="h-10 md:h-12 object-contain brightness-0 invert mx-auto lg:mx-0" />
              </div>
              <p className="text-gray-400 text-base md:text-lg font-medium max-w-md mb-8 md:mb-12 leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
                Empowering independent professionals to provide doorstep services like never before. Trusted by millions worldwide.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="h-12 md:h-14 px-6 md:px-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl transition-all flex items-center gap-3 active:scale-95 group">
                  <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center invert opacity-80 group-hover:opacity-100">
                    <svg viewBox="0 0 384 512" width="18" height="18" className="md:w-[20px] md:h-[20px]"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41-84.5-43.2-35.3-2.4-70.5 21.3-84.4 21.3-14.7 0-45.3-20.8-77.4-20.2-42.6.6-81.8 24.8-103.8 63.3-44.6 77.3-11.4 191.8 31.3 253.5 21 30.1 46.1 63.8 78.4 62.6 31.1-1.2 42.7-20.1 80.3-20.1 37.5 0 48.3 20.1 81 19.5 33.3-.6 54.8-30.5 75.2-60.2 23.5-34.4 33.2-67.6 33.6-69.2-1-0.2-65.7-25.2-66.3-102.5zM290.3 69.6c15.6-18.9 26.1-45.2 23.2-71.4-22.6 0.9-49.9 15.1-66.1 34-14.5 16.8-27.1 43.8-23.7 69.1 25.1 2 51.1-12.8 66.6-31.7z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-gray-500 leading-none mb-1">Download on</p>
                    <p className="text-xs md:text-sm font-black">App Store</p>
                  </div>
                </button>
                <button className="h-12 md:h-14 px-6 md:px-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl transition-all flex items-center gap-3 active:scale-95 group">
                  <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center opacity-80 group-hover:opacity-100">
                    <svg viewBox="0 0 512 512" width="18" height="18" className="md:w-[20px] md:h-[20px]"><path fill="#fff" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-127.3-60.1-60.1L104.6 499z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-gray-500 leading-none mb-1">Get it on</p>
                    <p className="text-xs md:text-sm font-black">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
              <div>
                <h5 className="font-black mb-6 md:mb-8 text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-500">Company</h5>
                <ul className="space-y-4 md:space-y-6 text-gray-400 text-sm md:text-base font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Foundation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-black mb-6 md:mb-8 text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-500">Customers</h5>
                <ul className="space-y-4 md:space-y-6 text-gray-400 text-sm md:text-base font-medium">
                  <li><a href="#" className="hover:text-white transition-colors">Reviews</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h5 className="font-black mb-6 md:mb-8 text-[10px] md:text-xs uppercase tracking-[0.3em] text-blue-500">Partners</h5>
                <ul className="space-y-4 md:space-y-6 text-gray-400 text-sm md:text-base font-medium flex flex-row flex-wrap justify-center md:flex-col md:justify-start gap-x-8 gap-y-4">
                  <li><a href="#" className="hover:text-white transition-colors">Register as Partner</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Service Quality</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Safety Standard</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-[11px] md:text-sm font-bold text-gray-600 order-3 md:order-1 text-center">
              © 2024 City Bell Services Private Limited.
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 order-2 md:order-2">
              {['Privacy', 'Terms', 'Cookies'].map(link => (
                <a key={link} href="#" className="text-[11px] md:text-sm font-bold text-gray-600 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
            <div className="flex gap-4 md:gap-6 order-1 md:order-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer group">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-500 group-hover:bg-white transition-colors" style={{ mask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg) no-repeat center`, WebkitMask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${['facebook', 'twitter', 'instagram', 'linkedin'][i - 1]}.svg) no-repeat center` }}></div>
                </div>
              ))}
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
        
        :root {
          --font-outfit: 'Outfit', sans-serif;
        }

        body {
          font-family: var(--font-outfit) !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-outfit) !important;
        }

        input::placeholder {
          font-family: var(--font-outfit) !important;
        }

        /* Smooth tab highlight for mobile */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Custom selection color */
        ::selection {
          background: rgba(59, 130, 246, 0.2);
          color: #2563eb;
        }

        /* Responsive adjustments for extra small screens */
        @media (max-width: 380px) {
          .xs\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}} />
    </div >
  );
};

export default UrbanServicesHome;
