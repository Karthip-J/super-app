import React from 'react';
import Navbar from './Utility/Navbar';

import { CartProvider } from './Utility/CartContext'; 

function App() {
  return (
    <div className="font-sans">
      
      <CartProvider><Navbar/></CartProvider>
    </div>
  );
}

export default App;
