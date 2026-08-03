import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaShieldAlt, FaHandshake, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import { PropertyContext } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
  const { properties } = useContext(PropertyContext);
  const featuredProperties = properties.slice(0, 3); // Show only top 3

  return (
    <div>
      <Helmet>
        <title>M.I. Real Estate - Premium Properties & Corporate Real Estate</title>
        <meta name="description" content="M.I. Real Estate & General Enterprises Ltd offers premium residential and commercial properties, land sales, and the flexible Easy Buy scheme." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Home" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Discover Your Perfect Space With <span className="text-green-400">M.I. Real Estate</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light drop-shadow-md">
            Premium residential, commercial properties, and strategic land investments tailored for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/properties" className="btn-primary text-lg px-8 py-3">
              Explore Properties
            </Link>
            <Link to="/easy-buy" className="btn-secondary bg-white text-primary text-lg px-8 py-3 border-none shadow-lg">
              Learn About Easy Buy
            </Link>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Who We Are</h2>
              <div className="w-20 h-1 bg-primary mb-6"></div>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                M.I. Real Estate & General Enterprises Ltd (RC No. 1771366) is a premier real estate firm dedicated to delivering exceptional value in property development, sales, and management. 
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We believe in creating lasting wealth for our clients through strategic real estate investments, offering transparent processes, and ensuring 100% customer satisfaction.
              </p>
              <Link to="/about" className="text-primary font-bold hover:text-primary-dark flex items-center gap-2">
                Read Our Full Story <span className="text-xl">&rarr;</span>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary translate-x-4 translate-y-4 rounded-xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Corporate Building" 
                className="relative z-10 rounded-xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Featured Properties</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="section-subtitle">Explore our handpicked selection of premium properties</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/properties" className="btn-primary inline-block px-10 py-3 text-lg shadow-lg">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose M.I. Real Estate?</h2>
          <div className="w-24 h-1 bg-green-400 mx-auto mb-16"></div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-sm border border-white border-opacity-20 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg">
                <FaShieldAlt />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Properties</h3>
              <p className="text-gray-300">Every property we list undergoes rigorous legal and physical verification to ensure zero encumbrances.</p>
            </div>
            
            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-sm border border-white border-opacity-20 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg">
                <FaHandshake />
              </div>
              <h3 className="text-xl font-bold mb-4">Transparent Process</h3>
              <p className="text-gray-300">We maintain absolute transparency from site inspection to documentation and final handover.</p>
            </div>

            <div className="bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-sm border border-white border-opacity-20 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-bold mb-4">High ROI</h3>
              <p className="text-gray-300">Our properties are strategically located in rapidly developing areas, guaranteeing high returns on investment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Buy Scheme Banner */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-primary p-12 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4 text-accent">Introducing: Easy Buy Scheme</h2>
              <p className="text-lg mb-8 leading-relaxed">
                Owning a property is now easier than ever. With our flexible installment payment plans, you can secure your dream property with an initial deposit and spread the balance over up to 24 months.
              </p>
              <ul className="space-y-3 mb-8 font-medium">
                <li className="flex items-center gap-3"><FaCheckCircle className="text-accent" /> Flexible payment structures</li>
                <li className="flex items-center gap-3"><FaCheckCircle className="text-accent" /> Zero hidden interest rates</li>
                <li className="flex items-center gap-3"><FaCheckCircle className="text-accent" /> Immediate allocation on completion</li>
              </ul>
              <div>
                <Link to="/easy-buy" className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block shadow-lg">
                  Get Started Today
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Happy Homeowner" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Make Your Real Estate Move?</h2>
          <p className="text-xl text-gray-400 mb-10">Our experts are ready to guide you through finding the perfect property or investment opportunity.</p>
          <Link to="/contact" className="btn-accent text-lg px-12 py-4 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
