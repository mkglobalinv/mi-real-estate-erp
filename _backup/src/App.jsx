import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Properties from './pages/Properties';
import EasyBuy from './pages/EasyBuy';
import Contact from './pages/Contact';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import ManageProperties from './pages/Admin/ManageProperties';
import PropertyForm from './pages/Admin/PropertyForm';

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render Navbar/Footer for public pages */}
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/easy-buy" element={<EasyBuy />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin">
            <Route index element={
              <div className="bg-gray-50 min-h-screen"><Dashboard /></div>
            } />
            <Route path="properties" element={
              <div className="bg-gray-50 min-h-screen"><ManageProperties /></div>
            } />
            <Route path="properties/add" element={
              <div className="bg-gray-50 min-h-screen"><PropertyForm /></div>
            } />
            <Route path="properties/edit/:id" element={
              <div className="bg-gray-50 min-h-screen"><PropertyForm /></div>
            } />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
