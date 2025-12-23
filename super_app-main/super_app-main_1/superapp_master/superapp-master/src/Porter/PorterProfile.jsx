import React from "react";
import FooterNav from "./Footer";
import profilePic from "../Clothes/Images/profilepic.svg";

const user = {
  name: "John Doe",
  phone: "+91 98765 43210",
  email: "john.doe@email.com",
};

const PorterProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 mt-8">
        <div className="flex flex-col items-center">
          <img
            src={profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-blue-200 shadow mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
          <div className="text-gray-500 mb-2">City Move User</div>
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="text-gray-600">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
          </div>
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            disabled
          >
            Edit Profile
          </button>
        </div>
      </div>
      <FooterNav />
    </div>
  );
};

export default PorterProfile;
