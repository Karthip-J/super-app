import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

function PrivacyTaxi() {
    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <HeaderInsideTaxi />
            <div className='px-4 pt-24 pb-[64px]'>
                <div className='font-medium text-base'>Privacy policy</div>

                <div className='text-xs pt-4 text-[#000000]'>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, 
                    <br></br>
                    <br></br>   
                    Opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 
                    <br></br>
                    <br></br>
                    'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like</div>
            </div>
            <FooterTaxi />
        </div>
    )
}
export default PrivacyTaxi;
