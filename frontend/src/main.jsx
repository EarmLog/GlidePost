import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Páginas
import Telegram from './pages/Telegram.jsx';
import Facebook from './pages/Facebook.jsx';
import Instagram from './pages/Instagram.jsx';
import Reddit from './pages/Reddit.jsx';      // <--- Asegúrate de tener esta línea
import Discord from './pages/Discord.jsx';    // <--- Asegúrate de tener esta línea
import TikTok from './pages/TikTok.jsx';
import Settings from './pages/Settings.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Telegram />} />
        <Route path="/telegram" element={<Telegram />} />
        <Route path="/reddit" element={<Reddit />} />
        <Route path="/discord" element={<Discord />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);