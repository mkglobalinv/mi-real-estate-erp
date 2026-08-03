import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag } from 'lucide-react';
import { PropertyListing } from '@/lib/types';

export default function PropertyCard({ property }: { property: PropertyListing }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <Image 
          src={property.images[0] || 'https://via.placeholder.com/800'} 
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
          For {property.purpose}
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider w-max">
              Featured
            </span>
          )}
          {property.hotDeal && (
            <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider w-max">
              Hot Deal
            </span>
          )}
          {property.newListing && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider w-max">
              New
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-md">
          {property.ref}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1" title={property.title}>{property.title}</h3>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="mr-1.5 w-4 h-4 text-[var(--color-primary)]" />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        
        <p className="text-2xl font-extrabold text-[var(--color-primary)] mb-4">{formatPrice(property.price)}</p>
        
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4 mb-6">
          <div className="flex items-center text-gray-600 text-sm font-medium bg-gray-50 px-3 py-1.5 rounded-md">
            <Tag className="mr-1.5 w-4 h-4 text-gray-400" />
            {property.type}
          </div>
          {property.easyBuyEligible && (
            <div className="text-xs font-bold text-[var(--color-accent)] bg-amber-50 px-3 py-1.5 rounded-md">
              Easy Buy Eligible
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <Link 
            href={`/properties/${property.id}`} 
            className="w-full block text-center bg-gray-50 hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-white border border-gray-200 hover:border-[var(--color-primary)] font-semibold py-3 px-4 rounded-xl transition-all duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
