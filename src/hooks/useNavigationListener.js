/**
 * Custom hook for handling browser navigation events in React Router v6 (2025)
 * Fixes issues where browser back/forward buttons don't update page content
 */
import { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { UNSAFE_NavigationContext } from "react-router-dom";

// Navigation types enum for clarity
export const NavigationType = {
  Pop: "POP",
  Push: "PUSH",
  Replace: "REPLACE"
};

/**
 * Hook to listen for browser back/forward button navigation
 * @param {function} callback - Function to call when navigation occurs
 */
export const useBackListener = (callback) => {
  const navigator = useContext(UNSAFE_NavigationContext).navigator;
  const initialRender = useRef(true);
  
  useEffect(() => {
    // Skip initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    const listener = ({ location, action }) => {
      // Only trigger on POP actions (back/forward button)
      if (action === "POP") {
        console.log('Browser back/forward detected:', { location, action });
        callback({ location, action });
      }
    };
    
    // Listen to navigation events
    const unlisten = navigator.listen(listener);
    
    // Cleanup listener on unmount
    return unlisten;
  }, [callback, navigator]);
};

/**
 * Hook to ensure component re-renders on route changes
 * Fixes issue where URL changes but component doesn't update
 */
export const useRouteRefresh = (callback) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const initialRender = useRef(true);
  
  useEffect(() => {
    // Skip initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    console.log('Route changed:', { 
      pathname: location.pathname, 
      search: location.search,
      navigationType 
    });
    
    // Call callback on any route change
    if (callback) {
      callback({ location, navigationType });
    }
  }, [location, navigationType, callback]); // Use entire location object as dependency
};

/**
 * Combined hook for comprehensive navigation handling
 * Ensures components properly update on all navigation events
 */
export const useNavigationHandler = (options = {}) => {
  const { 
    onRouteChange, 
    onBackNavigation, 
    logNavigation = false 
  } = options;
  
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Handle general route changes
  useRouteRefresh(onRouteChange);
  
  // Handle specific back/forward navigation
  useBackListener(onBackNavigation);
  
  // Optional navigation logging for debugging
  useEffect(() => {
    if (logNavigation) {
      console.log('🧭 Navigation Event:', {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
        type: navigationType,
        timestamp: new Date().toISOString()
      });
    }
  }, [location, navigationType, logNavigation]);
  
  return { location, navigationType };
};