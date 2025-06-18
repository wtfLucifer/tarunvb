// src-react/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Corrected from './App' to './app'
import './app.css'; // Corrected from './App.css' to './app.css'

// Ensure the element with id 'root' exists in your templates/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Renders your main React component */}
  </React.StrictMode>
);