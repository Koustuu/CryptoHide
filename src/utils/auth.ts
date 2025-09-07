/**
 * Utility functions for authentication and session management
 */

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = ['/encode', '/decode'];
  return protectedRoutes.includes(pathname);
};

/**
 * Get user-friendly route names for display
 */
export const getRouteDisplayName = (pathname: string): string => {
  const routeNames: Record<string, string> = {
    '/encode': 'Encode Messages',
    '/decode': 'Decode Messages',
    '/': 'Home'
  };
  
  return routeNames[pathname] || 'Steganography Features';
};

/**
 * Get the appropriate steganography feature name based on route
 */
export const getSteganographyFeatureName = (pathname: string): string => {
  switch (pathname) {
    case '/encode':
      return 'message encoding';
    case '/decode':
      return 'message decoding';
    default:
      return 'steganography features';
  }
};

/**
 * Generate authentication prompt message based on intended route
 */
export const getAuthPromptMessage = (intendedRoute: string): string => {
  const featureName = getSteganographyFeatureName(intendedRoute);
  return `Please log in to access ${featureName}`;
};

/**
 * Check if user is trying to access steganography features
 */
export const isSteganographyRoute = (pathname: string): boolean => {
  return pathname === '/encode' || pathname === '/decode';
};

/**
 * Validate redirect URL to prevent open redirect vulnerabilities
 */
export const isValidRedirectUrl = (url: string): boolean => {
  // Only allow relative URLs that start with /
  if (!url.startsWith('/')) {
    return false;
  }
  
  // Prevent protocol-relative URLs
  if (url.startsWith('//')) {
    return false;
  }
  
  // Allow only specific routes
  const allowedRoutes = ['/', '/encode', '/decode', '/about'];
  return allowedRoutes.includes(url);
};
