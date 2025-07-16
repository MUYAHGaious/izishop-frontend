import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage (mock subscription)
      const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      
      if (subscribers.includes(email)) {
        setError('This email is already subscribed');
        setIsLoading(false);
        return;
      }

      subscribers.push(email);
      localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
      
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const benefits = [
    {
      icon: 'Zap',
      title: 'Flash Sales',
      description: 'Get notified about exclusive deals and flash sales'
    },
    {
      icon: 'Package',
      title: 'New Products',
      description: 'Be the first to know about new product launches'
    },
    {
      icon: 'Gift',
      title: 'Special Offers',
      description: 'Receive personalized offers and discount codes'
    },
    {
      icon: 'TrendingUp',
      title: 'Market Trends',
      description: 'Stay updated with the latest market trends'
    }
  ];

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card border border-border rounded-lg shadow-card p-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Thank You for Subscribing!
            </h2>
            <p className="text-lg text-text-secondary mb-6">
              You'll receive the latest updates, exclusive deals, and special offers directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="default" 
                onClick={() => window.location.href = '/product-catalog'}
                iconName="ShoppingBag"
                iconPosition="left"
              >
                Start Shopping
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSubscribed(false)}
                iconName="Plus"
                iconPosition="left"
              >
                Subscribe Another Email
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Content */}
            <div className="p-8 lg:p-12">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Icon name="Mail" size={24} className="text-primary" />
                  </div>
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full">
                    Stay Updated
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Never Miss a Deal
                </h2>
                <p className="text-lg text-text-secondary">
                  Subscribe to our newsletter and get exclusive access to the best deals, new products, and special offers from top sellers across Cameroon.
                </p>
              </div>

              {/* Newsletter Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      error={error}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="default"
                    loading={isLoading}
                    disabled={isLoading || !email}
                    iconName="Send"
                    iconPosition="right"
                    className="sm:w-auto"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>

              {/* Privacy Notice */}
              <p className="text-xs text-text-secondary">
                By subscribing, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>{' '}
                and consent to receive marketing emails. You can unsubscribe at any time.
              </p>
            </div>

            {/* Right Side - Benefits */}
            <div className="bg-muted/30 p-8 lg:p-12">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                What you'll get:
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name={benefit.icon} size={16} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-primary rounded-full border-2 border-card flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          {String.fromCharCode(64 + i)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Join 12,000+ subscribers
                    </p>
                    <p className="text-xs text-text-secondary">
                      Already getting the best deals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={24} className="text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Weekly Updates</h3>
            <p className="text-sm text-text-secondary">
              Get curated deals and updates every week
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Smartphone" size={24} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mobile Friendly</h3>
            <p className="text-sm text-text-secondary">
              Optimized for reading on any device
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="UserX" size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Easy Unsubscribe</h3>
            <p className="text-sm text-text-secondary">
              Unsubscribe with one click anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;