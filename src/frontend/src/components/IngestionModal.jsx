import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, Folder, Layers, File } from 'lucide-react';

export default function IngestionModal({ isOpen, onClose, caseId, onIngestSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch(`/api/cases/${caseId}/ingest-multiple`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);
      if (onIngestSuccess) onIngestSuccess();
    } catch (err) {
      console.error('Batch upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400 font-bold text-base border-b border-slate-800 pb-3">
          <Upload className="w-5 h-5" />
          <span>Ingest Cyber Fraud Intelligence Bundle / Folder</span>
        </div>

        <p className="text-xs text-slate-400">
          Upload individual files or an <b>entire folder</b> containing PDFs, Excel statements (.xlsx), CSV tables, JSON logs, and text field notes. The engine parses structured & unstructured data automatically.
        </p>

        {/* Upload Selection Option Tabs */}
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: Multiple Files */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-5 text-center cursor-pointer bg-slate-950/50 transition">
            <input
              type="file"
              multiple
              accept=".csv,.json,.txt,.pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-multi"
            />
            <label htmlFor="file-upload-multi" className="cursor-pointer space-y-2 block">
              <FileText className="w-7 h-7 text-cyan-400 mx-auto" />
              <div className="text-xs text-slate-200 font-semibold">Select Multiple Files</div>
              <div className="text-[10px] text-slate-500">CSV, XLSX, PDF, JSON, TXT</div>
            </label>
          </div>

          {/* Option B: Folder Upload */}
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-5 text-center cursor-pointer bg-slate-950/50 transition">
            <input
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="folder-upload"
            />
            <label htmlFor="folder-upload" className="cursor-pointer space-y-2 block">
              <Folder className="w-7 h-7 text-purple-400 mx-auto" />
              <div className="text-xs text-slate-200 font-semibold">Upload Complete Folder</div>
              <div className="text-[10px] text-slate-500">e.g. cyber_fraud_mock_case</div>
            </label>
          </div>
        </div>

        {/* File Queue List */}
        {selectedFiles.length > 0 && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Selected Queue ({selectedFiles.length} files):</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between truncate border-b border-slate-900 pb-1">
                  <span className="truncate">{f.name}</span>
                  <span className="text-slate-600 text-[10px]">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-xl transition shadow-lg"
        >
          {uploading ? `Parsing ${selectedFiles.length} Intelligence Files...` : `Extract Entities from ${selectedFiles.length} Selected File(s)`}
        </button>

        {result && (
          <div className="bg-slate-950 border border-emerald-800/80 p-4 rounded-xl text-xs space-y-2 text-emerald-300">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Batch Ingestion Complete!</span>
            </div>
            <div className="font-mono text-[11px] space-y-1 text-slate-300">
              <div>Files Processed: {result.total_files}</div>
              <div>Entities Discovered: {result.total_entities_discovered}</div>
              <div>Relationships Discovered: {result.total_relationships_discovered}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
