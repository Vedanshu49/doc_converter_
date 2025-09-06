

import React, { useState, useEffect } from "react";
import { geminiSummarize, geminiKeywords } from "./utils/gemini";
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
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileText = result.value;
      } else if (action === "pagewise") {
        // Page-wise summary for PDF, DOCX, TXT
        let pages = [];
        if (file.name.endsWith(".pdf")) {
          const pdfjsLib = await import("pdfjs-dist/build/pdf");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
          const mammoth = await import("mammoth");
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
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
              setConvertedFile={setConvertedFile}
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
