

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

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Converter setToast={setToast} />
          </div>
          <div className="lg:col-span-1">
            <AISection user={user} onLogin={handleLogin} />
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
