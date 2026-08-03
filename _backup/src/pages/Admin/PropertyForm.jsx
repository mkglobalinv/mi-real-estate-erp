import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PropertyContext } from '../../context/PropertyContext';
import { v4 as uuidv4 } from 'uuid';
import { FaArrowLeft } from 'react-icons/fa';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, addProperty, updateProperty } = useContext(PropertyContext);
  
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    plotSize: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    if (isEditing) {
      const property = properties.find(p => p.id === id);
      if (property) {
        setFormData({
          title: property.title,
          location: property.location,
          price: property.price,
          plotSize: property.plotSize,
          image: property.image,
          description: property.description
        });
      } else {
        navigate('/admin/properties');
      }
    }
  }, [id, isEditing, properties, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      updateProperty({
        ...formData,
        id,
        price: Number(formData.price)
      });
    } else {
      addProperty({
        ...formData,
        id: uuidv4(),
        price: Number(formData.price)
      });
    }
    
    navigate('/admin/properties');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/properties" className="text-gray-500 hover:text-primary transition-colors">
          <FaArrowLeft className="text-xl" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title}
                onChange={handleChange}
                required 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Luxury 4 Bedroom Duplex"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                value={formData.location}
                onChange={handleChange}
                required 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Lekki Phase 1, Lagos"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input 
                type="number" 
                id="price" 
                name="price" 
                value={formData.price}
                onChange={handleChange}
                required 
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. 150000000"
              />
            </div>
            <div>
              <label htmlFor="plotSize" className="block text-sm font-medium text-gray-700 mb-1">Plot Size</label>
              <input 
                type="text" 
                id="plotSize" 
                name="plotSize" 
                value={formData.plotSize}
                onChange={handleChange}
                required 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. 500 sqm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input 
              type="url" 
              id="image" 
              name="image" 
              value={formData.image}
              onChange={handleChange}
              required 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                <img src={formData.image} alt="Preview" className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Detailed description of the property..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Link to="/admin/properties" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
