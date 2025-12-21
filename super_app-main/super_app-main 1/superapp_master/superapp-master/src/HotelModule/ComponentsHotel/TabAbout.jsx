// import React from 'react'
// import { FaBed, FaBath, FaRulerCombined, FaSnowflake, FaWifi, FaCoffee, FaSwimmingPool, FaWater, FaUtensils, FaUmbrellaBeach, FaUserTie, FaBriefcase, FaDumbbell, FaParking, FaConciergeBell, FaClock, FaBuilding, FaTree, FaCrown, FaShuttleVan, FaHotel } from "react-icons/fa";

// function TabAbout({ hotel }) {
//     const iconColor = "#5C3FFF";
//     // Example mapping for icons to amenities
//     const amenityIcons = {
//         'Swimming Pool': <FaSwimmingPool color={iconColor} size={24} />, // Swimming Pool
//         'Luxury Spa': <FaCrown color={iconColor} size={24} />, // Spa (luxury)
//         'Fine Dining': <FaUtensils color={iconColor} size={24} />, // Fine Dining
//         'Beach View': <FaUmbrellaBeach color={iconColor} size={24} />, // Beach View
//         'Butler Service': <FaUserTie color={iconColor} size={24} />, // Butler Service
//         'Business Center': <FaBriefcase color={iconColor} size={24} />, // Business Center
//         'Fitness Center': <FaDumbbell color={iconColor} size={24} />, // Fitness Center
//         'Valet Parking': <FaParking color={iconColor} size={24} />, // Valet Parking
//         '24/7 Room Service': <FaConciergeBell color={iconColor} size={24} />, // Room Service
//         'Concierge': <FaConciergeBell color={iconColor} size={24} />, // Concierge
//         'Infinity Pool': <FaSwimmingPool color={iconColor} size={24} />, // Infinity Pool
//         'Rooftop Bar': <FaUtensils color={iconColor} size={24} />, // Rooftop Bar (generic)
//         'City View': <FaBuilding color={iconColor} size={24} />, // City View
//         'Meeting Rooms': <FaBriefcase color={iconColor} size={24} />, // Meeting Rooms
//         'Garden': <FaTree color={iconColor} size={24} />, // Garden
//         'Historic Building': <FaBuilding color={iconColor} size={24} />, // Historic Building
//         'Palace Tour': <FaCrown color={iconColor} size={24} />, // Palace Tour
//         'Spa': <FaCrown color={iconColor} size={24} />, // Spa
//         'Airport Shuttle': <FaShuttleVan color={iconColor} size={24} />, // Airport Shuttle
//         'Marina View': <FaWater color={iconColor} size={24} />, // Marina View
//         // Fallbacks and generics
//         'Bed': <FaBed color={iconColor} size={24} />,
//         'Bath': <FaBath color={iconColor} size={24} />,
//         'AC': <FaSnowflake color={iconColor} size={24} />,
//         'WiFi': <FaWifi color={iconColor} size={24} />,
//         'Breakfast': <FaCoffee color={iconColor} size={24} />,
//     };
//     return (
//         <div>
//             <div className="grid grid-cols-3 gap-4 pt-2">
//                 {hotel && hotel.amenities ? hotel.amenities.slice(0, 6).map((amenity, idx) => (
//                     <div className="flex items-center space-x-2" key={idx}>
//                         {/* Try to match icon, fallback to FaBed */}
//                         {amenityIcons[amenity] || <FaBed color={iconColor} size={24} />}
//                         <span className="text-xs font-medium">{amenity}</span>
//                     </div>
//                 )) : (
//                     // fallback placeholders
//                     <>
//                         <div className="flex items-center space-x-2"><FaBed color={iconColor} size={24} /><span>2 Beds</span></div>
//                         <div className="flex items-center space-x-2"><FaBath color={iconColor} size={24} /><span className="text-xs font-medium">1 Bath</span></div>
//                         <div className="flex items-center space-x-2"><FaRulerCombined color={iconColor} size={24} /><span className="text-xs font-medium">2000 sqft</span></div>
//                         <div className="flex items-center space-x-2"><FaSnowflake color={iconColor} size={24} /><span className="text-xs font-medium">AC</span></div>
//                         <div className="flex items-center space-x-2"><FaWifi color={iconColor} size={24} /><span className="text-xs font-medium">Wi fi</span></div>
//                         <div className="flex items-center space-x-2"><FaCoffee color={iconColor} size={24} /><span className="text-xs font-medium">Breakfast</span></div>
//                     </>
//                 )}
//             </div>
//             <div className="text-base font-medium pt-4">Description</div>
//             <div className="text-xs font-normal pt-1">{hotel && hotel.description ? hotel.description : 'No description available.'}</div>
//         </div>
//     )
// }
// export default TabAbout;


import React from 'react';
import {
  FaBed, FaBath, FaRulerCombined, FaSnowflake, FaWifi, FaCoffee,
  FaSwimmingPool, FaWater, FaUtensils, FaUmbrellaBeach, FaUserTie,
  FaBriefcase, FaDumbbell, FaParking, FaConciergeBell, FaBuilding,
  FaTree, FaCrown, FaShuttleVan
} from "react-icons/fa";

function TabAbout({ hotel }) {
  const iconColor = "#5C3FFF";

  // Icon mapping for known amenities
  const amenityIcons = {
    "Swimming Pool": <FaSwimmingPool color={iconColor} size={24} />,
    "Luxury Spa": <FaCrown color={iconColor} size={24} />,
    "Fine Dining": <FaUtensils color={iconColor} size={24} />,
    "Beach View": <FaUmbrellaBeach color={iconColor} size={24} />,
    "Butler Service": <FaUserTie color={iconColor} size={24} />,
    "Business Center": <FaBriefcase color={iconColor} size={24} />,
    "Fitness Center": <FaDumbbell color={iconColor} size={24} />,
    "Valet Parking": <FaParking color={iconColor} size={24} />,
    "24/7 Room Service": <FaConciergeBell color={iconColor} size={24} />,
    "Concierge": <FaConciergeBell color={iconColor} size={24} />,
    "Infinity Pool": <FaSwimmingPool color={iconColor} size={24} />,
    "Rooftop Bar": <FaUtensils color={iconColor} size={24} />,
    "City View": <FaBuilding color={iconColor} size={24} />,
    "Meeting Rooms": <FaBriefcase color={iconColor} size={24} />,
    "Garden": <FaTree color={iconColor} size={24} />,
    "Historic Building": <FaBuilding color={iconColor} size={24} />,
    "Palace Tour": <FaCrown color={iconColor} size={24} />,
    "Spa": <FaCrown color={iconColor} size={24} />,
    "Airport Shuttle": <FaShuttleVan color={iconColor} size={24} />,
    "Marina View": <FaWater color={iconColor} size={24} />,
    "Free Parking": <FaParking color={iconColor} size={24} />,
    "WiFi": <FaWifi color={iconColor} size={24} />,
    "Breakfast": <FaCoffee color={iconColor} size={24} />,
    "AC": <FaSnowflake color={iconColor} size={24} />,
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 pt-2">
        {hotel && hotel.amenities && hotel.amenities.length > 0 ? (
          hotel.amenities.slice(0, 6).map((amenity, idx) => (
            <div className="flex items-center space-x-2" key={idx}>
              {amenityIcons[amenity.name] || <FaBed color={iconColor} size={24} />}
              <span className="text-xs font-medium">{amenity.name}</span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center space-x-2"><FaBed color={iconColor} size={24} /><span className="text-xs font-medium">2 Beds</span></div>
            <div className="flex items-center space-x-2"><FaBath color={iconColor} size={24} /><span className="text-xs font-medium">1 Bath</span></div>
            <div className="flex items-center space-x-2"><FaRulerCombined color={iconColor} size={24} /><span className="text-xs font-medium">2000 sqft</span></div>
            <div className="flex items-center space-x-2"><FaSnowflake color={iconColor} size={24} /><span className="text-xs font-medium">AC</span></div>
            <div className="flex items-center space-x-2"><FaWifi color={iconColor} size={24} /><span className="text-xs font-medium">Wi-Fi</span></div>
            <div className="flex items-center space-x-2"><FaCoffee color={iconColor} size={24} /><span className="text-xs font-medium">Breakfast</span></div>
          </>
        )}
      </div>

      <div className="text-base font-medium pt-4">Description</div>
      <div className="text-xs font-normal pt-1">
        {hotel && hotel.description ? hotel.description : "No description available."}
      </div>
    </div>
  );
}

export default TabAbout;
