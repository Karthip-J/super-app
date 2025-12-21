import React, { useEffect, useState } from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import { useNavigate } from 'react-router-dom';
import plus from "../../Icons/plus.svg";
import edit from "../../Icons/editicon.svg";

const CLOTHES_ADDRESS_KEY = 'clothesUserAddresses';

function AllAddresses() {
    const [addresses, setAddresses] = useState([]);
    const navigate = useNavigate();

    const loadAddresses = () => {
        const storedAddresses = JSON.parse(localStorage.getItem(CLOTHES_ADDRESS_KEY)) || [];
        setAddresses(storedAddresses);
    };

    useEffect(() => {
        loadAddresses();
        window.addEventListener('focus', loadAddresses);
        return () => window.removeEventListener('focus', loadAddresses);
    }, []);

    const handleEdit = (address, index) => {
        navigate('/home-clothes/edit-address-values', { state: { address, index } });
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <ClothesHeader />
            <div className="flex justify-between items-center px-4 pt-24">
                <h2 className="text-base font-medium">Delivery address</h2>
                <div className="flex items-center gap-2">
                    <img src={plus} alt="plus" className="cursor-pointer w-8 h-8" onClick={() => navigate('/home-clothes/address')} />
                </div>
            </div>
            <div className='px-4 pb-16 mt-4 space-y-3'>
                {addresses.length === 0 ? (
                    <div className="bg-white border border-dashed border-[#5C3FFF] rounded-[20px] p-4 text-center text-[#484848]">
                        No saved addresses yet. Tap the + icon above to add your first address.
                    </div>
                ) : (
                    addresses.map((address, index) => (
                        <div key={address.id || index} className="bg-white border border-gray-200 rounded-[20px] p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-[#242424]">
                                        {address.fullName || 'Saved Address'}
                                        <span className="bg-[#544C4A] px-2 py-1 rounded-full text-white font-normal text-xs ml-2 capitalize">
                                            {address.selectedAddressType || 'Home'}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-[#484848] leading-5">
                                        {address.houseNo && <div>{address.houseNo}</div>}
                                        {address.roadName && <div>{address.roadName}</div>}
                                        <div>
                                            {address.city}{address.city && address.state ? ', ' : ''}{address.state}
                                        </div>
                                        {address.pincode && <div>India - {address.pincode}</div>}
                                        {address.phoneNumber && (
                                            <div className="mt-1 text-xs text-[#797979]">Phone: {address.phoneNumber}</div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(address, index)}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#5C3FFF]"
                                >
                                    <img src={edit} alt="edit" className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AllAddresses;