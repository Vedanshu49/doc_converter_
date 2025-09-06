

import React, { useRef } from "react";
import { saveAs } from "file-saver";

const formats = [
  { label: "PDF", value: "pdf" },
  { label: "DOCX", value: "docx" },
  { label: "TXT", value: "txt" },
];

const supportedConversions = {
  "pdf:docx": true,
  "docx:pdf": true,
  "pdf:txt": true,
};

function getFormatFromFile(file) {
  if (!file) return "";
  const ext = file.name.split('.').pop().toLowerCase();
  if (["pdf"].includes(ext)) return "pdf";
  if (["docx"].includes(ext)) return "docx";
  return "";
}

export default function Converter({
  file,
  setFile,
  fromFormat,
  toFormat,
  setFromFormat,
  setToFormat,
  isConverting,
  convertedFile,
  onConvert,
  setToast
}) {
  const inputRef = useRef();

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
    saveAs(convertedFile, `converted.${toFormat}`);
  };

  const handleReset = () => {
    setFile(null);
    setFromFormat("pdf");
    setToFormat("docx");
  };

  // UI States
  return (
    <div className="w-full max-w-2xl mx-auto bg-[rgba(25,25,35,0.85)] border border-[rgba(80,80,120,0.25)] rounded-2xl shadow-2xl p-8 backdrop-blur-lg transition-all duration-300 flex flex-col gap-8 glassmorphism">
      <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow">File Converter</h2>

      {/* Drop Zone & File State */}
      {!file && !isConverting && !convertedFile && (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(120,120,180,0.25)] rounded-xl p-12 cursor-pointer hover:bg-[rgba(40,40,60,0.25)] transition-all duration-200 min-h-[180px]"
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
          <div className="flex flex-col items-center gap-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-accent mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-lg font-semibold text-white">Drop a file here or click to upload</p>
            <p className="text-sm text-muted-foreground">Supported: PDF, DOCX, TXT</p>
          </div>
        </div>
      )}

      {/* File Selected State */}
      {file && !isConverting && !convertedFile && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-[rgba(30,30,45,0.7)] rounded-xl p-6 shadow-inner">
            <div className="flex-1">
              <p className="text-lg font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              className="text-xs text-accent underline hover:text-accent/80 transition-colors"
              onClick={handleReset}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <button
                className="rounded-lg px-4 py-2 bg-gradient-to-r from-[#23243a] to-[#3a3f5a] text-white font-semibold shadow border border-[rgba(120,120,180,0.25)] cursor-default"
                disabled
              >
                {fromFormat.toUpperCase()}
              </button>
            </div>
            <div className="flex justify-center items-end h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <select
                className="rounded-lg border border-[rgba(120,120,180,0.25)] bg-[rgba(40,40,60,0.7)] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-bold shadow-lg hover:from-[#23243a] hover:to-[#4f5bd5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            onClick={onConvert}
            disabled={!file || fromFormat === toFormat}
          >
            Convert File
          </button>
        </div>
      )}

      {/* Converting State */}
      {isConverting && (
        <div className="flex flex-col items-center justify-center gap-6 min-h-[180px] animate-fade-in">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" style={{ borderTopColor: '#4f5bd5' }}></div>
          <p className="text-lg font-semibold text-white">Converting...</p>
        </div>
      )}

      {/* Conversion Complete State */}
      {convertedFile && !isConverting && (
        <div className="flex flex-col gap-6 items-center animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#4f5bd5" className="mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-lg font-semibold text-white">Conversion Complete!</p>
          </div>
          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f5bd5] to-[#23243a] text-white font-bold shadow-lg hover:from-[#23243a] hover:to-[#4f5bd5] transition-all duration-200"
          >
            Download
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-xl bg-[rgba(40,40,60,0.7)] text-accent font-semibold hover:bg-[rgba(60,60,90,0.7)] transition-all duration-200"
          >
            Convert Another File
          </button>
        </div>
      )}
    </div>
  );
}
