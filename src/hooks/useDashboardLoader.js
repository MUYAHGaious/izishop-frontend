// EMERGENCY: COMPLETELY DISABLED TO STOP INFINITE LOOP
// This file was causing 1000+ API calls per minute

const useDashboardLoader = () => {
  // Return static empty state to break the loop
  return { 
    data: null, 
    isLoading: false, 
    error: null,
    loadData: () => Promise.resolve(null),
    refreshData: () => Promise.resolve(null)
  };
};

export { useDashboardLoader };
export default useDashboardLoader;