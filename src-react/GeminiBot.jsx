import React, { useState } from 'react';
import { FaPaperPlane, FaMicrophone, FaStopCircle } from 'react-icons/fa'; // Added microphone icons

const GeminiBot = ({ setChatHistory }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false); // New state for recording button

  const handleSend = async () => {
    if (!input.trim()) return;

    setChatHistory({ sender: 'user', message: input });
    // Temporarily add a "thinking" message from bot
    setChatHistory({ sender: 'bot', message: 'Tarun is thinking...' }); 

    const userMessage = input; 
    setInput('');

    try {
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
      
      // Update the *last* bot message or add a new one if it was just "thinking"
      // For simplicity here, we'll just add the final response.
      setChatHistory({ sender: 'bot', message: botReply });

    } catch (error) {
      console.error('❌ Error communicating with backend:', error);
      const errorMessage = `Error: Could not reach the server. (${error.message})`;
      setChatHistory({ sender: 'bot', message: errorMessage });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isRecording) { // Only send on Enter if not recording
      handleSend();
    }
  };

  const handleVoiceButtonClick = () => {
    // This is purely UI logic for now. Actual STT/TTS integration comes later.
    setIsRecording(prev => !prev);
    if (isRecording) {
      // Logic for stopping recording and sending (future)
      console.log("Stopped recording. Would send/share now.");
      // If you want it to automatically send input after stopping recording:
      // handleSend(); // Uncomment this line if stopping recording should also send the input
    } else {
      // Logic for starting recording (future)
      console.log("Started recording...");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Voice Recording Button */}
      <button
        onClick={handleVoiceButtonClick}
        className={`p-4 rounded-lg flex items-center justify-center transition-colors duration-200 ${
          isRecording ? 'bg-white' : 'bg-red-600'
        }`}
        style={{ width: '60px', height: '60px' }} // Make it a square button
      >
        {isRecording ? (
          <FaStopCircle className="text-red-600 text-3xl" /> // White button, red stop icon
        ) : (
          <FaMicrophone className="text-white text-3xl" /> // Red button, white mic icon
        )}
      </button>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="TYPE YOUR QUESTION..."
        className="flex-1 p-4 rounded bg-gray-700 text-white border border-gray-600 text-2xl font-bebas placeholder-gray-400"
        autoFocus
      />
      <button onClick={handleSend} className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200">
        <FaPaperPlane className="text-white text-3xl" />
      </button>
    </div>
  );
};

export default GeminiBot;