// Import hotel images
import hotel1 from "../HotelModule/ImagesHotel/HotelImage1.svg";
import hotel2 from "../HotelModule/ImagesHotel/hotel2.svg";
import hotel3 from "../HotelModule/ImagesHotel/hotel3.svg";


// Hotel data for each city
const HOTEL_DATA = {
    'mumbai': [
        {
            id: 'taj-mahal-palace',
            name: 'The Taj Mahal Palace',
            rating: 5,
            price: 25000,
            location: 'Apollo Bunder, Mumbai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'Beach View', 'Butler Service', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Historic luxury hotel with stunning views of the Gateway of India and Arabian Sea. Features world-class restaurants and a rooftop pool.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 1250,
            reviewScore: 9.5,
            latitude: 18.9217,
            longitude: 72.8347
        },
        {
            id: 'oberoi-mumbai',
            name: 'The Oberoi Mumbai',
            rating: 5,
            price: 22000,
            location: 'Nariman Point, Mumbai',
            amenities: ['Infinity Pool', 'Luxury Spa', 'Rooftop Bar', 'City View', 'Butler Service', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel2,
            description: 'Contemporary luxury hotel with panoramic views of the city and Arabian Sea. Features award-winning restaurants and a rooftop infinity pool.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 980,
            reviewScore: 9.3,
            latitude: 18.9276,
            longitude: 72.8275
        },
        {
            id: 'st-regis-mumbai',
            name: 'The St. Regis Mumbai',
            rating: 5,
            price: 20000,
            location: 'Lower Parel, Mumbai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Butler Service', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel3,
            description: 'Modern luxury hotel in the heart of Mumbai\'s business district. Features signature St. Regis butler service and elegant dining options.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 850,
            reviewScore: 9.2,
            latitude: 18.9982,
            longitude: 72.8270
        },
        {
            id: 'trident-mumbai',
            name: 'Trident Nariman Point',
            rating: 5,
            price: 18000,
            location: 'Nariman Point, Mumbai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Beach Access', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Elegant hotel with stunning views of the Arabian Sea. Features multiple dining options and a luxurious spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 720,
            reviewScore: 9.0,
            latitude: 18.9276,
            longitude: 72.8275
        }
    ],
    'delhi': [
        {
            id: 'oberoi-delhi',
            name: 'The Oberoi New Delhi',
            rating: 5,
            price: 20000,
            location: 'Dr. Zakir Hussain Marg, Delhi',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Butler Service', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel2,
            description: 'Luxury hotel in the heart of Delhi with stunning views of the city. Features award-winning restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 1100,
            reviewScore: 9.4,
            latitude: 28.6139,
            longitude: 77.2090
        },
        {
            id: 'leela-palace-delhi',
            name: 'The Leela Palace New Delhi',
            rating: 5,
            price: 22000,
            location: 'Diplomatic Enclave, Delhi',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Butler Service', 'Garden View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel3,
            description: 'Palatial luxury hotel with beautiful gardens and elegant architecture. Features multiple fine dining restaurants and a luxurious spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 950,
            reviewScore: 9.3,
            latitude: 28.5925,
            longitude: 77.1865
        },
        {
            id: 'taj-mahal-delhi',
            name: 'Taj Mahal Hotel New Delhi',
            rating: 5,
            price: 19000,
            location: 'Mansingh Road, Delhi',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Historic luxury hotel in the heart of Delhi. Features iconic restaurants and a world-class spa experience.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 880,
            reviewScore: 9.2,
            latitude: 28.6129,
            longitude: 77.2295
        },
        {
            id: 'itc-maurya',
            name: 'ITC Maurya',
            rating: 5,
            price: 18000,
            location: 'Diplomatic Enclave, Delhi',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel2,
            description: 'Luxury hotel known for its iconic restaurants and elegant architecture. Features a world-class spa and business facilities.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 820,
            reviewScore: 9.1,
            latitude: 28.5925,
            longitude: 77.1865
        }
    ],
    'bangalore': [
        {
            id: 'oberoi-bangalore',
            name: 'The Oberoi Bangalore',
            rating: 5,
            price: 18000,
            location: 'MG Road, Bangalore',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel3,
            description: 'Contemporary luxury hotel in the heart of Bangalore. Features award-winning restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 920,
            reviewScore: 9.3,
            latitude: 12.9716,
            longitude: 77.5946
        },
        {
            id: 'taj-west-end',
            name: 'Taj West End',
            rating: 5,
            price: 16000,
            location: 'Race Course Road, Bangalore',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Garden', 'Historic Building', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Historic luxury hotel with beautiful gardens. Features elegant dining options and a luxurious spa experience.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 780,
            reviewScore: 9.1,
            latitude: 12.9784,
            longitude: 77.6408
        },
        {
            id: 'leela-palace-bangalore',
            name: 'The Leela Palace Bangalore',
            rating: 5,
            price: 20000,
            location: 'Old Airport Road, Bangalore',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Butler Service', 'Garden View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel2,
            description: 'Palatial luxury hotel with beautiful gardens. Features multiple fine dining restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 850,
            reviewScore: 9.2,
            latitude: 12.9716,
            longitude: 77.5946
        },
        {
            id: 'four-seasons-bangalore',
            name: 'Four Seasons Hotel Bangalore',
            rating: 5,
            price: 17000,
            location: 'Bellary Road, Bangalore',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel3,
            description: 'Modern luxury hotel with stunning city views. Features award-winning restaurants and a world-class spa experience.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 720,
            reviewScore: 9.0,
            latitude: 13.0827,
            longitude: 77.5857
        }
    ],
    'hyderabad': [
        {
            id: 'taj-falaknuma',
            name: 'Taj Falaknuma Palace',
            rating: 5,
            price: 25000,
            location: 'Falaknuma, Hyderabad',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Palace Tour', 'Historic Building', 'Butler Service', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Historic palace hotel with stunning architecture. Features royal dining experiences and a luxurious spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 680,
            reviewScore: 9.4,
            latitude: 17.3850,
            longitude: 78.4867
        },
        {
            id: 'park-hyderabad',
            name: 'Park Hyatt Hyderabad',
            rating: 5,
            price: 15000,
            location: 'HITEC City, Hyderabad',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge', 'Meeting Rooms'],
            image: hotel2,
            description: 'Contemporary luxury hotel in Hyderabad\'s tech hub. Features award-winning restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 620,
            reviewScore: 9.2,
            latitude: 17.4454,
            longitude: 78.3498
        },
        {
            id: 'taj-krishna',
            name: 'Taj Krishna',
            rating: 5,
            price: 12000,
            location: 'Banjara Hills, Hyderabad',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel3,
            description: 'Elegant luxury hotel in the heart of Hyderabad. Features multiple dining options and a luxurious spa experience.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 580,
            reviewScore: 9.1,
            latitude: 17.3850,
            longitude: 78.4867
        },
        {
            id: 'novotel-hyderabad',
            name: 'Novotel Hyderabad Airport',
            rating: 4,
            price: 8000,
            location: 'Airport Road, Hyderabad',
            amenities: ['Swimming Pool', 'Spa', 'Airport Shuttle', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Modern hotel near the airport with convenient access. Features comfortable rooms and essential amenities.',
            roomTypes: ['Standard Room', 'Executive Room', 'Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 420,
            reviewScore: 8.5,
            latitude: 17.3850,
            longitude: 78.4867
        }
    ],
    'chennai': [
        {
            id: 'taj-connemara',
            name: 'Taj Connemara',
            rating: 5,
            price: 15000,
            location: 'Binny Road, Chennai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'Historic Building', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Historic luxury hotel in the heart of Chennai. Features elegant colonial architecture and world-class amenities.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 850,
            reviewScore: 9.2,
            latitude: 13.0827,
            longitude: 80.2707
        },
        {
            id: 'leela-palace-chennai',
            name: 'The Leela Palace Chennai',
            rating: 5,
            price: 18000,
            location: 'Adyar, Chennai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Butler Service', 'Marina View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel2,
            description: 'Luxury hotel with stunning views of the Bay of Bengal. Features multiple fine dining restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '15:00',
            checkOut: '12:00',
            reviews: 920,
            reviewScore: 9.3,
            latitude: 13.0067,
            longitude: 80.2567
        },
        {
            id: 'itc-grand-chola',
            name: 'ITC Grand Chola',
            rating: 5,
            price: 16000,
            location: 'Guindy, Chennai',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel3,
            description: 'Grand luxury hotel inspired by Chola dynasty architecture. Features multiple award-winning restaurants and extensive business facilities.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 880,
            reviewScore: 9.1,
            latitude: 13.0067,
            longitude: 80.2567
        },
        {
            id: 'park-hotel-chennai',
            name: 'The Park Chennai',
            rating: 4,
            price: 12000,
            location: 'Nungambakkam, Chennai',
            amenities: ['Swimming Pool', 'Spa', 'Rooftop Bar', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service'],
            image: hotel1,
            description: 'Contemporary luxury hotel in the heart of Chennai. Features a rooftop bar and modern amenities.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 750,
            reviewScore: 8.9,
            latitude: 13.0604,
            longitude: 80.2494
        }
    ],
    'kochi': [
        {
            id: 'kochi-marine-drive',
            name: 'Marine Drive',
            rating: 5,
            price: 15000,
            location: 'Marine Drive, Kochi',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Luxury hotel with stunning views of the Arabian Sea. Features multiple dining options and a luxurious spa experience.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 720,
            reviewScore: 9.0,
            latitude: 9.9312,
            longitude: 76.2673
        }
    ],
    'gujarat': [
        {
            id: 'gujarat-ahmedabad',
            name: 'Ahmedabad',
            rating: 5,
            price: 18000,
            location: 'Ahmedabad, Gujarat',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel1,
            description: 'Luxury hotel in the heart of Ahmedabad. Features award-winning restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 920,
            reviewScore: 9.3,
            latitude: 23.0225,
            longitude: 72.5714
        },
        {
            id: 'gujarat-surat',
            name: 'Surat',
            rating: 5,
            price: 16000,
            location: 'Surat, Gujarat',
            amenities: ['Swimming Pool', 'Luxury Spa', 'Fine Dining', 'City View', 'Business Center', 'Fitness Center', 'Valet Parking', '24/7 Room Service', 'Concierge'],
            image: hotel2,
            description: 'Contemporary luxury hotel in the heart of Surat. Features award-winning restaurants and a world-class spa.',
            roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
            checkIn: '14:00',
            checkOut: '12:00',
            reviews: 850,
            reviewScore: 9.2,
            latitude: 21.1702,
            longitude: 72.8311
        }
    ]
};

const LOCATIONIQ_API_KEY = 'pk.351516f78852b1514e896c713ccfb032';

// API Functions
export const searchLocations = async (query) => {
    try {
        // Simulate API delay
        // await new Promise(resolve => setTimeout(resolve, 300));

        if (!query) return [];

        const url = `https://us1.locationiq.com/v1/autocomplete.php?key=pk.351516f78852b1514e896c713ccfb032&q=${encodeURIComponent(query)}&tag=place:city,place:town,place:village&countrycodes=in&limit=10&format=json`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();

        // Format data to match the previous structure
        const results = data.map(place => ({
            id: place.place_id,
            name: place.address?.name || place.display_name.split(',')[0],
            fullName: place.display_name,
            type: place.type === 'city' ? 'city' : 'area'
        }));
        
        return results;
    } catch (error) {
        console.error('Error searching locations:', error);
        return [];
    }
};

export const getHotelsByCity = async (cityId) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Convert cityId to lowercase for case-insensitive matching
        const normalizedCityId = cityId.toLowerCase();
        
        // Find the matching city in HOTEL_DATA
        const cityHotels = HOTEL_DATA[normalizedCityId];
        
        if (!cityHotels) {
            console.log(`No hotels found for city: ${cityId}`);
            return null;
        }

        return cityHotels;
    } catch (error) {
        console.error('Error getting hotels by city:', error);
        return null;
    }
};

export const searchHotels = async (query) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const results = [];
    Object.values(HOTEL_DATA).forEach(hotels => {
        hotels.forEach(hotel => {
            if (
                hotel.name.toLowerCase().includes(query.toLowerCase()) ||
                hotel.location.toLowerCase().includes(query.toLowerCase())
            ) {
                results.push(hotel);
            }
        });
    });

    return results;
};

export const getHotelDetails = async (hotelId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    for (const hotels of Object.values(HOTEL_DATA)) {
        const hotel = hotels.find(h => h.id === hotelId);
        if (hotel) {
            return hotel;
        }
    }

    throw new Error('Hotel not found');
};

export const getPopularLocations = async () => {
    try {
        // Return a static list of popular cities as we don't have a dedicated endpoint for this
        return [
            { id: 'mumbai', name: 'Mumbai', fullName: 'Mumbai, Maharashtra', type: 'city' },
            { id: 'delhi', name: 'Delhi', fullName: 'Delhi, NCR', type: 'city' },
            { id: 'bangalore', name: 'Bangalore', fullName: 'Bangalore, Karnataka', type: 'city' },
            { id: 'hyderabad', name: 'Hyderabad', fullName: 'Hyderabad, Telangana', type: 'city' },
            { id: 'chennai', name: 'Chennai', fullName: 'Chennai, Tamil Nadu', type: 'city' },
            { id: 'kochi', name: 'Kochi', fullName: 'Kochi, Kerala', type: 'city' },
            { id: 'gujarat', name: 'Gujarat', fullName: 'Gujarat', type: 'state' },
        ];
    } catch (error) {
        console.error('Error getting popular locations:', error);
        return [];
    }
};

export const cancelBooking = async (bookingDetails, reason) => {
    try {
        // Simulate API call
        console.log("Submitting cancellation to the vendor backend...");
        console.log("Booking Details:", bookingDetails);
        console.log("Cancellation Reason:", reason);

        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("Backend confirmed cancellation.");
                resolve({ success: true, message: "Booking cancelled successfully." });
            }, 1500); // Simulate 1.5 second network delay
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, message: 'An error occurred while cancelling the booking.' };
    }
}; 