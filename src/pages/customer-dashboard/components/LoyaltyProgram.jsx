import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LoyaltyProgram = ({ loyaltyData, onViewRewards, onRedeemPoints }) => {
  const getTierColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'Award';
      case 'silver':
        return 'Medal';
      case 'gold':
        return 'Crown';
      case 'platinum':
        return 'Gem';
      default:
        return 'Star';
    }
  };

  const getProgressToNextTier = () => {
    const current = loyaltyData.pointsThisYear;
    const required = loyaltyData.nextTierRequirement;
    return Math.min((current / required) * 100, 100);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Loyalty Program</h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="Gift"
          onClick={onViewRewards}
        >
          Rewards
        </Button>
      </div>

      {/* Current Tier */}
      <div className="mb-6">
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getTierColor(loyaltyData.currentTier)}`}>
          <Icon name={getTierIcon(loyaltyData.currentTier)} size={16} />
          <span className="text-sm font-medium capitalize">{loyaltyData.currentTier} Member</span>
        </div>
      </div>

      {/* Points Balance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
          <Icon name="Coins" size={24} className="text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-foreground">{loyaltyData.totalPoints.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">Total Points</p>
        </div>
        
        <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
          <Icon name="Gift" size={24} className="text-success mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-foreground">{loyaltyData.availableRewards}</h3>
          <p className="text-sm text-muted-foreground">Available Rewards</p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {loyaltyData.nextTier && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Progress to {loyaltyData.nextTier}
            </span>
            <span className="text-sm text-muted-foreground">
              {loyaltyData.pointsThisYear} / {loyaltyData.nextTierRequirement} points
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-smooth"
              style={{ width: `${getProgressToNextTier()}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {loyaltyData.nextTierRequirement - loyaltyData.pointsThisYear} points to next tier
          </p>
        </div>
      )}

      {/* Recent Rewards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Recent Rewards</h3>
        {loyaltyData.recentRewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon name="Gift" size={16} className="text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">{reward.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {reward.points} points • Expires {new Date(reward.expiryDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRedeemPoints(reward.id)}
              disabled={loyaltyData.totalPoints < reward.points}
            >
              Redeem
            </Button>
          </div>
        ))}
      </div>

      {/* Earn More Points */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Earn More Points</h3>
            <p className="text-xs text-muted-foreground">Complete purchases and refer friends</p>
          </div>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            onClick={() => console.log('View earning opportunities')}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;