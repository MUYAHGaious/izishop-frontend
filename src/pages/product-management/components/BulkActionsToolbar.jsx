import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsToolbar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = useState('');

  const bulkActionOptions = [
    { value: '', label: 'Select action...' },
    { value: 'activate', label: 'Activate Products' },
    { value: 'deactivate', label: 'Deactivate Products' },
    { value: 'draft', label: 'Move to Draft' },
    { value: 'delete', label: 'Delete Products' },
    { value: 'update-category', label: 'Update Category' },
    { value: 'update-price', label: 'Update Pricing' }
  ];

  const handleApplyAction = () => {
    if (selectedAction && selectedCount > 0) {
      onBulkAction(selectedAction);
      setSelectedAction('');
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconSize={16}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-48">
            <Select
              options={bulkActionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Select action..."
            />
          </div>
          <Button
            variant="default"
            onClick={handleApplyAction}
            disabled={!selectedAction}
            iconName="Play"
            iconPosition="left"
            iconSize={16}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-primary/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('activate')}
          iconName="Eye"
          iconPosition="left"
          iconSize={14}
        >
          Activate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('deactivate')}
          iconName="EyeOff"
          iconPosition="left"
          iconSize={14}
        >
          Deactivate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('draft')}
          iconName="FileText"
          iconPosition="left"
          iconSize={14}
        >
          Draft
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('delete')}
          iconName="Trash2"
          iconPosition="left"
          iconSize={14}
          className="text-error hover:text-error border-error/20 hover:border-error/40"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;