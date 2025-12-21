import { useState } from 'react';

const useLocation = () => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  // Simulate location fetching
  return [location, setLocation];
};

export default useLocation; 