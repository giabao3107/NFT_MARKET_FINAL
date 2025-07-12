// Main Pages
export { default as Home } from './Home';
export { default as Explore } from './Explore';
export { default as Marketplace } from './Marketplace';
export { default as Create } from './Create';
export { default as Profile } from './Profile';
export { default as Collection } from './Collection';
export { default as NFTDetail } from './NFTDetail';
export { default as Activity } from './Activity';
export { default as Rankings } from './Rankings';
export { default as Stats } from './Stats';

// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as ForgotPassword } from './auth/ForgotPassword';

// Error Pages
export { default as NotFound } from './errors/NotFound';
export { default as ServerError } from './errors/ServerError';
export { default as Maintenance } from './errors/Maintenance';

// Settings Pages
export { default as Settings } from './settings/Settings';
export { default as AccountSettings } from './settings/AccountSettings';
export { default as NotificationSettings } from './settings/NotificationSettings';
export { default as PrivacySettings } from './settings/PrivacySettings';

// Help Pages
export { default as Help } from './help/Help';
export { default as FAQ } from './help/FAQ';
export { default as Contact } from './help/Contact';
export { default as Terms } from './help/Terms';
export { default as Privacy } from './help/Privacy';

// Page Constants
export const PAGE_ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  MARKETPLACE: '/marketplace',
  CREATE: '/create',
  PROFILE: '/profile/:address?',
  COLLECTION: '/collection/:id',
  NFT_DETAIL: '/nft/:id',
  ACTIVITY: '/activity',
  RANKINGS: '/rankings',
  STATS: '/stats',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SETTINGS: '/settings',
  ACCOUNT_SETTINGS: '/settings/account',
  NOTIFICATION_SETTINGS: '/settings/notifications',
  PRIVACY_SETTINGS: '/settings/privacy',
  HELP: '/help',
  FAQ: '/help/faq',
  CONTACT: '/help/contact',
  TERMS: '/help/terms',
  PRIVACY_POLICY: '/help/privacy',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  MAINTENANCE: '/maintenance'
};

// Page Metadata
export const PAGE_METADATA = {
  [PAGE_ROUTES.HOME]: {
    title: 'NFT Marketplace - Discover, Create, and Trade NFTs',
    description: 'The premier destination for NFTs. Discover, create, buy, and sell unique digital assets.',
    keywords: 'NFT, marketplace, digital art, blockchain, crypto, collectibles'
  },
  [PAGE_ROUTES.EXPLORE]: {
    title: 'Explore NFTs - NFT Marketplace',
    description: 'Explore thousands of unique NFTs from top creators and collections.',
    keywords: 'explore NFTs, digital art, collections, creators'
  },
  [PAGE_ROUTES.MARKETPLACE]: {
    title: 'NFT Marketplace - Buy and Sell NFTs',
    description: 'Buy and sell NFTs in our secure marketplace with instant transactions.',
    keywords: 'buy NFTs, sell NFTs, marketplace, trading'
  },
  [PAGE_ROUTES.CREATE]: {
    title: 'Create NFT - Mint Your Digital Art',
    description: 'Create and mint your own NFTs. Upload your digital art and turn it into a unique token.',
    keywords: 'create NFT, mint NFT, digital art, upload'
  },
  [PAGE_ROUTES.PROFILE]: {
    title: 'User Profile - NFT Marketplace',
    description: 'View user profile, owned NFTs, created collections, and trading activity.',
    keywords: 'user profile, NFT collection, trading history'
  },
  [PAGE_ROUTES.COLLECTION]: {
    title: 'NFT Collection - NFT Marketplace',
    description: 'Explore this unique NFT collection and discover rare digital assets.',
    keywords: 'NFT collection, digital assets, rare NFTs'
  },
  [PAGE_ROUTES.NFT_DETAIL]: {
    title: 'NFT Details - NFT Marketplace',
    description: 'View detailed information about this NFT including price, history, and properties.',
    keywords: 'NFT details, price history, properties, trading'
  },
  [PAGE_ROUTES.ACTIVITY]: {
    title: 'Activity Feed - NFT Marketplace',
    description: 'Stay updated with the latest NFT trading activity and market movements.',
    keywords: 'NFT activity, trading feed, market updates'
  },
  [PAGE_ROUTES.RANKINGS]: {
    title: 'NFT Rankings - Top Collections and Creators',
    description: 'Discover top NFT collections and creators ranked by volume, floor price, and popularity.',
    keywords: 'NFT rankings, top collections, popular creators'
  },
  [PAGE_ROUTES.STATS]: {
    title: 'Market Statistics - NFT Marketplace',
    description: 'View comprehensive NFT market statistics and analytics.',
    keywords: 'NFT statistics, market analytics, trading volume'
  }
};

// Page Categories
export const PAGE_CATEGORIES = {
  MAIN: [
    PAGE_ROUTES.HOME,
    PAGE_ROUTES.EXPLORE,
    PAGE_ROUTES.MARKETPLACE,
    PAGE_ROUTES.CREATE
  ],
  USER: [
    PAGE_ROUTES.PROFILE,
    PAGE_ROUTES.ACTIVITY,
    PAGE_ROUTES.SETTINGS
  ],
  CONTENT: [
    PAGE_ROUTES.COLLECTION,
    PAGE_ROUTES.NFT_DETAIL,
    PAGE_ROUTES.RANKINGS,
    PAGE_ROUTES.STATS
  ],
  AUTH: [
    PAGE_ROUTES.LOGIN,
    PAGE_ROUTES.REGISTER,
    PAGE_ROUTES.FORGOT_PASSWORD
  ],
  HELP: [
    PAGE_ROUTES.HELP,
    PAGE_ROUTES.FAQ,
    PAGE_ROUTES.CONTACT,
    PAGE_ROUTES.TERMS,
    PAGE_ROUTES.PRIVACY_POLICY
  ],
  ERROR: [
    PAGE_ROUTES.NOT_FOUND,
    PAGE_ROUTES.SERVER_ERROR,
    PAGE_ROUTES.MAINTENANCE
  ]
};

// Page Access Levels
export const PAGE_ACCESS = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  ADMIN: 'admin'
};

export const PAGE_ACCESS_LEVELS = {
  [PAGE_ROUTES.HOME]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.EXPLORE]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.MARKETPLACE]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.CREATE]: PAGE_ACCESS.AUTHENTICATED,
  [PAGE_ROUTES.PROFILE]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.COLLECTION]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.NFT_DETAIL]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.ACTIVITY]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.RANKINGS]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.STATS]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.LOGIN]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.REGISTER]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.FORGOT_PASSWORD]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.SETTINGS]: PAGE_ACCESS.AUTHENTICATED,
  [PAGE_ROUTES.ACCOUNT_SETTINGS]: PAGE_ACCESS.AUTHENTICATED,
  [PAGE_ROUTES.NOTIFICATION_SETTINGS]: PAGE_ACCESS.AUTHENTICATED,
  [PAGE_ROUTES.PRIVACY_SETTINGS]: PAGE_ACCESS.AUTHENTICATED,
  [PAGE_ROUTES.HELP]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.FAQ]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.CONTACT]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.TERMS]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.PRIVACY_POLICY]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.NOT_FOUND]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.SERVER_ERROR]: PAGE_ACCESS.PUBLIC,
  [PAGE_ROUTES.MAINTENANCE]: PAGE_ACCESS.PUBLIC
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    label: 'Home',
    path: PAGE_ROUTES.HOME,
    icon: 'FiHome',
    category: 'main'
  },
  {
    label: 'Explore',
    path: PAGE_ROUTES.EXPLORE,
    icon: 'FiCompass',
    category: 'main'
  },
  {
    label: 'Marketplace',
    path: PAGE_ROUTES.MARKETPLACE,
    icon: 'FiShoppingBag',
    category: 'main'
  },
  {
    label: 'Create',
    path: PAGE_ROUTES.CREATE,
    icon: 'FiPlus',
    category: 'main',
    requiresAuth: true
  },
  {
    label: 'Activity',
    path: PAGE_ROUTES.ACTIVITY,
    icon: 'FiActivity',
    category: 'secondary'
  },
  {
    label: 'Rankings',
    path: PAGE_ROUTES.RANKINGS,
    icon: 'FiTrendingUp',
    category: 'secondary'
  },
  {
    label: 'Stats',
    path: PAGE_ROUTES.STATS,
    icon: 'FiBarChart',
    category: 'secondary'
  }
];

// Breadcrumb Configuration
export const BREADCRUMB_CONFIG = {
  [PAGE_ROUTES.HOME]: [],
  [PAGE_ROUTES.EXPLORE]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Explore' }
  ],
  [PAGE_ROUTES.MARKETPLACE]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Marketplace' }
  ],
  [PAGE_ROUTES.CREATE]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Create NFT' }
  ],
  [PAGE_ROUTES.PROFILE]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Profile' }
  ],
  [PAGE_ROUTES.COLLECTION]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Explore', path: PAGE_ROUTES.EXPLORE },
    { label: 'Collection' }
  ],
  [PAGE_ROUTES.NFT_DETAIL]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Explore', path: PAGE_ROUTES.EXPLORE },
    { label: 'NFT' }
  ],
  [PAGE_ROUTES.ACTIVITY]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Activity' }
  ],
  [PAGE_ROUTES.RANKINGS]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Rankings' }
  ],
  [PAGE_ROUTES.STATS]: [
    { label: 'Home', path: PAGE_ROUTES.HOME },
    { label: 'Statistics' }
  ]
};

// Page Loading States
export const PAGE_LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Page Utilities
export const pageUtils = {
  /**
   * Get page metadata by route
   */
  getPageMetadata: (route) => {
    return PAGE_METADATA[route] || {
      title: 'NFT Marketplace',
      description: 'Discover, create, and trade NFTs',
      keywords: 'NFT, marketplace, digital art'
    };
  },
  
  /**
   * Check if page requires authentication
   */
  requiresAuth: (route) => {
    return PAGE_ACCESS_LEVELS[route] === PAGE_ACCESS.AUTHENTICATED;
  },
  
  /**
   * Check if page is public
   */
  isPublic: (route) => {
    return PAGE_ACCESS_LEVELS[route] === PAGE_ACCESS.PUBLIC;
  },
  
  /**
   * Get breadcrumb items for a route
   */
  getBreadcrumbs: (route, params = {}) => {
    const config = BREADCRUMB_CONFIG[route] || [];
    return config.map(item => ({
      ...item,
      path: item.path ? item.path.replace(/:([^/]+)/g, (match, param) => params[param] || match) : undefined
    }));
  },
  
  /**
   * Get navigation items by category
   */
  getNavigationByCategory: (category) => {
    return NAVIGATION_ITEMS.filter(item => item.category === category);
  },
  
  /**
   * Check if user can access page
   */
  canAccess: (route, user = null) => {
    const accessLevel = PAGE_ACCESS_LEVELS[route];
    
    switch (accessLevel) {
      case PAGE_ACCESS.PUBLIC:
        return true;
      case PAGE_ACCESS.AUTHENTICATED:
        return !!user;
      case PAGE_ACCESS.ADMIN:
        return user && user.role === 'admin';
      default:
        return false;
    }
  },
  
  /**
   * Generate page title with site name
   */
  generateTitle: (route, customTitle = null) => {
    const metadata = pageUtils.getPageMetadata(route);
    const title = customTitle || metadata.title;
    return title.includes('NFT Marketplace') ? title : `${title} | NFT Marketplace`;
  }
};

// Default exports for easier importing
export default {
  routes: PAGE_ROUTES,
  metadata: PAGE_METADATA,
  categories: PAGE_CATEGORIES,
  access: PAGE_ACCESS_LEVELS,
  navigation: NAVIGATION_ITEMS,
  breadcrumbs: BREADCRUMB_CONFIG,
  utils: pageUtils
};