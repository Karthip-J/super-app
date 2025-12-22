import React from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import step2 from "../Images/step2.svg";
import plus from "../../Icons/plus.svg";
import shirt from "../Images/shirt.svg";
import { useNavigate } from 'react-router-dom';
import edit from "../../Icons/editicon.svg";

function ProductDetails() {
    const navigate = useNavigate();
    return (
        <div className='bg-white min-h-screen'>
            <ClothesHeader />

            <div className='border border-[#E1E1E1] py-4'>
                <img src={step2} alt="" className='w-full mt-20 px-6' />
            </div >
            <div className='px-4 mb-16'>
                <div className="flex justify-between items-center pt-2">
                    <div className="text-base font-medium">Delivery address</div>
                    {/* <div>
                        <img src={plus} alt="Close" className="cursor-pointer w-6 h-6" />
                    </div> */}
                </div>
                <div className="mt-3 bg-white border border-gray-300 rounded-[20px] p-1 flex flex-col justify-between h-full">
                    <div className=" mt-2 p-2 rounded-lg" >
                        <div className="flex justify-between items-center w-full">
                            <div>
                                Breeza Quiz,
                                <span className="bg-[#544C4A] px-2 py-1 rounded-full text-white font-normal text-sm ml-2">
                                    Home
                                </span>
                            </div>
                        </div>

                        <div className="mt-2">
                            No 172, Mountain city cross,<br />
                            Texas,<br />
                            USA -23204
                        </div>
                    </div>

                    {/* Edit button aligned at the bottom right */}
                    <div className="flex justify-end mt-auto pr-4 pb-2">
                        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate('/home-clothes/all-addresses')}>
                            {/* <img src={edit} alt="edit" className="w-4 h-4" /> */}
                            <span className='text-[#5C3FFF] font-semibold text-sm underline'>Change delivery address</span>
                        </div>
                    </div>
                </div>
                <div className="text-base font-medium mt-2">Product details</div>
                <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-2 flex row gap-4 p-4'>
                    <div className='w-[120px] h-[140px]'>
                        <img src={shirt} alt="product" className='w-full h-full p-4' />
                    </div>
                    <div>
                        <div className="flex justify-between items-center  w-full">
                            <p className='font-normal text-sm text-[#484848]'>Men Uniforms</p>
                            <p className="text-[#5C3FFF] font-medium text-base">
                                20% OFF
                            </p>
                        </div>
                        <div className='font-semibold text-base text-[#242424] pt-2'>Blue cotton school uniforms</div>
                        <p className="font-medium text-sm text-[#242424] mb-2">₹ 1,400 <span className="line-through text-[#C1C1C1]">₹ 1,500</span></p>
                        <select className=" py-0 rounded-full border border-[#CCCCCC] px-3">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>
                </div>
                <div className="text-base font-medium mt-2">Payment details</div>
                <div className='bg-white border border-[#E1E1E1] rounded-[20px] p-6 mt-2' >
                    <div className="flex justify-between items-center w-full">
                        <p className='font-medium text-sm text-[#484848]'>Price (1 item)</p>
                        <p className="font-medium text-sm text-[#484848]">
                            ₹ 1,400
                        </p>
                    </div>
                    <div className="flex justify-between items-center w-full  mt-1">
                        <p className='font-medium text-sm text-[#484848]'>Discount</p>
                        <p className="font-medium text-sm text-[#484848]">
                            -₹ 300
                        </p>
                    </div>
                    <div className="flex justify-between items-center w-full  mt-1">
                        <p className='font-medium text-sm text-[#484848]'>Delivery charges</p>
                        <p className="font-medium text-sm text-[#484848]">
                            Free
                        </p>
                    </div>
                    <hr className='text-[#CCCCCC] mt-2' />
                    <div className="flex justify-between items-center w-full  mt-1">
                        <p className='font-semibold text-base text-[#000000]'> Total Amount</p>
                        <p className="font-semibold text-base text-[#000000]">
                            ₹ 1,100
                        </p>
                    </div>
                    <hr className='text-[#CCCCCC] mt-2' />
                </div>
                <button
                    onClick={() => navigate('/home-clothes/payment')}
                    className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6" >
                    Processed to pay
                </button>
            </div>
        </div>
    );
}

export default ProductDetails;