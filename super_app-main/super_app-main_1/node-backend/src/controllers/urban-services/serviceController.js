const Service = require('../../models/urban-services/service');
const asyncHandler = require('express-async-handler');

// @desc    Get all services
// @route   GET /api/urban-services/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { category, active, city } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  if (city) {
    query['serviceAreas.city'] = city;
  }
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/urban-services/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name slug image description')
    .populate('reviews');
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  res.json({
    success: true,
    data: service
  });
});

// @desc    Create service
// @route   POST /api/urban-services/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const service = new Service(req.body);
  
  // Generate slug from name if not provided
  if (!service.slug) {
    service.slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const savedService = await service.save();
  
  res.status(201).json({
    success: true,
    data: savedService
  });
});

// @desc    Update service
// @route   PUT /api/urban-services/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  Object.assign(service, req.body);
  
  if (req.body.name && !req.body.slug) {
    service.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  
  const updatedService = await service.save();
  
  res.json({
    success: true,
    data: updatedService
  });
});

// @desc    Delete service
// @route   DELETE /api/urban-services/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found'
    });
  }
  
  await service.remove();
  
  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
});

// @desc    Get services by category
// @route   GET /api/urban-services/services/category/:categoryId
// @access  Public
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { active } = req.query;
  
  let query = { category: categoryId };
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Search services
// @route   GET /api/urban-services/services/search
// @access  Public
const searchServices = asyncHandler(async (req, res) => {
  const { q, category, city } = req.query;
  
  let query = {};
  
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { shortDescription: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (city) {
    query['serviceAreas.city'] = city;
  }
  
  query.isActive = true;
  
  const services = await Service.find(query)
    .populate('category', 'name slug image')
    .sort({ popular: -1, sortOrder: 1, name: 1 });
  
  res.json({
    success: true,
    count: services.length,
    data: services
  });
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  searchServices
};
