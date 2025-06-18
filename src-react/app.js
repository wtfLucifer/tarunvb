import React, { useState } from 'react';
import GeminiBot from './GeminiBot';
import './App.css'; // Styling for this component and its children

function App() {
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', message: "Hello, I am Tarun, your personal AI. How can I help you today?" }
  ]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-md">
        <h1 className="text-4xl font-bebas tracking-wide">Tarun's AI Chat</h1>
        <p className="text-lg font-bebas">Your personal AI assistant.</p>
      </header>

      <div className="flex-grow overflow-y-auto p-4 flex flex-col-reverse custom-scrollbar">
        {chatHistory.slice().reverse().map((chat, index) => (
          <div key={index} className={`chat-message ${chat.sender === 'user' ? 'user-message' : 'bot-message'} mb-3`}>
            <p className="p-3 rounded-lg max-w-lg shadow-md">
              <strong>{chat.sender === 'user' ? 'You:' : 'Tarun:'}</strong> {chat.message}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-200 border-t border-gray-300">
        <GeminiBot setChatHistory={setChatHistory} />
      </div>
    </div>
  );
}

export default App;