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

  const testimonials = [
    {
      name: "Jean-Paul Mbarga",
      role: "CEO, TechCorp Cameroon",
      quote: "IziShopin has been a game changer for our business. We've been able to find reliable suppliers and expand our product range significantly.",
      avatar: "JP"
    },
    {
      name: "Marie Nkomo",
      role: "Founder, Fashion Forward",
      quote: "As an entrepreneur in the fashion industry, IziShopin has been my trusted partner in sourcing quality materials and connecting with customers.",
      avatar: "MN"
    },
    {
      name: "Dr. Samuel Fon",
      role: "Director, AgriTech Solutions",
      quote: "The platform's verification system gives us confidence in our suppliers. We've streamlined our procurement process significantly.",
      avatar: "SF"
    }
  ];

  if (isSubscribed) {
    return (
      <section className="py-16" style={{ backgroundColor: '#F3F4F6' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#10B981' }}
            >
              <Icon name="CheckCircle" size={32} color="white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#111827' }}>
              Welcome to the IziShopin Community!
            </h2>
            <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
              You'll receive exclusive business insights, supplier updates, and market opportunities directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0A73B7' }}
                onClick={() => window.location.href = '/product-catalog'}
              >
                <Icon name="ShoppingBag" size={16} className="mr-2 inline" />
                Start Sourcing
              </button>
              <button 
                className="px-6 py-3 font-semibold rounded-lg border-2 hover:shadow-md transition-shadow"
                style={{ 
                  color: '#0A73B7', 
                  borderColor: '#0A73B7',
                  backgroundColor: 'white'
                }}
                onClick={() => setIsSubscribed(false)}
              >
                <Icon name="Plus" size={16} className="mr-2 inline" />
                Subscribe Another Email
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
              Trusted by Business Leaders Across Cameroon
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
              Join thousands of successful businesses who have transformed their operations with IziShopin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4"
                    style={{ backgroundColor: index % 2 === 0 ? '#0A73B7' : '#F56522' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: '#111827' }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  "{testimonial.quote}"
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} name="Star" size={16} style={{ color: '#F59E0B' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Explore millions of products from trusted suppliers by signing up today!
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your business email"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                style={{ backgroundColor: 'white' }}
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-200">{error}</p>
            )}
          </form>

          <p className="text-sm mt-4 opacity-75">
            Join over 50,000+ businesses already using IziShopin
          </p>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0A73B7' }}
            >
              <Icon name="Shield" size={24} color="white" />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: '#111827' }}>
              Secure Trading
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Trade Assurance protects your orders from payment to delivery
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F56522' }}
            >
              <Icon name="Award" size={24} color="white" />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: '#111827' }}>
              Verified Suppliers
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              All suppliers are verified with business credentials and quality checks
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0A73B7' }}
            >
              <Icon name="Headphones" size={24} color="white" />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: '#111827' }}>
              24/7 Support
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Get help anytime with our dedicated customer support team
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F56522' }}
            >
              <Icon name="Truck" size={24} color="white" />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: '#111827' }}>
              Global Logistics
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Reliable shipping and logistics solutions across all regions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;

