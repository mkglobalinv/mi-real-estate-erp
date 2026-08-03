import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaBullseye, FaEye, FaAward, FaUsers } from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-gray-50 pb-20">
      <Helmet>
        <title>About Us | M.I. Real Estate</title>
        <meta name="description" content="Learn more about M.I. Real Estate & General Enterprises Ltd, our mission, vision, and core values." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-primary-dark text-white py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About M.I. Real Estate</h1>
          <p className="text-xl text-gray-300 font-light">
            Building a legacy of excellence and trust in the Nigerian real estate sector.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="section-title text-center">Our Story</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>
            
            <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
              <p>
                <strong>M.I. Real Estate & General Enterprises Ltd (RC No. 1771366)</strong> is a distinguished real estate company incorporated in Nigeria. We have grown to become a trusted name in property development, management, and real estate advisory.
              </p>
              <p>
                Our journey began with a simple yet powerful goal: to simplify the process of property ownership and provide Nigerians—both at home and in the diaspora—with authentic, verifiable, and highly profitable real estate investments.
              </p>
              <p>
                Over the years, we have successfully developed and delivered multiple residential estates, commercial properties, and land acquisition projects that have consistently yielded high returns for our clients. Our approach is rooted in integrity, transparency, and a relentless pursuit of excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-primary hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary-light w-20 h-20 rounded-full flex items-center justify-center mb-6 text-primary text-3xl">
                <FaEye />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most preferred and trusted real estate company in Africa, renowned for delivering innovative, sustainable, and high-quality property solutions that enhance the standard of living.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-accent hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-accent text-3xl">
                <FaBullseye />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide accessible, affordable, and premium real estate opportunities while upholding the highest standards of professionalism, transparency, and customer satisfaction in every transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Our Core Values</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-16"></div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-4xl shadow-inner">
                <FaAward />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Excellence</h4>
              <p className="text-gray-500 text-sm">We are committed to delivering top-tier quality in all our projects and services.</p>
            </div>
            
            <div>
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-4xl shadow-inner">
                <FaShieldAlt />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Integrity</h4>
              <p className="text-gray-500 text-sm">Honesty and transparency are the foundations of every deal we execute.</p>
            </div>

            <div>
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-4xl shadow-inner">
                <FaUsers />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Customer Focus</h4>
              <p className="text-gray-500 text-sm">Our clients' needs and satisfaction dictate our strategies and actions.</p>
            </div>

            <div>
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-4xl shadow-inner">
                <FaChartLine />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Innovation</h4>
              <p className="text-gray-500 text-sm">We continuously evolve and adopt modern approaches to real estate development.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
