import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, ChevronDown, MapPin, ChevronLeft, Clock, Star, Crosshair } from 'lucide-react';
// import SearchOverlayF from './SearchOverlayF';

const navigationItems = [
  {
    label: "Recipes",
    path: "/recipes",
    dropdown: [
      { label: "Breakfast", path: "/recipes/breakfast" },
      { label: "Lunch", path: "/recipes/lunch" },
      { label: "Dinner", path: "/recipes/dinner" },
      { label: "Desserts", path: "/recipes/desserts" },
      { label: "Snacks", path: "/recipes/snacks" }
    ]
  },
  {
    label: "Cuisines",
    path: "/cuisines",
    dropdown: [
      { label: "Indian", path: "/cuisines/indian" },
      { label: "Italian", path: "/cuisines/italian" },
      { label: "Chinese", path: "/cuisines/chinese" },
      { label: "Mexican", path: "/cuisines/mexican" },
      { label: "Thai", path: "/cuisines/thai" }
    ]
  },
  {
    label: "Meal Plans",
    path: "/meal-plans"
  }
];

const indianLocations = {
  popularCities: [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Delhi", state: "Delhi" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Hyderabad", state: "Telangana" },
    { name: "Chennai", state: "Tamil Nadu" },
    { name: "Kolkata", state: "West Bengal" }
  ],
  otherCities: [
    { name: "Pune", state: "Maharashtra" },
    { name: "Ahmedabad", state: "Gujarat" },
    { name: "Jaipur", state: "Rajasthan" },
    { name: "Lucknow", state: "Uttar Pradesh" },
    { name: "Surat", state: "Gujarat" },
    { name: "Kanpur", state: "Uttar Pradesh" },
    { name: "Nagpur", state: "Maharashtra" },
    { name: "Indore", state: "Madhya Pradesh" },
    { name: "Thane", state: "Maharashtra" },
    { name: "Bhopal", state: "Madhya Pradesh" }
  ]
};

function HeaderF() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Location address state
  const [locationAddress, setLocationAddress] = useState('Set your location');

  // Check if we're not on the home page
  const showBackButton = location.pathname !== '/';

  // Set initial location from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    const savedRecent = localStorage.getItem('recentLocations');
    
    if (savedAddress) {
      setLocationAddress(savedAddress);
    }
    
    if (savedRecent) {
      setRecentLocations(JSON.parse(savedRecent));
    }
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSetLocation = (location) => {
    if (location) {
      // Update current location
      localStorage.setItem('userAddress', location);
      setLocationAddress(location);
      
      // Update recent locations
      const updatedRecent = [
        location,
        ...recentLocations.filter(loc => loc !== location).slice(0, 2)
      ];
      setRecentLocations(updatedRecent);
      localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));
    }
    setIsLocationModalOpen(false);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      // await logout(); // Removed as per edit hint
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const filteredCities = [
    ...indianLocations.popularCities,
    ...indianLocations.otherCities
  ].filter(city =>
    city.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  const detectLocation = () => {
    // Simulate location detection
    setTimeout(() => {
      const randomCity = indianLocations.popularCities[
        Math.floor(Math.random() * indianLocations.popularCities.length)
      ];
      handleSetLocation(`${randomCity.name}, ${randomCity.state}`);
    }, 1500);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'
      }`}>
        {/* Mobile Address Bar */}
        <div className="md:hidden flex items-center px-4 py-2 bg-white shadow">
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className="mr-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <button 
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center flex-1"
          >
            <MapPin className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="text-xs text-gray-500">Delivery to</p>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                {locationAddress}
              </p>
            </div>
          </button>
        </div>
        
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo or Back Button */}
            <div className="flex items-center">
              {showBackButton ? (
                <button 
                  onClick={handleBackClick}
                  className="hidden md:flex items-center mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              ) : null}
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="ml-3 text-2xl font-bold text-green-600">Foodie</span>
              </Link>
            </div>

            {/* Location - Desktop */}
            <div className="hidden md:flex items-center ml-6 relative">
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                <MapPin className="w-4 h-4 mr-1" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Delivery to</p>
                  <p className="font-medium text-gray-800 max-w-[120px] truncate">
                    {locationAddress}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 mx-8 max-w-xl">
              <div 
                onClick={() => setIsSearchOverlayOpen(true)}
                className="w-full relative cursor-pointer"
              >
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-gray-700 hover:text-green-600">
                  <User className="w-5 h-5" />
                  <span className="text-sm">
                    {/* {currentUser ? currentUser.displayName || 'Account' : 'Sign In'} */}
                    Sign In
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200 z-50">
                  {/* {currentUser ? ( */}
                    <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign In</Link>
                  </>
                  {/* ) : ( */}
                  {/* <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign In</Link> */}
                  {/* )} */}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-4">
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className="p-2 text-gray-700 hover:text-green-600"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-green-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Navigation - Desktop */}
          {!showBackButton && (
            <nav className="hidden md:flex items-center justify-center space-x-6 py-2">
              {navigationItems.map((item) => (
                <div 
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link 
                    to={item.path || '#'}
                    className={`flex items-center py-2 text-sm font-medium ${
                      location.pathname.startsWith(item.path) ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    {item.label}
                    {item.dropdown && <ChevronDown className="ml-1 w-4 h-4" />}
                  </Link>
                  
                  {activeDropdown === item.label && item.dropdown && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-40">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="container mx-auto px-4 py-3">
              {/* User Info - Mobile */}
              {/* {currentUser && ( */}
              {/* <div className="flex items-center mb-4 px-3 py-2"> */}
              {/* <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3"> */}
              {/* <User className="w-5 h-5 text-green-600" /> */}
              {/* </div> */}
              {/* <div> */}
              {/* <p className="font-medium">{currentUser.displayName || 'My Account'}</p> */}
              {/* <p className="text-xs text-gray-500">{currentUser.email}</p> */}
              {/* </div> */}
              {/* </div> */}
              {/* )} */}

              {/* Location - Mobile */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full flex items-center mb-4 px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Delivery to</p>
                  <p className="truncate">
                    {locationAddress === 'Set your location' ? 'Set Delivery Address' : locationAddress}
                  </p>
                </div>
              </button>

              {/* Search - Mobile */}
              <div 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOverlayOpen(true);
                }}
                className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-300 flex items-center text-gray-500 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Search restaurants or dishes...</span>
              </div>

              {/* Navigation - Mobile */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.label}>
                    <Link 
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg font-medium ${
                        location.pathname.startsWith(item.path) ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* User Actions - Mobile */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* {currentUser ? ( */}
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                </>
                {/* ) : ( */}
                {/* <Link  */}
                {/* to="/login"  */}
                {/* onClick={() => setIsMenuOpen(false)} */}
                {/* className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100" */}
                {/* > */}
                {/* Sign In */}
                {/* </Link> */}
                {/* )} */}
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-16 md:pt-20">
            <div className="bg-white rounded-t-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="p-4 sticky top-0 bg-white border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Choose your location</h2>
                  <button 
                    onClick={() => setIsLocationModalOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search for area, street name..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={locationSearchTerm}
                    onChange={(e) => setLocationSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <button
                  onClick={detectLocation}
                  className="w-full flex items-center justify-center py-2 text-green-600 font-medium"
                >
                  <Crosshair className="w-4 h-4 mr-2" />
                  Detect my location
                </button>
              </div>

              <div className="p-4">
                {recentLocations.length > 0 && !locationSearchTerm && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Locations</h3>
                    <div className="space-y-2">
                      {recentLocations.map((location, index) => (
                        <button
                          key={index}
                          onClick={() => handleSetLocation(location)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                        >
                          <div>
                            <p className="font-medium">{location.split(',')[0]}</p>
                            <p className="text-xs text-gray-500">{location.split(',')[1]?.trim() || 'India'}</p>
                          </div>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {locationSearchTerm ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
                    {filteredCities.length > 0 ? (
                      <div className="space-y-2">
                        {filteredCities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => handleSetLocation(`${city.name}, ${city.state}`)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                          >
                            <div>
                              <p className="font-medium">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.state}</p>
                            </div>
                            {indianLocations.popularCities.some(c => c.name === city.name) && (
                              <Star className="w-4 h-4 text-yellow-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No locations found</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Popular Cities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {indianLocations.popularCities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => handleSetLocation(`${city.name}, ${city.state}`)}
                            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                          >
                            <div>
                              <p className="font-medium">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.state}</p>
                            </div>
                            <Star className="w-4 h-4 text-yellow-400" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Other Cities</h3>
                      <div className="space-y-2">
                        {indianLocations.otherCities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => handleSetLocation(`${city.name}, ${city.state}`)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-left"
                          >
                            <div>
                              <p className="font-medium">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.state}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default HeaderF;