import React from "react";

const AISection = ({ user, onLogin, aiActions, aiLoading, aiResult, onAIClick, aiEnabled }) => {
  return (
    <div className="backdrop-blur-xl bg-white/70 border border-slate-200 rounded-2xl shadow-2xl p-8 flex flex-col gap-8 min-h-[400px] transition-all duration-300">
      {!user ? (
        <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-indigo-700 drop-shadow">Unlock AI-Powered Tools</h2>
          <p className="text-gray-600 text-center max-w-xs font-medium">Log in to automatically summarize your documents, extract key topics, and analyze text tone.</p>
          <button
            onClick={onLogin}
            className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 text-lg flex items-center gap-2"
          >
            <span className="text-2xl">🔒</span> Sign In with Google to Unlock
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-indigo-700 drop-shadow">AI Tools</h2>
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-yellow-500 text-white font-extrabold text-lg shadow-xl hover:from-pink-600 hover:to-yellow-600 transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50"
            onClick={() => onAIClick("summarize")}
            disabled={!aiEnabled || aiLoading}
          >
            <span className="text-xl">✨</span> Summarize with AI
          </button>
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-blue-400 to-blue-500 text-white font-extrabold text-lg shadow-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50"
            onClick={() => onAIClick("keywords")}
            disabled={!aiEnabled || aiLoading}
          >
            <span className="text-xl">🔍</span> Extract Keywords
          </button>
          {aiLoading && <div className="text-center text-indigo-500 font-semibold mt-4 animate-pulse">Processing...</div>}
          {aiResult && (
            <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-xl shadow-inner border border-indigo-100 animate-fade-in">
              <h3 className="font-bold mb-2 text-indigo-700">AI Result:</h3>
              <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">{aiResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISection;
