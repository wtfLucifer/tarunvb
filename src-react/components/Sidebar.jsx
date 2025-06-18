import React from 'react';

const Sidebar = ({ userPrompts = [] }) => { // Changed messages to userPrompts for consistency with App.js
  return (
    <div className="sidebar w-64 bg-white border-r border-black text-black p-4 overflow-y-auto custom-scrollbar">
      <h2 className="text-4xl font-bangers mb-8 text-red-600">CHAT HISTORY</h2> {/* Increased font size & added color */}
      {userPrompts.length === 0 ? (
        <p className="text-gray-400 text-base">No chats yet. Start a conversation!</p>
      ) : (
        userPrompts.map((prompt, index) => (
          <div key={index} className="sidebar-prompt text-xl text-gray-600 hover:text-gray-900 cursor-pointer py-2 truncate">
            {index + 1}. {prompt}
          </div>
        ))
      )}
    </div>
  );
};

export default Sidebar;