import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isProtectedRoute, getAuthPromptMessage } from '../../utils/auth';
import AuthPromptModal from './AuthPromptModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, setIntendedRoute } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated and trying to access a protected route,
    // store the intended route for post-login redirect
    if (!isAuthenticated && !isLoading && isProtectedRoute(location.pathname)) {
      setIntendedRoute(location.pathname);
    }
  }, [isAuthenticated, isLoading, location.pathname, setIntendedRoute]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If route is protected and user is not authenticated, show auth prompt modal
  if (isProtectedRoute(location.pathname) && !isAuthenticated) {
    const promptMessage = getAuthPromptMessage(location.pathname);
    
    return (
      <AuthPromptModal 
        isOpen={true}
        message={promptMessage}
        intendedRoute={location.pathname}
      />
    );
  }

  // If authenticated or route is not protected, render children
  return <>{children}</>;
};

export default ProtectedRoute;
