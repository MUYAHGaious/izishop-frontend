// Token migration utility for transitioning from old authToken to new access/refresh tokens
// This ensures users don't get logged out during the upgrade

export const migrateTokenStorage = () => {
  try {
    // Check if we have the old token but not the new ones
    const oldToken = localStorage.getItem('authToken');
    const newAccessToken = localStorage.getItem('accessToken');
    const newRefreshToken = localStorage.getItem('refreshToken');
    
    if (oldToken && !newAccessToken && !newRefreshToken) {
      console.log('Migrating token storage from legacy format...');
      
      // Move old token to new access token
      localStorage.setItem('accessToken', oldToken);
      
      // Note: We can't generate a refresh token client-side
      // The user will need to re-login to get a proper refresh token
      console.warn('Legacy token migrated. User may need to re-authenticate for full functionality.');
      
      // Keep the old token for now to avoid breaking existing sessions
      // It will be removed when the user logs out or the session expires
    }
    
    return true;
  } catch (error) {
    console.error('Token migration failed:', error);
    return false;
  }
};

// Clear legacy tokens after successful migration
export const cleanupLegacyTokens = () => {
  try {
    const newAccessToken = localStorage.getItem('accessToken');
    const newRefreshToken = localStorage.getItem('refreshToken');
    
    // Only cleanup if we have proper new tokens
    if (newAccessToken && newRefreshToken) {
      localStorage.removeItem('authToken');
      console.log('Legacy tokens cleaned up successfully');
    }
  } catch (error) {
    console.error('Legacy token cleanup failed:', error);
  }
};

// Check if tokens need migration
export const needsMigration = () => {
  const oldToken = localStorage.getItem('authToken');
  const newAccessToken = localStorage.getItem('accessToken');
  const newRefreshToken = localStorage.getItem('refreshToken');
  
  return !!oldToken && (!newAccessToken || !newRefreshToken);
};