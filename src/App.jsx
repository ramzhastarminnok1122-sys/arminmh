import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NeginHome from './pages/NeginHome';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NeginHome />} />
      </Routes>
    </BrowserRouter>
  );
}
