import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaBuilding, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FaBuilding className="text-3xl text-green-400" />
              <div>
                <span className="font-bold text-xl block leading-none">M.I. REAL ESTATE</span>
                <span className="text-[10px] text-gray-300 font-medium tracking-wider uppercase">RC No. 1771366</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Your trusted partner in premium corporate and residential real estate. We deliver excellence, integrity, and unmatched value in every property transaction.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-green-600 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Home</Link></li>
              <li><Link to="/about" className="hover:text-white hover:translate-x-1 inline-block transition-transform">About Us</Link></li>
              <li><Link to="/properties" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Properties</Link></li>
              <li><Link to="/easy-buy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Easy Buy Scheme</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-green-600 pb-2 inline-block">Our Services</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><span className="hover:text-white cursor-default">Property Sales</span></li>
              <li><span className="hover:text-white cursor-default">Property Management</span></li>
              <li><span className="hover:text-white cursor-default">Real Estate Advisory</span></li>
              <li><span className="hover:text-white cursor-default">Facility Management</span></li>
              <li><span className="hover:text-white cursor-default">Land Survey</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 border-b border-green-600 pb-2 inline-block">Contact Info</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-green-400" />
                <span>123 Corporate Way, Victoria Island, Lagos, Nigeria.</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="flex-shrink-0 text-green-400" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="flex-shrink-0 text-green-400" />
                <span>info@mirealestate.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} M.I. Real Estate & General Enterprises Ltd. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link to="#" className="hover:text-white">Privacy Policy</Link>
            <Link to="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
