import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, BarChart3 } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#security' },
        { label: 'API Docs', href: '#docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Blog', href: '#blog' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'Compliance', href: '#compliance' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Tutorials', href: '#tutorials' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Support', href: '#support' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#facebook', label: 'Facebook' },
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Instagram, href: '#instagram', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-950 via-blue-900 to-black border-t border-blue-800/30">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top Section - Company Info and Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-400/50 transition-all duration-300">
                <BarChart3 className="w-5 h-5 text-blue-950" />
              </div>
              <span className="text-lg font-bold text-white bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                JengaEA
              </span>
            </Link>
            <p className="text-blue-300/80 text-sm leading-relaxed">
              Intelligent construction cost estimation for East Africa. Accurate, location-based, AI-powered insights for smarter building decisions.
            </p>
          </div>

          {/* Links Grid */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-blue-300/80 hover:text-cyan-400 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact and Social Section */}
        <div className="border-t border-blue-800/30 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@jengaea.com"
                  className="flex items-center gap-3 text-blue-300/80 hover:text-cyan-400 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">support@jengaea.com</span>
                </a>
                <a
                  href="tel:+254700000000"
                  className="flex items-center gap-3 text-blue-300/80 hover:text-cyan-400 transition-colors duration-200"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">+254 700 000 000</span>
                </a>
                <div className="flex items-start gap-3 text-blue-300/80">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p>Nairobi, Kenya</p>
                    <p>East Africa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-blue-300/80 hover:text-cyan-400 text-sm transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/estimates"
                    className="text-blue-300/80 hover:text-cyan-400 text-sm transition-colors duration-200"
                  >
                    Estimates
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    className="text-blue-300/80 hover:text-cyan-400 text-sm transition-colors duration-200"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reports"
                    className="text-blue-300/80 hover:text-cyan-400 text-sm transition-colors duration-200"
                  >
                    Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="p-3 rounded-lg bg-blue-800/20 hover:bg-blue-700/30 text-blue-300 hover:text-cyan-400 transition-all duration-200 group"
                      title={social.label}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-blue-800/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-blue-300/60 text-sm text-center md:text-left">
                © {currentYear} JengaEA. All rights reserved. Building the future of East African construction.
              </p>
              <div className="flex gap-6">
                <a href="#privacy" className="text-blue-300/60 hover:text-cyan-400 text-xs transition-colors duration-200">
                  Privacy
                </a>
                <a href="#terms" className="text-blue-300/60 hover:text-cyan-400 text-xs transition-colors duration-200">
                  Terms
                </a>
                <a href="#cookies" className="text-blue-300/60 hover:text-cyan-400 text-xs transition-colors duration-200">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-t from-blue-950/50 to-transparent" />
    </footer>
  );
};

export default Footer;
