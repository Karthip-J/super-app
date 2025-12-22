// Role-based access control utility

// Define module permissions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    // Super admin has access to everything
    ecommerce: ['view', 'create', 'edit', 'delete'],
    grocery: ['view', 'create', 'edit', 'delete'],
    taxi: ['view', 'create', 'edit', 'delete'],
    hotel: ['view', 'create', 'edit', 'delete'],
    restaurant: ['view', 'create', 'edit', 'delete'],
    user_management: ['view', 'create', 'edit', 'delete'],
    system_settings: ['view', 'create', 'edit', 'delete'],
    content_management: ['view', 'create', 'edit', 'delete']
  },
  ecommerce_admin: {
    ecommerce: ['view', 'create', 'edit', 'delete'],
    grocery: ['view', 'create', 'edit', 'delete']
  },
  grocery_admin: {
    grocery: ['view', 'create', 'edit', 'delete']
  },
  taxi_admin: {
    taxi: ['view', 'create', 'edit', 'delete']
  },
  hotel_admin: {
    hotel: ['view', 'create', 'edit', 'delete'],
    restaurant: ['view', 'create', 'edit', 'delete']
  },
  user: {
    // Regular users have no admin access
  }
};

// Check if user has permission for a specific module and action
export const hasPermission = (userRole, module, action = 'view') => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions || !permissions[module]) {
    return false;
  }
  return permissions[module].includes(action);
};

// Check if user has access to a module
export const hasModuleAccess = (userRole, module) => {
  return hasPermission(userRole, module, 'view');
};

// Get accessible modules for a role
export const getAccessibleModules = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) {
    return [];
  }
  return Object.keys(permissions);
};

// Filter routes based on user role
export const filterRoutesByRole = (routes, userRole) => {
  if (userRole === 'admin') {
    return routes; // Admin sees everything
  }

  return routes.map(route => {
    if (route.subNav) {
      // Filter sub-navigation items
      const filteredSubNav = route.subNav.filter(subItem => {
        const module = getModuleFromPath(subItem.path);
        return hasModuleAccess(userRole, module);
      });

      // Only show main nav item if it has accessible sub-items
      if (filteredSubNav.length > 0) {
        return {
          ...route,
          subNav: filteredSubNav
        };
      }
      return null;
    } else {
      // Check main route access
      const module = getModuleFromPath(route.path);
      return hasModuleAccess(userRole, module) ? route : null;
    }
  }).filter(Boolean); // Remove null items
};

// Helper function to extract module from path
const getModuleFromPath = (path) => {
  if (!path) return '';
  
  // Map paths to modules
  const pathToModule = {
    'brands': 'ecommerce',
    'categories': 'ecommerce',
    'subCategory': 'ecommerce',
    'product': 'ecommerce',
    'orders': 'ecommerce',
    'discount': 'ecommerce',
    'rating': 'ecommerce',
    'stockadjustment': 'ecommerce',
    'restocategory': 'restaurant',
    'restosubcategory': 'restaurant',
    'restoproducts': 'restaurant',
    'restoorders': 'restaurant',
    'Toppings': 'restaurant',
    'RestoRatings': 'restaurant',
    'restodiscount': 'restaurant',
    'restostockadjustment': 'restaurant',
    'groceries': 'grocery',
    'taxi-drivers': 'taxi',
    'taxi-vehicles': 'taxi',
    'taxi-rides': 'taxi',
    'allhotel': 'hotel',
    'hotelattributes': 'hotel',
    'hotelpolicy': 'hotel',
    'hotelfaqs': 'hotel',
    'users': 'user_management',
    'role': 'user_management',
    'staff': 'user_management',
    'rolepermission': 'user_management',
    'profile': 'system_settings',
    'paymentgateway': 'system_settings',
    'emailconfiguration': 'system_settings',
    'emailtemplate': 'system_settings',
    'taxs': 'system_settings',
    'grouptax': 'system_settings',
    'size': 'system_settings',
    'color': 'system_settings',
    'units': 'system_settings',
    'pages': 'content_management',
    'banner': 'content_management',
    'faq': 'content_management',
    'homepage': 'content_management',
    'sectionname': 'content_management',
    'blogcategory': 'content_management',
    'blogmain': 'content_management',
    'tags': 'content_management',
    'enquiry': 'content_management'
  };

  return pathToModule[path] || '';
};

// Get user role from localStorage
export const getUserRole = () => {
  try {
    // Try multiple possible localStorage keys
    const userData = localStorage.getItem('userData') || 
                    localStorage.getItem('OnlineShop-userData') ||
                    localStorage.getItem('OnlineShop-user');
    
    if (userData) {
      const user = JSON.parse(userData);
      return user.role || 'user';
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return 'user';
};

// Check if current user can access a specific route
export const canAccessRoute = (routePath) => {
  const userRole = getUserRole();
  const module = getModuleFromPath(routePath);
  return hasModuleAccess(userRole, module);
}; 