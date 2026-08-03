"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Handshake, TrendingUp, CheckCircle, MapPin, Map, Building2, Home as HomeIcon, Banknote, Map as MapIcon, FileText, Star, Users, Building, Activity, PhoneCall, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import PropertySearchWidget from '@/components/PropertySearchWidget';
import { OfficeInfo, Testimonial, Project } from '@/lib/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', location: '', interest: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.getProjects().then(data => setProjects(data.filter(p => p.active).slice(0, 3)));
    api.getOfficeInfo().then(setOffice);
    api.getTestimonials().then(data => setTestimonials(data.filter(t => t.isActive)));
  }, []);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createLead({
        name: callbackForm.name,
        whatsapp: callbackForm.phone,
        phone: callbackForm.phone,
        source: 'Homepage Callback Request',
        interest: callbackForm.interest,
        budget: 'Not Specified',
        location: callbackForm.location
      });
      alert('Callback request submitted successfully! We will contact you shortly.');
      setCallbackForm({ name: '', phone: '', location: '', interest: '' });
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[420px] md:h-[500px] lg:h-[550px] flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/premium_estate_hero.png" 
            alt="M.I. Real Estate Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto -mt-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 drop-shadow-xl leading-tight tracking-tight">
            M.I. REAL ESTATE & <span className="text-[var(--color-gold)]">GENERAL ENTERPRISES LTD.</span>
          </h1>
          <p className="text-base md:text-xl text-gray-200 mb-6 md:mb-8 font-medium drop-shadow-md max-w-3xl mx-auto leading-relaxed">
            Own Land, Houses & Investment Properties Through Our Flexible Easy Buy Scheme.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs md:text-sm font-bold text-white/90 mb-8">
            <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-[var(--color-gold)]" />
              <span>RC NO: 1771366</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Verified Company</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <Star className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Easy Buy Certified</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <Handshake className="w-4 h-4 text-[var(--color-gold)]" />
              <span>Secure Transactions</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <Link href="/properties" className="px-8 py-4 bg-[var(--color-gold)] text-gray-900 font-bold rounded-xl shadow-lg hover:bg-yellow-500 hover:scale-105 transition-all w-full sm:w-auto">
              View Properties
            </Link>
            <a href={`https://wa.me/${office?.whatsapp || '2348031234567'}?text=Hello M.I Real Estate, I want to know more about the Easy Buy scheme.`} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 hover:scale-105 transition-all w-full sm:w-auto flex justify-center items-center gap-2">
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>

          {/* Statistics Block */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-center text-white border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[var(--color-gold)] mb-1">500+</p>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-300">Plots Sold</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[var(--color-gold)] mb-1">100+</p>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-300">Happy Clients</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[var(--color-gold)] mb-1">3</p>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-300">Major Projects</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-[var(--color-gold)] mb-1 flex items-center justify-center gap-1"><CheckCircle className="w-6 h-6" /> YES</p>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-300">Easy Buy Available</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Search Panel Widget */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <PropertySearchWidget />
      </div>

      {/* Featured Projects Section */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Projects</h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mb-4"></div>
              <p className="text-gray-600">Premium estates and flexible housing programs.</p>
            </div>
            <Link href="/properties" className="text-[var(--color-primary)] font-bold hover:underline flex items-center gap-2">
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                <div className="relative h-48 md:h-56 w-full overflow-hidden">
                  <Image src={project.coverImage || '/images/placeholder.jpg'} alt={project.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {project.easyBuyStatus && (
                    <div className="absolute top-3 left-3 bg-[var(--color-gold)] text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Easy Buy Available
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{project.name}</h3>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100 shrink-0">
                      <Shield className="w-3 h-3" /> Verified
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 mb-4 text-xs font-medium">
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" /> {project.location || 'Multiple Locations'}</span>
                    <span className="flex items-center"><Building className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" /> {project.availableUnits} Units</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Starting From</p>
                      <p className="text-base font-bold text-[var(--color-primary)]">â‚¦{project.startingPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/properties?project=${encodeURIComponent(project.name)}`} className="flex-1 bg-gray-50 text-gray-900 font-semibold text-center py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">View Units</Link>
                    <a href={`https://wa.me/${office?.whatsapp || '2348031234567'}?text=${encodeURIComponent(`Hello M.I Real Estate,\nI am interested in the ${project.name} project.\nPlease provide more details.\nThank you.`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Easy Buy Highlight */}
      <section className="py-12 md:py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">The Easy Buy Scheme</h2>
            <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Secure your dream property with an initial deposit and spread the balance over up to 24 months, interest-free.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 text-center relative z-10 max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-gray-200 -z-10">
              <div className="h-full bg-[var(--color-primary)] opacity-30 w-full"></div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <MapIcon className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-gray-900">1. Select Property</h4>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <Banknote className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-gray-900">2. Deposit</h4>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-gray-900">3. Installments</h4>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-gray-900">4. Allocation</h4>
            </div>

            <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <div className="w-16 h-16 rounded-2xl bg-white text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-gray-900">5. Documentation</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Action CTAs */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 border border-gray-100 text-center flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                <Map className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Looking to Buy?</h3>
              <p className="text-gray-600 mb-8 flex-grow text-sm md:text-base">Let our experts find the perfect match for your requirements.</p>
              <Link href="/requests/new" className="bg-gray-900 hover:bg-black text-white font-semibold rounded-xl w-full py-3.5 transition-colors">Submit Request</Link>
            </div>
            
            <div className="bg-[var(--color-primary-dark)] text-white rounded-[2rem] p-8 md:p-10 text-center flex flex-col h-full hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888052063-42bf7ebff33b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 backdrop-blur-sm border border-white/20">
                <Building2 className="w-8 h-8 text-[var(--color-gold)]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Want to Sell?</h3>
              <p className="text-gray-300 mb-8 flex-grow text-sm md:text-base relative z-10">Partner with M.I. Real Estate to connect with verified buyers globally.</p>
              <Link href="/list-property" className="bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-gray-900 font-bold rounded-xl w-full py-3.5 transition-colors relative z-10 flex justify-center items-center">List Property</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">Client Success Stories</h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-4"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                  <div className="flex text-[var(--color-gold)] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm md:text-base italic mb-6 leading-relaxed">"{t.review}"</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {t.customerPhoto ? (
                        <Image src={t.customerPhoto} alt={t.customerName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-sm">{t.customerName.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">{t.customerName}</h4>
                      <p className="text-xs text-gray-500">Verified Client</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Office Location & Map */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Our Head Office</h2>
            <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-4"></div>
          </div>
          
          <div className="w-full h-[300px] md:h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative">
            {office?.mapsLink ? (
              <iframe 
                src={office.mapsLink.replace('/maps/place/', '/maps/embed/v1/place?key=YOUR_API_KEY&q=').replace('https://maps.google.com/?q=', 'https://maps.google.com/maps?q=').concat('&output=embed')} 
                className="w-full h-full border-0" 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <MapPin className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">Map temporarily unavailable.</p>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:top-6 md:bottom-auto md:left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-gray-100 md:max-w-[300px]">
              <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-[var(--color-primary)]" /> Contact Information</h4>
              <div className="space-y-2 text-xs md:text-sm text-gray-600">
                <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" /> {office?.address || 'M.I. Real Estate Plaza, Zoo Road, Kano'}</p>
                <p className="flex items-start gap-2"><PhoneCall className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" /> {office?.phone1 || '+234 803 123 4567'}</p>
                <p className="flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {office?.whatsapp || '2348031234567'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
