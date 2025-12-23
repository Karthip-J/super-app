import React, { useState, useEffect } from "react";
import bannerClothes from "../Images/HomeScreen/bannerClothes.png";
import bannerHotel from "../Images/HomeScreen/bannerHotel.png";
import bannerFood from "../Images/HomeScreen/bannerFood.png";
import bannerTaxi from "../Images/HomeScreen/bannerTaxi.png";
import bannerGroceries from "../Images/HomeScreen/bannerGroceries.jpg";
import bannerUrban from "../Images/HomeScreen/bannerUrban.png";
import bannerCityMove from "../Images/HomeScreen/cityMoveBanner.png";
import bellIcon from "../Images/HomeScreen/bellIcon.svg";
import { useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineLocationMarker } from "react-icons/hi";

const banners = [
  { img: bannerUrban, alt: "City Serve", path: "/urban-services" },
  { img: bannerClothes, alt: "E-commerce", path: "/home-clothes" },
  { img: bannerGroceries, alt: "Grocery", path: "/home-grocery" },
  { img: bannerFood, alt: "Food", path: "/home-food" },
  { img: bannerHotel, alt: "Hotel", path: "/home-hotel" },
  { img: bannerTaxi, alt: "Taxi", path: "/home-taxi" },
  {
    img: bannerCityMove,
    alt: "City Move",
    path: "/porter",
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [city, setCity] = useState({
    area: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loadingCity, setLoadingCity] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          setLoadingLocation(false);
        },
        () => {
          setLocationError("Location access denied");
          setLoadingLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation not supported");
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (location && !locationError) {
      setLoadingCity(true);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          const address = data.address;
          const area = address.suburb || address.neighbourhood || "";
          const cityName = address.city || address.town || "";
          const state = address.state || "";
          const pincode = address.postcode || "";
          setCity({ area, city: cityName, state, pincode });
          setLoadingCity(false);
        })
        .catch(() => {
          setCity({ area: "", city: "", state: "", pincode: "" });
          setLoadingCity(false);
        });
    }
  }, [location, locationError]);

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-gradient-to-br from-purple-100 via-white to-blue-100 relative">
      <header className="w-full flex flex-col items-center px-4 py-3 bg-white/60 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <img src={bellIcon} alt='City Bell' className="w-8 h-8 ml-10" />
            <h1 className="text-xl font-extrabold tracking-wide text-purple-700 drop-shadow-sm uppercase">City Bell</h1>
          </div>
        </div>

        <div className="w-full flex items-center gap-2 mt-1 px-10">
          <HiOutlineLocationMarker className="w-5 h-5 text-purple-400" />
          {(loadingLocation || loadingCity) && (
            <span className="text-xs text-gray-500">Detecting location...</span>
          )}
          {!loadingLocation && !loadingCity && (city.area || city.city || city.pincode) && (
            <span className="text-xs text-gray-700 font-medium">
              {city.area && `${city.area}, `}
              {city.city && `${city.city}, `}
              {city.pincode}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4 auto-rows-[140px]">
          {/* Hero Banner: Grocery (Now at the top) */}
          <div
            className="col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer bg-white group border-4 border-white/50"
            onClick={() => navigate("/home-grocery")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-green-700/80 via-transparent to-green-700/20 z-10" />
            <img src={bannerGroceries} alt="Grocery" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
              <h2 className="text-white text-4xl font-black tracking-tighter uppercase drop-shadow-lg leading-none">Grocery</h2>
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-2">Fresh & Local delivered fast</p>
            </div>
          </div>

          {/* Clothes (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/home-clothes")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
            <img src={bannerClothes} alt="E-commerce" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase">E-commerce</h2>
            </div>
          </div>

          {/* Food (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/home-food")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
            <img src={bannerFood} alt="Food" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase">Food</h2>
            </div>
          </div>

          <div
            className="col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/porter")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-600/40 to-transparent z-10" />
            <img src={bannerCityMove} alt="City Move" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-8">
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-none">City Move</h2>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Instant Delivery</p>
            </div>
          </div>

          {/* Hotel (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/home-hotel")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
            <img src={bannerHotel} alt="Hotel" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase">Hotel</h2>
            </div>
          </div>

          {/* Taxi (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/home-taxi")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
            <img src={bannerTaxi} alt="Taxi" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase">Taxi</h2>
            </div>
          </div>

          {/* City Serve (Bottom - Wide Rectangle) */}
          <div
            className="col-span-2 row-span-1 border-2 border-white/30 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer bg-white group"
            onClick={() => navigate("/urban-services")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img src={bannerUrban} alt="City Serve" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-8">
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-none">City Serve</h2>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Experts at your door</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
"// Force deployment update"