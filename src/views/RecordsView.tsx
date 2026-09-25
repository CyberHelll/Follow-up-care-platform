/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalRecord } from '../types';
import { Upload, FileText, Sparkles, Trash2, RotateCcw, AlertCircle, CheckCircle, Search, Info, HardDriveDownload } from 'lucide-react';

export const RecordsView: React.FC = () => {
  const { records, uploadReport, softDeleteRecord, restoreRecord, permanentlyDeleteRecord, language } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'recycle'>('active');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRecords = records.filter(r => !r.isDeleted);
  const recycleRecords = records.filter(r => r.isDeleted);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Specific limit type check (PDS pg 21, PRD pg 31)
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'jpg', 'png', 'jpeg'];
    if (!allowed.includes(ext)) {
      setUploadError(
        language === 'en'
          ? 'Unsupported file type. Only PDF, JPG, PNG accepted.'
          : 'असमर्थित फ़ाइल प्रकार। केवल PDF, JPG, PNG स्वीकृत हैं।'
      );
      return;
    }

    // specific 10MB size limit check
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        language === 'en'
          ? 'Oversized file. Max file size limit is 10 MB per file.'
          : 'फ़ाइल का आकार सीमा से अधिक है। अधिकतम फ़ाइल सीमा 10 एमबी है।'
      );
      return;
    }

    setIsUploading(true);
    try {
      await uploadReport({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setUploadSuccess(
        language === 'en'
          ? 'File attached successfully. AI summaries & OCR are processing in the background.'
          : 'फ़ाइल सफलतापूर्वक जोड़ी गई। एआई सारांश और ओसीआर प्रोसेसिंग बैकग्राउंड में चालू है।'
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'jpg', 'png', 'jpeg'];
    if (!allowed.includes(ext)) {
      setUploadError(language === 'en' ? 'Only PDF, JPG, PNG accepted' : 'केवल PDF, JPG, PNG स्वीकृत');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(language === 'en' ? 'Max file size limit is 10 MB' : 'अधिकतम फ़ाइल सीमा 10 एमबी है');
      return;
    }

    setIsUploading(true);
    try {
      await uploadReport({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setUploadSuccess(language === 'en' ? 'File uploaded successfully!' : 'फ़ाइल सफलतापूर्वक अपलोड हो गई!');
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const filteredActiveRecords = activeRecords.filter(rec => 
    rec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="records-view-container" className="space-y-5 font-sans pb-8">
      {/* Sub Tabs Toggle (Section 3.3) */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
            activeSubTab === 'active'
              ? 'bg-white text-blue-700 shadow-xs ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {language === 'en' ? 'My Uploaded Reports' : 'अपलोड की गई रिपोर्टें'}
        </button>
        <button
          onClick={() => setActiveSubTab('recycle')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'recycle'
              ? 'bg-white text-blue-700 shadow-xs ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>{language === 'en' ? 'Recycle Bin' : 'रीसायकल बिन'}</span>
          {recycleRecords.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {recycleRecords.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'active' ? (
        <div className="space-y-5">
          {/* Upload Drop Zone (PDS pg 21) */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/5 transition duration-200 rounded-2xl p-6 text-center cursor-pointer relative"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl mx-auto flex items-center justify-center text-blue-600 animate-pulse">
                <Upload className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {language === 'en' ? 'Attach Lab & Clinical Records' : 'लैब और क्लिनिकल रिपोर्ट जोड़ें'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
                  {language === 'en'
                    ? 'Drag and drop files, or tap to browse your local device storage'
                    : 'फ़ाइलों को यहाँ खींचें या डिवाइस स्टोरेज से चुनने के लिए टैप करें'}
                </p>
              </div>
              <div className="inline-block bg-slate-100/80 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'en' ? 'Only PDF, JPG, PNG accepted (Max 10 MB)' : 'केवल PDF, JPG, PNG स्वीकृत (अधिकतम 10 MB)'}
              </div>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center p-4">
                <div className="text-center space-y-3">
                  <span className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent inline-block" />
                  <p className="text-xs text-slate-700 font-bold">
                    {language === 'en' ? 'Encrypting & uploading clinical file...' : 'फ़ाइल एन्क्रिप्ट और अपलोड की जा रही है...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback toasts */}
          {uploadError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex gap-2.5 text-red-900 text-xs">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <p className="font-bold">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex gap-2.5 text-emerald-900 text-xs">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-bold">{uploadSuccess}</p>
            </div>
          )}

          {/* Search bar */}
          {activeRecords.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Filter records by name...' : 'रिपोर्ट फ़ाइल नाम से खोजें...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          {/* Records List (Section 7.4) */}
          <div className="space-y-4">
            {filteredActiveRecords.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-150 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400 mt-2">
                  {language === 'en' ? 'No medical records uploaded yet.' : 'कोई रिकॉर्ड इतिहास उपलब्ध नहीं है।'}
                </p>
              </div>
            ) : (
              filteredActiveRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-900 text-xs truncate leading-snug">{rec.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {formatSize(rec.size)} • {new Date(rec.uploadedAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulated downloading file: ${rec.name}`);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition shrink-0"
                        title={language === 'en' ? 'Download Original File' : 'ओरिजिनल फ़ाइल डाउनलोड करें'}
                      >
                        <HardDriveDownload className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => softDeleteRecord(rec.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition shrink-0"
                        title={language === 'en' ? 'Move to Recycle Bin' : 'रीसायकल बिन में भेजें'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Summary / OCR panel (AI-1, AI-3) */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/50 px-2 py-0.5 rounded-full leading-none">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        AI REPORT EXTRACT
                      </span>
                      {/* Mandated AI content labeling (PDS pg 29, PRD pg 25) */}
                      <span className="text-[9px] text-slate-400 font-extrabold italic uppercase">
                        AI-Generated — For Doctor Review
                      </span>
                    </div>

                    {rec.status === 'processing' ? (
                      <div className="flex items-center gap-2 text-slate-500 text-xs py-1.5">
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent" />
                        <span className="font-semibold italic">Processing NLP summaries & OCR extraction...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {rec.aiSummary}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Recycle Bin (MR-4, MR-5) */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <p className="font-bold text-amber-950">
                {language === 'en' ? '30-Day Soft-Delete Retention Policy' : '३० दिवसीय सॉफ्ट-डिलीट नीति'}
              </p>
              <p className="mt-1 leading-relaxed opacity-95">
                {language === 'en'
                  ? 'Soft-deleted records are preserved in the Recycle Bin for 30 days before permanent deletion occurs, subject to jurisdiction healthcare record laws.'
                  : 'डिलीट किए गए दस्तावेज़ रीसायकल बिन में ३० दिनों तक सुरक्षित रहते हैं, जहाँ से उन्हें रीस्टोर किया जा सकता है।'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recycleRecords.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-150 rounded-2xl">
                <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold mt-2">
                  {language === 'en' ? 'Recycle bin is empty.' : 'रीसायकल बिन खाली है।'}
                </p>
              </div>
            ) : (
              recycleRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate leading-none">{rec.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
                        {formatSize(rec.size)} • {language === 'en' ? 'Days remaining: 29d' : 'शेष दिन: २९ दिन'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreRecord(rec.id)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition shrink-0 inline-flex items-center gap-1 font-bold text-xs"
                      title={language === 'en' ? 'Restore File' : 'पुनर्प्राप्त करें'}
                    >
                      <RotateCcw className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(language === 'en' ? 'Delete this record permanently? This cannot be undone.' : 'इस फ़ाइल को हमेशा के लिए डिलीट करें? इसे वापस नहीं लाया जा सकता।')) {
                          permanentlyDeleteRecord(rec.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition shrink-0"
                      title={language === 'en' ? 'Delete Permanently' : 'हमेशा के लिए डिलीट करें'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
