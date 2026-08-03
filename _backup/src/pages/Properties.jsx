import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { PropertyContext } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';

const Properties = () => {
  const { properties } = useContext(PropertyContext);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Our Properties | M.I. Real Estate</title>
        <meta name="description" content="Browse our extensive portfolio of premium residential and commercial properties available for sale." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-primary-dark text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Properties</h1>
          <p className="text-xl text-gray-300 font-light">
            Find your perfect home or investment property from our exclusive listings.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">All Available Listings</h2>
            <p className="text-gray-500 font-medium">{properties.length} Properties found</p>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl text-gray-500">No properties available at the moment.</h3>
              <p className="text-gray-400 mt-2">Please check back later.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Properties;
