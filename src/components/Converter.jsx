
import React, { useState, useRef } from "react";
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

export default function Converter({ setToast }) {
  const [file, setFile] = useState(null);
  const [fromFormat, setFromFormat] = useState("pdf");
  const [toFormat, setToFormat] = useState("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const inputRef = useRef();

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const detectedFormat = getFormatFromFile(selectedFile);
    if (!detectedFormat) {
      setToast({ message: "Unsupported file type.", type: "error" });
      return;
    }
    setFile(selectedFile);
    setFromFormat(detectedFormat);
    setConvertedFile(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setConvertedFile(null);

    // Simulate conversion
    setTimeout(() => {
      const blob = new Blob(["This is a dummy converted file."], { type: "text/plain" });
      setConvertedFile(blob);
      setIsConverting(false);
      setToast({ message: "File converted successfully!", type: "success" });
    }, 2000);
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    saveAs(convertedFile, `converted.${toFormat}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">File Converter</h2>
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => inputRef.current.click()}
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
        {file ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">Detected: {fromFormat.toUpperCase()}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Drag & drop a file here</p>
            <p className="text-sm text-muted-foreground">or click to select a file</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 items-center">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <select
            className="rounded-md border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={fromFormat}
            onChange={(e) => setFromFormat(e.target.value)}
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center items-end h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground h-6 w-6"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <select
            className="rounded-md border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
        className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleConvert}
        disabled={!file || isConverting || fromFormat === toFormat}
      >
        {isConverting ? "Converting..." : "Convert File"}
      </button>

      {convertedFile && (
        <button
          onClick={handleDownload}
          className="w-full mt-4 py-3 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
        >
          Download Converted File
        </button>
      )}
    </div>
  );
}
