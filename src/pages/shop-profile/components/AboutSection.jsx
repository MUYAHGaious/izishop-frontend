import React from 'react';
import Icon from '../../../components/AppIcon';

const AboutSection = ({ shop }) => {
  const businessHours = [
    { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const policies = [
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

  return (
    <div className="space-y-6">
      {/* Shop Description */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">About Our Shop</h3>
        <div className="prose prose-sm max-w-none text-text-secondary">
          <p className="mb-4">{shop.description}</p>
          <p className="mb-4">{shop.mission}</p>
          <p>{shop.vision}</p>
        </div>
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon name="MapPin" size={18} className="text-primary" />
              <div>
                <div className="font-medium text-text-primary">Address</div>
                <div className="text-text-secondary">{shop.address}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Icon name="Phone" size={18} className="text-primary" />
              <div>
                <div className="font-medium text-text-primary">Phone</div>
                <div className="text-text-secondary">{shop.phone}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Icon name="Mail" size={18} className="text-primary" />
              <div>
                <div className="font-medium text-text-primary">Email</div>
                <div className="text-text-secondary">{shop.email}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Icon name="Globe" size={18} className="text-primary" />
              <div>
                <div className="font-medium text-text-primary">Website</div>
                <div className="text-text-secondary">{shop.website}</div>
              </div>
            </div>
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

      {/* Location Map */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Location</h3>
        <div className="w-full h-64 rounded-lg overflow-hidden border border-border">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={shop.name}
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${shop.coordinates.lat},${shop.coordinates.lng}&z=14&output=embed`}
          />
        </div>
      </div>

      {/* Certifications & Awards */}
      {shop.certifications && shop.certifications.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Certifications & Awards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shop.certifications.map((cert, index) => (
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