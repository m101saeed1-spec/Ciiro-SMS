import React from 'react';
import { Modal } from '../common/Modal';
import { FileText, Download, Calendar, User, BookOpen, Layers, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fileName: string;
  fileType?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  description?: string;
  topics?: string[];
  fileData?: string;
  categoryOrSubject?: string;
  gradeOrClass?: string;
  academicYear?: string;
  term?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fileName,
  fileType = 'pdf',
  fileSize = '1.2 MB',
  uploadedBy,
  uploadedAt,
  description,
  topics,
  fileData,
  categoryOrSubject,
  gradeOrClass,
  academicYear,
  term,
}) => {
  const { downloadFile } = useSchoolData();

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadFile(fileName, fileData, fileType);
  };

  const isImage = fileType === 'image' || (fileName && /\.(png|jpe?g|webp|svg)$/i.test(fileName));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Details & Preview" maxWidth="2xl">
      <div className="space-y-5">
        {/* Header summary banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="uppercase font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px]">
                  {fileType}
                </span>
                <span>•</span>
                <span>{fileSize}</span>
                {gradeOrClass && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{gradeOrClass}</span>
                  </>
                )}
                {categoryOrSubject && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{categoryOrSubject}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Document</span>
          </button>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Academic Year</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{academicYear || '2026-2027'}</span>
          </div>
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Term / Session</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{term || 'Annual Curriculum'}</span>
          </div>
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Uploaded By</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{uploadedBy || 'Academic Dept'}</span>
          </div>
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Upload Date</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{uploadedAt || 'Recent'}</span>
          </div>
        </div>

        {/* Description / Summary */}
        {description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Description & Overview</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {description}
            </p>
          </div>
        )}

        {/* Topics covered if available */}
        {topics && topics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Curriculum Chapters & Topics</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60 text-xs text-slate-700 dark:text-slate-300 font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Content / Embedded Preview simulation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Document Verification & Content Viewer</span>
            </h4>
            <span className="text-[10px] font-semibold text-slate-400">Audienta Academic Repository</span>
          </div>

          {isImage && fileData && fileData.trim() !== '' ? (
            <div className="max-h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center p-2">
              <img src={fileData} alt={fileName} className="max-h-64 object-contain rounded-lg" />
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner">
              <div className="text-slate-500 pb-2 mb-2 border-b border-slate-800 flex items-center justify-between font-sans">
                <span>FILE: {fileName}</span>
                <span>STATUS: VERIFIED SECURE</span>
              </div>
              <p className="whitespace-pre-wrap">
                {fileData ||
                  `[AUDIENTA ACADEMIC ARCHIVE]\nTitle: ${title}\nSubject: ${categoryOrSubject || 'General'}\nGrade: ${gradeOrClass || 'All'}\nYear: ${academicYear || '2026-2027'}\n\nDocument structure validated. Click "Download Document" above to retrieve the full original binary export.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close Preview
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
