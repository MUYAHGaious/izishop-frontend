import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AccountSummary = ({ profileData, onEditProfile, onManageAddresses, onManagePayments }) => {
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const getCompletionBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Account Summary</h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="Settings"
          onClick={onEditProfile}
        >
          Edit
        </Button>
      </div>

      {/* Profile Completion */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Profile Completion</span>
          <span className={`text-sm font-medium ${getCompletionColor(profileData.completionPercentage)}`}>
            {profileData.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-smooth ${getCompletionBgColor(profileData.completionPercentage)}`}
            style={{ width: `${profileData.completionPercentage}%` }}
          ></div>
        </div>
        {profileData.completionPercentage < 100 && (
          <p className="text-xs text-muted-foreground mt-1">
            Complete your profile to unlock all features
          </p>
        )}
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        {/* Personal Information */}
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Personal Info</h3>
              <p className="text-xs text-muted-foreground">
                {profileData.name} • {profileData.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="ChevronRight"
            onClick={onEditProfile}
          />
        </div>

        {/* Saved Addresses */}
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="MapPin" size={20} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Addresses</h3>
              <p className="text-xs text-muted-foreground">
                {profileData.savedAddresses} saved addresses
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="ChevronRight"
            onClick={onManageAddresses}
          />
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="CreditCard" size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Payment Methods</h3>
              <p className="text-xs text-muted-foreground">
                {profileData.paymentMethods} methods saved
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="ChevronRight"
            onClick={onManagePayments}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Bell"
            iconPosition="left"
            onClick={() => console.log('Notification preferences')}
          >
            Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Shield"
            iconPosition="left"
            onClick={() => console.log('Security settings')}
          >
            Security
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;