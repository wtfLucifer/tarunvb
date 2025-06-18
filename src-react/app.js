import React, { useState } from 'react';
import GeminiBot from './GeminiBot';
import './App.css'; // Global styling
import { FaWhatsapp, FaLinkedinIn } from 'react-icons/fa'; // Importing social icons

// Import your profile photo
// Ensure 'profile-photo.jpg' is placed in your 'static/' directory,
// or adjust path if you put it in 'src-react/assets' and configure Parcel to handle assets.
// For simplicity, let's assume it's directly accessible via /static/
const profilePhotoUrl = '/static/profile-photo.jpg'; // Adjust if your compiled static path is different

function App() {
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', message: "Hello, I am Tarun, your personal AI. How can I help you today?" }
  ]);
  const [currentBotResponse, setCurrentBotResponse] = useState("Hello, I am Tarun, your personal AI. How can I help you today?");
  const [userPrompts, setUserPrompts] = useState([]); // To store just user prompts for sidebar

  // Function to add new messages and update sidebar prompts
  const addMessageToChat = (messageObj) => {
    setChatHistory(prev => [...prev, messageObj]);
    if (messageObj.sender === 'user') {
      setUserPrompts(prev => [...prev, messageObj.message]);
    }
    // Update current bot response for the main panel display
    if (messageObj.sender === 'bot') {
      setCurrentBotResponse(messageObj.message);
    }
  };

  return (
    <div className="app-container flex h-screen bg-black text-white font-bebas">
      {/* Sidebar */}
      <aside className="sidebar w-1/4 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
        <h2 className="text-3xl font-bangers mb-6 text-white">CHAT HISTORY</h2>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {chatHistory.filter(chat => chat.sender === 'user').map((chat, index) => (
            <div key={index} className="sidebar-prompt text-lg text-gray-400 hover:text-white cursor-pointer py-1 truncate">
              {index + 1}. {chat.message}
            </div>
          ))}
          {userPrompts.length === 0 && <p className="text-gray-600 text-sm">No chats yet.</p>}
        </div>
      </aside>

      {/* Main Content Panel */}
      <main className="main-content flex-grow flex flex-col bg-black">
        {/* Header Section */}
        <header className="header-section bg-black text-white p-6 shadow-lg border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-5xl font-bangers text-red-500 tracking-wide">ASK ANYTHING ABOUT TARUN</h1>
              <p className="text-xl font-bangers text-white">
                (TO FIND OUT WHY HE IS A GREAT FIT FOR THE AI AGENT TEAM)
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <img src={profilePhotoUrl} alt="Tarun's Profile" className="w-20 h-20 rounded-full border-2 border-white object-cover" />
              <div className="flex flex-col space-y-2">
                <a href="https://wa.me/+917737343549" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500">
                  <FaWhatsapp size={28} />
                </a>
                <a href="https://www.linkedin.com/in/gehlottarun1898" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                  <FaLinkedinIn size={28} />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Display Area - now shows full history */}
        <div className="chat-display-area flex-grow overflow-y-auto p-6 flex flex-col custom-scrollbar">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.sender === 'user' ? 'user-message' : 'bot-message'} mb-4`}>
              <p className="message-bubble p-4 rounded-lg max-w-2xl shadow-md">
                {chat.sender === 'user' ? (
                  <strong className="text-blue-300">You:</strong>
                ) : (
                  <strong className="text-green-300">Tarun:</strong>
                )}{' '}
                <span className="font-bebas text-xl">{chat.message}</span> {/* Apply Bebas Neue */}
              </p>
            </div>
          ))}
        </div>

        {/* Input area - GeminiBot component handles input and sends to backend */}
        <div className="input-area p-6 bg-gray-900 border-t border-gray-700">
          <GeminiBot setChatHistory={addMessageToChat} />
        </div>
      </main>
    </div>
  );
}

export default App;