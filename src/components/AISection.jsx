
import React from "react";

const AISection = ({ user, onLogin, aiLoading, aiResult, onAIClick, aiEnabled }) => {
  return (
    <div className="w-full bg-[rgba(25,25,35,0.85)] border border-[rgba(80,80,120,0.25)] rounded-2xl shadow-2xl p-8 backdrop-blur-lg flex flex-col gap-8 glassmorphism min-h-[320px] transition-all duration-300">
      {!user ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center animate-fade-in">
          <h2 className="text-2xl font-extrabold text-white">Unlock AI Tools</h2>
          <p className="text-muted-foreground">Sign in to summarize documents, extract keywords, and more.</p>
          <button
            onClick={onLogin}
            className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-semibold shadow hover:from-[#23243a] hover:to-[#4f5bd5] transition-all duration-200"
          >
            Sign In with Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-white">AI Tools</h2>
          {aiLoading ? (
            <div className="flex flex-col items-center gap-4 min-h-[120px]">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" style={{ borderTopColor: '#4f5bd5' }}></div>
              <p className="text-lg font-semibold text-white">Processing...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mt-2">
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#23243a] to-[#4f5bd5] text-white font-semibold shadow border border-[rgba(120,120,180,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onAIClick && onAIClick('summarize')}
                  disabled={!aiEnabled}
                >
                  Summarize Document
                </button>
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#23243a] to-[#4f5bd5] text-white font-semibold shadow border border-[rgba(120,120,180,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onAIClick && onAIClick('keywords')}
                  disabled={!aiEnabled}
                >
                  Extract Keywords
                </button>
              </div>
              {aiResult && (
                <div className="mt-4 p-4 rounded-xl bg-[rgba(40,40,60,0.7)] text-white text-sm shadow-inner animate-fade-in">
                  <pre className="whitespace-pre-wrap break-words">{aiResult}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AISection;
