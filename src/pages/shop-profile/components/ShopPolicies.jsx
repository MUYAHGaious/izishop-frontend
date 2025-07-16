import React from 'react';
import Icon from '../../../components/AppIcon';

const ShopPolicies = ({ policies }) => {
  const policyIcons = {
    shipping: 'Truck',
    returns: 'RotateCcw',
    payment: 'CreditCard',
    warranty: 'Shield',
    privacy: 'Lock',
    terms: 'FileText'
  };

  const PolicySection = ({ title, icon, content, highlights }) => (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={20} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      
      {highlights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Icon name="Check" size={16} className="text-success flex-shrink-0" />
              <span className="text-sm text-foreground">{highlight}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="prose prose-sm max-w-none">
        <p className="text-text-secondary leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Shipping Policy */}
      <PolicySection
        title="Shipping & Delivery"
        icon={policyIcons.shipping}
        highlights={[
          'Free shipping on orders over 50,000 XAF',
          'Same-day delivery in Douala & Yaoundé',
          'Nationwide delivery within 2-5 business days',
          'Real-time tracking available'
        ]}
        content={`We offer reliable shipping services across Cameroon with multiple delivery options to suit your needs.

DELIVERY AREAS:
• Douala & Yaoundé: Same-day delivery available for orders placed before 2 PM
• Major cities (Bamenda, Bafoussam, Garoua): 2-3 business days
• Other locations: 3-5 business days

SHIPPING COSTS:
• Orders above 50,000 XAF: Free shipping
• Standard delivery: 2,500 XAF
• Express delivery: 5,000 XAF
• Same-day delivery: 7,500 XAF

DELIVERY PROCESS:
1. Order confirmation and processing (1-2 hours)
2. Package preparation and dispatch
3. Real-time tracking updates via SMS/email
4. Delivery confirmation with photo verification

Please ensure someone is available to receive the package during delivery hours (8 AM - 6 PM). If you're unavailable, our delivery agent will contact you to reschedule.`}
      />

      {/* Returns Policy */}
      <PolicySection
        title="Returns & Exchanges"
        icon={policyIcons.returns}
        highlights={[
          '30-day return window',
          'Free return shipping',
          'Full refund or exchange',
          'Easy return process'
        ]}
        content={`We want you to be completely satisfied with your purchase. If you're not happy with your order, we offer hassle-free returns and exchanges.

RETURN ELIGIBILITY:
• Items must be returned within 30 days of delivery
• Products must be in original condition with tags attached
• Original packaging and accessories must be included
• Proof of purchase required

NON-RETURNABLE ITEMS:
• Personalized or customized products
• Perishable goods
• Intimate apparel and swimwear
• Digital downloads

RETURN PROCESS:
1. Contact our customer service team
2. Receive return authorization and shipping label
3. Package items securely with original packaging
4. Schedule pickup or drop off at our location
5. Refund processed within 5-7 business days

EXCHANGE POLICY:
• Size exchanges available for clothing and shoes
• Color exchanges subject to availability
• Price difference applies for upgraded items`}
      />

      {/* Payment Policy */}
      <PolicySection
        title="Payment & Security"
        icon={policyIcons.payment}
        highlights={[
          'Secure payment processing',
          'Multiple payment options',
          'Escrow protection',
          'Instant payment confirmation'
        ]}
        content={`We accept various payment methods to make your shopping experience convenient and secure.

ACCEPTED PAYMENT METHODS:
• MTN Mobile Money
• Orange Money
• Visa/Mastercard credit cards
• Bank transfers
• Cash on delivery (selected areas)

PAYMENT SECURITY:
• All transactions are encrypted with SSL technology
• PCI DSS compliant payment processing
• Escrow system protects your payments
• Funds released only after delivery confirmation

ESCROW PROTECTION:
1. Your payment is held securely until delivery
2. Seller receives payment after you confirm receipt
3. Dispute resolution available if issues arise
4. Full refund if delivery fails

BILLING INFORMATION:
• Invoices sent via email after payment
• Tax receipts available for business purchases
• Payment history accessible in your account`}
      />

      {/* Warranty Policy */}
      <PolicySection
        title="Warranty & Support"
        icon={policyIcons.warranty}
        highlights={[
          'Manufacturer warranty honored',
          'Extended warranty options',
          'Technical support available',
          'Repair services offered'
        ]}
        content={`We stand behind the quality of our products and offer comprehensive warranty coverage.

WARRANTY COVERAGE:
• All products come with manufacturer warranty
• Extended warranty options available at checkout
• Warranty terms vary by product category
• International warranty honored where applicable

TECHNICAL SUPPORT:
• Free technical support for electronic products
• Installation guidance available
• Troubleshooting assistance via phone/chat
• Video tutorials and user manuals provided

REPAIR SERVICES:
• Authorized repair centers in major cities
• Genuine parts and components used
• Quick turnaround time for repairs
• Loaner devices available for extended repairs

WARRANTY CLAIMS:
1. Contact our support team with issue details
2. Provide proof of purchase and warranty information
3. Follow diagnostic steps if required
4. Arrange repair or replacement as needed`}
      />

      {/* Privacy Policy */}
      <PolicySection
        title="Privacy & Data Protection"
        icon={policyIcons.privacy}
        content={`We are committed to protecting your privacy and personal information in accordance with Cameroon data protection laws.

INFORMATION WE COLLECT:
• Personal details (name, email, phone number)
• Shipping and billing addresses
• Payment information (securely processed)
• Order history and preferences
• Website usage data and cookies

HOW WE USE YOUR INFORMATION:
• Process and fulfill your orders
• Communicate about your purchases
• Improve our products and services
• Send promotional offers (with your consent)
• Comply with legal requirements

DATA SECURITY:
• Industry-standard encryption for all data
• Secure servers with regular backups
• Limited access to authorized personnel only
• Regular security audits and updates

YOUR RIGHTS:
• Access your personal information
• Request corrections or updates
• Delete your account and data
• Opt-out of marketing communications
• File complaints with data protection authorities`}
      />

      {/* Terms of Service */}
      <PolicySection
        title="Terms of Service"
        icon={policyIcons.terms}
        content={`By using our services, you agree to these terms and conditions.

ACCOUNT RESPONSIBILITIES:
• Provide accurate and current information
• Maintain security of your account credentials
• Notify us of any unauthorized access
• Use the platform for lawful purposes only

PROHIBITED ACTIVITIES:
• Selling counterfeit or illegal products
• Manipulating reviews or ratings
• Interfering with platform operations
• Violating intellectual property rights

DISPUTE RESOLUTION:
• Good faith negotiation as first step
• Mediation services available
• Arbitration for unresolved disputes
• Cameroon law governs all agreements

LIMITATION OF LIABILITY:
• Platform acts as intermediary between buyers and sellers
• Sellers responsible for product quality and descriptions
• Maximum liability limited to purchase amount
• Force majeure events exclude liability

MODIFICATIONS:
• Terms may be updated with notice
• Continued use constitutes acceptance
• Major changes require explicit consent
• Historical versions available upon request`}
      />
    </div>
  );
};

export default ShopPolicies;