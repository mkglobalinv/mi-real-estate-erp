'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export interface ReceiptData {
  transactionId: string;
  date: string;
  customerName: string;
  amount: number;
  paymentFor: string;
  paymentMethod?: string;
}

export default function ReceiptGenerator({ data }: { data: ReceiptData }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${data.transactionId}.pdf`);
    } catch (error) {
      console.error('Failed to generate receipt PDF', error);
      alert('Error generating receipt');
    }
  };

  return (
    <div>
      <button 
        onClick={downloadReceipt}
        className="flex items-center text-sm bg-[var(--color-primary)] text-white px-3 py-1.5 rounded hover:bg-[var(--color-primary-dark)] transition-colors"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Receipt
      </button>

      {/* Hidden Receipt Template */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={receiptRef} 
          className="bg-white p-12 text-gray-800"
          style={{ width: '800px', border: '1px solid #eee' }}
        >
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">M.I. REAL ESTATE</h1>
              <p className="text-sm text-gray-500 mt-1">RC 1380922</p>
              <div className="mt-4 text-sm">
                <p>No. 4, Ground Floor, Maiduguri Road</p>
                <p>Tarauni, Kano State</p>
                <p>0800 000 0000</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-gray-300 uppercase tracking-widest">Receipt</h2>
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-800">Receipt No: <span className="font-normal">{data.transactionId}</span></p>
                <p className="text-sm font-bold text-gray-800 mt-1">Date: <span className="font-normal">{new Date(data.date).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Received From</h3>
            <p className="text-lg font-medium text-gray-900">{data.customerName}</p>
          </div>

          <table className="w-full mb-10 text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 text-sm">
                <th className="py-3 font-bold">Description</th>
                <th className="py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">{data.paymentFor}</td>
                <td className="py-4 text-right font-medium">₦ {data.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-16">
            <div className="w-1/2">
              <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-800">
                <span>Total Paid</span>
                <span>₦ {data.amount.toLocaleString()}</span>
              </div>
              {data.paymentMethod && (
                <p className="text-sm text-gray-500 text-right mt-2">Method: {data.paymentMethod}</p>
              )}
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-16 pt-8 border-t border-gray-200">
            <p>Thank you for doing business with us!</p>
            <p className="mt-1">This is a computer-generated receipt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
