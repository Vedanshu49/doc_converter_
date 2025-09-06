import React from "react";

const Header = ({ user, onLogout, onLogin }) => (
  <header className="bg-card border-b border-border shadow-sm px-4 py-3">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Doc Converter Logo" className="h-8 w-8" />
        <span className="text-xl font-bold text-foreground">Doc Converter</span>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full border-2 border-primary" />
            )}
            <span className="text-foreground font-semibold hidden sm:inline">Welcome, {user.displayName}!</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
