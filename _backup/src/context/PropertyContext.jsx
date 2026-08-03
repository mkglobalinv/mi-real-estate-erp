import React, { createContext, useState, useEffect } from 'react';
import { initialProperties } from '../data/dummyData';

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState(() => {
    const savedProperties = localStorage.getItem('mi_properties');
    return savedProperties ? JSON.parse(savedProperties) : initialProperties;
  });

  useEffect(() => {
    localStorage.setItem('mi_properties', JSON.stringify(properties));
  }, [properties]);

  const addProperty = (property) => {
    setProperties([...properties, property]);
  };

  const updateProperty = (updatedProperty) => {
    setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty, updateProperty, deleteProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};
