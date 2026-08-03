import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaRulerCombined, FaWhatsapp } from 'react-icons/fa';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const whatsappMessage = encodeURIComponent(`Hello, I am interested in your property: ${property.title} located at ${property.location} listed for ${formatPrice(property.price)}.`);
  const whatsappUrl = `https://wa.me/2348001234567?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          For Sale
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <FaMapMarkerAlt className="mr-2 text-primary" />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        
        <p className="text-2xl font-extrabold text-primary mb-4">{formatPrice(property.price)}</p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-6">
          <div className="flex items-center text-gray-600 text-sm font-medium">
            <FaRulerCombined className="mr-2 text-gray-400" />
            {property.plotSize}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to={`/properties/${property.id}`} 
            className="flex-1 text-center btn-primary"
          >
            View Details
          </Link>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex justify-center items-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <FaWhatsapp className="mr-2 text-xl" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
