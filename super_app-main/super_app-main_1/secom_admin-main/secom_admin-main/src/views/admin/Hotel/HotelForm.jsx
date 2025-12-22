import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HotelService from './HotelService';

// Country, State, City data
const locationData = {
  India: {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Along', 'Tezu', 'Namsai', 'Roing'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Canacona', 'Quepem', 'Sanguem'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Kullu', 'Manali', 'Chamba'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Shimoga', 'Tumkur'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Senapati', 'Ukhrul', 'Tamenglong', 'Chandel', 'Jiribam'],
    'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Williamnagar', 'Resubelpara', 'Nongpoh', 'Mairang', 'Mawkyrwat'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Mamit', 'Saiha', 'Saitual', 'Khawzawl'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek', 'Longleng', 'Kiphire'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang', 'Nayabazar', 'Ravangla', 'Pelling'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Ambassa', 'Khowai', 'Teliamura', 'Sonamura', 'Sabroom'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Mussoorie', 'Almora'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'],
    'Delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi'],
    'Chandigarh': ['Chandigarh'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Udhampur', 'Kathua', 'Rajouri', 'Poonch', 'Kupwara'],
    'Ladakh': ['Leh', 'Kargil', 'Diskit', 'Padum', 'Nyoma', 'Tangtse', 'Dras', 'Sankoo', 'Zanskar', 'Nubra'],
  },
  'United States': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Oakland', 'Long Beach', 'Bakersfield', 'Anaheim'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Corpus Christi', 'Laredo'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Cape Coral', 'Pembroke Pines'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany', 'Yonkers', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Joliet', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Champaign'],
  },
  'United Kingdom': {
    'England': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol', 'Sheffield', 'Newcastle', 'Nottingham', 'Leicester'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Perth', 'Paisley', 'Livingston', 'Hamilton'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Neath', 'Cwmbran', 'Port Talbot', 'Bridgend', 'Llanelli'],
    'Northern Ireland': ['Belfast', 'Londonderry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon', 'Ballymena', 'Newtownabbey', 'Carrickfergus', 'Omagh'],
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Levis', 'Trois-Rivieres', 'Terrebonne'],
    'British Columbia': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Coquitlam', 'Kelowna', 'Abbotsford', 'Langley', 'Kamloops'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Leduc'],
  },
  'Australia': {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Tweed Heads', 'Wagga Wagga', 'Albury', 'Port Macquarie', 'Tamworth'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura', 'Warrnambool', 'Wodonga', 'Traralgon', 'Melton'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay', 'Rockhampton', 'Bundaberg', 'Hervey Bay'],
    'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany', 'Karratha', 'Broome', 'Port Hedland', 'Busselton'],
  },
  'UAE': {
    'Dubai': ['Dubai City', 'Deira', 'Bur Dubai', 'Jumeirah', 'Marina', 'Downtown Dubai', 'Business Bay', 'Al Barsha', 'Palm Jumeirah', 'JBR'],
    'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Khalifa City', 'Al Reem Island', 'Yas Island', 'Saadiyat Island', 'Mussafah', 'Madinat Zayed', 'Ruwais', 'Al Dhafra'],
    'Sharjah': ['Sharjah City', 'Al Nahda', 'Al Majaz', 'Al Qasimia', 'Al Khan', 'Muwaileh', 'Al Taawun', 'Halwan', 'Al Gharb', 'Al Shahba'],
    'Ajman': ['Ajman City', 'Al Nuaimia', 'Al Rashidiya', 'Al Jurf', 'Al Rumailah', 'Al Hamidiya', 'Musheiref', 'Al Bustan', 'Al Zahra', 'Masfout'],
  },
  'Singapore': {
    'Central Region': ['Downtown Core', 'Marina Bay', 'Orchard', 'Newton', 'Novena', 'Toa Payoh', 'Bishan', 'Bukit Merah', 'Queenstown', 'Tanglin'],
    'East Region': ['Bedok', 'Changi', 'Pasir Ris', 'Tampines', 'Paya Lebar', 'Geylang', 'Marine Parade', 'Katong', 'Simei', 'Changi Business Park'],
    'North Region': ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Mandai', 'Seletar', 'Lentor', 'Springleaf', 'Khatib', 'Simpang'],
    'West Region': ['Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok', 'Bukit Panjang', 'Choa Chu Kang', 'Tuas', 'Pioneer', 'Boon Lay', 'Lakeside'],
  },
};

const initialState = {
  name: '',
  description: '',
  address: { city: '', state: '', country: '' },
  phone: '',
  email: '',
  status: 'active',
  amenities: [],
  policies: [],
};

function HotelForm() {
  const [hotel, setHotel] = useState(initialState);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [policies, setPolicies] = useState([]);
  
  // Cascading dropdown states
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const clearFieldError = (field) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    // Fetch amenities and policies for dropdowns
    const fetchDropdownData = async () => {
      try {
        const [amenitiesData, policiesData] = await Promise.all([
          HotelService.getAllAmenities(),
          HotelService.getAllPolicies()
        ]);
        setAmenities(amenitiesData);
        setPolicies(policiesData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      HotelService.getHotelById(id)
        .then((data) => {
          const country = data.address?.country || '';
          const state = data.address?.state || '';
          const city = data.address?.city || '';
          
          // Set available states and cities for editing
          if (country && locationData[country]) {
            setAvailableStates(Object.keys(locationData[country]));
            if (state && locationData[country][state]) {
              setAvailableCities(locationData[country][state]);
            }
          }
          
          setHotel({
            ...data,
            address: { city, state, country },
            amenities: data.amenities || [],
            policies: data.policies || [],
          });
          setImagePreview(data.main_image ? `${process.env.REACT_APP_API_URL || ''}${data.main_image}` : null);
        })
        .catch(() => setError('Failed to load hotel'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Handle country change - update available states
  const handleCountryChange = (e) => {
    const country = e.target.value;
    clearFieldError('country');
    clearFieldError('state');
    clearFieldError('city');
    
    if (country && locationData[country]) {
      setAvailableStates(Object.keys(locationData[country]));
    } else {
      setAvailableStates([]);
    }
    setAvailableCities([]);
    setHotel((prev) => ({
      ...prev,
      address: { country, state: '', city: '' }
    }));
  };

  // Handle state change - update available cities
  const handleStateChange = (e) => {
    const state = e.target.value;
    const country = hotel.address.country;
    clearFieldError('state');
    clearFieldError('city');
    
    if (country && state && locationData[country]?.[state]) {
      setAvailableCities(locationData[country][state]);
    } else {
      setAvailableCities([]);
    }
    setHotel((prev) => ({
      ...prev,
      address: { ...prev.address, state, city: '' }
    }));
  };

  // Handle city change
  const handleCityChange = (e) => {
    const city = e.target.value;
    clearFieldError('city');
    setHotel((prev) => ({
      ...prev,
      address: { ...prev.address, city }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    setHotel((prev) => ({ ...prev, [name]: value }));
  };

  // Handle phone input - allow only digits
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    clearFieldError('phone');
    setHotel((prev) => ({ ...prev, phone: digitsOnly }));
  };

  const handleMultiSelectChange = (e, field) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    clearFieldError(field);
    setHotel((prev) => ({ ...prev, [field]: selectedOptions }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    clearFieldError('main_image');
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!hotel.name?.trim()) {
      errors.name = 'Name is required';
    } else if (hotel.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    // Description validation (optional)
    // if (!hotel.description?.trim()) {
    //   errors.description = 'Description is required';
    // }

    // Country validation
    if (!hotel.address.country) {
      errors.country = 'Please select a country';
    }
    
    // State validation
    if (!hotel.address.state) {
      errors.state = 'Please select a state';
    }
    
    // City validation
    if (!hotel.address.city) {
      errors.city = 'Please select a city';
    }

    // Phone validation - must be digits only and 10 digits for India
    if (!hotel.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(hotel.phone)) {
      errors.phone = 'Phone number must contain only digits';
    } else if (hotel.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    } else if (hotel.phone.length > 15) {
      errors.phone = 'Phone number cannot exceed 15 digits';
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!hotel.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!emailPattern.test(hotel.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    // Amenities validation
    if (!hotel.amenities || hotel.amenities.length === 0) {
      errors.amenities = 'Select at least one amenity';
    }

    // Policies validation
    if (!hotel.policies || hotel.policies.length === 0) {
      errors.policies = 'Select at least one policy';
    }

    // Image validation for new hotels
    if (!isEdit && !image) {
      errors.main_image = 'Main image is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', hotel.name);
      formData.append('description', hotel.description);
      formData.append('phone', hotel.phone);
      formData.append('email', hotel.email);
      formData.append('status', hotel.status);
      formData.append('address[city]', hotel.address.city);
      formData.append('address[state]', hotel.address.state);
      formData.append('address[country]', hotel.address.country);
      
      // Append amenities and policies arrays
      hotel.amenities.forEach(amenityId => {
        formData.append('amenities[]', amenityId);
      });
      hotel.policies.forEach(policyId => {
        formData.append('policies[]', policyId);
      });
      
      if (image) {
        formData.append('main_image', image);
      }
      if (isEdit) {
        await HotelService.updateHotel(id, formData);
      } else {
        await HotelService.createHotel(formData);
      }
      navigate('/admin/hotels');
    } catch (err) {
      setError('Failed to save hotel');
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = {
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-color)'
  };

  return (
    <div className="p-8 max-w-xl mx-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Hotel' : 'Add Hotel'}</h1>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 p-6 rounded shadow transition-colors" 
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
        encType="multipart/form-data"
      >
        {/* Name Field */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name *</label>
          <input
            type="text"
            name="name"
            value={hotel.name}
            onChange={handleChange}
            placeholder="Enter hotel name"
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.name ? 'border-red-500' : ''}`}
            style={selectStyles}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
          <textarea
            name="description"
            value={hotel.description}
            onChange={handleChange}
            placeholder="Enter hotel description"
            rows={3}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={selectStyles}
          />
        </div>

        {/* Location Dropdowns - Country, State, City */}
        <div className="space-y-4">
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Location *</h3>
          
          {/* Country Dropdown */}
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Country</label>
            <select
              name="country"
              value={hotel.address.country}
              onChange={handleCountryChange}
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.country ? 'border-red-500' : ''}`}
              style={selectStyles}
            >
              <option value="">-- Select Country --</option>
              {Object.keys(locationData).map((country) => (
                <option key={country} value={country} style={selectStyles}>
                  {country}
                </option>
              ))}
            </select>
            {validationErrors.country && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.country}</p>
            )}
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>State</label>
            <select
              name="state"
              value={hotel.address.state}
              onChange={handleStateChange}
              disabled={!hotel.address.country}
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.state ? 'border-red-500' : ''} ${!hotel.address.country ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={selectStyles}
            >
              <option value="">-- Select State --</option>
              {availableStates.map((state) => (
                <option key={state} value={state} style={selectStyles}>
                  {state}
                </option>
              ))}
            </select>
            {validationErrors.state && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.state}</p>
            )}
            {!hotel.address.country && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Please select a country first</p>
            )}
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>City</label>
            <select
              name="city"
              value={hotel.address.city}
              onChange={handleCityChange}
              disabled={!hotel.address.state}
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.city ? 'border-red-500' : ''} ${!hotel.address.state ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={selectStyles}
            >
              <option value="">-- Select City --</option>
              {availableCities.map((city) => (
                <option key={city} value={city} style={selectStyles}>
                  {city}
                </option>
              ))}
            </select>
            {validationErrors.city && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.city}</p>
            )}
            {!hotel.address.state && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Please select a state first</p>
            )}
          </div>
        </div>

        {/* Phone Field - Integer Only */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={hotel.phone}
            onChange={handlePhoneChange}
            placeholder="Enter phone number (digits only)"
            maxLength={15}
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.phone ? 'border-red-500' : ''}`}
            style={selectStyles}
          />
          {validationErrors.phone && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
          )}
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Only numbers allowed (10-15 digits)</p>
        </div>

        {/* Email Field */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email *</label>
          <input
            type="email"
            name="email"
            value={hotel.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.email ? 'border-red-500' : ''}`}
            style={selectStyles}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Amenities Multi-select */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Amenities *</label>
          <select 
            multiple 
            name="amenities"
            value={hotel.amenities}
            onChange={(e) => handleMultiSelectChange(e, 'amenities')}
            className={`w-full border px-3 py-2 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.amenities ? 'border-red-500' : ''}`}
            style={selectStyles}
          >
            {amenities.map((amenity) => (
              <option key={amenity._id} value={amenity._id} style={selectStyles}>
                {amenity.name}
              </option>
            ))}
          </select>
          {validationErrors.amenities && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.amenities}</p>
          )}
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hold Ctrl (or Cmd on Mac) to select multiple amenities</p>
        </div>

        {/* Policies Multi-select */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Policies *</label>
          <select 
            multiple 
            name="policies"
            value={hotel.policies}
            onChange={(e) => handleMultiSelectChange(e, 'policies')}
            className={`w-full border px-3 py-2 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.policies ? 'border-red-500' : ''}`}
            style={selectStyles}
          >
            {policies.map((policy) => (
              <option key={policy._id} value={policy._id} style={selectStyles}>
                {policy.title}
              </option>
            ))}
          </select>
          {validationErrors.policies && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.policies}</p>
          )}
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hold Ctrl (or Cmd on Mac) to select multiple policies</p>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
          <select
            name="status"
            value={hotel.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={selectStyles}
          >
            <option value="active" style={selectStyles}>Available</option>
            <option value="inactive" style={selectStyles}>Not Available</option>
            <option value="maintenance" style={selectStyles}>Under Maintenance</option>
          </select>
        </div>

        {/* Main Image Upload */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Main Image {isEdit ? '' : '*'}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.main_image ? 'border-red-500' : ''}`}
            style={selectStyles}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border transition-colors" style={{ borderColor: 'var(--border-color)' }} />
          )}
          {validationErrors.main_image && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.main_image}</p>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Hotel' : 'Add Hotel'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-input)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onClick={() => navigate('/admin/hotels')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default HotelForm;
