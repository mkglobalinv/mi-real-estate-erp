import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { PropertyContext } from '../../context/PropertyContext';
import { FaHome, FaUsers, FaChartLine, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const { properties } = useContext(PropertyContext);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link to="/admin/properties/add" className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Property
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600 text-2xl">
            <FaHome />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Properties</p>
            <h3 className="text-2xl font-bold text-gray-900">{properties.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 text-2xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recent Inquiries</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600 text-2xl">
            <FaChartLine />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Views</p>
            <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Recent Properties</h2>
          <Link to="/admin/properties" className="text-primary hover:underline text-sm font-medium">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Property</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Price</th>
              </tr>
            </thead>
            <tbody>
              {properties.slice(0, 5).map(property => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={property.image} alt={property.title} className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium text-gray-800 line-clamp-1">{property.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{property.location}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    ₦{property.price.toLocaleString()}
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">No properties found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
