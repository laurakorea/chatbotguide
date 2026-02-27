import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TourPlayer from './pages/TourPlayer';
import AdminList from './pages/AdminList';
import AdminEdit from './pages/AdminEdit';
import tourData from './data/tourData.json';

const App = () => {
  // Seed initial data if empty
  useEffect(() => {
    const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
    if (savedTours.length === 0) {
      const initialTour = {
        id: 'default-tour',
        title: '기본 투어: 로마 콜로세움',
        slug: 'rome-colosseum',
        jsonData: tourData,
        thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('tours', JSON.stringify([initialTour]));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* User Facing Tour Page (Dynamic) */}
        <Route path="/tour/:slug" element={<TourPlayer />} />

        {/* Admin Interface */}
        <Route path="/admin/tours" element={<AdminList />} />
        <Route path="/admin/tours/new" element={<AdminEdit />} />
        <Route path="/admin/tours/edit/:id" element={<AdminEdit />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/admin/tours" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
