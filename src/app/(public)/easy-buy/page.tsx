"use client";
"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Wallet, FileText } from 'lucide-react';

export default function EasyBuyPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="bg-[var(--color-primary-dark)] text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--color-accent)] drop-shadow-lg">Easy Buy Scheme</h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light max-w-3xl mx-auto">
            Zero Interest. Flexible Payments. Immediate Allocation.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-8"></div>
          
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[var(--color-primary)]">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Property</h3>
              <p className="text-gray-600 text-sm">Select any Easy-Buy eligible property from our listings.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Initial Deposit</h3>
              <p className="text-gray-600 text-sm">Pay the required initial deposit (usually 20-30%).</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Spread Balance</h3>
              <p className="text-gray-600 text-sm">Spread the remaining balance over 12 to 24 months, interest-free.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[var(--color-primary)]">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Allocation</h3>
              <p className="text-gray-600 text-sm">Receive your property allocation immediately upon completion of payment.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          <div>
            <h2 className="text-3xl font-bold mb-6">Benefits & Requirements</h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"><CheckCircle className="text-[var(--color-accent)]" /> <span>0% Interest Rate Guarantee</span></li>
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"><CheckCircle className="text-[var(--color-accent)]" /> <span>Flexible 12-24 month duration</span></li>
              <li className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"><CheckCircle className="text-[var(--color-accent)]" /> <span>Instant Documentation</span></li>
            </ul>
            <h3 className="text-xl font-bold mb-4">Required Documents</h3>
            <ul className="space-y-2 text-gray-600 ml-4 list-disc">
              <li>Valid ID (NIN, Passport, Drivers License)</li>
              <li>2 Passport Photographs</li>
              <li>Proof of Income/Employment (Optional for some properties)</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
            <h3 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">Sample Payment Plan</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Property Price:</span>
                <span className="font-bold">₦100,000,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Initial Deposit (20%):</span>
                <span className="font-bold">₦20,000,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Balance:</span>
                <span className="font-bold">₦80,000,000</span>
              </div>
              <div className="flex justify-between text-[var(--color-primary)] pt-2">
                <span className="font-bold">Monthly Installment (24 Mos):</span>
                <span className="font-extrabold text-xl">₦3,333,333 /mo</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/advisor" className="btn-accent w-full block">Start Smart Property Advisor</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
