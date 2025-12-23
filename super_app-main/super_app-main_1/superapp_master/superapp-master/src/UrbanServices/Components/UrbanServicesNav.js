import React from 'react';
import { useNavigate } from 'react-router-dom';

const UrbanServicesNav = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-3">City Bell</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/urban-services')}
            className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
          >
            Customer Portal
          </button>
          <button
            onClick={() => navigate('/urban-services/admin')}
            className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-gray-100"
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => navigate('/urban-services/partner')}
            className="bg-white text-green-600 px-4 py-2 rounded hover:bg-gray-100"
          >
            Partner Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrbanServicesNav;
