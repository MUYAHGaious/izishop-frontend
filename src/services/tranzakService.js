/**
 * Tranzak Payment Service Integration
 * Handles payment processing using Tranzak API
 * Uses sandbox environment for development
 */

import api from './api';

class TranzakService {
  constructor() {
    // Sandbox configuration - replace with production values when deploying
    this.config = {
      baseURL: 'https://api.tranzak.net',
      sandboxBaseURL: 'https://api.sandbox.tranzak.net',
      appId: import.meta.env.VITE_TRANZAK_APP_ID || 'SAND_C1B041767BBA4B5D808D91AFB18002A5',
      appKey: import.meta.env.VITE_TRANZAK_APP_KEY || '',
      environment: import.meta.env.MODE === 'production' ? 'production' : 'sandbox'
    };

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get the appropriate base URL based on environment
   */
  getBaseURL() {
    return this.config.environment === 'production'
      ? this.config.baseURL
      : this.config.sandboxBaseURL;
  }

  /**
   * Authenticate with Tranzak API and get access token
   */
  async authenticate() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await fetch(`${this.getBaseURL()}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          app_key: this.config.appKey
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 1 hour from now (adjust based on actual API response)
      this.tokenExpiry = Date.now() + (60 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Tranzak authentication error:', error);
      throw error;
    }
  }

  /**
   * Create a payment request
   */
  async createPaymentRequest(paymentData) {
    try {
      const token = await this.authenticate();

      const requestData = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'XAF', // Central African CFA franc
        description: paymentData.description || 'IziShopin Order Payment',
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        customer_name: paymentData.customerName,
        redirect_url: paymentData.redirectUrl || `${window.location.origin}/checkout/success`,
        cancel_url: paymentData.cancelUrl || `${window.location.origin}/checkout/cancel`,
        webhook_url: paymentData.webhookUrl || `${window.location.origin}/api/webhooks/tranzak`,
        reference: paymentData.reference || `ORDER_${Date.now()}`,
        metadata: {
          order_id: paymentData.orderId,
          customer_id: paymentData.customerId,
          ...paymentData.metadata
        }
      };

      const response = await fetch(`${this.getBaseURL()}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment request failed: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create payment request error:', error);
      throw error;
    }
  }

  /**
   * Process mobile money payment (MTN MoMo, Orange Money)
   */
  async processDirectCharge(chargeData) {
    try {
      const token = await this.authenticate();

      const requestData = {
        amount: chargeData.amount,
        currency: chargeData.currency || 'XAF',
        phone: chargeData.phone,
        network: chargeData.network, // 'mtn' or 'orange'
        description: chargeData.description || 'IziShopin Payment',
        reference: chargeData.reference || `CHARGE_${Date.now()}`,
        metadata: chargeData.metadata || {}
      };

      const response = await fetch(`${this.getBaseURL()}/payment/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Direct charge failed: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Direct charge error:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId) {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.getBaseURL()}/payment/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment request
   */
  async cancelPayment(transactionId) {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.getBaseURL()}/payment/cancel/${transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Payment cancellation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment cancellation error:', error);
      throw error;
    }
  }

  /**
   * Get supported payment methods
   */
  async getPaymentMethods() {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.getBaseURL()}/payment/methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get payment methods error:', error);
      // Return default methods as fallback
      return {
        methods: [
          { id: 'mtn_momo', name: 'MTN Mobile Money', icon: 'mtn_logo' },
          { id: 'orange_money', name: 'Orange Money', icon: 'orange_logo' },
          { id: 'card', name: 'Credit/Debit Card', icon: 'card_icon' }
        ]
      };
    }
  }

  /**
   * Validate phone number for mobile money
   */
  validateMobileMoneyPhone(phone, network) {
    const cleanPhone = phone.replace(/\D/g, '');

    // Cameroon mobile number patterns
    const patterns = {
      mtn: /^237(67|68|69|65|66)\d{6}$/,
      orange: /^237(69|65|66|67)\d{6}$/
    };

    if (network === 'mtn') {
      return patterns.mtn.test(cleanPhone);
    } else if (network === 'orange') {
      return patterns.orange.test(cleanPhone);
    }

    return false;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount, currency = 'XAF') {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get transaction fee (if applicable)
   */
  calculateTransactionFee(amount, paymentMethod) {
    // This would typically come from the API, but we can estimate
    const feeRates = {
      mtn_momo: 0.01, // 1%
      orange_money: 0.01, // 1%
      card: 0.025 // 2.5%
    };

    const rate = feeRates[paymentMethod] || 0;
    return Math.round(amount * rate);
  }
}

// Export singleton instance
export default new TranzakService();