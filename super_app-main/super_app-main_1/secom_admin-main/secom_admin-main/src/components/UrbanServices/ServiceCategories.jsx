import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import {
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCrown,
  FaCheckCircle,
  FaExclamationCircle,
  FaImage,
  FaArrowRight,
  FaSearch
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryServices, setCategoryServices] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    pricingType: 'fixed',
    minPrice: '',
    maxPrice: '',
    estimatedDuration: '',
    serviceAreas: ['All Cities'],
    metaTitle: '',
    metaDescription: '',
    isActive: true
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [syncing, setSyncing] = useState(false);

  const defaultHeroCategories = [
    { name: "Women's Salon & Spa", slug: 'salon-for-women', description: 'Beauty & wellness services', icon: 'scissors', color: 'bg-pink-50 text-pink-500' },
    { name: "Men's Salon & Massage", slug: 'salon-for-men', description: 'Grooming & relaxation', icon: 'scissors', color: 'bg-blue-50 text-blue-500' },
    { name: 'AC & Appliance Repair', slug: 'appliance-repair', description: 'Expert repair services', icon: 'tv', color: 'bg-orange-50 text-orange-500' },
    { name: 'Cleaning & Pest Control', slug: 'cleaning', description: 'Deep cleaning & pest control', icon: 'sparkles', color: 'bg-green-50 text-green-500' },
    { name: 'Electrician, Plumber & Carpenter', slug: 'home-repairs', description: 'Home repair experts', icon: 'wrench', color: 'bg-indigo-50 text-indigo-500' },
    { name: 'Painting & Wall Treatment', slug: 'painting', description: 'Professional painting services', icon: 'droplets', color: 'bg-yellow-50 text-yellow-500' },
    { name: 'Water Purifier & RO Service', slug: 'water-purifier', description: 'Water purification services', icon: 'droplets', color: 'bg-cyan-50 text-cyan-500' },
    { name: 'General Home Maintenance', slug: 'home-maintenance', description: 'Complete home care', icon: 'home', color: 'bg-purple-50 text-purple-500' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/urban-services/categories`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncDefaultCategories = async () => {
    if (!window.confirm('This will add any missing hero categories to your database. Continue?')) {
      return;
    }

    setSyncing(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      let createdCount = 0;

      for (const cat of defaultHeroCategories) {
        const exists = categories.find(c => c.slug === cat.slug);
        if (!exists) {
          const catToCreate = {
            ...cat,
            pricingType: 'fixed',
            minPrice: 499,
            maxPrice: 2999,
            estimatedDuration: 60,
            serviceAreas: ['All Cities'],
            isActive: true
          };
          delete catToCreate.color; // Frontend only property

          await axios.post(`${API_CONFIG.BASE_URL}/api/urban-services/categories`, catToCreate, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          createdCount++;
        }
      }

      if (createdCount > 0) {
        alert(`Successfully synced ${createdCount} categories!`);
        fetchCategories();
      } else {
        alert('All hero categories are already in the database.');
      }
    } catch (error) {
      console.error('Error syncing categories:', error);
      alert('Failed to sync. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const categoryData = { ...formData, image: imageUrl };

      let response;
      if (editingCategory) {
        response = await axios.put(`${API_CONFIG.BASE_URL}/api/urban-services/categories/${editingCategory._id}`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await axios.post(`${API_CONFIG.BASE_URL}/api/urban-services/categories`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setEditingCategory(null);
    setFormData({
      name: '', slug: '', description: '', icon: '', image: '', pricingType: 'fixed',
      minPrice: '', maxPrice: '', estimatedDuration: '', serviceAreas: ['All Cities'],
      metaTitle: '', metaDescription: '', isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openEditModal = (category) => {
    setShowModal(true);
    setEditingCategory(category);
    setFormData({
      name: category.name || '', slug: category.slug || '', description: category.description || '',
      icon: category.icon || '', image: category.image || '', pricingType: category.pricingType || 'fixed',
      minPrice: category.minPrice || '', maxPrice: category.maxPrice || '', estimatedDuration: category.estimatedDuration || '',
      serviceAreas: category.serviceAreas || ['All Cities'], metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '', isActive: category.isActive !== undefined ? category.isActive : true
    });
    setImageFile(null);
    setImagePreview(category.image ? (category.image.startsWith('http') ? category.image : `${API_CONFIG.BASE_URL}${category.image}`) : '');
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await axios.delete(`${API_CONFIG.BASE_URL}/api/urban-services/categories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Urban Service Category</h1>
          <p className="text-gray-500 font-medium">Manage your service catalog and hero sections</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={syncDefaultCategories}
            disabled={syncing}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-2xl font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <FaSync className={`${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Hero Categories'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#1d4ed8' }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all"
          >
            <FaPlus />
            Add Category
          </motion.button>
        </div>
      </div>

      {/* Hero Categories Status Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <FaCrown size={18} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Hero Section Status</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {defaultHeroCategories.map((item, idx) => {
            const exists = categories.find(c => c.slug === item.slug);
            return (
              <div
                key={idx}
                className={`p-4 rounded-3xl border ${exists ? 'bg-white border-blue-100' : 'bg-gray-50 border-dashed border-gray-300'} transition-all flex flex-col items-center text-center`}
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-3 text-xl shadow-sm overflow-hidden`}>
                  {exists?.image ? (
                    <img src={exists.image.startsWith('http') ? exists.image : `${API_CONFIG.BASE_URL}${exists.image}`} className="w-full h-full object-cover rounded-2xl" alt="" />
                  ) : <span className="uppercase">{item.icon[0]}</span>}
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{item.name.split(' ')[0]}</p>
                {exists ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                    <FaCheckCircle /> Synced
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <FaExclamationCircle /> Missing
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-black text-gray-900">All Categories</h3>
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Info</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Slug & Icon</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pricing</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((category) => {
                  const isHero = defaultHeroCategories.some(h => h.slug === category.slug);
                  return (
                    <tr key={category._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shadow-sm flex items-center justify-center">
                            {category.image ? (
                              <img
                                src={category.image.startsWith('http') ? category.image : `${API_CONFIG.BASE_URL}${category.image}`}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : <FaImage className="text-gray-300 text-xl" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</span>
                              {isHero && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-black rounded-full uppercase">Hero</span>}
                            </div>
                            <p className="text-xs text-gray-400 font-medium line-clamp-1">{category.description || 'No description provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">/{category.slug}</code>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">{category.icon || 'no-icon'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900 leading-none">₹{category.minPrice}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Starting Price</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${category.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {category.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(category._id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-gray-900">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-colors font-black uppercase text-xs tracking-widest">Close</button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                  <FaExclamationCircle /> {error}
                </div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug (URL)</label>
                      <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none" required />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon Key</label>
                      <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Price (₹)</label>
                      <input type="number" name="minPrice" value={formData.minPrice} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration (Min)</label>
                      <input type="number" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" required />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Photo</label>
                      {imagePreview && <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, image: '' }) }} className="text-[9px] font-black text-red-500 uppercase tracking-widest">Remove</button>}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <FaImage className="text-gray-200 text-3xl" />}
                      </div>
                      <div className="flex-1">
                        <input type="file" id="modal-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                        <label htmlFor="modal-image" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                          <FaPlus /> {imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <p className="text-[10px] text-gray-400 font-bold mt-2 tracking-tighter">Recommended size: 512x512px. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-100 border-none bg-gray-100" />
                      <span className="text-sm font-bold text-gray-700">Display this category on website</span>
                    </label>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : (editingCategory ? 'Update Category' : 'Create Category')}
                      {!submitting && <FaArrowRight />}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceCategories;
