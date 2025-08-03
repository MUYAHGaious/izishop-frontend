import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const SessionExpiryWarning = () => {
  // Temporarily restored to ensure app functionality
  // TODO: Replace with silent session management after fixing errors
  return null;
};

export default SessionExpiryWarning;