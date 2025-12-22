import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Utility/Footer';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
// import './App.css';

const Logo = () => (
  <Link to="/?root=logo" title="logo" className="inline-block align-middle h-[50px] w-[9.5%] bg-cover">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 250" className="align-middle">
      <path fill="#fc2779" d="M157.9 57.2c5-9.6-11.2-6.9-11.2-6.9-5.8 0-8.4 7-9.6 9l-17.5 34.5c-3.3 5.7-14.2 30.1-17.8 35.5-.3-5.5.1-16.5.2-19.1.7-10.4 1.4-18.3 2.5-27.8.8-7.4 2.4-15.7.9-23.1-1-4.6-2.5-4.9-9.1-5.6-6.9-.7-11.6 9.3-13.9 14-8.4 17.4-17.8 34.4-25.3 52.2-2.2 5.2-4.9 10.4-7.2 15.5-2.7 6.2-5.2 12.3-8.1 18.4-3.1 6.4-12.8 27.4-15.5 34-3 7.2-3.6 13 8.4 12.7 1.9 0 6.1.4 11.3-5.2 4.1-4.4 4.9-8.5 7.3-14.6 8.6-21.6 14.7-35.9 24.1-57.3.9-2.1 3-8.2 5.1-12.9-.1 6.7-1.2 14.7-1.7 20-1.6 19.4-2.7 38.1-4.4 57.3-.2 2.6-.9 5.7.3 8.1 1.2 2.4 4.2 3 6.6 3.3 9.6 1.2 10.6-3.6 13.6-10.2 2.7-5.9 4.3-10.7 6.7-16.7 7.4-18.5 15.2-36.8 23.8-54.8 2.2-4.6 4.4-9.1 6.8-13.6 4.4-8.3 8-16.1 12.8-25.3 3.6-6.6 7.1-14.1 10.9-21.4zm329.5 52.1c-1.1-11.1-16.3-5.5-25.4-3.8-3.4.6-13.9 2.6-26 4.9-.5-12.5-.3-10-.4-17.6-.3-11-.9-19.6-1.5-29.3-.4-6.1-1.3-14.6-12.3-13-12.8 1.8-14.9 8.2-18.3 15.9-8.9 20.1-8.6 20.2-18.7 42.6-.8 1.7-4.5 10.7-5.1 12.5-.4.1-1.2.3-2.2.6-4.1.9-9.1 2-14.6 3.2l.1-.5c1.3-10.2 2.9-20.4 4.3-30.6 1.3-9.3 2.7-24.5 3.8-33.8 1.2-10-10.4-9.8-10.4-9.8-7.1-.4-9.8 1.7-14.3 7.5-7.7 10-17 20.8-25.2 31.8-14.9 19.9-25.8 34.9-39.3 54.9-3.9 5.8-9.9 14.6-15.1 21.5-3.5-6.9-6.5-14.5-9.4-21.5-4.2-10-7.3-16.2-9.3-22.8-1.8-5.8.4-6.6 4.7-9.9 12.4-9.4 26.4-15.9 39.1-24.9 9-6.4 19.8-13.5 28.6-20.1 0 0 5.1-3 7.9-6.8 3.5-4.8-6.4-9.8-6.4-9.8-5.6-.9-8.7.4-12.6 2.2-4 1.8-9.2 5.9-12.6 8.6-7.5 5.8-17 12.7-24.4 18.5-9.1 7.1-15.3 11.5-25.3 17.4l25.4-38c8.3-10.7-13.7-13.7-22.1-2.4-7.8 10.1-13.1 19-19.2 28.2-14.7 21.9-26.8 44.9-38.9 69-4.6 9.2-9.1 18.8-13.3 28.3-2 4.6-7.9 15.2.2 16.3 17.3 2.2 20.1-6 24-15.9 6.4-16.3 8.5-19.3 12.6-29.4 4-9.8 6.9-15.4 11.4-23.8.1-.1 1.4-2.2 1.4-2.2.8 1.7 6.1 19.3 6.8 21.3 3.6 9.5 9.9 31.7 13.5 41.8 2.6 8.4 3.3 10.8 14.6 10.5 5.6-.1 8-2.3 11.7-9.3s19.7-36.8 19.7-36.8c4.8-.8 11.7-2 16.2-2.8.8-.1 2.6-.5 5.1-1 1.7-.2 3.1-.5 4.2-.8.1 0 .1 0 .2-.1 4.4-.9 10-2 16.1-3.2-1.1 5.5-4.5 17.6-5.2 20.7 0 0-7.4 28.8 2.2 30.3 6 .9 9.1-.1 9.1-.1 11.2-1.3 11.4-16.4 11.4-16.4l6.1-39.1c4.4-.9 8.8-1.8 13.1-2.6l-13.2 44.6c-1.9 6.3-3.3 14.4 8 14.4 9.2.5 9.8-5.3 9.8-5.3.2-.9 7.5-24.4 9.3-32.8 1.2-5.4 5.5-19.3 7.2-24.9 4.8-.9 8.4-1.6 10.1-1.9 2-.3 5.9-1 11-1.8-.1 5.2 0 12.4.1 13.4 1.1 15.8-.1 32.2 3.2 47.7.5 2.5 1.5 5" />
    </svg>
  </Link>
);

const NavItem = ({ id, text, to = "/" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className="inline-block align-middle h-[62px] flex items-center px-[10px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={to}
        className="block text-[12px] font-medium uppercase text-[#03021a] text-center"
      >
        {text}
      </Link>
      {id === "category" && (
        <div
          className="absolute bottom-[19px]"
          style={{ visibility: isHovered ? "visible" : "hidden" }}
        >
          <div className="w-[1140px] bg-white absolute z-[7] left-0 pt-[20px] mt-[-12px] rounded-b-[3px]">
            {/* Add category dropdown content here */}
          </div>
        </div>
      )}
      {id === "brands" && (
        <div
          className="absolute bottom-[19px]"
          style={{ visibility: isHovered ? "visible" : "hidden" }}
        >
          <div className="w-[1140px] bg-white absolute z-[7] left-0 pt-[20px] mt-[-12px] rounded-b-[3px]">
            <div className="w-[360px] float-left bg-white h-[510px] rounded-bl-[3px]">
              <div className="p-[18px]">
                <input
                  type="text"
                  placeholder="search brands"
                  className="w-full border border-gray-200 p-2 rounded"
                />
              </div>
              <div className="flex mt-[10px] pl-[18px] h-[calc(85%-10px)]">
                <div className="w-[295px]">
                  <div className="h-full overflow-auto">
                    {/* Brand list content */}
                  </div>
                </div>
                <div className="w-[50px] text-center">
                  <ul>
                    <li><Link to="#" className="text-[12px] text-gray-600 hover:text-[#E80071]">*</Link></li>
                    <li><Link to="#" className="text-[12px] text-gray-600 hover:text-[#E80071]">#</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <div className="flex">
                <Link to="#" className="font-bold text-[#E80071]">Popular</Link>
                <Link to="#" className="font-bold ml-4">Luxe</Link>
                <Link to="#" className="font-bold ml-4">Only At Nykaa</Link>
                <Link to="#" className="font-bold ml-4">New Launches</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={`flex items-center bg-white sticky top-0 h-[60px] z-[1] ${isActive ? "w-[375px]" : ""}`}>
      <div className={`flex items-center border ${isActive ? "border-[#E80071]" : "border-gray-200"} w-full p-[0_2%] h-[40px] bg-gray-100 rounded transition-all duration-500 relative z-10`}>
        <button
          type="submit"
          className="absolute top-[7px] flex items-center bg-transparent border-none"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.54 19.97L16.3 14.73C17.36 13.44 17.99 11.79 17.99 9.99C17.99 5.85 14.64 2.5 10.5 2.5C6.35 2.5 3 5.85 3 9.99C3 14.13 6.35 17.48 10.49 17.48C12.29 17.48 13.94 16.84 15.23 15.79L20.47 21.03C20.62 21.18 20.81 21.25 21 21.25C21.19 21.25 21.38 21.18 21.53 21.03C21.83 20.74 21.83 20.26 21.54 19.97ZM10.49 15.98C7.19 15.98 4.5 13.29 4.5 9.99C4.5 6.69 7.19 4 10.49 4C13.79 4 16.48 6.69 16.48 9.99C16.48 13.3 13.8 15.98 10.49 15.98Z" fill="black" />
          </svg>
        </button>
        <form className="pl-[35px] w-full flex items-center">
          <input
            placeholder="Search on Nykaa"
            name="search-suggestions-nykaa"
            autoComplete="off"
            className="border-none bg-transparent w-full text-[14px] font-medium focus:outline-none"
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
          />
        </form>
      </div>
    </div>
  );
};

const Banner = ({ id, src, alt, to, timer }) => (
  <div className="flex-[0_0_auto] w-[40%] mr-[1rem]">
    <Link to={to} target="_blank" className="block text-inherit no-underline bg-transparent pb-[1rem]">
      <div className="relative">
        <div className="min-h-[50px]">
          <img src={src} alt={alt} className="w-full align-bottom min-h-[50px] rounded-[8px]" />
        </div>
        {timer && (
          <div className="absolute top-[0.75rem] left-[0.75rem] flex items-center justify-start w-full">
            <div className="bg-black/50 text-white text-[14px] font-normal px-[0.25rem] py-[0.25rem] rounded-[2px]">
              <span>Ends In:</span>
              <span className="font-semibold pl-[4px]">{timer}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  </div>
);

const App = () => (
  <div className="font-['Inter',Roboto,Arial,sans-serif] bg-white text-[14px] leading-[1] antialiased">
    <MyntraClothesHeader />
    <div className="pt-24 bg-white">
      <div className="max-w-[1600px] mx-auto px-[48px] lg:px-0">
        <div className="flex flex-row items-end">
          <div className="flex-1 flex flex-col"></div>
          <div className="flex flex-col items-end"></div>
        </div>
        <div className="relative h-[90%] overflow-x-hidden overflow-y-hidden scrollbar-hidden pt-0 pb-[14px] mx-[48px] lg:mx-0">
          <div className="flex">
            <Banner
              id="684c0087115101310c433d61"
              src="https://images-static.nykaa.com/uploads/d92678c5-333a-476b-b510-a33d096535ac.gif"
              alt="Victoria's Secret"
              to="/brands/victoria-s-secret/c/704?transaction_id=7f9651a2c23faba698510ea7e00cee4c"
              timer="07h 45m 38s"
            />
            <Banner
              id="684ab4f5035a94cab9102393"
              src="https://images-static.nykaa.com/uploads/de02895e-16d2-45be-be15-d33d35810dd0.jpg?tr=cm-pad_resize,w-1200"
              alt="M.A.C"
              to="/luxe/brands/mac/c/3899?transaction_id=f2035421e5366ff63ac9ecb106e60196"
            />
          </div>
        </div>
      </div>
    </div>
    <div className="h-[164px] bg-[#eee] animate-pulse"></div>
    <div className="bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-row items-end">
          <div className="flex-1 flex flex-col"></div>
          <div className="flex flex-col items-end"></div>
        </div>
        <div className="relative h-[90%]">
          <div className="flex w-full text-center">
            <Banner
              id="68402f029eb7c452a77b3174"
              src="https://images-static.nykaa.com/uploads/0fa64a13-d4de-4168-bb50-5b4270edf476.jpg?tr=cm-pad_resize,w-1200"
              alt="unwrap-header"
              to=""
            />
          </div>
        </div>
      </div>
    </div>
    <h1 className="bg-white text-[#001325] text-[20px] font-semibold leading-[24px] px-[3rem] pb-[1.25rem]">
      Nykaa - The Online Beauty Store
    </h1>
    <div className="fixed bottom-0 right-[20px] flex bg-white w-[290px] h-[45px] shadow-[0_1px_10px_rgba(0,0,0,0.1)] z-[9] font-['Source_Sans_Pro'] rounded-[2px] text-[14px] cursor-pointer transition-all duration-200">
      <div className="w-[26px] h-[24px] bg-[url('https://www.nykaa.com//assets/desktop/images/chat_logo.svg')] bg-no-repeat mt-[11px] ml-[15px]"></div>
      <div className="w-[160px] text-[16px] mt-[11px] ml-[15px]">
        How may we help you
      </div>
    </div>
    <Footer />
  </div>
);

export default App;