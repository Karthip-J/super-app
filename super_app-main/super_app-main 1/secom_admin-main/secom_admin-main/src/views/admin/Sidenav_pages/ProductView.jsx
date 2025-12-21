import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import API_CONFIG from '../../../config/api.config';
import avatarPlaceholder from '../../../assets/img/avatars/avatar1.png';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/admin/products')} className="mb-4 flex items-center text-blue-600 hover:underline">
          <FaArrowLeft className="mr-2" /> Back to Products
        </button>
        <div className="text-red-600">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin/products')} className="mb-6 flex items-center text-blue-600 hover:underline">
        <FaArrowLeft className="mr-2" /> Back to Products
      </button>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <img
            src={product.photo ? API_CONFIG.getUrl(product.photo) : avatarPlaceholder}
            alt={product.name}
            className="w-48 h-48 object-cover rounded-lg border"
            onError={e => { e.target.onerror = null; e.target.src = avatarPlaceholder; }}
          />
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-xs">SKU</div>
              <div className="text-gray-900 font-medium">{product.sku}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Slug</div>
              <div className="text-gray-900 font-medium">{product.slug}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Price</div>
              <div className="text-gray-900 font-medium">${product.price}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Sale Price</div>
              <div className="text-gray-900 font-medium">{product.sale_price ? `$${product.sale_price}` : '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Stock</div>
              <div className="text-gray-900 font-medium">{product.stock}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Brand</div>
              <div className="text-gray-900 font-medium">{(typeof product.brand === 'object' && product.brand !== null) ? product.brand.name : product.brand || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Category</div>
              <div className="text-gray-900 font-medium">{(typeof product.category === 'object' && product.category !== null) ? product.category.name : product.category || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Subcategory</div>
              <div className="text-gray-900 font-medium">{(typeof product.sub_category === 'object' && product.sub_category !== null) ? product.sub_category.name : product.sub_category || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Status</div>
              <div className="text-gray-900 font-medium">{product.status ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Description</div>
            <div className="text-gray-900">{product.description || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView; 