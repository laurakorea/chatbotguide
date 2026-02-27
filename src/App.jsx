import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TourPlayer from './chat/TourPlayer';
import AdminList from './admin/AdminList';
import AdminEdit from './admin/AdminEdit';
import VisualEditor from './admin/VisualEditor/VisualEditor';
import tourData from './data/tourData.json';

const App = () => {
  // Seed initial data if empty
  useEffect(() => {
    const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
    const hasOldData = savedTours.some(t => t.id === 'default-tour' && !JSON.stringify(t.jsonData).includes('feedback'));

    if (savedTours.length === 0 || hasOldData) {
      const initialTour = {
        id: 'default-tour',
        title: '로마 콜로세움 챗봇투어',
        slug: 'rome-colosseum',
        jsonData: tourData,
        thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        updatedAt: new Date().toISOString()
      };

      let updated;
      if (hasOldData) {
        updated = savedTours.map(t => t.id === 'default-tour' ? initialTour : t);
      } else {
        updated = [initialTour];
      }
      localStorage.setItem('tours', JSON.stringify(updated));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* User Facing Tour Page */}
        <Route path="/tour/:slug" element={<TourPlayer />} />

        {/* Admin Interface */}
        <Route path="/admin/tours" element={<AdminList />} />
        <Route path="/admin/tours/new" element={<AdminEdit />} />
        <Route path="/admin/tours/edit/:id" element={<AdminEdit />} />
        <Route path="/admin/tours/builder/:id" element={<VisualEditor />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/admin/tours" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
