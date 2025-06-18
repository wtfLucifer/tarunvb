import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeminiBot from './components/GeminiBot';
import './App.css'; // Ensure App.css is imported

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [userPrompts, setUserPrompts] = useState([]); // To store just user prompts for sidebar

  // Function to add new messages and update sidebar prompts
  const addMessageToChat = (messageObj) => {
    setChatHistory(prev => [...prev, messageObj]);
    if (messageObj.sender === 'user') {
      setUserPrompts(prev => [...prev, messageObj.message]);
    }
  };

  return (
    <div className="app-container flex h-screen bg-white text-black font-bebas">
      <Sidebar userPrompts={userPrompts} /> {/* Pass userPrompts for sidebar history */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
        <Header />
        {/* Main Chat Display Area - Centered with max-width */}
        <div className="chat-display-area flex-grow overflow-y-auto p-6 flex flex-col custom-scrollbar mx-auto w-full max-w-5xl">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.sender === 'user' ? 'user-message' : 'bot-message'} mb-4`}>
              <p className="message-bubble p-4 rounded-lg shadow-md max-w-[calc(100%-80px)]">
                {chat.sender === 'user' ? (
                  <strong className="text-gray-700">You:</strong>
                ) : (
                  <strong className="text-gray-700">Tarun:</strong>
                )}{' '}
                <span className="font-bebas text-xl">{chat.message}</span>
              </p>
            </div>
          ))}
        </div>
        {/* Input area - Centered with max-width */}
        <div className="input-area p-6 bg-white border-t border-gray-200 mx-auto w-full max-w-5xl">
          <GeminiBot setChatHistory={addMessageToChat} /> {/* Use addMessageToChat */}
        </div>
      </div>
    </div>
  );
}