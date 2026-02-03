
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import Tips from './pages/Tips';
import BabMap from './pages/BabMap';
import BabBenfeitoria from './pages/BabBenfeitoria';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Calculator />} />
          <Route path="/dicas" element={<Tips />} />
          <Route path="/mapa" element={<BabMap />} />
          <Route path="/benfeitoria" element={<BabBenfeitoria />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
