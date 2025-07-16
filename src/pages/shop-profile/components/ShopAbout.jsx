import React from 'react';
import Icon from '../../../components/AppIcon';

const ShopAbout = ({ shop }) => {
  const businessHours = [
    { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const todayHours = businessHours.find(h => h.day === currentDay);
    if (todayHours?.hours === 'Closed') {
      return { status: 'closed', text: 'Closed today' };
    }
    
    // Simple check - in real app would parse actual hours
    const currentHour = now.getHours();
    if (currentHour >= 9 && currentHour < 18) {
      return { status: 'open', text: 'Open now' };
    }
    
    return { status: 'closed', text: 'Closed now' };
  };

  const dayStatus = getCurrentDayStatus();

  return (
    <div className="space-y-6">
      {/* Shop Description */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">About Our Shop</h3>
        <p className="text-text-secondary leading-relaxed">
          {shop.description}
        </p>
      </div>

      {/* Contact Information */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Icon name="Phone" size={20} className="text-primary" />
            <div>
              <div className="font-medium text-foreground">{shop.phone}</div>
              <div className="text-sm text-text-secondary">Usually responds within 2 hours</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={20} className="text-primary" />
            <div>
              <div className="font-medium text-foreground">{shop.email}</div>
              <div className="text-sm text-text-secondary">Email support available</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <div>
              <div className="font-medium text-foreground">Live Chat</div>
              <div className="text-sm text-text-secondary">Average response time: 15 minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Business Hours</h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            dayStatus.status === 'open' ?'bg-success/10 text-success' :'bg-error/10 text-error'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              dayStatus.status === 'open' ? 'bg-success' : 'bg-error'
            }`} />
            {dayStatus.text}
          </div>
        </div>
        
        <div className="space-y-2">
          {businessHours.map((schedule) => (
            <div key={schedule.day} className="flex justify-between items-center py-1">
              <span className="text-foreground font-medium">{schedule.day}</span>
              <span className={`text-sm ${
                schedule.hours === 'Closed' ? 'text-error' : 'text-text-secondary'
              }`}>
                {schedule.hours}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Icon name="MapPin" size={20} className="text-primary mt-0.5" />
            <div>
              <div className="font-medium text-foreground">{shop.address}</div>
              <div className="text-sm text-text-secondary">{shop.city}, {shop.region}</div>
            </div>
          </div>
          
          {/* Map */}
          <div className="w-full h-48 rounded-lg overflow-hidden border border-border">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title={`${shop.name} Location`}
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${shop.coordinates.lat},${shop.coordinates.lng}&z=15&output=embed`}
            />
          </div>
        </div>
      </div>

      {/* Business Registration */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-text-secondary mb-1">Business Registration</div>
            <div className="font-medium text-foreground">{shop.registrationNumber}</div>
          </div>
          
          <div>
            <div className="text-sm text-text-secondary mb-1">Tax ID</div>
            <div className="font-medium text-foreground">{shop.taxId}</div>
          </div>
          
          <div>
            <div className="text-sm text-text-secondary mb-1">Established</div>
            <div className="font-medium text-foreground">{shop.establishedYear}</div>
          </div>
          
          <div>
            <div className="text-sm text-text-secondary mb-1">Business Type</div>
            <div className="font-medium text-foreground">{shop.businessType}</div>
          </div>
        </div>
        
        {/* Certifications */}
        {shop.certifications && shop.certifications.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-text-secondary mb-2">Certifications</div>
            <div className="flex flex-wrap gap-2">
              {shop.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success"
                >
                  <Icon name="Shield" size={12} className="mr-1" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopAbout;