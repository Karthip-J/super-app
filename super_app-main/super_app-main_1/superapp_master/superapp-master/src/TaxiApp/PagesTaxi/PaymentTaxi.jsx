import React, { useState } from 'react';
import step3 from "../ImagesTaxi/paymentSingleIcon.svg";
import phonepay from "../../Clothes/Images/phonepay.svg";
import paytm from "../../Clothes/Images/paytm.svg";
import amazon from "../../Clothes/Images/amazonpay.svg";
import mobikwik from "../../Clothes/Images/mobikwik.svg";
import restricted from "../../Clothes/Images/mobikrestricted.svg";
import credit from "../../Clothes/Images/creditdebit.svg";
import hdfc from "../../Clothes/Images/hdfc.svg";
import icici from "../../Clothes/Images/icici.svg";
import sbi from "../../Clothes/Images/sbi.svg";
import axis from "../../Clothes/Images/axis.svg";
import kotak from "../../Clothes/Images/kotak.svg";
import cod from "../../Clothes/Images/COD.svg";
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import paymentService from "../../services/paymentService";

function PaymentTaxi() {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride || {};
    const [selectedMethod, setSelectedMethod] = useState("");
    const [error, setError] = useState("");
    const [showAddCard, setShowAddCard] = useState(false);
    const [cards, setCards] = useState([]); // [{number, name, expiry}]
    const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [cardError, setCardError] = useState("");
    const [selectedBank, setSelectedBank] = useState("");
    const banks = [
        { name: 'HDFC', icon: hdfc },
        { name: 'ICICI', icon: icici },
        { name: 'SBI', icon: sbi },
        { name: 'Axis', icon: axis },
        { name: 'Kotak', icon: kotak },
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            setError("Please select a payment method.");
            return;
        }
        if (selectedMethod === 'Net Banking' && !selectedBank) {
            setError("Please select a bank for Net Banking.");
            return;
        }
        setError("");

        // For Razorpay payment
        if (selectedMethod === 'Razorpay') {
            try {
                const paymentData = {
                    amount: ride.totalFare || 1100,
                    currency: 'INR',
                    order_model: 'TaxiRide',
                    order_data: {
                        user_id: ride.user_id || '507f1f77bcf86cd799439011', // Default user ID
                        driver_id: ride.driver_id || '507f1f77bcf86cd799439011',
                        vehicle_id: ride.vehicle_id || '507f1f77bcf86cd799439012',
                        pickup_location: ride.pickup_location || {
                            address: ride.pickup || 'Default Pickup',
                            latitude: 0,
                            longitude: 0
                        },
                        dropoff_location: ride.dropoff_location || {
                            address: ride.dropoff || 'Default Dropoff',
                            latitude: 0,
                            longitude: 0
                        },
                        distance: ride.distance || 0,
                        duration: ride.duration || 0,
                        fare: ride.totalFare || 1100
                    },
                    email: ride.email || 'user@example.com',
                    contact: ride.contact || '9999999999'
                };

                await paymentService.processPayment(paymentData, {
                    onSuccess: (successData) => {
                        console.log('✅ Taxi payment successful:', successData);
                        navigate("/ride-completed", {
                            state: {
                                ride: {
                                    ...ride,
                                    paymentMethod: 'Razorpay',
                                    date: new Date().toLocaleString(),
                                    paymentId: successData.payment_id
                                }
                            }
                        });
                    },
                    onError: (error) => {
                        console.error('❌ Taxi payment failed:', error);
                        setError('Payment failed: ' + error.message);
                    },
                    onCancel: () => {
                        console.log('🚫 Taxi payment cancelled');
                        setError('Payment was cancelled');
                    }
                });
            } catch (error) {
                console.error('❌ Taxi payment error:', error);
                setError('Payment error: ' + error.message);
            }
        } else {
            // For other payment methods, navigate directly
            navigate("/ride-completed", {
                state: {
                    ride: {
                        ...ride,
                        paymentMethod: selectedMethod === 'Net Banking' ? `${selectedMethod} - ${selectedBank}` : selectedMethod,
                        date: new Date().toLocaleString()
                    }
                }
            });
        }
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        // Validate card number
        if (!/^\d{16}$/.test(cardForm.number)) {
            setCardError("Card number must be 16 digits.");
            return;
        }
        // Validate expiry MM/YY
        if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
            setCardError("Expiry must be in MM/YY format.");
            return;
        }
        // Validate CVV
        if (!/^\d{3}$/.test(cardForm.cvv)) {
            setCardError("CVV must be 3 digits.");
            return;
        }
        setCardError("");
        setCards([...cards, { ...cardForm }]);
        setCardForm({ number: '', name: '', expiry: '', cvv: '' });
        setShowAddCard(false);
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen flex justify-center items-start'>
            <div className='w-full max-w-sm bg-white rounded-xl shadow-lg mt-4 mb-4 overflow-y-auto' style={{ minHeight: '90vh', maxHeight: '98vh' }}>
                <HeaderInsideTaxi />
                <div className='py-4'>
                    <img src={step3} alt="" className='w-full h-[52px] mt-20 px-6' />
                </div>
                <div className='px-4 pb-[64px]'>
                    <div className="bg-[#F1EDFF] flex justify-between items-center w-full rounded-full px-4 py-3 mt-1 border border-[#E7E7E7]">
                        <p className='font-medium text-base'>Total Amount</p>
                        <p className="font-medium text-base">
                            ₹ {ride.totalFare || '1,100'}
                        </p>
                    </div>
                    <div className='text-[#242424] text-base font-medium mt-2'>Payment Type</div>

                    {/* Razorpay */}
                    <div className={`bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2 ${selectedMethod === 'Razorpay' ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => setSelectedMethod('Razorpay')} style={{ cursor: 'pointer' }}>
                        <div className='flex items-center justify-between'>
                            <div className='font-medium text-base'>Razorpay</div>
                            <input type="radio" checked={selectedMethod === 'Razorpay'} readOnly />
                        </div>
                        <div className="flex justify-between items-center w-full mt-3">
                            <span className="text-xs text-gray-500">Secure Online Payment</span>
                        </div>
                    </div>

                    {/* Wallets */}
                    <div className={`bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2 ${selectedMethod === 'Wallet' ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => setSelectedMethod('Wallet')} style={{ cursor: 'pointer' }}>
                        <div className='flex items-center justify-between'>
                            <div className='font-medium text-base'>Wallet</div>
                            <input type="radio" checked={selectedMethod === 'Wallet'} readOnly />
                        </div>
                        <div className="flex justify-between items-center w-full mt-3">
                            <img className='' src={phonepay} alt="phonepay" />
                            <span className="text-xs text-gray-500">Linked</span>
                        </div>
                        <div className="flex justify-between items-center w-full mt-2">
                            <img className='' src={paytm} alt="paytm" />
                            <span className="text-xs text-gray-500">Linked</span>
                        </div>
                        <div className="flex justify-between items-center w-full mt-2">
                            <img className='' src={amazon} alt="amazon" />
                            <span className="text-xs text-gray-500">Linked</span>
                        </div>
                        <img className='mt-2' src={mobikwik} alt="mobikwik" />
                        <img className='' src={restricted} alt="restricted" />
                    </div>

                    {/* Cards */}
                    <div className={`bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2 ${selectedMethod.startsWith('Card') ? 'ring-2 ring-blue-400' : ''}`}
                        style={{ cursor: 'pointer' }}>
                        <div className='flex items-center justify-between mb-2'>
                            <div className='font-medium text-base'>Cards</div>
                            <input type="radio" checked={selectedMethod.startsWith('Card')} readOnly />
                        </div>
                        {/* List saved cards */}
                        {cards.length > 0 ? (
                            <div className="space-y-2 mb-2">
                                {cards.map((card, idx) => (
                                    <div key={idx} className={`flex items-center justify-between border rounded p-2 ${selectedMethod === `Card-${idx}` ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedMethod(`Card-${idx}`)}>
                                        <div>
                                            <div className="font-semibold text-sm">**** **** **** {card.number.slice(-4)}</div>
                                            <div className="text-xs text-gray-500">{card.name} | Exp: {card.expiry} | CVV: ***</div>
                                        </div>
                                        <input type="radio" checked={selectedMethod === `Card-${idx}`} readOnly />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <img src={credit} alt="credit" className='mt-3 mb-2' />
                        {/* Add Card Button or Form */}
                        {showAddCard ? (
                            <form className="space-y-2" onSubmit={handleAddCard} onClick={e => e.stopPropagation()}>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Card Number"
                                    maxLength={16}
                                    value={cardForm.number}
                                    onChange={e => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '') })}
                                    required
                                />
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Name on Card"
                                    value={cardForm.name}
                                    onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                                    required
                                />
                                <div className="flex gap-2 w-full">
                                    <input
                                        className="w-3/5 border rounded p-2 text-sm"
                                        placeholder="Expiry (MM/YY)"
                                        maxLength={5}
                                        value={cardForm.expiry}
                                        onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="w-1/3 border rounded p-2 text-sm"
                                        placeholder="CVV"
                                        maxLength={3}
                                        value={cardForm.cvv}
                                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                                        required
                                    />
                                </div>
                                {cardError && <div className="text-red-600 text-xs text-center">{cardError}</div>}
                                <div className="flex gap-2 w-full">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white rounded py-1">Add</button>
                                    <button type="button" className="flex-1 bg-gray-300 rounded py-1" onClick={() => { setShowAddCard(false); setCardError(""); }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button className="w-full mt-2 bg-blue-100 text-blue-700 rounded py-1 font-semibold text-sm" onClick={e => { e.stopPropagation(); setShowAddCard(true); }} type="button">+ Add New Card</button>
                        )}
                    </div>

                    {/* Net Banking */}
                    <div className={`bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2 ${selectedMethod === 'Net Banking' ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => setSelectedMethod('Net Banking')} style={{ cursor: 'pointer' }}>
                        <div className='flex items-center justify-between'>
                            <div className='font-medium text-base'>Net Banking</div>
                            <input type="radio" checked={selectedMethod === 'Net Banking'} readOnly />
                        </div>
                        {/* Show banks if Net Banking is selected */}
                        {selectedMethod === 'Net Banking' && (
                            <div className="mt-3 space-y-2">
                                {banks.map(bank => (
                                    <label key={bank.name} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bank"
                                            value={bank.name}
                                            checked={selectedBank === bank.name}
                                            onChange={e => { e.stopPropagation(); setSelectedBank(bank.name); }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <img src={bank.icon} alt={bank.name} className="w-6 h-6" />
                                        <span className="text-sm">{bank.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pay on Delivery */}
                    <div className={`bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2 ${selectedMethod === 'Pay on Delivery' ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => setSelectedMethod('Pay on Delivery')} style={{ cursor: 'pointer' }}>
                        <div className='flex items-center justify-between'>
                            <div className='font-medium text-base'>Pay on Delivery</div>
                            <input type="radio" checked={selectedMethod === 'Pay on Delivery'} readOnly />
                        </div>
                        <div className="flex justify-between items-center w-full mt-3">
                            <img className='' src={cod} alt="cod" />
                            <span className="text-xs text-gray-500">Cash</span>
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm mt-3 text-center">{error}</div>}

                    <button
                        onClick={handlePayment}
                        className={`w-full px-4 py-2 mt-6 rounded-[50px] font-semibold transition text-white ${selectedMethod ? 'bg-[#5C3FFF] hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!selectedMethod}
                    >
                        Make Payment
                    </button>
                </div>
            </div>
            <FooterTaxi />
        </div>
    );
}

export default PaymentTaxi;