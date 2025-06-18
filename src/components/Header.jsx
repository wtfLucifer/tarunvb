import React from 'react';
import profile from '../assets/profile.png'; // Path updated based on your structure
import { FaWhatsapp, FaLinkedinIn } from 'react-icons/fa'; // Changed FaLinkedin to FaLinkedinIn for consistency with previous use

const Header = () => {
  return (
    <header className="header-section bg-white text-black py-8 px-6 shadow-lg border-b border-gray-200 mx-auto w-full max-w-5xl flex justify-between items-center">
      <div>
        <h1 className="text-[3.5rem] md:text-[4rem] font-bangers leading-tight text-red-600 tracking-wide">Ask Anything About Tarun</h1> {/* Added text-red-600 for header color */}
        <p className="text-[1.75rem] md:text-[2rem] font-bangers mt-2 text-gray-800">
          (To find out whether he is a good fit for the AI Agent Team)
        </p>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <img src={profile} alt="Tarun" className="w-32 h-32 rounded-full mb-2 border-4 border-black object-cover" /> {/* Increased border */}
        <div className="flex gap-4">
          <a href="https://wa.me/7737343549" target="_blank" rel="noopener noreferrer" className="text-black hover:text-green-500 transition-colors duration-200">
            <FaWhatsapp size={32} /> {/* Consistent icon size */}
          </a>
          <a href="https://www.linkedin.com/in/gehlottarun1898/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-blue-600 transition-colors duration-200">
            <FaLinkedinIn size={32} /> {/* Consistent icon size */}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;