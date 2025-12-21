import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Utility/Navbar';
import { CartProvider } from './Utility/CartContext';
import { BrowserRouter } from 'react-router-dom';
import { FoodCartProvider } from './Utility/FoodCartContext';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <CartProvider>
        <FoodCartProvider>
          <Navbar />
        </FoodCartProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App; 