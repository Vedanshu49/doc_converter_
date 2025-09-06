

import React, { useState, useEffect } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Converter from "./components/Converter";
import AISection from "./components/AISection";
import Toast from "./components/Toast";


function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Converter state
  const [file, setFile] = useState(null);
  const [fromFormat, setFromFormat] = useState("pdf");
  const [toFormat, setToFormat] = useState("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setToast({ message: "Login successful!", type: "success" });
    } catch (error) {
      setToast({ message: "Authentication failed!", type: "error" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToast({ message: "Logout successful!", type: "success" });
    } catch (error) {
      setToast({ message: "Logout failed!", type: "error" });
    }
  };


  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const aiEnabled = !!file && !isConverting;

  // Simulate conversion (replace with real logic as needed)
  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setConvertedFile(null);
    setAiResult("");
    setTimeout(() => {
      const blob = new Blob(["This is a dummy converted file."], { type: "text/plain" });
      setConvertedFile(blob);
      setIsConverting(false);
      setToast({ message: "File converted successfully!", type: "success" });
    }, 2000);
  };

  // Simulate AI actions
  const handleAIClick = (action) => {
    if (!aiEnabled) return;
    setAiLoading(true);
    setAiResult("");
    setTimeout(() => {
      if (action === 'summarize') {
        setAiResult("This is a summary of your document.\nLorem ipsum dolor sit amet...");
      } else if (action === 'keywords') {
        setAiResult("Keywords: document, conversion, AI, summary, keywords");
      }
      setAiLoading(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full bg-[#181926] text-white flex flex-col">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 col-span-1">
            <Converter
              file={file}
              setFile={setFile}
              fromFormat={fromFormat}
              toFormat={toFormat}
              setFromFormat={setFromFormat}
              setToFormat={setToFormat}
              isConverting={isConverting}
              convertedFile={convertedFile}
              onConvert={handleConvert}
              setToast={setToast}
            />
          </div>
          <div className="lg:col-span-1 col-span-1">
            <AISection
              user={user}
              onLogin={handleLogin}
              aiLoading={aiLoading}
              aiResult={aiResult}
              onAIClick={handleAIClick}
              aiEnabled={aiEnabled}
            />
          </div>
        </div>
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
