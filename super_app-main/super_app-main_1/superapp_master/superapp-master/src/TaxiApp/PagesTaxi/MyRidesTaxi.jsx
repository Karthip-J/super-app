import API_CONFIG from "../../config/api.config.js";
import React, { useEffect, useState } from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import greenLocation from "../ImagesTaxi/gpsgreen.svg";
// import stepper from "../../FoodDilvery/ImagesF/stepperfortrackorderfood.svg";
import axios from 'axios';

function MyRidesTaxi() {
    const [rides, setRides] = useState([]);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        async function fetchRides() {
            setApiError('');
            try {
                const token = localStorage.getItem('token');
                
                // If no token, don't make the API call to avoid demo token issues
                if (!token) {
                    setRides([]);
                    return;
                }
                
                const res = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.MY_RIDES), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    // Optionally filter by user_id if needed
                    setRides(res.data.data);
                } else {
                    setApiError('Failed to fetch rides from API.');
                }
            } catch (err) {
                setApiError('Failed to fetch rides from API.');
            }
        }
        fetchRides();
    }, []);

    const handleCancelRide = (idx) => {
        if (!window.confirm('Are you sure you want to cancel this ride?')) return;
        setRides(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], status: 'cancelled' };
            localStorage.setItem('taxiRides', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <HeaderInsideTaxi />
            <div className='px-4 pt-24 pb-[64px]'>
                <div className='font-medium text-base mb-2'>My Rides</div>
                {apiError && <div style={{ color: 'orange', fontSize: 14 }}>{apiError}</div>}
                {rides.length === 0 ? (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-4 text-center text-gray-500'>
                        No rides found. Book a ride to see it here!
                    </div>
                ) : (
                    rides.map((ride, idx) => (
                        <div key={idx} className='bg-white border border-[#E1E1E1] rounded-[20px] p-4 mt-2'>
                            <div className='flex items-center gap-3 mb-2'>
                                <img src={ride.driver?.photo || "https://randomuser.me/api/portraits/men/32.jpg"} alt='Driver' className='w-12 h-12 rounded-full border-2 border-green-400' />
                                <div className='text-left'>
                                    <div className='font-semibold'>{ride.driver?.name || 'Your Captain'}</div>
                                    <div className='text-xs text-gray-500'>{ride.driver?.vehicle || ''} {ride.driver?.vehicleNumber ? '• ' + ride.driver.vehicleNumber : ''}</div>
                                </div>
                                <div className={`ml-auto rounded-full px-4 py-2 text-xs font-medium flex items-center justify-center ${ride.status === 'completed' ? 'bg-[#5C3FFF] text-white' : ride.status === 'cancelled' ? 'bg-[#FB3E3E] text-white' : 'bg-gray-300 text-gray-700'}`}>
                                    {ride.status || 'completed'}
                                </div>
                                {/* Cancel icon for active rides */}
                                {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                                    <button
                                        className='ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition-colors'
                                        title='Cancel Ride'
                                        onClick={() => handleCancelRide(idx)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className='mb-2 text-left'>
                                <div><span className='font-semibold'>From:</span> {ride.pickup_location?.address || 'N/A'}</div>
                                <div><span className='font-semibold'>To:</span> {ride.dropoff_location?.address || 'N/A'}</div>
                                <div><span className='font-semibold'>Date:</span> {ride.completed_at ? new Date(ride.completed_at).toLocaleString() : (ride.createdAt ? new Date(ride.createdAt).toLocaleString() : 'N/A')}</div>
                                <div><span className='font-semibold'>Payment:</span> {ride.payment_method ? ride.payment_method.charAt(0).toUpperCase() + ride.payment_method.slice(1) : 'N/A'}</div>
                            </div>
                            <div className='flex justify-between items-center'>
                                <div className='text-xs text-gray-500'>{ride.date}</div>
                                <div className='text-base text-[#1E293B] font-bold'>₹{ride.totalFare || ride.fare || 'N/A'}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <FooterTaxi />
        </div>
    );
}

export default MyRidesTaxi