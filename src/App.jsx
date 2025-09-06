

import React, { useState, useEffect } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Converter from "./components/Converter";
import AISection from "./components/AISection";
import Toast from "./components/Toast";

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [fromFormat, setFromFormat] = useState("docx");
  const [toFormat, setToFormat] = useState("pdf");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiResult, setAIResult] = useState("");


  // Toast state
  const [toast, setToast] = useState(null);


  // Real Google Auth handlers
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setToast({ message: "Authentication failed!", type: "error" });
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      setToast({ message: "Logout failed!", type: "error" });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

    // Main app UI (restored)
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-200 via-white to-blue-200 flex flex-col">
        <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <main className="flex-1 flex items-center justify-center px-2 py-10">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <section className="md:col-span-2 flex flex-col">
              <Converter setToast={setToast} />
            </section>
            <aside className="md:col-span-1">
              <AISection
                user={user}
                onLogin={handleLogin}
                aiActions={["summarize", "keywords"]}
                aiLoading={aiLoading}
                aiResult={aiResult}
                onAIClick={() => {}}
                aiEnabled={!!user}
              />
            </aside>
          </div>
        </main>
        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-semibold z-50 transition-all duration-300 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  export default App;
