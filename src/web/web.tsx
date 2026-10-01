import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardView } from './pages/DashboardView';
import '../index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DashboardView />
    </React.StrictMode>
  );
}
