import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Contact Us | M.I. Real Estate</title>
        <meta name="description" content="Get in touch with M.I. Real Estate & General Enterprises Ltd for all your property inquiries, partnerships, and support." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-primary-dark text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 font-light">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-primary">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-light p-3 rounded-full text-primary mt-1">
                      <FaMapMarkerAlt className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Head Office</h4>
                      <p className="text-gray-600 text-sm">123 Corporate Way,<br />Victoria Island,<br />Lagos, Nigeria.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-light p-3 rounded-full text-primary mt-1">
                      <FaPhoneAlt className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Phone</h4>
                      <p className="text-gray-600 text-sm">+234 800 123 4567<br />+234 801 987 6543</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-light p-3 rounded-full text-primary mt-1">
                      <FaEnvelope className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Email</h4>
                      <p className="text-gray-600 text-sm">info@mirealestate.com<br />support@mirealestate.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t">
                  <h4 className="font-bold text-gray-900 mb-4">Chat with us</h4>
                  <a 
                    href="https://wa.me/2348001234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-lg font-medium transition-colors"
                  >
                    <FaWhatsapp className="text-2xl" /> WhatsApp Direct Line
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h3>
                
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        placeholder="+234..."
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input 
                        type="text" 
                        id="subject" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        placeholder="Inquiry about Easy Buy"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="5" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`btn-primary w-full py-4 text-lg font-bold shadow-lg flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
