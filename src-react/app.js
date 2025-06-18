// src-react/app.js
import React from 'react';
import GeminiBot from './components/GeminiBot'; // Assuming this path is correct
import './app.css'; // Corrected from './App.css' to './app.css'

export default function App() {
  return (
    <div className="App bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <GeminiBot />
    </div>
  );
}