// src-react/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Changed from './App' to './app'
import './App.css'; // Optional: for global React component styles

// Ensure the element with id 'root' exists in your templates/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Renders your main React component */}
  </React.StrictMode>
);