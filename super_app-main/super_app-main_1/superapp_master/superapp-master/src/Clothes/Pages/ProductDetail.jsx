import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import Footer from '../../Utility/Footer';
import API_CONFIG from '../../config/api.config';
import { useCart } from '../../Utility/CartContext';
import paymentService from '../../services/paymentService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use CartContext instead of service directly
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product is in stock
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Sorry, this product is out of stock!');
      return;
    }

    // Check if requested quantity is available
    if (product.stock !== undefined && quantity > product.stock) {
      toast.error(`Sorry, only ${product.stock} items available in stock!`);
      return;
    }

    try {
      setAddingToCart(true);

      // Use CartContext addToCart function
      const result = await addToCart(product._id || product.id, quantity);

      if (result.success) {
        toast.success(`Added ${quantity} ${product.name} to cart!`);
        console.log('Product added to cart successfully:', result);
      } else {
        toast.error('Failed to add to cart: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart: ' + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Check if product is in stock
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Sorry, this product is out of stock!');
      return;
    }

    // Check if requested quantity is available
    if (product.stock !== undefined && quantity > product.stock) {
      toast.error(`Sorry, only ${product.stock} items available in stock!`);
      return;
    }

    try {
      setProcessingPayment(true);

      // First, add the item to cart
      console.log('🛒 Adding item to cart for Buy Now...');
      const cartResult = await addToCart(product._id || product.id, quantity);

      if (!cartResult.success) {
        throw new Error('Failed to add item to cart: ' + (cartResult.message || 'Unknown error'));
      }

      console.log('✅ Item added to cart successfully for Buy Now');

      // Create payment data for direct purchase
      const paymentData = {
        amount: (product.sale_price || product.price) * quantity,
        currency: 'INR',
        order_model: 'Order',
        order_data: {
          items: [{
            product_id: product._id || product.id,
            quantity: quantity,
            price: product.sale_price || product.price,
            name: product.name
          }],
          total_amount: (product.sale_price || product.price) * quantity,
          shipping_address: {
            address_line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400001',
            phone: '+91 9876543210'
          }
        },
        email: 'customer@example.com',
        contact: '+91 9876543210',
        description: `Direct purchase: ${quantity}x ${product.name}`
      };

      await paymentService.processPayment(paymentData, {
        onSuccess: (successData) => {
          console.log('Payment successful:', successData);
          toast.success('Payment successful! Your order has been placed.');
          // Navigate to order confirmation or home page
          navigate('/home-clothes');
        },
        onError: (error) => {
          console.error('Payment failed:', error);
          toast.error('Payment failed: ' + error.message);
        },
        onCancel: () => {
          console.log('Payment cancelled by user');
          toast.info('Payment was cancelled');
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MyntraClothesHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MyntraClothesHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
            <button
              onClick={() => navigate('/home-clothes')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = product.photo || product.featured_image || product.image;
  const fullImageUrl = imageUrl ? `${API_CONFIG.BASE_URL}${imageUrl}` : null;

  return (
    <div className="min-h-screen bg-white">
      <MyntraClothesHeader />

      <div className="pt-24 pb-16 px-4 max-w-[1248px] mx-auto">
        {/* Product Image */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={fullImageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCI yeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description || 'No description available'}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-pink-600">
                ₹{(product.sale_price || product.price) * quantity}
              </span>
              {product.sale_price && product.sale_price < product.price && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price * quantity}
                </span>
              )}
            </div>
            {product.stock !== undefined && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {product.stock > 10 ? 'In Stock' :
                  product.stock > 0 ? `Only ${product.stock} left` :
                    'Out of Stock'}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-1 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${addingToCart
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              disabled={addingToCart || !product || (product.stock !== undefined && product.stock <= 0)}
            >
              {addingToCart ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </span>
              ) : (
                'Add to Cart'
              )}
            </button>
            <button
              onClick={handleBuyNow}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${processingPayment
                ? 'bg-green-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              disabled={processingPayment || !product || (product.stock !== undefined && product.stock <= 0)}
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {product.sku && (
              <div className="flex justify-between">
                <span>SKU:</span>
                <span>{product.sku}</span>
              </div>
            )}
            {product.category_id && (
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{product.category_id}</span>
              </div>
            )}
            {product.brand_id && (
              <div className="flex justify-between">
                <span>Brand:</span>
                <span>{product.brand_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
