import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaBuilding } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Properties', path: '/properties' },
    { name: 'Easy Buy', path: '/easy-buy' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <FaBuilding className="text-primary text-3xl" />
              <div>
                <span className="font-bold text-xl text-primary-dark block leading-none">M.I. REAL ESTATE</span>
                <span className="text-xs text-gray-500 font-medium tracking-wider">& General Enterprises Ltd</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium text-sm uppercase tracking-wide transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/admin" className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition-colors">Admin</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary p-2"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
