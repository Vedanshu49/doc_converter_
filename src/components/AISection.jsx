import React from "react";

const AISection = ({ user, onLogin }) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col gap-6">
      {!user ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">Unlock AI-Powered Tools</h2>
          <p className="text-muted-foreground">Log in to automatically summarize your documents, extract key topics, and more.</p>
          <button
            onClick={onLogin}
            className="mt-2 px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">AI Tools</h2>
          <p className="text-muted-foreground">AI features are coming soon! Soon you will be able to summarize, translate and more.</p>
          <div className="flex flex-col gap-3 mt-2">
            <button
              className="w-full py-2.5 rounded-md bg-secondary text-secondary-foreground font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Summarize with AI
            </button>
            <button
              className="w-full py-2.5 rounded-md bg-secondary text-secondary-foreground font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Extract Keywords
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISection;
