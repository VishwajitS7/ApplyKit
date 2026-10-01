import React from 'react';
import ReactDOM from 'react-dom/client';
import { OptionsApp } from './pages/OptionsApp';
import '../index.css';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <OptionsApp />
    </React.StrictMode>
  );
}
