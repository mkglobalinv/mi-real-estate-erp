import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaWallet, FaHome, FaFileContract } from 'react-icons/fa';

const EasyBuy = () => {
  return (
    <div className="bg-white min-h-screen pb-20">
      <Helmet>
        <title>Easy Buy Scheme | M.I. Real Estate</title>
        <meta name="description" content="Learn about our Easy Buy scheme, an installment payment plan designed to make property ownership accessible to everyone." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-primary-dark text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-block bg-accent text-white font-bold px-4 py-1 rounded-full text-sm mb-6">M.I. Special Program</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-md">The Easy Buy Scheme</h1>
          <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto">
            Your journey to property ownership just got simpler. Flexible, transparent, and interest-free payment plans.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We understand that lump-sum payments can be challenging. Our Easy Buy Scheme allows you to secure your dream property with an initial deposit and spread the balance over a convenient timeframe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative group">
              <div className="absolute -top-6 left-10 bg-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center text-primary text-2xl">
                  1
                </div>
              </div>
              <div className="mt-8 text-center">
                <FaWallet className="text-4xl text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Initial Deposit</h3>
                <p className="text-gray-600">Make a commitment fee (usually 20% - 30% depending on the property) to secure your allocation instantly.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative group">
              <div className="absolute -top-6 left-10 bg-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center text-primary text-2xl">
                  2
                </div>
              </div>
              <div className="mt-8 text-center">
                <FaFileContract className="text-4xl text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Spread the Balance</h3>
                <p className="text-gray-600">Pay the remaining balance over 3, 6, 12, or 24 months with absolutely ZERO hidden interest charges.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative group">
              <div className="absolute -top-6 left-10 bg-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center text-primary text-2xl">
                  3
                </div>
              </div>
              <div className="mt-8 text-center">
                <FaHome className="text-4xl text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Take Ownership</h3>
                <p className="text-gray-600">Upon completion of your payment, receive all necessary legal documents and take full possession of your property.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of the Scheme</h2>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 text-xl mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">0% Interest Rate</h4>
                    <p className="text-gray-600">Unlike bank mortgages, our payment plan is completely interest-free. You pay exactly the listed price.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 text-xl mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Guaranteed Allocation</h4>
                    <p className="text-gray-600">Your property allocation is reserved immediately upon your initial deposit.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 text-xl mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Hedge Against Inflation</h4>
                    <p className="text-gray-600">Lock in today's price and protect your investment against future market appreciation and inflation.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-10">
                <Link to="/contact" className="btn-primary px-8 py-4 shadow-lg text-lg">Speak to an Advisor</Link>
              </div>
            </div>
            <div className="bg-primary hidden lg:block relative">
               <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Business Meeting" 
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EasyBuy;
