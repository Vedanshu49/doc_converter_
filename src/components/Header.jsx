import React from "react";

const Header = ({ user, onLogout, onLogin }) => (
  <header className="backdrop-blur-xl bg-white/70 border-b border-slate-200 shadow-lg rounded-b-2xl px-8 py-6 flex flex-col items-center transition-all duration-300">
    <div className="flex flex-col items-center w-full mb-2">
      <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-400 bg-clip-text text-transparent drop-shadow text-center">Doc Converter</span>
      <span className="text-sm text-gray-500 font-medium mt-1 text-center">A project by Vedanshu</span>
    </div>
    <div className="flex items-center justify-between w-full mt-2">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Doc Converter Logo" className="h-9 w-9 drop-shadow-md" />
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-6">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border-2 border-indigo-400 shadow" />
            )}
            <span className="text-gray-700 font-semibold hidden sm:inline text-lg">Welcome, {user.displayName}!</span>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 text-base min-w-[120px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-extrabold shadow-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 text-lg min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Sign in with Google"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v1a4 4 0 01-8 0V4m8 0a4 4 0 01-8 0m8 0V3a4 4 0 00-8 0v1" /></svg>
            Sign In with Google
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
