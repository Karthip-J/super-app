import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import Map from '../ComponentsTaxi/Map';
import profilePic from '../../Clothes/Images/profilepic.svg';

export default function RideCompleted() {
    const location = useLocation();
    const navigate = useNavigate();
    const ride = location.state?.ride || {};
    const [rating, setRating] = useState(0);

    // Defensive vehicle info rendering
    function getVehicleType(driver) {
        if (!driver) return 'N/A';
        if (typeof driver.vehicle === 'string') return driver.vehicle;
        if (driver.vehicle && typeof driver.vehicle === 'object') {
            return [driver.vehicle.make, driver.vehicle.model].filter(Boolean).join(' ') || driver.vehicle.vehicle_number || 'N/A';
        }
        return driver.vehicle_make || 'N/A';
    }
    function getVehicleNumber(driver) {
        if (!driver) return 'N/A';
        if (typeof driver.vehicleNumber === 'string') return driver.vehicleNumber;
        if (driver.vehicle && typeof driver.vehicle === 'object') {
            return driver.vehicle.vehicle_number || driver.vehicleNumber || 'N/A';
        }
        return driver.vehicleNumber || 'N/A';
    }

    // Use dynamic driver info from ride
    const driver = ride.driver || {};
    const vehicleType = getVehicleType(driver);
    const vehicleNumber = getVehicleNumber(driver);

    // Map center (midpoint of pickup/drop if both available)
    let mapCenter = { lat: 13.0827, lng: 80.2707 };
    if (ride.pickupCoordinates && ride.dropCoordinates) {
        mapCenter = {
            lat: (ride.pickupCoordinates.lat + ride.dropCoordinates.lat) / 2,
            lng: (ride.pickupCoordinates.lng + ride.dropCoordinates.lng) / 2,
        };
    }

    useEffect(() => {
        if (!location.state?.ride) {
            navigate('/home-taxi', { replace: true });
        }
        // Replace history so back does not return to ride flow
        window.history.replaceState({}, '', '/home-taxi');
    }, [location.state, navigate]);

    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
            <HeaderInsideTaxi />
            <div className='flex-1 w-full flex flex-col items-center justify-center px-2 pt-20 pb-4'>
                <div className='bg-white rounded-2xl shadow-lg p-4 w-full max-w-[420px] min-h-[80vh] flex flex-col justify-center items-center'>
                    <div className='text-5xl mb-2 text-green-500'>✔️</div>
                    <h2 className='text-lg font-bold mb-1'>Ride Completed!</h2>
                    <div className='mb-3 text-gray-600 text-sm'>Thank you for riding with us.</div>
                    {/* Driver/Captain Info */}
                    <div className='flex items-center gap-3 mb-3 justify-center'>
                        <img src={driver.photo || profilePic} alt='Driver' className='w-12 h-12 rounded-full border-2 border-green-400' />
                        <div className='text-left'>
                            <div className='font-semibold text-base'>{driver.name || 'Driver'}</div>
                            <div className='text-xs text-gray-500'>{vehicleType} • {vehicleNumber}</div>
                            {driver.license && <div className='text-xs text-gray-400'>License: {driver.license}</div>}
                            {driver.rating && <div className='text-xs text-yellow-600'>Rating: {driver.rating} ⭐</div>}
                        </div>
                    </div>
                    {/* Ride summary */}
                    <div className='mb-3 text-left w-full text-sm'>
                        <div><span className='font-semibold'>From:</span> {ride.pickup_location?.address || 'N/A'}</div>
                        <div><span className='font-semibold'>To:</span> {ride.dropoff_location?.address || 'N/A'}</div>
                        <div><span className='font-semibold'>Date:</span> {ride.completed_at ? new Date(ride.completed_at).toLocaleString() : (ride.createdAt ? new Date(ride.createdAt).toLocaleString() : 'N/A')}</div>
                        <div><span className='font-semibold'>Fare:</span> ₹{ride.totalFare || ride.fare || 'N/A'}</div>
                        <div><span className='font-semibold'>Payment Method:</span> {ride.payment_method ? ride.payment_method.charAt(0).toUpperCase() + ride.payment_method.slice(1) : 'N/A'}</div>
                    </div>
                    {/* Interactive rating */}
                    <div className='mb-3 w-full'>
                        <div className='font-semibold mb-1 text-sm'>Rate your ride:</div>
                        <div className='flex justify-center gap-1 mb-2'>
                            {[1,2,3,4,5].map(star => (
                                <span
                                    key={star}
                                    style={{fontSize:'1.5em',cursor:'pointer',color:rating>=star?'#facc15':'#ddd'}}
                                    onClick={()=>setRating(star)}
                                >⭐</span>
                            ))}
                        </div>
                    </div>
                    <button
                        className='w-full bg-yellow-500 text-black py-3 rounded-xl text-base font-bold shadow-lg mt-2 mb-2'
                        onClick={() => navigate('/home-taxi')}
                    >
                        Go to Home
                    </button>
                    <button
                        className='w-full bg-blue-500 text-white py-3 rounded-xl text-base font-bold shadow-lg mb-6'
                        onClick={() => navigate('/select-location')}
                    >
                        Book Another Ride
                    </button>
                </div>
            </div>
            <FooterTaxi />
        </div>
    );
} 