
import React from "react";

const Header = ({ user, onLogout, onLogin }) => (
  <header
    className="backdrop-blur-md bg-[rgba(20,20,30,0.7)] border-b border-[rgba(80,80,120,0.25)] shadow-lg px-4 py-3 w-full z-20"
    style={{
      WebkitBackdropFilter: 'blur(12px)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm select-none">
          Doc Converter
        </span>
      </div>
      <div>
        {user ? (
          <button
            onClick={onLogout}
            className="px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#3a3f5a] to-[#23243a] text-white shadow-md border border-[rgba(120,120,180,0.25)] hover:from-[#23243a] hover:to-[#3a3f5a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Log Out
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#4f5bd5] to-[#3a3f5a] text-white shadow-md border border-[rgba(120,120,180,0.25)] hover:from-[#3a3f5a] hover:to-[#4f5bd5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
