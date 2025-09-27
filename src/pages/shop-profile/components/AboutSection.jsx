import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { MapPin, Phone, Mail, Globe, Clock, Truck, Shield, Headphones, Award, ChevronDown, ChevronUp, Users, Star, TrendingUp, Package, Calendar, ExternalLink } from 'lucide-react';
import api from '../../../services/api';

const AboutSection = ({ shop }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load real about data
  useEffect(() => {
    const loadAboutData = async () => {
      if (!shop?.id) return;
      
      try {
        setLoading(true);
        const response = await api.getShopAbout(shop.id);
        setAboutData(response.data || response);
      } catch (error) {
        console.error('Error loading about data:', error);
        // Fallback to shop prop data
        setAboutData(shop);
      } finally {
        setLoading(false);
      }
    };

    loadAboutData();
  }, [shop?.id]);

  // Safety check for shop data
  if (!shop) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading shop information...</div>
        </div>
      </div>
    );
  }

  // Use aboutData if available, otherwise fallback to shop
  const data = aboutData || shop;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  // Parse JSON data safely
  const businessHours = data.business_hours || [
    { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const policies = data.policies || [
    {
      title: 'Return Policy',
      description: '30-day return policy for all items in original condition with receipt.',
      icon: 'RotateCcw'
    },
    {
      title: 'Shipping Policy',
      description: 'Free shipping on orders over 50,000 XAF. Standard delivery 2-5 business days.',
      icon: 'Truck'
    },
    {
      title: 'Warranty',
      description: 'All electronics come with manufacturer warranty. Extended warranty available.',
      icon: 'Shield'
    },
    {
      title: 'Customer Support',
      description: '24/7 customer support via chat, email, or phone. Average response time: 2 hours.',
      icon: 'Headphones'
    }
  ];

  // Shop story and milestones
  const milestones = data.milestones || [
    {
      year: "2020",
      title: "Shop Founded",
      description: "Started our journey with a small local store",
      icon: Package
    },
    {
      year: "2021",
      title: "Online Expansion",
      description: "Launched our e-commerce platform",
      icon: TrendingUp
    },
    {
      year: "2022",
      title: "1000+ Customers",
      description: "Reached our first thousand satisfied customers",
      icon: Users
    },
    {
      year: "2023",
      title: "Premium Seller",
      description: "Achieved premium seller status",
      icon: Award
    }
  ];

  const teamMembers = data.team_members || [
    {
      name: "John Doe",
      role: "Founder & CEO",
      experience: "10+ years in retail",
      image: null
    },
    {
      name: "Jane Smith",
      role: "Customer Service Manager",
      experience: "5+ years in customer service",
      image: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Shop Description with Story */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Our Story</h3>
          <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
            Est. {shop.created_at ? new Date(shop.created_at).getFullYear() : '2024'}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 mb-6">
          <p className="text-lg leading-relaxed mb-4">
            {data.description || "Welcome to our shop! We are passionate about providing quality products and exceptional customer service to our community."}
          </p>
          <p className="mb-4">
            {data.mission || "Our mission is to deliver high-quality products that enhance our customers' lives while building lasting relationships based on trust and excellence."}
          </p>
          <p>
            {data.vision || "We envision becoming the go-to destination for customers seeking reliable products and outstanding service in our region."}
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">{data.total_sales ? Math.floor(data.total_sales / 1000) + 'K' : '0'}</div>
            <div className="text-sm text-gray-600">Sales Made</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{data.product_count || 0}</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{data.followers_count || 0}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{(data.average_rating || 0).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>
      </div>

      {/* Shop Milestones */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Our Journey</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const IconComponent = milestone.icon;
              return (
                <div key={index} className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center relative z-10">
                    <IconComponent size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">{milestone.year}</span>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MapPin size={18} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Address</div>
                <div className="text-gray-600">{data.address || 'Address not specified'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Phone</div>
                <div className="text-gray-600">{data.phone || 'Phone not available'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Email</div>
                <div className="text-gray-600">{data.email || 'Email not available'}</div>
              </div>
            </div>

            {data.website && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Website</div>
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    {data.website}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Business Hours</h3>
          <div className="space-y-2">
            {businessHours.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-text-primary font-medium">{schedule.day}</span>
                <span className={`text-sm ${
                  schedule.hours === 'Closed' ? 'text-error' : 'text-text-secondary'
                }`}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Shop Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy, index) => (
            <div key={index} className="flex gap-3 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={policy.icon} size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-1">{policy.title}</h4>
                <p className="text-sm text-text-secondary">{policy.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Map - Professional Interactive */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={16} />
            <span>Interactive Map</span>
          </div>
        </div>
        
        {/* Address Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-500 rounded-xl">
              <MapPin size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Shop Address</div>
              <div className="text-gray-700 mb-2">{data.address || 'Address not specified'}</div>
              {data.phone && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {data.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Map Container */}
        <div className="relative">
          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-gray-100">
            {data.address ? (
              <div className="relative w-full h-full">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title={`${data.name} location`}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(data.address)}&output=embed&z=15`}
                  style={{ border: 0 }}
                  allowFullScreen
                  className="w-full h-full"
                />
                {/* Custom Pin Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
              </div>
            ) : data.coordinates && data.coordinates.lat !== 0 && data.coordinates.lng !== 0 ? (
              <div className="relative w-full h-full">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
                  title={`${data.name} location`}
            referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${data.coordinates.lat},${data.coordinates.lng}&output=embed&z=15`}
                  style={{ border: 0 }}
                  allowFullScreen
                  className="w-full h-full"
                />
                {/* Custom Pin Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-gray-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Location Not Available</h4>
                  <p className="text-sm text-center px-4 mb-4">
                    {data.address ? 'Unable to load map for this address' : 'No address or coordinates provided'}
                  </p>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.name)}`, '_blank')}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Open in Google Maps
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Map Overlay Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.name)}`, '_blank')}
              className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
              title="Open in Google Maps"
            >
              <ExternalLink size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/maps/directions/?api=1&destination=${encodeURIComponent(data.address || data.name)}`, '_blank')}
              className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
              title="Get Directions"
            >
              <MapPin size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button 
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.name)}`, '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ExternalLink size={16} />
            Open in Google Maps
          </button>
          <button 
            onClick={() => window.open(`https://www.google.com/maps/directions/?api=1&destination=${encodeURIComponent(data.address || data.name)}`, '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <MapPin size={16} />
            Get Directions
          </button>
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                  const { latitude, longitude } = position.coords;
                  window.open(`https://www.google.com/maps/directions/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(data.address || data.name)}`, '_blank');
                });
              } else {
                window.open(`https://www.google.com/maps/directions/?api=1&destination=${encodeURIComponent(data.address || data.name)}`, '_blank');
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MapPin size={16} />
            Directions from My Location
          </button>
        </div>

        {/* Map Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span>Interactive map powered by Google Maps</span>
          </div>
        </div>
      </div>

      {/* Certifications & Awards */}
      {data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Certifications & Awards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Icon name="Award" size={20} className="text-accent" />
                <div>
                  <div className="font-medium text-text-primary">{cert.name}</div>
                  <div className="text-sm text-text-secondary">{cert.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;