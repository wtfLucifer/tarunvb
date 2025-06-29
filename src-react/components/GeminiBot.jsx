import React, { useState } from 'react';
import { FaPaperPlane, FaMicrophone, FaStopCircle } from 'react-icons/fa'; // Import voice icons

const GeminiBot = ({ setChatHistory }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSttTtsWarning, setShowSttTtsWarning] = useState(false); // State for warning pop-up

  const handleSend = async () => {
    if (!input.trim()) return;

    setChatHistory({ sender: 'user', message: input });
    // setResponse('Thinking...'); // Removed as response is now handled via chatHistory in App.js

    const userMessage = input; 
    setInput('');
    setChatHistory({ sender: 'bot', message: 'Tarun is thinking...' }); // Show thinking message immediately

    try {
      // Use the backend endpoint for API calls
      const res = await fetch('/api/ask_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage, 
        }),
      });

      const data = await res.json();

      console.log("📤 Prompt sent to backend:", userMessage);
      console.log("🔍 Backend raw response:", data);

      let botReply = '';
      if (data && data.bot_response_text) {
        botReply = data.bot_response_text;
      } else if (data && data.error) {
        botReply = `Error from backend: ${data.error}`;
      } else {
        botReply = 'Unexpected response format from backend.';
      }
      
      setChatHistory({ sender: 'bot', message: botReply }); // Add bot's actual response

    } catch (error) {
      console.error('❌ Error communicating with backend:', error);
      const errorMessage = `Error: Could not reach the server. (${error.message})`;
      setChatHistory({ sender: 'bot', message: errorMessage });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isRecording) {
      handleSend();
    }
  };

  const handleVoiceButtonClick = () => {
    setIsRecording(prev => !prev);
    setShowSttTtsWarning(true); // Always show warning when button is clicked

    if (isRecording) {
      console.log("Stopped recording.");
    } else {
      console.log("Started recording...");
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Voice Recording Button */}
        <button
          onClick={handleVoiceButtonClick}
          className={`p-4 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isRecording ? 'bg-white border border-black' : 'bg-black'
          }`}
          style={{ width: '64px', height: '64px' }}
        >
          {isRecording ? (
            <FaStopCircle className="text-red-600 text-4xl" />
          ) : (
            <FaMicrophone className="text-white text-4xl" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="TYPE YOUR QUESTION..."
          className="flex-1 p-5 rounded bg-black text-white border border-black text-2xl font-bebas placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />
        <button onClick={handleSend} className="p-5 rounded-full bg-black hover:bg-gray-800 transition-colors duration-200">
          <FaPaperPlane className="text-white text-3xl" />
        </button>
      </div>

      {/* STT/TTS Warning Pop-up */}
      {showSttTtsWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-8 rounded-lg shadow-xl border border-gray-300 text-center font-bebas text-black max-w-sm"> {/* Adjusted for light theme pop-up */}
            <p className="text-2xl mb-4 leading-relaxed">
              Not added STT & TTS yet, need to setup billing account, smh.
            </p>
            <p className="text-xl mb-6 leading-relaxed">
              Please type, I have built a good RAG.
            </p>
            <button
              onClick={() => setShowSttTtsWarning(false)}
              className="mt-4 px-8 py-4 bg-black hover:bg-gray-800 text-white text-2xl font-bangers tracking-wider rounded-lg transition-colors duration-200"
            >
              OK, GOT IT!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiBot;