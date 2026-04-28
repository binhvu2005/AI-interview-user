import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { AppRoutes } from './routes';

function AppContent() {
  const element = useRoutes(AppRoutes);
  return element;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
