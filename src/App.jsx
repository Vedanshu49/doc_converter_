import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { saveAs } from "file-saver";

// Helper function to check for Firebase app existence
function getFirebaseApp() {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const firebaseApp = getFirebaseApp();
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// Sign in with the provided custom token, or anonymously if no token is available
if (typeof __initial_auth_token !== 'undefined') {
  signInWithCustomToken(auth, __initial_auth_token).catch((error) => {
    console.error("Error signing in with custom token:", error);
    signInAnonymously(auth);
  });
} else {
  signInAnonymously(auth);
}

// Gemini API integration utility
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
const apiKey = "";

async function geminiSummarize(text) {
  const payload = {
    contents: [{ parts: [{ text: `Summarize this document:\n${text}` }] }],
  };
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
  } catch (error) {
    console.error("Gemini summarize request failed:", error);
    return "AI request failed. Please try again.";
  }
}

async function geminiKeywords(text) {
  const payload = {
    contents: [{ parts: [{ text: `Extract keywords from this document:\n${text}` }] }],
  };
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No keywords found.";
  } catch (error) {
    console.error("Gemini keywords request failed:", error);
    return "AI request failed. Please try again.";
  }
}

// Header Component
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

// Converter Component
const Converter = ({
  file,
  setFile,
  fromFormat,
  toFormat,
  setFromFormat,
  setToFormat,
  isConverting,
  convertedFile,
  onConvert,
  onReset,
  setToast
}) => {
  const inputRef = useRef();

  const formats = [
    { label: "PDF", value: "pdf" },
    { label: "DOCX", value: "docx" },
    { label: "TXT", value: "txt" },
    { label: "JPG", value: "jpg" },
    { label: "PNG", value: "png" },
  ];

  const supportedConversions = {
    "pdf:docx": true,
    "docx:pdf": true,
    "pdf:txt": true,
    "jpg:png": true,
    "png:jpg": true,
    "jpg:pdf": true,
    "png:pdf": true,
    "pdf:jpg": true,
    "pdf:png": true,
  };

  function getFormatFromFile(file) {
    if (!file) return "";
    const ext = file.name.split('.').pop().toLowerCase();
    if (["pdf"].includes(ext)) return "pdf";
    if (["docx"].includes(ext)) return "docx";
    if (["txt"].includes(ext)) return "txt";
    if (["jpg", "jpeg"].includes(ext)) return "jpg";
    if (["png"].includes(ext)) return "png";
    return "";
  }

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const detectedFormat = getFormatFromFile(selectedFile);
    if (!detectedFormat) {
      setToast && setToast({ message: "Unsupported file type.", type: "error" });
      return;
    }
    setFile(selectedFile);
    setFromFormat(detectedFormat);
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    const baseName = file ? file.name.replace(/\.[^.]+$/, '') : 'converted';
    saveAs(convertedFile, `${baseName}.${toFormat}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-[#23243a] via-[#23243a] to-[#4f5bd5] border border-[rgba(80,80,120,0.25)] rounded-3xl shadow-2xl p-10 backdrop-blur-2xl transition-all duration-300 flex flex-col gap-10 glassmorphism">
      <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow flex items-center gap-3">
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-accent">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        File Converter
      </h2>

      {/* Drop Zone & File State */}
      {!file && !isConverting && !convertedFile && (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-accent rounded-2xl p-16 cursor-pointer hover:bg-[rgba(40,40,60,0.25)] transition-all duration-200 min-h-[200px] animate-fade-in"
          onClick={() => inputRef.current && inputRef.current.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-accent mb-2 animate-bounce">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-2xl font-bold text-white">Drop a file here or click to upload</p>
            <p className="text-base text-muted-foreground">Supported: PDF, DOCX, TXT, JPG, PNG</p>
          </div>
        </div>
      )}

      {/* File Selected State */}
      {file && !isConverting && !convertedFile && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between bg-[rgba(30,30,45,0.7)] rounded-2xl p-6 shadow-inner">
            <div className="flex-1">
              <p className="text-xl font-bold text-white truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              className="text-sm text-accent underline hover:text-accent/80 transition-colors font-semibold"
              onClick={onReset}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium text-muted-foreground">From</label>
              <button
                className="rounded-xl px-5 py-3 bg-gradient-to-r from-[#23243a] to-[#3a3f5a] text-white font-bold shadow border border-[rgba(120,120,180,0.25)] cursor-default text-lg"
                disabled
              >
                {fromFormat.toUpperCase()}
              </button>
            </div>
            <div className="flex justify-center items-end h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium text-muted-foreground">To</label>
              <select
                className="rounded-xl border border-[rgba(120,120,180,0.25)] bg-[rgba(40,40,60,0.7)] px-5 py-3 text-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 font-bold"
                value={toFormat}
                onChange={(e) => setToFormat(e.target.value)}
              >
                {formats.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    disabled={fromFormat === f.value || !supportedConversions[`${fromFormat}:${f.value}`]}
                  >
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-extrabold text-lg shadow-lg hover:from-[#23243a] hover:to-[#4f5bd5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            onClick={onConvert}
            disabled={!file || fromFormat === toFormat}
          >
            Convert File
          </button>
        </div>
      )}

      {/* Converting State */}
      {isConverting && (
        <div className="flex flex-col items-center justify-center gap-8 min-h-[200px] animate-fade-in">
          <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" style={{ borderTopColor: '#4f5bd5' }}></div>
          <p className="text-2xl font-bold text-white">Converting...</p>
        </div>
      )}

      {/* Conversion Complete State */}
      {convertedFile && !isConverting && (
        <div className="flex flex-col gap-8 items-center animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="#4f5bd5" className="mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-2xl font-bold text-white">Conversion Complete!</p>
          </div>
          <button
            onClick={handleDownload}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-extrabold text-lg shadow-lg hover:from-[#23243a] hover:to-[#4f5bd5] transition-all duration-200"
          >
            Download
          </button>
          <button
            onClick={onReset}
            className="w-full py-3 rounded-2xl bg-[rgba(40,40,60,0.7)] text-accent font-bold text-lg hover:bg-[rgba(60,60,90,0.7)] transition-all duration-200"
          >
            Convert Another File
          </button>
        </div>
      )}
    </div>
  );
};

// AISection Component
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
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-semibold shadow border border-[rgba(120,120,180,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onAIClick && onAIClick('pagewise')}
                  disabled={!aiEnabled}
                >
                  Page-wise Summary (PDF)
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

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold ${color} animate-fade-in`}> 
      {message}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // Converter state
  const [file, setFile] = useState(null);
  const [fromFormat, setFromFormat] = useState("pdf");
  const [toFormat, setToFormat] = useState("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const aiEnabled = !!file && !isConverting && libsLoaded;

  // Function to dynamically load external scripts
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    const loadLibs = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.1/mammoth.browser.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
        setLibsLoaded(true);
      } catch (error) {
        console.error(error);
        setToast({ message: "Failed to load document parsing libraries.", type: "error" });
      }
    };
    loadLibs();
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

  const handleReset = () => {
    setFile(null);
    setFromFormat("pdf");
    setToFormat("docx");
    setConvertedFile(null);
    setAiResult("");
  };

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

  // Real AI actions using Gemini API
  const handleAIClick = async (action) => {
    if (!file) {
      setToast({ message: "Please upload a file first.", type: "error" });
      return;
    }
    setAiLoading(true);
    setAiResult("");
    try {
      // Helper to read file as text
      const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      };
      let fileText = "";
      if (file.type === "text/plain") {
        fileText = await readFileAsText(file);
      } else if (file.name.endsWith(".docx")) {
        // Use mammoth to extract text from docx
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileText = result.value;
      } else if (action === "pagewise") {
        let pages = [];
        if (file.name.endsWith(".pdf")) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            const words = pageText.split(/\s+/);
            if (words.length <= 800) {
              pages.push({ number: i, part: 1, text: pageText });
            } else {
              let part = 1;
              for (let j = 0; j < words.length; j += 1000) {
                const partText = words.slice(j, j + 1000).join(' ');
                pages.push({ number: i, part, text: partText });
                part++;
              }
            }
          }
        } else if (file.name.endsWith(".docx")) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          const words = result.value.split(/\s+/);
          let page = 1;
          for (let i = 0; i < words.length;) {
            const remaining = words.length - i;
            if (remaining <= 800) {
              const pageText = words.slice(i).join(' ');
              pages.push({ number: page, part: 1, text: pageText });
              break;
            } else {
              let part = 1;
              let chunk = 0;
              while (chunk < 1000 && i + chunk < words.length) chunk++;
              const pageText = words.slice(i, i + chunk).join(' ');
              pages.push({ number: page, part, text: pageText });
              i += chunk;
              part++;
              // If next chunk is less than 800, treat as new page
              if (words.length - i <= 800) {
                page++;
              }
            }
            page++;
          }
        } else if (file.type === "text/plain") {
          const text = await readFileAsText(file);
          const words = text.split(/\s+/);
          let page = 1;
          for (let i = 0; i < words.length;) {
            const remaining = words.length - i;
            if (remaining <= 800) {
              const pageText = words.slice(i).join(' ');
              pages.push({ number: page, part: 1, text: pageText });
              break;
            } else {
              let part = 1;
              let chunk = 0;
              while (chunk < 1000 && i + chunk < words.length) chunk++;
              const pageText = words.slice(i, i + chunk).join(' ');
              pages.push({ number: page, part, text: pageText });
              i += chunk;
              part++;
              // If next chunk is less than 800, treat as new page
              if (words.length - i <= 800) {
                page++;
              }
            }
            page++;
          }
        } else {
          setAiResult("Page-wise summary supports PDF, DOCX, and TXT files.");
          setAiLoading(false);
          return;
        }
        let summaries = [];
        for (const page of pages) {
          const summary = await geminiSummarize(page.text);
          if (page.part && page.part > 1) {
            summaries.push(`Page ${page.number} Part ${page.part}:\n${summary}`);
          } else {
            summaries.push(`Page ${page.number}:\n${summary}`);
          }
        }
        setAiResult(summaries.join("\n\n"));
        setAiLoading(false);
        return;
      } else {
        setAiResult("AI features currently support only TXT, DOCX, and PDF (pagewise) files.");
        setAiLoading(false);
        return;
      }
      let result = "";
      if (action === "summarize") {
        result = await geminiSummarize(fileText);
      } else if (action === "keywords") {
        result = await geminiKeywords(fileText);
      }
      setAiResult(result);
    } catch (err) {
      setAiResult("AI request failed. Please try again.");
    }
    setAiLoading(false);
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
              onReset={handleReset}
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
