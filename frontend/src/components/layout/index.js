// Layout Components
export { default as Layout } from './Layout';
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as Footer } from './Footer';

// Header Components
export {
  Logo,
  QuickSearch,
  NotificationMenu,
  UserMenu
} from './Header';

// Sidebar Components
export {
  SidebarContent,
  NavItem,
  MarketStats,
  FeaturedCollections
} from './Sidebar';

// Footer Components
export {
  NewsletterSubscription,
  SocialLinks,
  QuickStats,
  FooterSection
} from './Footer';

// Layout Constants
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: '73px',
  SIDEBAR_WIDTH: '280px',
  SIDEBAR_COLLAPSED_WIDTH: '60px',
  FOOTER_HEIGHT: 'auto',
  CONTAINER_MAX_WIDTH: 'container.xl',
  MOBILE_BREAKPOINT: 'lg'
};

// Layout Variants
export const LAYOUT_VARIANTS = {
  DEFAULT: 'default',
  MINIMAL: 'minimal',
  FULL_WIDTH: 'fullWidth',
  CENTERED: 'centered'
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    label: 'Home',
    path: '/',
    icon: 'FiHome',
    exact: true
  },
  {
    label: 'Explore',
    path: '/explore',
    icon: 'FiCompass',
    children: [
      { label: 'All NFTs', path: '/explore' },
      { label: 'Art', path: '/explore/art' },
      { label: 'Music', path: '/explore/music' },
      { label: 'Photography', path: '/explore/photography' },
      { label: 'Gaming', path: '/explore/gaming' },
      { label: 'Sports', path: '/explore/sports' }
    ]
  },
  {
    label: 'Collections',
    path: '/collections',
    icon: 'FiGrid'
  },
  {
    label: 'Rankings',
    path: '/rankings',
    icon: 'FiTrendingUp'
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: 'FiActivity'
  }
];

// Layout Themes
export const LAYOUT_THEMES = {
  light: {
    header: {
      bg: 'white',
      borderColor: 'gray.200',
      color: 'gray.800'
    },
    sidebar: {
      bg: 'white',
      borderColor: 'gray.200',
      color: 'gray.800',
      activeBg: 'blue.50',
      activeColor: 'blue.600',
      hoverBg: 'gray.100'
    },
    footer: {
      bg: 'gray.50',
      borderColor: 'gray.200',
      color: 'gray.600'
    }
  },
  dark: {
    header: {
      bg: 'gray.800',
      borderColor: 'gray.600',
      color: 'white'
    },
    sidebar: {
      bg: 'gray.800',
      borderColor: 'gray.600',
      color: 'white',
      activeBg: 'blue.900',
      activeColor: 'blue.200',
      hoverBg: 'gray.700'
    },
    footer: {
      bg: 'gray.900',
      borderColor: 'gray.700',
      color: 'gray.400'
    }
  }
};

// Layout Utilities
export const layoutUtils = {
  /**
   * Get responsive sidebar width
   */
  getSidebarWidth: (isCollapsed = false, showSidebar = true) => {
    if (!showSidebar) return 0;
    return isCollapsed ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH : LAYOUT_CONSTANTS.SIDEBAR_WIDTH;
  },
  
  /**
   * Get main content margin
   */
  getMainContentMargin: (isCollapsed = false, showSidebar = true, isMobile = false) => {
    if (isMobile || !showSidebar) return 0;
    return layoutUtils.getSidebarWidth(isCollapsed, showSidebar);
  },
  
  /**
   * Check if current path is active
   */
  isActivePath: (currentPath, itemPath, exact = false) => {
    if (exact) {
      return currentPath === itemPath;
    }
    return currentPath.startsWith(itemPath);
  },
  
  /**
   * Get layout variant styles
   */
  getLayoutVariantStyles: (variant) => {
    switch (variant) {
      case LAYOUT_VARIANTS.MINIMAL:
        return {
          showSidebar: false,
          showFooter: false,
          containerProps: { maxW: 'container.lg' }
        };
      case LAYOUT_VARIANTS.FULL_WIDTH:
        return {
          showSidebar: true,
          showFooter: true,
          containerProps: { maxW: 'full', px: 8 }
        };
      case LAYOUT_VARIANTS.CENTERED:
        return {
          showSidebar: false,
          showFooter: true,
          containerProps: { maxW: 'container.md' }
        };
      default:
        return {
          showSidebar: true,
          showFooter: true,
          containerProps: { maxW: 'container.xl' }
        };
    }
  }
};

// Layout Hooks
export const useLayoutConfig = (variant = LAYOUT_VARIANTS.DEFAULT) => {
  const config = layoutUtils.getLayoutVariantStyles(variant);
  
  return {
    ...config,
    constants: LAYOUT_CONSTANTS,
    variants: LAYOUT_VARIANTS,
    themes: LAYOUT_THEMES
  };
};

// Layout Context (if needed)
export const LayoutContext = React.createContext({
  variant: LAYOUT_VARIANTS.DEFAULT,
  isCollapsed: false,
  isMobile: false,
  showSidebar: true,
  showFooter: true
});

// Layout Provider
export const LayoutProvider = ({ children, variant = LAYOUT_VARIANTS.DEFAULT }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  const config = useLayoutConfig(variant);
  
  const value = {
    variant,
    isCollapsed,
    setIsCollapsed,
    isMobile,
    setIsMobile,
    ...config
  };
  
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Layout Hook
export const useLayout = () => {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Higher-Order Components
export const withLayout = (Component, layoutProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <Layout {...layoutProps}>
        <Component {...props} />
      </Layout>
    );
  };
};

export const withMinimalLayout = (Component) => {
  return withLayout(Component, { 
    showSidebar: false, 
    showFooter: false 
  });
};

export const withFullWidthLayout = (Component) => {
  return withLayout(Component, {
    showSidebar: true,
    showFooter: true,
    containerProps: { maxW: 'full', px: 8 }
  });
};

// Layout Animation Variants
export const layoutAnimations = {
  sidebar: {
    expanded: {
      width: LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    collapsed: {
      width: LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  },
  content: {
    withSidebar: {
      marginLeft: LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    withCollapsedSidebar: {
      marginLeft: LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    fullWidth: {
      marginLeft: 0,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  },
  header: {
    scrolled: {
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.2 }
    },
    top: {
      backdropFilter: 'none',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: 'none',
      transition: { duration: 0.2 }
    }
  }
};

// Layout Responsive Breakpoints
export const LAYOUT_BREAKPOINTS = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

// Layout Z-Index Scale
export const LAYOUT_Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
};

// Default Props
export const defaultLayoutProps = {
  showSidebar: true,
  showFooter: true,
  variant: LAYOUT_VARIANTS.DEFAULT,
  containerProps: {
    maxW: LAYOUT_CONSTANTS.CONTAINER_MAX_WIDTH,
    py: 8,
    px: { base: 4, md: 8 }
  }
};

// Export React for context usage
import React from 'react';