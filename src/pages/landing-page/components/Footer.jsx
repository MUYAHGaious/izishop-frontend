import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: t('footer.marketplace'),
      links: [
        { label: t('footer.browseProducts'), href: '/product-catalog' },
        { label: t('footer.featuredShops'), href: '/product-catalog?featured=true' },
        { label: t('footer.categories'), href: '/product-catalog' },
        { label: t('footer.secondHandMarket'), href: '/product-catalog?condition=used' },
        { label: t('footer.newArrivals'), href: '/product-catalog?sort=newest' }
      ]
    },
    {
      title: t('footer.forSellers'),
      links: [
        { label: t('footer.startSelling'), href: '/authentication-login-register' },
        { label: t('footer.sellerDashboard'), href: '/authentication-login-register' },
        { label: t('footer.sellerGuidelines'), href: '#' },
        { label: t('footer.commissionRates'), href: '#' },
        { label: t('footer.sellerSupport'), href: '#' }
      ]
    },
    {
      title: t('footer.customerCare'),
      links: [
        { label: t('footer.helpCenter'), href: '#' },
        { label: t('footer.contactUs'), href: '#' },
        { label: t('footer.orderTracking'), href: '/authentication-login-register' },
        { label: t('footer.returnsRefunds'), href: '#' },
        { label: t('footer.shippingInfo'), href: '#' }
      ]
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.aboutIziShopin'), href: '#' },
        { label: t('footer.careers'), href: '#' },
        { label: t('footer.pressMedia'), href: '#' },
        { label: t('footer.investorRelations'), href: '#' },
        { label: t('footer.sustainability'), href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'Facebook', href: 'https://facebook.com/izishopin' },
    { name: 'Twitter', icon: 'Twitter', href: 'https://twitter.com/izishopin' },
    { name: 'Instagram', icon: 'Instagram', href: 'https://instagram.com/izishopin' },
    { name: 'LinkedIn', icon: 'Linkedin', href: 'https://linkedin.com/company/izishopin' },
    { name: 'YouTube', icon: 'Youtube', href: 'https://youtube.com/izishopin' }
  ];

  const paymentMethods = [
    { name: 'MTN MoMo', logo: 'Smartphone', color: 'text-accent' },
    { name: 'Orange Money', logo: 'Smartphone', color: 'text-warning' },
    { name: 'Visa', logo: 'CreditCard', color: 'text-primary' },
    { name: 'Mastercard', logo: 'CreditCard', color: 'text-secondary' }
  ];

  const legalLinks = [
    { label: t('footer.privacyPolicy'), href: '#' },
    { label: t('footer.termsOfService'), href: '#' },
    { label: t('footer.cookiePolicy'), href: '#' },
    { label: t('footer.accessibility'), href: '#' }
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="Package" size={28} className="text-teal-600" />
              <span className="text-xl font-bold text-primary">IziShopin</span>
            </div>
            <p className="text-sm text-background/80 mb-6 leading-relaxed">
              {t('footer.companyDescription')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-background/80">
              <div className="flex items-center">
                <Icon name="MapPin" size={16} className="mr-2 text-primary" />
                Douala, Cameroon
              </div>
              <div className="flex items-center">
                <Icon name="Phone" size={16} className="mr-2 text-primary" />
                +237 6XX XXX XXX
              </div>
              <div className="flex items-center">
                <Icon name="Mail" size={16} className="mr-2 text-primary" />
                support@izishopin.cm
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-background mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/80 hover:text-primary marketplace-transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-background/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold text-background mb-2">
                {t('footer.stayConnected')}
              </h3>
              <p className="text-sm text-background/80">
                {t('footer.followUs')}
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center marketplace-transition group"
                  >
                    <Icon 
                      name={social.icon} 
                      size={20} 
                      className="text-background/80 group-hover:text-primary-foreground" 
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-background/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-sm font-semibold text-background mb-4">
                {t('footer.acceptedPaymentMethods')}
              </h3>
              <div className="flex flex-wrap gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center space-x-2 px-3 py-2 bg-background/10 rounded-lg"
                  >
                    <Icon name={method.logo} size={16} className={method.color} />
                    <span className="text-sm text-background/80">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-start lg:justify-end">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span className="text-sm text-background/80">{t('footer.sslSecured')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Award" size={16} className="text-accent" />
                  <span className="text-sm text-background/80">{t('footer.verifiedPlatform')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-background/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-background/80">
              © {currentYear} IziShopin. {t('footer.allRightsReserved')}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-background/80 hover:text-primary marketplace-transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-background/10 text-center">
            <p className="text-xs text-background/60">
              {t('footer.platformInfo')}
              <br />
              {t('footer.contactInfo')}
            </p>

            {/* Admin Links */}
            <div className="mt-2 pt-2 border-t border-background/10">
              <p className="text-xs text-background/40 mb-1">{t('footer.adminAccess')}:</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/admin-setup"
                  className="text-xs text-background/60 hover:text-primary marketplace-transition"
                >
                  {t('footer.adminSetup')}
                </a>
                <a
                  href="/admin-login"
                  className="text-xs text-background/60 hover:text-primary marketplace-transition"
                >
                  {t('footer.adminLogin')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;