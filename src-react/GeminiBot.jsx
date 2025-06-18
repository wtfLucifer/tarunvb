import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const GeminiBot = ({ setChatHistory }) => { 
  const [input, setInput] = useState('');
  const [currentBotResponse, setCurrentBotResponse] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    setChatHistory(prev => [...prev, { sender: 'user', message: input }]);
    setCurrentBotResponse('Thinking...');

    const userMessage = input; 
    setInput('');

    try {
      // Fetch from your *backend* API endpoint served by Flask
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
      
      setCurrentBotResponse(botReply);
      setChatHistory(prev => [...prev, { sender: 'bot', message: botReply }]);

    } catch (error) {
      console.error('❌ Error communicating with backend:', error);
      const errorMessage = `Error: Could not reach the server. (${error.message})`;
      setCurrentBotResponse(errorMessage);
      setChatHistory(prev => [...prev, { sender: 'bot', message: errorMessage }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="flex-grow whitespace-pre-line text-black text-2xl font-bebas mb-4">
        {currentBotResponse || 'Ask something...'}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          className="flex-1 p-4 rounded bg-black text-white border border-black text-2xl font-bebas"
          autoFocus
        />
        <button onClick={handleSend} className="p-4 rounded-full bg-black">
          <FaPaperPlane className="text-white text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default GeminiBot;