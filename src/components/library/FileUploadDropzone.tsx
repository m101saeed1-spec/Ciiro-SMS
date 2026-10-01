import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Image as ImageIcon, FileSpreadsheet, Presentation } from 'lucide-react';

export interface UploadedFileData {
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'image' | 'other';
  fileData?: string;
  fileUrl?: string;
}

interface FileUploadDropzoneProps {
  onFileSelected: (file: UploadedFileData) => void;
  onFileRemoved?: () => void;
  currentFile?: UploadedFileData | null;
  allowedExtensions?: string[];
  maxSizeMB?: number;
  label?: string;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onFileSelected,
  onFileRemoved,
  currentFile,
  allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
  maxSizeMB = 25,
  label = 'Upload Document or Resource File',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileTypeFromExt = (ext: string): UploadedFileData['fileType'] => {
    const cleanExt = ext.toLowerCase().replace('.', '');
    if (cleanExt === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(cleanExt)) return cleanExt as 'doc' | 'docx';
    if (['ppt', 'pptx'].includes(cleanExt)) return cleanExt as 'ppt' | 'pptx';
    if (['xls', 'xlsx'].includes(cleanExt)) return cleanExt as 'xls' | 'xlsx';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(cleanExt)) return 'image';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    setError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB} MB.`);
      return;
    }

    // Extension validation
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      setError(`Unsupported format. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 25;
      });
    }, 80);

    const reader = new FileReader();
    const isImg = file.type.startsWith('image/');

    reader.onload = () => {
      clearInterval(timer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        const resultString = typeof reader.result === 'string' ? reader.result : '';
        const detectedType = getFileTypeFromExt(ext);
        
        onFileSelected({
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: detectedType,
          fileData: isImg ? resultString : (resultString.slice(0, 10000) || `Resource Content for ${file.name}`),
          fileUrl: isImg ? resultString : undefined,
        });
      }, 200);
    };

    reader.onerror = () => {
      clearInterval(timer);
      setIsUploading(false);
      setError('Failed to read selected file.');
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>

      {/* Selected File Card */}
      {currentFile && !isUploading ? (
        <div className="flex items-center justify-between p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-2xl">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-purple-900 shadow-2xs">
              {renderTypeIcon(currentFile.fileType)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentFile.fileName}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">{currentFile.fileType}</span>
                <span>•</span>
                <span>{currentFile.fileSize}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.value = '';
              onFileRemoved?.();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isUploading ? (
        /* Upload Progress State */
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-purple-200 dark:border-purple-800/80 rounded-2xl space-y-2 text-center">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
            <span>Uploading document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">Validating metadata & educational format</p>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 scale-[0.99]'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={allowedExtensions.join(',')}
            className="hidden"
          />
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 shadow-2xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Click to browse or drag & drop file here
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Supports PDF, DOCX, PPTX, XLSX, Images (Up to {maxSizeMB} MB)
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
