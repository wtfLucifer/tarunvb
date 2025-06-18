import React, { useState } from 'react';
import GeminiBot from './GeminiBot';
import './App.css'; // Global styling
import { FaWhatsapp, FaLinkedinIn } from 'react-icons/fa'; // Importing social icons

// PROFILE PHOTO PATH: Ensure 'profile-photo.jpg' is in your 'static/' folder
// Vercel serves the 'static' folder from the root of your domain.
const profilePhotoUrl = '/static/profile-photo.jpg'; 

function App() {
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', message: "Hello, I am Tarun, your personal AI. How can I help you today?" }
  ]);
  const [userPrompts, setUserPrompts] = useState([]); // To store just user prompts for sidebar

  // Function to add new messages and update sidebar prompts
  const addMessageToChat = (messageObj) => {
    setChatHistory(prev => [...prev, messageObj]);
    if (messageObj.sender === 'user') {
      setUserPrompts(prev => [...prev, messageObj.message]);
    }
  };

  return (
    <div className="app-container flex h-screen bg-black text-white font-bebas">
      {/* Sidebar */}
      <aside className="sidebar w-1/4 min-w-[280px] bg-gray-900 border-r border-gray-700 p-6 flex flex-col">
        <h2 className="text-4xl font-bangers mb-8 text-red-500">CHAT HISTORY</h2>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {userPrompts.length > 0 ? (
            userPrompts.map((prompt, index) => (
              <div key={index} className="sidebar-prompt text-xl text-gray-400 hover:text-white cursor-pointer py-2 truncate">
                {index + 1}. {prompt}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-base">No chats yet. Start a conversation!</p>
          )}
        </div>
      </aside>

      {/* Main Content Panel */}
      <main className="main-content flex-grow flex flex-col bg-black">
        {/* Header Section - Centered with max-width */}
        <header className="header-section bg-black text-white py-8 px-6 shadow-lg border-b border-gray-800 mx-auto w-full max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              {/* Increased font size for Bangers font */}
              <h1 className="text-7xl md:text-8xl font-bangers text-red-500 tracking-wide mb-2">ASK ANYTHING ABOUT TARUN</h1>
              <p className="text-2xl md:text-3xl font-bangers text-white">
                (TO FIND OUT WHETHER HE IS A GOOD FIT FOR THE AI AGENT TEAM)
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <img src={profilePhotoUrl} alt="Tarun's Profile" className="w-24 h-24 rounded-full border-4 border-white object-cover" />
              <div className="flex flex-col space-y-3">
                <a href="https://wa.me/+917737343549" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500 transition-colors duration-200">
                  <FaWhatsapp size={36} /> {/* Increased icon size */}
                </a>
                <a href="https://www.linkedin.com/in/gehlottarun1898" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors duration-200">
                  <FaLinkedinIn size={36} /> {/* Increased icon size */}
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Display Area - Centered with max-width */}
        <div className="chat-display-area flex-grow overflow-y-auto p-6 flex flex-col custom-scrollbar mx-auto w-full max-w-5xl">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.sender === 'user' ? 'user-message' : 'bot-message'} mb-4`}>
              <p className="message-bubble p-4 rounded-lg shadow-md max-w-[calc(100%-80px)]"> {/* Adjusted max-width slightly */}
                {chat.sender === 'user' ? (
                  <strong className="text-blue-300">You:</strong>
                ) : (
                  <strong className="text-green-300">Tarun:</strong>
                )}{' '}
                <span className="font-bebas text-xl">{chat.message}</span> {/* Bebas Neue size 20px */}
              </p>
            </div>
          ))}
        </div>

        {/* Input area - Centered with max-width */}
        <div className="input-area p-6 bg-gray-900 border-t border-gray-700 mx-auto w-full max-w-5xl">
          <GeminiBot setChatHistory={addMessageToChat} />
        </div>
      </main>
    </div>
  );
}

export default App;