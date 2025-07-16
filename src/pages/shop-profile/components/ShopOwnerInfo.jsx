import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ShopOwnerInfo = ({ owner }) => {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Shop Owner</h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Owner Photo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-border">
            <Image
              src={owner.photo}
              alt={owner.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Owner Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-text-primary">{owner.name}</h4>
            {owner.isVerified && (
              <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                <Icon name="Check" size={12} color="white" />
              </div>
            )}
          </div>
          
          <p className="text-text-secondary text-sm mb-3 leading-relaxed">{owner.bio}</p>
          
          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Icon name="Mail" size={14} />
              <span>{owner.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Icon name="Phone" size={14} />
              <span>{owner.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Icon name="Calendar" size={14} />
              <span>Member since {owner.memberSince}</span>
            </div>
          </div>

          {/* Certifications */}
          {owner.certifications && owner.certifications.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-text-primary mb-2">Certifications</h5>
              <div className="flex flex-wrap gap-2">
                {owner.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                    <Icon name="Award" size={12} className="text-accent" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerInfo;