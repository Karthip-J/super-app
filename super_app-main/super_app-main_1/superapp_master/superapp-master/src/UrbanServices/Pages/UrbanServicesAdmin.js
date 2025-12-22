import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';


const UrbanServicesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [partnerFilter, setPartnerFilter] = useState('all'); // all, pending, approved, rejected
  
  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    pricingType: 'fixed',
    minPrice: 0,
    maxPrice: 0,
    estimatedDuration: 60,
    serviceAreas: ['All Cities'],
    isActive: true,
    sortOrder: 1
  });
  
  // Service management state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: '',
    pricingType: 'fixed',
    minPrice: 0,
    maxPrice: 0,
    estimatedDuration: 60,
    serviceAreas: ['All Cities'],
    isActive: true,
    sortOrder: 1
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = API_CONFIG.getAuthHeaders();


      // Fetch categories
      const categoriesRes = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.URBAN_CATEGORIES), {
        headers
      });

      setCategories(categoriesRes.data.data || []);

      // Fetch services
      const servicesRes = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.URBAN_SERVICES), {
        headers
      });
      setServices(servicesRes.data.data || []);

      // Fetch all partners from backend
      const partnersRes = await axios.get(API_CONFIG.getUrl('/api/partners/all'), {
        headers
      });

      setPartners(partnersRes.data.partners || []);

      // For now, use mock data for bookings
      setBookings([
        {
          _id: '1',
          bookingNumber: 'USR123456',
          title: 'Home Cleaning Service',
          status: 'pending',
          createdAt: new Date()
        },
        {
          _id: '2',
          bookingNumber: 'USR123457',
          title: 'Plumbing Service',
          status: 'confirmed',
          createdAt: new Date()
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setCategories([]);
      setBookings([]);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePartner = async (partnerId) => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.post(API_CONFIG.getUrl(`/api/partners/${partnerId}/approve`), {}, {
        headers
      });


      // Refresh partners list
      fetchDashboardData();
      alert('Partner approved successfully!');
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Failed to approve partner');
    }
  };

  const handleRejectPartner = async (partnerId) => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.post(API_CONFIG.getUrl(`/api/partners/${partnerId}/reject`), {}, {
        headers
      });


      // Refresh partners list
      fetchDashboardData();
      alert('Partner rejected');
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Failed to reject partner');
    }
  };

  // Category management functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: '',
      image: '',
      pricingType: 'fixed',
      minPrice: 0,
      maxPrice: 0,
      estimatedDuration: 60,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 1
    });
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      image: category.image,
      pricingType: category.pricingType,
      minPrice: category.minPrice,
      maxPrice: category.maxPrice,
      estimatedDuration: category.estimatedDuration,
      serviceAreas: category.serviceAreas,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      let response;
      
      if (editingCategory) {
        // Update existing category
        response = await axios.put(
          API_CONFIG.getUrl(`/api/urban-services/categories/${editingCategory._id}`),
          categoryForm,
          { headers }
        );
      } else {
        // Create new category
        response = await axios.post(
          API_CONFIG.getUrl('/api/urban-services/categories'),
          categoryForm,
          { headers }
        );
      }
      
      setShowCategoryForm(false);
      fetchDashboardData();
      alert(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.delete(API_CONFIG.getUrl(`/api/urban-services/categories/${categoryId}`), {
        headers
      });
      
      fetchDashboardData();
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Service management functions
  const handleAddService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      category: '',
      pricingType: 'fixed',
      minPrice: 0,
      maxPrice: 0,
      estimatedDuration: 60,
      serviceAreas: ['All Cities'],
      isActive: true,
      sortOrder: 1
    });
    setShowServiceForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category?._id || service.category,
      pricingType: service.pricingType,
      minPrice: service.minPrice,
      maxPrice: service.maxPrice,
      estimatedDuration: service.estimatedDuration,
      serviceAreas: service.serviceAreas,
      isActive: service.isActive,
      sortOrder: service.sortOrder
    });
    setShowServiceForm(true);
  };

  const handleSaveService = async () => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      let response;
      
      if (editingService) {
        // Update existing service
        response = await axios.put(
          API_CONFIG.getUrl(`/api/urban-services/services/${editingService._id}`),
          serviceForm,
          { headers }
        );
      } else {
        // Create new service
        response = await axios.post(
          API_CONFIG.getUrl('/api/urban-services/services'),
          serviceForm,
          { headers }
        );
      }
      
      setShowServiceForm(false);
      fetchDashboardData();
      alert(editingService ? 'Service updated successfully!' : 'Service added successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.delete(API_CONFIG.getUrl(`/api/urban-services/services/${serviceId}`), {
        headers
      });
      
      fetchDashboardData();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const stats = {
    totalCategories: categories.length,
    totalBookings: bookings.length,
    totalPartners: partners.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">City Bell Admin</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'partners'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Partners
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <></>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
            <div className="text-gray-600">Service Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.totalBookings}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPartners}</div>
            <div className="text-gray-600">Service Partners</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
            <div className="text-gray-600">Pending Bookings</div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.bookingNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partners Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Partners Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setPartnerFilter('all')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All ({partners.length})
              </button>
              <button
                onClick={() => setPartnerFilter('pending')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending ({partners.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setPartnerFilter('approved')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Approved ({partners.filter(p => p.status === 'approved').length})
              </button>
              <button
                onClick={() => setPartnerFilter('rejected')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Rejected ({partners.filter(p => p.status === 'rejected').length})
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).map((partner) => (
                  <tr key={partner._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{partner.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {partner.serviceCategories?.slice(0, 2).join(', ')}
                      {partner.serviceCategories?.length > 2 && '...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        partner.status === 'approved' ? 'bg-green-100 text-green-800' :
                          partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {partner.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovePartner(partner._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPartner(partner._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {partner.status === 'approved' && (
                        <span className="text-green-600 text-xs font-medium">Approved</span>
                      )}
                      {partner.status === 'rejected' && (
                        <span className="text-red-600 text-xs font-medium">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
                {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No partners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Categories Management</h2>
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
            
            {/* Category Form */}
            {showCategoryForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    className="px-3 py-2 border rounded-lg md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Icon"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={categoryForm.pricingType}
                    onChange={(e) => setCategoryForm({...categoryForm, pricingType: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="quote">Quote Based</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={categoryForm.minPrice}
                    onChange={(e) => setCategoryForm({...categoryForm, minPrice: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={categoryForm.maxPrice}
                    onChange={(e) => setCategoryForm({...categoryForm, maxPrice: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={categoryForm.estimatedDuration}
                    onChange={(e) => setCategoryForm({...categoryForm, estimatedDuration: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({...categoryForm, sortOrder: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingCategory ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Categories Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{category.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{category.pricingType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{category.minPrice} - ₹{category.maxPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Services Management</h2>
              <button
                onClick={handleAddService}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Service
              </button>
            </div>
            
            {/* Service Form */}
            {showServiceForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.isActive).map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Description"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    className="px-3 py-2 border rounded-lg md:col-span-2"
                  />
                  <select
                    value={serviceForm.pricingType}
                    onChange={(e) => setServiceForm({...serviceForm, pricingType: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="quote">Quote Based</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={serviceForm.minPrice}
                    onChange={(e) => setServiceForm({...serviceForm, minPrice: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={serviceForm.maxPrice}
                    onChange={(e) => setServiceForm({...serviceForm, maxPrice: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={serviceForm.estimatedDuration}
                    onChange={(e) => setServiceForm({...serviceForm, estimatedDuration: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={serviceForm.sortOrder}
                    onChange={(e) => setServiceForm({...serviceForm, sortOrder: parseInt(e.target.value)})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowServiceForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveService}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingService ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Services Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{service.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {service.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{service.pricingType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{service.minPrice} - ₹{service.maxPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No services found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <>
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.bookingNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Partners Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Partners Management</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPartnerFilter('all')}
                    className={`px-3 py-1 rounded text-sm ${partnerFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    All ({partners.length})
                  </button>
                  <button
                    onClick={() => setPartnerFilter('pending')}
                    className={`px-3 py-1 rounded text-sm ${partnerFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Pending ({partners.filter(p => p.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setPartnerFilter('approved')}
                    className={`px-3 py-1 rounded text-sm ${partnerFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Approved ({partners.filter(p => p.status === 'approved').length})
                  </button>
                  <button
                    onClick={() => setPartnerFilter('rejected')}
                    className={`px-3 py-1 rounded text-sm ${partnerFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Rejected ({partners.filter(p => p.status === 'rejected').length})
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).map((partner) => (
                      <tr key={partner._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{partner.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.phoneNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner.serviceCategories?.slice(0, 2).join(', ')}
                          {partner.serviceCategories?.length > 2 && '...'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            partner.status === 'approved' ? 'bg-green-100 text-green-800' :
                              partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {partner.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprovePartner(partner._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 mr-2"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectPartner(partner._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {partner.status === 'approved' && (
                            <span className="text-green-600 text-xs font-medium">Approved</span>
                          )}
                          {partner.status === 'rejected' && (
                            <span className="text-red-600 text-xs font-medium">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No partners found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UrbanServicesAdmin;
