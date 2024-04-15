import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './homepage';
import PlayerDetailsPage from './playerdetails'; // Create this component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;