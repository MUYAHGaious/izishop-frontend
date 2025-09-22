/**
 * Tranzak Payment Service Integration
 * Handles payment processing using Tranzak API
 * Uses sandbox environment for development
 */

import api from './api';

class TranzakService {
  constructor() {
    // Tranzak configuration - using the correct API endpoints
    this.config = {
      baseURL: 'https://dsapi.tranzak.me',
      sandboxBaseURL: 'https://sandbox.dsapi.tranzak.me',
      appId: import.meta.env.VITE_TRANZAK_APP_ID || 'ap6kbj7jhunqq4',
      appKey: import.meta.env.VITE_TRANZAK_APP_KEY || 'SAND_6BD375A02D9447318E5798F8C8AF1914',
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

      // Always try real API first, even in development mode
      console.log('🔐 Attempting Tranzak authentication...');

      const response = await fetch(`${this.getBaseURL()}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: this.config.appId,
          appKey: this.config.appKey,
          scope: 'collections'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tranzak auth response:', response.status, errorText);
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Tranzak auth response:', data);
      
      // Handle different response structures
      if (data.success && data.data && data.data.token) {
        this.accessToken = data.data.token;
        this.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        return this.accessToken;
      } else if (data.token) {
        this.accessToken = data.token;
        this.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
      return this.accessToken;
      } else {
        throw new Error(`Authentication failed: ${data.errorMsg || 'No token received'}`);
      }
    } catch (error) {
      console.error('Tranzak authentication error:', error);
      
      // If authentication fails, check if we should simulate in development
      if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
        console.log('🚀 Development mode: Tranzak API failed, simulating authentication');
        this.accessToken = 'dev_token_' + Date.now();
        this.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        return this.accessToken;
      }
      
      throw error;
    }
  }

  /**
   * Create a payment request
   */
  async createPaymentRequest(paymentData) {
    try {
      const token = await this.authenticate();

      // Always try real API first
      console.log('💰 Creating payment request with Tranzak...');

      const requestData = {
        amount: paymentData.amount,
        currencyCode: paymentData.currency || 'XAF', // Central African CFA franc
        description: paymentData.description || 'IziShopin Order Payment',
        mchTransactionRef: paymentData.reference || `ORDER_${Date.now()}`,
        customData: {
          order_id: paymentData.orderId,
          customer_id: paymentData.customerId,
          customer_email: paymentData.customerEmail,
          customer_phone: paymentData.customerPhone,
          customer_name: paymentData.customerName,
          ...paymentData.metadata
        },
        payerNote: `Payment for ${paymentData.customerName}`,
        returnUrl: paymentData.redirectUrl || `${window.location.origin}/order-success?amount=${paymentData.amount}&status=success`,
        cancelUrl: paymentData.cancelUrl || `${window.location.origin}/checkout/cancel`,
        webhook: paymentData.webhookUrl || `${window.location.origin}/api/webhooks/tranzak`
      };

      console.log('Creating payment request:', requestData);

      const response = await fetch(`${this.getBaseURL()}/xp021/v1/request/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment request response:', response.status, errorText);
        throw new Error(`Payment request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Payment request result:', result);
      
      if (result.success && result.data) {
        return {
          status: 'success',
          payment_url: result.data.paymentAuthUrl,
          request_id: result.data.requestId,
          reference: requestData.mchTransactionRef
        };
      } else {
        throw new Error(`Payment request failed: ${result.errorMsg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Create payment request error:', error);
      
      // If API fails, check if we should simulate in development
      if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
        console.log('🚀 Development mode: Tranzak payment request failed, simulating success');
        return {
          status: 'success',
          payment_url: `${window.location.origin}/order-success?ref=dev_${Date.now()}&status=success&amount=${paymentData.amount}`,
          request_id: 'dev_request_' + Date.now(),
          reference: paymentData.reference || `ORDER_${Date.now()}`
        };
      }
      
      throw error;
    }
  }

  /**
   * Process mobile money payment (MTN MoMo, Orange Money)
   */
  async processDirectCharge(chargeData) {
    try {
      const token = await this.authenticate();

      // Always try real API first
      console.log('📱 Creating mobile wallet charge with Tranzak...');

      const requestData = {
        amount: chargeData.amount,
        currencyCode: chargeData.currency || 'XAF',
        mobileWalletNumber: chargeData.phone,
        walletProvider: chargeData.network === 'mtn' ? 'MTN' : 'ORANGE',
        description: chargeData.description || 'IziShopin Payment',
        mchTransactionRef: chargeData.reference || `CHARGE_${Date.now()}`,
        customData: {
          customer_email: chargeData.customerEmail,
          customer_phone: chargeData.customerPhone,
          customer_name: chargeData.customerName,
          ...chargeData.metadata
        },
        payerNote: `Mobile money payment for ${chargeData.customerName}`
      };

      console.log('Creating mobile wallet charge:', requestData);

      const response = await fetch(`${this.getBaseURL()}/xp021/v1/request/create-mobile-wallet-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mobile wallet charge response:', response.status, errorText);
        throw new Error(`Direct charge failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Mobile wallet charge result:', result);
      
      if (result.success && result.data) {
        return {
          status: 'success',
          request_id: result.data.requestId,
          reference: requestData.mchTransactionRef,
          transaction_id: result.data.transactionId || result.data.requestId
        };
      } else {
        throw new Error(`Direct charge failed: ${result.errorMsg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Direct charge error:', error);
      
      // If API fails, check if we should simulate in development
      if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
        console.log('🚀 Development mode: Tranzak mobile wallet charge failed, simulating success');
        return {
          status: 'success',
          request_id: 'dev_request_' + Date.now(),
          reference: chargeData.reference || `CHARGE_${Date.now()}`,
          transaction_id: 'dev_transaction_' + Date.now()
        };
      }
      
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