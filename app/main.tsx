import React from 'react';
import { createRoot } from 'react-dom/client';
import Explorer from '../components/explorer/Explorer';
import './globals.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Explorer />
  </React.StrictMode>,
);
