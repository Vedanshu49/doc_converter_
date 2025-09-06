
import React, { useRef } from "react";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import { saveAs } from "file-saver";
import JSZip from "jszip";
// PDF.js imports for worker setup
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';



// Only include formats that have at least one supported conversion
const formats = [
  { label: "DOCX", value: "docx" },
  { label: "PDF", value: "pdf" },
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "WEBP", value: "webp" },
  { label: "SVG", value: "svg" },
  { label: "HEIC", value: "heic" },
];

// Supported conversions in browser
const supportedConversions = {
  // Document to PDF
  "docx:pdf": true,
  // Image to PDF
  "jpg:pdf": true,
  "png:pdf": true,
  "gif:pdf": true,
  "bmp:pdf": true,
  "webp:pdf": true,
  "svg:pdf": true,
  "tiff:pdf": true,
  "heic:pdf": true,
  // PDF to Image
  "pdf:jpg": true,
  "pdf:png": true,
  // Image to Image
  "jpg:png": true,
  "png:jpg": true,
  "jpg:webp": true,
  "png:webp": true,
  "svg:jpg": true,
  "svg:png": true,
  "heic:jpg": true,
  "heic:png": true,
};


function getFormatFromFile(file) {
  if (!file) return "";
  const ext = file.name.split('.').pop().toLowerCase();
  // Map common extensions to supported formats
  if (["docx"].includes(ext)) return "docx";
  if (["pdf"].includes(ext)) return "pdf";
  if (["png"].includes(ext)) return "png";
  if (["jpg", "jpeg"].includes(ext)) return "jpg";
  if (["webp"].includes(ext)) return "webp";
  if (["svg"].includes(ext)) return "svg";
  if (["heic"].includes(ext)) return "heic";
  return "";
}


import { useState } from "react";

export default function Converter({
  onFileConverted,
  isConverting,
  convertedFile,
  onConvert,
  onFileChange,
  file,
  fromFormat,
  toFormat,
  setFromFormat,
  setToFormat,
}) {
  const inputRef = useRef();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  // When a file is uploaded, auto-set the fromFormat
  const handleFileChange = (fileObj) => {
    if (!fileObj) return;
    const detected = getFormatFromFile(fileObj);
    if (!detected) {
      alert("Unsupported file type. Please upload a supported file.");
      onFileChange(null);
      return;
    }
    setFromFormat(detected);
    onFileChange(fileObj);
  };

  // Conversion logic

  // Helper to validate output Blob by attempting to read a small chunk
  async function validateBlob(blob) {
    if (!blob) return false;
    try {
      const slice = blob.slice(0, 16);
      await slice.arrayBuffer();
      return true;
    } catch {
      return false;
    }
  }

  const handleConvert = async () => {
    setProgress(0);
    setStatus("");
    if (!file || fromFormat === toFormat) return;
    if (!supportedConversions[`${fromFormat}:${toFormat}`]) {
      alert("This conversion is not supported in browser-only mode.");
      return onFileConverted(null);
    }
    onConvert();
    try {
      let resultBlob = null;
      let resultMime = '';
      let resultExt = toFormat;
      // Always set up PDF.js worker for PDF conversions
      try {
        pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();
      } catch (err) {
        // Ignore if already set or not needed
      }
  // DOCX to PDF
  if (fromFormat === "docx" && toFormat === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText(html.replace(/<[^>]+>/g, ""), { x: 50, y: 700, size: 12 });
        const pdfBytes = await pdfDoc.save();
  resultBlob = new Blob([pdfBytes], { type: "application/pdf" });
  resultMime = "application/pdf";
  resultExt = "pdf";
      }
      // Image to PDF
  else if (["jpg","png","webp","svg","heic"].includes(fromFormat) && toFormat === "pdf") {
        // Use canvas for raster, svg2img for svg, heic2any for heic
        // For brevity, only implement jpg/png/svg/heic here
  if (["jpg","png"].includes(fromFormat)) {
          const img = new window.Image();
          img.src = URL.createObjectURL(file);
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = () => rej(new Error("Image load failed. Please check your file."));
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([img.width, img.height]);
          const pngImage = await pdfDoc.embedPng(dataUrl);
          page.drawImage(pngImage, { x: 0, y: 0, width: img.width, height: img.height });
          const pdfBytes = await pdfDoc.save();
          resultBlob = new Blob([pdfBytes], { type: "application/pdf" });
          resultMime = "application/pdf";
          resultExt = "pdf";
  } else if (fromFormat === "svg") {
          // Convert SVG to PNG using canvas
          const svgText = await file.text();
          const img = new window.Image();
          img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = () => rej(new Error("SVG load failed. Please check your file."));
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([img.width, img.height]);
          const pngImage = await pdfDoc.embedPng(dataUrl);
          page.drawImage(pngImage, { x: 0, y: 0, width: img.width, height: img.height });
          const pdfBytes = await pdfDoc.save();
          resultBlob = new Blob([pdfBytes], { type: "application/pdf" });
          resultMime = "application/pdf";
          resultExt = "pdf";
  } else if (fromFormat === "heic") {
          const heic2any = (await import("heic2any")).default;
          const pngBlob = await heic2any({ blob: file, toType: "image/png" });
          const img = new window.Image();
          img.src = URL.createObjectURL(pngBlob);
          await new Promise(res => (img.onload = res));
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([img.width, img.height]);
          const pngImage = await pdfDoc.embedPng(dataUrl);
          page.drawImage(pngImage, { x: 0, y: 0, width: img.width, height: img.height });
          const pdfBytes = await pdfDoc.save();
          resultBlob = new Blob([pdfBytes], { type: "application/pdf" });
          resultMime = "application/pdf";
          resultExt = "pdf";
        }
      }
      // PDF to Image (JPG/PNG)
  else if (fromFormat === "pdf" && ["jpg","png"].includes(toFormat)) {
        // Use top-level pdfjsLib and worker
        try {
          pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();
        } catch (err) {}
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const images = [];
        for (let i = 1; i <= numPages; i++) {
          setStatus(`Converting page ${i} of ${numPages}...`);
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            const dataUrl = canvas.toDataURL(`image/${toFormat}`);
            // Validate dataUrl
            if (!dataUrl || !dataUrl.startsWith(`data:image/${toFormat}`) || dataUrl.length < 100) {
              setStatus(`Page ${i} could not be converted (empty or corrupt image).`);
              continue;
            }
            const byteString = atob(dataUrl.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
            const imgBlob = new Blob([ab], { type: `image/${toFormat}` });
            // Validate Blob
            if (imgBlob.size < 100) {
              setStatus(`Page ${i} image is too small or corrupt.`);
              continue;
            }
            images.push(imgBlob);
            setProgress(Math.round((i / numPages) * 100));
          } catch (err) {
            setStatus(`Error converting page ${i}: ${err.message}`);
            console.error(`Error converting page ${i}:`, err);
          }
        }
        if (images.length === 0) {
          setStatus("No valid images could be generated from this PDF.");
          throw new Error("No valid images generated from PDF");
        }
  setStatus("Conversion complete.");
  setProgress(100);
  if (images.length === 1) {
          resultBlob = images[0];
          resultMime = `image/${toFormat}`;
          resultExt = toFormat;
        } else {
          // Bundle as ZIP
          const zip = new JSZip();
          images.forEach((img, idx) => {
            zip.file(`page${idx + 1}.${toFormat}`, img);
          });
          const zipBlob = await zip.generateAsync({ type: "blob" });
          resultBlob = zipBlob;
          resultMime = "application/zip";
          resultExt = "zip";
        }
      }
      // Image to Image
  else if (["jpg","png","webp","svg","heic"].includes(fromFormat) && ["jpg","png","webp"].includes(toFormat)) {
        let imgBlob = file;
        if (fromFormat === "heic") {
          const heic2any = (await import("heic2any")).default;
          imgBlob = await heic2any({ blob: file, toType: "image/png" });
        }
        const img = new window.Image();
        if (fromFormat === "svg") {
          const svgText = await file.text();
          img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
        } else {
          img.src = URL.createObjectURL(imgBlob);
        }
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = () => rej(new Error("Image load failed. Please check your file."));
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(`image/${toFormat}`);
        const byteString = atob(dataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  resultBlob = new Blob([ab], { type: `image/${toFormat}` });
  resultMime = `image/${toFormat}`;
  resultExt = toFormat;
      }
      // Validate output file
      if (!(await validateBlob(resultBlob))) {
        alert("Conversion failed: Output file is invalid or corrupt. Please try a different file or format.");
        onFileConverted(null);
        return;
      }
      // Save MIME and extension for download
      resultBlob._downloadExt = resultExt;
      resultBlob._downloadMime = resultMime;
      onFileConverted(resultBlob);
    } catch (e) {
      alert("Conversion failed: " + (e.message || e.toString()));
      onFileConverted(null);
    }
  };

  return (
  <div className="backdrop-blur-xl bg-white/70 border border-slate-200 rounded-2xl shadow-2xl p-8 flex flex-col gap-8 transition-all duration-300">
      {isConverting && (
        <div className="w-full mb-2">
          <div className="h-3 bg-gradient-to-r from-indigo-200 via-blue-200 to-indigo-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400 rounded-full shadow-lg animate-pulse"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-indigo-600 mt-2 font-medium tracking-wide animate-fade-in">{status}</div>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">File Converter</h2>
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 bg-gradient-to-br from-white/80 to-blue-50 rounded-2xl p-10 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
        onClick={() => inputRef.current.click()}
        onDrop={e => {
          e.preventDefault();
          handleFileChange(e.dataTransfer.files[0]);
        }}
        onDragOver={e => e.preventDefault()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={e => handleFileChange(e.target.files[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <span className="text-5xl drop-shadow-lg">📄</span>
            <span className="font-medium text-gray-700 text-lg truncate max-w-xs">{file.name}</span>
            <span className="text-xs text-indigo-400 font-semibold">Detected: {fromFormat.toUpperCase()}</span>
          </div>
        ) : (
          <>
            <span className="text-6xl mb-2 animate-bounce text-indigo-400 group-hover:text-indigo-600 transition">⬆️</span>
            <span className="text-gray-500 font-medium">Drag & drop a file here or</span>
            <button
              type="button"
              className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
              onClick={e => {
                e.stopPropagation();
                inputRef.current.click();
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
              Select File
            </button>
          </>
        )}
      </div>
      <div className="flex gap-4 items-center justify-center">
        <div>
          <label className="block text-gray-600 text-xs mb-1 font-semibold tracking-wide">Convert From</label>
          <select
            className="rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white/80 shadow-sm"
            value={fromFormat}
            onChange={e => setFromFormat(e.target.value)}
          >
            {formats.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <span className="text-2xl text-indigo-400 font-bold">→</span>
        <div>
          <label className="block text-gray-600 text-xs mb-1 font-semibold tracking-wide">Convert To</label>
          <select
            className="rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white/80 shadow-sm"
            value={toFormat}
            onChange={e => setToFormat(e.target.value)}
          >
            {formats.map(f => (
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
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 text-white font-extrabold text-lg shadow-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={async () => {
          // Validate file before converting
          if (!file) return;
          // Try to read file as ArrayBuffer to check for corruption
          try {
            await file.arrayBuffer();
          } catch {
            alert("File could not be read. It may be corrupt or unsupported.");
            return;
          }
          handleConvert();
        }}
        disabled={!file || isConverting || fromFormat === toFormat}
      >
        {isConverting ? (
          <span className="flex items-center justify-center gap-2 animate-pulse"><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg> Converting...</span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0 0V3" /></svg>
            Convert File
          </>
        )}
      </button>
      {convertedFile && (
        <button
          onClick={() => {
            // Use correct extension and mime if available
            const ext = convertedFile._downloadExt || toFormat;
            saveAs(convertedFile, `converted.${ext}`);
          }}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white font-extrabold text-lg shadow-xl hover:from-green-500 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0 0V3" /></svg>
          Download
        </button>
      )}
    </div>
  );
}
