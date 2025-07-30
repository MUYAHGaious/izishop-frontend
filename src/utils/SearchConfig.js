/**
 * SearchConfig - Role-based search configuration and security
 * Defines what each role can search and access
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SHOP_OWNER: 'SHOP_OWNER',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  USER: 'user',
  GUEST: 'guest'
};

export const CONTEXTS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  ANALYTICS: 'analytics',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  TRANSACTIONS: 'transactions',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  SHOP_OVERVIEW: 'shop_overview'
};

// Role-based permissions - what fields each role can search and see
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    // Super admin can access everything
    allowedFields: ['*'],
    restrictedFields: [],
    contexts: Object.values(CONTEXTS)
  },
  
  [ROLES.ADMIN]: {
    allowedFields: [
      'id', 'name', 'title', 'description', 'category', 'status', 
      'created_at', 'updated_at', 'price', 'stock', 'sku',
      'email', 'username', 'role', 'department', 'active',
      'order_id', 'customer_name', 'total', 'payment_status',
      'analytics_data', 'revenue', 'sales'
    ],
    restrictedFields: ['password', 'api_keys', 'tokens', 'private_notes'],
    contexts: [
      CONTEXTS.DASHBOARD, CONTEXTS.PRODUCTS, CONTEXTS.ORDERS,
      CONTEXTS.USERS, CONTEXTS.ANALYTICS, CONTEXTS.INVENTORY,
      CONTEXTS.CUSTOMERS, CONTEXTS.TRANSACTIONS, CONTEXTS.REPORTS
    ]
  },
  
  [ROLES.SHOP_OWNER]: {
    allowedFields: [
      'id', 'name', 'title', 'description', 'category', 'status',
      'created_at', 'updated_at', 'price', 'stock', 'sku',
      'order_id', 'customer_name', 'total', 'payment_status',
      'shop_analytics', 'sales_data', 'revenue', 'profit',
      'rating', 'reviews', 'inventory_level'
    ],
    restrictedFields: [
      'password', 'api_keys', 'tokens', 'private_notes', 
      'admin_settings', 'system_configs', 'other_shop_data'
    ],
    contexts: [
      CONTEXTS.DASHBOARD, CONTEXTS.PRODUCTS, CONTEXTS.ORDERS,
      CONTEXTS.INVENTORY, CONTEXTS.CUSTOMERS, CONTEXTS.ANALYTICS,
      CONTEXTS.SHOP_OVERVIEW
    ]
  },
  
  [ROLES.MANAGER]: {
    allowedFields: [
      'id', 'name', 'title', 'description', 'category', 'status',
      'created_at', 'updated_at', 'price', 'stock', 'sku',
      'order_id', 'customer_name', 'total', 'payment_status',
      'department_analytics', 'team_performance'
    ],
    restrictedFields: [
      'password', 'api_keys', 'tokens', 'private_notes', 'salary',
      'admin_settings', 'system_configs', 'user_roles'
    ],
    contexts: [
      CONTEXTS.DASHBOARD, CONTEXTS.PRODUCTS, CONTEXTS.ORDERS,
      CONTEXTS.INVENTORY, CONTEXTS.CUSTOMERS, CONTEXTS.ANALYTICS
    ]
  },
  
  [ROLES.EMPLOYEE]: {
    allowedFields: [
      'id', 'name', 'title', 'description', 'category', 'status',
      'created_at', 'price', 'stock', 'sku',
      'order_id', 'customer_name', 'payment_status', 'assigned_to'
    ],
    restrictedFields: [
      'password', 'api_keys', 'tokens', 'private_notes', 'salary',
      'admin_settings', 'system_configs', 'user_roles', 'revenue',
      'profit_margins', 'cost_price', 'analytics_data'
    ],
    contexts: [
      CONTEXTS.DASHBOARD, CONTEXTS.PRODUCTS, CONTEXTS.ORDERS,
      CONTEXTS.INVENTORY, CONTEXTS.CUSTOMERS
    ]
  },
  
  [ROLES.USER]: {
    allowedFields: [
      'id', 'name', 'title', 'description', 'category', 'price',
      'available', 'in_stock', 'public_reviews', 'rating'
    ],
    restrictedFields: [
      'password', 'api_keys', 'tokens', 'private_notes', 'salary',
      'admin_settings', 'system_configs', 'user_roles', 'revenue',
      'profit_margins', 'cost_price', 'analytics_data', 'stock',
      'sku', 'supplier_info', 'internal_notes'
    ],
    contexts: [CONTEXTS.PRODUCTS, CONTEXTS.ORDERS]
  },
  
  [ROLES.GUEST]: {
    allowedFields: ['id', 'name', 'title', 'description', 'price', 'available'],
    restrictedFields: ['*'], // Guests have very limited access
    contexts: [CONTEXTS.PRODUCTS]
  }
};

// Context-specific data filtering rules
export const CONTEXT_FILTERS = {
  [CONTEXTS.SHOP_OVERVIEW]: {
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => {
        // Shop owners can see their own shop data
        return item.shop_owner_id === 'current_user_id' || item.owner_id === 'current_user_id' || !item.shop_owner_id;
      },
      additionalFields: ['profit_margin', 'cost_analysis', 'shop_metrics']
    },
    [ROLES.ADMIN]: {
      dataFilter: () => true, // Admins can see all
      additionalFields: ['system_metrics', 'all_shops_data']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.department === 'user_department' || item.public === true,
      additionalFields: ['department_metrics']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.assigned_to === 'user_id' || item.public === true,
      additionalFields: []
    },
    [ROLES.USER]: {
      dataFilter: () => false, // Users can't access shop overview
      additionalFields: []
    },
    [ROLES.GUEST]: {
      dataFilter: () => false,
      additionalFields: []
    }
  },
  
  [CONTEXTS.DASHBOARD]: {
    [ROLES.SUPER_ADMIN]: {
      dataFilter: () => true, // See everything
      additionalFields: ['system_metrics', 'security_logs']
    },
    [ROLES.ADMIN]: {
      dataFilter: (item) => !item.system_level,
      additionalFields: ['admin_metrics', 'user_activity']
    },
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => item.shop_owner_id === 'current_user_id' || item.owner_id === 'current_user_id',
      additionalFields: ['shop_metrics', 'sales_analytics']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.department === 'user_department' || item.public === true,
      additionalFields: ['department_metrics']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.assigned_to === 'user_id' || item.public === true,
      additionalFields: []
    },
    [ROLES.USER]: {
      dataFilter: (item) => item.user_id === 'current_user_id',
      additionalFields: []
    },
    [ROLES.GUEST]: {
      dataFilter: () => false, // No dashboard access
      additionalFields: []
    }
  },
  
  [CONTEXTS.USERS]: {
    [ROLES.SUPER_ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['login_history', 'permissions']
    },
    [ROLES.ADMIN]: {
      dataFilter: (item) => item.role !== ROLES.SUPER_ADMIN,
      additionalFields: ['last_login', 'status']
    },
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => item.shop_id === 'current_shop_id' && item.role !== ROLES.ADMIN,
      additionalFields: ['customer_data', 'order_history']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.department === 'user_department' && 
                           ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(item.role),
      additionalFields: ['department', 'performance']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.id === 'current_user_id',
      additionalFields: []
    },
    [ROLES.USER]: {
      dataFilter: () => false, // Users can't search other users
      additionalFields: []
    },
    [ROLES.GUEST]: {
      dataFilter: () => false,
      additionalFields: []
    }
  },
  
  [CONTEXTS.ORDERS]: {
    [ROLES.SUPER_ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['profit_margin', 'cost_analysis']
    },
    [ROLES.ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['revenue_impact', 'customer_segment']
    },
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => item.shop_id === 'current_shop_id' || item.shop_owner_id === 'current_user_id',
      additionalFields: ['profit_data', 'shop_commission']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.department === 'user_department',
      additionalFields: ['team_commission']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.assigned_to === 'user_id' || item.created_by === 'user_id',
      additionalFields: ['commission']
    },
    [ROLES.USER]: {
      dataFilter: (item) => item.customer_id === 'current_user_id',
      additionalFields: []
    },
    [ROLES.GUEST]: {
      dataFilter: () => false,
      additionalFields: []
    }
  },
  
  [CONTEXTS.PRODUCTS]: {
    [ROLES.SUPER_ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['cost_price', 'supplier_info', 'profit_margin']
    },
    [ROLES.ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['cost_price', 'supplier_info']
    },
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => item.shop_id === 'current_shop_id' || item.owner_id === 'current_user_id',
      additionalFields: ['cost_price', 'profit_data', 'shop_analytics']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.category_manager === 'user_id' || item.public === true,
      additionalFields: ['sales_data', 'inventory_alerts']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.active === true,
      additionalFields: ['stock_level', 'reorder_point']
    },
    [ROLES.USER]: {
      dataFilter: (item) => item.active === true && item.visible_to_customers === true,
      additionalFields: ['reviews', 'ratings']
    },
    [ROLES.GUEST]: {
      dataFilter: (item) => item.active === true && item.visible_to_customers === true && item.guest_viewable === true,
      additionalFields: []
    }
  },
  
  [CONTEXTS.ANALYTICS]: {
    [ROLES.SUPER_ADMIN]: {
      dataFilter: () => true,
      additionalFields: ['all_metrics', 'system_performance']
    },
    [ROLES.ADMIN]: {
      dataFilter: (item) => !item.system_level,
      additionalFields: ['business_metrics', 'user_analytics']
    },
    [ROLES.SHOP_OWNER]: {
      dataFilter: (item) => item.shop_id === 'current_shop_id' || item.owner_id === 'current_user_id',
      additionalFields: ['shop_analytics', 'sales_metrics', 'customer_insights']
    },
    [ROLES.MANAGER]: {
      dataFilter: (item) => item.department === 'user_department',
      additionalFields: ['department_analytics', 'team_performance']
    },
    [ROLES.EMPLOYEE]: {
      dataFilter: (item) => item.user_id === 'current_user_id',
      additionalFields: ['personal_metrics']
    },
    [ROLES.USER]: {
      dataFilter: () => false,
      additionalFields: []
    },
    [ROLES.GUEST]: {
      dataFilter: () => false,
      additionalFields: []
    }
  }
};

// Security validation function
export const validateSearchAccess = (userRole, context, searchData) => {
  // Check if role exists
  if (!ROLE_PERMISSIONS[userRole]) {
    throw new Error(`Invalid role: ${userRole}`);
  }
  
  // Check if user has access to this context
  if (!ROLE_PERMISSIONS[userRole].contexts.includes(context)) {
    throw new Error(`Access denied: Role ${userRole} cannot access ${context}`);
  }
  
  return true;
};

// Filter data based on role and context
export const filterDataByRole = (data, userRole, context, userId = null, userDepartment = null, shopId = null) => {
  if (!validateSearchAccess(userRole, context, data)) {
    return [];
  }
  
  const contextFilter = CONTEXT_FILTERS[context]?.[userRole];
  if (!contextFilter) {
    return [];
  }
  
  // Apply data filter with user context
  return data.filter(item => {
    try {
      // Replace placeholders with actual values
      const filterFunction = contextFilter.dataFilter;
      const filterString = filterFunction.toString()
        .replace(/user_department/g, `"${userDepartment}"`)
        .replace(/user_id/g, `"${userId}"`)
        .replace(/current_user_id/g, `"${userId}"`)
        .replace(/current_shop_id/g, `"${shopId}"`);
      
      // Create new function with replaced values
      const dynamicFilter = new Function('item', filterString.substring(filterString.indexOf('{') + 1, filterString.lastIndexOf('}')));
      
      return dynamicFilter(item);
    } catch (error) {
      console.warn('Filter error:', error);
      return false;
    }
  });
};

// Clean result fields based on role permissions
export const cleanResultFields = (results, userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return [];
  
  return results.map(item => {
    const cleanItem = {};
    
    // If user has access to all fields
    if (permissions.allowedFields.includes('*')) {
      Object.keys(item).forEach(key => {
        if (!permissions.restrictedFields.includes(key)) {
          cleanItem[key] = item[key];
        }
      });
    } else {
      // Only include allowed fields
      permissions.allowedFields.forEach(field => {
        if (item.hasOwnProperty(field) && !permissions.restrictedFields.includes(field)) {
          cleanItem[field] = item[field];
        }
      });
    }
    
    return cleanItem;
  });
};

// Get search placeholder based on role and context
export const getSearchPlaceholder = (userRole, context) => {
  const placeholders = {
    [CONTEXTS.SHOP_OVERVIEW]: {
      [ROLES.SHOP_OWNER]: "Search products, orders, customers, reviews...",
      [ROLES.ADMIN]: "Search all shop data, metrics, analytics...",
      [ROLES.MANAGER]: "Search department data, team metrics...",
      [ROLES.EMPLOYEE]: "Search assigned tasks, updates...",
      [ROLES.USER]: "Access restricted",
      [ROLES.GUEST]: "Access restricted"
    },
    [CONTEXTS.DASHBOARD]: {
      [ROLES.SUPER_ADMIN]: "Search system metrics, users, analytics...",
      [ROLES.ADMIN]: "Search admin dashboard, user activity...",
      [ROLES.SHOP_OWNER]: "Search your shop data, sales, orders...",
      [ROLES.MANAGER]: "Search department metrics, team performance...",
      [ROLES.EMPLOYEE]: "Search your assigned tasks, updates...",
      [ROLES.USER]: "Search your dashboard, personal data...",
      [ROLES.GUEST]: "Limited access available"
    },
    [CONTEXTS.PRODUCTS]: {
      [ROLES.SUPER_ADMIN]: "Search all products, inventory, suppliers...",
      [ROLES.ADMIN]: "Search products, categories, inventory...",
      [ROLES.SHOP_OWNER]: "Search your products, inventory, sales data...",
      [ROLES.MANAGER]: "Search managed products, sales data...",
      [ROLES.EMPLOYEE]: "Search available products, stock levels...",
      [ROLES.USER]: "Search available products...",
      [ROLES.GUEST]: "Search public products..."
    },
    [CONTEXTS.USERS]: {
      [ROLES.SUPER_ADMIN]: "Search all users, permissions, activity...",
      [ROLES.ADMIN]: "Search users, roles, departments...",
      [ROLES.SHOP_OWNER]: "Search customers, shop team members...",
      [ROLES.MANAGER]: "Search team members, department staff...",
      [ROLES.EMPLOYEE]: "Search your profile...",
      [ROLES.USER]: "Access restricted",
      [ROLES.GUEST]: "Access restricted"
    }
  };
  
  return placeholders[context]?.[userRole] || "Search...";
};

export default {
  ROLES,
  CONTEXTS,
  ROLE_PERMISSIONS,
  CONTEXT_FILTERS,
  validateSearchAccess,
  filterDataByRole,
  cleanResultFields,
  getSearchPlaceholder
};