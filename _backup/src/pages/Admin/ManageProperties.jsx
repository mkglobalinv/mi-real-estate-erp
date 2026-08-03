import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { PropertyContext } from '../../context/PropertyContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ManageProperties = () => {
  const { properties, deleteProperty } = useContext(PropertyContext);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteProperty(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Properties</h1>
        <Link to="/admin/properties/add" className="btn-primary flex items-center gap-2">
          <FaPlus /> Add New
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Property Details</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Price</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Plot Size</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map(property => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img src={property.image} alt={property.title} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{property.title}</h4>
                        <p className="text-sm text-gray-500">{property.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    ₦{property.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {property.plotSize}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Link 
                        to={`/admin/properties/edit/${property.id}`}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <FaEdit className="text-lg" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    <p className="mb-4">No properties found.</p>
                    <Link to="/admin/properties/add" className="text-primary hover:underline font-medium">
                      Add your first property
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProperties;
