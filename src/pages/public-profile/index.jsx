import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState({
    orders: 0,
    reviews: 0,
    following: 0,
    followers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (currentUser && profileUser) {
      setIsOwnProfile(currentUser.id === profileUser.id);
      checkFollowStatus();
    }
  }, [currentUser, profileUser]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Check if viewing own profile
      if (currentUser && (currentUser.id === userId || currentUser.id === parseInt(userId))) {
        // Use current user data for own profile including any uploaded images
        const userData = {
          ...currentUser,
          // Get images from localStorage if they were uploaded in current session
          profile_image_url: localStorage.getItem(`profile_image_${currentUser.id}`) || currentUser.profile_image_url,
          cover_image_url: localStorage.getItem(`cover_image_${currentUser.id}`) || currentUser.cover_image_url
        };
        setProfileUser(userData);
        await Promise.all([
          fetchPublicStats(),
          fetchPublicActivity()
        ]);
        return;
      }
      
      // Try to fetch other user's profile from API
      try {
        const response = await api.get(`/users/${userId}/profile`);
        setProfileUser(response.data.user);
        
        await Promise.all([
          fetchPublicStats(),
          fetchPublicActivity()
        ]);
      } catch (apiError) {
        // API not available - show mock data for development
        console.log('API not available, using mock data for user:', userId);
        
        // Create mock user data for development
        const mockUser = {
          id: userId,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          role: 'CUSTOMER',
          phone: '+237 XXX XXX XXX',
          profile_image_url: null,
          cover_image_url: null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        setProfileUser(mockUser);
        
        // Set mock stats
        setProfileStats({
          orders: Math.floor(Math.random() * 10),
          reviews: Math.floor(Math.random() * 5),
          following: Math.floor(Math.random() * 20),
          followers: Math.floor(Math.random() * 15)
        });
        
        // Set mock activity
        setRecentActivity([
          {
            type: 'order',
            title: 'Placed an order',
            description: 'Ordered electronics items',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      showToast('User not found', 'error');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicStats = async () => {
    try {
      const response = await api.get(`/users/${userId}/stats/public`);
      setProfileStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
      
      // Get user-specific stats from localStorage or use defaults
      const savedStats = localStorage.getItem(`user_stats_${userId}`);
      if (savedStats) {
        setProfileStats(JSON.parse(savedStats));
      } else {
        // Create user-specific default stats based on their activity
        const userSpecificStats = {
          orders: currentUser && currentUser.id === userId ? 0 : Math.floor(Math.random() * 10),
          reviews: currentUser && currentUser.id === userId ? 0 : Math.floor(Math.random() * 5),
          following: currentUser && currentUser.id === userId ? 0 : Math.floor(Math.random() * 20),
          followers: currentUser && currentUser.id === userId ? 0 : Math.floor(Math.random() * 15)
        };
        
        setProfileStats(userSpecificStats);
        // Save for consistency
        localStorage.setItem(`user_stats_${userId}`, JSON.stringify(userSpecificStats));
      }
    }
  };

  const fetchPublicActivity = async () => {
    try {
      const response = await api.get(`/users/${userId}/activity/public`);
      setRecentActivity(response.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch public activity:', error);
      
      // Get user-specific activity from localStorage or create new
      const savedActivity = localStorage.getItem(`user_activity_${userId}`);
      if (savedActivity) {
        setRecentActivity(JSON.parse(savedActivity));
      } else {
        // Create user-specific activity
        const userSpecificActivity = currentUser && currentUser.id === userId ? [
          {
            type: 'system',
            title: 'Joined IziShop',
            description: 'Welcome to the platform!',
            created_at: currentUser.created_at || new Date().toISOString()
          }
        ] : [
          {
            type: 'order',
            title: 'Placed an order',
            description: 'Ordered electronics items',
            created_at: new Date(Date.now() - 300000).toISOString()
          }
        ];
        
        setRecentActivity(userSpecificActivity);
        // Save for consistency
        localStorage.setItem(`user_activity_${userId}`, JSON.stringify(userSpecificActivity));
      }
    }
  };

  const checkFollowStatus = async () => {
    if (!isAuthenticated() || isOwnProfile) return;
    
    try {
      const response = await api.get(`/users/${userId}/follow-status`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
      
      // Check localStorage for follow status
      const savedFollowStatus = localStorage.getItem(`follow_status_${currentUser.id}_${userId}`);
      setIsFollowing(savedFollowStatus === 'true');
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated()) {
      showToast('Please login to follow users', 'info');
      navigate('/authentication-login-register');
      return;
    }

    try {
      if (isFollowing) {
        // Try API call, fallback to local state update
        try {
          await api.post(`/users/${userId}/unfollow`);
        } catch (apiError) {
          console.log('API not available, updating locally');
        }
        setIsFollowing(false);
        setProfileStats(prev => {
          const newStats = { ...prev, followers: Math.max(0, prev.followers - 1) };
          // Save updated stats to localStorage
          localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
          return newStats;
        });
        
        // Save follow status to localStorage
        localStorage.setItem(`follow_status_${currentUser.id}_${userId}`, 'false');
        showToast('Unfollowed successfully', 'success');
      } else {
        // Try API call, fallback to local state update
        try {
          await api.post(`/users/${userId}/follow`);
        } catch (apiError) {
          console.log('API not available, updating locally');
        }
        setIsFollowing(true);
        setProfileStats(prev => {
          const newStats = { ...prev, followers: prev.followers + 1 };
          // Save updated stats to localStorage
          localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
          return newStats;
        });
        
        // Save follow status to localStorage
        localStorage.setItem(`follow_status_${currentUser.id}_${userId}`, 'true');
        showToast('Following successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      showToast('Follow feature in development mode', 'info');
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated()) {
      showToast('Please login to send messages', 'info');
      navigate('/authentication-login-register');
      return;
    }
    // Show info about messaging feature
    showToast('Messaging feature coming soon', 'info');
    // TODO: Navigate to chat with this user when implemented
    // navigate(`/chat?user=${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return 'Package';
      case 'review': return 'Star';
      case 'follow': return 'UserPlus';
      case 'shop': return 'Store';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'follow': return 'text-green-600 bg-green-50';
      case 'shop': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 flex flex-col items-center justify-center h-64">
          <Icon name="UserX" size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">User Not Found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 lg:pb-8">
        {/* Cover/Header Section */}
        <div className="relative">
          <div 
            className="h-48 sm:h-56 lg:h-72 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center"
            style={{
              backgroundImage: profileUser.cover_image_url ? `url(${profileUser.cover_image_url})` : 'none'
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 sm:left-6 sm:transform-none">
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {profileUser.profile_image_url ? (
                  <img 
                    src={profileUser.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-3xl font-bold text-white">
                    {profileUser.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 pt-20 pb-6">
            <div className="text-center sm:text-left sm:flex sm:items-end sm:justify-between">
              <div className="sm:ml-40">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profileUser.first_name} {profileUser.last_name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {profileUser.role === 'SHOP_OWNER' ? 'Shop Owner' : profileUser.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </p>
                
                {/* Public Stats */}
                <div className="flex justify-center sm:justify-start space-x-6 text-sm text-gray-600 mb-4">
                  <span><strong className="text-gray-900">{profileStats.orders}</strong> Orders</span>
                  <span><strong className="text-gray-900">{profileStats.reviews}</strong> Reviews</span>
                  <span><strong className="text-gray-900">{profileStats.following}</strong> Following</span>
                  <span><strong className="text-gray-900">{profileStats.followers}</strong> Followers</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center sm:justify-end space-x-3 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/user-profile')}
                    iconName="Edit"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                      iconName={isFollowing ? "UserMinus" : "UserPlus"}
                      size="sm"
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMessage}
                      iconName="MessageCircle"
                      size="sm"
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - About & Activity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="User" size={20} className="mr-2 text-blue-600" />
                  About
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Icon name="Calendar" size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(profileUser.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Clock" size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Last active</p>
                      <p className="text-sm font-medium text-gray-900">{formatLastActive(profileUser.last_login)}</p>
                    </div>
                  </div>
                  {profileUser.phone && (
                    <div className="flex items-center space-x-3">
                      <Icon name="Phone" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{profileUser.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">Cameroon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="Activity" size={20} className="mr-2 text-blue-600" />
                  Recent Activity
                </h2>
                
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <Icon name={getActivityIcon(activity.type)} size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatLastActive(activity.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Activity" size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Actions */}
            <div className="space-y-6">
              
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="Mail" size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Contact via messaging</span>
                  </div>
                  {profileUser.phone && (
                    <div className="flex items-center space-x-3">
                      <Icon name="Phone" size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{profileUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Cameroon</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {!isOwnProfile && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleFollowToggle}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-blue-50 rounded-lg transition-colors text-left active:scale-95"
                    >
                      <Icon name={isFollowing ? "UserMinus" : "UserPlus"} size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{isFollowing ? 'Unfollow' : 'Follow'}</span>
                    </button>
                    
                    <button
                      onClick={handleMessage}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-green-50 rounded-lg transition-colors text-left active:scale-95"
                    >
                      <Icon name="MessageCircle" size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Send Message</span>
                    </button>
                    
                    <button
                      onClick={() => showToast('Report feature coming soon', 'info')}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-red-50 rounded-lg transition-colors text-left active:scale-95"
                    >
                      <Icon name="Flag" size={20} className="text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Report User</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Shop Link for Shop Owners */}
              {profileUser.role === 'SHOP_OWNER' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop</h3>
                  <button
                    onClick={() => navigate(`/my-shop-profile/${profileUser.shop_id || profileUser.id}`)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-purple-50 rounded-lg transition-colors text-left active:scale-95"
                  >
                    <Icon name="Store" size={20} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Visit Shop</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomTab />
    </div>
  );
};

export default PublicProfile;