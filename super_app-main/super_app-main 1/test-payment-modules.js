// Test script to check payment modules for e-commerce and restaurant
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const TEST_TOKEN = 'demo-token';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

async function testPaymentModules() {
  console.log('🧪 Testing Payment Modules...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connectivity...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend is running:', healthResponse.data);

    // Test 2: Check payment endpoints
    console.log('\n2️⃣ Testing payment endpoints...');
    
    // Test Razorpay key endpoint
    try {
      const keyResponse = await axios.get(`${API_BASE}/payments/razorpay-key`, { headers });
      console.log('✅ Razorpay key endpoint working:', keyResponse.data.success);
    } catch (error) {
      console.log('❌ Razorpay key endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Check e-commerce order creation
    console.log('\n3️⃣ Testing e-commerce order creation...');
    try {
      const orderData = {
        shipping_address: {
          address_line1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001',
          phone: '+91 9876543210'
        },
        payment_method: 'razorpay',
        notes: 'Test order'
      };

      const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, { headers });
      console.log('✅ E-commerce order creation working:', orderResponse.data.success);
    } catch (error) {
      console.log('❌ E-commerce order creation failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Check food order creation
    console.log('\n4️⃣ Testing food order creation...');
    try {
      const foodOrderData = {
        delivery_address: {
          address_line1: '123 Food Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001',
          phone: '+91 9876543210'
        },
        payment_method: 'razorpay',
        delivery_instructions: 'Test delivery'
      };

      const foodOrderResponse = await axios.post(`${API_BASE}/food-orders`, foodOrderData, { headers });
      console.log('✅ Food order creation working:', foodOrderResponse.data.success);
    } catch (error) {
      console.log('❌ Food order creation failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Check payment creation
    console.log('\n5️⃣ Testing payment creation...');
    try {
      const paymentData = {
        amount: 100,
        currency: 'INR',
        order_id: '507f1f77bcf86cd799439011',
        order_model: 'Order',
        description: 'Test payment',
        email: 'test@example.com',
        contact: '+91 9876543210'
      };

      const paymentResponse = await axios.post(`${API_BASE}/payments/create-order`, paymentData, { headers });
      console.log('✅ Payment creation working:', paymentResponse.data.success);
    } catch (error) {
      console.log('❌ Payment creation failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Payment module testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentModules();
