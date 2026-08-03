"use client";

import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

interface EasyBuyCalculatorProps {
  propertyPrice: number;
  initialDeposit?: number;
}

export default function EasyBuyCalculator({ propertyPrice, initialDeposit = 0 }: EasyBuyCalculatorProps) {
  const [duration, setDuration] = useState<number>(12); // months
  const [deposit, setDeposit] = useState<number>(initialDeposit || Math.round(propertyPrice * 0.2)); // Default 20%
  const [monthly, setMonthly] = useState<number>(0);

  useEffect(() => {
    // Basic calculation (Price - Deposit) / Duration
    const balance = propertyPrice - deposit;
    if (balance > 0) {
      setMonthly(balance / duration);
    } else {
      setMonthly(0);
    }
  }, [propertyPrice, deposit, duration]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-4 text-[var(--color-accent)] font-bold">
        <Calculator className="w-6 h-6" />
        <h3 className="text-xl">Easy Buy Calculator</h3>
      </div>
      
      <p className="text-sm text-gray-700 mb-6">
        Estimate your installment plan. Values are subject to final terms.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Property Price</label>
          <div className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-900 font-bold">
            {formatPrice(propertyPrice)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Initial Deposit</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 font-medium">₦</span>
            <input 
              type="number" 
              value={deposit} 
              onChange={(e) => setDeposit(Number(e.target.value))}
              min={0}
              max={propertyPrice}
              className="w-full pl-8 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all font-bold text-gray-900"
            />
          </div>
          <input 
            type="range" 
            min={0} 
            max={propertyPrice} 
            step={100000}
            value={deposit} 
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="w-full mt-3 accent-[var(--color-accent)]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{Math.round((deposit / propertyPrice) * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Months)</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] outline-none font-bold text-gray-900"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
            <option value={18}>18 Months</option>
            <option value={24}>24 Months</option>
          </select>
        </div>

        <div className="pt-4 border-t border-amber-200/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Remaining Balance</span>
            <span className="font-bold text-gray-900">{formatPrice(Math.max(0, propertyPrice - deposit))}</span>
          </div>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-amber-200 shadow-sm mt-3">
            <span className="text-sm font-bold text-gray-700">Estimated Monthly</span>
            <span className="text-xl font-extrabold text-[var(--color-primary)]">{formatPrice(monthly)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
